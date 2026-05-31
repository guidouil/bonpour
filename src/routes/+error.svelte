<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Une page s’est égarée · BonPour</title>
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-24 text-center">
	<p class="text-xs font-extrabold tracking-[0.25em] site-accent uppercase">{page.status}</p>
	<h1 class="mt-4 font-serif text-5xl font-semibold site-ink">Ce bon reste introuvable.</h1>
	<p class="mt-5 text-sm leading-6 site-muted">{page.error?.message ?? 'Page introuvable'}</p>
	<a class="primary-button mt-8" href={resolve('/')}>Créer un nouveau bon</a>
</main>
