/** Bound both connection and body reads; cancel the underlying request on expiry. */
export async function fetchJsonWithTimeout(url, init = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { ...init, signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Request timed out'));
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
