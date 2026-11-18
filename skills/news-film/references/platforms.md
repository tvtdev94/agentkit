# Platforms: 16:9, Reels, Shorts

Checked November 2026. Platforms change these; re-check when a delivery depends on an exact number.

| | 16:9 | Instagram/Facebook Reels | YouTube Shorts |
|---|---|---|---|
| Frame | 1920×1080 | 1080×1920 (9:16) | 1080×1920 (9:16); square accepted |
| Length | any | up to 20 min uploaded, but over 3 min is not shown to new audiences | up to 3 min (since 15 Oct 2024); longer vertical becomes a normal video |
| Codec | H.264 + AAC, MP4 | H.264 or HEVC + AAC, MP4/MOV; 30 fps recommended | H.264 + AAC; max 1080p for Shorts |
| Covered by UI | nothing | top ~210–250 px; bottom caption ~350–440 px; right buttons ~120 px | top ~300–380 px; bottom title/channel ~380–390 px; right rail ~190–200 px |
| Safe box used (`SAFE` in `examples/vertical/main.js`) | — | x 60–960, y 250–1480 | x 60–880, y 340–1530 |

Neither platform publishes an official organic safe zone. Ads guidance is stricter (Meta Reels ads:
top 14 %, bottom 35 %, sides 6 %; Google vertical ads: top 288, bottom 672, left 48, right 192 px):
use it when the film runs as an ad.

How the vertical example uses it: the strap, the source line and the bug are placed from `SAFE`; each
shot's content was laid out once in a design box and `content()` scales it into the space between the
bug and the strap. Render each cut with `--q cut=reels` or `--q cut=shorts` (readcheck, stills, video).
Full-bleed photos and backgrounds ignore the box; only what must be read stays inside it.

Sources:
- YouTube Shorts length and aspect ratio: https://www.postlinkapp.com/blog/how-long-can-youtube-shorts-be,
  https://www.hopperhq.com/blog/youtube-shorts-dimensions/ (both quote YouTube Help, "Upload YouTube Shorts")
- Shorts safe areas: https://adchecklab.com/articles/youtube-shorts-safe-area-dimensions,
  https://kreatli.com/safe-zone-checker/youtube-safe-zone-checker
- Reels specs and safe areas: https://exemplary.ai/instagram-reels-size, https://reap.video/blog/instagram-reels-size,
  https://adcreate.com/blog/instagram-reel-dimensions-size-guide-2026
