<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let mode = $state<'signin' | 'signup'>('signin');
</script>

<svelte:head>
	<title>Se connecter · BonPour</title>
</svelte:head>

<main class="mx-auto max-w-md px-4 py-12 sm:py-20">
	<div class="rounded-3xl surface-card p-6 shadow-sm sm:p-8">
		<p class="text-xs font-extrabold tracking-[0.24em] site-accent uppercase">Compte facultatif</p>
		<h1 class="mt-3 font-serif text-4xl font-semibold site-ink">
			{mode === 'signin' ? 'Retrouve tes bons.' : 'Garde tes bons au chaud.'}
		</h1>
		<p class="mt-3 text-sm leading-6 site-muted">
			La création reste libre. Le compte sert simplement à centraliser ton historique.
		</p>

		<div
			class="mt-6 grid grid-cols-2 rounded-full surface-muted p-1 text-xs font-extrabold tracking-[0.12em] uppercase"
		>
			<button
				class:active-tab={mode === 'signin'}
				class="rounded-full px-3 py-3 transition"
				type="button"
				onclick={() => (mode = 'signin')}>Connexion</button
			>
			<button
				class:active-tab={mode === 'signup'}
				class="rounded-full px-3 py-3 transition"
				type="button"
				onclick={() => (mode = 'signup')}>Inscription</button
			>
		</div>

		<form
			method="post"
			action={mode === 'signin' ? '?/signIn' : '?/signUp'}
			use:enhance
			class="mt-6 space-y-4"
		>
			{#if mode === 'signup'}
				<label>
					<span class="field-label">Prénom ou nom</span>
					<input class="field" name="name" autocomplete="name" required />
				</label>
			{/if}
			<label>
				<span class="field-label mt-2">Email</span>
				<input class="field" type="email" name="email" autocomplete="email" required />
			</label>
			<label>
				<span class="field-label mt-2">Mot de passe</span>
				<input
					class="field"
					type="password"
					name="password"
					autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
					minlength="8"
					required
				/>
			</label>
			{#if form?.message}<p class="error-text">{form.message}</p>{/if}
			<button class="primary-button w-full mt-4" type="submit">
				{mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
			</button>
		</form>
	</div>
</main>
