#!/bin/sh
# Download the film's photos from Wikimedia Commons with their licence records (SOURCES.jsonl → SOURCES.md).
set -e
cd "$(dirname "$0")/.."
f() { [ -s "raw/photos/$2.jpg" ] || python3 -I tools/footage.py fetch "commons:\"File:$1\"" --name "$2" --out raw/photos; }
f "Prime Minister Andy Burnham speaks with King Charles III as they attend the Leaders Investment Summit ahead of the Commonwealth Heads of Government Meeting.jpg" king_summit
f "Burnham at CHOGM 2026-11-03-16-23.jpg" king_leaders_b
f "Antigua English Harbour Nelson's Dockyard 2.jpg" dockyard
f "Umana Yana by Khirsah1.jpg" umana
f "Nassau - House of Assembly.jpg" nassau_assembly
f "Burnham at CHOGM 2026-11-03-16-02.jpg" king_leaders_a
f "Burnham at CHOGM 2026-11-02-23-06.jpg" mottley
f "Burnham at CHOGM 2026-11-03-00-03.jpg" albanese
f "Burnham at CHOGM 2026-11-03-21-22.jpg" holness
f "Burnham at CHOGM 2026-11-04-14-02.jpg" steelpan
f "Burnham at CHOGM 2026-11-02-19-18.jpg" cricket
python3 -I tools/footage.py md
