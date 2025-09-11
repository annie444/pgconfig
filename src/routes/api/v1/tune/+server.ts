import { getPostgresConfig } from '$lib/api/config';
import { pgApiSchema } from '$lib/api/schema';
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
	const searchParams: Record<string, string | number> = {};
	for (const [key, value] of url.searchParams.entries()) {
		const int = parseInt(value);
		if (!isNaN(int)) {
			searchParams[key] = int;
		} else {
			searchParams[key] = value;
		}
	}
	const req = pgApiSchema.safeParse(searchParams);
	if (!req.success) {
		return error(400, {
			message: JSON.stringify({ errors: JSON.parse(req.error.message) })
		});
	}
	return json(getPostgresConfig(req.data));
};
