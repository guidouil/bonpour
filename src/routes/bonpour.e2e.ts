import { expect, test } from '@playwright/test';

async function createAnonymousVoucher(
	page: import('@playwright/test').Page,
	subject: string,
	themeMode: 'Système' | 'Clair' | 'Sombre' = 'Système',
	theme: 'Terracotta' | 'Océan' | 'Lavande' | 'Rose' = 'Terracotta'
) {
	await page.goto('/');
	await page.getByLabel('De la part de', { exact: true }).fill('Camille');
	await page.getByLabel('Pour', { exact: true }).fill('Alex');
	await page.getByLabel('Bon pour…', { exact: true }).fill(subject);
	await page.getByLabel('Quantité', { exact: true }).fill('2');
	await page
		.getByLabel('Petit mot (facultatif)', { exact: true })
		.fill('À utiliser dès dimanche matin.');
	await page.getByText(theme, { exact: true }).click();
	await page.getByText(themeMode, { exact: true }).click();
	await page.getByRole('button', { name: 'Créer mon bon' }).click();
	await expect(page).toHaveURL(/\/gestion\/.+\?cree=1$/);

	return {
		managementUrl: page.url().replace('?cree=1', ''),
		publicUrl: (await page.locator('.break-all').textContent())?.trim() ?? ''
	};
}

test('follows the OS theme by default and allows a voucher override', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');

	await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(23, 35, 31)');
	await expect(page.getByLabel('Système', { exact: true })).toBeChecked();
	await expect(page.locator('.voucher-card')).toHaveCSS('background-color', 'rgb(38, 53, 45)');

	await page.getByText('Océan', { exact: true }).click();
	await expect(page.locator('.voucher-card')).toHaveCSS('background-color', 'rgb(23, 50, 56)');

	await page.getByText('Clair', { exact: true }).click();
	await expect(page.locator('.voucher-card')).toHaveCSS('background-color', 'rgb(242, 251, 250)');

	await page.getByText('Sombre', { exact: true }).click();
	await expect(page.locator('.voucher-card')).toHaveCSS('background-color', 'rgb(23, 50, 56)');
});

test('creates, shares, accepts and redeems an anonymous voucher', async ({ page, request }) => {
	const voucher = await createAnonymousVoucher(page, 'un brunch maison au lit', 'Sombre', 'Océan');

	await page.getByRole('button', { name: 'Copier le lien' }).click();
	await expect(page.getByText('État actuel :')).toContainText('Envoyé');

	const ogImage = await request.get(`${voucher.publicUrl}/og.png`);
	expect(ogImage.status()).toBe(200);
	expect(ogImage.headers()['content-type']).toBe('image/png');
	expect((await ogImage.body()).subarray(0, 8)).toEqual(
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
	);

	await page.goto(voucher.publicUrl);
	await expect(page.locator('.voucher-card')).toHaveCSS('background-color', 'rgb(23, 50, 56)');
	await page.getByRole('button', { name: 'Accepter' }).click();
	await expect(page.getByText('Accepté. Il ne reste plus qu’à en profiter.')).toBeVisible();

	await page.goto(voucher.managementUrl);
	await page.getByRole('button', { name: 'Marquer comme utilisé' }).click();
	await expect(page.getByText('État actuel :')).toContainText('Utilisé');
});

test('attaches an anonymous voucher to an optional account', async ({ page }) => {
	const subject = `un café de test ${Date.now()}`;
	const voucher = await createAnonymousVoucher(page, subject);

	await page.goto('/connexion');
	await page.getByRole('button', { name: 'Inscription' }).click();
	await page.getByLabel('Prénom ou nom', { exact: true }).fill('Camille Test');
	await page.getByLabel('Email', { exact: true }).fill(`camille.${Date.now()}@example.test`);
	await page.getByLabel('Mot de passe', { exact: true }).fill('bonpour-test-2026');
	await page.getByRole('button', { name: 'Créer mon compte' }).click();
	await expect(page).toHaveURL('/mes-bons');

	await page.goto('/');
	await expect(page.getByLabel('De la part de', { exact: true })).toHaveValue('Camille Test');

	await page.goto('/mes-bons');
	await page.getByLabel('Mon nom', { exact: true }).fill('Camille Profil');
	await page.getByRole('button', { name: 'Enregistrer' }).click();
	await expect(page.getByText('Nom modifié.')).toBeVisible();

	await page.goto('/');
	await expect(page.getByLabel('De la part de', { exact: true })).toHaveValue('Camille Profil');

	await page.goto(voucher.managementUrl);
	await page.getByRole('button', { name: 'Rattacher à mon compte' }).click();
	await expect(page.getByRole('button', { name: 'Rattacher à mon compte' })).not.toBeVisible();

	await page.goto('/mes-bons');
	await expect(page.getByText(subject)).toBeVisible();

	await page
		.getByRole('article')
		.filter({ hasText: subject })
		.getByRole('link', { name: 'Voir et gérer ce bon' })
		.click();
	await page.getByRole('button', { name: 'Annuler le bon' }).click();
	page.on('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Supprimer définitivement' }).click();
	await expect(page).toHaveURL('/mes-bons');
	await expect(page.getByText(subject)).not.toBeVisible();
});

test('deletes an anonymous voucher only after cancellation', async ({ page }) => {
	await createAnonymousVoucher(page, `un bon à supprimer ${Date.now()}`);

	const activeDeleteStatus = await page.evaluate(async () => {
		const response = await fetch('?/delete', {
			method: 'POST',
			body: new FormData(),
			headers: { 'x-sveltekit-action': 'true' }
		});
		return JSON.parse(await response.text()).status;
	});
	expect(activeDeleteStatus).toBe(409);
	await expect(page.getByRole('button', { name: 'Supprimer définitivement' })).not.toBeVisible();

	await page.getByRole('button', { name: 'Annuler le bon' }).click();
	await expect(page.getByText('État actuel :')).toContainText('Annulé');

	page.on('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Supprimer définitivement' }).click();
	await expect(page).toHaveURL('/');
});
