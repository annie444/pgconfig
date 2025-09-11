<script lang="ts">
	import '@fontsource/jetbrains-mono';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import Header from '$lib/layouts/Header.svelte';
	import Footer from '$lib/layouts/Footer.svelte';
	import Head from '$lib/layouts/Head.svelte';

	let { children } = $props();
</script>

<Head />
<ModeWatcher />
<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<Footer />
</div>
