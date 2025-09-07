import { describe, it, expect } from "vitest";
import { createKalman2D } from "./kalmanFilter";

function rms(arr: number[]) {
  const m = arr.reduce((s, v) => s + v * v, 0) / arr.length;
  return Math.sqrt(m);
}

describe("Kalman2D smoothing", () => {
  it("reduces RMS jitter on a straight path", () => {
    const kf = createKalman2D({ processNoise: 1e-3, measurementNoise: 5e-2 });
    kf.init({ lat: 0, lon: 0, t: 0 });

    const rawErrors: number[] = [];
    const filteredErrors: number[] = [];

    for (let i = 1; i <= 100; i++) {
      const t = i * 500; // 2Hz
      // True path: lat = i*0.0001, lon = i*0.0001
      const trueLat = i * 0.0001;
      const trueLon = i * 0.0001;
      // Add noise ~ N(0, 0.0002)
      const noiseLat = (Math.random() - 0.5) * 0.0004;
      const noiseLon = (Math.random() - 0.5) * 0.0004;
      const obsLat = trueLat + noiseLat;
      const obsLon = trueLon + noiseLon;

      const est = kf.update({ lat: obsLat, lon: obsLon, t });
      rawErrors.push(Math.hypot(noiseLat, noiseLon));
      filteredErrors.push(Math.hypot(est.lat - trueLat, est.lon - trueLon));
    }

    const rawRms = rms(rawErrors);
    const filteredRms = rms(filteredErrors);
    expect(filteredRms).toBeLessThan(rawRms * 0.8); // at least 20% reduction
  });
});
