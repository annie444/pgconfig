import { describe, it, expect } from 'vitest';
import { getParallelSettings } from '../parallelism';

describe('parallelism', () => {
	describe('getParallelSettings', () => {
		it('returns empty object for less than 4 CPUs', () => {
			expect(getParallelSettings(17, 'webapp', 1)).toEqual({});
			expect(getParallelSettings(17, 'webapp', 2)).toEqual({});
			expect(getParallelSettings(17, 'webapp', 3)).toEqual({});
		});

		it('returns parallel settings for 4+ CPUs', () => {
			const result = getParallelSettings(17, 'webapp', 4);
			expect(result).toHaveProperty('max_worker_processes', 4);
			expect(result).toHaveProperty('max_parallel_workers_per_gather');
			expect(result).toHaveProperty('max_parallel_workers', 4);
			expect(result).toHaveProperty('max_parallel_maintenance_workers');
		});

		it('sets max_worker_processes equal to CPU count', () => {
			expect(getParallelSettings(17, 'webapp', 8).max_worker_processes).toBe(8);
			expect(getParallelSettings(17, 'webapp', 16).max_worker_processes).toBe(16);
		});

		it('caps max_parallel_workers_per_gather at 4 for non-warehouse', () => {
			// 16 CPUs / 2 = 8, but capped at 4
			expect(getParallelSettings(17, 'webapp', 16).max_parallel_workers_per_gather).toBe(4);
			expect(getParallelSettings(17, 'oltp', 16).max_parallel_workers_per_gather).toBe(4);
			expect(getParallelSettings(17, 'mixed', 16).max_parallel_workers_per_gather).toBe(4);
		});

		it('allows higher max_parallel_workers_per_gather for warehouse', () => {
			// 16 CPUs / 2 = 8, not capped for warehouse
			expect(getParallelSettings(17, 'warehouse', 16).max_parallel_workers_per_gather).toBe(8);
		});

		it('does not include max_parallel_workers for version < 10', () => {
			const result = getParallelSettings(9, 'webapp', 8);
			expect(result).not.toHaveProperty('max_parallel_workers');
		});

		it('includes max_parallel_workers for version >= 10', () => {
			const result = getParallelSettings(10, 'webapp', 8);
			expect(result).toHaveProperty('max_parallel_workers', 8);
		});

		it('does not include max_parallel_maintenance_workers for version < 11', () => {
			const result = getParallelSettings(10, 'webapp', 8);
			expect(result).not.toHaveProperty('max_parallel_maintenance_workers');
		});

		it('includes max_parallel_maintenance_workers for version >= 11', () => {
			const result = getParallelSettings(11, 'webapp', 8);
			expect(result).toHaveProperty('max_parallel_maintenance_workers', 4);
		});

		it('caps max_parallel_maintenance_workers at 4', () => {
			// 16 CPUs / 2 = 8, but capped at 4
			expect(getParallelSettings(17, 'webapp', 16).max_parallel_maintenance_workers).toBe(4);
		});
	});
});
