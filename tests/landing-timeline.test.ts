import assert from 'node:assert/strict';
import test from 'node:test';
import { demoFrame, DEMO_DURATION } from '../src/landing-timeline';
test('demo covers recommendation hover, save, collections, flip and return before wrapping', () => {
  [0,2400,4000,5600,8200,9400,12000,16700].forEach((time, step) => assert.equal(demoFrame(time).step, step));
  assert.equal(demoFrame(DEMO_DURATION).step, 0);
  assert.equal(demoFrame(-1).step, 0);
});
test('poster colors and flip follow the simulated cursor arrival', () => {
  assert.equal(demoFrame(6500).posterColor, false);
  assert.equal(demoFrame(7400).posterColor, true);
  assert.equal(demoFrame(10100).collectionColor, false);
  assert.equal(demoFrame(11600).collectionColor, true);
  assert.equal(demoFrame(12500).flipped, true);
  assert.equal(demoFrame(17400).flipped, false);
});

test('save follows color reveal promptly while synopsis keeps reading time', () => {
  assert.equal(demoFrame(6900).posterColor, true);
  assert.equal(demoFrame(8900).saved, true);
  assert.equal(demoFrame(12300).flipped, true);
  assert.equal(demoFrame(16999).flipped, true);
  assert.equal(demoFrame(17000).flipped, false);
});
