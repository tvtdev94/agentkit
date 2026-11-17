# agentkit

tvtdev94's Claude Code skills, packaged as plugins in one marketplace.

| Plugin | What it does | Run as |
|---|---|---|
| [humanize-writing](plugins/humanize-writing) | Rewrites or audits AI-sounding Vietnamese and English prose without changing facts. Ships a tell scanner and a fact checker. | ask in plain words, e.g. "viết lại cho tự nhiên", or `/humanize-writing:humanize-writing` |
| [refine-prompt](plugins/refine-prompt) | Rewrites rough or vague prompts into sharp, paste-ready prompts with a change table. | `/refine-prompt:refine-prompt` |
| [cc-video](plugins/cc-video) | Shot-aware video understanding: keyframes, transcript, OCR and per-shot captions as a Markdown timeline. Needs its Python package. | `/cc-video:cc-video <url-or-path> [question]` |

## Install

In Claude Code 2.1.275 or later, install one plugin in one step:

```
/plugin install humanize-writing --marketplace tvtdev94/agentkit
```

Or add the marketplace once and install from it:

```
/plugin marketplace add tvtdev94/agentkit
/plugin install humanize-writing@agentkit
/plugin install refine-prompt@agentkit
/plugin install cc-video@agentkit
```

The repository is private, so the machine needs read access to it (for example a logged-in
`gh` or a git credential helper).

cc-video also needs its command-line tool:

```bash
git clone https://github.com/tvtdev94/agentkit.git
pip install -e 'agentkit/plugins/cc-video[all]'
```

## Layout

```text
.claude-plugin/marketplace.json   lists the plugins
plugins/<name>/                   one plugin per skill
  .claude-plugin/plugin.json      plugin manifest
  SKILL.md                        the skill (loaded as the plugin's single skill)
```

Each plugin keeps its own README, license and tests. The history of the original repositories
was imported with `git subtree`.

## Develop

```bash
claude plugin validate .                     # marketplace and every plugin
claude plugin marketplace add ./             # try it locally
python3 -m pytest -q plugins/humanize-writing
```

## License

MIT. See each plugin's `LICENSE`; refine-prompt also carries a `NOTICE` for the projects it
adapts ideas from.
