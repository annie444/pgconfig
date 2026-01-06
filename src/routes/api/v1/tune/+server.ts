import { getPostgresConfig } from '$lib/api/config';
import { pgApiSchema, pgApiJSONSchema } from '$lib/api/schema';
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

const urlHandler: RequestHandler = async ({ url }) => {
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

const jsonHandler: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const req = pgApiSchema.safeParse(body);
	if (!req.success) {
		return error(400, {
			message: JSON.stringify({ errors: JSON.parse(req.error.message) })
		});
	}
	return json(getPostgresConfig(req.data));
};

export const GET: RequestHandler = urlHandler;

export const POST: RequestHandler = jsonHandler;

export const PUT: RequestHandler = jsonHandler;

export const PATCH: RequestHandler = jsonHandler;

export const DELETE: RequestHandler = urlHandler;

export const OPTIONS: RequestHandler = async () => {
	const returnedHeaders = new Headers();
	returnedHeaders.append('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
	returnedHeaders.append('Accept', 'application/json');
	returnedHeaders.append('Content-Type', 'application/json');
	returnedHeaders.append('Access-Control-Allow-Headers', 'Content-Type, Accept');
	returnedHeaders.append('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
	returnedHeaders.append('Access-Control-Allow-Origin', '*');
	const responseInit: ResponseInit = {
		headers: returnedHeaders
	};
	return json(pgApiJSONSchema, responseInit);
};
