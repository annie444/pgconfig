/**
 * Memory-related PostgreSQL settings.
 *
 * These functions calculate optimal memory allocations based on available RAM,
 * workload type, OS, and PostgreSQL version.
 */

import {
	type WorkloadType,
	type OSType,
	isHighMemoryWorkload,
	isTransactionalWorkload,
	isStandardMaintenanceWorkload
} from './types';
import {
	HUGE_PAGES_THRESHOLD_KB,
	MAINTENANCE_MEM_CAP_KB,
	WINDOWS_SHARED_BUFFERS_LIMIT_KB,
	MIN_WORK_MEM_KB,
	MB_IN_KB,
	CONN_THRESHOLD_VERY_HIGH,
	CONN_THRESHOLD_HIGH,
	CONN_THRESHOLD_MEDIUM,
	CONN_THRESHOLD_LOW,
	MAINT_MEM_REDUCTION_VERY_HIGH_CONN,
	MAINT_MEM_REDUCTION_HIGH_CONN,
	MAINT_MEM_REDUCTION_MEDIUM_CONN,
	MAINT_MEM_BOOST_LOW_CONN,
	MAINT_MEM_THRESHOLD_VERY_HIGH,
	MAINT_MEM_THRESHOLD_HIGH,
	MAINT_MEM_THRESHOLD_MEDIUM
} from './constants';
import { GBtoKB, toSizeString, fromSizeStringToKB } from './size-utils';
import { defaultSettings } from './defaults';

/**
 * Determine whether to enable huge_pages based on available memory.
 *
 * Huge pages are recommended for systems with 32GB+ RAM to reduce TLB misses.
 */
export const getHugePages = (memory_gb: number): string => {
	const sizeKB = GBtoKB(memory_gb);
	return sizeKB >= HUGE_PAGES_THRESHOLD_KB ? 'try' : 'off';
};

/**
 * Calculate shared_buffers based on memory, workload, OS, and PostgreSQL version.
 *
 * - High memory workloads (webapp, oltp, warehouse, mixed): 1/4 of RAM
 * - Desktop workload: 1/16 of RAM
 * - Windows (pre-v10): Capped at 512MB
 */
export const getSharedBuffers = (
	memory_gb: number,
	workload: WorkloadType,
	os: OSType,
	version: number
): string => {
	const kbytes = GBtoKB(memory_gb);
	let shared_buffers: number;

	// High memory workloads get 1/4 of RAM, desktop gets 1/16
	if (isHighMemoryWorkload(workload)) {
		shared_buffers = Math.floor(kbytes / 4);
	} else {
		shared_buffers = Math.floor(kbytes / 16);
	}

	// Windows pre-v10 has a 512MB limit for shared_buffers
	if (version < 10 && os === 'windows') {
		if (shared_buffers > WINDOWS_SHARED_BUFFERS_LIMIT_KB) {
			shared_buffers = WINDOWS_SHARED_BUFFERS_LIMIT_KB;
		}
	}

	return toSizeString(shared_buffers);
};

/**
 * Calculate effective_cache_size based on memory and workload.
 *
 * This hints to the query planner how much memory is available for caching.
 * - High memory workloads: 3/4 of RAM
 * - Desktop workload: 1/4 of RAM
 */
export const getEffectiveCacheSize = (memory_gb: number, workload: WorkloadType): string => {
	const kbytes = GBtoKB(memory_gb);

	if (isHighMemoryWorkload(workload)) {
		return toSizeString(Math.floor((kbytes * 3) / 4));
	} else {
		return toSizeString(Math.floor(kbytes / 4));
	}
};

/**
 * Calculate maintenance_work_mem based on memory, workload, OS, and max connections.
 *
 * Used for maintenance operations like VACUUM, CREATE INDEX, etc.
 * - Standard workloads (webapp, oltp, desktop, mixed): 1/16 of RAM
 * - Warehouse workload: 1/8 of RAM (more memory for large index builds)
 * - Adjustments based on max_connections to leave room for work_mem
 * - Capped at 2GB (Windows: 2GB - 1MB to avoid errors)
 */
