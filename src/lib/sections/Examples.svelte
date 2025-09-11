<script lang="ts">
	import { Code } from '$lib/components/ui';
	import { ansible } from '$lib/data/ansible';
	import { SITE_URL } from '$lib/consts';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteURL } from 'svelte/reactivity';

	let canonicalUrl = $state(SITE_URL);

	onMount(() => {
		if (browser) {
			const url = new SvelteURL(window.location.href);
			canonicalUrl = url.origin;
		}
	});
</script>

<section id="examples" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-14">
	<h2 class="text-2xl font-bold">Examples</h2>

	<Code
		title="OLTP on SSD (32 GB, 8 vCPU)"
		class="my-8 overflow-x-auto"
		code={`curl -sS "${canonicalUrl}/api/v1/tune?memory_gb=32&cpus=8&storage_type=ssd&workload=oltp&num_disks=1&num_replicas=0&db_size_gb=1&version=17&os=linux&backup_method=pg_dump"`}
		lang="bash"
	/>
	<Code
		title="OLTP on Network Storage (128 GB, 24 vCPU)"
		class="my-8 overflow-x-auto"
		code={`curl -sS "${canonicalUrl}/api/v1/tune?memory_gb=32&cpus=8&storage_type=ssd&workload=oltp&num_disks=1&num_replicas=0&db_size_gb=1&version=17&os=linux&backup_method=pg_dump"`}
		lang="bash"
	/>

	<Code class="mt-8" title="Ansible snippet" code={ansible} lang="yaml" />
</section>
