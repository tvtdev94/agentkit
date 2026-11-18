"""Crop Natural Earth 10m land to the Caribbean frame and simplify: raw/ne_10m_land.geojson -> assets/land.json.
Land polygons only (no borders). Coordinates kept as [lon, lat], rounded to 0.01 deg."""
import json, os, sys
W, E, S, N = -92.0, -48.0, -2.0, 31.0
src, dst = sys.argv[1], sys.argv[2]
g = json.load(open(src))
out = []
def ring_ok(r):
    xs = [p[0] for p in r]; ys = [p[1] for p in r]
    return max(xs) >= W and min(xs) <= E and max(ys) >= S and min(ys) <= N
for f in g["features"]:
    geom = f["geometry"]
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        r = poly[0]
        if not ring_ok(r):
            continue
        pts, last = [], None
        for x, y in r:
            q = (round(x, 2), round(y, 2))
            if q != last:
                pts.append(q); last = q
        if len(pts) >= 3:
            out.append(pts)
os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
json.dump(out, open(dst, "w"), separators=(",", ":"))
print(len(out), "rings,", sum(len(r) for r in out), "points")
