"""The skill package is internally consistent: what SKILL.md and the references promise exists."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = (ROOT / "SKILL.md").read_text(encoding="utf-8")


def test_frontmatter_names_the_skill_and_describes_triggers():
    front = re.match(r"\A---\n(.*?)\n---\n", SKILL, re.S)
    assert front, "SKILL.md must start with YAML front matter"
    assert re.search(r"^name: humanize-writing$", front.group(1), re.M)
    assert re.search(r"^description: \|\n(?:  .+\n)+", front.group(1) + "\n", re.M)


def test_every_referenced_file_exists():
    docs = [SKILL, (ROOT / "README.md").read_text(encoding="utf-8")]
    paths = {p for d in docs for p in re.findall(r"`((?:references|scripts|evals)/[\w./-]+)`", d)}
    assert paths, "expected SKILL.md to reference its files"
    missing = sorted(p for p in paths if not (ROOT / p).exists())
    assert missing == []


def test_rule_ids_cited_in_references_exist_in_scanner():
    script = (ROOT / "scripts" / "scan-ai-tells.py").read_text(encoding="utf-8")
    known = set(re.findall(r'"((?:vi|en)\.[a-z-]+)"', script))
    known |= {f"{lang}.{name}" for name in re.findall(r'p \+ "([a-z-]+)"', script) for lang in ("vi", "en")}
    cited = set()
    for ref in (ROOT / "references").glob("*.md"):
        for group in re.findall(r"\[((?:vi|en)\.[^\]]+)\]", ref.read_text(encoding="utf-8")):
            cited |= {c.strip() for c in group.split(",")}
    assert cited, "expected references to cite scanner rule ids"
    assert sorted(cited - known) == []


def test_skill_md_stays_small_enough_to_reread_every_use():
    assert len(SKILL.split()) <= 1600
