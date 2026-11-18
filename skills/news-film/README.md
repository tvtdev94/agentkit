# news-film

Turns a news article into a short TV-news-style film made entirely in code, with no narration, in three
cuts: 16:9, Instagram/Facebook Reels and YouTube Shorts. Facts are checked against primary sources;
photos are openly licensed (official releases, Wikimedia Commons); every frame of every render is
compared with a still before delivery.

## Output

| File | Frame | For |
|---|---|---|
| `<name>.mp4` | 1920×1080 | YouTube, web, TV-style playback |
| `<name>-reels.mp4` | 1080×1920, text inside the Reels safe box | Instagram and Facebook Reels |
| `<name>-shorts.mp4` | 1080×1920, text inside the Shorts safe box | YouTube Shorts |

Each comes with `FACTS.md` (every on-screen claim, its primary source and wording), `SOURCES.md` and
`CREDITS` (licence, author and page of every photo, music credits) and a poster still. Before delivery each
build prints the reading-time check, "all frames match the stills" and the loudness (−14 LUFS).

## Setup

Needs Node 20+, ffmpeg/ffprobe, Python 3 and curl.

```bash
sh skills/news-film/scripts/setup.sh          # headless Chrome (playwright-core) and a Python venv in engine/
sh skills/news-film/scripts/setup.sh --check  # only report what is missing
```

Installed as a plugin, the skill lives in Claude Code's plugin folder: run `scripts/setup.sh` from there,
or let Claude run it on first use. Projects can point at another engine copy with `NEWS_FILM_ENGINE`.

The score's sample libraries (VSCO 2 CE, VCSL; CC0) download on first use, about 700 MB.

## Use

In Claude Code: `/tvt:news-film <article URL>`, or ask "làm video tin tức từ bài báo này".

By hand:

```bash
sh skills/news-film/scripts/new-film.sh landscape ~/films/my-story          # 16:9
sh skills/news-film/scripts/new-film.sh vertical  ~/films/my-story-vertical # Reels + Shorts
# rewrite FACTS.md, TREATMENT.md, tools/fetch_photos.sh, main.js, mix.py, CREDITS, then:
sh ~/films/my-story/build.sh
```

Rendering uses one browser worker per cut (several workers in one run kept stale pixels in tests):
a one-minute film takes about a minute per cut, plus the stills used to verify it.

The examples rebuild the reference film (King Charles III at CHOGM, Antigua, November 2026):
`sh skills/news-film/examples/landscape/build.sh` and `.../vertical/build.sh`.

## Layout

```text
SKILL.md                  the agent's contract: authority, workflow, done criteria, failure modes
references/               workflow details, the package look, platform specs and safe boxes
engine/                   renderer and score tools (from Lemo-Opuscar, MIT; see NOTICE)
examples/landscape/       reference film, 16:9
examples/vertical/        reference film, Reels and Shorts cuts (?cut=reels | ?cut=shorts)
scripts/                  setup.sh, new-film.sh
```

## License

MIT for this skill's own files (LICENSE); the engine code is MIT, Copyright Lemomo (LemoLab) (NOTICE).
