import type { PGApiSchema } from '$lib/api/schema.ts';

const SIZE_UNIT_MAP = {
	['KB']: 1024,
	['MB']: 1048576,
	['GB']: 1073741824,
	['TB']: 1099511627776
};

const sizeRegex = /^(\d+)(K|M|G|T)B$/;

const GBtoKBytes = (size: number) => Math.round((size * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB']);

const fromSizeString = (size: string): number => {
	const unit = `${size.replace(sizeRegex, '$2')}B` as keyof typeof SIZE_UNIT_MAP;
	return parseInt(size.replace(sizeRegex, '$1')) * SIZE_UNIT_MAP[unit];
};

const toSizeString = (kbytes: number) => {
	const tb = SIZE_UNIT_MAP['TB'] / SIZE_UNIT_MAP['KB'];
	const gb = SIZE_UNIT_MAP['GB'] / SIZE_UNIT_MAP['KB'];
	const mb = SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'];
	if (kbytes >= tb) {
		return `${Math.floor(kbytes / tb)}TB`;
	} else if (kbytes >= gb) {
		return `${Math.floor(kbytes / gb)}GB`;
	} else if (kbytes >= mb) {
		return `${Math.floor(kbytes / mb)}MB`;
	} else {
		return `${kbytes}kB`;
	}
};

export type WorkloadType = 'webapp' | 'oltp' | 'warehouse' | 'desktop' | 'mixed';

export type StorageType = 'ssd' | 'hdd' | 'network';
export type OSType = 'linux' | 'windows' | 'macos';

const defaultSettings: Record<string, string | number> = {
	['checkpoint_timeout']: '15min',
	['checkpoint_completion_target']: 0.9,
	['wal_compression']: 'on',
	['wal_buffers']: -1,
	['wal_writer_delay']: '200ms',
	['wal_writer_flush_after']: '1MB',
	['shared_preload_libraries']: "'pg_stat_statements'",
	['track_io_timing']: 'on',
	['track_functions']: 'pl',
	['max_worker_processes']: 8,
	['max_parallel_workers_per_gather']: 2,
	['max_parallel_workers']: 8,
	['bgwriter_delay']: '200ms',
	['bgwriter_lru_maxpages']: 100,
	['bgwriter_lru_multiplier']: 2.0,
	['bgwriter_flush_after']: 0,
	['enable_partitionwise_join']: 'on',
	['enable_partitionwise_aggregate']: 'on',
	['jit']: 'on',
	['track_wal_io_timing']: 'on',
	['wal_recycle']: 'on',
	['max_slot_wal_keep_size']: '1GB'
};

export const initialState: PGApiSchema = {
	version: 17,
	os: 'linux',
	memory_gb: 8,
	cpus: 8,
	storage_type: 'ssd',
	workload: 'webapp',
	max_conn: 100,
	num_disks: 1,
	backup_method: 'pg_dump',
	num_replicas: 0,
	db_size_gb: 10
};

export const getArchiveMode = (num_replicas: number): Record<string, string> => {
	if (num_replicas > 0) {
		return {
			['archive_mode']: 'on',
			['archive_command']: '/bin/true'
		};
	}
	return {};
};

export const getWalKeepSize = (db_size_gb: number): string => {
	const ten_tb = (10 * SIZE_UNIT_MAP['TB']) / SIZE_UNIT_MAP['KB'];
	const tb = (1 * SIZE_UNIT_MAP['TB']) / SIZE_UNIT_MAP['KB'];
	const kbytes = GBtoKBytes(db_size_gb);
	if (kbytes >= ten_tb) {
		return toSizeString((109440 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']);
	} else if (kbytes >= tb) {
		return toSizeString((22080 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']);
	} else {
		return toSizeString((3650 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']);
	}
};

export const getWalSenders = (num_replicas: number): number => {
	if (num_replicas === 0) {
		return 0;
	} else if (num_replicas < 8) {
		return 10;
	} else {
		return 10 + (num_replicas - 7);
	}
};

export const getMaxConns = (
	workload: 'webapp' | 'oltp' | 'warehouse' | 'desktop' | 'mixed'
): number => {
	switch (workload) {
		case 'webapp':
			return 200;
		case 'oltp':
			return 300;
		case 'warehouse':
			return 40;
		case 'desktop':
			return 20;
		case 'mixed':
			return 100;
	}
};

export const getHugePages = (memory_gb: number): string => {
	const size = GBtoKBytes(memory_gb);
	return size >= 33554432 ? 'try' : 'off';
};

export const getSharedBuffers = (
	memory_gb: number,
	workload: WorkloadType,
	os: OSType,
	version: number
): string => {
	const kbytes = GBtoKBytes(memory_gb);
	let shared_buffers = 0;
	if (workload in ['webapp', 'oltp', 'warehouse', 'mixed']) {
		shared_buffers = Math.floor(kbytes / 4);
	} else {
		shared_buffers = Math.floor(kbytes / 16);
	}
	if (version < 10 && os === 'windows') {
		// Limit shared_buffers to 512MB on Windows
		const win_limit = (512 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
		if (shared_buffers > win_limit) {
			shared_buffers = win_limit;
		}
	}
	return toSizeString(shared_buffers);
};

export const getEffectiveCacheSize = (memory_gb: number, workload: WorkloadType): string => {
	const kbytes = GBtoKBytes(memory_gb);
	if (workload in ['webapp', 'oltp', 'warehouse', 'mixed']) {
		return toSizeString(Math.floor((kbytes * 3) / 4));
	} else {
		return toSizeString(Math.floor(kbytes / 4));
	}
};

export const getMaintenanceWorkMem = (
	memory_gb: number,
	workload: WorkloadType,
	os: OSType,
	max_conn: number
): string => {
	const kbytes = GBtoKBytes(memory_gb);
	let maintenance_worker_mem = 0;
	if (workload in ['webapp', 'oltp', 'desktop', 'mixed']) {
		maintenance_worker_mem = Math.floor(kbytes / 16);
	} else if (workload === 'warehouse') {
		maintenance_worker_mem = Math.floor(kbytes / 8);
	}
	if (
		max_conn > 3000 &&
		maintenance_worker_mem > (500 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
	) {
		maintenance_worker_mem = Math.floor(
			maintenance_worker_mem - (300 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
		);
	} else if (
		max_conn > 200 &&
		maintenance_worker_mem > (300 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
	) {
		maintenance_worker_mem = Math.floor(
			maintenance_worker_mem - (200 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
		);
	} else if (
		max_conn > 100 &&
		maintenance_worker_mem > (200 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
	) {
		maintenance_worker_mem = Math.floor(
			maintenance_worker_mem - (100 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
		);
	} else if (max_conn < 20) {
		maintenance_worker_mem = Math.floor(
			maintenance_worker_mem + (100 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
		);
	}
	// Cap maintenance RAM at 2GB on servers with lots of memory
	const mem_limit = (2 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB'];
	if (maintenance_worker_mem >= mem_limit) {
		if (os === 'windows') {
			// 2048MB (2 GB) will raise error at Windows, so we need remove 1 MB from it
			maintenance_worker_mem = mem_limit - (1 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
		} else {
			maintenance_worker_mem = mem_limit;
		}
	}
	return toSizeString(maintenance_worker_mem);
};

export const getCheckpointSegments = (workload: WorkloadType): Record<string, string> => {
	let min_wal_size = 0;
	let max_wal_size = 0;
	if (workload in ['webapp', 'mixed']) {
		min_wal_size = (1024 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
		max_wal_size = (4096 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
	} else if (workload === 'oltp') {
		min_wal_size = (2048 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
		max_wal_size = (8192 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
	} else if (workload === 'warehouse') {
		min_wal_size = (4096 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
		max_wal_size = (16384 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
	} else if (workload === 'desktop') {
		min_wal_size = (100 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
		max_wal_size = (4096 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
	}

	return {
		['min_wal_size']: toSizeString(min_wal_size),
		['max_wal_size']: toSizeString(max_wal_size)
	};
};

export const getCheckpointCompletionTarget = (): number => 0.9; // based on https://github.com/postgres/postgres/commit/bbcc4eb2

export const getWalBuffers = (version: number, shared_buffers: string): string => {
	if (version >= 14) {
		return '-1'; // let PostgreSQL manage it automatically
	}
	// Follow auto-tuning guideline for wal_buffers added in 9.1, where it's
	// set to 3% of shared_buffers up to a maximum of 16MB.
	let wal_buffers = Math.floor((3 * fromSizeString(shared_buffers)) / 100);
	const max_wal_buffer = (16 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
	if (wal_buffers > max_wal_buffer) {
		wal_buffers = max_wal_buffer;
	}
	// It's nice of wal_buffers is an even 16MB if it's near that number. Since
	// that is a common case on Windows, where shared_buffers is clipped to 512MB,
	// round upwards in that situation
	const wal_buffer_near = (14 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'];
	if (wal_buffers > wal_buffer_near && wal_buffers < max_wal_buffer) {
		wal_buffers = max_wal_buffer;
	}
	// if less, than 32 kb, than set it to minimum
	if (wal_buffers < 32) {
		wal_buffers = 32;
	}
	return toSizeString(wal_buffers);
};

export const getDefaultStatisticsTarget = (workload: WorkloadType): number => {
	if (workload === 'warehouse') {
		return 500;
	} else {
		return 100;
	}
};

export const getRandomPageCost = (storage_type: StorageType): number => {
	if (storage_type === 'hdd') {
		return 4.0;
	} else {
		return 1.1;
	}
};

export const getEffectiveIoConcurrency = (
	os: OSType,
	storage_type: StorageType,
	num_disks: number
): number | null => {
	if (os !== 'linux') {
		return null;
	}
	if (storage_type === 'ssd') {
		return 200 * Math.ceil(num_disks > 1 ? num_disks / 2 : 1);
	} else if (storage_type === 'hdd') {
		return 2 * Math.ceil(num_disks > 1 ? num_disks / 2 : 1);
	} else {
		return 300 * Math.ceil(num_disks > 1 ? num_disks / 2 : 1);
	}
};

export const getParallelSettings = (
	version: number,
	workload: WorkloadType,
	cpus: number
): Record<string, string | number> => {
	if (cpus < 4) {
		return {};
	}

	let workers_per_gather = Math.ceil(cpus / 2);

	if (workload !== 'warehouse' && workers_per_gather > 4) {
		workers_per_gather = 4; // no clear evidence, that each new worker will provide big benefit for each new core
	}

	const config: Record<string, string | number> = {
		['max_worker_processes']: cpus,
		['max_parallel_workers_per_gather']: workers_per_gather
	};

	if (version >= 10) {
		config['max_parallel_workers'] = cpus;
	}

	if (version >= 11) {
		let parallel_maintenance_workers = cpus > 2 ? Math.floor(cpus / 2) : 1;

		if (parallel_maintenance_workers > 4) {
			parallel_maintenance_workers = 4; // no clear evidence, that each new worker will provide big benefit for each new core
		}

		config['max_parallel_maintenance_workers'] = parallel_maintenance_workers;
	}
	return config;
};

export const getWorkMem = (
	memory_gb: number,
	shared_buffers: string,
	max_conn: number,
	parallel_settings: Record<string, string | number>,
	workload: WorkloadType
): string => {
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
	// work_mem is assigned any time a query calls for a sort, or a hash, or any other structure that needs a space allocation, which can happen multiple times per query. So you're better off assuming max_connections * 2 or max_connections * 3 is the amount of RAM that will actually use in reality. At the very least, you need to subtract shared_buffers from the amount you're distributing to connections in work_mem.
	// The other thing to consider is that there's no reason to run on the edge of available memory. If you do that, there's a very high risk the out-of-memory killer will come along and start killing PostgreSQL backends. Always leave a buffer of some kind in case of spikes in memory usage. So your maximum amount of memory available in work_mem should be (RAM - shared_buffers) / ((max_connections + max_worker_processes) * 3).
	const kbytes = GBtoKBytes(memory_gb);
	let work_mem = (kbytes - fromSizeString(shared_buffers)) / ((max_conn + parallel_work_mem) * 3);
	if (workload in ['webapp', 'oltp']) {
		work_mem = Math.floor(work_mem);
	} else if (workload === 'desktop') {
		work_mem = Math.floor(work_mem / 6);
	} else {
		work_mem = Math.floor(work_mem / 2);
	}
	// if less, than 64 kb, than set it to minimum
	if (work_mem < 64) {
		work_mem = 64;
	}
	return toSizeString(work_mem);
};

export const getWarningMessage = (memory_gb: number) => {
	if (memory_gb > 256) {
		return ['WARNING this tool not being optimal for very high memory systems'];
	}
	return [];
};

export const getWalLevel = (workload: WorkloadType): Record<string, string | number> => {
	if (workload === 'desktop') {
		return {
			['wal_level']: 'minimal',
			// max_wal_senders must be 0 when wal_level=minimal
			['max_wal_senders']: 0
		};
	}

	return {};
};

export const getSuperUserConnections = (workload: WorkloadType): number => {
	if (workload === 'desktop') {
		return 1;
	} else {
		return 3;
	}
};

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
	let settings = defaultSettings;
	settings['max_connections'] = max_conn ?? getMaxConns(workload);
	settings['superuser_reserved_connections'] = getSuperUserConnections(workload);
	settings['shared_buffers'] = getSharedBuffers(memory_gb, workload, os, version);
	settings['effective_cache_size'] = getEffectiveCacheSize(memory_gb, workload);
	settings['maintenance_work_mem'] = getMaintenanceWorkMem(
		memory_gb,
		workload,
		os,
		settings['max_connections'] as number
	);
	settings['huge_pages'] = getHugePages(memory_gb);
	settings['default_statistics_target'] = getDefaultStatisticsTarget(workload);
	settings['random_page_cost'] = getRandomPageCost(storage_type);
	settings['checkpoint_completion_target'] = getCheckpointCompletionTarget();
	settings['max_wal_senders'] = getWalSenders(num_replicas);
	settings['wal_keep_size'] = getWalKeepSize(db_size_gb);
	const effective_io_concurrency = getEffectiveIoConcurrency(os, storage_type, num_disks);
	if (effective_io_concurrency !== null) {
		settings['effective_io_concurrency'] = effective_io_concurrency;
	}
	const parallel_settings = getParallelSettings(version, workload, cpus);
	settings['work_mem'] = getWorkMem(
		memory_gb,
		settings['shared_buffers'],
		settings['max_connections'] as number,
		parallel_settings,
		workload
	);
	settings['wal_buffers'] = getWalBuffers(version, settings['shared_buffers']);
	settings = {
		...settings,
		...parallel_settings,
		...getCheckpointSegments(workload),
		...getArchiveMode(num_replicas),
		...getWalLevel(workload)
	};
	const warnings = getWarningMessage(memory_gb);
	return { settings, warnings };
};
