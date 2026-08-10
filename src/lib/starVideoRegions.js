import * as THREE from "three";

// Splits the Gemini star's single mesh into N video-carrying regions plus
// one untouched "base" region for whatever geometry isn't claimed by a
// video — entirely from the geometry's own vertex positions and normals.
// The GLB has no UVs, no NORMAL accessor, no material slots, and no
// sub-mesh structure to key off (confirmed by parsing the glTF JSON chunk
// directly: one mesh, POSITION + indices only). Three.js's own answer to
// "different materials on one mesh" is geometry groups (contiguous
// index-buffer runs, each tagged with a materialIndex into
// mesh.material[]), so that is the primitive this builds toward.
//
// Every boundary here — front/back, each slot's angular wedge — is
// expressed as a per-vertex scalar that is >=0 on the kept side and (by
// construction) varies linearly along a straight edge. Triangles are
// CLIPPED against these scalars (Sutherland-Hodgman), not bucketed whole by
// a single centroid/normal test. That distinction is the whole point: the
// star's original triangulation is irregular, so bucketing whole triangles
// makes every boundary follow whichever triangle edges happen to sit near
// the threshold — a visible staircase. Clipping cuts through the INTERIOR
// of triangles at the exact boundary, independent of the source mesh's own
// edges.
//
// The front/back split is not a hard crease either: the star is a puffy,
// cushioned extrusion (confirmed by decoding the raw vertex buffer — front-
// and back-facing triangles each span the full four-pointed silhouette, hub
// to tips), so "front-facing" is an iso-contour of a smoothly varying
// normal field, not a flat plateau. A per-TRIANGLE face normal has no value
// to interpolate mid-triangle, so the front/back boundary is evaluated from
// a per-VERTEX smooth normal instead — computed once on the whole, unsplit
// mesh (the GLB ships no NORMAL accessor at all) and carried through every
// clip as an ordinary interpolated attribute. That is also what keeps
// lighting continuous across a freshly-cut seam: two triangles on opposite
// sides of a new cut share the exact same carried normal at the cut line,
// so `computeVertexNormals()` run per-region afterward (an earlier
// approach) is not needed and is not run — it would only average normals
// within one region's island and put a visible seam at every new boundary.
//
// Side (bevel wall) video panels were tried and removed — see
// PROJECT_STATUS.md. Measured directly: the wall's Z-extent near a tip is
// already ~98% of the model's entire thickness at any angular window from
// 18-60 degrees, so there was no more width to claim, and area topped out
// well short of "the whole visible profile" because much of what reads as
// "the side" at an oblique angle is optically foreshortened front/back
// surface, which is off-limits to touch. The star's own geometry (near-
// vertical bevel walls) is simply too thin relative to its ~1.9-unit span
// for a video panel there to ever read as full-face coverage. The sides
// render as plain glass now — this file only carves front/back regions.

const AREA_EPSILON = 1e-6;

// Vertex records are flat [x, y, z, nx, ny, nz] arrays so clipping only
// ever has to linearly interpolate one array, normal included.
const V = { x: 0, y: 1, z: 2, nx: 3, ny: 4, nz: 5 };

function lerpVertex(a, b, t) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}

// True area of a convex polygon (fan-decomposed from vertex 0), used only
// to drop near-zero slivers a boundary can graze off a triangle corner —
// the "triangular fragments" the jagged-edge problem was really about.
function polygonArea(poly) {
  if (poly.length < 3) return 0;
  let ax = 0, ay = 0, az = 0;
  const x0 = poly[0][V.x], y0 = poly[0][V.y], z0 = poly[0][V.z];
  for (let i = 1; i < poly.length - 1; i++) {
    const p1 = poly[i], p2 = poly[i + 1];
    const ux = p1[V.x] - x0, uy = p1[V.y] - y0, uz = p1[V.z] - z0;
    const vx = p2[V.x] - x0, vy = p2[V.y] - y0, vz = p2[V.z] - z0;
    ax += uy * vz - uz * vy;
    ay += uz * vx - ux * vz;
    az += ux * vy - uy * vx;
  }
  return 0.5 * Math.hypot(ax, ay, az);
}

