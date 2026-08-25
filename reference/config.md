# `pom.yml` reference

The project config. Pomelo walks up from the current directory looking
for this file — keep it at the monorepo root.

## Splitting into multiple files

When one file gets unwieldy, drop a `pom.d/` directory next to `pom.yml`.
Every `pom.d/**/*.yml` (walked recursively, lexical order) is **deep-merged**
into the root on load, so the root stays a small index and the bulk lives in
fragments:

```
pom.yml                    # session, default_branch — a tiny index
pom.d/
  environments.yml
  presets.yml
  shared-services.yml
  repos/
    01-api.yml             # { repos: { api: … } } — one repo per file
    02-web.yml
```

Maps merge by key (a fragment's repos add to the root's), existing keys keep
their order and new ones append — so port/ordering stays stable. A single
`pom.yml` with no `pom.d/` works exactly as before.

You don't have to split — a single `pom.yml` works exactly as before. When you
do, keep the small stuff (session, defaults, …) in `pom.yml` and move `repos`,
`environments`, `presets` and `shared_services` into fragments under `pom.d/`.
Files load in lexical order (hence the `01-`/`02-` prefix), but you can also
reorder repos in the app.

::: tip Editing a split config
The app's **Project** config editor opens the merged view; when the config is
split it resolves the right `pom.d/**` fragment automatically. Every save is
validated against the full merged config before it lands.
:::

## Top level

```yaml
session: myproject              # project name (namespaces state, holders, databases)
default_branch: main            # global default git branch
preset: dev-tools               # optional preset name applied to every repo

environments:                   # per-profile URL overrides (see below)
  staging:
    api.server: "https://api.acme.dev"   # {{api.server.url}} resolves here on staging

presets: { ... }                # see "Presets" below
shared_services: { ... }        # see "Shared services" below
repos: { ... }                  # see "Repos" below
```

::: tip Editor is a per-user app setting
Which GUI editor ⌘E opens (VS Code, Cursor, Zed, …) is chosen in the app's
**Settings › General**, not in `pom.yml` — it's a personal preference, not
shared project config.
:::

### Environments & profiles

**`environments:`** (top-level) defines alternate environments — each remaps a
`<repo>.<service>` to a **non-local** address (a deployed server, a shared DB),
so `{{<repo>.<service>.url}}` resolves there instead of the workspace's own
service.

**`profiles:`** (repo or service level) picks which of those environments the
repo offers. `local` is always implicit; switch the active one from the service
card.

```yaml
repos:
  api:
    profiles: [local, staging]              # environments this repo can pick
    services:
      server: { cmd: go run . serve, port: true }
  web:
    env:
      VITE_API_URL: "{{api.server.url}}"    # local, or the staging override

environments:
  staging:
    api.server: "https://api.acme.dev"      # {{api.server.url}} → this on staging
```

## Repos

A repo splits into **identity** (what it is — spec + env + services) and
**`lifecycle`** (how a workspace is set up, run day-to-day, and torn down):

```yaml
repos:
  api:
    # identity
    alias: api                 # display label only — never referenced
    default_branch: master     # override global default for this repo
    preset: shared-infra       # apply a preset
    pre_start: nvm use         # one-shot hook before any service runs
    profiles: [local, staging] # environments this repo can pick (default [local])
    seed_from_main: true       # inherit prepared DBs / deps from main

    databases:                 # named — auto-created per workspace
      main: "{{branch.safe}}"
      test: "{{branch.safe}}_test"
    env:                       # env templates (resolved per workspace)
      DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.main}}"
    services:
      server:
        cmd: go run . serve      # another repo reaches it as {{api.server.url}}
        port: true
      worker:
        cmd: go run . worker

    # lifecycle — the ops side, kept out of identity
    lifecycle:
      copy: [.env, .env.secrets] # files copied from repo into each worktree
      commands:                  # named recipe — the agent & pipeline run these
        install: go mod download
        migrate: go run . migrate
      shortcuts:                 # quick commands surfaced in the ⚡ menu
        - cmd: go test ./...     # runs in the worktree with the workspace's
          desc: Run tests        # resolved env already sourced
```

