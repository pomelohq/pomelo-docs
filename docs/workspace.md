# Workspace lifecycle

A workspace is one isolated copy of your project, anchored to a git
branch. Each lives in its own `workspace--<branch>/` folder containing
a git worktree per repo, with its own ports, env, and databases.

## Create

Click **+** in the WORKSPACES header (or `cmd-n`) to open **Create
Workspace**:

- **Ticket** - when the project has Jira set up, pick a ticket from the
  sprint or type a key. Picking one fills the name with its summary and the
  branch with its key (for example `proj-101`). **Only Show My Tickets** in
  Settings > Integrations narrows the list.
- **Name** - the display name. The **Branch** follows it as a slug unless
  you edit it. **Refine name & branch with Claude** asks Claude for a better
  pair.
- **Repos** - tick the repos this work needs; with none ticked, all of them
  are used. More can be added later.

Pomelo builds the workspace through a staged pipeline and shows each stage
on a card at the top of the sidebar:

<AppShot :width="280" :height="236" :window="false" text="A workspace being created"><WorkspaceCreate /></AppShot>

1. Validating config and hosts
2. Provisioning workspace
3. Starting shared services and databases
4. Creating git worktrees
5. Configuring repos (env files)
6. Running setup commands
7. Seeding databases

The per-repo stages run in parallel. Each worktree uses the existing local
branch, else tracks `origin/<branch>`, else starts a new branch. A failed
run keeps its place: **Retry** resumes from the stage that failed. Setup and
seed failures are warnings, reported when the workspace is done. When it
finishes, Pomelo switches to the new workspace.

To add more of the config's repos to a branch workspace later, right-click
it and choose **Add Repos...**. Repos are removed project-wide, from
**Settings > Project** (see [Project config](./project-config)).

## Seed from main

Set up the **main** workspace once and new workspaces inherit that prepared
state instead of rebuilding it - `main` is the golden source. Right-click
main and choose **Prepare Main...** to drop and recreate main's databases,
run each repo's migrations, then seed.

- **Databases** - `seed_from_main: true` on a repo clones its databases
  from main's counterparts (`CREATE DATABASE ... TEMPLATE`) in seconds, with
  main's sample data, rather than creating them empty and re-seeding.
- **node_modules** - a fresh worktree gets `node_modules` copied
  copy-on-write from a store keyed by the hash of `yarn.lock` or
  `package-lock.json` (or from main when the lockfile matches), so the
  install is a near-no-op. Repos with `pnpm-lock.yaml` are skipped.

**Keep Main Fresh** (Settings > Integrations > Main Workspace) pulls every
repo of main from origin and migrates the ones that moved on a schedule
(**Refresh Every** N minutes); repos with uncommitted changes are skipped.
**Update Main from Origin** in main's menu runs it now.

See [Databases > Seed from main](./databases#seed-from-main).

## Switch

Select any workspace in the sidebar to switch to it (or `ctrl-shift-w`).
Each keeps its own tabs, terminals, and agent; switching never restarts
anything. Drag rows to reorder them; main stays first.

## Rename

**Rename...** in a workspace's menu sets its display name, with **Refine
with Claude** to suggest one. The branch never changes.

## Delete

Right-click a branch workspace and choose **Delete Workspace**, then
confirm. A staged pipeline tears it down: stopping services > releasing
ports and slots > running `pre_delete` commands > removing worktrees and
databases > cleaning up folders. A local branch with unpushed or unmerged
commits is kept, and a database whose name does not depend on the branch
(so main uses it too) is never dropped. The **main** workspace can't be
deleted.

## Agent tools (MCP)

An AI agent running in a workspace can't see its own environment by
default - which port its dev server got, which database to migrate, whether
a service is even up. Pomelo closes that gap with an **MCP server** scoped
to the workspace, so the agent can inspect and act on the *real running
stack* it lives in. The app registers it with Claude Code in
`~/.claude.json`, and the agent it opens gets it for its workspace.

The tools:

| Tool | What the agent can do |
| --- | --- |
| `workspace_info` / `services` / `ports` / `service_url` | See the branch, its repos, each service's running state, port and URL |
| `databases` | Get ready-to-use per-branch connection strings |
| `db_list` / `db_tables` / `db_columns` / `db_query` | Browse and query the branch's Postgres and Redis |
| `service_start` / `service_stop` / `service_restart` | Bring services up/down (ports are pre-flighted) |
| `service_logs` | Read a service's recent output (e.g. to spot a crash) |
| `commands` | List the project's `setup` steps and tasks plus its package manager - so the agent runs *your* canonical install/migrate/lint/test commands |
| `run_shortcut` | Run one of those tasks in the repo's resolved env |
| `run_in_env` | Run a command in a worktree with the resolved env - migrations, tests, seeds - and read the result (refused on main) |
| `resolve_port_conflict` | Give the workspace's services fresh ports when something else grabbed one |
| `secrets_list` | List secret names (never values) |
| `config_get` / `config_validate` / `config_set` | Read and safely edit `pom.yml` - every write is validated before it lands, and new services get ports automatically |
| `config_doctor` / `config_normalize` | Check what keeps the project from running; clean up the config |

So mid-task you can say *"the migration failed - check the DB and rerun
it"* or *"add a worker service and start it"*, and the agent uses these
tools instead of guessing. Everything stays on your machine.

`pom mcp` is the underlying command; it's wired up automatically, so you
rarely run it yourself.

## Recovery

Workspace state lives on disk: machine-wide state in `~/.local/state/pom`,
a `.pom-workspace.json` (display name, env profiles) in each workspace
folder, and the `workspace--<branch>/` folders themselves - so the app can
quit and reopen without losing anything. If you delete a workspace folder
by hand, Pomelo prunes the stale git worktree registration before it adds a
worktree again.
