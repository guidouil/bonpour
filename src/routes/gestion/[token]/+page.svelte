<script lang="ts">
	import VoucherManagement from '$lib/components/VoucherManagement.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Gérer le bon pour {data.voucher.recipientName} · BonPour</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<VoucherManagement {data} {form} />
