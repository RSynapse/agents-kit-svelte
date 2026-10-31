import { prefersReducedMotion } from 'svelte/motion';

/**
 * Drives a self-playing component demo: counts from `0` to `total`, holds on the finished
 * state for `hold` ticks, then starts again. Pauses while the tab is hidden, stops for good
 * once the reader interacts, and jumps straight to the end under `prefers-reduced-motion`.
 */
export class LiveLoop {
	tick = $state(0);
	paused = $state(false);
	readonly #total: () => number;
	readonly hold: number;

	/**
	 * @param total - Getter for the number of steps in one pass, so it can follow props.
	 * @param hold - Ticks to rest on the finished state before looping.
	 */
	constructor(total: () => number, hold = 4) {
		this.#total = total;
		this.hold = hold;
	}

	/** Number of steps in one pass of the demo. */
	get total(): number {
		return Math.max(0, this.#total());
	}

	/** Current step, from `0` to `total`. */
	get step(): number {
		if (prefersReducedMotion.current) return this.total;
		return Math.min(this.total, this.tick % (this.total + this.hold));
	}

	/**
	 * Starts ticking. Returns a cleanup function, so it can be returned from `$effect`.
	 *
	 * @param intervalMs - Milliseconds between steps.
	 * @returns Function that stops the timer.
	 */
	start(intervalMs = 1000): () => void {
		const id = window.setInterval(() => {
			if (!this.paused && !document.hidden) this.tick += 1;
		}, intervalMs);
		return () => window.clearInterval(id);
	}

	/** Freezes the demo on its current step, used once the reader takes over. */
	pause(): void {
		this.paused = true;
	}

	/** Continues the demo from where it was paused. */
	resume(): void {
		this.paused = false;
	}

	/**
	 * Moves the demo to a specific step and keeps playing from there.
	 *
	 * @param step - Step to jump to, from `0` to `total`.
	 */
	seek(step: number): void {
		this.tick = Math.max(0, Math.min(this.total, step));
		this.paused = false;
	}

	/** Restarts the demo from the first step. */
	restart(): void {
		this.tick = 0;
		this.paused = false;
	}
}
