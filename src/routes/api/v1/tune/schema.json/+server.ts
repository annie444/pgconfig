import { pgApiJSONSchema } from '$lib/api/schema';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	return json(pgApiJSONSchema);
};
