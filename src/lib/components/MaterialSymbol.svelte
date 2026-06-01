<script lang="ts">
	import { getMaterialSymbol, type MaterialSymbolName } from '$lib/material-symbols';

	let {
		name,
		class: className = '',
		label
	}: { name: MaterialSymbolName; class?: string; label?: string } = $props();

	const symbol = $derived(getMaterialSymbol(name));
</script>

{#if symbol}
	<svg
		class={className}
		viewBox="0 -960 960 960"
		fill="currentColor"
		aria-hidden={label ? undefined : 'true'}
		aria-label={label}
		role={label ? 'img' : undefined}
	>
		<path d={symbol.path} />
	</svg>
{/if}

<style>
	svg {
		display: block;
		height: 1em;
		width: 1em;
	}
</style>
