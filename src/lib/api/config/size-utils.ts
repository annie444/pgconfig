/**
 * Size conversion utilities for PostgreSQL configuration.
 * All internal calculations use KB as the base unit.
 */

import { SIZE_UNITS, MB_IN_KB, GB_IN_KB, TB_IN_KB } from './constants';

/**
 * Regex to parse PostgreSQL size strings like "1GB", "512MB", "16KB".
 */
const SIZE_REGEX = /^(\d+)(K|M|G|T)B$/;

/**
 * Convert gigabytes to kilobytes.
 */
export const GBtoKB = (gb: number): number => Math.round((gb * SIZE_UNITS.GB) / SIZE_UNITS.KB);

/**
 * Convert megabytes to kilobytes.
 */
export const MBtoKB = (mb: number): number => Math.round((mb * SIZE_UNITS.MB) / SIZE_UNITS.KB);

/**
 * Convert terabytes to kilobytes.
 */
export const TBtoKB = (tb: number): number => Math.round((tb * SIZE_UNITS.TB) / SIZE_UNITS.KB);

/**
 * Parse a PostgreSQL size string (e.g., "1GB", "512MB") to bytes.
 */
export const fromSizeString = (size: string): number => {
	const match = size.match(SIZE_REGEX);
	if (!match) {
		throw new Error(`Invalid size string: ${size}`);
	}
	const value = parseInt(match[1], 10);
	const unit = `${match[2]}B` as keyof typeof SIZE_UNITS;
	return value * SIZE_UNITS[unit];
};

/**
 * Parse a PostgreSQL size string to kilobytes.
 */
export const fromSizeStringToKB = (size: string): number => {
	return fromSizeString(size) / SIZE_UNITS.KB;
};

/**
 * Convert kilobytes to a human-readable PostgreSQL size string.
 * Uses the largest appropriate unit (TB, GB, MB, or kB).
 */
export const toSizeString = (kbytes: number): string => {
	if (kbytes >= TB_IN_KB) {
		return `${Math.floor(kbytes / TB_IN_KB)}TB`;
	} else if (kbytes >= GB_IN_KB) {
		return `${Math.floor(kbytes / GB_IN_KB)}GB`;
	} else if (kbytes >= MB_IN_KB) {
		return `${Math.floor(kbytes / MB_IN_KB)}MB`;
	} else {
		return `${kbytes}kB`;
	}
};

/**
 * Legacy alias for GBtoKB (maintains compatibility with original code).
 * @deprecated Use GBtoKB instead
 */
export const GBtoKBytes = GBtoKB;