// Sutherland-Hodgman clip of one convex polygon against one half-plane.
// `scalar` is evaluated per vertex; `positive` selects which side of 0 is
// kept (call once per side to split a polygon in two). Polygon clipping
// through the interior is what makes a boundary independent of the source
// triangulation — the cut lands wherever the scalar crosses zero along an
// edge, not at an existing vertex.
function clipHalf(poly, scalar, positive) {
  const n = poly.length;
  if (n === 0) return [];
  const s = poly.map((v) => (positive ? scalar(v) : -scalar(v)));
  const out = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const si = s[i], sj = s[j];
    if (si >= 0) out.push(poly[i]);
    if (si >= 0 !== sj >= 0) {
      out.push(lerpVertex(poly[i], poly[j], si / (si - sj)));
    }
  }
  return out;
}

// Surface scalar: sign*nz - threshold >= 0. Front wants nz <= -threshold
// (surfaceScalar(-1, threshold)); back wants nz >= threshold
// (surfaceScalar(1, threshold)).
const surfaceScalar = (sign, threshold) => (v) => sign * v[V.nz] - threshold;

// Signed distance to the line through the origin at angle `theta`, positive
// on whichever side a wedge's centre direction sits. A wedge of half-width
// w (0 < w <= 90) is the intersection of the two boundary rays at
// center-w and center+w. At w = 90 (the back halves) both rays coincide and
// the two scalars become numerically identical — clipping twice against the
// same half-plane is idempotent, so this needs no special case.
function angleScalars(centerDeg, halfWidthDeg) {
  const a = (centerDeg * Math.PI) / 180;
  const w = (halfWidthDeg * Math.PI) / 180;
  const t1 = a - w;
  const t2 = a + w;
  const s1 = (v) => Math.cos(t1) * v[V.y] - Math.sin(t1) * v[V.x];
  const s2 = (v) => -(Math.cos(t2) * v[V.y] - Math.sin(t2) * v[V.x]);
  return [s1, s2];
}

function buildRegionPlanes(slot, normalThreshold) {
  const [a1, a2] = angleScalars(slot.angleCenterDeg, slot.angleHalfWidthDeg);
  const sign = slot.face === "front" ? -1 : 1;
  return [surfaceScalar(sign, normalThreshold), a1, a2];
}

function fanTriangulate(poly) {
  const tris = [];
  for (let i = 1; i < poly.length - 1; i++) {
    tris.push([poly[0], poly[i], poly[i + 1]]);
  }
  return tris;
}

/**
 * @typedef {Object} VideoSlot
 * @property {string} id
 * @property {"front"|"back"} face
 * @property {number} angleCenterDeg
 * @property {number} angleHalfWidthDeg
 */

/**
 * @param {THREE.BufferGeometry} sourceGeometry indexed, POSITION-only is fine
 * @param {VideoSlot[]} videoSlots
 * @param {{normalThreshold?: number}} [opts]
 * @returns {{ geometry: THREE.BufferGeometry, baseRegionIndex: number,
 *   slots: { id: string, materialIndex: number, regionAspect: number }[] }}
 */
