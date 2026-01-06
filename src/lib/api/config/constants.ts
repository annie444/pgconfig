/**
 * Named constants for PostgreSQL configuration calculations.
 * All size values are in KB (PostgreSQL's internal unit) unless noted otherwise.
 */

// Base size unit conversions (bytes)
export const SIZE_UNITS = {
	KB: 1024,
	MB: 1048576,
	GB: 1073741824,
	TB: 1099511627776
} as const;

// Size units in KB (for internal calculations)
export const KB = 1;
export const MB_IN_KB = 1024;
export const GB_IN_KB = 1024 * 1024; // 1,048,576
export const TB_IN_KB = 1024 * 1024 * 1024; // 1,073,741,824

// Memory thresholds
export const HUGE_PAGES_THRESHOLD_KB = 32 * GB_IN_KB; // 32GB - enable huge_pages above this
export const MAINTENANCE_MEM_CAP_KB = 2 * GB_IN_KB; // 2GB cap for maintenance_work_mem
export const WINDOWS_SHARED_BUFFERS_LIMIT_KB = 512 * MB_IN_KB; // 512MB Windows limit (pre-v10)
export const MIN_WORK_MEM_KB = 64; // Minimum work_mem
export const MIN_WAL_BUFFERS_KB = 32; // Minimum wal_buffers
export const MAX_WAL_BUFFERS_KB = 16 * MB_IN_KB; // 16MB maximum wal_buffers
export const NEAR_MAX_WAL_BUFFERS_KB = 14 * MB_IN_KB; // Threshold for rounding up to 16MB
export const WAL_BUFFERS_PERCENTAGE = 3; // wal_buffers = 3% of shared_buffers

// Memory warning threshold (in GB, not KB)
export const HIGH_MEMORY_WARNING_THRESHOLD_GB = 256;

// WAL keep size thresholds (based on database size)
export const WAL_KEEP_10TB_SIZE_MB = 109440; // ~107GB for 10TB+ databases
export const WAL_KEEP_1TB_SIZE_MB = 22080; // ~21.5GB for 1TB+ databases
export const WAL_KEEP_DEFAULT_SIZE_MB = 3650; // ~3.5GB default

// Connection thresholds for maintenance_work_mem adjustment
export const CONN_THRESHOLD_VERY_HIGH = 3000;
export const CONN_THRESHOLD_HIGH = 200;
export const CONN_THRESHOLD_MEDIUM = 100;
export const CONN_THRESHOLD_LOW = 20;

// Maintenance memory adjustments (in MB)
export const MAINT_MEM_REDUCTION_VERY_HIGH_CONN = 300; // Reduce by 300MB when conn > 3000
export const MAINT_MEM_REDUCTION_HIGH_CONN = 200; // Reduce by 200MB when conn > 200
export const MAINT_MEM_REDUCTION_MEDIUM_CONN = 100; // Reduce by 100MB when conn > 100
export const MAINT_MEM_BOOST_LOW_CONN = 100; // Boost by 100MB when conn < 20

// Maintenance memory thresholds for reductions (in MB)
export const MAINT_MEM_THRESHOLD_VERY_HIGH = 500;
export const MAINT_MEM_THRESHOLD_HIGH = 300;
export const MAINT_MEM_THRESHOLD_MEDIUM = 200;

// Parallelism limits
export const MIN_CPUS_FOR_PARALLELISM = 4;
export const MAX_PARALLEL_WORKERS_NON_WAREHOUSE = 4;
export const MAX_PARALLEL_MAINTENANCE_WORKERS = 4;

// IO concurrency multipliers by storage type
export const SSD_IO_CONCURRENCY_MULTIPLIER = 200;
export const HDD_IO_CONCURRENCY_MULTIPLIER = 2;
export const NETWORK_IO_CONCURRENCY_MULTIPLIER = 300;

// Default max connections by workload
export const DEFAULT_MAX_CONNECTIONS = {
	webapp: 200,
	oltp: 300,
	warehouse: 40,
	desktop: 20,
	mixed: 100
} as const;

// Superuser reserved connections by workload
export const SUPERUSER_CONNECTIONS = {
	desktop: 1,
	default: 3
} as const;

// Default statistics target by workload
export const DEFAULT_STATISTICS_TARGET = {
	warehouse: 500,
	default: 100
} as const;

// Random page cost by storage type
export const RANDOM_PAGE_COST = {
	hdd: 4.0,
	ssd: 1.1,
	network: 1.1
} as const;

// WAL sizes by workload (in MB)
export const WAL_SIZES = {
	webapp: { min: 1024, max: 4096 },
	mixed: { min: 1024, max: 4096 },
	oltp: { min: 2048, max: 8192 },
	warehouse: { min: 4096, max: 16384 },
	desktop: { min: 100, max: 4096 }
} as const;

// PostgreSQL version thresholds
export const PG_VERSION_AUTO_WAL_BUFFERS = 14; // v14+ auto-tunes wal_buffers
export const PG_VERSION_MAX_PARALLEL_WORKERS = 10; // v10+ has max_parallel_workers
export const PG_VERSION_PARALLEL_MAINTENANCE = 11; // v11+ has max_parallel_maintenance_workers
