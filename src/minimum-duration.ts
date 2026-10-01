export const MINIMUM_CURATION_MS = 3000;

/** Start work immediately; count the display interval once the loading screen has entered. */
export async function withMinimumDuration<T>(work: () => Promise<T>, duration = MINIMUM_CURATION_MS, ready: Promise<void> = Promise.resolve()): Promise<T> {
  const [result] = await Promise.allSettled([
    Promise.resolve().then(work),
    ready.then(() => new Promise<void>(resolve => setTimeout(resolve, duration))),
  ]);
  if (result.status === 'rejected') throw result.reason;
  return result.value;
}
