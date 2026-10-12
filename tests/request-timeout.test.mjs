import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchJsonWithTimeout } from '../shared/request-timeout.mjs';

test('aborts a stalled fetch and rejects within its deadline', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal;
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    signal = init.signal;
    return new Promise(() => {});
  });
  const checked = assert.rejects(fetchJsonWithTimeout('/weather', {}, 1000), /timed out/);
  t.mock.timers.tick(1000);
  await checked;
  assert.equal(signal.aborted, true);
});

test('deadline includes a stalled response body', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: () => new Promise(() => {}) }));
  const checked = assert.rejects(fetchJsonWithTimeout('/weather', {}, 1000), /timed out/);
  await Promise.resolve();
  t.mock.timers.tick(1000);
  await checked;
});

test('returns successful JSON and preserves HTTP failures', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{"ok":true}'));
  assert.deepEqual(await fetchJsonWithTimeout('/weather'), { ok: true });
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 502 }));
  await assert.rejects(fetchJsonWithTimeout('/weather'), /502/);
});
