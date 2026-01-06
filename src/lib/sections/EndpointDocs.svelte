<script lang="ts">
	import { getCoreRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender, Table, Code } from '$lib/components/ui';
	import { columns, queryParams } from '$lib/data/endpoint-docs';
	import { SITE_URL } from '$lib/consts';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { SvelteURL } from 'svelte/reactivity';

	const jsonExample = JSON.stringify(
		{
			version: 17,
			os: 'linux',
			memory_gb: 8,
			cpus: 8,
			storage_type: 'ssd',
			workload: 'webapp',
			num_disks: 1,
			db_size_gb: 10
		},
		null,
		2
	);

	let canonicalUrl = $state(SITE_URL);

	onMount(() => {
		if (browser) {
			const url = new SvelteURL(window.location.href);
			canonicalUrl = url.origin;
		}
	});

	const table = createSvelteTable({
		get data() {
			return queryParams;
		},
		columns,
		getCoreRowModel: getCoreRowModel()
	});
</script>

<section id="endpoint" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-14">
	<h2 class="text-2xl font-bold">Endpoint</h2>
	<div class="mt-4 rounded-xl border p-4">
		<div class="font-mono text-base">
			<span
				class="rounded bg-green-100 px-1.5 py-0.5 text-green-800 dark:bg-green-900 dark:text-green-200"
				>GET</span
			>
			<span class="mx-1 text-muted-foreground">|</span>
			<span
				class="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
				>POST</span
			>
			<span class="ml-2 font-semibold">{canonicalUrl}<wbr />/api/v1/tune</span>
		</div>
		<p class="mt-2 text-base">
			Returns recommended <span class="font-medium">postgresql.conf</span> settings based on the
			provided server profile. Use <span class="font-medium">GET</span> with query parameters or
			<span class="font-medium">POST</span> with a JSON body.
		</p>

		<h3 class="mt-6 font-semibold">Parameters</h3>
		<div class="mt-3 overflow-x-auto">
			<Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head colspan={header.colSpan}>
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row data-state={row.getIsSelected() && 'selected'}>
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell>
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<h3 class="mt-6 font-semibold">Example JSON body (POST)</h3>
		<div class="mt-3">
			<Code code={jsonExample} lang="json" title="request.json" />
		</div>
	</div>
	<div class="mt-4 rounded-xl border p-4">
		<div class="font-mono text-base">
			<span
				class="rounded bg-green-100 px-1.5 py-0.5 text-green-800 dark:bg-green-900 dark:text-green-200"
				>GET</span
			>
			<span class="ml-2 font-semibold">{canonicalUrl}<wbr />/api/v1/tune/schema.json</span>
		</div>
		<p class="mt-2 text-base">
			Returns the JSON Schema for the request parameters and response of the <code>/v1/tune</code> endpoint.
		</p>
	</div>
</section>
