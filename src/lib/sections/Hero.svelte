<script lang="ts">
	import { Code, Button } from '$lib/components/ui';
</script>

<section>
	<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-16">
		<div class="grid items-center gap-10 lg:grid-cols-2">
			<div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
					A script-friendly alternative to PGTune
				</h1>
				<p class="mt-4">
					Get sensible PostgreSQL configuration recommendations from a simple <span
						class="font-semibold">GET</span
					> request. Built for CI, provisioning, and one-liners—no UI required.
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<Button href="#quickstart" class="inline-flex items-center gap-2" variant="outline"
						>Quickstart</Button
					>
					<Button href="#endpoint" class="inline-flex items-center gap-2" variant="outline"
						>Read the docs</Button
					>
				</div>
				<p class="mt-4 text-xs">
					Tip: use with <span class="kbd">curl</span>, <span class="kbd">wget</span>, or your config
					management of choice.
				</p>
			</div>
			<Code
				class="overflow-x-auto"
				title="Sample response"
				code={`{
  "settings": {
    "shared_buffers": "8GB",
    "effective_cache_size": "24GB",
    "work_mem": "64MB",
    "maintenance_work_mem": "2GB",
    "wal_buffers": "auto",
    "checkpoint_completion_target": 0.9,
    "default_statistics_target": 100,
    "random_page_cost": 1.1,
    "effective_io_concurrency": 200,
    "max_connections": 200,
    ...
  },
  "warnings": []
}`}
				lang="json"
			/>
		</div>
		<div class="mt-10 grid gap-4 sm:grid-cols-3">
			<div class="rounded-lg border p-4">
				<div class="font-semibold">Deterministic</div>
				<p class="mt-1 text-base">Same inputs → same outputs. Easy to diff and commit.</p>
			</div>
			<div class="rounded-lg border p-4">
				<div class="font-semibold">Zero deps</div>
				<p class="mt-1 text-base">
					Just call the endpoint. Great for cloud-init/Ansible/Terraform.
				</p>
			</div>
			<div class="rounded-lg border p-4">
				<div class="font-semibold">Human-vetted defaults</div>
				<p class="mt-1 text-base">Sane recs that won’t shock your cluster.</p>
			</div>
		</div>
	</div>
</section>
