/**
 * Default PostgreSQL settings and initial state for the configuration API.
 */

import type { PGApiSchema } from '$lib/api/schema';

/**
 * Default PostgreSQL settings that are applied regardless of input parameters.
 * These represent sensible, conservative defaults based on PostgreSQL best practices.
 */
export const defaultSettings: Record<string, string | number> = {
	checkpoint_timeout: '15min',
	checkpoint_completion_target: 0.9,
	wal_compression: 'on',
	wal_buffers: -1,
	wal_writer_delay: '200ms',
	wal_writer_flush_after: '1MB',
	shared_preload_libraries: "'pg_stat_statements'",
	track_io_timing: 'on',
	track_functions: 'pl',
	max_worker_processes: 8,
	max_parallel_workers_per_gather: 2,
	max_parallel_workers: 8,
	bgwriter_delay: '200ms',
	bgwriter_lru_maxpages: 100,
	bgwriter_lru_multiplier: 2.0,
	bgwriter_flush_after: 0,
	enable_partitionwise_join: 'on',
	enable_partitionwise_aggregate: 'on',
	jit: 'on',
	track_wal_io_timing: 'on',
	wal_recycle: 'on',
	max_slot_wal_keep_size: '1GB'
};

/**
 * Initial state for the API form/input.
 * Represents reasonable defaults for a typical web application server.
 */
export const initialState: PGApiSchema = {
	version: 17,
	os: 'linux',
	memory_gb: 8,
	cpus: 8,
	storage_type: 'ssd',
	workload: 'webapp',
	max_conn: 100,
	num_disks: 1,
	backup_method: 'pg_dump',
	num_replicas: 0,
	db_size_gb: 10
};
