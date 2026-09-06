import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clippingReducer, createClipping } from '../src/renderer/clipping-state.ts';

test('adding an item preserves its ID across reducer replays and puts it first', () => {
  const previous = Object.freeze({ id: 'existing', value: 'old' });
  const clipping = createClipping('new');
  assert.match(clipping.id, /^[0-9a-f-]{36}$/);
  const state = [previous];
  const action = { type: 'add', clipping } as const;
  assert.deepEqual(clippingReducer(state, action), [clipping, previous]);
  assert.deepEqual(clippingReducer(state, action), clippingReducer(state, action));
  assert.deepEqual(state, [previous]);
});

test('editing and removing an item leaves other items and the original state intact', () => {
  const first = Object.freeze({ id: 'a', value: 'one' });
  const second = Object.freeze({ id: 'b', value: 'two' });
  const state = [first, second];
  assert.deepEqual(clippingReducer(state, { type: 'update', id: 'a', value: 'edited' }), [
    { id: 'a', value: 'edited' }, second,
  ]);
  assert.deepEqual(clippingReducer(state, { type: 'remove', id: 'b' }), [first]);
  assert.deepEqual(state, [first, second]);
});
