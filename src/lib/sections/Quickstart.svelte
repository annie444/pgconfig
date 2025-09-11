<script lang="ts">
	import { Code, Label, Input, Card, Select } from '$lib/components/ui';
	import { SITE_URL } from '$lib/consts';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';

	let canonicalUrl = $state(SITE_URL);

	onMount(() => {
		if (browser) {
			const url = new SvelteURL(window.location.href);
			canonicalUrl = url.origin;
		}
	});

	let version = $state<number | undefined>(undefined);
	let os = $state<string | undefined>(undefined);
	let memoryGb = $state<number | undefined>(undefined);
	let cpus = $state<number | undefined>(undefined);
	let numDisks = $state<number | undefined>(undefined);
	let numReplicas = $state<number | undefined>(undefined);
	let dbSizeGb = $state<number | undefined>(undefined);
	let storageType = $state<string | undefined>(undefined);
	let backupMethod = $state<string | undefined>(undefined);
	let workload = $state<string | undefined>(undefined);
	let maxConn = $state<number | undefined>(undefined);

	const osOptions = ['linux', 'macos', 'windows'];
	const storageOptions = ['sdd', 'hdd', 'network'];
	const backupOptions = ['pg_dump', 'pg_basebackup', 'pglogical'];
	const workloadOptions = ['webapp', 'oltp', 'warehouse', 'desktop', 'mixed'];

	let urlOut = $derived.by(() => {
		const params = new SvelteURLSearchParams();
		if (version) params.append('version', version.toString());
		if (os) params.append('os', os);
		if (memoryGb) params.append('memory_gb', memoryGb.toString());
		if (cpus) params.append('cpus', cpus.toString());
		if (numDisks) params.append('num_disks', numDisks.toString());
		if (numReplicas) params.append('num_replicas', numReplicas.toString());
		if (dbSizeGb) params.append('db_size_gb', dbSizeGb.toString());
		if (storageType) params.append('storage_type', storageType);
		if (backupMethod) params.append('backup_method', backupMethod);
		if (workload) params.append('workload', workload);
		if (maxConn) params.append('max_conn', maxConn.toString());
		const paramsString = params.toString();
		if (paramsString === '') return `${canonicalUrl}/v1/tune`;
		return `${canonicalUrl}/api/v1/tune?${paramsString}`;
	});

	let curlOut = $derived(`curl -sS "${urlOut}"`);
	let wgetOut = $derived(`wget -qO- "${urlOut}"`);
</script>