| Field | Description |
| --- | --- |
| `alias` | Display label in the web UI. **Not** referenced by templates — rename freely. |
| `default_branch` | Override the global default branch for this repo. |
| `preset` | Apply a named [preset](#presets). |
| `pre_start` | One-shot command run before any service in this repo (e.g. `nvm use`). |
| `profiles` | Environments this repo's services can pick (default `[local]`); defined under top-level `environments`. A service can narrow it. |
| `env` | Env vars to generate. Flat map → `.env.local`, or file-keyed (see below). Uses [templates](./templates). |
| `databases` | **Named** map (`name: template`); auto-created per workspace. Referenced as `{{db.name}}`. |
| `seed_from_main` | Clone this repo's DBs from the **main** workspace's copies instead of creating them empty; skips `lifecycle.seed`. See below. |
| `services` | Named services. See [Services](../docs/services). |
| `lifecycle` | The ops side — set up / run / tear down. See below. |

The **`lifecycle:`** block keeps ops out of the repo's identity:

| `lifecycle` field | Description |
| --- | --- |
| `copy` | Files copied from the source repo into each worktree. |
| `commands` | Named canonical commands (`install`, `migrate`, `lint`, `test`, …). The AI agent and the create pipeline run *these* instead of guessing. |
| `setup` | Ordered steps run automatically right after the worktree is created. |
| `seed` | Seed steps for a fresh database (skipped when `seed_from_main`). |
| `shortcuts` | Quick commands surfaced in a service card's ⚡ menu. |
| `pre_delete` | Commands run before the worktree is deleted. |

### Faster workspaces — inherit prepared state from `main`

Set up the **main** workspace once (install deps, migrate + seed its DBs) and
new workspaces copy that prepared state instead of rebuilding it. `main` runs
services normally — it's the golden source.

```yaml
repos:
  api:
    seed_from_main: true   # clone api's DBs from main (CREATE DATABASE … TEMPLATE)
```

- **Databases** — `seed_from_main: true` clones the repo's DBs from main's
  counterparts in seconds (with main's sample data) rather than creating them
  empty + re-seeding; the repo's own `seed` is skipped. Missing main DB → empty
  create fallback.
- **node_modules** — a fresh worktree seeds `node_modules` from a hash-keyed
  store built off main's installed copy, materialized copy-on-write (APFS
  clonefile / Linux reflink) so the install is a near-no-op and the tree shares
  disk blocks. Automatic for non-pnpm repos; pnpm repos are skipped (pnpm's own
  store already dedupes). Keyed by lockfile hash, so bumping deps on one branch
  doesn't disturb others.
- **Long branch → short workspace name** — creating a workspace from a very long
  branch derives a concise workspace name (folder + hostnames) via a one-shot
  `claude` call, while the long branch stays the git branch each repo checks
  out. So a long `feat-123-add-a-really-long-descriptive-…` branch becomes a
  short `workspace--feat-123-add-login` with clean
  `api.feat-123-add-login.localhost` hostnames.

### `env`: one key, three forms

There is no separate `env_output` — the `env` key both holds the
variables and decides the target file(s):

```yaml
# 1. Flat → written to .env.local
env:
  DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.main}}"

# 2. File-keyed → each file gets exactly its own vars
env:
  .env.development.local:
    DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.dev}}"
  .env.test.local:
    DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.test}}"

# 3. File-keyed + shared base ("*" applies to every file)
env:
  "*":
    REDIS_URL: "redis://{{shared.redis.host}}:{{shared.redis.port}}/{{shared.redis.slot}}"
  .env.development.local:
    DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.dev}}"
  .env.test.local:
    DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.test}}"
```

A file-specific value overrides `"*"`.

## Shared services

**Well-known services ship with built-in defaults** — `postgres`, `redis`,
`minio`, and `opensearch`. Just name the service and Pomelo fills in the
image, ports, environment, volumes, healthcheck and credentials:

```yaml
shared_services:
  postgres:                    # full postgres:16 config, filled in
  redis:                       # redis:7-alpine + appendonly
  minio:
  opensearch:
```

Any field you set **overrides** the default (and `environment` maps merge):

```yaml
shared_services:
  postgres:
    image: postgres:15         # override just the version; the rest is default
  cache:
    type: redis                # a differently-named service picks a template via `type`
    capacity: 32               # override one field
```

Spell out everything for a **custom** (non-well-known) service:

```yaml
shared_services:
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672", "15672"]
```

Host ports are dynamically allocated from the workspace pool; you never
hard-code them.

| Field | Description |
| --- | --- |
| `image` | Docker image. |
| `ports` | Container ports; host ports are picked from the dynamic pool. |
| `environment` | Container env vars. |
| `volumes` | Volume mounts. |
| `command` | Override container command. |
| `healthcheck` | Pomelo waits for the healthcheck before marking the service ready. |
| `db_user` / `db_password` | Credentials for auto database creation. |
| `capacity` | Max slots per instance (auto-scales when exceeded). |
| `type` | Well-known template to base this service on (defaults to the service's name). |

### Fixed shared ports — `shared_stable_ports`

By default a shared service's host port is random (freed and re-picked as the
port pool moves). If you want to configure an external tool once — **DataGrip**,
`psql` — pin them:

```yaml
shared_stable_ports: true
shared_services:
  postgres:
  redis:
  minio:
  opensearch:
```

Each shared service is then pinned to the same deterministic local port
(`20000–29999`, a pure function of session + service name). The generated
docker-compose publishes those ports and `{{shared.<name>.url}}` /
`{{shared.<name>.port}}` agree — so `localhost:<port>` never changes across
restarts.

## Presets

Reusable repo fragments:

```yaml
presets:
  shared-infra:
    env:
      REDIS_URL: "redis://{{shared.redis.host}}:{{shared.redis.port}}/{{shared.redis.slot}}"
```

A repo with `preset: shared-infra` inherits those fields. Multiple
presets can be applied via a list: `preset: [shared-infra, prisma]`.

## Integrations (Jira, …)

Integrations like **Jira** are configured in the app under **Settings ›
Integrations**, not in `pom.yml` — the API token is stored encrypted in your
app profile and never enters the shareable config. Once connected, a workspace
whose branch starts with a ticket key (`feat-123-…` → `FEAT-123`) shows a
status chip linking to the issue.

## Routing (webhooks & dev-proxy)

Webhooks and same-origin dev URLs are **auto-routed — there is no `webhook:` or
`proxy:` block to write.** Pomelo derives the routes from your repos/services:

- **Dev-proxy** — every service is reachable same-origin at
  `/_pom_dev/<repo>/<service>` (and at `<service>.<repo>.<branch>.localhost`), so
  a frontend and its backends share one origin — no CORS, and cookies behave
  like production. Reference another service's same-origin path with
  `{{<repo>.<service>.path}}`, or its full URL with `{{<repo>.<service>.url}}`.
- **Webhooks** — an inbound event fans out to every workspace running the target
  service at `/<repo>/<service>`, so all your parallel branches receive it.

The app's **Open** / **Copy URL** actions prefer these hostnames automatically.
See [Network](../docs/network) for tunnel setup and OAuth callbacks.
