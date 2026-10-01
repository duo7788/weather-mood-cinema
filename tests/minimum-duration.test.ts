import test from 'node:test';
import assert from 'node:assert/strict';
import { withMinimumDuration } from '../src/minimum-duration';
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
test('minimum interval begins after the loading entrance while work starts immediately', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let entered!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; });
  let started = false;
  let done = false;
  const result = withMinimumDuration(async () => { started = true; return 'movie'; }, 3000, ready)
    .then(value => { done = true; return value; });
  await flush();
  assert.equal(started, true);
  t.mock.timers.tick(1200); await flush();
  assert.equal(done, false);
  entered(); await flush();
  t.mock.timers.tick(2999); await flush();
  assert.equal(done, false);
  t.mock.timers.tick(1);
  assert.equal(await result, 'movie');
});
test('fast requests wait three seconds before revealing results', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let done = false;
  const result = withMinimumDuration(async () => 'movie').then(value => { done = true; return value; });
  await flush();
  t.mock.timers.tick(2999); await flush(); assert.equal(done, false);
  t.mock.timers.tick(1); assert.equal(await result, 'movie');
});
test('slow requests complete without adding another three seconds', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let finish!: (value: string) => void;
  let done = false;
  const result = withMinimumDuration(() => new Promise<string>(resolve => { finish = resolve; })).then(value => { done = true; return value; });
  await flush(); t.mock.timers.tick(5000); await flush(); assert.equal(done, false);
  finish('movie'); await flush(); assert.equal(done, true); assert.equal(await result, 'movie');
});
test('failed requests leave loading and preserve the error after the minimum interval', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const error = new Error('network');
  const result = withMinimumDuration(async () => { throw error; });
  const checked = assert.rejects(result, error);
  await flush(); t.mock.timers.tick(3000); await checked;
});
