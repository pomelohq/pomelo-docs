# Quick Start

From zero to a running branch in a few minutes — all in the app, no CLI
required.

<Shot src="/shots/hero.png" text="The Pomelo window — sidebar of workspaces + service board" />

## 1. Install and open

Download **`Pomelo-<version>.dmg`** from the
[latest release](https://github.com/pomelohq/pomelo/releases/latest),
drag **Pomelo** into **Applications**, and open it. See
[Install](./install) for details.

## 2. Open or start a session

On first launch Pomelo shows a welcome screen with two choices:

- **Open a session** — pick a folder that already has a `pom.yml`.
- **New session** — start fresh: add your repos and Pomelo scaffolds a
  runnable session for you under `~/pom/<name>`.

A **session** is one `pom.yml` — your repos and every
`workspace--<branch>/` worktree live under it.

<Shot src="/shots/welcome.png" text="First-run welcome — Open a session / New session" />

## 3. New session — add your repos

From the welcome screen (or the session menu) click **New session**, give it
a name, and add your repos. Each repo is either:

- a **local folder** already on disk, or
- a **git URL** (SSH or HTTPS) that Pomelo clones for you.

A session can hold one repo or several — a whole multi-repo codebase.

<Shot src="/shots/new-session.png" text="New session sheet — add repos by folder or git URL" />

## 4. Let the onboarding agent write `pom.yml`

After you add repos, an **onboarding agent** reads each one, infers how it
runs (package manager, services, databases, env), and writes a runnable
`pom.yml`. It then loops the [config doctor](./concepts#config-doctor)
until it reports clean — so you get a working config without learning the
schema first.

::: tip Requires Claude
The onboarding agent uses the `claude` CLI. Install it with
`npm install -g @anthropic-ai/claude-code`. You can also write `pom.yml`
by hand — see the [config reference](../reference/config).
:::

## 5. Doctor clean

Open **Project** (top bar) to see the config editor and its **config
doctor** health strip at the bottom. When the doctor is clean, the session
is runnable. If anything is missing (a tool not installed, docker not
running, a database not created), the doctor names it and points at the
fix.

## 6. Start services

On the **service board**, start a service from its card. Starting a repo
service brings up its shared services (Postgres, Redis, …) automatically.
Each service's live output previews on its card; click the card to attach
a full terminal.

<Shot src="/shots/isolation.png" text="Service board — services running with live previews" />

To work on a feature, create a workspace for a branch (see
[Workspace lifecycle](./workspace)) and start its services the same way —
every branch gets its own ports, databases, and env, so you can run
several at once.

## 7. Browse the database

Open the **Database** tab (⌘4) to inspect a branch's data without leaving
the app or launching a separate client. Pomelo already knows the connection,
so there's nothing to configure:

- A tree of every per-branch database down to its tables (Postgres) and
  keyspaces (Redis).
- Click a table to open it as a data grid with WHERE / ORDER BY and paging,
  a record panel that shows one row vertically, and streamed CSV export.
- Or run SQL in a console with syntax highlighting and schema-aware
  autocomplete.

Made for the checks you run constantly while coding — inspect a row, confirm a
migration, tweak a query — right where you work, no separate client to wire up.
The workspace's Claude agent can query the same databases over MCP while it
builds.

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
