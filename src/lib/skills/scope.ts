import { Box, FileCode, FileText, FolderGit2, Image, Puzzle, ScrollText, User } from '@lucide/svelte';
import type { Component } from 'svelte';
import type { UiTone } from '../ui/styles.ts';
import type { SkillFileKind, SkillScope } from './types.ts';

export interface SkillScopeMeta {
	label: string;
	tone: UiTone;
	icon: Component;
	hint: string;
}

/** Label, tone, icon and one-line hint for each install scope. */
export const SKILL_SCOPE_META: Record<SkillScope, SkillScopeMeta> = {
	personal: { label: 'Personal', tone: 'accent', icon: User, hint: 'Only you, in every project' },
	project: { label: 'Project', tone: 'success', icon: FolderGit2, hint: 'Checked into this repository' },
	plugin: { label: 'Plugin', tone: 'warning', icon: Puzzle, hint: 'Comes with an installed plugin' },
	'built-in': { label: 'Built in', tone: 'neutral', icon: Box, hint: 'Ships with the agent' }
};

/** Icon for each kind of file in a skill folder. */
export const SKILL_FILE_ICON: Record<SkillFileKind, Component> = {
	skill: ScrollText,
	script: FileCode,
	reference: FileText,
	asset: Image
};

/**
 * Builds the class list for the track of a small on/off switch (`role="switch"`).
 *
 * @param on - Whether the switch is on.
 * @returns Space-separated class string; pair with `switchThumbClass`.
 */
export function switchTrackClass(on: boolean): string {
	return `relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
		on ? 'bg-chat-accent' : 'bg-card-border'
	}`;
}

/**
 * Builds the class list for the thumb inside `switchTrackClass`.
 *
 * @param on - Whether the switch is on.
 * @returns Space-separated class string.
 */
export function switchThumbClass(on: boolean): string {
	return `inline-block size-4 rounded-full bg-card-bg ak-shadow-btn transition-transform duration-200 ${
		on ? 'translate-x-[18px]' : 'translate-x-0.5'
	}`;
}
