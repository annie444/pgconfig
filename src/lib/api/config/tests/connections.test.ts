import { describe, it, expect } from 'vitest';
import { getMaxConns, getSuperUserConnections } from '../connections';

describe('connections', () => {
	describe('getMaxConns', () => {
		it('returns 200 for webapp workload', () => {
			expect(getMaxConns('webapp')).toBe(200);
		});

		it('returns 300 for oltp workload', () => {
			expect(getMaxConns('oltp')).toBe(300);
		});

		it('returns 40 for warehouse workload', () => {
			expect(getMaxConns('warehouse')).toBe(40);
		});

		it('returns 20 for desktop workload', () => {
			expect(getMaxConns('desktop')).toBe(20);
		});

		it('returns 100 for mixed workload', () => {
			expect(getMaxConns('mixed')).toBe(100);
		});
	});

	describe('getSuperUserConnections', () => {
		it('returns 1 for desktop workload', () => {
			expect(getSuperUserConnections('desktop')).toBe(1);
		});

		it('returns 3 for webapp workload', () => {
			expect(getSuperUserConnections('webapp')).toBe(3);
		});

		it('returns 3 for oltp workload', () => {
			expect(getSuperUserConnections('oltp')).toBe(3);
		});

		it('returns 3 for warehouse workload', () => {
			expect(getSuperUserConnections('warehouse')).toBe(3);
		});

		it('returns 3 for mixed workload', () => {
			expect(getSuperUserConnections('mixed')).toBe(3);
		});
	});
});
