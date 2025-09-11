<script lang="ts">
	import { SITE_URL } from '$lib/consts';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteURL } from 'svelte/reactivity';
	import { asset } from '$app/paths';

	let canonicalUrl = $state(SITE_URL);

	onMount(() => {
		if (browser) {
			const url = new SvelteURL(window.location.href);
			canonicalUrl = url.origin;
		}
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={asset('/elephant-192x192.png')} />
	<title>PostgreSQL Configuration API</title>
	<meta
		name="description"
		content="A basic JSON API for generating a PostgreSQL configuration. Specifically built for use with configuration management systems."
	/>
	<meta name="robots" content="all" />
	<meta
		name="keywords"
		content="api, sysadmin, postgres, configuration management, postgresql, ansible, terraform, salt"
	/>
	<meta property="og:locale" content="en_US" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="PostgreSQL Configuration API" />
	<meta property="og:description" content="A JSON API for generating a PostgreSQL configuration." />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content="PostgreSQL Configuration API" />
	<meta property="og:image" content={asset('/elephant-2000x2000.png')} />
	<meta property="og:image:secure_url" content={asset('/elephant-2000x2000.png')} />
	<meta property="og:image:width" content="2000" />
	<meta property="og:image:heigth" content="2000" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="ASCII art of an elephant" />
</svelte:head>
