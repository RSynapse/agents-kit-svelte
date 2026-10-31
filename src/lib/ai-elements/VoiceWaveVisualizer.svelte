<script lang="ts">
	import { SEGMENT_GROUP_CLASS, segmentClass } from '../ui/styles';
	import { Mic, VolumeX } from '@lucide/svelte';
	export type VoiceSessionState = 'idle' | 'listening' | 'speaking' | 'processing';

	export interface VoiceDeviceOption {
		id: string;
		label: string;
	}

	export interface VoicePersonaOption {
		id: string;
		name: string;
		accent: string;
		tone: string;
	}

	interface Props {
		defaultState?: VoiceSessionState;
		defaultMicId?: string;
		defaultPersonaId?: string;
		devices?: VoiceDeviceOption[];
		personas?: VoicePersonaOption[];
		transcript?: string;
		onStateChange?: (state: VoiceSessionState) => void;
		class?: string;
	}

	const DEFAULT_DEVICES: VoiceDeviceOption[] = [
		{ id: 'mic-macbook-pro', label: 'MacBook Pro Studio Mic' },
		{ id: 'mic-shure-mv7', label: 'Shure MV7 USB Podcast Mic' },
		{ id: 'mic-airpods', label: 'AirPods Pro Hands-Free' }
	];

	const DEFAULT_PERSONAS: VoicePersonaOption[] = [
		{ id: 'sol', name: 'Sol', accent: 'American', tone: 'Calm & direct' },
		{ id: 'vale', name: 'Vale', accent: 'British', tone: 'Crisp & analytical' },
		{ id: 'ember', name: 'Ember', accent: 'Canadian', tone: 'Warm & collaborative' }
	];

	/**
	 * 24 deterministic normalized bar heights (between 0.18 and 0.96) for the audio waveform display.
	 */
	const WAVEFORM_BARS: number[] = [
		0.24, 0.38, 0.62, 0.45, 0.82, 0.94, 0.68, 0.52, 0.76, 0.91, 0.58, 0.34,
		0.48, 0.86, 0.96, 0.72, 0.44, 0.64, 0.84, 0.56, 0.36, 0.5, 0.3, 0.2
	];

	let {
		defaultState = 'listening',
		defaultMicId = 'mic-macbook-pro',
		defaultPersonaId = 'sol',
		devices = DEFAULT_DEVICES,
		personas = DEFAULT_PERSONAS,
		transcript = 'Check the failing unit test in chat-helpers and explain why the token ratio threshold triggered a warning.',
		onStateChange,
		class: className = ''
	}: Props = $props();

	let sessionState = $state<VoiceSessionState>('listening');
	let selectedMicId = $state('mic-macbook-pro');
	let selectedPersonaId = $state('sol');
	let muted = $state(false);

	$effect(() => {
		sessionState = defaultState;
		selectedMicId = defaultMicId;
		selectedPersonaId = defaultPersonaId;
	});

	let activePersona = $derived(
		personas.find((p) => p.id === selectedPersonaId) ?? personas[0]
	);

	/**
	 * Updates the active voice session state and notifies any parent listener.
	 *
	 * @param nextState - Target VoiceSessionState.
	 */
	function setVoiceState(nextState: VoiceSessionState): void {
		sessionState = nextState;
		onStateChange?.(nextState);
	}

	/**
	 * Computes the visual height percentage for a waveform bar based on session state and mute flag.
	 *
	 * @param baseRatio - Normalized bar ratio between 0 and 1.
	 * @returns Height percentage between 12 and 96.
	 */
	function computeBarHeightPercent(baseRatio: number): number {
		if (muted || sessionState === 'idle') {
			return 14;
		}
		if (sessionState === 'processing') {
			return Math.round(25 + baseRatio * 30);
		}
		return Math.round(baseRatio * 96);
	}
</script>

<div class="w-full rounded-card border border-card-border bg-card-bg p-4 text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border pb-3">
		<div class="flex items-center gap-2.5">
			<span
				class="inline-flex size-3 rounded-full {sessionState === 'listening'
					? 'bg-status-success'
					: sessionState === 'speaking'
						? 'bg-accent-primary'
						: sessionState === 'processing'
							? 'bg-status-warning'
							: 'bg-canvas-border'}"
			></span>
			<span class="font-semibold text-fg-main">Voice Agent Session</span>
			<span
				class="rounded-full bg-canvas-secondary px-2.5 py-0.5 font-mono text-xs capitalize text-fg-light"
			>
				{muted ? 'muted' : sessionState}
			</span>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<select
				aria-label="Select microphone input"
				bind:value={selectedMicId}
				class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 font-mono text-xs text-fg-main outline-none focus:border-accent-primary"
			>
				{#each devices as mic (mic.id)}
					<option value={mic.id}>{mic.label}</option>
				{/each}
			</select>

			<select
				aria-label="Select voice persona"
				bind:value={selectedPersonaId}
				class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 font-mono text-xs text-fg-main outline-none focus:border-accent-primary"
			>
				{#each personas as persona (persona.id)}
					<option value={persona.id}>{persona.name} ({persona.accent})</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="my-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-canvas-border bg-canvas-primary px-4 py-5">
		<div
			aria-label="Audio waveform visualizer"
			class="flex h-14 w-full max-w-md items-center justify-center gap-1.5"
		>
			{#each WAVEFORM_BARS as ratio, index (index)}
				{@const heightPct = computeBarHeightPercent(ratio)}
				<div
					style:height="{heightPct}%"
					class="w-1.5 rounded-full transition-all duration-200 {muted || sessionState === 'idle'
						? 'bg-canvas-border'
						: sessionState === 'speaking'
							? 'bg-accent-primary'
							: sessionState === 'processing'
								? 'bg-status-warning'
								: 'bg-status-success'}"
				></div>
			{/each}
		</div>

		{#if activePersona}
			<div class="font-mono text-xs text-fg-light">
				Persona: <span class="font-semibold text-fg-main">{activePersona.name}</span> · {activePersona.tone}
			</div>
		{/if}

		<p class="max-w-xl text-center text-xs leading-relaxed text-fg-main">
			“{transcript}”
		</p>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="{SEGMENT_GROUP_CLASS} flex-wrap">
			{#each ['idle', 'listening', 'processing', 'speaking'] as const as mode (mode)}
				<button
					type="button"
					aria-pressed={sessionState === mode}
					onclick={() => setVoiceState(mode)}
					class="{segmentClass(sessionState === mode)} capitalize"
				>
					{mode}
				</button>
			{/each}
		</div>

		<button
			type="button"
			aria-pressed={muted}
			onclick={() => (muted = !muted)}
			class="rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors {muted
				? 'bg-status-danger-subtle text-status-danger'
				: 'border border-card-border bg-canvas-primary text-fg-main hover:bg-canvas-secondary'}"
		>
			{#if muted}<VolumeX aria-hidden="true" />Unmute Mic{:else}<Mic aria-hidden="true" />Mute Mic{/if}
		</button>
	</div>
</div>
