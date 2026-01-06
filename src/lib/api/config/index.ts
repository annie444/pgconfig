/**
 * PostgreSQL Configuration Generator
 *
 * This module provides the main `getPostgresConfig` function that calculates
 * optimal PostgreSQL settings based on server characteristics.
 */

import type { PGApiSchema } from '$lib/api/schema';
import { defaultSettings } from './defaults';
import { getMaxConns, getSuperUserConnections } from './connections';
import {
	getHugePages,
	getSharedBuffers,
	getEffectiveCacheSize,
	getMaintenanceWorkMem,
	getWorkMem
} from './memory';
import {
	getArchiveMode,
	getWalKeepSize,
	getWalSenders,
	getWalLevel,
	getCheckpointSegments,
	getCheckpointCompletionTarget,
	getWalBuffers
} from './wal';
import { getParallelSettings } from './parallelism';
import {
	getRandomPageCost,
	getEffectiveIoConcurrency,
	getDefaultStatisticsTarget
} from './storage';
import { getWarningMessage } from './warnings';

// Re-export types for convenience
export type { WorkloadType, StorageType, OSType } from './types';
export { initialState } from './defaults';

/**
 * Generate PostgreSQL configuration recommendations based on server characteristics.
 *
 * @param params - Server and workload parameters
 * @returns Object containing settings and optional warnings
 */
export const getPostgresConfig = ({
	version,
	max_conn,
	workload,
	memory_gb,
	os,
	cpus,
	storage_type,
	num_disks,
	num_replicas,
	db_size_gb
}: PGApiSchema): {
	settings: Record<string, number | string>;
	warnings: string[];
} => {
	// Start with default settings
	let settings: Record<string, number | string> = { ...defaultSettings };

	// Connection settings
	settings['max_connections'] = max_conn ?? getMaxConns(workload);
	settings['superuser_reserved_connections'] = getSuperUserConnections(workload);

	// Memory settings
	settings['shared_buffers'] = getSharedBuffers(memory_gb, workload, os, version);
	settings['effective_cache_size'] = getEffectiveCacheSize(memory_gb, workload);
	settings['maintenance_work_mem'] = getMaintenanceWorkMem(
		memory_gb,
		workload,
		os,
		settings['max_connections'] as number
	);
	settings['huge_pages'] = getHugePages(memory_gb);

	// Query planner settings
	settings['default_statistics_target'] = getDefaultStatisticsTarget(workload);
	settings['random_page_cost'] = getRandomPageCost(storage_type);
	settings['checkpoint_completion_target'] = getCheckpointCompletionTarget();

	// WAL settings
	settings['max_wal_senders'] = getWalSenders(num_replicas);
	settings['wal_keep_size'] = getWalKeepSize(db_size_gb);

	// IO concurrency (Linux only)
	const effective_io_concurrency = getEffectiveIoConcurrency(os, storage_type, num_disks);
	if (effective_io_concurrency !== null) {
		settings['effective_io_concurrency'] = effective_io_concurrency;
	}

	// Parallelism settings
	const parallel_settings = getParallelSettings(version, workload, cpus);

	// Work memory (depends on parallel settings)
	settings['work_mem'] = getWorkMem(
		memory_gb,
		settings['shared_buffers'] as string,
		settings['max_connections'] as number,
		parallel_settings,
		workload
	);

	// WAL buffers (depends on shared_buffers)
	settings['wal_buffers'] = getWalBuffers(version, settings['shared_buffers'] as string);

	// Merge in computed settings
	settings = {
		...settings,
		...parallel_settings,
		...getCheckpointSegments(workload),
		...getArchiveMode(num_replicas),
		...getWalLevel(workload)
	};

	// Generate warnings
	const warnings = getWarningMessage(memory_gb);

	return { settings, warnings };
};