export const getMaintenanceWorkMem = (
	memory_gb: number,
	workload: WorkloadType,
	os: OSType,
	max_conn: number
): string => {
	const kbytes = GBtoKB(memory_gb);
	let maintenance_work_mem: number;

	// Calculate base allocation
	if (isStandardMaintenanceWorkload(workload)) {
		maintenance_work_mem = Math.floor(kbytes / 16);
	} else if (workload === 'warehouse') {
		maintenance_work_mem = Math.floor(kbytes / 8);
	} else {
		maintenance_work_mem = Math.floor(kbytes / 16);
	}

	// Adjust based on connection count to leave room for work_mem
	const maintMemMB = maintenance_work_mem / MB_IN_KB;

	if (max_conn > CONN_THRESHOLD_VERY_HIGH && maintMemMB > MAINT_MEM_THRESHOLD_VERY_HIGH) {
		maintenance_work_mem -= MAINT_MEM_REDUCTION_VERY_HIGH_CONN * MB_IN_KB;
	} else if (max_conn > CONN_THRESHOLD_HIGH && maintMemMB > MAINT_MEM_THRESHOLD_HIGH) {
		maintenance_work_mem -= MAINT_MEM_REDUCTION_HIGH_CONN * MB_IN_KB;
	} else if (max_conn > CONN_THRESHOLD_MEDIUM && maintMemMB > MAINT_MEM_THRESHOLD_MEDIUM) {
		maintenance_work_mem -= MAINT_MEM_REDUCTION_MEDIUM_CONN * MB_IN_KB;
	} else if (max_conn < CONN_THRESHOLD_LOW) {
		maintenance_work_mem += MAINT_MEM_BOOST_LOW_CONN * MB_IN_KB;
	}

	// Cap at 2GB (Windows needs 1MB less to avoid errors)
	if (maintenance_work_mem >= MAINTENANCE_MEM_CAP_KB) {
		if (os === 'windows') {
			maintenance_work_mem = MAINTENANCE_MEM_CAP_KB - MB_IN_KB;
		} else {
			maintenance_work_mem = MAINTENANCE_MEM_CAP_KB;
		}
	}

	return toSizeString(maintenance_work_mem);
};

/**
 * Calculate work_mem based on memory, shared_buffers, connections, and workload.
 *
 * work_mem is allocated per-operation (sorts, hashes), and a single query can
 * use multiple allocations. The formula accounts for this by dividing by 3x
 * the connection count.
 *
 * - Transactional workloads (webapp, oltp): Full allocation
 * - Desktop: 1/6 of calculated value
 * - Others (warehouse, mixed): 1/2 of calculated value
 * - Minimum: 64KB
 */
export const getWorkMem = (
	memory_gb: number,
	shared_buffers: string,
	max_conn: number,
	parallel_settings: Record<string, string | number>,
	workload: WorkloadType
): string => {
	// Get max_worker_processes from parallel settings or defaults
	const parallel_work_mem = (() => {
		if ('max_worker_processes' in parallel_settings) {
			const max_worker_processes = parallel_settings['max_worker_processes'];
			if (
				max_worker_processes &&
				typeof max_worker_processes === 'number' &&
				max_worker_processes > 0
			) {
				return max_worker_processes;
			}
		}
		if (
			defaultSettings['max_worker_processes'] &&
			typeof defaultSettings['max_worker_processes'] === 'number' &&
			defaultSettings['max_worker_processes'] > 0
		) {
			return defaultSettings['max_worker_processes'];
		}
		return 1;
	})();

	const kbytes = GBtoKB(memory_gb);
	const shared_buffers_kb = fromSizeStringToKB(shared_buffers);

	// Formula: (RAM - shared_buffers) / ((max_connections + max_worker_processes) * 3)
	let work_mem = (kbytes - shared_buffers_kb) / ((max_conn + parallel_work_mem) * 3);

	// Adjust based on workload
	if (isTransactionalWorkload(workload)) {
		work_mem = Math.floor(work_mem);
	} else if (workload === 'desktop') {
		work_mem = Math.floor(work_mem / 6);
	} else {
		work_mem = Math.floor(work_mem / 2);
	}

	// Ensure minimum of 64KB
	if (work_mem < MIN_WORK_MEM_KB) {
		work_mem = MIN_WORK_MEM_KB;
	}

	return toSizeString(work_mem);
};
