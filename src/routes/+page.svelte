<script lang="ts">
	import { enhance } from '$app/forms';
	import MaterialSymbolPicker from '$lib/components/MaterialSymbolPicker.svelte';
	import VoucherCard from '$lib/components/VoucherCard.svelte';
	import { isMaterialSymbolName, type MaterialSymbolName } from '$lib/material-symbols';
	import {
		voucherFontLabels,
		voucherFonts,
		voucherThemeLabels,
		voucherThemes,
		type VoucherFont,
		type VoucherTheme,
		type VoucherThemeMode
	} from '$lib/voucher';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let senderName = $state(untrack(() => form?.values?.senderName ?? data.user?.name ?? ''));
	let recipientName = $state(untrack(() => form?.values?.recipientName ?? ''));
	let subject = $state(untrack(() => form?.values?.subject ?? ''));
	let quantity = $state(untrack(() => form?.values?.quantity ?? ''));
	let icon = $state<MaterialSymbolName | ''>(
		untrack(() => {
			const initialIcon = form?.values?.icon ?? '';
			return isMaterialSymbolName(initialIcon) ? initialIcon : '';
		})
	);
	let message = $state(untrack(() => form?.values?.message ?? ''));
	let theme = $state<VoucherTheme>(
		untrack(() => {
			const initialTheme = form?.values?.theme as VoucherTheme;
			return voucherThemes.includes(initialTheme) ? initialTheme : 'terracotta';
		})
	);
	let font = $state<VoucherFont>(
		untrack(() => {
			const initialFont = form?.values?.font as VoucherFont;
			return voucherFonts.includes(initialFont) ? initialFont : 'classic';
		})
	);
	let themeMode = $state<VoucherThemeMode>(
		untrack(() => {
			const initialThemeMode = form?.values?.themeMode;
			return initialThemeMode === 'light' || initialThemeMode === 'dark'
				? initialThemeMode
				: 'system';
		})
	);
	let hasExpiration = $state(untrack(() => form?.values?.hasExpiration ?? true));
	let expirationDate = $state(
		untrack(() => form?.values?.expirationDate ?? data.defaultExpirationDate)
	);
</script>

<svelte:head>
	<title>BonPour · Un cadeau en pixels</title>
</svelte:head>

