import { describe, it, expect } from 'vitest';
import {
	GBtoKB,
	MBtoKB,
	TBtoKB,
	fromSizeString,
	fromSizeStringToKB,
	toSizeString
} from '../size-utils';

describe('size-utils', () => {
	describe('GBtoKB', () => {
		it('converts 1GB to KB', () => {
			expect(GBtoKB(1)).toBe(1048576);
		});

		it('converts 8GB to KB', () => {
			expect(GBtoKB(8)).toBe(8388608);
		});

		it('converts 32GB to KB', () => {
			expect(GBtoKB(32)).toBe(33554432);
		});
	});

	describe('MBtoKB', () => {
		it('converts 1MB to KB', () => {
			expect(MBtoKB(1)).toBe(1024);
		});

		it('converts 512MB to KB', () => {
			expect(MBtoKB(512)).toBe(524288);
		});
	});

	describe('TBtoKB', () => {
		it('converts 1TB to KB', () => {
			expect(TBtoKB(1)).toBe(1073741824);
		});
	});

	describe('fromSizeString', () => {
		it('parses KB values', () => {
			expect(fromSizeString('16KB')).toBe(16384);
		});

		it('parses MB values', () => {
			expect(fromSizeString('512MB')).toBe(536870912);
		});

		it('parses GB values', () => {
			expect(fromSizeString('1GB')).toBe(1073741824);
		});

		it('parses TB values', () => {
			expect(fromSizeString('1TB')).toBe(1099511627776);
		});

		it('throws on invalid format', () => {
			expect(() => fromSizeString('invalid')).toThrow('Invalid size string');
		});
	});

	describe('fromSizeStringToKB', () => {
		it('converts size string to KB', () => {
			expect(fromSizeStringToKB('1GB')).toBe(1048576);
			expect(fromSizeStringToKB('512MB')).toBe(524288);
			expect(fromSizeStringToKB('16KB')).toBe(16);
		});
	});

	describe('toSizeString', () => {
		it('formats TB values', () => {
			expect(toSizeString(1073741824)).toBe('1TB');
		});

		it('formats GB values', () => {
			expect(toSizeString(1048576)).toBe('1GB');
			expect(toSizeString(2097152)).toBe('2GB');
		});

		it('formats MB values', () => {
			expect(toSizeString(1024)).toBe('1MB');
			expect(toSizeString(524288)).toBe('512MB');
		});

		it('formats KB values', () => {
			expect(toSizeString(100)).toBe('100kB');
			expect(toSizeString(64)).toBe('64kB');
		});

		it('uses largest appropriate unit', () => {
			// Just under 1MB should be KB
			expect(toSizeString(1023)).toBe('1023kB');
			// Exactly 1MB should be MB
			expect(toSizeString(1024)).toBe('1MB');
		});
	});
});
