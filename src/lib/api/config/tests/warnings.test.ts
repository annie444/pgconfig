import { describe, it, expect } from 'vitest';
import { getWarningMessage } from '../warnings';

describe('warnings', () => {
	describe('getWarningMessage', () => {
		it('returns empty array for memory <= 256GB', () => {
			expect(getWarningMessage(256)).toEqual([]);
			expect(getWarningMessage(128)).toEqual([]);
			expect(getWarningMessage(1)).toEqual([]);
		});

		it('returns warning for memory > 256GB', () => {
			const result = getWarningMessage(257);
			expect(result).toHaveLength(1);
			expect(result[0]).toContain('WARNING');
			expect(result[0]).toContain('high memory');
		});

		it('returns warning for very high memory systems', () => {
			const result = getWarningMessage(512);
			expect(result).toHaveLength(1);
		});
	});
});
