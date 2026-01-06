import { describe, it, expect } from 'vitest';
import { getPostgresConfig } from '../index';

describe('getPostgresConfig', () => {
	const baseParams = {
		version: 17,
		os: 'linux' as const,
		memory_gb: 8,
		cpus: 8,
		storage_type: 'ssd' as const,
		workload: 'webapp' as const,
		max_conn: 100,
		num_disks: 1,
		backup_method: 'pg_dump' as const,
		num_replicas: 0,
		db_size_gb: 10
	};

	it('returns settings and warnings objects', () => {
		const result = getPostgresConfig(baseParams);
		expect(result).toHaveProperty('settings');
		expect(result).toHaveProperty('warnings');
		expect(typeof result.settings).toBe('object');
		expect(Array.isArray(result.warnings)).toBe(true);
	});

	it('includes all expected PostgreSQL settings', () => {
		const { settings } = getPostgresConfig(baseParams);

		// Core memory settings
		expect(settings).toHaveProperty('shared_buffers');
		expect(settings).toHaveProperty('effective_cache_size');
		expect(settings).toHaveProperty('maintenance_work_mem');
		expect(settings).toHaveProperty('work_mem');
		expect(settings).toHaveProperty('huge_pages');

		// Connection settings
		expect(settings).toHaveProperty('max_connections');
		expect(settings).toHaveProperty('superuser_reserved_connections');

		// WAL settings
		expect(settings).toHaveProperty('wal_buffers');
		expect(settings).toHaveProperty('wal_keep_size');
		expect(settings).toHaveProperty('min_wal_size');
		expect(settings).toHaveProperty('max_wal_size');

		// Checkpoint settings
		expect(settings).toHaveProperty('checkpoint_timeout');
		expect(settings).toHaveProperty('checkpoint_completion_target');

		// Parallelism settings (8 CPUs should trigger these)
		expect(settings).toHaveProperty('max_worker_processes');
		expect(settings).toHaveProperty('max_parallel_workers');
		expect(settings).toHaveProperty('max_parallel_workers_per_gather');

		// Storage settings
		expect(settings).toHaveProperty('random_page_cost');
		expect(settings).toHaveProperty('effective_io_concurrency');
	});

	describe('bug fix verification - workload-based memory allocation', () => {
		// These tests verify that the `in` operator bug is fixed
		// Before the fix, all workloads would get the desktop formula

		it('allocates 1/4 RAM for shared_buffers on webapp workload', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'webapp' });
			// 8GB / 4 = 2GB
			expect(settings.shared_buffers).toBe('2GB');
		});

		it('allocates 1/4 RAM for shared_buffers on oltp workload', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'oltp' });
			expect(settings.shared_buffers).toBe('2GB');
		});

		it('allocates 1/4 RAM for shared_buffers on warehouse workload', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'warehouse' });
			expect(settings.shared_buffers).toBe('2GB');
		});

		it('allocates 1/4 RAM for shared_buffers on mixed workload', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'mixed' });
			expect(settings.shared_buffers).toBe('2GB');
		});

		it('allocates 1/16 RAM for shared_buffers on desktop workload', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'desktop' });
			// 8GB / 16 = 512MB
			expect(settings.shared_buffers).toBe('512MB');
		});
	});

	describe('workload-specific settings', () => {
		it('uses WAL level minimal for desktop', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'desktop' });
			expect(settings.wal_level).toBe('minimal');
			expect(settings.max_wal_senders).toBe(0);
		});

		it('does not set WAL level for non-desktop workloads', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'webapp' });
			expect(settings.wal_level).toBeUndefined();
		});

		it('uses higher statistics target for warehouse', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'warehouse' });
			expect(settings.default_statistics_target).toBe(500);
		});

		it('uses default statistics target for other workloads', () => {
			const { settings } = getPostgresConfig({ ...baseParams, workload: 'webapp' });
			expect(settings.default_statistics_target).toBe(100);
		});
	});

	describe('storage type settings', () => {
		it('uses low random_page_cost for SSD', () => {
			const { settings } = getPostgresConfig({ ...baseParams, storage_type: 'ssd' });
			expect(settings.random_page_cost).toBe(1.1);
		});

		it('uses high random_page_cost for HDD', () => {
			const { settings } = getPostgresConfig({ ...baseParams, storage_type: 'hdd' });
			expect(settings.random_page_cost).toBe(4.0);
		});
	});

	describe('replica settings', () => {
		it('does not set archive mode without replicas', () => {
			const { settings } = getPostgresConfig({ ...baseParams, num_replicas: 0 });
			expect(settings.archive_mode).toBeUndefined();
		});

		it('enables archive mode with replicas', () => {
			const { settings } = getPostgresConfig({ ...baseParams, num_replicas: 1 });
			expect(settings.archive_mode).toBe('on');
			expect(settings.archive_command).toBe('/bin/true');
		});

		it('sets max_wal_senders based on replica count', () => {
			const noReplicas = getPostgresConfig({ ...baseParams, num_replicas: 0 });
			const withReplicas = getPostgresConfig({ ...baseParams, num_replicas: 2 });

			expect(noReplicas.settings.max_wal_senders).toBe(0);
			expect(withReplicas.settings.max_wal_senders).toBe(10);
		});
	});

	describe('version-specific settings', () => {
		it('auto-tunes wal_buffers for PostgreSQL 14+', () => {
			const { settings } = getPostgresConfig({ ...baseParams, version: 14 });
			expect(settings.wal_buffers).toBe('-1');
		});

		it('calculates wal_buffers for PostgreSQL < 14', () => {
			const { settings } = getPostgresConfig({ ...baseParams, version: 13 });
			expect(settings.wal_buffers).not.toBe('-1');
		});
	});

	describe('warnings', () => {
		it('returns empty warnings for normal memory', () => {
			const { warnings } = getPostgresConfig(baseParams);
			expect(warnings).toEqual([]);
		});

		it('returns warning for high memory systems', () => {
			const { warnings } = getPostgresConfig({ ...baseParams, memory_gb: 512 });
			expect(warnings.length).toBeGreaterThan(0);
			expect(warnings[0]).toContain('WARNING');
		});
	});

	describe('OS-specific settings', () => {
		it('sets effective_io_concurrency on Linux', () => {
			const { settings } = getPostgresConfig({ ...baseParams, os: 'linux' });
			expect(settings.effective_io_concurrency).toBeDefined();
		});

		it('does not set effective_io_concurrency on Windows', () => {
			const { settings } = getPostgresConfig({ ...baseParams, os: 'windows' });
			expect(settings.effective_io_concurrency).toBeUndefined();
		});

		it('does not set effective_io_concurrency on macOS', () => {
			const { settings } = getPostgresConfig({ ...baseParams, os: 'macos' });
			expect(settings.effective_io_concurrency).toBeUndefined();
		});
	});
});
