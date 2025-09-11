import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';

export interface QueryParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

export const columns: ColumnDef<QueryParam>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => {
      const snippet = createRawSnippet < [string] > ((name: () => string) => {
        return {
          render: () => `<span class="snippet">${name()}</span>`
        };
      });
      return renderSnippet(snippet, getValue() as string);
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => {
      const snippet = createRawSnippet < [string] > ((type: () => string) => {
        return {
          render: () => `<span class="snippet">${type()}</span>`
        };
      });
      return renderSnippet(snippet, getValue() as string);
    }
  },
  {
    accessorKey: 'required',
    header: 'Required',
    cell: ({ getValue }) => (getValue() ? 'Yes' : 'No')
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const snippet = createRawSnippet < [string] > ((desc: () => string) => {
        let descValue = desc();
        if (descValue.includes('`')) {
          // Replace backticks with <code> tags for inline code formatting
          descValue = descValue.replace(/`([^`]+)`/g, '<span class="kbd">$1</span>');
        }
        console.log('Rendered description:', descValue);
        return {
          render: () => `<span>${descValue}</span>`
        };
      });
      return renderSnippet(snippet, row.getValue('description'));
    }
  },
  {
    accessorKey: 'example',
    header: 'Example',
    cell: ({ getValue }) => {
      const snippet = createRawSnippet < [string] > ((example: () => string) => {
        return {
          render: () => `<span class="snippet">${example()}</span>`
        };
      });
      return renderSnippet(snippet, getValue() as string);
    }
  }
];

export const queryParams: QueryParam[] = [
  {
    name: 'version',
    type: 'number',
    required: false,
    description: 'PostgreSQL major version',
    example: '17'
  },
  {
    name: 'os',
    type: 'enum',
    required: true,
    description: '`linux` | `macos` | `windows`',
    example: 'linux'
  },
  {
    name: 'memory_gb',
    type: 'number',
    required: true,
    description: 'Total RAM in GB',
    example: '32'
  },
  {
    name: 'cpus',
    type: 'number',
    required: true,
    description: 'Logical CPU count',
    example: '8'
  },
  {
    name: 'storage_type',
    type: 'enum',
    required: true,
    description: '`hdd` | `ssd` | `network`',
    example: 'ssd'
  },
  {
    name: 'workload',
    type: 'enum',
    required: true,
    description: '`webapp` | `oltp` | `warehouse` | `desktop` | `mixed`',
    example: 'oltp'
  },
  {
    name: 'max_conn',
    type: 'number',
    required: false,
    description: 'Target `max_connections` (derived from profile)',
    example: '100'
  },
  {
    name: 'num_disks',
    type: 'number',
    required: true,
    description: 'Number of disks used in the cluster',
    example: '1'
  },
  {
    name: 'backup_method',
    type: 'enum',
    required: false,
    description: '`pg_dump` (default) | `pg_basebackup` | `pglogical` (or any logical backup)',
    example: 'pg_dump'
  },
  {
    name: 'num_replicas',
    type: 'number',
    required: false,
    description: 'The number of active replicas',
    example: '0'
  },
  {
    name: 'db_size_gb',
    type: 'number',
    required: true,
    description: 'The projected size in GB',
    example: '100'
  }
];
