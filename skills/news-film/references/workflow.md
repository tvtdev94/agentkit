# Workflow details

## 1. Facts

- Fetch the article (WebFetch, or `curl` into `raw/` and read the saved HTML). List each claim you might show.
- For each claim find the primary source: the organisation's own page (royal.uk, gov.uk, a club's or a
  league's match centre, a court or parliament record, the speaker's published transcript). Save the page
  to `raw/` with the fetch date, so the check can be repeated.
- `FACTS.md` is a table: on-screen line (in the film's language) | source URL (published date) | the
  quoted wording. Numbers on screen are the source's numbers; a rounded figure says so ("hơn 1 tỷ" from
  "more than a billion").
- A schematic (proportion bars drawn from words, not data) carries a corner tag saying it is a schematic.
- Note what you left out and why ("press-only claims not used") at the end of `FACTS.md`.
- Sports: score, scorers, minutes and cards come from the league's or the clubs' match report; the
  article is only a pointer. Quotes from players or managers need the outlet or club video they were said in.

## 2. Photos

- Search Wikimedia Commons through the API, not by guessing file names:
  `python3 -I tools/footage.py search commons "<query>" --type image` (from the project folder) lists files with licence and
  size; `fetch "commons:\"File:<name>\"" --name <id> --out raw/photos` downloads one and appends its
  record to `SOURCES.jsonl`; `md` writes `SOURCES.md`. `tools/fetch_photos.sh` keeps the list so the
  build can re-fetch.
- The Commons API also returns the file description (`prop=imageinfo&iiprop=extmetadata`,
  `ImageDescription`): captions and dates come from there.
- Good sources by topic: official government photo streams (UK No 10 and departments publish under
  OGL v3; US federal works are usually public domain; read each file's own licence line), Commons categories for the event, the place,
  the people. For sport, recent match photos are almost always agency-owned: use the stadium, the city,
  club crests only if their licence allows (most do not), players' Commons portraits (CC BY-SA, often
  older), and graphics (score, line-ups, timeline, pitch diagram) drawn in code.
- Place photos (a building, a harbour) are file photos, not photos of the event: say so in `CREDITS`.
- Look at each photo at full size before choosing a crop; keep faces clear of straps and tags.
- `tools/prep_photos.py` grades every photo into the package duotone; set each photo's output width
  there. Grain goes on photos only, never on graphics.

## 3. Treatment and timing

- Write three candidate structures, pick one, give the reason. Then a shot list with start/end times,
  what each shot says, its strap text and its transition.
- One idea per shot. Text needs time: about `chars / 15 + 1.5` s fully visible (the `readcheck` rule).
- The cold open hooks with the strongest line (a quote, the score, the number), in the original language
  with a translation line under it, before the sting.
- Use the 120 BPM grid: shots and hits land on beats (2 s bars), the heaviest hit after one beat of
  silence before the key quote.

## 4. Score and sound

- `mix.py` builds the score from sampled instruments (VSCO 2 CE, VCSL; CC0, fetched on first use) and
  the foley from `engine/core/audio/sfx.py`; events come from the page's `EV` list via `events.json`.
- Theme under the context shots, sparse under the figures card, silence, the heaviest hit, a drone under
  the quote, a lift at the close, a tutti on the end card. Bus compression before the limiter keeps the
  master at −14 LUFS without clipping.
- `sampler.credits()` prints the music credit lines for `CREDITS`.

## 5. Deliver

- Files: `<name>.mp4` (16:9), `<name>-reels.mp4`, `<name>-shorts.mp4`, a poster still, `CREDITS`.
- Report the checks with their output (readcheck, frame verification, LUFS, black frames), the length,
  and anything left open (for example a photo the user should replace with their own).
