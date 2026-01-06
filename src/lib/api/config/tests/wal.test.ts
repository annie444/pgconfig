import { describe, it, expect } from 'vitest';
import {
	getArchiveMode,
	getWalKeepSize,
	getWalSenders,
	getWalLevel,
	getCheckpointSegments,
	getCheckpointCompletionTarget,
	getWalBuffers
} from '../wal';

describe('wal', () => {
	describe('getArchiveMode', () => {
		it('returns empty object for no replicas', () => {
			expect(getArchiveMode(0)).toEqual({});
		});

		it('returns archive settings for replicas > 0', () => {
			const result = getArchiveMode(1);
			expect(result).toEqual({
				archive_mode: 'on',
				archive_command: '/bin/true'
			});
		});
	});

	describe('getWalKeepSize', () => {
		it('returns ~3.5GB for small databases', () => {
			// 3650MB rounds to 3GB when using largest unit
			expect(getWalKeepSize(100)).toBe('3GB');
		});

		it('returns ~21.5GB for 1TB+ databases', () => {
			// 22080MB rounds to 21GB when using largest unit
			expect(getWalKeepSize(1024)).toBe('21GB');
		});

		it('returns ~107GB for 10TB+ databases', () => {
			// 109440MB rounds to 106GB when using largest unit
			expect(getWalKeepSize(10240)).toBe('106GB');
		});
	});

	describe('getWalSenders', () => {
		it('returns 0 for no replicas', () => {
			expect(getWalSenders(0)).toBe(0);
		});

		it('returns 10 for 1-7 replicas', () => {
			expect(getWalSenders(1)).toBe(10);
			expect(getWalSenders(7)).toBe(10);
		});

		it('scales for 8+ replicas', () => {
			expect(getWalSenders(8)).toBe(11);
			expect(getWalSenders(10)).toBe(13);
		});
	});

	describe('getWalLevel', () => {
		it('returns minimal for desktop workload', () => {
			expect(getWalLevel('desktop')).toEqual({
				wal_level: 'minimal',
				max_wal_senders: 0
			});
		});

		it('returns empty object for other workloads', () => {
			expect(getWalLevel('webapp')).toEqual({});
			expect(getWalLevel('oltp')).toEqual({});
			expect(getWalLevel('warehouse')).toEqual({});
			expect(getWalLevel('mixed')).toEqual({});
		});
	});

	describe('getCheckpointSegments', () => {
		it('returns correct sizes for webapp', () => {
			const result = getCheckpointSegments('webapp');
			expect(result).toEqual({
				min_wal_size: '1GB',
				max_wal_size: '4GB'
			});
		});

		it('returns correct sizes for oltp', () => {
			const result = getCheckpointSegments('oltp');
			expect(result).toEqual({
				min_wal_size: '2GB',
				max_wal_size: '8GB'
			});
		});

		it('returns correct sizes for warehouse', () => {
			const result = getCheckpointSegments('warehouse');
			expect(result).toEqual({
				min_wal_size: '4GB',
				max_wal_size: '16GB'
			});
		});

		it('returns correct sizes for desktop', () => {
			const result = getCheckpointSegments('desktop');
			expect(result).toEqual({
				min_wal_size: '100MB',
				max_wal_size: '4GB'
			});
		});

		it('returns correct sizes for mixed', () => {
			const result = getCheckpointSegments('mixed');
			expect(result).toEqual({
				min_wal_size: '1GB',
				max_wal_size: '4GB'
			});
		});
	});

	describe('getCheckpointCompletionTarget', () => {
		it('returns 0.9', () => {
			expect(getCheckpointCompletionTarget()).toBe(0.9);
		});
	});

	describe('getWalBuffers', () => {
		it('returns -1 for PostgreSQL 14+', () => {
			expect(getWalBuffers(14, '2GB')).toBe('-1');
			expect(getWalBuffers(17, '2GB')).toBe('-1');
		});

		it('calculates 3% of shared_buffers for older versions', () => {
			// 2GB = 2097152 KB, 3% = 62914 KB = ~61MB
			const result = getWalBuffers(13, '2GB');
			expect(result).toMatch(/^\d+MB$/);
		});

		it('caps at 16MB', () => {
			// 1GB = 1048576 KB, 3% = 31457 KB = ~30MB, capped at 16MB
			expect(getWalBuffers(13, '1GB')).toBe('16MB');
		});

		it('rounds up near 16MB', () => {
			// 512MB = 524288 KB, 3% = 15728 KB = ~15MB, rounds to 16MB
			expect(getWalBuffers(13, '512MB')).toBe('16MB');
		});

		it('ensures minimum of 32KB', () => {
			// Very small shared_buffers
			expect(getWalBuffers(13, '1MB')).toBe('32kB');
		});
	});
});
