<script lang="ts">
	import { Button, Sheet } from '$lib/components/ui';
	import {
		IconBrandGithubFilled,
		IconSunFilled,
		IconMoonFilled,
		IconMenu2
	} from '@tabler/icons-svelte';
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
	<Sheet.Root>
		<Sheet.Trigger
			><Button variant="secondary" class="rouded-full size-8" size="icon"><IconMenu2 /></Button
			></Sheet.Trigger
		>
		<Sheet.Content class="w-[150px]">
			<div class="m-4 mt-10 flex flex-col items-center gap-2">
				<Button variant="ghost" href={`${canonicalUrl}/#quickstart`}>Quickstart</Button>
				<Button variant="ghost" href={`${canonicalUrl}/#quickstart`}>Quickstart</Button>
				<Button variant="ghost" href={`${canonicalUrl}/#endpoint`}>Endpoint</Button>
				<Button variant="ghost" href={`${canonicalUrl}/#schema`}>Schema</Button>
				<Button variant="ghost" href={`${canonicalUrl}/#examples`}>Examples</Button>
				<Button variant="ghost" href={`${canonicalUrl}/#status`}>Status & Errors</Button>
			</div>
		</Sheet.Content>
	</Sheet.Root>
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
