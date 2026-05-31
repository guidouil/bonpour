<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { statusLabels } from '$lib/voucher';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Mes bons · BonPour</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="text-xs font-extrabold tracking-[0.24em] site-accent uppercase">
				Bonjour {data.user.name}
			</p>
			<h1 class="mt-3 font-serif text-5xl font-semibold site-ink">Mes bons.</h1>
		</div>
		<a class="primary-button" href={resolve('/')}>Créer un bon</a>
	</div>

	<form
		method="post"
		action="?/updateName"
		use:enhance
		class="mt-8 rounded-3xl surface-card p-5 shadow-sm sm:flex sm:items-end sm:gap-4"
	>
		<label class="block flex-1">
			<span class="field-label">Mon nom</span>
			<input
				class="field"
				name="name"
				autocomplete="name"
				value={form?.name ?? data.user.name}
				maxlength="60"
				required
			/>
		</label>
		<button class="secondary-button mt-4 w-full sm:mt-0 sm:w-auto" type="submit">
			Enregistrer
		</button>
		{#if form?.message}<p class="error-text sm:mb-3">{form.message}</p>{/if}
		{#if form?.success}<p class="mt-3 text-xs site-accent sm:mb-3">Nom modifié.</p>{/if}
	</form>

	{#if data.vouchers.length}
		<div class="mt-8 grid gap-4 sm:grid-cols-2">
			{#each data.vouchers as voucher (voucher.id)}
				<article class="rounded-3xl border site-border surface-card p-5 shadow-sm">
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="text-[0.62rem] font-extrabold tracking-[0.18em] site-accent uppercase">
								Pour {voucher.recipientName}
							</p>
							<h2 class="mt-3 font-serif text-2xl leading-tight font-semibold">
								{voucher.subject}
							</h2>
						</div>
						<span
							class="rounded-full surface-muted px-3 py-1 text-[0.6rem] font-extrabold tracking-[0.12em] site-muted uppercase"
						>
							{statusLabels[voucher.displayStatus]}
						</span>
					</div>
					<p class="mt-4 text-xs site-soft">
						Créé le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
							new Date(voucher.createdAt)
						)}
					</p>
					<p class="mt-4 text-xs leading-5 site-soft">
						<a
							class="font-extrabold site-accent hover:underline"
							href={resolve(`/mes-bons/${voucher.id}`)}
						>
							Voir et gérer ce bon
						</a>
					</p>
				</article>
			{/each}
		</div>
	{:else}
		<div class="mt-8 rounded-3xl border border-dashed site-border p-8 text-center">
			<h2 class="font-serif text-2xl font-semibold">Aucun bon pour l’instant.</h2>
			<p class="mt-2 text-sm site-muted">Ta prochaine petite attention apparaîtra ici.</p>
		</div>
	{/if}
</main>
