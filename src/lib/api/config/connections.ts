/**
 * Connection-related PostgreSQL settings.
 */

import type { WorkloadType } from './types';
import { DEFAULT_MAX_CONNECTIONS, SUPERUSER_CONNECTIONS } from './constants';

/**
 * Get the default max_connections based on workload type.
 *
 * - webapp: 200 (handles many concurrent web requests)
 * - oltp: 300 (high transaction volume)
 * - warehouse: 40 (fewer, longer-running queries)
 * - desktop: 20 (minimal connections for local use)
 * - mixed: 100 (balanced default)
 */
export const getMaxConns = (workload: WorkloadType): number => {
	return DEFAULT_MAX_CONNECTIONS[workload];
};

/**
 * Get superuser_reserved_connections based on workload type.
 *
 * Desktop workloads use 1 reserved connection, all others use 3.
 * This ensures superusers can always connect for maintenance.
 */
export const getSuperUserConnections = (workload: WorkloadType): number => {
	if (workload === 'desktop') {
		return SUPERUSER_CONNECTIONS.desktop;
	}
	return SUPERUSER_CONNECTIONS.default;
};
