# Template variables

The values in `env:` (repo and service level) are templates. Pomelo
resolves them when materializing each workspace, substituting values from
the shared services, other repos' services, named databases, secrets and
the workspace's branch.

Templates use **dot-notation**: `{{ <source>.<name>[.<field>] }}`. Old
colon-form tokens (`{{conn:x}}`, `{{db:x}}`, ...) are rejected at load, and
**Normalize** rewrites them. An unknown reference is left as-is in the
output so it is easy to spot, and the config doctor warns about secrets
with no stored value and shared services nothing references.

## Catalog

Grouped by source.

### Shared services - `{{shared.<name>.*}}`

| Field | Resolves to | Example |
| --- | --- | --- |
| `.url` | Conn `user:pass@host:port`; `host:port` for a service with no login (Redis); `http://127.0.0.1:<port>` for a `cmd` service | `postgres:postgres@127.0.0.1:5432` |
| `.host` | Host (always `127.0.0.1`) | `127.0.0.1` |
| `.port` | Port | `5432` |
| `.user` / `.pass` | Credentials (`postgres` for a Postgres that sets none; empty otherwise) | `postgres` |
| `.slot` | Capacity slot index (e.g. Redis DB number) | `3` |

Bare `{{shared.<name>}}` is the same as `.url`.

### Databases - `{{db.<name>[.url]}}`

| Template | Resolves to | Example |
| --- | --- | --- |
| `{{db.<name>}}` | Named database (session-prefixed, branch-resolved) | `myproject_feat_login` |
| `{{db.<name>.url}}` | Full `postgres://.../<db>` via the shared postgres | `postgres://postgres:postgres@127.0.0.1:5432/myproject_feat_login` |

### Cross-service - `{{<repo>.<service>.*}}`

`<repo>` is the repo's key or its alias.

| Field | Resolves to | Example |
| --- | --- | --- |
| `.url` | Service base URL (profile-aware) | `http://server.api.feat-login.localhost:8767` |
| `.path` | Same-origin dev-proxy path | `/_pom_dev/api/server` |
| `.host` | Service hostname | `server.api.feat-login.localhost` |
| `.port` | Allocated port | `41000` |
| `.ws` | WebSocket URL (`http` -> `ws`, `https` -> `wss`) | `ws://server.api.feat-login.localhost:8767` |

Bare `{{<repo>.<service>}}` is the same as `.url`. On a branch that starts
with a ticket key (`proj-101-login`) the hostname uses just the key:
`server.api.proj-101.localhost`.

### Branch - `{{branch[.*]}}`

| Template | Resolves to | Example |
| --- | --- | --- |
| `{{branch}}` | The raw branch name | `feat/login` |
| `{{branch.safe}}` | `/` -> `_` (hyphens are kept) | `feat_login` |
| `{{branch.host}}` | DNS label (`a-z0-9-`, at most 63 chars) | `feat-login` |
| `{{branch.hash}}` | 8-char stable hash of the branch | `5d5c6df1` |

### Other

| Template | Resolves to | Example |
| --- | --- | --- |
| `{{secret.<NAME>}}` | Value from the project's encrypted secrets | `sk_test_...` |
| `{{slot.<name>}}` | Allocated slot index for a capacity-limited service (0 when none) | `3` |
| `{{bind_ip}}` | Service bind address - always `127.0.0.1` | `127.0.0.1` |

Secrets are managed in the Services panel's **Secrets** tab. A new
project's gitignored `.env` values are stored there when it is created.

## Shared services: `{{shared.<name>.*}}`

Wire every declared shared service into the repos that use it. A shared
service you declare but never reference with a `{{shared.<name>.<field>}}`
is flagged by the config doctor as *unwired* - its container starts but
nothing connects.

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

Databases are a named map of name to template, referenced by name - never by
position:

```yaml
databases:
  main: "{{branch.safe}}"
  test: "{{branch.safe}}_test"
env:
  DATABASE_URL: "postgresql://{{shared.postgres.url}}/{{db.main}}"
```

## Cross-service URLs: `{{<repo>.<service>.url}}`

Reference another repo's service by its repo key or alias and the service
name. The `.url` form is **profile-aware** - an `environments` override
retargets it to a remote host for the active profile; on `local` it points
at the dev-proxy. The `.path` form is always the same-origin route
(`/_pom_dev/<repo>/<service>`), so a frontend can call the backend without
CORS.

```yaml
env:
  WORKER_URL: '{{worker.api.url}}'      # the `api` service of the `worker` repo
  NEXT_PUBLIC_API_URL: '{{api.server.path}}'   # same-origin: /_pom_dev/api/server
```

Switch a service between local and a deployed backend with a top-level
[`environments`](./config#environments-profiles) profile - no template
change needed.

## Where they work

- `repos.<repo>.env` (flat, file-keyed, or `"*"` shared base)
- `repos.<repo>.services.<svc>.env`
- `repos.<repo>.databases` - only the `{{branch...}}` tokens

Everything else (`cmd`, `shared_services`, `environments` values) is used as
written. In a `cmd`, use `$PORT`, `$BIND_IP` or any env var the service
gets.

## Resolving example

Given a workspace on branch `feat/login` and `session: myproject`:

```yaml
databases:
  main: "{{branch.safe}}"
env:
  DATABASE_URL: "postgresql://{{shared.postgres.url}}/{{db.main}}"
  REDIS_URL: "redis://{{shared.redis.host}}:{{shared.redis.port}}/{{shared.redis.slot}}"
```

becomes

```
# Auto-generated by pom. Do not commit.
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/myproject_feat_login
REDIS_URL=redis://127.0.0.1:6379/3
```
