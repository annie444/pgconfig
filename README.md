# PostgreSQL Configuration API

### A script‑friendly alternative to PGTune for generating sensible postgresql.conf settings

[pgconfig.com](https://pgconfig.com) provides a deterministic REST API that recommends PostgreSQL configuration settings based on basic server characteristics. Instead of filling out a form or downloading a binary, you can call a single HTTP endpoint from your CI/CD pipeline, provisioning scripts or one‑liner and get human‑vetted defaults back as JSON.

The service returns exactly the same output for the same input, has no external dependencies and exposes only a single GET endpoint. It can be used directly with tools like curl, wget, Ansible, cloud‑init or Terraform.

---

## Features:

- Deterministic – same inputs always produce the same recommendations, making the output easy to diff and commit ￼.
- Zero dependencies – no SDK or CLI to install; just call the endpoint with your server profile ￼.
- Human‑vetted defaults – sensible, conservative settings that are unlikely to surprise your cluster ￼.
- CI/CD friendly – built for automation; suitable for Ansible, cloud‑init, Terraform, or simple shell scripts ￼.

## Quickstart

To get recommendations you supply a few key parameters in a query string. At minimum you need to specify the operating system, total RAM, CPU count, storage type, workload type, number of disks, and projected database size. Optional parameters allow you to target a specific PostgreSQL version, customise max_connections, indicate the backup method, and include the number of replicas.

Here’s a basic call for a web application running on a Linux host with 32 GB RAM and 8 CPUs on SSD storage:

```shell
curl -sS "https://pgconfig.com/api/v1/tune?\
  memory_gb=32&cpus=8&storage_type=ssd&workload=webapp&\
  num_disks=1&num_replicas=0&db_size_gb=1&version=17&os=linux&\
  backup_method=pg_dump"
```

The response is JSON containing a config object with recommended settings and, optionally, a warnings array. Each value is formatted for direct inclusion in postgresql.conf.

## Example response

```json
{
	"config": {
		"checkpoint_timeout": "15min",
		"checkpoint_completion_target": 0.9,
		"wal_compression": "on",
		"wal_buffers": -1,
		"wal_writer_delay": "200ms",
		"wal_writer_flush_after": "1MB",
		"shared_preload_libraries": "'pg_stat_statements'",
		"track_io_timing": "on",
		"track_functions": "pl",
		"max_worker_processes": 8,
		"max_parallel_workers_per_gather": 2,
		"max_parallel_workers": 8,
		"bgwriter_delay": "200ms",
		"bgwriter_lru_maxpages": 100,
		"bgwriter_lru_multiplier": 2.0,
		"bgwriter_flush_after": 0,
		"enable_partitionwise_join": "on",
		"enable_partitionwise_aggregate": "on",
		"jit": "on",
		"track_wal_io_timing": "on",
		"wal_recycle": "on",
		"max_slot_wal_keep_size": "1GB",
		"archive_mode": "on",
		"archive_command": "/bin/true",
		"min_wal_size": "1GB",
		"max_wal_size": "4GB",
		"max_parallel_maintenance_workers": 2,
		"wal_level": "minimal",
		"max_wal_senders": 0,
		"max_connections": 100,
		"superuser_reserved_connections": 3,
		"shared_buffers": "1GB",
		"effective_cache_size": "3GB",
		"maintenance_work_mem": "256MB",
		"huge_pages": "try",
		"default_statistics_target": 100,
		"random_page_cost": 1.1,
		"wal_keep_size": "3GB",
		"effective_io_concurrency": 200,
		"work_mem": "16MB"
	},
	"warnings": ["WARNING this tool not being optimal for very high memory systems"]
}
```

## API Endpoint

The API exposes a single GET endpoint:

```shell
GET https://pgconfig.com/api/v1/tune
```

You pass tuning parameters as query strings. If a required parameter is missing or invalid the service returns 400 Bad Request with an error message; unexpected failures return 500 Server Error.

## Query parameters

| Parameter     | Type   | Required | Description                                               |
| ------------- | ------ | -------- | --------------------------------------------------------- |
| version       | number | No       | PostgreSQL major version (default 17)                     |
| os            | enum   | Yes      | linux, macos or windows                                   |
| memory_gb     | number | Yes      | Total RAM in GB (e.g. 32)                                 |
| cpus          | number | Yes      | Logical CPU count (e.g. 8)                                |
| storage_type  | enum   | Yes      | hdd, ssd or network                                       |
| workload      | enum   | Yes      | One of webapp, oltp, warehouse, desktop or mixed          |
| max_conn      | number | No       | Target max_connections (derived automatically if omitted) |
| num_disks     | number | Yes      | Number of disks in the cluster                            |
| backup_method | enum   | No       | pg_dump, pg_basebackup or pglogical (defaults to pg_dump) |
| num_replicas  | number | No       | Number of active replicas                                 |
| db_size_gb    | number | Yes      | Projected database size in GB (e.g. 100)                  |

All values should be URL encoded. Omitted optional parameters fall back to sensible defaults derived from the other inputs.

## Responses and errors

The service returns JSON with two top‑level keys:

- config: an object whose keys correspond to postgresql.conf settings and whose values are strings or numbers formatted for direct inclusion ￼.
- warnings: an array of strings containing non‑fatal warnings, or omitted if there are none ￼.

## HTTP status codes:

| Status           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| 200 OK           | Request succeeded; returns recommended settings               |
| 400 Bad Request  | Missing or invalid parameters; returns { "error": "message" } |
| 500 Server Error | Unexpected failure; retry or report                           |

## Examples

Here are some sample invocations:

- OLTP workload on SSD (32 GB RAM, 8 vCPU)

```shell
curl -sS "https://pgconfig.com/api/v1/tune?\
  memory_gb=32&cpus=8&storage_type=ssd&workload=oltp&\
  num_disks=1&num_replicas=0&db_size_gb=1&version=17&os=linux&\
  backup_method=pg_dump"
```

- Ansible snippet – fetch recommended settings and write a configuration file:

```yaml
- name: Fetch PG tuning
  ansible.builtin.uri:
    url: "https://pgconfig.com/api/v1/tune?\
      memory_gb={{ ansible_memory_mb.real.total / 1024 }}&\
      cpus={{ ansible_processor_vcpus }}&\
      storage_type=ssd&\
      workload={{ profile }}&\
      num_disks={{ ansible_devices.keys() - 1 }}&\
      num_replicas=2&\
      db_size_gb=100&\
      version=17&os=linux&\
      backup_method=pg_basebackup"
    method: GET
    return_content: yes
  register: pg_tune

- name: Write postgresql.conf overrides
  ansible.builtin.copy:
    dest: /etc/postgresql/postgresql.conf
    content: |
      {% for setting in pg_tune.json | ansible.builtin.dict2items %}
      {{ setting.key }} = {{ setting.value }}
      {% endfor %}
```

---

### Developing & contributing

This API is released under the MIT License. Pull requests and bug reports are welcome. If you’d like to contribute—whether by improving the tuning rules, adding new parameters, or enhancing the documentation—please open an issue or a PR on the upstream repository.

For local development or self‑hosting, consult the [Svelte](https://svelte.dev/docs/kit/introduction) repository for build instructions. The project is written in TypeScript with `pnpm`.

### Quickstart

```shell
git clone git@github.com:annie444/pgapi.git
cd pgapi
pnpm i
pnpm dev
```

---

### License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
