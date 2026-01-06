/**
 * Storage and I/O related PostgreSQL settings.
 */

import type { StorageType, OSType, WorkloadType } from './types';
import {
	RANDOM_PAGE_COST,
	DEFAULT_STATISTICS_TARGET,
	SSD_IO_CONCURRENCY_MULTIPLIER,
	HDD_IO_CONCURRENCY_MULTIPLIER,
	NETWORK_IO_CONCURRENCY_MULTIPLIER
} from './constants';

/**
 * Get random_page_cost based on storage type.
 *
 * - HDD: 4.0 (random I/O is expensive on spinning disks)
 * - SSD/Network: 1.1 (random access is nearly as fast as sequential)
 */
export const getRandomPageCost = (storage_type: StorageType): number => {
	if (storage_type === 'hdd') {
		return RANDOM_PAGE_COST.hdd;
	}
	return RANDOM_PAGE_COST.ssd;
};

/**
 * Get effective_io_concurrency based on OS, storage type, and number of disks.
 *
 * This setting is only applicable on Linux (returns null for other OSes).
 * The value scales with the number of disks to account for RAID configurations.
 *
 * - SSD: 200 per disk pair (high parallelism)
 * - HDD: 2 per disk pair (limited by seek times)
 * - Network: 300 per disk pair (cloud storage can handle high concurrency)
 */
export const getEffectiveIoConcurrency = (
	os: OSType,
	storage_type: StorageType,
	num_disks: number
): number | null => {
	if (os !== 'linux') {
		return null;
	}

	const diskMultiplier = Math.ceil(num_disks > 1 ? num_disks / 2 : 1);

	switch (storage_type) {
		case 'ssd':
			return SSD_IO_CONCURRENCY_MULTIPLIER * diskMultiplier;
		case 'hdd':
			return HDD_IO_CONCURRENCY_MULTIPLIER * diskMultiplier;
		case 'network':
			return NETWORK_IO_CONCURRENCY_MULTIPLIER * diskMultiplier;
	}
};

/**
 * Get default_statistics_target based on workload type.
 *
 * - Warehouse: 500 (more detailed statistics for complex analytical queries)
 * - Others: 100 (PostgreSQL default, sufficient for OLTP)
 */
export const getDefaultStatisticsTarget = (workload: WorkloadType): number => {
	if (workload === 'warehouse') {
		return DEFAULT_STATISTICS_TARGET.warehouse;
	}
	return DEFAULT_STATISTICS_TARGET.default;
};
