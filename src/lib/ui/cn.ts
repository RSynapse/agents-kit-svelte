import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge, taught the kit's own scales so `rounded-lg` replaces `rounded-card`
 * instead of sitting next to it.
 */
const merge = extendTailwindMerge({
	extend: {
		theme: {
			radius: ['chip', 'control', 'card', 'window', 'soft', 'bubble', 'composer']
		}
	}
});

type ClassValue = string | false | null | undefined;

/**
 * Joins class strings and resolves Tailwind conflicts, with later classes winning.
 * Components pass their own classes first and your `class` prop last, so yours wins:
 * `<TodoList class="rounded-lg p-2" />` replaces the card radius and padding.
 *
 * @param classes - Class strings; falsy values are skipped.
 * @returns The merged class string.
 */
export function cn(...classes: ClassValue[]): string {
	return merge(classes.filter(Boolean).join(' '));
}
