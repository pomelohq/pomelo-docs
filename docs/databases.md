# Databases

Pomelo auto-provisions one database per workspace per template, using the
shared service's admin credentials. You declare names with templates;
Pomelo does the create/drop/seed dance.

## Declare

Under a repo:

```yaml
repos:
  api:
    databases:
      main: "{{branch.safe}}"          # primary DB
      test: "{{branch.safe}}_test"     # separate test DB
    env:
      DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.main}}"
      TEST_DATABASE_URL: "postgres://{{shared.postgres.url}}/{{db.test}}"
```

`{{db.NAME}}` resolves to the named entry above (session-prefixed) — names
instead of positional indexes, so reordering the map never breaks a
reference. `{{db.NAME.url}}` gives the full `postgres://user:pass@host:port/name`.
The env vars produced for a workspace on branch `feat/login`:

```
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/myproject_feat_login
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/myproject_feat_login_test
```

`{{branch.safe}}` only turns `/` into `_`, so a hyphen stays
(`feat/login-page` gives `myproject_feat_login-page`).

## Shared service credentials

The credentials come from the `db_user` / `db_password` fields on the
shared service (well-known Postgres fills them in by default):

```yaml
shared_services:
  postgres:
    db_user: postgres
    db_password: postgres
```

`{{shared.postgres.url}}` expands to `user:pass@host:port`.

## Seed from main

New workspaces can inherit their databases from the **main** workspace's
copies instead of building them from scratch:

```yaml
repos:
  api:
    seed_from_main: true   # clone api's DBs from main (CREATE DATABASE ... TEMPLATE)
```

Set up main once, and each new workspace clones the prepared databases in
seconds, with main's sample data - the repo's own `seed` is skipped. If a
main database is missing, or the copy fails, Pomelo creates it empty with a
warning. See [Workspace > Seed from main](./workspace#seed-from-main).

To (re)build main's data, right-click the **main** workspace and choose
**Prepare Main...**: it drops and recreates main's databases, runs each
repo's migrations, then seeds (`pom prepare-main` does the same).

## Lifecycle

Databases are created when the workspace is created (and again, if missing,
when one of its services starts), and dropped when you delete the
workspace. `pom db create|drop|reset [branch]` manages them by hand, and
`pom db clean` drops this project's databases no workspace uses.

## Setup hooks

Use the repo-level `setup:` block for migrations / seeds that should run
right after the workspace is created:

```yaml
repos:
  api:
    setup:
      - go mod download
      - go run . migrate
      - go run . seed
```

These run after the worktree exists, the env file is written, and the
databases have been created - so `DATABASE_URL` is set correctly. Repos set
up in parallel, and a failed setup step warns instead of stopping the
workspace. With no `setup:`, the repo's `install`, `generate` and `migrate`
commands run in that order.

## Browsing data in the app

The **Database** panel (`ctrl-shift-d`, or the Database button in the
status bar) inspects the active workspace's data without a separate DB
client. Pomelo already knows the connection, so there's nothing to wire up:

- A tree of the workspace's databases, grouped by repo, plus shared Redis.
  Postgres databases expand to their tables and views, Redis to its
  keyspaces. A filter field narrows the tree.
- Click a table to open it as a data grid with WHERE / ORDER BY and paging
  (100 to 5000 rows a page). **Export CSV** writes the full result to
  `~/Downloads/<table>.csv`.
- A SQL console: the editor with SQL highlighting. `cmd-enter` runs the
  selection or the statement at the caret, `cmd-shift-enter` runs it all,
  and results show below. Consoles are saved with the project.

Made for the checks you run constantly while coding - inspect a row, confirm
a migration, tweak a query - right where you work. The workspace's
[AI agent](./workspace#agent-tools-mcp) can list tables and query the same
databases over MCP while it works.