<section id="quickstart" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-14">
	<h2 class="text-2xl font-bold">Quickstart</h2>
	<p class="mt-2">
		Fill in your server profile and copy the URL or curl command. The page won’t make network
		calls—no CORS headaches.
	</p>

	<div class="mt-6 grid gap-6 lg:grid-cols-3">
		<Card.Root class=" rounded-xl border lg:col-span-1">
			<Card.Content class="grid gap-6">
				<div class="grid gap-3 md:mt-3 md:grid-cols-2">
					<div>
						<Label for="version" class="block text-base font-medium">version</Label>
						<Input
							id="version"
							type="number"
							min="4"
							max="18"
							class="mt-1 w-full rounded-md"
							placeholder="e.g., 17"
							bind:value={version}
						/>
					</div>
					<div class="mt-3 md:mt-0">
						<Label class="block text-base font-medium" for="max_conn">max_conn</Label>
						<Input
							id="max_conn"
							type="number"
							min="1"
							class="mt-1 w-full rounded-md"
							placeholder="e.g., 200"
							bind:value={maxConn}
						/>
					</div>
				</div>

				<div class="mt-3 grid gap-3 md:grid-cols-2">
					<div>
						<Label class="block text-base font-medium" for="memory_gb">memory_gb</Label>
						<Input
							id="memory_gb"
							type="number"
							min="1"
							class="mt-1 w-full rounded-md"
							placeholder="e.g., 32"
							bind:value={memoryGb}
						/>
					</div>
					<div class="mt-3 md:mt-0">
						<Label class="block text-base font-medium" for="cpus">cpus</Label>
						<Input
							id="cpus"
							type="number"
							min="1"
							class="mt-1 w-full rounded-md"
							placeholder="e.g., 8"
							bind:value={cpus}
						/>
					</div>
				</div>

				<div class="mt-3 grid gap-3 md:grid-cols-2">
					<div>
						<Label class="block text-base font-medium" for="num_disks">num_disks</Label>
						<Input
							id="num_disks"
							type="number"
							min="1"
							class="mt-1 w-full rounded-md"
							placeholder="e.g., 1"
							bind:value={numDisks}
						/>
					</div>
					<div class="mt-3 md:mt-0">
						<Label class="block text-base font-medium" for="num_replicas">num_replicas</Label>
						<Input
							id="num_replicas"
							type="number"
							min="0"
							class="mt-1 w-full rounded-md"
							placeholder="e.g., 2"
							bind:value={numReplicas}
						/>
					</div>
				</div>

				<div class="mt-3">
					<Label class="block text-base font-medium" for="db_size_gb">db_size_gb</Label>
					<Input
						id="db_size_gb"
						type="number"
						min="1"
						class="mt-1 w-full rounded-md"
						placeholder="e.g., 2"
						bind:value={dbSizeGb}
					/>
				</div>

				<div class="mt-3">
					<Label class="block text-base font-medium" for="storage_type">storage_type</Label>
					<Select.Root type="single" bind:value={storageType} name="storage_type">
						<Select.Trigger class="mt-1 w-full justify-between" aria-label="Storage Type">
							{storageType || 'Select a storage type...'}
						</Select.Trigger>
						<Select.Content class="p-0">
							{#each storageOptions as storageOpt (storageOpt)}
								<Select.Item value={storageOpt} label={storageOpt}>
									{storageOpt}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="mt-3">
					<Label class="block text-base font-medium" for="backup_method">backup_method</Label>
					<Select.Root type="single" bind:value={backupMethod} name="backup_method">
						<Select.Trigger class="mt-1 w-full justify-between" aria-label="Backup Method">
							{backupMethod || 'Select a backup method...'}
						</Select.Trigger>
						<Select.Content class="p-0">
							{#each backupOptions as backupOpt (backupOpt)}
								<Select.Item value={backupOpt} label={backupOpt}>
									{backupOpt}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="mt-3">
					<Label class="block text-base font-medium" for="workload">workload</Label>
					<Select.Root type="single" bind:value={workload} name="workload">
						<Select.Trigger class="mt-1 w-full justify-between" aria-label="Workload Type">
							{workload || 'Select a workload...'}
						</Select.Trigger>
						<Select.Content class="p-0">
							{#each workloadOptions as workOpt (workOpt)}
								<Select.Item value={workOpt} label={workOpt}>
									{workOpt}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="mt-3">
					<Label class="block text-base font-medium" for="os">os</Label>
					<Select.Root type="single" bind:value={os} name="os">
						<Select.Trigger class="mt-1 w-full justify-between" aria-label="Os Family">
							{os || 'Select an os...'}
						</Select.Trigger>
						<Select.Content class="p-0">
							{#each osOptions as osOpt (osOpt)}
								<Select.Item value={osOpt} label={osOpt}>
									{osOpt}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="space-y-6 lg:col-span-2">
			<div id="urlOut" class="py-4">
				<Code class="overflow-x-auto" title="GET URL" bind:code={urlOut} lang="bash" />
			</div>
			<div id="curlOut" class="py-4">
				<Code class="overflow-x-auto" title="curl" bind:code={curlOut} lang="bash" />
			</div>
			<div id="wgetOut" class="py-4">
				<Code class="overflow-x-auto" title="wget" bind:code={wgetOut} lang="bash" />
			</div>
		</div>
	</div>
</section>
