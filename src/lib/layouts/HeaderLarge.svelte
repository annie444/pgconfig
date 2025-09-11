<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { IconBrandGithubFilled, IconSunFilled, IconMoonFilled } from '@tabler/icons-svelte';
	import { SITE_URL } from '$lib/consts';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteURL } from 'svelte/reactivity';
	import { toggleMode, mode } from 'mode-watcher';

	let canonicalUrl = $state(SITE_URL);

	onMount(() => {
		if (browser) {
			const url = new SvelteURL(window.location.href);
			canonicalUrl = url.origin;
		}
	});
</script>

<nav class="text-base">
	<Button variant="ghost" href={`${canonicalUrl}/#quickstart`}>Quickstart</Button>
	<Button variant="ghost" href={`${canonicalUrl}/#quickstart`}>Quickstart</Button>
	<Button variant="ghost" href={`${canonicalUrl}/#endpoint`}>Endpoint</Button>
	<Button variant="ghost" href={`${canonicalUrl}/#schema`}>Schema</Button>
	<Button variant="ghost" href={`${canonicalUrl}/#examples`}>Examples</Button>
	<Button variant="ghost" href={`${canonicalUrl}/#status`}>Status & Errors</Button>
	<Button
		variant="secondary"
		class="rouded-full size-8"
		size="icon"
		href="https://github.com/annie444/pgconfig"><IconBrandGithubFilled /></Button
	>
	<Button variant="secondary" class="rouded-full size-8" size="icon" onclick={() => toggleMode()}>
		{#if mode.current === 'dark'}
			<IconSunFilled />
		{:else}
			<IconMoonFilled />
		{/if}
	</Button>
</nav>
