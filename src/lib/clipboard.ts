export async function copyText(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return;
	} catch {
		// Older or embedded browsers may not expose the Clipboard API.
	}

	const input = document.createElement('textarea');
	input.value = text;
	input.setAttribute('readonly', '');
	input.style.position = 'fixed';
	input.style.opacity = '0';
	document.body.append(input);
	input.select();
	document.execCommand('copy');
	input.remove();
}
