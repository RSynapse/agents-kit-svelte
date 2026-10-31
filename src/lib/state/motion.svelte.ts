import { cubicOut, quintOut } from 'svelte/easing';
import { Spring, Tween, prefersReducedMotion } from 'svelte/motion';
import { crossfade, fade } from 'svelte/transition';
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
			return fade(node, { duration: motionDuration(140), easing: cubicOut });
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
 * Subtle entrance transition: a short fade with a whole-pixel vertical offset.
 *
 * Unlike `scale` or fractional `fly` offsets, every intermediate frame lands on an
 * integer pixel, so text never renders soft or blurry while it moves.
 *
 * @param node - Element being transitioned.
 * @param options - Offset in pixels (default `4`), duration and delay in milliseconds.
 * @returns Svelte transition config.
 */
export function rise(
	node: Element,
	{ y = 4, duration = 160, delay = 0 }: { y?: number; duration?: number; delay?: number } = {}
): TransitionConfig {
	const opacity = Number(getComputedStyle(node).opacity) || 1;
	return {
		delay,
		duration: motionDuration(duration),
		easing: cubicOut,
		css: (t, u) => `opacity: ${t * opacity}; transform: translateY(${Math.round(u * y)}px);`
	};
}
