<script lang="ts">
	import { statusLabels, type VoucherStatus } from '$lib/voucher';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const actionLabels: Record<string, string> = {
		created: 'Bon créé',
		sent: 'Lien partagé',
		viewed: 'Bon consulté',
		accepted: 'Bon accepté',
		declined: 'Bon refusé',
		redeemed: 'Bon utilisé',
		cancelled: 'Bon annulé',
		attached: 'Bon rattaché'
	};
	const sourceLabels: Record<string, string> = {
		sender: 'émetteur',
		recipient: 'destinataire'
	};
	const numberFormat = new Intl.NumberFormat('fr-FR');
	const shortDateFormat = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });
	const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
	const maxActivity = $derived(Math.max(...data.dashboard.activity.map((item) => item.count), 1));
	const maxStatus = $derived(Math.max(...data.dashboard.statuses.map((item) => item.count), 1));
</script>

<svelte:head>
	<title>Statistiques · BonPour</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
	<div>
		<p class="text-xs font-extrabold tracking-[0.24em] site-accent uppercase">Administration</p>
		<h1 class="mt-3 font-serif text-5xl font-semibold site-ink">Statistiques.</h1>
		<p class="mt-4 max-w-2xl text-sm leading-6 site-muted">
			Une vue globale de la création des bons et des actions réalisées sur le site.
		</p>
	</div>

	<section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicateurs clés">
		<div class="metric-card">
			<p class="metric-label">Utilisateurs</p>
			<p class="metric-value">{numberFormat.format(data.dashboard.kpis.users)}</p>
		</div>
		<div class="metric-card">
			<p class="metric-label">Bons créés</p>
			<p class="metric-value">{numberFormat.format(data.dashboard.kpis.vouchers)}</p>
			<p class="metric-detail">+{data.dashboard.kpis.lastSevenDays} sur 7 jours</p>
		</div>
		<div class="metric-card">
			<p class="metric-label">Consultations</p>
			<p class="metric-value">{numberFormat.format(data.dashboard.kpis.views)}</p>
		</div>
		<div class="metric-card">
			<p class="metric-label">Taux d’acceptation</p>
			<p class="metric-value">{data.dashboard.kpis.acceptanceRate}%</p>
			<p class="metric-detail">{data.dashboard.kpis.redeemed} bons utilisés</p>
		</div>
	</section>

	<div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
		<section class="panel">
			<div class="flex items-end justify-between gap-4">
				<div>
					<p class="metric-label">Activité quotidienne</p>
					<h2 class="mt-2 font-serif text-2xl font-semibold">Actions sur les 14 derniers jours</h2>
				</div>
				<p class="text-xs site-soft">{numberFormat.format(data.dashboard.kpis.events)} au total</p>
			</div>
			<div class="mt-8 flex h-56 items-end gap-2" aria-label="Graphique des actions quotidiennes">
				{#each data.dashboard.activity as item (item.day)}
					<div class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
						<span class="text-[0.62rem] font-bold site-muted">{item.count}</span>
						<div
							class="activity-bar w-full rounded-t-lg"
							style={`height: ${Math.max((item.count / maxActivity) * 100, 3)}%`}
							title={`${item.count} actions le ${item.day}`}
						></div>
						<span class="text-[0.56rem] site-soft"
							>{shortDateFormat.format(new Date(item.day))}</span
						>
					</div>
				{/each}
			</div>
		</section>

		<section class="panel">
			<p class="metric-label">Cycle de vie</p>
			<h2 class="mt-2 font-serif text-2xl font-semibold">État des bons</h2>
			<div class="mt-6 space-y-4">
				{#each data.dashboard.statuses as item (item.status)}
					<div>
						<div class="flex justify-between gap-4 text-xs font-bold">
							<span>{statusLabels[item.status as VoucherStatus]}</span>
							<span>{item.count}</span>
						</div>
						<div class="mt-2 h-2 overflow-hidden rounded-full surface-muted">
							<div
								class="status-bar h-full rounded-full"
								style={`width: ${(item.count / maxStatus) * 100}%`}
							></div>
						</div>
					</div>
				{:else}
					<p class="text-sm site-muted">Aucun bon créé pour le moment.</p>
				{/each}
			</div>
		</section>
	</div>

	<div class="mt-6 grid gap-6 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]">
		<section class="panel">
			<p class="metric-label">Actions d’usage</p>
			<h2 class="mt-2 font-serif text-2xl font-semibold">Volume par action</h2>
			<div class="mt-5 divide-y site-divide">
				{#each data.dashboard.actions as action (action.type)}
					<div class="flex items-center justify-between gap-4 py-3 text-sm">
						<span class="site-muted">{actionLabels[action.type] ?? action.type}</span>
						<span class="font-extrabold site-ink">{action.count}</span>
					</div>
				{:else}
					<p class="py-3 text-sm site-muted">Aucune action enregistrée.</p>
				{/each}
			</div>
		</section>

		<section class="panel">
			<p class="metric-label">Dernières actions</p>
			<h2 class="mt-2 font-serif text-2xl font-semibold">Journal d’activité</h2>
			<div class="mt-5 divide-y site-divide">
				{#each data.dashboard.recentActions as action (action.id)}
					<div class="py-3 sm:flex sm:items-center sm:justify-between sm:gap-5">
						<div>
							<p class="text-sm font-bold site-ink">
								{actionLabels[action.type] ?? action.type}
								<span class="font-normal site-soft"
									>par {sourceLabels[action.source] ?? action.source}</span
								>
							</p>
							<p class="mt-1 text-xs site-muted">{action.subject} · pour {action.recipientName}</p>
						</div>
						<time
							class="mt-2 block shrink-0 text-xs site-soft sm:mt-0"
							datetime={action.createdAt.toISOString()}
						>
							{dateTimeFormat.format(action.createdAt)}
						</time>
					</div>
				{:else}
					<p class="py-3 text-sm site-muted">Aucune action enregistrée.</p>
				{/each}
			</div>
		</section>
	</div>
</main>

<style>
	.metric-card,
	.panel {
		border: 1px solid var(--border-soft);
		border-radius: 1.5rem;
		background-color: color-mix(in srgb, var(--surface) 82%, transparent);
		box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
	}

	.metric-card {
		padding: 1.25rem;
	}

	.panel {
		padding: 1.5rem;
	}

	.metric-label {
		color: var(--ink-soft);
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.metric-value {
		margin-top: 0.65rem;
		color: var(--ink);
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 2.5rem;
		font-weight: 600;
		line-height: 1;
	}

	.metric-detail {
		margin-top: 0.65rem;
		color: var(--ink-soft);
		font-size: 0.72rem;
	}

	.activity-bar,
	.status-bar {
		background-color: var(--accent);
	}

	.site-divide {
		border-color: var(--border-soft);
	}
</style>