<main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
	<div class="mb-9 max-w-2xl">
		<p class="text-xs font-extrabold tracking-[0.25em] site-accent uppercase">
			Un cadeau en pixels
		</p>
		<h1 class="mt-4 font-serif text-5xl leading-[0.98] font-semibold site-ink sm:text-6xl">
			Un joli bon,<br /><span class="site-accent italic">tout simplement.</span>
		</h1>
		<p class="mt-5 max-w-xl text-sm leading-6 site-muted sm:text-base sm:leading-7">
			Pour une blague, une attention ou une promesse. Crée ton bon, partage le lien et suis sa
			petite histoire.
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.88fr)] lg:gap-12">
		<form method="post" use:enhance class="space-y-5 rounded-3xl surface-card p-5 shadow-sm sm:p-7">
			<div class="grid gap-5 sm:grid-cols-2">
				<label>
					<span class="field-label">De la part de</span>
					<input
						class="field"
						name="senderName"
						placeholder="Camille"
						maxlength="60"
						required
						bind:value={senderName}
					/>
					{#if form?.errors?.senderName}<span class="error-text">{form.errors.senderName}</span
						>{/if}
				</label>
				<label>
					<span class="field-label">Pour</span>
					<input
						class="field"
						name="recipientName"
						placeholder="Alex"
						maxlength="60"
						required
						bind:value={recipientName}
					/>
					{#if form?.errors?.recipientName}<span class="error-text"
							>{form.errors.recipientName}</span
						>{/if}
				</label>
			</div>

			<label>
				<span class="field-label">Bon pour…</span>
				<input
					class="field"
					name="subject"
					placeholder="un brunch maison au lit"
					maxlength="120"
					required
					bind:value={subject}
				/>
				{#if form?.errors?.subject}<span class="error-text">{form.errors.subject}</span>{/if}
			</label>

			<div class="mt-4 grid gap-5 sm:grid-cols-[minmax(16rem,0.9fr)_1fr]">
				<div>
					<label class="field-label" for="quantity">Quantité</label>
					<input
						class="field"
						id="quantity"
						type="number"
						name="quantity"
						placeholder="1"
						min="1"
						max="999"
						bind:value={quantity}
					/>
					{#if form?.errors?.quantity}<span class="error-text">{form.errors.quantity}</span>{/if}
					<MaterialSymbolPicker bind:value={icon} />
					{#if form?.errors?.icon}<span class="error-text">{form.errors.icon}</span>{/if}
				</div>
				<label>
					<span class="field-label">Petit mot <span class="normal-case">(facultatif)</span></span>
					<textarea
						class="field min-h-24 resize-y"
						name="message"
						placeholder="À utiliser sans modération…"
						maxlength="280"
						bind:value={message}
					></textarea>
					{#if form?.errors?.message}<span class="error-text">{form.errors.message}</span>{/if}
				</label>
			</div>

			<fieldset>
				<legend class="field-label">Couleurs du bon</legend>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{#each voucherThemes as voucherTheme (voucherTheme)}
						<label
							class={`theme-choice palette-choice palette-${voucherTheme} cursor-pointer rounded-xl border px-3 py-3 text-center text-xs font-bold`}
						>
							<input
								class="sr-only"
								type="radio"
								name="theme"
								value={voucherTheme}
								bind:group={theme}
							/>
							<span class="mb-2 flex justify-center gap-1" aria-hidden="true">
								<span class="palette-dot palette-dot-main"></span>
								<span class="palette-dot palette-dot-accent"></span>
								<span class="palette-dot palette-dot-soft"></span>
							</span>
							{voucherThemeLabels[voucherTheme]}
						</label>
					{/each}
				</div>
				{#if form?.errors?.theme}<span class="error-text">{form.errors.theme}</span>{/if}
			</fieldset>

			<fieldset>
				<legend class="field-label">Police</legend>
				<div class="grid grid-cols-3 gap-2">
					{#each voucherFonts as voucherFont (voucherFont)}
						<label
							class={`theme-choice font-choice font-choice-${voucherFont} cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-bold`}
						>
							<input
								class="sr-only"
								type="radio"
								name="font"
								value={voucherFont}
								bind:group={font}
							/>
							{voucherFontLabels[voucherFont]}
						</label>
					{/each}
				</div>
				{#if form?.errors?.font}<span class="error-text">{form.errors.font}</span>{/if}
			</fieldset>

			<fieldset>
				<legend class="field-label">Apparence</legend>
				<div class="grid grid-cols-3 gap-2">
					{#each [{ value: 'system', label: 'Système' }, { value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] as mode (mode.value)}
						<label
							class="theme-choice cursor-pointer rounded-xl border px-3 py-3 text-center text-xs font-bold"
						>
							<input
								class="sr-only"
								type="radio"
								name="themeMode"
								value={mode.value}
								bind:group={themeMode}
							/>
							{mode.label}
						</label>
					{/each}
				</div>
				<p class="site-soft mt-2 text-xs">Système suit automatiquement le thème de l’appareil.</p>
				{#if form?.errors?.themeMode}<span class="error-text">{form.errors.themeMode}</span>{/if}
			</fieldset>

			<div class="rounded-2xl border site-border surface-muted p-4">
				<label class="flex items-center gap-3 text-sm font-semibold site-muted">
					<input
						class="rounded site-accent"
						type="checkbox"
						name="hasExpiration"
						bind:checked={hasExpiration}
					/>
					Ajouter une date de fin
				</label>
				{#if hasExpiration}
					<label class="mt-4 block">
						<span class="field-label">Valable jusqu’au</span>
						<input class="field" type="date" name="expirationDate" bind:value={expirationDate} />
						{#if form?.errors?.expirationDate}<span class="error-text"
								>{form.errors.expirationDate}</span
							>{/if}
					</label>
				{/if}
			</div>

			<button class="primary-button w-full" type="submit">Créer mon bon</button>
			<p class="text-center text-xs leading-5 site-soft">
				Pas besoin de compte. Un lien secret te permettra de suivre ce bon.
			</p>
		</form>

		<div class="lg:sticky lg:top-8 lg:self-start">
			<p
				class="mb-3 text-center text-[0.65rem] font-extrabold tracking-[0.2em] site-soft uppercase"
			>
				Aperçu en direct
			</p>
			<VoucherCard
				{senderName}
				{recipientName}
				{subject}
				quantity={quantity ? Number(quantity) : null}
				{icon}
				{message}
				{theme}
				{font}
				{themeMode}
				expiresAt={hasExpiration ? expirationDate : null}
				preview
			/>
		</div>
	</div>
</main>

<style>
	.font-choice-classic {
		font-family: Georgia, 'Times New Roman', serif;
	}

	.font-choice-script {
		font-family: 'Brush Script MT', 'Segoe Script', cursive;
		font-size: 1.15rem;
		font-weight: 400;
	}

	.font-choice-modern {
		font-family: Arial, Helvetica, sans-serif;
		letter-spacing: 0.04em;
	}
</style>
