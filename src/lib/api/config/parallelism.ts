/**
 * Parallelism-related PostgreSQL settings.
 */

import type { WorkloadType } from './types';
import {
	MIN_CPUS_FOR_PARALLELISM,
	MAX_PARALLEL_WORKERS_NON_WAREHOUSE,
	MAX_PARALLEL_MAINTENANCE_WORKERS,
	PG_VERSION_MAX_PARALLEL_WORKERS,
	PG_VERSION_PARALLEL_MAINTENANCE
} from './constants';

/**
 * Calculate parallel worker settings based on version, workload, and CPU count.
 *
 * Parallelism requires at least 4 CPUs. Settings vary by PostgreSQL version:
 * - All versions: max_worker_processes, max_parallel_workers_per_gather
 * - v10+: max_parallel_workers
 * - v11+: max_parallel_maintenance_workers
 *
 * Warehouse workloads can use more parallel workers per query since they
 * typically have fewer concurrent queries.
 */
export const getParallelSettings = (
	version: number,
	workload: WorkloadType,
	cpus: number
): Record<string, string | number> => {
	// Need at least 4 CPUs for parallelism to be beneficial
	if (cpus < MIN_CPUS_FOR_PARALLELISM) {
		return {};
	}

	let workers_per_gather = Math.ceil(cpus / 2);

	// Non-warehouse workloads cap at 4 workers per gather
	// (no clear evidence that more workers provide proportional benefit)
	if (workload !== 'warehouse' && workers_per_gather > MAX_PARALLEL_WORKERS_NON_WAREHOUSE) {
		workers_per_gather = MAX_PARALLEL_WORKERS_NON_WAREHOUSE;
	}

	const config: Record<string, string | number> = {
		max_worker_processes: cpus,
		max_parallel_workers_per_gather: workers_per_gather
	};

	// PostgreSQL 10+ has max_parallel_workers
	if (version >= PG_VERSION_MAX_PARALLEL_WORKERS) {
		config['max_parallel_workers'] = cpus;
	}

	// PostgreSQL 11+ has max_parallel_maintenance_workers
	if (version >= PG_VERSION_PARALLEL_MAINTENANCE) {
		let parallel_maintenance_workers = cpus > 2 ? Math.floor(cpus / 2) : 1;

		// Cap at 4 (no clear benefit beyond this)
		if (parallel_maintenance_workers > MAX_PARALLEL_MAINTENANCE_WORKERS) {
			parallel_maintenance_workers = MAX_PARALLEL_MAINTENANCE_WORKERS;
		}

		config['max_parallel_maintenance_workers'] = parallel_maintenance_workers;
	}

	return config;
};
