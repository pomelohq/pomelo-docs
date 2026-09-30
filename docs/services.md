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
Switch it from the **Env** submenu of the service's right-click menu; a running
service restarts, and the choice is kept per workspace.

## The Services panel

<AppShot :width="330" :height="880" text="The Services panel. The filter and the hover buttons work."><ServicesPanel /></AppShot>

Open it with `ctrl-shift-s` or the Services button in the status bar (its
tooltip shows the key). The header names the workspace; its two buttons
open the **Secrets** tab (the project's encrypted `{{secret.NAME}}` values)
and the **Environment** tab (each service's resolved env and where each
value comes from).

- **Filter by name** narrows the list by service or repo name, and **All**,
  **Running**, **Failed** and **Stopped** filter by state, each with its
  count.
- **The summary card** says how many services run (`3 of 5 running`), with
  a bar and a legend of running, busy, needing attention and stopped, and
  the buttons **Start all**, **Stop all** and, when something failed,
  **Restart failed**.
- **Needs attention** has a card per crashed or failed service: what
  happened (`crashed 2m ago`, `cannot bind :5173`, `failed to start`), the
  last line it printed, and **View logs**, **Fix with Claude**, a restart
  button, and **Use a new port** when another process holds its port.
- **This workspace** lists the services by repo (plus **Workspace** for
  workspace-level ones). A repo's row shows which shared services it uses,
  a dot per service and how many run (`2/3`). A service's row shows its
  state, its mode, and at the right its port (`:5173`), how long it has been
  up (`up 41m`), or what went wrong.
- **Shared - all workspaces** stays pinned at the bottom: each shared
  service with its port and the repos that use it.

Hovering a repo tints the shared services it uses, and hovering a shared
service tints the repos that use it.

Hover a row for its buttons: **Start** when stopped; **Restart**, open in
the browser (when it has a port), logs and **Stop** when running; `...` opens
its menu. Hover a repo's row to start or stop all of its services.

### Menus

<AppShot :width="270" :height="342" :window="false" text="A running service's menu"><ContextMenu :width="270" header="api &gt; server - pid 48123" :items='[{"text":"Stop","icon":"stop","hint":"S"},{"text":"Restart","icon":"rotate_cw","hint":"R"},{"text":"Open in Tab","icon":"file","hint":"Enter"},{"text":"View Logs","icon":"terminal","hint":"L"},{"text":"Use a New Port...","icon":"server"},"-",{"text":"Mode","icon":"grid","hint":"dev","submenu":true},{"text":"Env","icon":"key","hint":"local","submenu":true},"-",{"text":"Open in Browser","icon":"arrow_up_right"},{"text":"Copy URL","icon":"copy"},{"text":"Copy Command","icon":"copy"},"-",{"text":"Ask Claude About This Service","icon":"sparkle"}]' /></AppShot>

Right-click (or `...`):

- **A service** - headed by its name (and its pid while it runs):
  **Stop** (`S`) and **Restart** (`R`) while it runs, **Restart** after it
  failed, else **Start** (`S`); **Open in Tab** (`Enter`), **View Logs**
  (`L`), **Use a New Port...**; a **Mode** and an **Env** submenu showing the
  current one (when there is more than one; picking one restarts a running
  service); **Open in Browser** (only while it runs), **Copy URL**, **Copy
  Command**; and **Fix with Claude** when it failed, else **Ask Claude About
  This Service**.
- **A repo** - **Start All**, **Stop All**, **Restart All**, a **Run Task**
  submenu with the repo's commands, **Environment...** and
  **Collapse**/**Expand**.
- **A shared service** - **Open in Tab**, **Start** or **Restart**,
  **Stop...** and **View Logs**. One container serves every workspace, so
  stopping it while other workspaces use it asks first.

### The service tab

<AppShot :width="760" :height="380" text="A service tab. Type in Filter lines to try it."><ServiceTab /></AppShot>

Click a service to open it as a tab (a preview tab, replaced by the next
one you click; **View logs** keeps it open). The tab has:

- **A header** with the service's name and mode, and **Start**, **Stop**,
  **Restart**, **Open in browser** and `...` (the service's menu).
- **What went wrong**, for a crashed or failed service: `Crashed 2m ago -
  exit 1`, `Port 5173 is already in use` or `Could not start`, the output,
  and **Use a new port**, **Fix with Claude** and **Restart**.
- **Facts**: its status and PID, its **URL** (with copy), its **Port**
  (**Change** moves it to a new free port), its **Mode** and **Env
  profile** (pickers when there is a choice), its **Env file** (**Open**
  opens it) and its **Command** (with copy).
- **The console**, while it runs: the tab is the service's live terminal.
  Click in it and type, and the keys, paste and the mouse go to the
  process, so prompts, REPLs and interactive CLIs work as in a terminal.
- **Logs**: typing in **Filter lines** (`cmd-f`) switches to the log list,
  which highlights and keeps the matching lines; clear the filter to get the
  console back. A stopped or crashed service shows the log list. **Pause**
  holds the view (**Resume (12 new)** shows what arrived meanwhile),
  **Clear** empties it, **Follow** keeps the newest line in view and
  **Wrap** wraps long lines. Unwrapped, the time column stays put and long
  lines scroll sideways with the trackpad or shift and the wheel. Lines that
  arrive while the tab is open get their time; errors are red and warnings
  yellow. With the filter not focused, `cmd-c` copies the last line.

A crashed service's tab shows the output it left. A shared service's tab
follows its Docker logs. Closing a service's tab never stops the service.

### URLs

A service with a port is reached through the
[dev-proxy](./network#same-origin-dev-proxy) at
`http://<service>.<repo>.<workspace>.localhost:8767` - for example
`http://server.api.feat-login.localhost:8767`. The workspace part is the
ticket id when the branch has one (`proj-101-add-login` gives `proj-101`),
else the branch with `/` as `-`. **Open in Browser**, the row's open button
and **Copy URL** all use this address, so it stays the same when the port
changes.

Starting a repo service first brings up its shared services and creates the
workspace's databases if they are missing. The command palette has
`services: start` / `stop` entries, and a workspace's right-click menu has
**Stop All Services**.

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

## Tasks

Declare quick commands per repo and run them from the Services panel:
pick it from the **Run Task** submenu of the repo's menu, or use
`run: <repo> <name>` in the command palette. Each runs in a terminal tab in the
worktree, with the workspace's env files rewritten and the repo's env
exported, so `DATABASE_URL` and friends point at the right ports:

```yaml
repos:
  api:
    tasks:
      - cmd: go run . migrate
        desc: Migrate DB
      - cmd: go test ./...
        desc: Run tests
```

The menu shows `desc` (else `key`, else `cmd`). A repo's `commands:`
(`install`, `migrate`, `test`, `lint`, ...) show up as tasks too. Configs
written before still work with the old name, `shortcuts:`.

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

Switch it from the **Mode** submenu of the service's right-click menu; a running
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
