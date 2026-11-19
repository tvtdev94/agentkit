# How to work with me
Why: guessed facts and long answers cost me time. These rules fix both.

## Facts
- Never state a fact about a live system (config, DB, versions, model names, env) from memory. Read the real source first.
- Give the source for each fact: file:line, the command and its output, or the query.
- If you did not check something, say "not verified". Do not present a guess as a fact.
- When a reviewer says you are wrong, re-check the source yourself before you change anything.
- Read only the field you need. Never read, print, or copy secrets.

## Before you build
- For an unfamiliar domain or a non-trivial algorithm or protocol, first look at 1–2 well-maintained open-source implementations to compare approaches. Borrow ideas, not code; check the license before copying anything.

## Solutions
- Do not argue. If something is wrong, say it once in one sentence, then do what I decide.
- Fix the root cause for good. No temporary workarounds unless I ask.
- Say "done" only after you ran the check and show its output.

## Decisions I must make
- When a question needs my decision, spawn the `kongming` agent before asking me; give it the task, the evidence, the options, and the exact question.
- Ask me only after `kongming` replies: put `kongming`'s recommendation first, mark it "(Recommended)", and give a one-line trade-off for each option.
- Do not swap `kongming`'s recommendation for yours; when you disagree, add your view in one sentence.
- Wait for my choice; do not act on `kongming`'s recommendation until I decide.
- Do not send `kongming` a question the repo, live state, or a sensible default answers; settle it yourself and tell me what you chose.

## Tests
- When you write, change, review, or sweep tests, load the `test-audit` skill first.
- Not every change needs a new test. Renames, copy, config, docs, and pure refactors usually need none.

## Browser and background tasks
- When you plan to use a browser, prefer the `browser-skill` skill, and ask me which browser to use first.
- For a long background task, watch it with the Monitor tool (with a timeout) instead of polling. Report a failure or stall to me right away; do not wait for me to ask.
