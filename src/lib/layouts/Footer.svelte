<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { IconCopyright } from '@tabler/icons-svelte';
	import { SITE_URL } from '$lib/consts';
	import { sanitizeUrl } from '$lib/utils';

	let year = $state(2025);
	let canonicalUrl = $state(sanitizeUrl(SITE_URL));

	onMount(() => {
		year = new SvelteDate().getFullYear();
		if (browser) {
			canonicalUrl = sanitizeUrl(window.location.href);
		}
	});
</script>

<footer class="border-t">
	<div
		class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-base sm:px-6"
	>
		<div class="flex">
			<IconCopyright size={16} class="content-center self-center" />&ensp;<span>{year}</span
			>&ensp;PG Tuning API
		</div>
		<div class="flex items-center gap-3">
			<span>v1</span>
			<span>·</span>
			<a class="hover:underline" href={`mailto:ops@${canonicalUrl}`}>ops@{canonicalUrl}</a>
		</div>
	</div>
</footer>
