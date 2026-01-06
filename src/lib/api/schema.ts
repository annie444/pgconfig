/**
 * Schema for validating PostgreSQL configuration API inputs using Zod.
 *
 * This schema ensures that all required parameters are provided and conform
 * to expected types and ranges. It is used to validate incoming requests to the
 * configuration API.
 *
 * These are the direct inputs used to compute the PostgreSQL settings in ./config.ts
 */

import * as z from 'zod';

export const pgApiSchema = z.object({
	version: z
		.number('The version is not a number. Please only include the major version number.')
		.gte(10, 'The minimum supported version is 10.')
		.lte(18, 'The maximum supported version is 18.')
		.default(17),
	os: z
		.enum(['linux', 'windows', 'macos'], 'The OS must be one of linux, windows, or macos.')
		.nonoptional('The OS is required.'),
	memory_gb: z
		.number()
		.min(
			1,
			"The minimum allowed memory is 1GB. PostgreSQL can run on less, but it's not recommended."
		)
		.nonoptional('The memory size (in GB) is required.'),
	cpus: z
		.number()
		.min(1, 'The minimum allowed CPU is 1.')
		.nonoptional('The CPU count is required.'),
	storage_type: z
		.enum(
			['ssd', 'hdd', 'network'],
			'The storage type must be ssd, hdd, or network. NVMe is considered a type of ssd.'
		)
		.nonoptional('The storage type is required.'),
	workload: z
		.enum(
			['webapp', 'oltp', 'warehouse', 'desktop', 'mixed'],
			'The workload must be one of webapp, oltp, warehouse, desktop, or mixed.'
		)
		.nonoptional('The workload type is required.'),
	max_conn: z
		.number('The max connections must be a number.')
		.min(10, 'The minimum allowed connections is 10.')
		.optional(),
	num_disks: z
		.number('The number of disks must be a number.')
		.min(1, 'The minimum allowed disks is 1.')
		.nonoptional('The number of disks is required.'),
	backup_method: z
		.enum(
			['pg_dump', 'pg_basebackup', 'pglogical'],
			'The backup method must be one of pg_dump, pg_basebackup, or pglogical.'
		)
		.default('pg_dump'),
	num_replicas: z
		.number('The number of replicas must be a number.')
		.min(0, 'The minimum allowed replicas is 0.')
		.default(0),
	db_size_gb: z
		.number('The database size must be a number.')
		.min(1, 'The DB size must be at least 1GB')
});

export type PGApiSchema = z.infer<typeof pgApiSchema>;

export const pgApiJSONSchema = z.toJSONSchema(pgApiSchema, {
	unrepresentable: 'any',
	cycles: 'ref',
	reused: 'ref'
});
