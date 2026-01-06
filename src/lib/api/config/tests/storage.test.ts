import { describe, it, expect } from 'vitest';
import {
	getRandomPageCost,
	getEffectiveIoConcurrency,
	getDefaultStatisticsTarget
} from '../storage';

describe('storage', () => {
	describe('getRandomPageCost', () => {
		it('returns 4.0 for HDD', () => {
			expect(getRandomPageCost('hdd')).toBe(4.0);
		});

		it('returns 1.1 for SSD', () => {
			expect(getRandomPageCost('ssd')).toBe(1.1);
		});

		it('returns 1.1 for network storage', () => {
			expect(getRandomPageCost('network')).toBe(1.1);
		});
	});

	describe('getEffectiveIoConcurrency', () => {
		it('returns null for non-Linux OS', () => {
			expect(getEffectiveIoConcurrency('windows', 'ssd', 1)).toBeNull();
			expect(getEffectiveIoConcurrency('macos', 'ssd', 1)).toBeNull();
		});

		it('returns 200 for single SSD on Linux', () => {
			expect(getEffectiveIoConcurrency('linux', 'ssd', 1)).toBe(200);
		});

		it('returns 2 for single HDD on Linux', () => {
			expect(getEffectiveIoConcurrency('linux', 'hdd', 1)).toBe(2);
		});

		it('returns 300 for single network disk on Linux', () => {
			expect(getEffectiveIoConcurrency('linux', 'network', 1)).toBe(300);
		});

		it('scales with number of disks', () => {
			// 2 disks = 1 pair = 1x multiplier
			expect(getEffectiveIoConcurrency('linux', 'ssd', 2)).toBe(200);
			// 3 disks = ceil(3/2) = 2x multiplier
			expect(getEffectiveIoConcurrency('linux', 'ssd', 3)).toBe(400);
			// 4 disks = 2 pairs = 2x multiplier
			expect(getEffectiveIoConcurrency('linux', 'ssd', 4)).toBe(400);
		});
	});

	describe('getDefaultStatisticsTarget', () => {
		it('returns 500 for warehouse workload', () => {
			expect(getDefaultStatisticsTarget('warehouse')).toBe(500);
		});

		it('returns 100 for webapp workload', () => {
			expect(getDefaultStatisticsTarget('webapp')).toBe(100);
		});

		it('returns 100 for oltp workload', () => {
			expect(getDefaultStatisticsTarget('oltp')).toBe(100);
		});

		it('returns 100 for desktop workload', () => {
			expect(getDefaultStatisticsTarget('desktop')).toBe(100);
		});

		it('returns 100 for mixed workload', () => {
			expect(getDefaultStatisticsTarget('mixed')).toBe(100);
		});
	});
});
