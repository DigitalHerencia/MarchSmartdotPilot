export type LatLon = { lat: number; lon: number; t: number };

export interface Kalman2DOptions {
  processNoise: number; // q
  measurementNoise: number; // r
}

export interface Kalman2DState {
  // state vector [lat, lon, vLat, vLon]
  x: Float64Array;
  // covariance matrix 4x4
  P: Float64Array;
  lastT: number | null;
}

export function createKalman2D(options: Partial<Kalman2DOptions> = {}) {
  const q = options.processNoise ?? 1e-3; // small process noise
  const r = options.measurementNoise ?? 5e-2; // measurement noise in degrees (~meters vary)

  const state: Kalman2DState = {
    x: new Float64Array([0, 0, 0, 0]),
    P: new Float64Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]),
    lastT: null,
  };

  // helper: matrix operations for 4x4 small case
  const I = new Float64Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);

  function predict(dt: number) {
    // State transition F for constant velocity model
    // [1,0,dt,0; 0,1,0,dt; 0,0,1,0; 0,0,0,1]
    const F = [
      1, 0, dt, 0,
      0, 1, 0, dt,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];

    // x = F * x
    const x = state.x;
    const nx0 = F[0] * x[0] + F[2] * x[2];
    const nx1 = F[5 - 4] * x[1] + F[7 - 4] * x[3]; // F[1,1]=1; F[1,3]=dt
    // Clarify indices: we'll compute manually
    const nx_lat = x[0] + dt * x[2];
    const nx_lon = x[1] + dt * x[3];
    const nv_lat = x[2];
    const nv_lon = x[3];
    state.x[0] = nx_lat;
    state.x[1] = nx_lon;
    state.x[2] = nv_lat;
    state.x[3] = nv_lon;

    // P = F P F^T + Q
    const P = state.P;
    const FP = new Float64Array(16);
    // Compute FP = F*P
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const Fi0 = F[row * 4 + 0];
        const Fi1 = F[row * 4 + 1];
        const Fi2 = F[row * 4 + 2];
        const Fi3 = F[row * 4 + 3];
        FP[row * 4 + col] = Fi0 * P[0 * 4 + col] + Fi1 * P[1 * 4 + col] + Fi2 * P[2 * 4 + col] + Fi3 * P[3 * 4 + col];
      }
    }
    const FPFt = new Float64Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        FPFt[row * 4 + col] = FP[row * 4 + 0] * F[col * 4 + 0] + FP[row * 4 + 1] * F[col * 4 + 1] +
          FP[row * 4 + 2] * F[col * 4 + 2] + FP[row * 4 + 3] * F[col * 4 + 3];
      }
    }
    // Q process noise (simple scaled identity)
    for (let i = 0; i < 16; i++) state.P[i] = FPFt[i] + (i % 5 === 0 ? q : 0);
  }

  function update(zLat: number, zLon: number) {
    // Measurement matrix H: measure only position [lat, lon]
    // H is 2x4: [1,0,0,0; 0,1,0,0]
    const H = [1, 0, 0, 0, 0, 1, 0, 0];
    const x = state.x;
    const P = state.P;

    // y = z - Hx
    const hx0 = x[0];
    const hx1 = x[1];
    const y0 = zLat - hx0;
    const y1 = zLon - hx1;

  // S = H P H^T + R (2x2)
  const S00 = P[0] + r; // P00 + r
  const S01 = P[0 * 4 + 1]; // P01
  const S10 = P[1 * 4 + 0]; // P10
  const S11 = P[1 * 4 + 1] + r; // P11 + r

    // K = P H^T S^-1 (4x2)
    const det = S00 * S11 - S01 * S10 || 1e-6;
    const invS00 = S11 / det;
    const invS01 = -S01 / det;
    const invS10 = -S10 / det;
    const invS11 = S00 / det;

    // Compute K columns manually: K = [P[:,0], P[:,1]] * invS
    const K0 = new Float64Array(4); // for lat residual
    const K1 = new Float64Array(4); // for lon residual
    for (let i = 0; i < 4; i++) {
      const Pi0 = P[i * 4 + 0];
      const Pi1 = P[i * 4 + 1];
      K0[i] = Pi0 * invS00 + Pi1 * invS10;
      K1[i] = Pi0 * invS01 + Pi1 * invS11;
    }

    // x = x + K*y
    for (let i = 0; i < 4; i++) {
      x[i] = x[i] + K0[i] * y0 + K1[i] * y1;
    }

    // P = (I - K H) P
    // Compute KH
    const KH = new Float64Array(16);
    for (let i = 0; i < 4; i++) {
      // row i
      KH[i * 4 + 0] = K0[i] * H[0] + K1[i] * H[4]; // H[:,0]
      KH[i * 4 + 1] = K0[i] * H[1] + K1[i] * H[5]; // H[:,1]
      KH[i * 4 + 2] = 0;
      KH[i * 4 + 3] = 0;
    }
    // (I - KH)
    const IminusKH = new Float64Array(16);
    for (let i = 0; i < 16; i++) IminusKH[i] = I[i] - KH[i];

    const newP = new Float64Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        newP[row * 4 + col] = IminusKH[row * 4 + 0] * P[0 * 4 + col] +
          IminusKH[row * 4 + 1] * P[1 * 4 + col] +
          IminusKH[row * 4 + 2] * P[2 * 4 + col] +
          IminusKH[row * 4 + 3] * P[3 * 4 + col];
      }
    }
    state.P = newP;
  }

  return {
    init(initial: LatLon) {
      state.x[0] = initial.lat;
      state.x[1] = initial.lon;
      state.x[2] = 0;
      state.x[3] = 0;
      state.lastT = initial.t;
      return this.estimate();
    },
    update(obs: LatLon) {
      if (state.lastT == null) this.init(obs);
      const dt = Math.max(0.001, (obs.t - (state.lastT as number)) / 1000);
      predict(dt);
      update(obs.lat, obs.lon);
      state.lastT = obs.t;
      return this.estimate();
    },
    estimate() {
      return { lat: state.x[0], lon: state.x[1], t: state.lastT ?? 0 };
    },
  };
}
