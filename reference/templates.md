# Template variables

The values in `env:`, `databases:`, `services.<name>.cmd`, and a handful
of other fields are templates. Pomelo resolves them when materializing
each workspace, substituting values from the shared services, other repos'
services, named databases, and the workspace's branch.

Templates use **dot-notation**: `{{ <source>.<name>[.<field>] }}`. Every
reference is **validated at load** — a typo, a renamed alias, or a missing
database name fails loudly with a clear error instead of breaking silently
at runtime.

## Catalog

Grouped by source.

### Shared services — `{{shared.<name>.*}}`

| Field | Resolves to | Example |
| --- | --- | --- |
| `.url` | Conn `user:pass@host:port` | `postgres:postgres@localhost:44800` |
| `.host` | Host (always `localhost` on the host) | `localhost` |
| `.port` | Port | `44800` |
| `.user` / `.pass` | Credentials | `postgres` |
| `.slot` | Capacity slot index (e.g. Redis DB number) | `3` |

Bare `{{shared.<name>}}` is the same as `.url`.

### Databases — `{{db.<name>[.url]}}`

| Template | Resolves to | Example |
| --- | --- | --- |
| `{{db.<name>}}` | Named database (session-prefixed, branch-resolved) | `myproject_feat_login` |
| `{{db.<name>.url}}` | Full `postgres://…/<db>` via the shared postgres | `postgres://…:44800/myproject_feat_login` |

### Cross-service — `{{<repo>.<service>.*}}`

| Field | Resolves to | Example |
| --- | --- | --- |
| `.url` | Service base URL (profile-aware) | `http://api.api.feat-login.localhost:8767` |
| `.path` | Same-origin dev-proxy path | `/_pom_dev/api/api` |
| `.host` | Service hostname | `api.api.feat-login.localhost` |
| `.port` | Allocated port | `41000` |
| `.ws` | WebSocket URL (`http`→`ws`) | `ws://api.api.feat-login.localhost:8767` |

Bare `{{<repo>.<service>}}` is the same as `.url`.

### Branch — `{{branch[.*]}}`

| Template | Resolves to | Example |
| --- | --- | --- |
| `{{branch}}` | The raw branch name | `feat/login` |
| `{{branch.safe}}` | `/` and `-` → `_` (safe for DB names) | `feat_login` |
| `{{branch.host}}` | DNS label (`a-z0-9-`) | `feat-login` |
| `{{branch.hash}}` | Short stable hash of the branch | `a1b2c3` |

### Other

| Template | Resolves to | Example |
| --- | --- | --- |
| `{{secret.<NAME>}}` | Value from the secrets store | `sk_live_…` |
| `{{slot.<name>}}` | Allocated slot index for a capacity-limited service | `3` |
| `{{bind_ip}}` | Service bind address — always `127.0.0.1` | `127.0.0.1` |

## Shared services: `{{shared.<name>.*}}`

Wire every declared shared service into the repos that use it. A shared
service you declare but never reference is flagged by `pom` (the config
doctor calls it *unwired*) — its container starts but nothing connects.

```yaml
shared_services:
  postgres: {}     # well-known defaults fill image/port/creds
  redis: {}
  opensearch: {}
env:
  DATABASE_URL:  postgresql://{{shared.postgres.url}}/{{db.main}}?schema=public
  REDIS_URL:     redis://{{shared.redis.host}}:{{shared.redis.port}}/{{shared.redis.slot}}
  OPENSEARCH_URL: http://{{shared.opensearch.host}}:{{shared.opensearch.port}}
```

## Named databases: `{{db.<name>}}`

Databases are a named map, referenced by name — never by position:

```yaml
databases:
  main: {}
  test: {}
env:
  DATABASE_URL: "postgresql://{{shared.postgres.url}}/{{db.main}}"
```

## Cross-service URLs: `{{<repo>.<service>.url}}`

Reference another repo's service by its alias and service name. The `.url`
form is **profile-aware** — an `environments` override retargets it to a
remote host for the active profile; on `local` it points at the dev-proxy.
The `.path` form is always the same-origin route (`/_pom_dev/<repo>/<service>`),
so a frontend can call the backend without CORS.

```yaml
env:
  WORKER_URL: '{{worker.api.url}}'      # the `api` service of the `worker` repo
  NEXT_PUBLIC_API_URL: '{{api.server.path}}'   # same-origin: /_pom_dev/api/server
```

Switch a service between local and a deployed backend with a top-level
[`environments`](./config#environments-profiles) profile — no template
change needed.

## Where they work

- `repos.<repo>.env` (flat, file-keyed, or `"*"` shared base)
- `repos.<repo>.databases`
- `repos.<repo>.services.<svc>.env` and `.cmd`
- `shared_services.<svc>.environment`
- `environments.<profile>` override values

Anywhere else, templates are left untouched.

## Resolving example

Given a workspace on branch `feat/login` and `session: myproject`:

```yaml
databases:
  main: {}
env:
  DATABASE_URL: "postgresql://{{shared.postgres.url}}/{{db.main}}"
  REDIS_URL: "redis://{{shared.redis.host}}:{{shared.redis.port}}/{{shared.redis.slot}}"
```

becomes

```
DATABASE_URL=postgresql://postgres:postgres@localhost:44800/myproject_feat_login
REDIS_URL=redis://localhost:44801/3
```
