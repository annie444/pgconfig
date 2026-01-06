/**
 * Write-Ahead Log (WAL) related PostgreSQL settings.
 */

import type { WorkloadType } from './types';
import {
	WAL_SIZES,
	WAL_KEEP_10TB_SIZE_MB,
	WAL_KEEP_1TB_SIZE_MB,
	WAL_KEEP_DEFAULT_SIZE_MB,
	MIN_WAL_BUFFERS_KB,
	MAX_WAL_BUFFERS_KB,
	NEAR_MAX_WAL_BUFFERS_KB,
	WAL_BUFFERS_PERCENTAGE,
	PG_VERSION_AUTO_WAL_BUFFERS,
	MB_IN_KB,
	TB_IN_KB
} from './constants';
import { GBtoKB, toSizeString, fromSizeStringToKB } from './size-utils';

/**
 * Get archive_mode and archive_command based on replica count.
 *
 * Archive mode is enabled when there are replicas to support
 * point-in-time recovery and replication.
 */
export const getArchiveMode = (num_replicas: number): Record<string, string> => {
	if (num_replicas > 0) {
		return {
			archive_mode: 'on',
			archive_command: '/bin/true'
		};
	}
	return {};
};

/**
 * Calculate wal_keep_size based on database size.
 *
 * Larger databases need more WAL retained to support streaming replication
 * and recovery:
 * - 10TB+: ~107GB
 * - 1TB+: ~21.5GB
 * - Default: ~3.5GB
 */
export const getWalKeepSize = (db_size_gb: number): string => {
	const kbytes = GBtoKB(db_size_gb);

	if (kbytes >= 10 * TB_IN_KB) {
		return toSizeString(WAL_KEEP_10TB_SIZE_MB * MB_IN_KB);
	} else if (kbytes >= TB_IN_KB) {
		return toSizeString(WAL_KEEP_1TB_SIZE_MB * MB_IN_KB);
	} else {
		return toSizeString(WAL_KEEP_DEFAULT_SIZE_MB * MB_IN_KB);
	}
};

/**
 * Calculate max_wal_senders based on replica count.
 *
 * - No replicas: 0 (disable WAL senders)
 * - 1-7 replicas: 10 (reasonable buffer)
 * - 8+ replicas: 10 + (replicas - 7)
 */
export const getWalSenders = (num_replicas: number): number => {
	if (num_replicas === 0) {
		return 0;
	} else if (num_replicas < 8) {
		return 10;
	} else {
		return 10 + (num_replicas - 7);
	}
};

/**
 * Get wal_level based on workload.
 *
 * Desktop workloads use minimal WAL level for performance.
 * When wal_level is minimal, max_wal_senders must be 0.
 */
export const getWalLevel = (workload: WorkloadType): Record<string, string | number> => {
	if (workload === 'desktop') {
		return {
			wal_level: 'minimal',
			max_wal_senders: 0
		};
	}
	return {};
};

/**
 * Calculate min_wal_size and max_wal_size based on workload.
 *
 * Different workloads have different WAL generation patterns:
 * - webapp/mixed: 1GB-4GB (moderate write activity)
 * - oltp: 2GB-8GB (high transaction volume)
 * - warehouse: 4GB-16GB (large batch operations)
 * - desktop: 100MB-4GB (minimal writes)
 */
export const getCheckpointSegments = (workload: WorkloadType): Record<string, string> => {
	// Handle webapp and mixed together
	const walConfig = WAL_SIZES[workload] ?? WAL_SIZES.webapp;

	return {
		min_wal_size: toSizeString(walConfig.min * MB_IN_KB),
		max_wal_size: toSizeString(walConfig.max * MB_IN_KB)
	};
};

/**
 * Get checkpoint_completion_target.
 *
 * Returns 0.9 based on PostgreSQL best practices.
 * Reference: https://github.com/postgres/postgres/commit/bbcc4eb2
 */
export const getCheckpointCompletionTarget = (): number => 0.9;

/**
 * Calculate wal_buffers based on PostgreSQL version and shared_buffers.
 *
 * - PostgreSQL 14+: Return -1 to let PostgreSQL auto-tune
 * - Earlier versions: 3% of shared_buffers, capped at 16MB
 */
export const getWalBuffers = (version: number, shared_buffers: string): string => {
	if (version >= PG_VERSION_AUTO_WAL_BUFFERS) {
		return '-1';
	}

	const shared_buffers_kb = fromSizeStringToKB(shared_buffers);
	let wal_buffers = Math.floor((WAL_BUFFERS_PERCENTAGE * shared_buffers_kb) / 100);

	// Cap at 16MB
	if (wal_buffers > MAX_WAL_BUFFERS_KB) {
		wal_buffers = MAX_WAL_BUFFERS_KB;
	}

	// Round up to 16MB if close (common on Windows with 512MB shared_buffers)
	if (wal_buffers > NEAR_MAX_WAL_BUFFERS_KB && wal_buffers < MAX_WAL_BUFFERS_KB) {
		wal_buffers = MAX_WAL_BUFFERS_KB;
	}

	// Ensure minimum of 32KB
	if (wal_buffers < MIN_WAL_BUFFERS_KB) {
		wal_buffers = MIN_WAL_BUFFERS_KB;
	}

	return toSizeString(wal_buffers);
};
