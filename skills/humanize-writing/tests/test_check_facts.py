"""Behavior tests for scripts/check-facts.py."""

import importlib.util
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "check-facts.py"
_spec = importlib.util.spec_from_file_location("check_facts", SCRIPT)
facts = importlib.util.module_from_spec(_spec)
sys.modules["check_facts"] = facts
_spec.loader.exec_module(facts)

SOURCE = (
    "Hôm qua anh Tuấn gửi 1.250 đơn cho Minh Long ở Hà Nội. Đơn chưa được duyệt, "
    "có thể giao trước cho 12,5% khách. Ba khách đã hủy. Chạy `make test` rồi xem https://a.vn/x.\n"
)


@pytest.mark.parametrize(
    "rewrite",
    [
        "Anh Tuấn gửi 1250 đơn cho Minh Long ở Hà Nội hôm qua. Đơn chưa được duyệt, có thể giao trước "
        "cho 12.5% khách. 3 khách đã hủy. Chạy `make test` rồi xem https://a.vn/x.\n",
    ],
)
def test_same_facts_in_other_form_pass(rewrite):
    report = facts.compare(SOURCE, rewrite)
    assert report["errors"] == []
    assert report["warnings"] == []


@pytest.mark.parametrize(
    "rewrite, error",
    [
        (SOURCE.replace("1.250", "1.200"), "numbers lost: 1250"),
        (SOURCE.replace("Ba khách", "Ba khách, 7 người mới"), "numbers added: 7"),
        (SOURCE.replace("`make test`", "lệnh test"), "inline code lost"),
        (SOURCE.replace("https://a.vn/x", "trang web"), "URLs lost"),
        ("Giá 20.900đ.", "numbers lost: 20000"),
        ("Họp lúc 10h15.", "numbers lost: 30"),
        ("Túi nặng 8kg.", "numbers lost: 5"),
        ("Công ty có kho và phòng tư vấn.", "numbers lost: 4"),
    ],
)
def test_changed_facts_are_errors(rewrite, error):
    source = {
        "Giá 20.900đ.": "Giá 20.000đ.",
        "Họp lúc 10h15.": "Họp lúc 9h30.",
        "Túi nặng 8kg.": "Túi nặng 5kg.",
        "Công ty có kho và phòng tư vấn.": "Công ty có 4 kho và phòng tư vấn.",
    }.get(rewrite, SOURCE)
    assert any(e.startswith(error) for e in facts.compare(source, rewrite)["errors"])


@pytest.mark.parametrize(
    "rewrite, warning",
    [
        (SOURCE.replace("chưa được duyệt", "đã được duyệt"), "'chưa' 1 -> 0"),
        (SOURCE.replace("có thể giao", "giao"), "'có thể' 1 -> 0"),
        (SOURCE.replace(" ở Hà Nội", ""), "possible names missing: Hà Nội"),
    ],
)
def test_meaning_and_name_drops_are_warnings(rewrite, warning):
    report = facts.compare(SOURCE, rewrite)
    assert report["errors"] == []
    assert any(w.startswith(warning) for w in report["warnings"])


def test_english_hedge_drop_is_warned():
    report = facts.compare("The fix may reduce errors by 20%.", "The fix reduces errors by 20%.")
    assert any(w.startswith("'may'") for w in report["warnings"])


def test_code_block_and_front_matter_must_be_identical():
    src = "---\ntitle: A\n---\nText.\n```\nx = 1\n```\n"
    assert "code blocks changed" in facts.compare(src, src.replace("x = 1", "x = 2"))["errors"]
    assert "front matter changed" in facts.compare(src, src.replace("title: A", "title: B"))["errors"]


def test_brief_mode_flags_invented_details():
    brief = "Viết bài giới thiệu quán cà phê của chị Lan ở Đà Lạt, mở năm 2019."
    draft = "Quán của chị Lan ở Đà Lạt mở năm 2019, đón 300 khách mỗi ngày. Anh Hùng pha chế ở đây."
    report = facts.compare_brief(brief, draft)
    assert report["errors"] == ["numbers not in brief: 300"]
    assert any("Hùng" in w for w in report["warnings"])


def test_cli_exit_codes(tmp_path):
    a, b = tmp_path / "a.md", tmp_path / "b.md"
    a.write_text(SOURCE, encoding="utf-8")
    b.write_text(SOURCE.replace("1.250", "900"), encoding="utf-8")

    def run(*args):
        return subprocess.run([sys.executable, str(SCRIPT), *map(str, args)], capture_output=True, text=True)

    assert run(a, a).returncode == 0
    changed = run(a, b)
    assert changed.returncode == 1 and "ERROR numbers lost: 1250" in changed.stdout
    assert run(a, tmp_path / "missing.md").returncode == 2


@pytest.mark.parametrize(
    "source, rewrite",
    [
        ("Giá 20.000đ.", "Giá 20.000 đ."),
        ("Xem https://a.vn/x.", "Trang https://a.vn/x có hướng dẫn."),
        ("\ufeff---\ntitle: A\n---\nCó 3 bước.", "---\ntitle: A\n---\nCó 3 bước."),
    ],
)
def test_formatting_only_changes_are_not_errors(source, rewrite):
    assert facts.compare(source, rewrite)["errors"] == []


@pytest.mark.parametrize(
    "source, rewrite, warning",
    [
        ("Ba khách đã hủy.", "Năm khách đã hủy.", "number words changed"),
        ("Deploys may fail.", "Deploys fail.", "'may'"),
        ("It doesn't scale.", "It scales.", "negation"),
        ("Đừng xóa file này.", "Xóa file này.", "negation"),
        ("Tăng hơn 20%.", "Tăng 20%.", "'hơn'"),
        ("Saves up to 50%.", "Saves 50%.", "'up to'"),
    ],
)
def test_meaning_changes_without_digit_changes_are_warned(source, rewrite, warning):
    assert any(warning in w for w in facts.compare(source, rewrite)["warnings"])


def test_indented_code_fence_is_protected():
    src = "1. Chạy lệnh:\n\n   ```\n   make all\n   ```\n"
    assert "code blocks changed" in facts.compare(src, src.replace("make all", "make one"))["errors"]


def test_brief_mode_does_not_excuse_digits_with_unrelated_words():
    report = facts.compare_brief("Quán mở năm 2019.", "Quán mở năm 2019, có 5 bàn. Năm 2019 là năm đầu.")
    assert report["errors"] == ["numbers not in brief: 5"]


def test_long_single_line_compares_quickly():
    import time
    line = "Anh Tuấn gửi 3 đơn cho Minh Long. " * 6000
    start = time.monotonic()
    facts.compare(line, line)
    assert time.monotonic() - start < 3