export function buildStarVideoRegions(
  sourceGeometry,
  videoSlots,
  { normalThreshold = 0.6 } = {}
) {
  const srcPos = sourceGeometry.attributes.position;
  const srcIndex = sourceGeometry.index;
  if (!srcIndex) {
    throw new Error("buildStarVideoRegions requires an indexed geometry");
  }

  // One smooth normal field over the WHOLE, unsplit star, computed once —
  // see the module comment for why this has to happen before any splitting.
  const normalSource = new THREE.BufferGeometry();
  normalSource.setAttribute("position", srcPos);
  normalSource.setIndex(srcIndex);
  normalSource.computeVertexNormals();
  const srcNormal = normalSource.attributes.normal;

  const triCount = srcIndex.count / 3;
  const BASE_REGION = videoSlots.length;
  const regionPlanes = videoSlots.map((slot) => buildRegionPlanes(slot, normalThreshold));

  // Per-region collections of clipped (and possibly sub-divided) convex
  // polygons, each a list of [x,y,z,nx,ny,nz] vertex records.
  const regionPolys = videoSlots.map(() => []);
  const basePolys = [];

  for (let t = 0; t < triCount; t++) {
    const i0 = srcIndex.array[t * 3];
    const i1 = srcIndex.array[t * 3 + 1];
    const i2 = srcIndex.array[t * 3 + 2];
    let remaining = [
      [i0, i1, i2].map((i) => [
        srcPos.getX(i),
        srcPos.getY(i),
        srcPos.getZ(i),
        srcNormal.getX(i),
        srcNormal.getY(i),
        srcNormal.getZ(i),
      ]),
    ];

    // Each triangle is carved against every region in turn. Whatever
    // fails at least one of a region's half-planes is carried forward to
    // the next region (or to base, once every region has had a turn) —
    // never assigned twice, never dropped except as a genuine sliver.
    for (let s = 0; s < videoSlots.length; s++) {
      let inside = remaining;
      const nextRemaining = [];
      for (const plane of regionPlanes[s]) {
        const stillInside = [];
        for (const poly of inside) {
          const insidePart = clipHalf(poly, plane, true);
          const outsidePart = clipHalf(poly, plane, false);
          if (outsidePart.length >= 3 && polygonArea(outsidePart) > AREA_EPSILON) {
            nextRemaining.push(outsidePart);
          }
          if (insidePart.length >= 3 && polygonArea(insidePart) > AREA_EPSILON) {
            stillInside.push(insidePart);
          }
        }
        inside = stillInside;
      }
      regionPolys[s].push(...inside);
      remaining = nextRemaining;
    }
    basePolys.push(...remaining);
  }

  // Pass 2: each region becomes its own welded vertex/index run with a UV
  // projection computed from its OWN clipped bounds (not the source
  // triangle's).
  const newPositions = [];
  const newNormals = [];
  const newUVs = [];
  const newIndex = [];
  const groups = [];

  function emitRegion(slot, polys, materialIndex) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const poly of polys) {
      for (const v of poly) {
        if (v[V.x] < minX) minX = v[V.x];
        if (v[V.x] > maxX) maxX = v[V.x];
        if (v[V.y] < minY) minY = v[V.y];
        if (v[V.y] > maxY) maxY = v[V.y];
      }
    }
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;

    // Welds vertices within this region by rounded position. Clip-
    // generated points on a shared original edge are computed identically
    // by both triangles that share it, so this merges them exactly instead
    // of leaving coincident-but-duplicated verts.
    const vertexKey = new Map();
    function weldVertex(v) {
      const key = `${v[V.x].toFixed(6)},${v[V.y].toFixed(6)},${v[V.z].toFixed(6)}`;
      let idx = vertexKey.get(key);
      if (idx !== undefined) return idx;

      idx = newPositions.length / 3;
      newPositions.push(v[V.x], v[V.y], v[V.z]);
      const len = Math.hypot(v[V.nx], v[V.ny], v[V.nz]) || 1;
      newNormals.push(v[V.nx] / len, v[V.ny] / len, v[V.nz] / len);

      if (!slot) {
        newUVs.push(0, 0);
      } else if (slot.face === "front") {
        // Mirrored in U: the camera views down world +Z, so screen-right at
        // rotation.y=0 corresponds to world -X, not +X.
        newUVs.push((maxX - v[V.x]) / spanX, (v[V.y] - minY) / spanY);
      } else {
        newUVs.push((v[V.x] - minX) / spanX, (v[V.y] - minY) / spanY);
      }

      vertexKey.set(key, idx);
      return idx;
    }

    const groupStart = newIndex.length;
    for (const poly of polys) {
      for (const [a, b, c] of fanTriangulate(poly)) {
        newIndex.push(weldVertex(a), weldVertex(b), weldVertex(c));
      }
    }
    if (newIndex.length > groupStart) {
      groups.push({ start: groupStart, count: newIndex.length - groupStart, materialIndex });
    }
    return spanX / spanY;
  }

  const slotsOut = videoSlots.map((slot, i) => ({
    id: slot.id,
    materialIndex: i,
    regionAspect: emitRegion(slot, regionPolys[i], i),
  }));
  emitRegion(null, basePolys, BASE_REGION);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(newNormals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(newUVs, 2));
  geometry.setIndex(new THREE.Uint32BufferAttribute(newIndex, 1));
  groups.forEach((g) => geometry.addGroup(g.start, g.count, g.materialIndex));
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();

  return { geometry, baseRegionIndex: BASE_REGION, slots: slotsOut };
}
