<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import VoucherCard from '$lib/components/VoucherCard.svelte';
	import { statusLabels } from '$lib/voucher';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	onMount(() => {
		void fetch(`/b/${data.voucher.publicSlug}/view`, { method: 'POST' });
	});
</script>

<svelte:head>
	<title>Un Bon Pour pour {data.voucher.recipientName} · BonPour</title>
	<meta name="robots" content="noindex,nofollow" />
	<meta property="og:title" content="Un Bon Pour pour {data.voucher.recipientName}" />
	<meta property="og:description" content="{data.voucher.senderName} a pensé à toi." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={data.ogImageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-10 sm:py-16">
	<div class="mb-6 text-center">
		<p class="text-xs font-extrabold tracking-[0.24em] site-accent uppercase">
			Une attention pour toi
		</p>
		<h1 class="mt-3 font-serif text-4xl font-semibold site-ink">
			{data.voucher.recipientName}, tu as reçu un bon.
		</h1>
	</div>

	<VoucherCard {...data.voucher} />

	<section class="mt-7 rounded-3xl surface-card p-5 text-center shadow-sm">
		<p class="text-xs font-extrabold tracking-[0.18em] site-soft uppercase">État du bon</p>
		<p class="mt-2 font-serif text-2xl font-semibold site-ink">
			{statusLabels[data.displayStatus]}
		</p>

		{#if ['created', 'sent', 'viewed'].includes(data.displayStatus)}
			<p class="mt-3 text-sm leading-6 site-muted">
				Tu peux répondre maintenant. Ton choix sera transmis à {data.voucher.senderName}.
			</p>
			<form method="post" action="?/respond" use:enhance class="mt-5 grid gap-3 sm:grid-cols-2">
				<button class="primary-button" name="response" value="accepted" type="submit">
					Accepter
				</button>
				<button class="secondary-button" name="response" value="declined" type="submit">
					Refuser
				</button>
			</form>
		{:else if data.displayStatus === 'accepted'}
			<p class="mt-3 text-sm leading-6 site-muted">Accepté. Il ne reste plus qu’à en profiter.</p>
		{:else if data.displayStatus === 'redeemed'}
			<p class="mt-3 text-sm leading-6 site-muted">Ce bon a été utilisé. Mission accomplie.</p>
		{:else if data.displayStatus === 'declined'}
			<p class="mt-3 text-sm leading-6 site-muted">Ce bon a été refusé.</p>
		{:else if data.displayStatus === 'cancelled'}
			<p class="mt-3 text-sm leading-6 site-muted">Ce bon a été annulé.</p>
		{:else}
			<p class="mt-3 text-sm leading-6 site-muted">Ce bon est arrivé à expiration.</p>
		{/if}

		{#if form?.message}
			<p class="error-text mt-4">{form.message}</p>
		{/if}
	</section>

	<p class="mt-8 text-center text-xs tracking-[0.1em] site-soft uppercase">
		Une idée à partager ?
		<a class="font-extrabold site-accent hover:underline" href={resolve('/')}
			>Créer un bon à mon tour</a
		>
	</p>
</main>
