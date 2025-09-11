<section id="status" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-14">
	<h2 class="text-2xl font-bold">Status & Errors</h2>
	<div class="mt-4 grid gap-4 md:grid-cols-3">
		<div class="rounded-lg border p-4">
			<div class="font-semibold">200 OK</div>
			<p class="mt-1 text-base">JSON payload with recommended settings.</p>
		</div>
		<div class="rounded-lg border p-4">
			<div class="font-semibold">400 Bad Request</div>
			<p class="mt-1 text-base">
				Missing/invalid parameters. Returns <span class="font-mono"
					>&lcub; "error": "message" &rcub;</span
				>.
			</p>
		</div>
		<div class="rounded-lg border p-4">
			<div class="font-semibold">500 Server Error</div>
			<p class="mt-1 text-base">Unexpected failure; retry or report.</p>
		</div>
	</div>

	<div class="mt-6 rounded-xl border p-4">
		<div class="font-semibold">Versioning & Stability</div>
		<ul class="mt-2 list-disc space-y-1 pl-5 text-base">
			<li>
				Current ruleset: <span class="font-mono">v1</span>. Pass
				<span class="font-mono">version</span> to pin behavior.
			</li>
			<li>Idempotent GETs. No rate limits enforced by default (set at deploy).</li>
			<li>
				Outputs aim to be conservative and production-safe; always benchmark for your workload.
			</li>
		</ul>
	</div>
</section>
