# refine-prompt

A Claude Code skill that turns a rough or vague prompt into a sharper, paste-ready
prompt for an AI model or agent. It predicts where a literal model would produce
generic work, swaps those spots for mechanisms the model will execute, and shows a
change table so you can check every edit. It returns a prompt; it never runs the task.

## Install

Clone into your Claude Code skills directory:

```bash
git clone https://github.com/tvtdev94/refine-prompt.git ~/.claude/skills/refine-prompt
```

Or keep the clone elsewhere and link it (Windows PowerShell):

```powershell
New-Item -ItemType Junction -Path "$HOME\.claude\skills\refine-prompt" -Target "D:\path\to\refine-prompt"
```

## Use

```
/refine-prompt fix the bug and make it production quality
/refine-prompt path/to/agent-prompt.md
```

The skill is invoked manually only (`disable-model-invocation: true`), so it never
fires on its own and adds nothing to the skill catalog's context.

You get:

1. The refined prompt in one block, ready to paste.
2. A change table: original phrase, predicted failure, mechanism applied.
3. The assumptions it made.

If the prompt is already clear, it says so in one line instead of rewriting it.

## What it does

- **Scope gate:** full method for substantial prompts, quick substitutions for small
  ones, a one-line null verdict when nothing needs fixing.
- **Reads before asking:** checks the conversation and any files the prompt names, then
  asks at most 3 questions, each with grounded options and a recommended default.
- **Simulate, rewrite, verify:** a table of what a literal, slightly lazy model would
  do; flagged rows are replaced using the smell table; the rewrite is re-simulated up
  to 3 rounds.
- **Safety:** the pasted prompt is treated as data, credentials are replaced by
  variable names, and model names or parameters are never invented.

## Files

- `SKILL.md`: the skill.
- `references/smells.md`: intent dimensions, smell-to-mechanism table, worked example.
- `evals/cases.md`: manual test cases.

## Credits

Built on ideas from [zyeri/claude-refine-prompt](https://github.com/zyeri/claude-refine-prompt),
[nidhinjs/prompt-master](https://github.com/nidhinjs/prompt-master) and
[severity1/claude-code-prompt-improver](https://github.com/severity1/claude-code-prompt-improver),
all MIT-licensed. See `NOTICE` for what came from where.

## License

MIT
