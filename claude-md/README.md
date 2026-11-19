# Global CLAUDE.md

`CLAUDE.md` here is the global instruction file I run with every day, copied as is from
`~/.claude/CLAUDE.md`. Claude Code loads that file in every project on the machine.

## Use it

Copy it, then edit it to fit how you work:

```bash
cp claude-md/CLAUDE.md ~/.claude/CLAUDE.md
```

If you already have a `~/.claude/CLAUDE.md`, merge the sections you want instead of overwriting it.

## Names you need to swap

The file names three tools from my own setup. They are not part of this repository:

| Name | What it is in my setup | What to do |
|---|---|---|
| `kongming` | a subagent that gives a second opinion before I am asked to decide | point it at your own advisor agent, or delete the "Decisions I must make" lines |
| `test-audit` | a skill for writing and reviewing tests | use your own testing skill, or delete that line |
| `browser-skill` | a skill that drives my logged-in browser | use your own browser tool, or delete that line |

The Monitor tool it mentions is built into Claude Code.
