// @ts-nocheck
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parsePositiveNumber } from './priceValidation';

test('returns null for empty string', () => {
  assert.strictEqual(parsePositiveNumber(''), null);
});

test('returns null for negative value', () => {
  assert.strictEqual(parsePositiveNumber('-5'), null);
});

test('returns null for non numeric', () => {
  assert.strictEqual(parsePositiveNumber('abc'), null);
});

test('parses positive numbers', () => {
  assert.strictEqual(parsePositiveNumber('10'), 10);
  assert.strictEqual(parsePositiveNumber('3.14'), 3.14);
});