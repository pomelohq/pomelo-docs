# `pom.yml` reference

The project config. Pomelo walks up from the current directory looking
for this file - keep it at the project root. To change it from the app, see
[Project config](../docs/project-config).

::: tip One file
The whole config lives in `pom.yml`. A `pom.d/` folder from an older version
is folded into it on the first load and kept as `pom.d.bak`.
:::

## Top level

```yaml
session: myproject              # project name (namespaces state, holders, databases)
default_branch: main            # global default git branch (default: main)
preset: dev-tools               # optional: run this preset's services once per workspace

environments:                   # per-profile URL overrides (see below)
  staging:
    api.server: "https://api.example.com"   # {{api.server.url}} resolves here on staging

presets: { ... }                # see "Presets" below
shared_services: { ... }        # see "Shared services" below
repos: { ... }                  # see "Repos" below
seed: [ ... ]                   # optional: run once in the workspace root before repo seeds
prepare_main: [reset, migrate, seed]   # phases of Prepare Main (default: all three)
sync:                           # optional: auto-push and Keep Main Fresh defaults
  auto_push: true               # push committed work on a timer
  interval_sec: 180             # how often (default 180, at least 30)
  refresh_main: true            # Keep Main Fresh, until it is set in the app
  refresh_interval_sec: 1800    # how often main is refreshed (default 1800)
```

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `session` | string | `pomelo` | Project name. Prefixes databases, holders, hostnames and the shared compose project. |
| `default_branch` | string | `main` | Default branch of every repo; a repo's `default_branch` overrides it. |
| `preset` | string or list | - | Presets whose `services` run once per workspace, in the workspace root. |
| `environments` | map | - | Profiles that point services at deployed URLs (see below). |
| `presets` | map | - | Reusable repo fragments (see [Presets](#presets)). |
| `shared_services` | map | - | Services every workspace shares (see [Shared services](#shared-services)). |
| `repos` | map | - | The project's repos (see [Repos](#repos)). |
| `seed` | list of commands | - | Run once in a new workspace's root, before the repos' seeds. |
| `prepare_main` | list | `[reset, migrate, seed]` | Phases **Prepare Main** runs, in order. |
| `sync` | map | - | `auto_push` and `interval_sec` push committed work on a timer; `refresh_main` and `refresh_interval_sec` are the Keep Main Fresh schedule until you change it in the app, which then wins. |

A top-level `preset:` does not apply to repos: the named presets' `services`
run once per workspace, in the workspace root.

::: tip Editor is a per-user app setting
Which app **Open in External Editor** launches is chosen in **Settings >
Editor > External Editor** (Auto picks the first one installed), not in
`pom.yml` - it's a personal preference, not shared project config.
:::

### Environments & profiles

**`environments:`** (top-level) defines alternate environments - each maps a
`<repo>.<service>` to a **non-local** URL (a deployed server), so
`{{<repo>.<service>.url}}` (and `.host`, `.port`, `.ws`) resolves there
instead of the workspace's own service, and the dev-proxy forwards there.
The value is used as written (no templates).

**`profiles:`** (repo or service level) picks which of those environments the
repo offers. `local` is always included. A service-level list replaces the
repo's for that service. Switch the active one from the service's menu in
the Services panel (**Env** > the profile).

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
    api.server: "https://api.example.com"   # {{api.server.url}} -> this on staging
```

## Repos

A repo splits into **identity** (what it is - spec + env + services) and
**`lifecycle`** (how a workspace is set up, run day-to-day, and torn down):

```yaml
repos:
  api:
    # identity
    alias: api                 # short name for hostnames and templates
    default_branch: master     # override global default for this repo
    preset: shared-infra       # apply a preset
    pre_start: nvm use         # runs before each service's cmd
    profiles: [local, staging] # environments this repo can pick (default [local])
    seed_from_main: true       # inherit prepared DBs from main

    databases:                 # named - auto-created per workspace
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

    # lifecycle - the ops side, kept out of identity
    lifecycle:
      copy: [.env, .env.secrets] # files copied from main into each worktree
      commands:                  # named recipe - the pipeline and the agent run these
        install: go mod download
        migrate: go run . migrate
      tasks:                     # the repo menu's Run Task list and the palette
        - cmd: go test ./...     # runs in the worktree with the workspace's
          desc: Run tests        # env exported
```

| Field | Description |
| --- | --- |
| `alias` | Short name used in service hostnames and in templates (`{{<alias>.<service>.url}}`; the repo key works too). Defaults to the key. **Rename Alias...** in Settings > Project rewrites the references for you. |
| `default_branch` | Override the global default branch for this repo. |
| `preset` | Apply a named [preset](#presets), or a list of them. |
| `pre_start` | Command run in the same shell right before each service's `cmd` (e.g. `nvm use`). A service-level `pre_start` replaces it. |
| `shell_env` | Env assignments put in front of every service command; a service's own replaces it. |
| `profiles` | Environments this repo's services can pick (default `[local]`); defined under top-level `environments`. |
| `env` | Env vars to generate. Flat map -> `.env.local`, or file-keyed (see below). Uses [templates](./templates). |
| `databases` | **Named** map (`name: template`); auto-created per workspace as `<session>_<template>`. Referenced as `{{db.name}}`. Only `{{branch...}}` tokens expand here. |
| `seed_from_main` | Clone this repo's DBs from the **main** workspace's copies instead of creating them empty; skips the repo's `seed`. See below. |
| `shared_services` | The shared services this repo uses: a list of names (`[postgres, mock-as]`), or `{postgres: {db_name: "..."}}` to also create a database on it. Starting the repo's services starts these, and the shared tab lists the repo under **Used by**. |
| `services` | Named services (see the table below and [Services](../docs/services)). |
| `lifecycle` | The ops side - set up / run / tear down. See below. |
| `proxy_port` | Port a repo-level reference falls back to when none of the repo's services has one. |

A service is either a command string or a map:

```yaml
services:
  worker: bundle exec sidekiq          # just the command
  server:
    type: backend                      # backend | frontend | worker
    cmd: bin/rails s -p $PORT
    dir: apps/api                      # run in a sub-folder (monorepos)
    port: true                         # lease a port as $PORT
    depends_on: [worker]               # start after these
    env: { RAILS_LOG_LEVEL: debug }
    profiles: [local, staging]
    mode: dev
    modes:
      dev: bin/rails s -p $PORT
      prod: bin/rails s -e production -p $PORT
```

| Service field | Description |
| --- | --- |
| `cmd` | The command, run by the login shell with the resolved env. |
| `type` | `backend`, `frontend` or `worker`. Backends and frontends get a port unless `port: false`. |
| `dir` | Folder inside the repo to run in. |
| `port` | `true` leases a port (given as `$PORT`); `false` never does. |
| `depends_on` | Services of the same repo to start first. |
| `env` | Env vars for this service only, over the repo's. |
| `profiles` | Environments this service can switch to; replaces the repo's list. |
| `modes` / `mode` | Named alternate commands and the default one; switched live from the service's menu. |
| `pre_start` / `shell_env` | Replace the repo's for this service. |
| `tasks` | Quick commands shown for this service (`shortcuts` is read as the same key). |

The **`lifecycle:`** block keeps ops out of the repo's identity. The same
keys are also read at the repo's top level; `lifecycle:` wins.

| `lifecycle` field | Description |
| --- | --- |
| `copy` | Files copied from main's checkout into each new worktree (`*` allowed in the last path part; files the worktree has are kept). |
| `commands` | Named canonical commands (`install`, `migrate`, `lint`, `test`, ...). Each also shows up as a shortcut. |
| `setup` | Ordered steps run right after the worktree is created, in the worktree with the repo's env. Defaults to the `install`, `generate` and `migrate` commands. |
| `migrate` | Migration steps (used by Prepare Main and Keep Main Fresh). |
| `seed` | Seed steps for a fresh database (skipped when `seed_from_main`). |
| `tasks` | Quick commands in the Services panel's repo menu (**Run Task**) and the command palette. `shortcuts` is read as the same key. |
| `pre_start` | Same as the repo-level `pre_start`. |
| `pre_delete` | Commands run before the worktree is deleted (failures only warn). |

### Faster workspaces - inherit prepared state from `main`

Set up the **main** workspace once (**Prepare Main...**: reset, migrate and
seed its DBs) and new workspaces copy that prepared state instead of
rebuilding it.

```yaml
repos:
  api:
    seed_from_main: true   # clone api's DBs from main (CREATE DATABASE ... TEMPLATE)
```

- **Databases** - `seed_from_main: true` clones the repo's DBs from main's
  counterparts in seconds (with main's sample data) rather than creating them
  empty + re-seeding; the repo's own `seed` is skipped. A missing main DB, or
  a failed copy, falls back to an empty create with a warning.
- **node_modules** - for npm and yarn repos (`package-lock.json` or
  `yarn.lock`), a new worktree gets `node_modules` as an APFS copy-on-write
  clone from a store keyed by the lockfile's hash, filled from main or from
  the first successful install with that lockfile. The install is
  near-instant and shares disk blocks. pnpm repos are skipped (pnpm's own
  store already dedupes).
- **Short hostnames** - a branch that starts with a ticket key uses just the
  key in hostnames (`feat-123-add-login` gives
  `server.api.feat-123.localhost`); other long branches are cut to 63
  characters with a hash suffix. In **Create Workspace**, **Refine name &
  branch with Claude** suggests a display name and a short branch.

### `env`: one key, three forms

There is no separate `env_output` - the `env` key both holds the
variables and decides the target file(s):

```yaml
# 1. Flat -> written to .env.local
env:
  DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.main}}"

# 2. File-keyed -> each file gets exactly its own vars
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

A file-specific value overrides `"*"`. Pomelo writes the files only where
the repo already keeps env files (a root with `.env` or `.env.development`,
or `apps/<name>/.env`) and in a service's `dir`; services get the resolved
env injected directly either way.

## Shared services

**Well-known services ship with built-in defaults** - `postgres`, `redis`,
`minio`, `opensearch` and `zincsearch`. Just name the service and Pomelo
fills in the image, ports, environment, volumes and credentials:

```yaml
shared_services:
  postgres:                    # postgres:16, filled in
  redis:                       # redis:7-alpine + appendonly, capacity 16
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

Or run a **command** instead of a container - one process for every
workspace (a mock auth server, a stub of an outside API):

```yaml
shared_services:
  mock-as:
    cmd: node scripts/mock-as.js     # instead of image
    repo: api                        # run in api's checkout in the main workspace
    port: 4010                       # optional: fixed; otherwise one is leased
    environment:
      ISSUER: "http://127.0.0.1:$PORT"
    healthcheck:
      test: "curl -sf http://127.0.0.1:$PORT/health"
repos:
  api:
    shared_services: [mock-as]       # starting api's services starts it
```

A shared service runs once for every workspace of the project. It is either
a Docker image (`image`) or a command (`cmd`), never both.

Image services run in one docker compose project named `<session>-shared`.
Each port gets a host port that sticks: the port in `ports` (e.g. `5432`)
when it is free, else the next free one within 100, else a random one - so
you can set up an external client (`psql`, a GUI) once. You never hard-code
it: use `{{shared.<name>.port}}`.

A command service runs in one process for every workspace, under a holder
that keeps running when you quit Pomelo. It is told its port as `$PORT`
(and `$BIND_IP`), and `{{shared.<name>.url}}` is `http://127.0.0.1:<port>`.
A `healthcheck` test is waited for, up to 30 seconds, before the services
that use it start.

| Field | Applies to | Description |
| --- | --- | --- |
| `image` | image | Docker image. |
| `cmd` | cmd | Shell command to run instead of a container. |
| `type` | image | Well-known template to base this service on (defaults to the service's name). Never applied to a `cmd`. |
| `ports` | image | Container ports (`"5432"` or `"host:container"`); the first number is the preferred host port. |
| `port` | cmd | The port it is told. Without it, one is leased and kept. |
| `repo` | cmd | A repo key: run in that repo's checkout in the main workspace. Without it, the project folder. |
| `environment` | both | Env vars, written as-is. In a `cmd` service, `$PORT` and `${PORT}` in a value become the port. |
| `volumes` | image | Volume mounts. |
| `command` | image | Override the container command. |
| `healthcheck` | both | Image: `test` / `interval` / `timeout` / `retries` for the compose file. Cmd: a `test` command waited for at start. |
| `db_user` / `db_password` | image | Credentials for auto database creation. |
| `host` | image | Host to reach an external database instead of a container. |
| `capacity` | image | Max slots per instance (a new instance is added when full). |

## Validation

Pomelo checks the file when it loads it. An invalid file is not used, and
each problem is listed with where it is:

| Problem | Example message |
| --- | --- |
| A colon-form template | `repo "api" env.DATABASE_URL: {{conn:postgres}} is removed - use {{shared.NAME.url}}` |
| A profile with no environment | `repo "api": environment "staging" not defined` |
| A shared service with both or neither of `image` and `cmd` | `shared service "mock-as": set either image (a Docker container) or cmd (a command), not both` |
| An image-only field on a `cmd` service | `shared service "mock-as": ports is only for an image; a cmd service uses port` |
| A cmd-only field on an image service | `shared service "postgres": port is only for a cmd; an image service uses ports` |
| A `repo` that is not in `repos` | `shared service "mock-as": repo "auth" is not in repos` |
| A `cmd` service on a port another shared service wants | `shared services "mock-as", "stub" all want port 4010` |

The [config doctor](../docs/concepts#config-doctor) looks further: missing
tools (Docker, a `cmd` service's program), repos that are not cloned,
secrets with no value, and shared services nothing references.

## Presets

Reusable repo fragments:

```yaml
presets:
  shared-infra:
    env:
      REDIS_URL: "redis://{{shared.redis.host}}:{{shared.redis.port}}/{{shared.redis.slot}}"
```

A repo with `preset: shared-infra` inherits those fields. Multiple
presets can be applied via a list: `preset: [shared-infra, prisma]`. The
repo's own values win; presets only fill what it leaves unset (`env` and
`commands` merge key by key, and a preset's services are added only when the
repo has none by that name). Inside a preset, write the lifecycle keys flat
(`setup:`, `commands:`, ...), not under `lifecycle:`, and keep `env` a flat
map.

## Integrations (Jira, ...)

Jira is set up per project in the app under **Settings > Integrations**
(site URL, account email, API token), not in `pom.yml`. The token is stored
encrypted for that project, or read from `JIRA_API_TOKEN`, and never enters
the shareable config. A workspace whose branch starts with a ticket key
(`feat-123-...` -> `FEAT-123`) shows the ticket's status and can open the
ticket in a tab.

## Routing (webhooks & dev-proxy)

Webhooks and same-origin dev URLs are **auto-routed - there is no `webhook:` or
`proxy:` block to write** (the config doctor flags those old keys, and
**Normalize** removes them). Pomelo derives the routes from your
repos/services:

- **Dev-proxy** - every service is reachable same-origin at
  `/_pom_dev/<repo>/<service>` and at
  `http://<service>.<alias>.<branch>.localhost:8767`, so a frontend and its
  backends share one origin - no CORS, and cookies behave like production.
  Reference another service's same-origin path with
  `{{<repo>.<service>.path}}`, or its full URL with `{{<repo>.<service>.url}}`.
  A shared service answers at `http://<name>.<session>.localhost:8767`.
- **Webhooks** - an inbound event to `127.0.0.1:8766/<repo>/<service>/...`
  fans out to every workspace running the target service, so all your
  parallel branches receive it.

See [Network](../docs/network) for tunnel setup and OAuth callbacks.
