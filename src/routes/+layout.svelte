<script lang="ts">
	import './layout.css';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	let openGraphUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived(new URL(favicon, page.url.origin).href);
	let defaultOgImageUrl = $derived(new URL(asset('/og-default.png'), page.url.origin).href);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="Créez et partagez un joli Bon Pour en quelques secondes." />
	<meta property="og:url" content={openGraphUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:logo" content={logoUrl} />
	{#if page.route.id !== '/b/[slug]'}
		<meta property="og:image" content={defaultOgImageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content="BonPour · Un joli bon, tout simplement." />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={defaultOgImageUrl} />
	{/if}
</svelte:head>

<header class="site-header border-b backdrop-blur">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
		<a class="font-serif text-xl font-bold tracking-tight site-ink" href={resolve('/')}>
			Bon<span class="site-accent">Pour</span>
		</a>
		<nav class="flex items-center gap-4 text-xs font-bold tracking-[0.12em] site-muted uppercase">
			{#if data.user}
				<a class="hover-site-accent transition" href={resolve('/mes-bons')}>Mes bons</a>
				{#if data.isAdmin}
					<a class="hover-site-accent transition" href={resolve('/admin')}>Statistiques</a>
				{/if}
				<form action="/connexion?/signOut" method="post">
					<button class="hover-site-accent transition" type="submit">Quitter</button>
				</form>
			{:else}
				<a class="hover-site-accent transition" href={resolve('/connexion')}>Se connecter</a>
			{/if}
		</nav>
	</div>
</header>

{@render children()}

<footer class="px-4 py-8 text-center text-xs tracking-[0.08em] site-soft uppercase">
	BonPour · des cadeaux en pixels
</footer>
