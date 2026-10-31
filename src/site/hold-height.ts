/**
 * Keeps a self-playing preview at the tallest height it has reached.
 *
 * The catalogue demos grow and shrink as they loop. When one above the viewport changes
 * height, the browser re-anchors the scroll position by a fraction of a pixel, and
 * everything on screen jitters. Holding the peak height means each preview settles after
 * its first loop. Pass a new `key` (tab, replay) to measure from scratch.
 */
export function holdHeight(node: HTMLElement, key?: unknown) {
	let peak = 0;
	let width = node.clientWidth;
	const observer = new ResizeObserver(() => {
		if (node.clientWidth !== width) {
			// Reflowed at a new width: start over rather than keep a stale height.
			width = node.clientWidth;
			reset();
			return;
		}
		const height = node.getBoundingClientRect().height;
		if (height > peak) {
			peak = height;
			node.style.minHeight = `${peak}px`;
		}
	});

	function reset(): void {
		peak = 0;
		node.style.minHeight = '';
		peak = node.getBoundingClientRect().height;
		node.style.minHeight = `${peak}px`;
	}

	observer.observe(node);
	return {
		update(next: unknown) {
			if (next !== key) {
				key = next;
				reset();
			}
		},
		destroy() {
			observer.disconnect();
		}
	};
}
