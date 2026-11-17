#!/usr/bin/env python3
"""Scan Vietnamese or English prose for common AI-writing tells.

The scanner is a pre-pass for the humanize-writing skill. It finds candidate
patterns; a human or the model still decides whether each one is a real tell.
It never edits text.

Usage:
    scan-ai-tells.py [FILE ...] [--lang auto|vi|en] [--json] [--max-density N]
    cat draft.md | scan-ai-tells.py -

Density is weighted findings per 100 words. It counts surface tells only: a low
density does not mean the text reads as human, and it is not a detector score.

Exit codes: 0 ok, 1 density above --max-density, 2 usage or read error.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import asdict, dataclass

STRONG = 3
MEDIUM = 2
WEAK = 1
INFO = 0  # reported, never scored
MIN_WORDS_FOR_BAND = 80

# Each rule: (id, weight, regex, hint). Regexes run case-insensitively on NFC
# text with code, inline code, URLs and front matter masked out.
Rule = tuple[str, int, str, str]


def _words(*items: str) -> str:
    """Join literal phrases into one alternation bounded by word edges."""
    alts = "|".join(sorted((re.escape(i).replace(r"\ ", r"\s+") for i in items), key=len, reverse=True))
    return rf"(?<!\w)(?:{alts})(?!\w)"


EN_RULES: list[Rule] = [
    ("en.not-x-but-y", STRONG,
     r"(?<!\w)(?:it'?s|this is|that'?s|is)\s+not\s+(?:just|only|merely|simply)\s+[^.?!\n]{1,60}?[,;—–-]\s*(?:it'?s|but|rather)\b"
     r"|(?<!\w)not\s+(?:just|only|merely)\s+[^.?!\n]{1,60}?,?\s+but(?:\s+also)?\b",
     "Contrast that only adds weight. State the point directly."),
    ("en.not-but-correction", WEAK,
     r"(?<!\w)(?:it'?s|this is|that'?s)\s+not\s+[^.?!\n]{1,60}?[,;]\s*(?:it'?s|but|rather)\b",
     "'It's not X, it's Y'. Keep it if X is something the reader actually believes."),
    ("en.split-contrast", STRONG,
     r"(?<!\w)this (?:does not|doesn't|isn't|is not) (?:mean|about)\b[^.?!\n]{0,200}[.?!]\s+(?:it|this) (?:means|is about)\b",
     "Contrast split across two sentences. Say what it is."),
    ("en.closer", STRONG,
     _words("that is the real win", "that's the real win", "that distinction matters", "read that again",
            "let that sink in", "and that's the point", "that changes everything", "the message was clear",
            "this shows the importance of", "and that makes all the difference"),
     "One-line closer that restates instead of adding a fact."),
    ("en.deep-saying", STRONG,
     _words("the real question is", "at its core", "what really matters", "the heart of the matter",
            "the deeper issue", "fundamentally,", "is not a tool but a mirror"),
     "Saying dressed as hidden truth. Replace with the specific claim."),
    ("en.run-up", STRONG,
     _words("let's dive in", "let's dive into", "let's explore", "let's break this down", "let's break it down",
            "here's what you need to know", "without further ado", "here's the thing", "the thing is,",
            "let's be honest", "real talk", "buckle up", "in this article, we will"),
     "Staged run-up before the point. Start with the point."),
    ("en.no-one-argued", MEDIUM,
     _words("don't get me wrong", "to be clear,", "this is not to say", "i'm not saying",
            "a tempting approach would be", "one might be tempted to", "you might think"),
     "Answers an objection nobody raised."),
    ("en.chatbot", STRONG,
     _words("i hope this helps", "great question", "certainly!", "of course!", "you're absolutely right",
            "let me know if", "feel free to", "would you like me to", "happy to help",
            "as an ai language model", "as of my last update", "up to my last training"),
     "Chatbot wrapper left in the text. Remove it, keep the content."),
    ("en.knowledge-limit", MEDIUM,
     _words("not extensively documented", "based on available information", "while specific details are limited",
            "not publicly available", "maintains a low profile", "it is believed that"),
     "Knowledge-limit hedge or filled-in guess."),
    ("en.ai-word", MEDIUM,
     _words("delve", "delves", "delving", "tapestry", "testament to", "underscore", "underscores", "underscoring",
            "pivotal", "intricate", "intricacies", "meticulous", "meticulously", "showcase", "showcases",
            "showcasing", "interplay", "garner", "garnered", "bolstered", "vibrant", "enduring", "seamless",
            "seamlessly", "ever-evolving", "game-changer", "game-changing", "unlock the power", "elevate",
            "embark", "navigate the complexities", "realm", "in today's fast-paced", "harness the power",
            "unlock the potential"),
     "Word models use far more than people do."),
    ("en.signpost", MEDIUM,
     _words("it's worth noting that", "it is worth noting that", "it is important to note", "it's important to note",
            "in conclusion,", "in summary,", "as mentioned above", "first and foremost", "last but not least"),
     "Signpost that announces instead of saying."),
    ("en.inflation", MEDIUM,
     _words("stands as a testament", "plays a crucial role", "plays a key role", "plays a pivotal role",
            "marking a pivotal", "evolving landscape", "indelible mark", "setting the stage for",
            "reflects a broader", "lasting legacy", "the future looks bright", "exciting times ahead",
            "a step in the right direction", "continues to thrive"),
     "Ordinary fact inflated into significance."),
    ("en.sales", MEDIUM,
     _words("nestled", "in the heart of", "breathtaking", "must-visit", "stunning", "rich cultural heritage",
            "diverse array", "boasts", "world-class", "cutting-edge", "groundbreaking"),
     "Advertising tone. Say what the thing is."),
    ("en.copula-avoid", WEAK,
     _words("serves as", "stands as", "functions as", "acts as a"),
     "Long verb where is/are/has would do."),
    ("en.vague-link", WEAK,
     _words("in connection with", "in association with", "associated with"),
     "Names a link without saying what it is."),
    ("en.hedge-stack", WEAK,
     r"(?<!\w)(?:could|might|may)\s+(?:potentially|possibly|arguably)\b",
     "Stacked qualifiers."),
    ("en.ing-tail", WEAK,
     r",\s+(?:highlighting|underscoring|emphasizing|reflecting|symbolizing|showcasing|fostering|ensuring)\b",
     "-ing tail that adds claimed depth."),
]

VI_RULES: list[Rule] = [
    ("vi.not-x-but-y", STRONG,
     r"(?<!\w)không\s+(?:chỉ|chỉ đơn thuần|đơn thuần|những)\s+(?:là\s+)?[^.?!\n]{1,60}?,?\s+mà\s+(?:còn|là|chính là)(?!\w)",
     "Cấu trúc 'không chỉ X mà còn Y' chỉ để tăng trọng lượng. Nói thẳng ý chính."),
    ("vi.not-but-correction", WEAK,
     r"(?<!\w)không\s+phải\s+(?:là\s+)?[^.?!\n]{1,60}?,?\s+mà\s+(?:là|chính là)(?!\w)",
     "'Không phải X mà là Y'. Giữ nếu X là điều người đọc thật sự đang nghĩ; bỏ nếu X do người viết tự dựng ra."),
    ("vi.closer", STRONG,
     _words("đó chính là chìa khóa", "và đó là điều", "hãy nhớ rằng", "điều đó nói lên tất cả",
            "đó mới là điều quan trọng", "đó chính là sức mạnh của", "và đó chính là", "bài học ở đây là",
            "thông điệp rất rõ ràng"),
     "Câu chốt lặp lại ý vừa nói, không thêm thông tin."),
    ("vi.deep-saying", MEDIUM,
     _words("câu hỏi thực sự là", "suy cho cùng", "điều thực sự quan trọng", "cốt lõi của vấn đề",
            "bản chất của vấn đề là", "xét cho cùng"),
     "Câu triết lý sáo rỗng. Thay bằng nhận định cụ thể."),
    ("vi.run-up", STRONG,
     _words("hãy cùng khám phá", "hãy cùng tìm hiểu", "cùng tìm hiểu nhé", "bạn đã bao giờ tự hỏi",
            "bạn có bao giờ tự hỏi", "trong bài viết này, chúng ta sẽ", "trong bài viết này, chúng tôi sẽ",
            "dưới đây là những", "hãy cùng điểm qua", "không để bạn phải chờ lâu"),
     "Câu dẫn dắt trước khi vào ý. Bắt đầu bằng ý chính."),
    ("vi.era-opener", WEAK,
     _words("trong thời đại công nghệ", "trong thời đại số", "trong kỷ nguyên số", "trong thời đại 4.0",
            "trong bối cảnh hiện nay", "trong thế giới hiện đại ngày nay", "trong xã hội hiện đại",
            "trong thời đại ngày nay", "trong thế giới ngày nay"),
     "Mở bài bằng bối cảnh thời đại chung chung."),
    ("vi.chatbot", STRONG,
     _words("hy vọng thông tin này hữu ích", "hy vọng bài viết này hữu ích", "hy vọng những thông tin trên",
            "chúc bạn thành công", "nếu bạn có bất kỳ câu hỏi nào", "đừng ngần ngại", "câu hỏi rất hay",
            "bạn hoàn toàn đúng", "tôi rất sẵn lòng", "bạn có muốn tôi", "là một mô hình ngôn ngữ"),
     "Lời chatbot còn sót. Bỏ phần vỏ, giữ nội dung."),
    ("vi.ai-word", MEDIUM,
     _words("đóng vai trò quan trọng", "đóng vai trò then chốt", "đóng vai trò cốt lõi", "không thể phủ nhận",
            "bức tranh toàn cảnh", "minh chứng cho", "minh chứng rõ nét", "nâng tầm", "khai phá",
            "hành trình khám phá", "hành trình chinh phục", "chìa khóa vàng", "chìa khóa để", "mở ra kỷ nguyên", "mở ra cánh cửa",
            "cách mạng hóa", "thay đổi cuộc chơi", "đa dạng và phong phú", "vô cùng quan trọng",
            "tiềm năng to lớn", "trải nghiệm tuyệt vời", "đầy cảm hứng",
            "dấu ấn sâu đậm", "khẳng định vị thế", "không ngừng nỗ lực", "giá trị cốt lõi",
            "điểm sáng", "tầm cao mới", "vượt trội"),
     "Cụm từ AI tiếng Việt dùng quá dày."),
    ("vi.inflation", MEDIUM,
     _words("góp phần quan trọng", "đánh dấu một bước ngoặt", "bước ngoặt quan trọng", "di sản lâu dài",
            "tương lai tươi sáng", "hứa hẹn sẽ", "mở ra nhiều cơ hội", "mở ra cơ hội", "có ý nghĩa to lớn",
            "để lại dấu ấn"),
     "Thổi phồng ý nghĩa của một chi tiết bình thường."),
    ("vi.filler-transition", WEAK,
     _words("bên cạnh đó", "ngoài ra", "hơn thế nữa", "không những thế", "tóm lại", "nhìn chung",
            "có thể nói", "điều quan trọng là", "đáng chú ý là", "cần lưu ý rằng", "thêm vào đó"),
     "Từ nối rập khuôn. Ổn nếu thưa, là dấu hiệu nếu dày."),
    ("vi.calque-adverb", WEAK,
     r"(?<!\w)một\s+cách\s+(?:hiệu quả|nhanh chóng|dễ dàng|toàn diện|tối ưu|liền mạch|chính xác|đáng kể|mạnh mẽ|bền vững|hiệu quả nhất)(?!\w)",
     "'một cách + tính từ' dịch từ trạng từ tiếng Anh. Thường bỏ được 'một cách'."),
    ("vi.calque-passive", WEAK,
     r"(?<!\w)(?:được|bị)(?:\s+\w+){1,6}\s+bởi(?!\w)",
     "Bị động 'được/bị ... bởi' dịch từ 'by'. Đưa chủ thể lên đầu câu."),
    ("vi.calque-phrase", WEAK,
     _words("khi nói đến", "khi nhắc đến", "là một trong những", "ở cấp độ", "nhằm mục đích",
            "tiến hành thực hiện", "thực hiện việc", "mang tính", "có khả năng giúp"),
     "Cụm dịch máy từ tiếng Anh."),
    ("vi.weak-word", WEAK,
     _words("hành trình", "hàng đầu", "đẳng cấp"),
     "Từ hay bị lạm dụng. Ổn khi dùng theo nghĩa đen (chuyến đi thật, xếp hạng thật)."),
    ("vi.sales", MEDIUM,
     _words("nằm nép mình", "tọa lạc tại vị trí đắc địa", "đẹp như tranh vẽ", "điểm đến không thể bỏ qua",
            "không thể bỏ lỡ", "thiên đường", "tuyệt vời nhất", "đỉnh cao", "nằm giữa lòng",
            "đắm mình trong", "giữa nhịp sống vội vã", "mang đến trải nghiệm trọn vẹn", "vẻ đẹp ngỡ ngàng"),
     "Giọng quảng cáo. Nói thứ đó là gì."),
    ("vi.marketing-calque", MEDIUM,
     _words("mở khóa tiềm năng", "điều hướng sự phức tạp", "trải nghiệm liền mạch", "tận dụng sức mạnh",
            "không còn là xu hướng mà là tất yếu", "hơn bao giờ hết", "cột mốc quan trọng",
            "tương lai đầy hứa hẹn", "chặng đường phía trước", "thế giới không ngừng thay đổi",
            "tác động có ý nghĩa", "ở cấp độ cốt lõi", "làm nên sự khác biệt"),
     "Cụm marketing dịch từ tiếng Anh (unlock, seamless, leverage...)."),
    ("vi.buzzword", WEAK,
     _words("hệ sinh thái", "kiến tạo", "đòn bẩy", "bệ phóng", "lan tỏa", "vô vàn", "đồng hành cùng"),
     "Từ thời thượng. Ổn khi dùng đúng nghĩa đen."),
    ("vi.slogan", MEDIUM,
     _words("hãy bắt đầu ngay hôm nay", "đây mới chỉ là khởi đầu", "không bao giờ là quá muộn",
            "tương lai thuộc về những người", "mọi mục tiêu lớn đều bắt đầu từ", "chia sẻ dưới comment",
            "hãy tiếp tục theo dõi và đồng hành", "còn bạn thì sao"),
     "Khẩu hiệu hợp với mọi bài. Kết bằng ý cụ thể cuối cùng."),
    ("vi.vague-authority", MEDIUM,
     _words("các chuyên gia cho rằng", "nhiều chuyên gia cho rằng", "theo các chuyên gia",
            "nhiều nghiên cứu chỉ ra", "nhiều nghiên cứu cho thấy", "giới quan sát"),
     "Mượn uy tín không tên. Nêu nguồn cụ thể, hoặc giữ nguyên và ghi chú thiếu nguồn."),
    ("vi.copula-avoid", WEAK,
     _words("đóng vai trò là", "được biết đến như là", "tự hào sở hữu", "tự hào có"),
     "Vòng vo thay cho 'là' / 'có'."),
    ("vi.calque-idiom", MEDIUM,
     _words("hãy chắc chắn rằng", "như đã đề cập ở trên", "một loạt các", "bạn đã đến đúng nơi",
            "đầu tiên và quan trọng nhất", "cuối cùng nhưng không kém phần quan trọng", "vui lòng tìm thấy",
            "tôi hy vọng email này", "xin lỗi vì sự bất tiện này", "được thiết kế với bạn trong tâm trí",
            "đây là lý do tại sao", "có một số cách để", "thông qua việc", "ở cuối ngày", "tin tốt là",
            "là rất quan trọng để", "mong chờ được nghe từ"),
     "Thành ngữ / mẫu câu dịch từng chữ từ tiếng Anh."),
    ("vi.redundancy", WEAK,
     _words("quay trở lại", "hiện nay đang", "đang trong quá trình", "hoàn toàn đầy đủ", "các những",
            "vẫn còn đang", "vì vậy nên", "mọi tất cả"),
     "Thừa từ."),
    ("vi.self-answer", MEDIUM,
     r"(?<!\w)(?:và\s+)?điều\s+\w+(?:\s+\w+)?\s+nhất\s+là\s+gì\s*\?|(?<!\w)nghe\s+vô\s+lý\s*\?|(?<!\w)khoan\s+đã\b",
     "Tự hỏi tự đáp để tạo kịch tính. Nói thẳng câu trả lời."),
]

TITLE_SMALL_EN = {"a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to",
                  "vs", "via", "with"}
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐✅❌✨]")
VI_CHARS = set("ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ")


@dataclass
class Finding:
    rule: str
    weight: int
    line: int
    col: int
    match: str
    hint: str


def mask(text: str) -> str:
    """Blank out spans the skill must never edit, keeping offsets and newlines."""

    def blank(m: re.Match[str]) -> str:
        return re.sub(r"[^\n]", " ", m.group(0))

    text = re.sub(r"\A---\n.*?\n---\n", blank, text, flags=re.S)
    text = re.sub(r"^[ \t]*(`{3,}|~{3,})[^\n]*\n.*?^[ \t]*\1[ \t]*$", blank, text, flags=re.S | re.M)
    text = re.sub(r"`[^`\n]+`", blank, text)
    text = re.sub(r"\]\([^)\s]+\)", blank, text)
    text = re.sub(r"https?://\S+|www\.\S+", blank, text)
    return text


VI_STOP = {"và", "của", "là", "có", "không", "được", "những", "các", "một", "cho", "với", "trong", "này",
           "người", "đã", "sẽ", "thì", "cũng", "để"}
# No "to", "in", "on": they are also Vietnamese words.
EN_STOP = {"the", "and", "of", "is", "for", "that", "with", "it", "are", "was", "be", "this", "as", "by", "at"}


def detect_lang(text: str) -> str:
    """Vote by function words, so Vietnamese names alone do not make a text Vietnamese."""
    tokens = re.findall(r"\w+", text.lower())
    vi = sum(t in VI_STOP for t in tokens)
    en = sum(t in EN_STOP for t in tokens)
    if vi != en:
        return "vi" if vi > en else "en"
    letters = [c for c in text.lower() if c.isalpha()]
    return "vi" if letters and sum(c in VI_CHARS for c in letters) / len(letters) > 0.15 else "en"


def _pos(text: str, idx: int) -> tuple[int, int]:
    line = text.count("\n", 0, idx) + 1
    return line, idx - (text.rfind("\n", 0, idx) + 1) + 1


def _add(out: list[Finding], text: str, rule: str, weight: int, idx: int, match: str, hint: str) -> None:
    line, col = _pos(text, idx)
    out.append(Finding(rule, weight, line, col, match.strip()[:80], hint))


def scan_rules(text: str, rules: list[Rule]) -> list[Finding]:
    out: list[Finding] = []
    for rid, weight, pattern, hint in rules:
        for m in re.finditer(pattern, text, flags=re.I):
            _add(out, text, rid, weight, m.start(), m.group(0), hint)
    return out


def scan_structure(text: str, lang: str) -> list[Finding]:
    out: list[Finding] = []
    p = lang + "."

    dash = r"—|(?<=\s)--(?=\s)" + (r"|(?<=[^\W\d] )–(?= [^\W\d])" if lang == "en" else "")
    for m in re.finditer(dash, text):
        if not text[text.rfind("\n", 0, m.start()) + 1:m.start()].strip():
            continue  # a dash opening the line marks a dialogue turn
        _add(out, text, p + "dash", WEAK, m.start(), m.group(0),
             "Dash as universal connector. Use a comma, colon, period or parentheses."
             if lang == "en" else "Gạch dài làm từ nối vạn năng. Dùng dấu phẩy, hai chấm, chấm hoặc ngoặc.")

    for m in re.finditer(r"^[ \t]*(?:[-*+]|\d+[.)])[ \t]+(?:\S{1,2}[ \t]+)?\*\*[^*\n]{1,60}?:?\*\*:?", text, flags=re.M):
        _add(out, text, p + "bold-label", MEDIUM, m.start(), m.group(0),
             "List item with a bold label. Turn into prose if labels add nothing."
             if lang == "en" else "Gạch đầu dòng kèm nhãn in đậm. Chuyển thành câu nếu nhãn không thêm thông tin.")

    for m in re.finditer(r"^[ \t]*(?:#{1,6}[ \t]+|[-*+][ \t]+).*$", text, flags=re.M):
        if EMOJI_RE.search(m.group(0)):
            _add(out, text, p + "emoji-decor", MEDIUM, m.start(), m.group(0),
                 "Emoji as decoration on a heading or list item."
                 if lang == "en" else "Emoji trang trí ở tiêu đề hoặc gạch đầu dòng.")

    for m in re.finditer(r"^[ \t]*#{1,6}[ \t]+(.+)$", text, flags=re.M):
        words = [w for w in re.findall(r"[^\W\d_]+", m.group(1))]
        tail = [w for w in words[1:] if w.lower() not in TITLE_SMALL_EN]
        if len(tail) >= (2 if lang == "en" else 3) and all(w[0].isupper() for w in tail) and not all(w.isupper() for w in tail):
            _add(out, text, p + "title-case", WEAK, m.start(), m.group(0),
                 "Title Case heading. Use sentence case."
                 if lang == "en" else "Tiêu đề Viết Hoa Mọi Chữ. Tiếng Việt chỉ viết hoa chữ đầu và tên riêng.")

    for m in re.finditer(r"[“”‘’]", text):
        _add(out, text, p + "curly-quote", INFO, m.start(), m.group(0),
             "Curly quote; match the target format." if lang == "en" else "Ngoặc kép cong; theo định dạng đích.")

    triad = (r"(?<!\w)(\w+(?:\s\w+)?),\s(\w+(?:\s\w+)?),?\s(?:and|or)\s(\w+(?:\s\w+)?)(?!\w)" if lang == "en"
             else r"(?<!\w)(\w+(?:\s\w+)?),\s(\w+(?:\s\w+)?)\s(?:và|hay|cùng)\s(\w+(?:\s\w+)?)(?!\w)")
    sentences = re.split(r"(?<=[.!?])\s+", text)
    triad_hits = [m for m in re.finditer(triad, text)]
    if len(triad_hits) >= 3 and len(triad_hits) >= len(sentences) / 4:
        for m in triad_hits:
            _add(out, text, p + "triad", WEAK, m.start(), m.group(0),
                 "Ideas in threes by habit. Keep three only if the meaning has three parts."
                 if lang == "en" else "Liệt kê bộ ba theo thói quen. Chỉ giữ khi nội dung thật sự có ba ý.")

    offset = 0
    run: list[tuple[int, str]] = []
    for sent in re.split(r"(?<=[.!?])(\s+)", text):
        first = re.match(r"\W*(\w+)", sent)
        if sent.strip() and first:
            word = first.group(1).lower()
            if run and run[-1][1] != word:
                run = []
            run.append((offset + first.start(1), word))
            if len(run) == 3:
                _add(out, text, p + "same-opening", WEAK, run[0][0], word,
                     "Three sentences in a row open the same way."
                     if lang == "en" else "Ba câu liền nhau mở đầu giống nhau.")
        offset += len(sent)

    prose = [(m.start(), m.group(0)) for m in re.finditer(r"[^.!?\n]+[.!?]?", text) if len(m.group(0).split()) >= 3]
    for start, sent in prose:
        lead = len(sent) - len(sent.lstrip())
        if len(sent.split()) > 60:
            _add(out, text, p + "long-sentence", WEAK, start + lead, sent[lead:lead + 40],
                 "Sentence over 60 words. Split where the thought turns."
                 if lang == "en" else "Câu trên 60 chữ. Tách ở chỗ ý chuyển.")
        if lang == "vi":
            if len(re.findall(r"(?<!\w)của(?!\w)", sent, flags=re.I)) >= 3:
                _add(out, text, "vi.stacked-cua", WEAK, start + lead, sent[lead:lead + 40],
                     "Ba chữ 'của' trở lên trong một câu (dịch 'of the... of the'). Đảo cấu trúc.")
            if re.match(r"\s*(?:Điều này|Điều đó|Nó)\s", sent):
                _add(out, text, "vi.this-opener", WEAK, start + lead, sent[lead:lead + 20],
                     "Câu mở bằng 'Điều này / Nó' (dịch 'This / It'). Gộp với câu trước hoặc nêu rõ chủ ngữ.")

    if len(prose) >= 12:
        colons = [s for s in prose if ":" in s[1]]
        if len(colons) * 6 > len(prose):
            _add(out, text, p + "colon-density", WEAK, colons[0][0], f"{len(colons)}/{len(prose)}",
                 "Colons in more than 1 of 6 sentences. Keep colons for lists and quotes."
                 if lang == "en" else "Dấu hai chấm ở hơn 1/6 số câu. Chỉ dùng cho liệt kê và trích dẫn.")

    return out


def scan(text: str, lang: str = "auto") -> dict:
    text = unicodedata.normalize("NFC", text).replace("\r\n", "\n").replace("\r", "\n").removeprefix("\ufeff")
    # Same length, so line and column stay true; rules can then match one apostrophe.
    text = text.replace("’", "'")
    masked = mask(text)
    lang = detect_lang(masked) if lang == "auto" else lang
    rules = VI_RULES if lang == "vi" else EN_RULES
    findings = scan_rules(masked, rules) + scan_structure(masked, lang)
    findings.sort(key=lambda f: (f.line, f.col))
    words = max(1, len(re.findall(r"\w+", masked)))
    points = sum(f.weight for f in findings)
    density = round(points * 100 / words, 1)
    strong = sum(f.weight == STRONG for f in findings)
    distinct = len({f.rule for f in findings if f.weight > INFO})
    if words < MIN_WORDS_FOR_BAND:
        band = "too-short"
    elif density >= 10 and (strong or distinct >= 3):
        band = "dense"
    elif density >= 4:
        band = "some"
    else:
        band = "clean"
    counts: dict[str, int] = {}
    for f in findings:
        counts[f.rule] = counts.get(f.rule, 0) + 1
    return {
        "lang": lang,
        "words": words,
        "density": density,
        "band": band,
        "strong": strong,
        "counts": dict(sorted(counts.items(), key=lambda kv: -kv[1])),
        "findings": [asdict(f) for f in findings],
    }


def render(name: str, report: dict) -> str:
    counts = ", ".join(f"{k}×{v}" for k, v in report["counts"].items()) or "none"
    lines = [f"{name}: lang={report['lang']} words={report['words']} density={report['density']} "
             f"band={report['band']} strong={report['strong']}",
             f"  counts: {counts}"]
    for f in report["findings"]:
        lines.append(f"  L{f['line']}:{f['col']} [{f['rule']}] \"{f['match']}\" — {f['hint']}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Flag likely AI-writing tells in Vietnamese or English prose.")
    ap.add_argument("files", nargs="*", default=["-"], help="files to scan; '-' or none reads stdin")
    ap.add_argument("--lang", choices=["auto", "vi", "en"], default="auto")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    ap.add_argument("--max-density", type=float, help="exit 1 when any file's tell density is above this")
    args = ap.parse_args(argv)
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")

    reports = {}
    for name in args.files:
        try:
            text = sys.stdin.read() if name == "-" else open(name, encoding="utf-8").read()
        except (OSError, UnicodeDecodeError) as e:
            print(f"error: {name}: {e}", file=sys.stderr)
            return 2
        reports[name] = scan(text, args.lang)

    if args.json:
        print(json.dumps(reports, ensure_ascii=False, indent=2))
    else:
        print("\n\n".join(render(n, r) for n, r in reports.items()))

    if args.max_density is not None and any(
            r["band"] != "too-short" and r["density"] > args.max_density for r in reports.values()):
        return 1
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # a crash must not look like "density over the limit" (exit 1)
        print(f"error: {exc!r}", file=sys.stderr)
        sys.exit(2)
