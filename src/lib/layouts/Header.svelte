<script lang="ts">
	import { SITE_URL } from '$lib/consts';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteURL } from 'svelte/reactivity';
	import HeaderLarge from '$lib/layouts/HeaderLarge.svelte';
	import HeaderSmall from '$lib/layouts/HeaderSmall.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	let canonicalUrl = $state(SITE_URL);

	onMount(() => {
		if (browser) {
			const url = new SvelteURL(window.location.href);
			canonicalUrl = url.origin;
		}
	});
</script>

<header class="border-b">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
		<a href={`${canonicalUrl}/`}>
			<div class="flex items-center gap-2">
				<enhanced:img
					src="../../../static/elephant-2000x2000.png"
					alt="Outline of an elephant"
					width="48px"
					height="48px"
				/>
				<span class="text-2xl font-semibold">PG Tuning API</span>
			</div>
		</a>
		{#if innerWidth.current && innerWidth.current < 958}
			<!-- Small screen header -->
			<HeaderSmall />
		{:else}
			<!-- Large screen header -->
			<HeaderLarge />
		{/if}
	</div>
</header>
