<script lang="ts">
	import {
		getDisplayStatus,
		statusLabels,
		type VoucherFont,
		type VoucherStatus,
		type VoucherTheme,
		type VoucherThemeMode
	} from '$lib/voucher';
	import { getMaterialSymbol } from '$lib/material-symbols';
	import MaterialSymbol from './MaterialSymbol.svelte';

	let {
		senderName,
		recipientName,
		subject,
		quantity = null,
		icon = '',
		message = null,
		expiresAt = null,
		status = 'created',
		theme = 'terracotta',
		font = 'classic',
		themeMode = 'system',
		preview = false
	}: {
		senderName: string;
		recipientName: string;
		subject: string;
		quantity?: number | null;
		icon?: string | null;
		message?: string | null;
		expiresAt?: Date | string | null;
		status?: VoucherStatus;
		theme?: VoucherTheme;
		font?: VoucherFont;
		themeMode?: VoucherThemeMode;
		preview?: boolean;
	} = $props();

	const displayStatus = $derived(getDisplayStatus({ status, expiresAt }));
	const materialSymbol = $derived(getMaterialSymbol(icon));
	const formattedExpiration = $derived(
		expiresAt
			? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
					new Date(expiresAt)
				)
			: null
	);
</script>

<article class={`voucher-card voucher-theme-${theme} voucher-font-${font} theme-mode-${themeMode}`}>
	<div class="voucher-inner">
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="eyebrow">Bon pour</p>
				<p class="voucher-soft mt-1 text-[1rem] font-bold tracking-[0.24em] uppercase">
					{recipientName || 'quelqu’un de spécial'}
				</p>
			</div>
			<div class="stamp">
				{#if materialSymbol}
					<MaterialSymbol name={materialSymbol.name} class="stamp-icon" />
				{:else if quantity}
					<span>× {quantity}</span>
				{:else}
					<span>BP</span>
				{/if}
			</div>
		</div>

		<div class="flex min-h-36 items-center justify-center px-3 py-5 text-center sm:min-h-44">
			<h2
				class="voucher-feature voucher-title voucher-ink text-3xl leading-[1.08] font-semibold sm:text-4xl"
			>
				{subject || 'un moment qui compte'}
			</h2>
		</div>

		{#if message}
			<p class="voucher-muted voucher-rule border-t pt-4 text-sm leading-6 italic">
				« {message} »
			</p>
		{/if}

		<footer class="voucher-rule mt-5 flex items-end justify-between gap-4 border-t pt-4">
			<div>
				<p class="voucher-warm text-[0.59rem] font-bold tracking-[0.19em] uppercase">Offert par</p>
				<p class="voucher-feature voucher-creator voucher-ink mt-1 text-lg font-semibold">
					{senderName || 'une personne attentionnée'}
				</p>
			</div>
			<div class="text-right">
				{#if !preview}
					<p class="voucher-accent text-[0.58rem] font-bold tracking-[0.16em] uppercase">
						{statusLabels[displayStatus]}
					</p>
				{/if}
				{#if formattedExpiration}
					<p class="voucher-soft max-w-32 text-[0.63rem] leading-4">
						Valable jusqu’au
						<br />{formattedExpiration}
					</p>
				{:else}
					<p class="voucher-soft mt-1 text-[0.63rem]">Sans date limite</p>
				{/if}
			</div>
		</footer>
	</div>
</article>

<style>
	.voucher-card {
		--voucher-accent: #cf684d;
		--voucher-bg: #fffaf0;
		--voucher-border: #26352d;
		--voucher-dashed: #d9cbb5;
		--voucher-ink: #26352d;
		--voucher-muted: #647168;
		--voucher-soft: #7a877e;
		--voucher-warm: #9b806d;
		border: 1px solid var(--voucher-border);
		border-radius: 1.15rem;
		background: var(--voucher-bg);
		box-shadow:
			0 18px 50px rgb(57 69 59 / 12%),
			0 2px 0 rgb(255 255 255 / 55%) inset;
		padding: 0.82rem;
	}

	.voucher-feature {
		font-family: Georgia, 'Times New Roman', serif;
	}

	.voucher-font-script .voucher-feature {
		font-family: 'Brush Script MT', 'Segoe Script', cursive;
		font-weight: 400;
	}

	.voucher-font-script .voucher-title {
		font-size: 2.35rem;
	}

	.voucher-font-script .voucher-creator {
		font-size: 1.3rem;
	}

	.voucher-font-modern .voucher-feature {
		font-family: Arial, Helvetica, sans-serif;
		letter-spacing: 0.01em;
	}

	.voucher-inner {
		border: 1px dashed var(--voucher-dashed);
		border-radius: 0.78rem;
		padding: 1.1rem;
	}

	.eyebrow {
		color: var(--voucher-accent);
		font-size: 0.73rem;
		font-weight: 800;
		letter-spacing: 0.35em;
		text-transform: uppercase;
	}

	.stamp {
		align-items: center;
		background: var(--voucher-accent);
		border: 2px dashed var(--voucher-bg);
		border-radius: 999px;
		box-shadow: 0 0 0 4px var(--voucher-accent);
		color: var(--voucher-bg);
		display: flex;
		font-size: 1rem;
		font-weight: 800;
		flex: 0 0 3.2rem;
		height: 3.2rem;
		justify-content: center;
		letter-spacing: 0.08em;
		transform: rotate(16deg);
		width: 3.2rem;
	}

	.stamp :global(.stamp-icon) {
		color: var(--voucher-bg);
		height: 1.7rem;
		width: 1.7rem;
	}

	.voucher-theme-ocean {
		--voucher-accent: #2f7f88;
		--voucher-bg: #f2fbfa;
		--voucher-border: #21474d;
		--voucher-dashed: #b7d7d5;
		--voucher-ink: #21474d;
		--voucher-muted: #5c7779;
		--voucher-soft: #7b9494;
		--voucher-warm: #a26d4f;
	}

	.voucher-theme-lavender {
		--voucher-accent: #8b6bb3;
		--voucher-bg: #fbf8ff;
		--voucher-border: #433653;
		--voucher-dashed: #d9cce8;
		--voucher-ink: #433653;
		--voucher-muted: #756a7f;
		--voucher-soft: #94889e;
		--voucher-warm: #ae7185;
	}

	.voucher-theme-love {
		--voucher-accent: #c23b5a;
		--voucher-bg: #fff5f7;
		--voucher-border: #692d3a;
		--voucher-dashed: #efc7d0;
		--voucher-ink: #692d3a;
		--voucher-muted: #8a6170;
		--voucher-soft: #a98792;
		--voucher-warm: #d35b63;
	}

	.voucher-theme-terracotta.theme-mode-dark {
		--voucher-accent: #e47c60;
		--voucher-bg: #26352d;
		--voucher-border: #d7c6aa;
		--voucher-dashed: #6f806f;
		--voucher-ink: #fff6e7;
		--voucher-muted: #c9d2c8;
		--voucher-soft: #aebbb2;
		--voucher-warm: #d6b28f;
	}

	.voucher-theme-ocean.theme-mode-dark {
		--voucher-accent: #69c5cc;
		--voucher-bg: #173238;
		--voucher-border: #b9d9d8;
		--voucher-dashed: #507277;
		--voucher-ink: #eefcfb;
		--voucher-muted: #b7d0d0;
		--voucher-soft: #91aaaa;
		--voucher-warm: #e0ae87;
	}

	.voucher-theme-lavender.theme-mode-dark {
		--voucher-accent: #c2a0ee;
		--voucher-bg: #30263b;
		--voucher-border: #e0d1f3;
		--voucher-dashed: #68577b;
		--voucher-ink: #fff8ff;
		--voucher-muted: #d5c6de;
		--voucher-soft: #b6a5c1;
		--voucher-warm: #e9a9b9;
	}

	.voucher-theme-love.theme-mode-dark {
		--voucher-accent: #ff8194;
		--voucher-bg: #431f2a;
		--voucher-border: #f4c5d0;
		--voucher-dashed: #895364;
		--voucher-ink: #fff5f7;
		--voucher-muted: #e7c3cb;
		--voucher-soft: #cba1ac;
		--voucher-warm: #ff9a9e;
	}

	.voucher-ink {
		color: var(--voucher-ink);
	}

	.voucher-muted {
		color: var(--voucher-muted);
	}

	.voucher-soft {
		color: var(--voucher-soft);
	}

	.voucher-warm {
		color: var(--voucher-warm);
	}

	.voucher-accent {
		color: var(--voucher-accent);
	}

	.voucher-rule {
		border-color: var(--voucher-dashed);
	}

	@media (min-width: 40rem) {
		.voucher-font-script .voucher-title {
			font-size: 2.75rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.voucher-theme-terracotta.theme-mode-system {
			--voucher-accent: #e47c60;
			--voucher-bg: #26352d;
			--voucher-border: #d7c6aa;
			--voucher-dashed: #6f806f;
			--voucher-ink: #fff6e7;
			--voucher-muted: #c9d2c8;
			--voucher-soft: #aebbb2;
			--voucher-warm: #d6b28f;
		}

		.voucher-theme-ocean.theme-mode-system {
			--voucher-accent: #69c5cc;
			--voucher-bg: #173238;
			--voucher-border: #b9d9d8;
			--voucher-dashed: #507277;
			--voucher-ink: #eefcfb;
			--voucher-muted: #b7d0d0;
			--voucher-soft: #91aaaa;
			--voucher-warm: #e0ae87;
		}

		.voucher-theme-lavender.theme-mode-system {
			--voucher-accent: #c2a0ee;
			--voucher-bg: #30263b;
			--voucher-border: #e0d1f3;
			--voucher-dashed: #68577b;
			--voucher-ink: #fff8ff;
			--voucher-muted: #d5c6de;
			--voucher-soft: #b6a5c1;
			--voucher-warm: #e9a9b9;
		}

		.voucher-theme-love.theme-mode-system {
			--voucher-accent: #ff8194;
			--voucher-bg: #431f2a;
			--voucher-border: #f4c5d0;
			--voucher-dashed: #895364;
			--voucher-ink: #fff5f7;
			--voucher-muted: #e7c3cb;
			--voucher-soft: #cba1ac;
			--voucher-warm: #ff9a9e;
		}
	}
</style>
