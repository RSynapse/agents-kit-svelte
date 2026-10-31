import assert from 'node:assert/strict';
import test from 'node:test';
import { cn } from '../src/lib/ui/cn.ts';

test('cn lets the caller override the kit radius, colour and spacing', () => {
	assert.equal(cn('rounded-card border bg-card-bg p-4', 'rounded-lg p-2'), 'border bg-card-bg rounded-lg p-2');
	assert.equal(cn('bg-card-bg text-fg-main', 'bg-red-500'), 'text-fg-main bg-red-500');
	assert.equal(cn('rounded-window', 'rounded-none'), 'rounded-none');
});

test('cn keeps size and colour text utilities apart and skips empty values', () => {
	assert.equal(cn('text-sm text-fg-main', ''), 'text-sm text-fg-main');
	assert.equal(cn('a', false, null, undefined, 'b'), 'a b');
});
