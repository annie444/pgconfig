/**
 * Warning message generation for PostgreSQL configuration.
 */

import { HIGH_MEMORY_WARNING_THRESHOLD_GB } from './constants';

/**
 * Generate warning messages based on configuration parameters.
 *
 * Currently warns when memory exceeds 256GB, as the tuning recommendations
 * may not be optimal for very high memory systems.
 */
export const getWarningMessage = (memory_gb: number): string[] => {
	if (memory_gb > HIGH_MEMORY_WARNING_THRESHOLD_GB) {
		return ['WARNING this tool not being optimal for very high memory systems'];
	}
	return [];
};
