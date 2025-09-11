import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function sanitizeUrl(url: string | URL) {
	if (url instanceof URL) {
		url = url.origin.toString();
	} else {
		return url.replace('http://', '').replace('https://', '').replace(/\/.*/, '');
	}
}

export function pad(num: number, padding: number = 2): string {
	return num.toString().padStart(padding, '0');
}

export class LastModDate {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	direction?: '+' | '-';
	offset?: number | { hours: number; minutes: number };

	constructor(
		year: number,
		month: number,
		day: number,
		hour: number,
		minute: number,
		second: number,
		direction?: '+' | '-',
		offset?: number | { hours: number; minutes: number }
	) {
		this.year = year;
		this.month = month - 1; // The month is zero-based in JavaScript Date
		this.day = day;
		this.hour = hour;
		this.minute = minute;
		this.second = second;
		if (offset && !direction) {
			throw new Error('If an offset is specified, a direction must also be specified.');
		}
		this.direction = direction;
		this.offset = offset;
	}

	toString(): string {
		return `${this.year}-${pad(this.month)}-${pad(this.day)}T${pad(this.hour)}:${pad(
			this.minute
		)}:${pad(this.second)}${this.offset ? (typeof this.offset === 'number' ? `${this.direction}${pad(this.offset)}:00` : `${this.direction}${pad(this.offset.hours)}:${this.offset.minutes}`) : 'Z'}`;
	}
}

export function toISOStringWithOffset(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	const offset = String(date.getTimezoneOffset() / 60).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-${offset}:00`;
}

export function dateToString(date: Date | LastModDate | string): string {
	if (typeof date === 'string') {
		return date;
	} else if (date instanceof Date) {
		return toISOStringWithOffset(date);
	} else if (date instanceof LastModDate) {
		return date.toString();
	} else {
		throw new Error('Invalid date type');
	}
}
