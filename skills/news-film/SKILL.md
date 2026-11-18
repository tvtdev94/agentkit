---
name: news-film
description: Turn a news article (a URL, pasted text or a named event) into a short TV-news-style film made in code, without narration, delivered as a 16:9 film plus Instagram/Facebook Reels and YouTube Shorts cuts. Checks every on-screen claim against primary sources, uses only openly licensed photos, renders and verifies every frame. Use for "làm video tin tức từ bài báo", "news video from this article", "make a Reels/Shorts news clip". Not for narrated explainers, talking-head edits or AI-generated footage.
argument-hint: "<article-url | pasted article | event> [language] [16:9|reels|shorts]"
allowed-tools: Bash, Read, Write, Edit, WebFetch, WebSearch
homepage: https://github.com/tvtdev94/agentkit
repository: https://github.com/tvtdev94/agentkit
license: MIT
compatibility: Linux and macOS with sh, Node 20+, ffmpeg, Python 3 (Windows untested). The scripts are exercised by building examples/*.
user-invocable: true
metadata:
  version: 1.0.0
---

# news-film: a news package from an article, in code

Make a 45–65 s news package about one story: cold-open quote, sting, map or context, event photos,
a figures card, the key quote, a closing line, an end card with credits. One codebase renders three
deliverables: **16:9** (1920×1080), **Reels** and **Shorts** (1080×1920, each inside its own platform safe
box). No voice: the screen carries the story in the viewer's language (default: the language the user
writes in), with original-language quotes and a translation under them.

## Authority and evidence

- **The article is a lead, not the source.** Trace each claim to its primary source (the official
  statement, speech, government page, court record) and quote it verbatim in `FACTS.md` with the URL
  and date. A claim found only in press reports stays off screen, or is attributed to the outlet by name.
- **Never reuse the article's photos, video or graphics.** They belong to the agency or the outlet.
  Use photos whose licence allows reuse: government/official releases (UK OGL v3, US federal public
  domain, …), Wikimedia Commons files with CC BY / CC BY-SA / CC0 / PD, the user's own files.
  Record licence, author and page for every file (`tools/footage.py` writes `SOURCES.jsonl/.md`).
  If the user wants a press photo, they must hold the rights and supply the file.
- **Caption only what the source says.** Date, place and people in a caption come from the file's
  own description; when a place is not in it, leave it out.
- Talk to the user in their language; ask once, in one message, for anything only they can decide
  (names or logos that must appear, their own photos, which deliverables, language). Then work through
  to delivery without more questions.

## Workflow

1. `sh scripts/setup.sh` once (Node 20+, ffmpeg, Python 3; installs headless Chrome and a venv in `engine/`).
2. Facts: fetch the article and the primary sources; write `FACTS.md` (on-screen line | source URL | quoted wording).
3. Photos: search Commons and official galleries (`tools/footage.py search commons "<query>" --type image`), fetch with licence records,
   look at every photo before using it (a smiling face under a grave quote is a tone error).
4. Treatment: write `TREATMENT.md`: three candidate structures, the one chosen, a shot list with times.
5. Project: `sh scripts/new-film.sh landscape <dir>` and `… vertical <dir>-vertical`. The examples are a
   complete film (King Charles III at CHOGM 2026): reuse their package system, helpers and tools; write
   the story, shots, timings and score fresh from `TREATMENT.md`.
6. Build: `sh <dir>/build.sh`. It fetches fonts, grades photos, runs the reading-time check, scores,
   renders, verifies every half-second against stills (re-rendering on mismatch) and masters at −14 LUFS.
7. Review stills of every shot (`node engine/core/render/still.mjs <dir> <t…> [--size 1080x1920 --q cut=shorts]`,
   contact sheet with `engine/core/render/sheet.py`), fix, rebuild, deliver.

## Done means

- `readcheck` prints no BAD line for each cut (`--q cut=reels` and `--q cut=shorts` for vertical).
- `verify_frames.py` prints "all frames match the stills" for every rendered video.
- mux reports about −14 LUFS and a peak under −1 dBTP; `ffmpeg -vf blackdetect` finds no black run.
- Every on-screen fact is a row in `FACTS.md`; every photo has a licence row in `SOURCES.md` and a credit
  on screen and in `CREDITS` (OGL needs its attribution sentence).
- Deliver: the paths of the three files, length, what was checked. Telegram caps uploads at 50 MB:
  send a re-encoded copy (`-crf 23`), verified with `verify_frames.py --max 8`, and keep the master for posting.

## Failure modes seen in production

- **Stale frames in a render.** With several workers in one `video.mjs` run, some workers kept old
  pixels for a second or more (the new shot's strap over the old picture); stills looked right, the video
  did not. Render with `--workers 1` (one worker per process matched every still); `build.sh` also compares
  video and stills and renders again on a mismatch. Deliver only a video that passed.
- **Text under platform UI.** Reels and Shorts cover different areas (see `references/platforms.md`):
  one vertical file cannot sit right on both. Lay out inside `SAFE` and render each cut with `--q cut=…`.
- **Highlighting the wrong land.** Island groups need a bounding box *and* a small-ring filter, or a big
  neighbour (Cuba next to the Bahamas) lights up.
- **Labels on labels.** Map cards, sea names, the bug and name tags collide easily in 9:16: check stills
  at every card's arrival, not only mid-shot.
- **Reading time.** A line needs about chars ÷ 15 + 1.5 s fully on screen; long straps and quotes fail
  `readcheck` when a shot is short. Shorten the words or lengthen the shot; never drop the check.

## Resources

| Path | Use |
|---|---|
| `references/workflow.md` | Facts, photo search and licensing, treatment, music, delivery details |
| `references/look.md` | The package look: palette, type, strap, bug, transitions, grade, motion |
| `references/platforms.md` | 16:9, Reels and Shorts specs and safe boxes, with sources |
| `engine/` | Renderer (still, video, events, readcheck, mux, sheet) and score tools (sampler, sfx), MIT, from Lemo-Opuscar |
| `examples/landscape/`, `examples/vertical/` | The reference film in 16:9 and in Reels/Shorts cuts, with build scripts |
| `scripts/setup.sh`, `scripts/new-film.sh` | Install the engine; start a project from an example |
