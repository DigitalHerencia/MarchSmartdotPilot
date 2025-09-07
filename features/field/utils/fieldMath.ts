export type Geo = { lat: number; lon: number };
export type Field = { x: number; y: number }; // yards, x: 0-120, y: 0-53.33

export interface AffineTransform {
  // 2x3 matrix [a b tx; c d ty]
  m: [number, number, number, number, number, number];
}

// Solve least-squares affine transform from 3+ point pairs (geo -> field)
export function solveAffine(geo: Geo[], field: Field[]): AffineTransform | null {
  if (geo.length !== field.length || geo.length < 3) return null;
  const n = geo.length;
  // Build A (2n x 6) and b (2n)
  const A = new Array(2 * n).fill(0).map(() => new Array(6).fill(0));
  const b = new Array(2 * n).fill(0);
  for (let i = 0; i < n; i++) {
    const { lat, lon } = geo[i];
    const { x, y } = field[i];
    // Row for x: [lat, lon, 1, 0, 0, 0]
    A[2 * i][0] = lat; A[2 * i][1] = lon; A[2 * i][2] = 1; A[2 * i][3] = 0; A[2 * i][4] = 0; A[2 * i][5] = 0;
    b[2 * i] = x;
    // Row for y: [0, 0, 0, lat, lon, 1]
    A[2 * i + 1][0] = 0; A[2 * i + 1][1] = 0; A[2 * i + 1][2] = 0; A[2 * i + 1][3] = lat; A[2 * i + 1][4] = lon; A[2 * i + 1][5] = 1;
    b[2 * i + 1] = y;
  }
  // Solve via normal equations (A^T A) p = A^T b, p = [a, b, tx, c, d, ty]
  const AtA = new Array(6).fill(0).map(() => new Array(6).fill(0));
  const Atb = new Array(6).fill(0);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      let sum = 0; for (let k = 0; k < 2 * n; k++) sum += A[k][r] * A[k][c]; AtA[r][c] = sum;
    }
    let s = 0; for (let k = 0; k < 2 * n; k++) s += A[k][r] * b[k]; Atb[r] = s;
  }
  const p = solve6x6(AtA, Atb);
  if (!p) return null;
  return { m: [p[0], p[1], p[2], p[3], p[4], p[5]] };
}

// Apply affine transform
export function applyAffine(T: AffineTransform, g: Geo): Field {
  const [a, b, tx, c, d, ty] = T.m;
  return { x: a * g.lat + b * g.lon + tx, y: c * g.lat + d * g.lon + ty };
}

// Compute RMS error given sample pairs and transform
export function rmsError(T: AffineTransform, geo: Geo[], field: Field[]): number {
  let sum = 0; let count = 0;
  for (let i = 0; i < geo.length; i++) {
    const f = applyAffine(T, geo[i]);
    const dx = f.x - field[i].x;
    const dy = f.y - field[i].y;
    sum += dx * dx + dy * dy; count++;
  }
  return Math.sqrt(sum / Math.max(1, count));
}

// Simple 6x6 linear solver using Gaussian elimination (no pivoting for small systems)
function solve6x6(A: number[][], b: number[]): number[] | null {
  const n = 6;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // pivot selection (naive): if zero, fail
    if (Math.abs(M[col][col]) < 1e-12) return null;
    const piv = M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= piv;
    for (let i = 0; i < n; i++) {
      if (i === col) continue;
      const factor = M[i][col];
      for (let j = col; j <= n; j++) M[i][j] -= factor * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}
