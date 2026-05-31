<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { copyText } from '$lib/clipboard';
	import VoucherCard from '$lib/components/VoucherCard.svelte';
	import { canDeleteVoucher, statusLabels } from '$lib/voucher';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let copied = $state(false);
	let managementCopied = $state(false);

	const eventLabels: Record<string, string> = {
		created: 'Bon créé',
		sent: 'Lien partagé',
		viewed: 'Bon consulté',
		accepted: 'Bon accepté',
		declined: 'Bon refusé',
		redeemed: 'Bon utilisé',
		cancelled: 'Bon annulé',
		attached: 'Rattaché à ton compte'
	};

	async function markSent() {
		await fetch('?/sent', { method: 'POST', body: new FormData() });
		await invalidateAll();
	}

	async function copyPublicLink() {
		await copyText(data.publicUrl);
		copied = true;
		await markSent();
		window.setTimeout(() => (copied = false), 1800);
	}

	async function copyManagementLink() {
		await copyText(data.managementUrl);
		managementCopied = true;
		window.setTimeout(() => (managementCopied = false), 1800);
	}

	async function share() {
		if (!navigator.share) {
			await copyPublicLink();
			return;
		}
		try {
			await navigator.share({
				title: `Un Bon Pour pour ${data.voucher.recipientName}`,
				text: `${data.voucher.senderName} t’a préparé un Bon Pour.`,
				url: data.publicUrl
			});
			await markSent();
		} catch {
			// Cancelling the native share sheet is expected.
		}
	}

	function confirmDelete({ cancel }: { cancel: () => void }) {
		if (!window.confirm('Supprimer définitivement ce bon ?')) cancel();
	}
</script>

<svelte:head>
	<title>Gérer le bon pour {data.voucher.recipientName} · BonPour</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
	<div class="mb-7">
		<p class="text-xs font-extrabold tracking-[0.24em] site-accent uppercase">Lien secret</p>
		<h1 class="mt-3 font-serif text-4xl font-semibold site-ink">
			{data.justCreated ? 'Ton bon est prêt à partir.' : 'Suivre ce bon.'}
		</h1>
		<p class="mt-3 max-w-xl text-sm leading-6 site-muted">
			Garde cette page précieusement : elle te permet de suivre et gérer ton bon.
		</p>
	</div>

	<div class="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<div>
			<VoucherCard {...data.voucher} />

			<section class="mt-6 rounded-3xl surface-card p-5 shadow-sm">
				<h2 class="font-serif text-2xl font-semibold">
					Partager avec {data.voucher.recipientName}
				</h2>
				<p class="mt-2 text-sm leading-6 site-muted">
					Envoie le lien public par SMS, WhatsApp ou la messagerie de ton choix.
				</p>
				<div class="mt-5 grid gap-3 sm:grid-cols-2">
					<button class="primary-button" type="button" onclick={share}>Partager le bon</button>
					<button class="secondary-button" type="button" onclick={copyPublicLink}>
						{copied ? 'Lien copié' : 'Copier le lien'}
					</button>
				</div>
				<div class="mt-4 rounded-2xl surface-muted p-3 text-xs leading-5 break-all site-muted">
					{data.publicUrl}
				</div>
			</section>

			<section class="mt-6 rounded-3xl surface-card p-5 shadow-sm">
				<h2 class="font-serif text-2xl font-semibold">Actions</h2>
				<p class="mt-2 text-sm leading-6 site-muted">
					État actuel : <strong>{statusLabels[data.displayStatus]}</strong>
				</p>
				<div class="mt-5 flex flex-wrap gap-3">
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
				{#if form?.message}
					<p class="error-text mt-4">{form.message}</p>
				{/if}
			</section>

			<section class="mt-6 rounded-3xl border site-border p-5">
				<h2 class="font-serif text-2xl font-semibold">Ton lien de gestion</h2>
				<p class="mt-2 text-sm leading-6 site-muted">
					Il est privé. Ne le partage pas avec le destinataire.
				</p>
				<button class="secondary-button mt-4" type="button" onclick={copyManagementLink}>
					{managementCopied ? 'Lien secret copié' : 'Copier mon lien secret'}
				</button>
			</section>
		</div>

		<aside class="space-y-6">
			<section class="rounded-3xl bg-[#26352d] p-5 text-[#fffaf0] shadow-sm">
				<p class="text-[0.65rem] font-extrabold tracking-[0.2em] text-[#e6987f] uppercase">
					Chronologie
				</p>
				<ol class="mt-5 space-y-4 border-l border-[#6b7c72] pl-4">
					{#each data.voucher.events as event (event.id)}
						<li>
							<p class="text-sm font-bold">{eventLabels[event.type] ?? event.type}</p>
							<time class="mt-1 block text-xs text-[#b8c5bd]">
								{new Intl.DateTimeFormat('fr-FR', {
									dateStyle: 'medium',
									timeStyle: 'short'
								}).format(new Date(event.createdAt))}
							</time>
						</li>
					{/each}
				</ol>
			</section>

			{#if !data.voucher.ownerId}
				<section class="rounded-3xl surface-card p-5 shadow-sm">
					<h2 class="font-serif text-xl font-semibold">Ne perds plus tes bons</h2>
					<p class="mt-2 text-sm leading-6 site-muted">
						Rattache ce bon à ton compte pour le retrouver facilement.
					</p>
					{#if data.user}
						<form method="post" action="?/attach" use:enhance class="mt-4">
							<button class="secondary-button w-full" type="submit">Rattacher à mon compte</button>
						</form>
					{:else}
						<a class="secondary-button mt-4 w-full" href={resolve('/connexion')}>Se connecter</a>
					{/if}
				</section>
			{/if}
		</aside>
	</div>
</main>
