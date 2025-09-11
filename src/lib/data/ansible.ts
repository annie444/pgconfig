export const ansible = `- name: Fetch PG tuning
  ansible.builtin.uri:
    url: "https://api.example.com/v1/tune?\\
      memory_gb={{ ansible_memory_mb.real.total / 1024 }}&\\
      cpus={{ ansible_processor_vcpus }}&\\
      storage_type=ssd&\\
      workload={{ profile }}&\\
      num_disks={{ ansible_devices.keys() - 1 }}&\\
      num_replicas=2&\\
      db_size_gb=100&\\
      version=17&\\
      os=linux&\\
      backup_method=pg_basebackup"
    method: GET
    return_content: yes
  register: pg_tune

- name: Show warnings
  when:
    - pg_tune.json.warnings is defined
    - pg_tune.json.warnings | length > 0
  ansible.builtin.debug:
    var: pg_tune.json.warnings

- name: Write postgresql.conf overrides
  ansible.builtin.copy:
    dest: /etc/postgresql/postgresql.conf
    content: |
      {% for setting in pg_tune.json | ansible.builtin.dict2items %}
      {{ setting.key }} = {{ setting.value }}
      {% endfor %}`;
