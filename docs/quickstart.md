# Quick Start

From zero to a running branch in a few minutes - all in the app, no CLI
required.

<Shot src="/shots/app.png" text="The Pomelo window: workspaces, the Files panel, the editor and a terminal" />

## 1. Install and open

Download **`Pomelo-<version>.dmg`** from the
[latest release](https://github.com/pomelohq/pomelo/releases/latest),
drag **Pomelo** into **Applications**, and open it. See
[Install](./install) for details.

## 2. Open or create a project

The first window offers two ways in:

- **Open Project** (`cmd-o`) - pick a folder that already has a `pom.yml`.
- **New Project** (`cmd-shift-n`) - start fresh: add your repos and Pomelo
  creates a project for you under `~/pom/<name>`.

A **project** is one `pom.yml` - your repos and every
`workspace--<branch>/` worktree live under it.

## 3. New Project - add your repos

The **New Project** form asks for:

- a **Session name** (the project's folder is shown under it),
- the **Default branch** (`main` unless you change it),
- your **Repositories**: **Add folder...** for repos already on disk, or
  paste a **Git URL** (SSH or HTTPS) and press enter. Each repo can get an
  alias.

A project can hold one repo or several - a whole multi-repo codebase.

## 4. Choose how to set it up

Under **Setup**, pick one:

- **Set up with AI** - "Claude opens in a terminal to finish pom.yml; you
  approve each step". Needs Claude Code
  (`npm install -g @anthropic-ai/claude-code`).
- **Set up manually** - "pom.yml is drafted from what is detected; you
  review and edit it".

Click **Create**. Either way Pomelo clones the repos into the project's
main workspace (local repos keep their uncommitted work, and the values in
their gitignored `.env` files are stored as encrypted secrets the config can
reference by name), detects how each one runs, and drafts a `pom.yml`. The
draft opens in the editor.

- **With AI**, the onboarding agent opens in a terminal tab and turns the
  draft into a runnable config, running the config doctor until it reports
  no errors. You watch and approve what it does.
- **Manually**, the Services panel opens and a notice says **pom.yml is
  ready to review**, with how many repos and services were detected.

Your choice is remembered for the next project. You can bring the agent in
later with **Set Up Project with AI** in the command palette.

## 5. Check the setup

If anything still keeps the project from running (a tool not installed,
Docker not running, a secret not set), a **Project setup needs attention**
notice names it, with **Fix with Claude**. The config stays editable from
main; every save is [checked](./project-config#checked-saves) before it is
written.

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
