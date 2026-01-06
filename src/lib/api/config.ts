/**
 * PostgreSQL Configuration API - Facade Module
 *
 * This file maintains backwards compatibility by re-exporting from the
 * refactored modular structure in ./config/
 *
 * External consumers should continue to import from this file:
 *   import { getPostgresConfig } from '$lib/api/config';
 */

// Main API function
export { getPostgresConfig } from './config/index';

// Types
export type { WorkloadType, StorageType, OSType } from './config/types';

// Initial state for forms/UI
export { initialState } from './config/defaults';
