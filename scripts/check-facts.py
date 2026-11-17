#!/usr/bin/env python3
"""Compare a rewrite against its source and report facts that changed.

The humanize-writing skill runs this after a rewrite. It judges; it never edits.

Errors (exit 1): a number, URL, inline code span, code block, link target or
front matter that was lost or added.
Warnings (exit 0): fewer meaning-bearing words (chưa, vẫn, chỉ, not, only, may...),
possible proper names that disappeared, a different heading count.

Usage:
    check-facts.py SOURCE REWRITE [--json]
    check-facts.py --brief BRIEF DRAFT [--json]   # list what DRAFT adds beyond BRIEF

Exit codes: 0 no errors, 1 errors found, 2 usage or read error.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter

NUMBER_WORDS = {
    "hai": "2", "ba": "3", "bốn": "4", "tư": "4", "năm": "5", "sáu": "6", "bảy": "7", "tám": "8", "chín": "9",
    "mười": "10", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8",
    "nine": "9", "ten": "10",
}
# "tư" is four only after these words (thứ tư, mười tư); otherwise tư vấn, tư duy...
TU_AFTER = {"thứ", "mười", "mươi", "phần"}
# "năm" is a year, not five, in these contexts.
NAM_BEFORE = {"mỗi", "hằng", "hàng", "cả", "các", "những", "nhiều", "vài", "trong", "cuối", "đầu", "giữa", "của",
              "vào", "từ", "đến", "sang", "qua", "một", "là"}
NAM_AFTER = {"nay", "ngoái", "sau", "trước", "tới", "qua", "học", "ấy", "đó", "này", "mới", "tài", "đầu", "cuối"}

# Words whose loss can flip or weaken a claim. Both languages are always checked.
MEANING = [(w, rf"(?<!\w){re.escape(w).replace(r'\ ', r'\s+')}(?!\w)") for w in [
    "chưa", "vẫn", "chỉ", "đã", "mới", "có thể", "khoảng", "phải", "cần", "không được", "chưa từng", "luôn",
    "sẽ", "hơn", "tới", "ít nhất", "tối đa", "tối thiểu", "gần",
    "only", "still", "yet", "may", "might", "must", "should", "about", "approximately", "always", "will",
    "up to", "at least", "at most", "more than", "less than", "over", "nearly", "almost",
]] + [("negation", r"(?<!\w)(?:không|chẳng|chả|đừng|chớ|not|no|never|cannot|none|nobody|nothing)(?!\w)|n['’]t(?!\w)")]

VI_STOP = {"và", "của", "là", "có", "không", "được", "những", "các", "một", "cho", "với", "trong", "này"}
EN_STOP = {"the", "and", "of", "is", "for", "that", "with", "it", "are", "was", "this"}

FENCE_RE = re.compile(r"^[ \t]*(`{3,}|~{3,})[^\n]*\n.*?^[ \t]*\1[ \t]*$", re.S | re.M)
FRONT_RE = re.compile(r"\A---\n.*?\n---\n", re.S)
INLINE_RE = re.compile(r"`[^`\n]+`")
LINK_RE = re.compile(r"\]\(([^)\s]+)\)")
URL_RE = re.compile(r"(?:https?://|www\.)[^\s)>\]]*[^\s)>\].,;:!?'\"]")
NUM_RE = re.compile(r"(?<![\d.,])\d+(?:[.,]\d+)*(?!\d)")
HEADING_RE = re.compile(r"^#{1,6}[ \t]+\S", re.M)
SENTENCE_START_RE = re.compile(r"[.!?:;\"“”(\[*#>–—-]\s*$")


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text).replace("\r\n", "\n").replace("\r", "\n")
    return text.removeprefix("\ufeff")


def lang_of(text: str) -> str:
    tokens = re.findall(r"\w+", text.lower())
    return "vi" if sum(t in VI_STOP for t in tokens) >= sum(t in EN_STOP for t in tokens) else "en"


def canon_number(raw: str) -> str:
    """1.250 / 1,250 -> 1250; 12,5 / 12.5 -> 12.5. Thousands groups win when unambiguous.

    Dates and times split at "/" or "h" into separate numbers; versions such as 1.2.3 stay as written.
    """
    if re.fullmatch(r"\d{1,3}(?:([.,])\d{3})(?:\1\d{3})*", raw):
        return raw.replace(".", "").replace(",", "")
    if re.fullmatch(r"\d+[.,]\d+", raw):
        whole, frac = re.split(r"[.,]", raw)
        frac = frac.rstrip("0")
        return f"{int(whole)}.{frac}" if frac else str(int(whole))
    if raw.isdigit():
        return str(int(raw))
    return raw


def strip_protected(text: str) -> str:
    for rx in (FRONT_RE, FENCE_RE, INLINE_RE):
        text = rx.sub(" ", text)
    text = LINK_RE.sub("]", text)
    return URL_RE.sub(" ", text)


def numbers(text: str) -> Counter:
    return Counter(canon_number(m.group(0)) for m in NUM_RE.finditer(strip_protected(text)))


def number_words(text: str) -> Counter:
    tokens = re.findall(r"\w+", strip_protected(text).lower())
    found: Counter = Counter()
    for i, w in enumerate(tokens):
        if w not in NUMBER_WORDS:
            continue
        prev = tokens[i - 1] if i else ""
        nxt = tokens[i + 1] if i + 1 < len(tokens) else ""
        if w == "tư" and prev not in TU_AFTER:
            continue
        if w == "năm" and (nxt.isdigit() or nxt in NAM_AFTER or prev in NAM_BEFORE or not nxt):
            continue
        found[NUMBER_WORDS[w]] += 1
    return found


def names(text: str) -> set[str]:
    """Runs of capitalized words not at a sentence start: a cheap proxy for proper names."""
    out: set[str] = set()
    for line in strip_protected(text).split("\n"):
        run: list[str] = []
        prev_end = 0
        for m in re.finditer(r"\w+", line):
            word, gap = m.group(0), line[prev_end:m.start()]
            starts_sentence = prev_end == 0 or bool(SENTENCE_START_RE.search(gap))
            if run and gap.strip():
                out.add(" ".join(run))
                run = []
            if word[0].isupper() and not word[0].isdigit() and (run or not starts_sentence):
                run.append(word)
            elif run:
                out.add(" ".join(run))
                run = []
            prev_end = m.end()
        if run:
            out.add(" ".join(run))
    return out


def excuse(missing: list[str], pool: Counter) -> list[str]:
    """Drop numbers the other side spells as a word ("3 khách" vs "ba khách"), consuming the pool."""
    out = []
    for n in missing:
        if pool[n] > 0:
            pool[n] -= 1
        else:
            out.append(n)
    return out


def diff_counter(before: Counter, after: Counter) -> tuple[list[str], list[str]]:
    lost = sorted((before - after).elements())
    added = sorted((after - before).elements())
    return lost, added


def compare(source: str, rewrite: str) -> dict:
    source, rewrite = normalize(source), normalize(rewrite)
    errors: list[str] = []
    warnings: list[str] = []

    lost, added = diff_counter(numbers(source), numbers(rewrite))
    src_words, new_words = number_words(source), number_words(rewrite)
    words_gained, words_dropped = new_words - src_words, src_words - new_words
    lost = excuse(lost, words_gained)
    added = excuse(added, words_dropped)
    if lost:
        errors.append(f"numbers lost: {', '.join(lost)}")
    if added:
        errors.append(f"numbers added: {', '.join(added)}")
    if +words_gained or +words_dropped:
        warnings.append(f"number words changed: lost {sorted((+words_dropped).elements())}, "
                        f"added {sorted((+words_gained).elements())}")

    for label, extract in (
        ("URLs", lambda t: Counter(URL_RE.findall(FENCE_RE.sub(" ", t)))),
        ("link targets", lambda t: Counter(LINK_RE.findall(FENCE_RE.sub(" ", t)))),
        ("inline code", lambda t: Counter(INLINE_RE.findall(FENCE_RE.sub(" ", t)))),
    ):
        lost_x, added_x = diff_counter(extract(source), extract(rewrite))
        if lost_x:
            errors.append(f"{label} lost: {', '.join(lost_x)}")
        if added_x:
            errors.append(f"{label} added: {', '.join(added_x)}")

    if [m.group(0) for m in FENCE_RE.finditer(source)] != [m.group(0) for m in FENCE_RE.finditer(rewrite)]:
        errors.append("code blocks changed")
    src_front, new_front = FRONT_RE.match(source), FRONT_RE.match(rewrite)
    if (src_front and src_front.group(0)) != (new_front and new_front.group(0)):
        errors.append("front matter changed")

    src_prose, new_prose = strip_protected(source), strip_protected(rewrite)
    for label, rx in MEANING:
        before, after = len(re.findall(rx, src_prose, re.I)), len(re.findall(rx, new_prose, re.I))
        if after < before:
            warnings.append(f"'{label}' {before} -> {after}: check the meaning did not change")

    missing = sorted(n for n in names(source) - names(rewrite) if n not in rewrite)
    if missing:
        warnings.append(f"possible names missing: {', '.join(missing)}")

    h_before, h_after = len(HEADING_RE.findall(source)), len(HEADING_RE.findall(rewrite))
    if h_before != h_after:
        warnings.append(f"heading count {h_before} -> {h_after}")

    return {"lang": lang_of(source), "errors": errors, "warnings": warnings}


def compare_brief(brief: str, draft: str) -> dict:
    """List facts in DRAFT that the BRIEF does not contain: candidates for invention."""
    brief, draft = normalize(brief), normalize(draft)
    errors: list[str] = []
    added = sorted(set(numbers(draft)) - set(numbers(brief)))
    added = excuse(added, number_words(brief) - number_words(draft))
    if added:
        errors.append(f"numbers not in brief: {', '.join(added)}")
    new_urls = sorted(set(URL_RE.findall(draft)) - set(URL_RE.findall(brief)))
    if new_urls:
        errors.append(f"URLs not in brief: {', '.join(new_urls)}")
    new_names = sorted(n for n in names(draft) if n not in brief)
    warnings = [f"names not in brief: {', '.join(new_names)}"] if new_names else []
    quotes = re.findall(r"[\"“]([^\"”\n]{3,})[\"”]", strip_protected(draft))
    new_quotes = [q for q in quotes if q not in brief]
    if new_quotes:
        warnings.append(f"quotes not in brief: {'; '.join(new_quotes)}")
    return {"lang": lang_of(brief), "errors": errors, "warnings": warnings}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Report facts that changed between a source and its rewrite.")
    ap.add_argument("source", help="original text, or the brief with --brief")
    ap.add_argument("rewrite", help="rewritten text, or the draft with --brief")
    ap.add_argument("--brief", action="store_true", help="list what the draft adds beyond the brief")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    try:
        with open(args.source, encoding="utf-8") as a, open(args.rewrite, encoding="utf-8") as b:
            src, new = a.read(), b.read()
    except (OSError, UnicodeDecodeError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    report = compare_brief(src, new) if args.brief else compare(src, new)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        if not report["errors"] and not report["warnings"]:
            print("ok: no fact changes found")
        for e in report["errors"]:
            print(f"ERROR {e}")
        for w in report["warnings"]:
            print(f"warn  {w}")
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # a crash must not look like "facts changed" (exit 1)
        print(f"error: {exc!r}", file=sys.stderr)
        sys.exit(2)
