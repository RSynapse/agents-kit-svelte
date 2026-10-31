/**
 * Shared class recipes for the Agents Kit Svelte visual language.
 *
 * Mirrors the restrained upstream agents-kit foundation (DESIGN.md): neutral primary
 * buttons, 1px hairlines, chip/control/card/window radii, plain-text status labels,
 * slim progress tracks and 14–16px Lucide icons. Components compose these strings so
 * every collection shares one look without a parallel component layer.
 */

export type UiTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'icon-xs' | 'icon-sm' | 'icon';

const BUTTON_BASE =
	'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
	primary: 'bg-fg-main text-fg-inverse hover:bg-fg-main/88',
	accent: 'bg-accent-primary text-fg-inverse hover:bg-accent-primary/90',
	secondary:
		'border border-card-border bg-card-bg text-fg-main ak-shadow-btn hover:bg-canvas-secondary',
	ghost: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main',
	danger:
		'border border-card-border bg-card-bg text-status-danger ak-shadow-btn hover:bg-status-danger-subtle'
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
	xs: 'h-6 px-2 text-xs [&_svg]:size-3',
	sm: 'h-7 px-2.5 text-xs [&_svg]:size-3.5',
	md: 'h-8 px-3 text-xs [&_svg]:size-3.5',
	'icon-xs': 'size-6 [&_svg]:size-3.5',
	'icon-sm': 'size-7 [&_svg]:size-3.5',
	icon: 'size-8 [&_svg]:size-4'
};

/**
 * Builds the class list for a button or button-like link.
 *
 * @param variant - Visual weight (default `secondary`).
 * @param size - Height and padding preset (default `sm`).
 * @param extra - Additional classes appended last.
 * @returns Space-separated class string.
 */
export function buttonClass(
	variant: ButtonVariant = 'secondary',
	size: ButtonSize = 'sm',
	extra = ''
): string {
	return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${extra}`.trim();
}

/** Plain colored text for status labels ("Running", "Failed"), as upstream uses. */
export const STATUS_TEXT_CLASS: Record<UiTone, string> = {
	neutral: 'text-fg-light',
	accent: 'text-accent-primary',
	success: 'text-status-success',
	warning: 'text-status-warning',
	danger: 'text-status-danger'
};

const BADGE_TONES: Record<UiTone, string> = {
	neutral: 'bg-canvas-secondary text-fg-light',
	accent: 'bg-accent-subtle text-accent-primary',
	success: 'bg-status-success-subtle text-status-success',
	warning: 'bg-status-warning-subtle text-status-warning',
	danger: 'bg-status-danger-subtle text-status-danger'
};

/**
 * Builds the class list for a compact chip/badge.
 *
 * @param tone - Semantic tone (default `neutral`).
 * @param extra - Additional classes appended last.
 * @returns Space-separated class string.
 */
export function badgeClass(tone: UiTone = 'neutral', extra = ''): string {
	return `inline-flex shrink-0 items-center gap-1 rounded-chip px-1.5 py-px text-[11px] font-medium leading-4 whitespace-nowrap [&_svg]:size-3 ${BADGE_TONES[tone]} ${extra}`.trim();
}

/** Background fill per tone for status dots and progress fills. */
export const TONE_FILL_CLASS: Record<UiTone, string> = {
	neutral: 'bg-fg-light',
	accent: 'bg-accent-primary',
	success: 'bg-status-success',
	warning: 'bg-status-warning',
	danger: 'bg-status-danger'
};

/** Slim 6px progress track. Pair with `progressFillClass`. */
export const PROGRESS_TRACK_CLASS = 'h-1.5 overflow-hidden rounded-full bg-canvas-secondary';

/**
 * Builds the class list for a progress fill inside `PROGRESS_TRACK_CLASS`.
 *
 * @param tone - Semantic tone (default `accent`).
 * @returns Space-separated class string.
 */
export function progressFillClass(tone: UiTone = 'accent'): string {
	return `block h-full rounded-full transition-[width] duration-300 ease-out ${TONE_FILL_CLASS[tone]}`;
}

/** Card surface, section header/footer bands and typographic roles. */
export const SURFACE = {
	card: 'overflow-hidden rounded-card border border-card-border bg-card-bg',
	window: 'overflow-hidden rounded-window border border-card-border bg-card-bg',
	header: 'border-b border-canvas-border px-4 py-3',
	footer: 'border-t border-canvas-border px-4 py-2.5 text-xs text-fg-light',
	inset: 'rounded-control bg-canvas-secondary',
	eyebrow: 'text-xs font-medium text-fg-light',
	title: 'text-sm font-semibold text-fg-main',
	heading: 'text-base font-semibold tracking-[-0.01em] text-fg-main',
	description: 'text-xs leading-5 text-fg-light'
} as const;

/** Text input / select / textarea recipe. */
export const INPUT_CLASS =
	'h-8 w-full rounded-control border border-card-border bg-card-bg px-2.5 text-[13px] text-fg-main placeholder:text-fg-light transition-colors focus:border-fg-light focus:outline-none';

/**
 * Builds the class list for a segmented/tab trigger.
 *
 * @param active - Whether this trigger is selected.
 * @returns Space-separated class string.
 */
export function segmentClass(active: boolean): string {
	return `inline-flex h-7 items-center gap-1.5 rounded-control px-2.5 text-xs font-medium transition-colors [&_svg]:size-3.5 ${
		active
			? 'bg-card-bg text-fg-main ak-shadow-btn ring-1 ring-card-border'
			: 'text-fg-light hover:text-fg-main'
	}`;
}

/** Container for `segmentClass` triggers. */
export const SEGMENT_GROUP_CLASS = 'inline-flex items-center gap-0.5 rounded-[10px] bg-canvas-secondary p-0.5';
