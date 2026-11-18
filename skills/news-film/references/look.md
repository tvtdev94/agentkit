# The package look

What the examples implement; keep it consistent across a film and across its three cuts.

- **Palette.** Ink `#121417` (panels `#1B1E23`, `#22262C`), paper `#F4F1E8`, lemon accent `#F2CF1D`
  (light `#F8DE4A`, dark `#D8B30C`), gold `#D4B064` for eyebrows and datelines, greys `#C9CCD2`, `#7D838D`.
- **Type.** Be Vietnam Pro 900/700 for headlines and body (full Vietnamese coverage), Barlow Condensed
  800/600/600 italic for numbers and English quotes, IBM Plex Mono 500 for datelines, sources and credits.
  `tools/fonts.sh` downloads OFL subsets with exactly the characters in `main.js`: delete `fonts/*.woff2`
  after changing on-screen text.
- **Package layer**, on every story shot: the **strap** (paper bar with a lemon edge and a lemon tab
  naming the section, an ink end block with the channel letters), the **bug** (the small plate, top
  right), the **source line** (mono, small, by the strap), a **corner tag** for schematics. The strap
  changes words on cuts and wipes; inside a shot it flips vertically.
- **Brand plate.** A lemon parallelogram with ink and gold bars and the channel letters; the sting slams
  it in, drops the letters, opens the wordmark, then flies it to the bug position.
- **Transitions.** A vertical band wipe (lemon 84 px + ink 5 px + gold 14 px edge, 0.3 s) between
  programme parts; hard cuts with a timpani hit inside the story; a slanted wipe into the end card.
  Nothing else: no dissolves, no 3D flips.
- **Photos.** One duotone grade for all (`#0E1013` → `#ECE7D8`), slow pushes (5–8 %), 4–7 % grain on
  the photo layer only. Name tags are lemon blocks on a thin leader line, pinned to the photo through
  its transform (`photoAt(...).at(fx, fy)`).
- **Motion.** Lines push up through a mask; cards flip in on a back ease; values count or grow with
  ease-in-out; one stamp at the close. Everything is a function of `t` (deterministic `render(t)`).
- **Map.** Natural Earth land only (no borders), dark land on darker sea, stops ping, a dashed route
  draws between them, each stop gets a card with a small photo and its own credit.
