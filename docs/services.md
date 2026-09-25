# Services

Each long-running process - a web server, a worker, a console - is a
**service**. Services run **natively** on Pomelo's own PTY holders - real
processes in a login shell, not containers - so they start fast and use
your machine's toolchains (nvm, rbenv, ...) directly. Docker is reserved for
shared data and infra ([shared services](./concepts#shared-services):
Postgres, Redis, ...). Services keep running when you quit the app; reopen
it and click a service to reattach to its console.

## Declare

In `pom.yml`:

```yaml
repos:
  api:
    services:
      server:
        cmd: go run . serve
        port: true
      worker:
        cmd: go run . worker
      console:
        cmd: go run . console
```

| Field | Notes |
| --- | --- |
| `cmd` | The shell line to run. With a port, `$PORT` (the allocated port) and `$BIND_IP` (always `127.0.0.1`) are exported. Servers that default to localhost-only (vite) can pass `--host $BIND_IP`; servers that bind 0.0.0.0 (puma, next) need nothing. |
| `port: true` | Request a conflict-free port. On by default for `type: backend` and `type: frontend`. |
| `type` | `backend`, `frontend` or `worker`. |
| `profiles` | Profiles offered for this service (overrides the repo-level list). Empty = inherit. |
| `env` | Extra env vars merged over the repo-level env. Templates allowed. |
| `shell_env` | Env assignments put in front of the command (the service's override the repo's). |
| `pre_start` | Command run after `cd` but before `cmd` (e.g. `nvm use`). Replaces the repo-level `pre_start`. |
| `dir` | Subdirectory inside the worktree to `cd` into. |
| `mode` + `modes` | Named alternative commands (e.g. `dev`, `build`). `mode` picks the default; without it `cmd` runs. |

## Cross-repo URLs

When one service needs another repo's service, reference it by
**dot-notation** - `{{<repo>.<service>.url}}`. Pomelo resolves it to the
service's dev-proxy address, so it keeps working when ports change.

```yaml
repos:
  api:
    services:
      server: { cmd: go run . serve, port: true }
  web:
    env:
      VITE_API_URL: "{{api.server.url}}"    # points at the api server
    services:
      app:
        cmd: vite --port $PORT --host $BIND_IP
        port: true
```

### Profiles

`profiles:` (repo or service level) lists the profiles a service offers -
e.g. `[local, staging]`; `local` is always included. Each non-local profile
can point a service reference at a deployed URL under the top-level
[`environments`](../reference/config#environments-profiles), so `staging`
reaches a deployed backend while `local` uses the workspace's own services.
Switch with `Env: <profile>` in the service's right-click menu; a running
service restarts, and the choice is kept per workspace.

## The Services panel

Open it with `ctrl-shift-s` or the Services button in the status bar. It
shows the active workspace's services as a tree: a **Workspace** group,
one group per repo, and a **Shared** group (used by all workspaces). Each
row has a status dot (green running, red crashed, grey stopped) and shows
its mode and port.

- Hover a row: **Start** when stopped; **Restart**, open in the browser (if
  it has a port) and **Stop** when running.
- Hover a repo header to start or stop all of that repo's services.
- Right-click a service for **Start** / **Restart** / **Stop**, **Use a New
  Port**, **Mode: ...**, **Env: ...**, **Open in Browser** and **Copy URL**.
- Click a running service to open its console as a tab, attached to the
  live process. Click a crashed one to see the output it left. Click a
  shared service to follow its Docker logs.
- The header's buttons open the **Environment** tab (each service's
  resolved env and where each value comes from) and the **Secrets** tab
  (the project's encrypted `{{secret.NAME}}` values).

Starting a repo service first brings up its shared services and creates the
workspace's databases if they are missing. Stopping a shared service while
other workspaces still use it asks first. The command palette has `services:
start` / `stop` entries, and a workspace's right-click menu has **Stop All
Services**.

Closing a service's console tab never stops the service.

::: tip Ports never collide
Each service with a port gets a **random free port** (10000-65535) reserved
atomically, so any number of workspaces coexist. Ports are sticky: a
stopped service keeps its port for a restart. Starting a service checks its
port first; if something else took it, Pomelo moves that service to a new
free port. If that still fails, the row shows who holds the port and a
**Use a new port** button. You rarely need the port anyway - the
[dev-proxy](./network#same-origin-dev-proxy) gives each service a stable
hostname.
:::

## Shortcuts

Declare quick commands per repo and run them from the Services panel:
right-click a repo's header and pick `Run: <name>`, or use
`run: <repo> <name>` in the command palette. Each runs in a terminal tab in the
worktree, with the workspace's env files rewritten and the repo's env
exported, so `DATABASE_URL` and friends point at the right ports:

```yaml
repos:
  api:
    shortcuts:
      - cmd: go run . migrate
        desc: Migrate DB
      - cmd: go test ./...
        desc: Run tests
```

The menu shows `desc` (else `key`, else `cmd`). A repo's `commands:`
(`install`, `migrate`, `test`, `lint`, ...) show up as shortcuts too.

## Modes (dev vs build)

For services that have a fast dev command and a slower production-like
build, declare both:

```yaml
services:
  web:
    mode: build                # default
    modes:
      dev: npm run dev -p $PORT
      build: npm run build && npx serve -l $PORT
    port: true
```

Switch with `Mode: <name>` in the service's right-click menu; a running
service restarts. The choice lasts until the app quits, then `mode:` applies
again.

## Pre-start hooks

Use `pre_start` at the repo or service level for environment shims that
need to run inside the same shell as `cmd`:

```yaml
repos:
  api:
    pre_start: nvm use
    services:
      web:
        cmd: npm start
```

The hook runs after `cd` into the worktree, before `cmd`. Failures abort
startup. A service-level `pre_start` replaces the repo-level one.

## From a terminal

`pom start <target>`, `pom stop`, `pom restart`, `pom status`, `pom logs`
and `pom attach` drive the same holders: a service started in a terminal
shows up in the panel, and the other way round.
