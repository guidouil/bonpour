<script lang="ts">
	import {
		getDisplayStatus,
		statusLabels,
		type VoucherStatus,
		type VoucherTheme
	} from '$lib/voucher';

	let {
		senderName,
		recipientName,
		subject,
		quantity = null,
		message = null,
		expiresAt = null,
		status = 'created',
		themeMode = 'system',
		preview = false
	}: {
		senderName: string;
		recipientName: string;
		subject: string;
		quantity?: number | null;
		message?: string | null;
		expiresAt?: Date | string | null;
		status?: VoucherStatus;
		themeMode?: VoucherTheme;
		preview?: boolean;
	} = $props();

	const displayStatus = $derived(getDisplayStatus({ status, expiresAt }));
	const formattedExpiration = $derived(
		expiresAt
			? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
					new Date(expiresAt)
				)
			: null
	);
</script>

<article class={`voucher-card theme-${themeMode}`}>
	<div class="voucher-inner">
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="eyebrow">Bon pour</p>
				<p class="voucher-soft mt-1 text-[1rem] font-bold tracking-[0.24em] uppercase">
					{recipientName || 'quelqu’un de spécial'}
				</p>
			</div>
			<div class="stamp">
				{#if quantity}
					<span>× {quantity}</span>
				{:else}
					<span>BP</span>
				{/if}
			</div>
		</div>

		<div class="flex min-h-36 items-center justify-center px-3 py-5 text-center sm:min-h-44">
			<h2 class="voucher-ink font-serif text-3xl leading-[1.08] font-semibold sm:text-4xl">
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
				<p class="voucher-ink mt-1 font-serif text-lg font-semibold">
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
						<br/>{formattedExpiration}
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
		height: 3.2rem;
		justify-content: center;
		letter-spacing: 0.08em;
		transform: rotate(16deg);
		width: 3.2rem;
	}

	.theme-dark {
		--voucher-accent: #e47c60;
		--voucher-bg: #26352d;
		--voucher-border: #d7c6aa;
		--voucher-dashed: #6f806f;
		--voucher-ink: #fff6e7;
		--voucher-muted: #c9d2c8;
		--voucher-soft: #aebbb2;
		--voucher-warm: #d6b28f;
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

	@media (prefers-color-scheme: dark) {
		.theme-system {
			--voucher-accent: #e47c60;
			--voucher-bg: #26352d;
			--voucher-border: #d7c6aa;
			--voucher-dashed: #6f806f;
			--voucher-ink: #fff6e7;
			--voucher-muted: #c9d2c8;
			--voucher-soft: #aebbb2;
			--voucher-warm: #d6b28f;
		}
	}
</style>
