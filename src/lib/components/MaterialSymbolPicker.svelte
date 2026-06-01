<script lang="ts">
	import { materialSymbols, type MaterialSymbolName } from '$lib/material-symbols';
	import MaterialSymbol from './MaterialSymbol.svelte';

	let { value = $bindable('') }: { value?: MaterialSymbolName | '' } = $props();

	const selectedSymbol = $derived(materialSymbols.find((symbol) => symbol.name === value));
</script>

<div class="mt-3 rounded-2xl border site-border surface-muted p-3">
	<input type="hidden" name="icon" {value} />
	<details>
		<summary class="flex cursor-pointer items-center justify-between gap-3">
			<span class="field-label mb-0"
				>Icône du tampon <span class="normal-case">(facultatif)</span></span
			>
			<span class="selected-icon" aria-hidden="true">
				{#if selectedSymbol}
					<MaterialSymbol name={selectedSymbol.name} class="size-4" />
				{:else}
					BP
				{/if}
			</span>
		</summary>
		<div class="mt-3">
			<div class="grid grid-cols-5 gap-1.5" aria-label="Choisir une icône">
				<button
					class:active={!value}
					class="icon-choice"
					type="button"
					aria-label="Aucune icône"
					aria-pressed={!value}
					onclick={() => (value = '')}
				>
					<span class="text-xs font-extrabold">BP</span>
				</button>
				{#each materialSymbols as symbol (symbol.name)}
					<button
						class:active={value === symbol.name}
						class="icon-choice"
						type="button"
						aria-label={symbol.label}
						aria-pressed={value === symbol.name}
						title={symbol.label}
						onclick={() => (value = symbol.name)}
					>
						<MaterialSymbol name={symbol.name} class="size-5" />
					</button>
				{/each}
			</div>
		</div>
	</details>
</div>

<style>
	summary {
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::after {
		color: var(--ink-soft);
		content: '+';
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1;
	}

	details[open] summary::after {
		content: '−';
	}

	.selected-icon {
		align-items: center;
		color: var(--accent);
		display: flex;
		font-size: 0.65rem;
		font-weight: 800;
		height: 1.5rem;
		justify-content: center;
		margin-left: auto;
		width: 1.5rem;
	}
	.icon-choice {
		align-items: center;
		background: var(--surface);
		border: 1px solid var(--border-soft);
		border-radius: 0.65rem;
		color: var(--ink-muted);
		display: flex;
		height: 2.6rem;
		justify-content: center;
		transition:
			background 120ms ease,
			border-color 120ms ease,
			color 120ms ease;
	}

	.icon-choice:hover,
	.icon-choice:focus-visible {
		border-color: var(--accent);
		color: var(--ink);
		outline: none;
	}

	.icon-choice.active {
		background: color-mix(in srgb, var(--accent) 13%, var(--surface));
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
