# Quick Start

From zero to a running branch in a few minutes - all in the app, no CLI
required.

<AppShot :width="1440" :height="860" :window="false" text="The Pomelo window: workspaces, the Services panel, the editor and a terminal"><HeroWindow /></AppShot>

## 1. Install and open

Download **`Pomelo-<version>.dmg`** from the
[latest release](https://github.com/pomelohq/pomelo/releases/latest),
drag **Pomelo** into **Applications**, and open it. See
[Install](./install) for details.

## 2. The welcome page

<Shot src="/shots/welcome.png" text="The welcome page" />

With no project open, the window shows the welcome page:

- **New project** (`cmd-shift-n`) - start from your repos.
- **Open a project folder** (`cmd-o`) - a folder that already has a
  `pom.yml`.
- **Import a bundle** - a teammate's exported config; it imports into the
  project open in the window, so open or create one first.
- **Recent** - the projects you created or opened.
- **This Mac** - whether **Docker** runs, which **git** you have, and which
  **Agent CLI**s are installed (Claude Code, Codex, Gemini CLI). **Start
  Docker** opens Docker Desktop or OrbStack; **Check again** re-checks.

A **project** is one `pom.yml` - your repos and every
`workspace--<branch>/` worktree live under it. **New session...** in the
project menu (click the project name, top left) starts one from any window.

## 3. New project - Repositories

**New project** opens as a tab in three steps. The first asks for:

- a **Session name** - the project is created at `~/pom/<name>`, shown
  under the field,
- the **Default branch** (`main` unless you change it) - main's branch in
  every repo,
- your **Repositories**: under **Folders**, **Choose folders...** takes a
  folder with a `.git` inside, or a folder of repos; under **Git URLs**,
  paste one or several URLs (SSH or HTTPS) and **Add**.

Each repo shows the alias it will get (edit it), the stacks Pomelo detected
in it, its compose file and how many gitignored `.env` files it has. A URL is
only scanned once it is cloned. Below, **Shared services found in compose
files** lists the containers one set of which will serve every workspace.

## 4. Setup - who writes pom.yml

- **Set up with an agent CLI** (recommended) - the agent reads every repo
  and writes a complete `pom.yml` (services, setup, migrations, env
  wiring); Pomelo then checks it installs and boots and hands problems back
  to it until it is clean. Pick **Claude Code**, **Codex** or **Gemini CLI**;
  only installed ones can be picked.
- **Set up manually** - Pomelo drafts `pom.yml` from what it detected (no
  tokens) and you finish it.

**Options:**

- **Import gitignored .env values as secrets** - their values stay
  encrypted on this Mac; the agent only sees their names.
- **Start the shared services when done**.
- **Create a first workspace** on the branch you type.

**Review** sums up what will happen. Nothing in your repos changes: Pomelo
works in its own clones under the session folder. **Create** (`cmd-enter`)
starts it; your agent-or-manual choice is remembered for next time.

## 5. Setting up

<AppShot :width="720" :height="640" text="Setting up a project: cloned, scanned, and the agent configuring it"><Onboarding /></AppShot>

The tab follows the setup, phase by phase:

1. **Clone repositories** - each repo with its progress: local repos are
   *linked* (cloned with their uncommitted work), URLs *cloned*.
2. **Scan** - how each repo runs, its shared services and env files. No
   tokens.
3. **Configure with** the agent (**Configure with Claude Code**) - the agent CLI runs in the agent dock:
   watch it, type to it, or stop it. The tab lists what `pom.yml` sets up
   so far. **Skip the agent - finish manually** stops it and goes on with
   the draft; **Let the agent finish it after all** brings it back. Claude
   Code says when it is done; for Codex and Gemini CLI press **It is done -
   verify**. With **Set up manually** this phase is **Draft pom.yml**.
4. **Verify** - the config doctor, then each repo's setup and migrations in
   main, then every service booted once (it must answer on its port, or stay
   up if it has none) and stopped again.
5. **Repair** - the first check that fails shows with its output:
   **Fix with Claude Code** (or the agent you picked) sends it to the agent and verifies again once the
   agent is done; **Fix manually** offers **Open pom.yml** and a terminal in
   the repo, then **Verify again**; **Skip this service** leaves a service
   that will not boot out of the checks.

**Pause** holds the setup between steps; **Cancel** stops it and removes
what it created: the session folder, its secrets and its services.

When every check passes, the tab shows the project **is ready**: how many
repos, services, shared services and databases it has, what each repo
runs, and what to do next - open the first workspace (or **Create a
workspace**), **Start main's services**, or **Open pom.yml**.

If something still keeps a project from running later (a tool not
installed, Docker not running, a secret not set), a **Project setup needs
attention** notice names it, with **Fix with Claude**. The config stays
editable from main; every save is [checked](./project-config#checked-saves)
before it is written.

## 6. Start services

Open the **Services** panel (`ctrl-shift-s`) and start a service from its
row. Starting a repo service brings up its shared services (Postgres,
Redis, ...) automatically. Click a running service to open its console.

To work on a feature, create a workspace for a branch with **+** in the
WORKSPACES sidebar (see [Workspace lifecycle](./workspace)) and start its
services the same way - every branch gets its own ports, databases, and
env, so you can run several at once.

## 7. Browse the database

Open the **Database** panel (`ctrl-shift-d`) to inspect a branch's data
without a separate client. Pomelo already knows the connection: browse
tables and Redis keyspaces, open a table as a grid, or run SQL in a
console. See [Databases](./databases#browsing-data-in-the-app).

## From a terminal

The same flow works with the `pom` CLI (inside the app at
`Pomelo.app/Contents/MacOS/pom`):

```bash
pom init [name] [--ai]            # a project from the git repo you are in
pom onboard --new myproject --repo ./api --repo ./web [--no-ai]
pom onboard [session]             # let Claude finish an existing project
pom config edit                   # edit pom.yml, then check it still loads
```

## Writing `pom.yml` by hand

If you'd rather author the config yourself, here's a minimal shape:

```yaml
session: myproject
default_branch: main

shared_services:
  postgres:                  # well-known: image/ports/creds filled in

repos:
  api:
    databases:
      main: "{{branch.safe}}"
    env:
      DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.main}}"
    setup: [go mod download, go run . migrate]
    services:
      server:
        cmd: go run . serve
        port: true            # another repo reaches it as {{api.server.url}}
```

See the [config reference](../reference/config) for every field and
[Templates](../reference/templates) for the full `{{...}}` grammar.
