"""Behavior tests for scripts/scan-ai-tells.py."""

import importlib.util
import json
import subprocess
import sys
import unicodedata
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "scan-ai-tells.py"
FIXTURES = Path(__file__).resolve().parent / "fixtures"

_spec = importlib.util.spec_from_file_location("scan_ai_tells", SCRIPT)
scanner = importlib.util.module_from_spec(_spec)
sys.modules["scan_ai_tells"] = scanner
_spec.loader.exec_module(scanner)


def rules_in(text, lang="auto"):
    return {f["rule"] for f in scanner.scan(text, lang)["findings"]}


@pytest.mark.parametrize(
    "text, rule",
    [
        ("Đây không chỉ là một công cụ mà còn là người bạn.", "vi.not-x-but-y"),
        ("Đó không phải là lỗi, mà là tính năng.", "vi.not-but-correction"),
        ("Dự án được triển khai rất nhanh chóng bởi công ty A.", "vi.calque-passive"),
        ("Anh ấy bị phạt bởi trọng tài.", "vi.calque-passive"),
        ("Hãy cùng khám phá cách nấu phở.", "vi.run-up"),
        ("Trong thời đại số, ai cũng cần học tiếng Anh.", "vi.era-opener"),
        ("Giáo dục đóng vai trò then chốt với đất nước.", "vi.ai-word"),
        ("Hy vọng thông tin này hữu ích với bạn.", "vi.chatbot"),
        ("Hệ thống chạy một cách hiệu quả.", "vi.calque-adverb"),
        ("Tóm lại, đây là dấu hiệu tốt cho đội ngũ.", "vi.filler-transition"),
        ("## Hướng Dẫn Cài Đặt Phần Mềm", "vi.title-case"),
        ("Kết quả — như dự đoán — rất tốt cho đội ngũ.", "vi.dash"),
        ("- **Ưu điểm:** nhanh và rẻ cho người dùng.", "vi.bold-label"),
        ("Nhiều nghiên cứu chỉ ra rằng ngủ trưa tốt cho tim.", "vi.vague-authority"),
        ("Vui lòng tìm thấy tệp đính kèm trong email này.", "vi.calque-idiom"),
        ("Và điều tuyệt vời nhất là gì? Bạn tiết kiệm ba giờ.", "vi.self-answer"),
        ("Sự nâng cao của năng suất của nhân viên của công ty.", "vi.stacked-cua"),
        ("Nhóm đã đổi lịch. Điều này giúp khách hàng chủ động hơn.", "vi.this-opener"),
        ("Hãy bắt đầu ngay hôm nay với một bước nhỏ.", "vi.slogan"),
        ("It's worth noting that the API is rate limited.", "en.signpost"),
        ("It's not just a tool, it's a partner.", "en.not-x-but-y"),
        ("It’s not just a tool, it’s a partner.", "en.not-x-but-y"),
        ("Let’s dive into caching.", "en.run-up"),
        ("Not only is it fast, but it is cheap.", "en.not-x-but-y"),
        ("This does not mean we stop. It means we slow down.", "en.split-contrast"),
        ("Let's dive into caching.", "en.run-up"),
        ("Great question! The answer is two.", "en.chatbot"),
        ("We delve into the data.", "en.ai-word"),
        ("The river plays a crucial role in farming.", "en.inflation"),
        ("A town nestled in the hills.", "en.sales"),
        ("That is the real win.", "en.closer"),
        ("## Strategic Plans And Global Partners", "en.title-case"),
        ("- 🚀 **Launch:** in Q3", "en.emoji-decor"),
        ("The policy — announced late — hurts.", "en.dash"),
    ],
)
def test_flags_known_tell(text, rule):
    assert rule in rules_in(text)


@pytest.mark.parametrize("name", ["human-vi.md", "human-en.md"])
def test_plain_human_prose_is_clean(name):
    report = scanner.scan((FIXTURES / name).read_text(encoding="utf-8"))
    assert report["band"] == "clean", report["findings"]
    assert report["strong"] == 0


@pytest.mark.parametrize("name, lang", [("ai-vi.md", "vi"), ("ai-en.md", "en")])
def test_ai_style_prose_is_dense(name, lang):
    report = scanner.scan((FIXTURES / name).read_text(encoding="utf-8"))
    assert report["lang"] == lang
    assert report["band"] == "dense"


