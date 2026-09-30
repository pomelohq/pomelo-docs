# Workspace lifecycle

A workspace is one isolated copy of your project, anchored to a git
branch. Each lives in its own `workspace--<branch>/` folder containing
a git worktree per repo, with its own ports, env, and databases.

## Create

Click **+** in the WORKSPACES header (or `cmd-n`) to open **Create
Workspace**:

- **Ticket** - when the project has Jira set up, focus the field to see a
  list of tickets, filter it by typing, or type a key. The select next to
  **Ticket** picks where they come from: a board's current sprint, that
  board's backlog, or **Assigned to me** (your open tickets on any board).
  Picking one fills the name with its summary and the branch with its key
  (for example `proj-101`), marked "from PROJ-101" until you edit them.
  **Only Show My Tickets** in Settings > Integrations narrows the sprint and
  backlog lists. `escape` closes the list before it closes the form.
- **Name** - the display name. The **Branch** follows it as a slug unless
  you edit it. **Refine name & branch with Claude** asks Claude for a better
  pair.
- **Repos** - tick the repos this work needs; with none ticked, all of them
  are used. More can be added later. Each row says whether its
  `node_modules` will be instant (from the shared store), installed once
  (then kept for the next workspace), or handled by the package manager's
  own store.
- **Environment** - when the config defines `environments`, the profile the
  services point at (`local` by default).
- **Data** - when a ticked repo has `seed_from_main`, choose **Copy from
  main** or **Empty, run seeds** (start every database empty and seed it).
  From the CLI: `pom ws create <branch> --fresh-db`.

The footer sums up what **Create** will make, for example
`3 repos - 1 installs once - databases copied from main - local`.

<AppShot :width="760" :height="560" :window="false" text="Create Workspace. Pick a ticket (typing filters, arrows and Enter work), switch its source, toggle repos, pick an environment."><CreateWorkspaceForm /></AppShot>

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
- **node_modules** - a fresh worktree takes `node_modules` from a shared
  store instead of installing, when a stored copy has the same lockfile
  (`package-lock.json`, `yarn.lock`, `bun.lock`), `patches/` folder, package
  manager, Node major version and platform. The first workspace fills the
  store from main (when main's lockfile matches) or after its own install, so
  the next install is a near-no-op. See [Shared node_modules](#shared-node-modules).

**Keep Main Fresh** (Settings > Integrations > Main Workspace) pulls every
repo of main from origin and migrates the ones that moved on a schedule
(**Refresh Every** N minutes); repos with uncommitted changes are skipped.
**Update Main from Origin** in main's menu runs it now.

See [Databases > Seed from main](./databases#seed-from-main).

## Shared node_modules

How a stored copy reaches a workspace depends on the drive:

| Drive | Method | Extra disk |
| --- | --- | --- |
| APFS (macOS), Btrfs, XFS | Copy-on-write clone | About none until a file changes |
| ext4 and others | Hard links (default) | About none |
| Store on another drive than the project | Copy, or a normal install | The full size |

With hard links a workspace's package files are the store's files under a
second name, so they are made **read-only**: a tool that edits one in place
(hand edits, a patch that is not in the stored copy) fails instead of changing
it for every workspace. Reinstalling and upgrading packages work as usual.

pnpm and Yarn's hard-link and Plug'n'Play modes share packages themselves and
are left alone.

**Settings > Dev Services > Shared node_modules** turns the store off, picks
what to do where cloning is not possible (**Hard Links**, **Copy** or **Run
Install**), and sets a **Size Limit** (20 GB) and **Remove Unused After** (14
days); copies over the limit or unused that long are removed after each new
workspace. **Open Store** (or `node_modules Store` in the command palette)
shows each repo of the open project by lockfile version:

- **Current on main** - the copy for main's lockfile, with the workspaces using
  it. Marked **New workspaces** when new workspaces get it instantly, or
  **Installs once** when there is no copy yet.
- **Changed on a branch** - a branch that changed the lockfile has its own copy.
- **Has its own copy** - a workspace that installed on its own although a copy
  matches. **Use Shared Copy** swaps its `node_modules` for the shared one and
  frees its size (stop its services first).
- **Save to Store** - keeps an install that has no copy yet (main's first) as
  the shared one.
- **Old versions** - copies no workspace's lockfile matches any more, with
  **Free**. **Free ... Unused** at the top removes all of them.

<AppShot :width="1000" :height="620" text="The node_modules Store tab. Try Use Shared Copy, Save to Store, Free, +7 more or Optimize."><ModuleStore /></AppShot>

**Optimize** does all of it in one go: it keeps an install for each lockfile
with no copy yet, moves every workspace that has its own copy onto the shared
one (its services are stopped and started again around the swap), then frees
the unused copies. It shows the plan and how much it frees at most before it
starts.

Removing a copy never breaks a workspace: each keeps its own. From a terminal:

```sh
pom modules          # list the copies
pom modules prune    # apply the size limit and unused-days rule now
pom modules clear    # remove every copy
```

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
