# agentkit

tvtdev94's personal Claude Code skills, shipped as one plugin named `tvt`.

| Skill | What it does | Run as |
|---|---|---|
| [humanize-writing](skills/humanize-writing) | Rewrites or audits AI-sounding Vietnamese and English prose without changing facts. Ships a tell scanner and a fact checker. | ask in plain words, e.g. "viết lại cho tự nhiên", or `/tvt:humanize-writing` |
| [refine-prompt](skills/refine-prompt) | Rewrites rough or vague prompts into sharp, paste-ready prompts with a change table. | `/tvt:refine-prompt` |
| [cc-video](skills/cc-video) | Shot-aware video understanding: keyframes, transcript, OCR and per-shot captions as a Markdown timeline. Needs its Python package. | `/tvt:cc-video <url-or-path> [question]` |
| [news-film](skills/news-film) | Turns a news article into a TV-news-style film in code, no narration: 16:9, Reels and Shorts cuts, facts from primary sources, licensed photos, every frame verified. Needs Node, ffmpeg and its engine setup. | `/tvt:news-film <article-url>` or "làm video tin tức từ bài báo" |

## Install

In Claude Code 2.1.275 or later:

```
/plugin install tvt --marketplace tvtdev94/agentkit
```

Or add the marketplace once and install from it:

```
/plugin marketplace add tvtdev94/agentkit
/plugin install tvt@tvt-agentkit
```

news-film needs Node 20+, ffmpeg and Python 3, and its renderer installed once with
`scripts/setup.sh` in the skill folder (Claude runs it on first use). It writes three files per story:
16:9, Reels and Shorts. See [skills/news-film/README.md](skills/news-film/README.md).

cc-video also needs its command-line tool:

```bash
git clone https://github.com/tvtdev94/agentkit.git
pip install -e 'agentkit/skills/cc-video[all]'
```

## Layout

```text
.claude-plugin/plugin.json        the tvt plugin manifest
.claude-plugin/marketplace.json   the tvt-agentkit marketplace, listing tvt
skills/<name>/SKILL.md            one folder per skill, with its README, license and tests
```

The history of the original repositories was imported with `git subtree`.

## Develop

```bash
claude plugin validate .                     # manifests and skills
claude plugin marketplace add ./             # try it locally
python3 -m pytest -q skills/humanize-writing
sh skills/news-film/examples/vertical/build.sh   # rebuild the news-film reference cuts and verify every frame
```

## License

MIT. See each skill's `LICENSE`; refine-prompt also carries a `NOTICE` for the projects it
adapts ideas from.
