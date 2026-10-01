export const DEMO_STARTS = [0, 2400, 4000, 5600, 8200, 9400, 12000, 16700] as const;
export const DEMO_DURATION = 18500;
export function demoFrame(elapsed: number) {
  const time = Math.max(0, elapsed) % DEMO_DURATION;
  let step = 0;
  DEMO_STARTS.forEach((start, index) => { if (time >= start) step = index; });
  return {
    step, time, progress: time / DEMO_DURATION,
    posterColor: time >= 6900 && time < 8200,
    saved: time >= 8900,
    collections: time >= 10100,
    collectionColor: time >= 11400,
    flipped: time >= 12300 && time < 17000,
    clicking: (time >= 8900 && time < 9300) || (time >= 10100 && time < 10500) || (time >= 12300 && time < 12700) || (time >= 17000 && time < 17400),
    cursor: time >= 16700 ? 'flip' : time >= 12000 ? 'flip' : time >= 10700 ? 'card' : time >= 9400 ? 'collections' : time >= 8200 ? 'save' : time >= 6200 ? 'poster' : `stage-${step}`,
  };
}
