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
client. Pomelo already knows the connection, so there's nothing to wire up.

Its header names the workspace and has **New Console**, **Refresh** and
**Collapse All**; **Filter tables and columns** narrows the tree.

<AppShot :width="300" :height="420" text="The Database panel. Click a row to fold or open it."><DatabasePanel /></AppShot>

- **Consoles** - your saved SQL consoles.
- **Databases** - each repo with its databases and the shared services it
  uses, then **Other services**. Postgres databases expand to their tables
  and views, and tables to their columns. Redis expands to its keyspaces,
  MinIO to its buckets, folders and objects.

### Menus

<AppShot :width="250" :height="262" :window="false" text="A table's menu"><ContextMenu :width="250" header="users" :items='[{"text":"Open Data","icon":"table"},{"text":"New Console with SELECT","icon":"file"},"-",{"text":"Copy Name","icon":"copy"},{"text":"Copy SELECT Statement","icon":"copy"},{"text":"Show DDL","icon":"file"},"-",{"text":"Truncate...","icon":"trash","danger":true},{"text":"Drop Table...","icon":"trash","danger":true},"-",{"text":"Ask Claude about this table","icon":"sparkle"}]' /></AppShot>

Right-click:

- **A Postgres database** - **New Console**, **Refresh**, **Copy Name**,
  **Copy Connection URL**, **Open psql in Terminal**, **Copy Data from
  Main...** and **Reset Database...** (both only in branch workspaces, and
  both ask first) and **Ask Claude about this schema**.
- **A table** - **Open Data**, **New Console with SELECT**, **Copy Name**,
  **Copy SELECT Statement**, **Show DDL**, **Truncate...**, **Drop
  Table...** and **Ask Claude about this table**.
- **A column** - **Copy Name**, **Filter Data by this Column** and **Show
  Distinct Values**.
- **A console** - **Open**, **Rename**, **Change Database...** and **Delete
  Console...**.
- **A Redis keyspace** - **Open Keys**, **Copy Pattern**, **Open redis-cli
  in Terminal** and **Delete Matching Keys...**.
- **A MinIO object** - **Open**, **Download**, **Copy Presigned URL**,
  **Copy Path** and **Delete...**.

### Tables

<AppShot :width="1080" :height="400" text="A table tab with the Details side. Click a cell, the row numbers, the JSON folds, a filter box, Value or Row; double-click a name to edit it."><TableView /></AppShot>

Click a table to open it as a data grid. Type a **WHERE** and **ORDER BY**
to narrow and sort it (or click a column's header to sort), page through it
100, 500, 1000 or 5000 rows at a time (500 by default), drag a column's edge
to resize it and click a cell to copy it. **Export CSV** writes the full
result to `~/Downloads/<table>.csv`.

**Filter boxes** under the column headers narrow by one column, together
with the WHERE (press `enter` to run):

| Typed | Keeps rows where the column |
| --- | --- |
| `ann` | contains `ann` (any case) |
| `= 42` | is exactly `42` |
| `!= admin` | is anything but `admin` |
| `null` / `not null` | is NULL / is not NULL |

**Data**, **Structure** and **DDL** switch what the tab shows. Structure
lists the columns (type, NULL, default, primary and foreign keys), the
indexes, and the tables whose foreign keys point here; click one to open it.
DDL is the `CREATE TABLE`, with **Copy**.

#### Details

The side next to the grid (**Details**, or `shift-enter`) follows the
selected cell:

- **Value** - the whole value, however long. JSON opens as a tree in the
  order it was written: the first level is open, a folded object reads
  `{ 9 keys }`, a long list shows 50 items then **show N more**, and
  **Expand all** / **Collapse** open or fold everything. A foreign key also
  shows the row it points at, with **Open this row**.
- **Row** - the selected row as a record, the chosen column lit, then
  **Referenced by**: every table with a foreign key to this one and how many
  of its rows point at this row. Click one to open those rows.

Value or Row stays as you left it while you move around. In the grid a
JSON cell over 2 KB reads as its summary (`{ 9 keys } 21.3 KB`), and a
foreign key cell has an arrow that opens the row it points at, in that
table's tab.

#### Editing

Double-click a cell (or press `enter`) to change it; a long or JSON value is
edited in the Details side instead, where **Set NULL** and **Revert** are
too. Changes are not saved right away: they turn yellow and a bar counts
them, naming the database they go into.

- **Review SQL** lists the `UPDATE` statements.
- **Discard** drops them.
- **Apply** (`cmd-s`) runs them all in one transaction, each row found by its
  primary key: if one fails, none is saved.

Primary key columns, views and tables without a primary key are read-only,
and the side says why. **Open in tab** opens a value in the editor (JSON
indented, keys in their order); saving that tab stages the change here, and
text that is no longer valid JSON is refused.

### Consoles

A console is the editor with SQL highlighting, saved with the session
(`query 1`, `query 2`, ...). Its tab shows the database it runs against,
which the picker in its bar changes. `cmd-enter` (or **Run**) runs the
selection or the statement at the caret, `cmd-shift-enter` runs them all,
and results show below, up to 500 rows. Edits save as you type.

### When a database is missing

When the panel cannot reach a database it says why - `Database
myproject_feat_login does not exist`, or `Can't reach Postgres at
localhost:5432` - with what fits: **Create database**, **Copy from main**,
**Start shared services**, **Retry**, **Edit pom.yml**, **Show full error**,
**Copy error** and **Fix with Claude**.

Made for the checks you run constantly while coding - inspect a row, confirm
a migration, tweak a query - right where you work. The workspace's
[AI agent](./workspace#agent-tools-mcp) can list tables and query the same
databases over MCP while it works.