@pytest.mark.parametrize(
    "text",
    [
        "```\nđóng vai trò quan trọng — delve\n```\n",
        "Chạy `không chỉ là A mà còn B` trong terminal của bạn.",
        "Xem https://example.com/hanh-trinh-dong-vai-tro-quan-trong nhé.",
        "Xem [tài liệu](https://example.com/a—b) nhé.",
        "---\ntitle: Let's dive in\n---\nNội dung chính ở đây.",
    ],
)
def test_ignores_code_urls_and_front_matter(text):
    assert rules_in(text, "vi") == set()
    assert rules_in(text, "en") == set()


def test_decomposed_unicode_matches_like_composed():
    nfd = unicodedata.normalize("NFD", "Giáo dục đóng vai trò quan trọng.")
    assert "vi.ai-word" in rules_in(nfd)


def test_reports_line_and_column():
    report = scanner.scan("Dòng đầu tiên.\nHy vọng thông tin này hữu ích.", "vi")
    hit = next(f for f in report["findings"] if f["rule"] == "vi.chatbot")
    assert (hit["line"], hit["col"]) == (2, 1)


def run_cli(*args, stdin=None):
    return subprocess.run([sys.executable, str(SCRIPT), *args], input=stdin,
                          capture_output=True, text=True, encoding="utf-8")


def test_cli_json_and_max_density_gate():
    ai = str(FIXTURES / "ai-en.md")
    ok = run_cli(ai, "--json")
    assert ok.returncode == 0
    assert json.loads(ok.stdout)[ai]["lang"] == "en"
    assert run_cli(ai, "--max-density", "5").returncode == 1
    assert run_cli(str(FIXTURES / "human-en.md"), "--max-density", "5").returncode == 0


def test_cli_reads_stdin_and_reports_missing_file():
    assert "vi.chatbot" in run_cli("-", stdin="Hy vọng thông tin này hữu ích.").stdout
    missing = run_cli(str(FIXTURES / "nope.md"))
    assert missing.returncode == 2
    assert "error" in missing.stderr


@pytest.mark.parametrize(
    "text, lang, absent",
    [
        ("Giá khoảng 1–2 triệu, áp dụng giai đoạn 2019–2021.", "vi", "vi.dash"),
        ("Tuyến Hà Nội – Sài Gòn chạy mỗi ngày.", "vi", "vi.dash"),
        ("Pages 10–12 cover the 2019–2021 data.", "en", "en.dash"),
        ("— Má ăn cơm chưa?\n— Rồi, con.", "vi", "vi.dash"),
        ("## Ở Hà Nội", "vi", "vi.title-case"),
        ("## Thăm Đà Nẵng", "vi", "vi.title-case"),
        ("---\r\ntitle: Hãy cùng khám phá\r\n---\r\nNội dung.", "vi", "vi.run-up"),
    ],
)
def test_legitimate_usage_is_not_flagged(text, lang, absent):
    assert absent not in rules_in(text, lang)


@pytest.mark.parametrize(
    "text, lang",
    [
        ("Truyện Kiều được viết bởi Nguyễn Du vào đầu thế kỷ 19.", "vi"),
        ("Tôi không phải là bác sĩ, mà là y tá.", "vi"),
        ("The server is not running; it's down for maintenance.", "en"),
        ("Cô ấy nói “mai họp” rồi đi. Anh ấy đáp “ừ”.", "vi"),
        ("Chuyến hành trình về quê mất hai ngày.", "vi"),
    ],
)
def test_legitimate_usage_scores_zero_or_weak_only(text, lang):
    findings = scanner.scan(text, lang)["findings"]
    assert all(f["weight"] <= scanner.WEAK for f in findings)


def test_short_text_gets_no_band():
    assert scanner.scan("Tóm lại, mai họp lúc 9h.", "vi")["band"] == "too-short"


@pytest.mark.parametrize(
    "text, lang",
    [
        ("Nguyễn Thị Hương met Trần Đức Thắng and Lê Văn Đạt in Hà Nội "
         "to review the quarterly budget for the Đà Nẵng office before Friday.", "en"),
        ("Chiếc xe to quá, in ra giấy đi.", "vi"),
        ("Team đã deploy bản mới và review code cuối tuần.", "vi"),
    ],
)
def test_detects_language_by_function_words(text, lang):
    assert scanner.scan(text)["lang"] == lang


def test_long_adversarial_line_scans_quickly():
    import time
    text = "this does not mean " * 10000
    start = time.monotonic()
    scanner.scan(text, "en")
    assert time.monotonic() - start < 3

