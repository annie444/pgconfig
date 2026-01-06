/**
 * Type definitions and workload classification helpers for PostgreSQL configuration.
 */

export type WorkloadType = 'webapp' | 'oltp' | 'warehouse' | 'desktop' | 'mixed';
export type StorageType = 'ssd' | 'hdd' | 'network';
export type OSType = 'linux' | 'windows' | 'macos';

/**
 * Workload categories for memory allocation decisions.
 * These workloads get higher memory allocations (1/4 of RAM for shared_buffers).
 */
export const HIGH_MEMORY_WORKLOADS: readonly WorkloadType[] = [
	'webapp',
	'oltp',
	'warehouse',
	'mixed'
] as const;

/**
 * Transactional workloads that benefit from full work_mem allocation.
 */
export const TRANSACTIONAL_WORKLOADS: readonly WorkloadType[] = ['webapp', 'oltp'] as const;

/**
 * Workloads that use standard maintenance memory allocation (1/16 of RAM).
 */
export const STANDARD_MAINTENANCE_WORKLOADS: readonly WorkloadType[] = [
	'webapp',
	'oltp',
	'desktop',
	'mixed'
] as const;

/**
 * Check if a workload should receive higher memory allocations.
 */
export const isHighMemoryWorkload = (workload: WorkloadType): boolean =>
	HIGH_MEMORY_WORKLOADS.includes(workload);

/**
 * Check if a workload is transactional (webapp or oltp).
 */
export const isTransactionalWorkload = (workload: WorkloadType): boolean =>
	TRANSACTIONAL_WORKLOADS.includes(workload);

/**
 * Check if a workload uses standard maintenance memory allocation.
 */
export const isStandardMaintenanceWorkload = (workload: WorkloadType): boolean =>
	STANDARD_MAINTENANCE_WORKLOADS.includes(workload);
