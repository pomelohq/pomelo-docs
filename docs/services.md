# Services

Each long-running process — a web server, a worker, a console — is a
**service**. Services run **natively** on Pomelo's own managed PTY holders
— real processes, not containers — so they start fast, use your machine's
toolchains (nvm, rbenv, …) directly, and cost far less than Dockerizing
everything. Docker is reserved for shared data/infra
([shared services](./concepts#shared-services): Postgres, Redis, …). Logs
persist and you can re-attach across restarts.

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
| `cmd` | The shell line to run. With `port: true`, `$PORT` (the allocated port) and `$BIND_IP` (the address to listen on) are exported. Servers that default to localhost-only (vite) should pass `--host $BIND_IP`; 0.0.0.0 binders (puma, next) need nothing. |
| `port: true` | Request a conflict-free port. |
| `profiles` | Profiles offered for this service (overrides the repo-level list). Empty = inherit. |
| `env` | Extra env vars merged over repo-level env. Templates allowed. |
| `pre_start` | One-shot command run after `cd` but before `cmd` (e.g. `nvm use`). |
| `dir` | Subdirectory inside the worktree to `cd` into. |
| `mode` + `modes` | Two-state toggle (e.g. `dev` vs `build`). Switch from the service card. |

## Cross-repo URLs

When one service needs another repo's service, reference it by
**dot-notation** — `{{<repo>.<service>.url}}`. Pomelo resolves it to the
right host/port (dev-proxy aware) and it survives renames.

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

`profiles:` (repo or service level) lists the profiles a service offers —
e.g. `[local, staging]`. With more than just `local`, a profile menu appears
on the service card. Each profile can override env values (including a
backend URL), so `staging` can point at a deployed backend while `local`
uses the workspace's own services. The profile → override map lives under
the top-level [`environments`](../reference/config#environments-profiles).

## Start / stop

<Shot src="/shots/isolation.png" text="Service cards — start, stop, live preview" />

From the **service board**, use the start/stop control on any service
card, or a repo column's menu to **Start all / Stop all** of that repo's
services at once.

::: tip Ports never collide
Each `port: true` service gets a **random free port** reserved atomically,
so any number of workspaces coexist without a shared pool. Starting a
service checks its port first; if something else grabbed it, Pomelo moves
the workspace to a clean region rather than starting on a taken port. You
never address services by port anyway — the
[dev-proxy](./network#same-origin-dev-proxy) gives
each a stable hostname.
:::

## Shortcuts (the ⚡ menu)

<Shot src="/shots/shortcuts.png" text="The bolt menu — run a repo shortcut in the resolved env" />

Declare quick commands per repo and run them from the bolt **⚡ menu** on a
service card. Each runs in the worktree with the workspace's resolved env
already sourced, so `DATABASE_URL` and friends point at the right ports:

```yaml
repos:
  api:
    shortcuts:
      - cmd: go run . migrate
        desc: Migrate DB
      - cmd: go test ./...
        desc: Run tests
```

## Live preview & terminals

Each service card shows a **live output preview**. Click the card body to
attach a full terminal tab — a real PTY you can scroll, search, and type
into for an interactive REPL.

Terminals you open (or shortcut runs) live independently of their tab:
**closing a tab never stops the shell**. It keeps running and you can
re-attach a tab to it later; it's only stopped when you explicitly stop it.

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

Flip between modes from the service card; the active mode persists across
restarts.

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
startup.
