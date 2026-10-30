import { cubicOut, quintOut } from 'svelte/easing';
import { Spring, Tween, prefersReducedMotion } from 'svelte/motion';
import { crossfade, scale } from 'svelte/transition';
import type { TransitionConfig } from 'svelte/transition';

/**
 * Returns the effective transition duration in milliseconds, collapsing to `0`
 * whenever the user has enabled `prefers-reduced-motion: reduce`.
 *
 * @param durationMs - Desired transition duration in milliseconds.
 * @returns Effective duration in milliseconds (`0` when reduced motion is preferred).
 */
export function motionDuration(durationMs = 200): number {
	return prefersReducedMotion.current ? 0 : durationMs;
}

/**
 * Creates a paired `[send, receive]` Svelte 5 `crossfade` transition for moving
 * cards or pills smoothly between columns, lanes, or lists.
 *
 * @param durationMs - Base crossfade duration in milliseconds.
 * @returns Tuple `[send, receive]` transition functions.
 */
export function createBoardCrossfade(durationMs = 260) {
	return crossfade({
		duration: (d) => (prefersReducedMotion.current ? 0 : Math.min(420, Math.max(durationMs, Math.sqrt(d * durationMs)))),
		easing: quintOut,
		fallback(node): TransitionConfig {
			return scale(node, {
				duration: motionDuration(180),
				start: 0.95,
				easing: cubicOut
			});
		}
	});
}

/**
 * Svelte 5 universal reactive `.svelte.ts` class wrapping `Spring` from `svelte/motion`
 * with reactive `$state` configuration and `$derived` formatted readouts.
 */
export class ReactiveSpringMetric {
	stiffness = $state(0.15);
	damping = $state(0.76);
	targetValue = $state(0);
	readonly spring = new Spring(0, { stiffness: 0.15, damping: 0.76 });

	rounded = $derived(Math.round(this.spring.current));
	clampedPercent = $derived(Math.max(0, Math.min(100, this.spring.current)));

	/**
	 * Initializes a spring-driven metric.
	 *
	 * @param initial - Initial numeric value.
	 * @param options - Optional spring stiffness and damping parameters.
	 */
	constructor(initial = 0, options?: { stiffness?: number; damping?: number }) {
		if (options?.stiffness !== undefined) this.stiffness = options.stiffness;
		if (options?.damping !== undefined) this.damping = options.damping;
		this.targetValue = initial;
		this.spring.stiffness = this.stiffness;
		this.spring.damping = this.damping;
		void this.spring.set(initial, { instant: true });
	}

	/**
	 * Updates the spring target value, snapping immediately if reduced motion is active.
	 *
	 * @param value - New target value.
	 */
	set(value: number): void {
		this.targetValue = value;
		this.spring.stiffness = this.stiffness;
		this.spring.damping = this.damping;
		void this.spring.set(value, { instant: prefersReducedMotion.current });
	}
}

/**
 * Svelte 5 universal reactive `.svelte.ts` class wrapping `Tween` from `svelte/motion`
 * for smooth progress bar and token gauge interpolation.
 */
export class ReactiveTweenProgress {
	readonly tween = new Tween(0, { duration: 280, easing: cubicOut });
	percent = $derived(Math.max(0, Math.min(100, this.tween.current)));

	/**
	 * Initializes a tweened progress value.
	 *
	 * @param initial - Initial numeric value (0 to 100).
	 * @param durationMs - Tween duration in milliseconds.
	 */
	constructor(initial = 0, durationMs = 280) {
		void this.tween.set(initial, { duration: prefersReducedMotion.current ? 0 : durationMs });
	}

	/**
	 * Animates the progress value to `next`.
	 *
	 * @param next - Target progress value.
	 */
	set(next: number): void {
		void this.tween.set(next, {
			duration: prefersReducedMotion.current ? 0 : 280
		});
	}
}

/**
 * Svelte 5 action that applies a compositor-safe tactile scale microanimation on pointer press,
 * respecting `prefers-reduced-motion`.
 *
 * @param node - Target HTML element.
 * @param activeScale - Scale factor while pressed (default `0.97`).
 * @returns Svelte action lifecycle object.
 */
export function pressScale(node: HTMLElement, activeScale = 0.97) {
	let scaleFactor = activeScale;

	function onPointerDown(): void {
		if (prefersReducedMotion.current || (node as HTMLButtonElement).disabled) return;
		node.style.transition = 'scale 130ms cubic-bezier(0.22, 1, 0.36, 1)';
		node.style.scale = String(scaleFactor);
	}

	function onPointerUpOrLeave(): void {
		if (prefersReducedMotion.current) return;
		node.style.transition = 'scale 180ms cubic-bezier(0.34, 1.56, 0.64, 1)';
		node.style.scale = '1';
	}

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointerup', onPointerUpOrLeave);
	node.addEventListener('pointerleave', onPointerUpOrLeave);
	node.addEventListener('pointercancel', onPointerUpOrLeave);

	return {
		update(nextScale = 0.97) {
			scaleFactor = nextScale;
		},
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointerup', onPointerUpOrLeave);
			node.removeEventListener('pointerleave', onPointerUpOrLeave);
			node.removeEventListener('pointercancel', onPointerUpOrLeave);
		}
	};
}

/**
 * Svelte 5 action that applies a subtle compositor-only `translate` magnetic hover effect
 * to interactive cards or buttons, respecting `prefers-reduced-motion`.
 *
 * @param node - Target HTML element.
 * @param maxOffsetPx - Maximum translation offset in pixels (default `3`).
 * @returns Svelte action lifecycle object.
 */
export function magneticHover(node: HTMLElement, maxOffsetPx = 3) {
	let strength = maxOffsetPx;

	function onPointerMove(e: PointerEvent): void {
		if (prefersReducedMotion.current) return;
		const rect = node.getBoundingClientRect();
		const relX = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
		const relY = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
		const dx = (relX * strength * 2).toFixed(2);
		const dy = (relY * strength * 2).toFixed(2);
		node.style.transition = 'translate 90ms ease-out';
		node.style.translate = `${dx}px ${dy}px`;
	}

	function onPointerLeave(): void {
		node.style.transition = 'translate 220ms cubic-bezier(0.22, 1, 0.36, 1)';
		node.style.translate = '0px 0px';
	}

	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerleave', onPointerLeave);

	return {
		update(nextStrength = 3) {
			strength = nextStrength;
		},
		destroy() {
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerleave', onPointerLeave);
		}
	};
}
