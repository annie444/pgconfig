<script lang="ts">
	import { Code } from '$lib/components/ui';
	import { schema, example } from '$lib/data/schema';
</script>

<section id="schema" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-14">
	<h2 class="text-2xl font-bold">Response schema</h2>
	<p class="mt-2 mb-8 text-base">
		All values are returned as strings or numbers suitable for <span class="font-mono"
			>postgresql.conf</span
		>. You can template or write them directly.
	</p>
	<div class="mt-4 grid gap-6 lg:grid-cols-2">
		<Code class="overflow-x-auto" title="JSON Schema" code={schema} lang="json" />
		<Code title="Example response" class="overflow-x-auto" code={example} lang="json" />
	</div>
</section>
