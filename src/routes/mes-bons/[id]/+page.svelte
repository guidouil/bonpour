<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { copyText } from '$lib/clipboard';
	import VoucherCard from '$lib/components/VoucherCard.svelte';
	import { canDeleteVoucher, statusLabels } from '$lib/voucher';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let copied = $state(false);

	async function copyPublicLink() {
		await copyText(data.publicUrl);
		copied = true;
		window.setTimeout(() => (copied = false), 1800);
	}

	function confirmDelete({ cancel }: { cancel: () => void }) {
		if (!window.confirm('Supprimer définitivement ce bon ?')) cancel();
	}
</script>

<svelte:head>
	<title>Bon pour {data.voucher.recipientName} · BonPour</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-10 sm:py-16">
	<a
		class="text-xs font-extrabold tracking-[0.16em] site-accent uppercase hover:underline"
		href={resolve('/mes-bons')}
	>
		← Mes bons
	</a>
	<h1 class="mt-4 font-serif text-4xl font-semibold">Gérer ce bon.</h1>
	<p class="mt-2 text-sm site-muted">
		État actuel : <strong>{statusLabels[data.displayStatus]}</strong>
	</p>

	<div class="mt-6">
		<VoucherCard {...data.voucher} />
	</div>

	<section class="mt-6 rounded-3xl surface-card p-5 shadow-sm">
		<h2 class="font-serif text-2xl font-semibold">Partager</h2>
		<button class="secondary-button mt-4 w-full" type="button" onclick={copyPublicLink}>
			{copied ? 'Lien copié' : 'Copier le lien public'}
		</button>
	</section>

	<section class="mt-6 rounded-3xl surface-card p-5 shadow-sm">
		<h2 class="font-serif text-2xl font-semibold">Actions</h2>
		<div class="mt-4 flex flex-wrap gap-3">
			{#if data.displayStatus === 'accepted'}
				<form method="post" action="?/redeem" use:enhance>
					<button class="primary-button" type="submit">Marquer comme utilisé</button>
				</form>
			{/if}
			{#if !['expired', 'declined', 'redeemed', 'cancelled'].includes(data.displayStatus)}
				<form method="post" action="?/cancel" use:enhance>
					<button class="danger-button" type="submit">Annuler le bon</button>
				</form>
			{/if}
			{#if canDeleteVoucher(data.voucher.status)}
				<form method="post" action="?/delete" use:enhance={confirmDelete}>
					<button class="danger-button" type="submit">Supprimer définitivement</button>
				</form>
			{/if}
		</div>
		{#if form?.message}<p class="error-text mt-4">{form.message}</p>{/if}
	</section>
</main>
