# humanize-writing

Claude Code skill that rewrites or reviews Vietnamese and English prose that sounds
AI-generated, so it reads like the writer without changing what it says. It ships two
standard-library Python scripts: a tell scanner and a fact checker.

It is not a detector-evasion tool. It will not add typos, hidden characters or fake details,
and it makes no promise about GPTZero, Turnitin or similar.

## Install

In Claude Code (2.1.275 or later):

```
/plugin install tvt --marketplace tvtdev94/agentkit
```

On older versions, add the marketplace first: `/plugin marketplace add tvtdev94/agentkit`, then
`/plugin install tvt@agentkit`. The `tvt` plugin holds all of tvtdev94's skills; this one is
`/tvt:humanize-writing`.

Then ask Claude Code, for example: "viết lại cho tự nhiên đoạn này", "soi lỗi giọng AI trong
file docs/intro.md", "humanize this paragraph".

## Layout

| Path | Purpose |
|---|---|
| `SKILL.md` | Ground rules, workflow, modes, voice, permissions |
| `references/patterns-vi.md` | Vietnamese AI tells, each with before, after and a keep case |
| `references/translationese-vi.md` | Vietnamese written as translated English |
| `references/registers-vi.md` | Forms of address, admin text, email, chat, slides |
| `references/patterns-en.md` | English AI tells |
| `references/rewrite-checklist.md` | Fact, voice and final checks |
| `scripts/scan-ai-tells.py` | Flags candidate tells with line and column |
| `scripts/check-facts.py` | Diffs facts between source and rewrite, or draft and brief |
| `evals/scenarios.json` | Behavior scenarios for a release check |
| `tests/` | pytest suite for the scripts |

## Scripts

Python 3.10+, no dependencies.

```bash
# Scan: text report, or --json; --max-density N exits 1 above N
python3 -I scripts/scan-ai-tells.py draft.md
cat draft.md | python3 -I scripts/scan-ai-tells.py - --lang vi --json

# Facts: exit 1 when a number, URL, inline code, code block, link or front matter changed
python3 -I scripts/check-facts.py original.md rewrite.md
python3 -I scripts/check-facts.py --brief brief.md draft.md
```

The scanner normalizes Unicode (NFC), masks code, URLs and front matter, and detects the
language by function words. Density is weighted findings per 100 words, banded as `clean`,
`some`, `dense`, or `too-short` under 80 words. It counts surface tells only. A clean result
does not mean the text reads as human, and it is not a detector score. Vietnamese written
without diacritics is detected as English and scanned with the English rules.

## Known limitations

- `check-facts.py` reads number words only from two to ten. "14" rewritten as "fourteen" or
  "30.000" as "30 nghìn" is reported as an error (the safe direction).
- It cannot see a changed claim that keeps the same numbers and names; read the rewrite.
- The skill pre-approves only the two scripts. Creating and deleting temp files may still ask
  for permission, and the grant lasts only for the turn that invoked the skill.
- No Vietnamese rule has corpus statistics behind it, and no native-speaker panel has reviewed
  the examples yet.
- The scenarios in `evals/` have not yet been run against a live model.

## Tests

```bash
python3 -m pytest -q
```

`evals/scenarios.json` describes how to run the behavior scenarios with a live model.

## Credits

Ideas, not text, come from these MIT-licensed projects:

- [blader/humanizer](https://github.com/blader/humanizer): pattern families, the
  mark-draft-check workflow, voice samples, "when not to act".
- [anhnx000/viet-nhu-nguoi](https://github.com/anhnx000/viet-nhu-nguoi): Vietnamese tell
  catalog, translationese method, "ban the move, not the phrase", fact diff.
- [longhang2004/vietnamese-humanizer](https://github.com/longhang2004/vietnamese-humanizer):
  output modes, preservation list, permission to tone down hype.
- [epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai): checks in code, frequency
  rules only when editing, corpus-tested rules.
- [MrGeDiao/shuorenhua](https://github.com/MrGeDiao/shuorenhua): edit scopes, keeping unsourced
  attributions, eval gate that rejects returning the input unchanged.
- [op7418/Humanizer-zh](https://github.com/op7418/Humanizer-zh): a keep case for every pattern,
  protected-structure checks.
- Wikipedia: [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).

## License

MIT. See `LICENSE`.
