<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconCopy, IconCopyCheck, IconCircleFilled } from '@tabler/icons-svelte';
	import Highlight from 'svelte-highlight';
	import { languages, type Props } from '$lib/components/ui/code';
	import { cn } from '$lib/utils';
	import { mode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';

	let { code = $bindable(), lang = 'json', class: customClass, ...restProps }: Props = $props();

	let language = $derived(languages[lang]);

	let theme = $derived<'light' | 'dark'>(mode.current === 'dark' ? 'dark' : 'light');

	onMount(() => {
		// Load the initial theme
		let currentLink = document.getElementById('svelte-highlight-theme') as HTMLLinkElement | null;
		if (currentLink) {
			const url = new URL(currentLink.href);
			if (
				(theme === 'dark' && url.pathname.endsWith('tokyo-night-dark.css')) ||
				(theme === 'light' && url.pathname.endsWith('stackoverflow-light.css'))
			) {
				// The correct theme is already loaded
				return;
			}
		}
		let link = document.createElement('link');
		link.rel = 'stylesheet';
		link.id = 'svelte-highlight-theme';
		link.href =
			theme === 'dark' ? asset('/tokyo-night-dark.css') : asset('/stackoverflow-light.css');
		document.head.appendChild(link);
	});

	$effect(() => {
		// Remove the old link element if it exists
		let oldLink = document.getElementById('svelte-highlight-theme') as HTMLLinkElement | null;
		if (oldLink) {
			const url = new URL(oldLink.href);
			if (
				(theme === 'dark' && url.pathname.endsWith('tokyo-night-dark.css')) ||
				(theme === 'light' && url.pathname.endsWith('stackoverflow-light.css'))
			) {
				// The correct theme is already loaded
				return;
			} else {
				// Remove the old link element
				oldLink.remove();
			}
		}
		// Recreate the link element to force the browser to reload the stylesheet
		let link = document.createElement('link');
		link.rel = 'stylesheet';
		link.id = 'svelte-highlight-theme';
		link.href =
			theme === 'dark' ? asset('/tokyo-night-dark.css') : asset('/stackoverflow-light.css');
		document.head.appendChild(link);
	});

	let copied = $state(false);
	$effect(() => {
		if (copied) {
			const timeout = setTimeout(() => {
				copied = false;
			}, 2000);
			return () => clearTimeout(timeout);
		}
	});

	const handleCopy = () => {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
		});
	};
</script>

<div data-slot="code" class={cn('relative', 'rounded', 'rounded-md', customClass)}>
	<div
		class="grid h-[27px] grid-cols-3 items-center justify-center rounded-t-md bg-gray-900/10 dark:bg-gray-500/10"
	>
		<div class="inline-flex gap-1">
			<IconCircleFilled color="#FF605C" size={15} class="my-auto ml-3 inline-block" />
			<IconCircleFilled color="#FFBD44" size={15} class="my-auto inline-block" />
			<IconCircleFilled color="#00CA4E" size={15} class="my-auto inline-block" />
		</div>
		{#if restProps.title}
			<div class="overflow-x-visible text-center text-base text-nowrap">
				{restProps.title}
			</div>
		{/if}
		<div></div>
	</div>
	<Highlight {language} {code} {...restProps} class="rounded rounded-b-md" />
	<Button
		variant="outline"
		size="icon"
		class="absolute top-8 right-2 opacity-0 transition-opacity hover:opacity-100"
		onclick={handleCopy}
	>
		{#if copied}
			<IconCopyCheck color="#008000" />
		{:else}
			<IconCopy />
		{/if}
	</Button>
</div>
