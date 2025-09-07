/// <reference lib="webworker" />
import { createKalman2D } from "../utils/kalmanFilter";

type InitMsg = { type: "init"; hz?: number; smoothing?: boolean };
type PositionMsg = {
  type: "position";
  payload: { lat: number; lon: number; accuracy?: number; t: number };
};
type ControlMsg = InitMsg | PositionMsg;

let hz = 2;
let interval: number | undefined;
let latest: PositionMsg["payload"] | null = null;
let smoothing = true;
const kf = createKalman2D();

function start() {
  stop();
  const period = Math.max(100, Math.round(1000 / hz));
  interval = setInterval(() => {
    if (!latest) return;
    const obs = { lat: latest.lat, lon: latest.lon, t: latest.t };
    const est = smoothing ? kf.update(obs) : obs;
    const out = { type: "tick", payload: { ...est, accuracy: latest.accuracy } } as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).postMessage(out);
  }, period) as unknown as number;
}

function stop() {
  if (interval) clearInterval(interval);
  interval = undefined;
}

self.onmessage = (ev: MessageEvent<ControlMsg>) => {
  const data = ev.data;
  if (data.type === "init") {
    hz = data.hz ?? 2;
    smoothing = data.smoothing ?? true;
    start();
  } else if (data.type === "position") {
    if (!kf) return;
    if (!latest) {
      kf.init({ lat: data.payload.lat, lon: data.payload.lon, t: data.payload.t });
    }
    latest = data.payload;
  }
};

export {}; // ensure module
