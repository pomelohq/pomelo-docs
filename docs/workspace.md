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
  own store. Next to each repo is the branch it will use, a new one from
  main or the same branch taken over from origin; click it to pick another
  branch in that repo.
- **Environment** - when the config defines `environments`, the profile the
  services point at (`local` by default).
- **Data** - when a ticked repo has `seed_from_main`, choose **Copy from
  main** or **Empty, run seeds** (start every database empty and seed it).
  From the CLI: `pom ws create <branch> --fresh-db`.

The footer sums up what **Create** will make, for example
`3 repos, 1 installs once, databases copied from main, local`.
**Create** (`enter`) and **Cancel** (`escape`) sit next to it.

<AppShot :width="620" :height="554" :window="false" text="Create Workspace. Pick a ticket (typing filters, arrows and Enter work), switch its source, toggle repos, pick an environment and the data."><CreateWorkspaceForm /></AppShot>

Pomelo builds the workspace through a staged pipeline. While it runs, the
workspace sits in the sidebar as a dim tile that fills from the bottom as
stages finish, with the stage it is on and how far along it is; a red ring
marks a run that failed:

<AppShot :width="256" :height="290" :window="false" text="A workspace being created"><div class="pa-sheet"><WorkspaceCreate /></div></AppShot>

1. Validating config and hosts
2. Provisioning workspace
3. Starting shared services and databases
4. Creating git worktrees
5. Configuring repos (env files)
6. Running setup commands
7. Seeding databases
8. Saving the workspace's baseline snapshot

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

Some entries of `node_modules` must stay private to each workspace. List them
with `modules_private` on the repo in `pom.yml` (or in a preset; a preset's
list is added to the repo's). Each entry is a name at the top of
`node_modules`, and what happens depends on the name:

- **Generated folders** - a name starting with `.` (no package name can) is a
  folder a tool writes in each workspace. The store never keeps or links it, so
  each workspace's setup generates its own. `.prisma` (written by
  `prisma generate`) is private by default.
- **Private packages** - any other name, scoped ones like `@myorg` included,
  is an installed package. The store keeps it, but each workspace gets a
  **writable copy** instead of hard links. Use it for a package a tool writes
  into or copies files out of: `prisma generate` copies runtime files out of
  `@prisma/client` keeping their mode, so read-only hard links would make the
  next generate fail. `@prisma` and `prisma` are private by default.

```yaml
presets:
  orm:
    modules_private: [.generated-client]
repos:
  api:
    preset: orm
    setup: [npm install, npx prisma generate]
    modules_private: ["@myorg"]
```

Quote a name that starts with `@`, as YAML requires.

A workspace that gets `node_modules` from the store has no `.prisma` until its
setup runs `prisma generate`, so keep that step in `setup`. Copies stored
before a folder was private are restored without it, and **Use Shared Copy**
keeps the workspace's own private folders. Build caches such as `.cache` and
`.vite` need nothing: each workspace creates its own.

pnpm and Yarn's hard-link and Plug'n'Play modes share packages themselves and
are left alone. When a repo has more than one lockfile, the package manager
its `setup` steps install with decides which one counts (`yarn`,
`npm ci` / `npm install`, `pnpm install`, `bun install`), then
`packageManager` in `package.json`, then pnpm, Yarn, npm and Bun in that
order. A repo with a stray `pnpm-lock.yaml` that installs with `yarn` still
uses the store.

**Settings > Dev Services > Shared node_modules** turns the store off, picks
what to do where cloning is not possible (**Hard Links**, **Copy** or **Run
Install**), and sets a **Size Limit** (20 GB) and **Remove Unused After** (14
days); copies over the limit or unused that long are removed after each new
workspace, and at most once a day when the app starts or `pom start` runs. **Open Store** (or `node_modules Store` in the command palette)
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

<AppShot :width="1060" :height="770" text="The node_modules Store tab. Try Use Shared Copy, Save to Store, Free (hover the old versions), +2 more or Optimize."><ModuleStore /></AppShot>

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

Select any workspace in the sidebar to switch to it, or press `cmd-alt-o`
for the workspace switcher: type to filter, `enter` switches, `cmd-n` starts
a new workspace. The switcher lists the workspaces that need you first (an
agent waiting, then a pull request in trouble), then main, then the rest in
the sidebar's order, each with its tile and its one status line. Each
workspace keeps its own tabs, terminals, and agent; switching never restarts
anything. Drag rows to reorder them; main stays first.

## Rename

**Rename...** in a workspace's menu sets its display name, with **Refine
with Claude** to suggest one. The branch never changes.

## Sleep and wake

A workspace you are not using can **sleep**: its services and agent sessions
stop, while its worktrees, databases and leased ports stay exactly as they
are. Waking it starts what ran when it went to sleep - the same services, on
the same ports, in dependency order, and its `claude` session again.

```sh
pom ws sleep feat-login           # stop its services and agents
pom ws sleep feat-login --force   # even while an agent is working
pom ws wake feat-login            # start what ran before
```

Sleeping is refused while one of the workspace's agents is in a turn
(thinking, running a tool, compacting) or waits for an approval; `--force`
puts it to sleep anyway. An agent started for one task with
`pom agent start --role <role>` is listed but not restarted on wake.

In the app, a workspace's menu has **Sleep Workspace** or **Wake Workspace**,
and a sleeping row says **Asleep**. `pom ws ls` marks it `sleeping`, and
`pom ws ls --json` gives each workspace a `state` (`running`, `sleeping` or
`queued`). The state lives in the workspace's `.pom-workspace.json`.

`pom ws ls --json` also gives `last_activity_at` (RFC 3339, `null` when
nothing has happened yet) and `last_activity_source`: `agent` (an agent
session's last recorded event), `proxy` (its last dev proxy request),
`service` (the start of a running service) or `git` (the newest HEAD, index
or HEAD log change of its repos, read from file times). It is the same value
idle sleep goes by.

Opening a sleeping workspace's service through the dev proxy wakes it: the
browser gets the waiting page, titled **Waking feat-login**, which reloads
itself once the service answers. A burst of requests wakes it once.

### Idle sleep and a running limit

Two choices in `settings.json` keep a machine with many workspaces from
running them all:

```json
{ "workspaces": { "idle_sleep_minutes": 60, "max_running": 3 } }
```

- **`idle_sleep_minutes`** (default `0`, never) - a workspace that has had no
  dev proxy request, no agent event, no service start and no git change (a
  checkout, a commit or staging in any of its repos) for that long is put to
  sleep. One whose agent is working never is.
- **`max_running`** (default `0`, any number) - how many workspaces may run
  at once, across every project on the machine. Starting or waking one more
  (`pom start`, `pom ws wake`, the app's Wake, a proxy request) first puts the
  least recently used idle workspace to sleep. When every running workspace
  has an agent at work, the new one is **queued** instead and starts, with what
  it was asked to start, as soon as a slot frees; the longest waiting goes
  first. `pom ws wake` says it is queued and exits 0; `pom start` exits 1 so a
  script does not wait on services that are not starting.

`pom proxy` and the app check once a minute. The dev proxy keeps each
workspace's last request in `proxy/activity.json` in Pomelo's state folder,
written at most every 30 seconds.

## Delete

Right-click a branch workspace and choose **Delete Workspace**, then
confirm. A staged pipeline tears it down: stopping services > releasing
ports and slots > running `pre_delete` commands > removing worktrees and
databases > cleaning up folders > cleaning up agent state and volumes. A
local branch with unpushed or unmerged commits is kept, and a database whose
name does not depend on the branch (so main uses it too) is never dropped. The **main** workspace can't be
deleted.

The last stage, cleaning up agent state and volumes, removes what the
workspace's agents left in Pomelo's state folder (their sessions, the
workspace's session index, leases and log) and any Docker volume labelled
`pom.workspace=<project>/<branch>`. Pomelo creates no per-workspace volumes
itself; give that label to volumes your own tooling makes for one workspace
and they go with it. Shared services' volumes never carry it.

```sh
pom ws delete feat-login
```

The first stage stops every process Pomelo started for the workspace: its
services, every agent session (the main agent and its extra tabs, side agents,
roles started with `pom agent start --role`, other agent CLIs, sessions started
from another machine) and its terminals. A holder that recorded its workspace
is matched by that; an older one by its name. If one is still running after
the stop, the stage fails before anything is removed; run the delete again to
resume. `pom ws gc` deletes through the same pipeline.

### Orphan holders

A holder whose workspace or project no longer exists (left by an older
version, or a folder removed by hand) is an **orphan**: nothing in Pomelo
reaches it any more, and `pom agent ls` cannot see it. `pom ps` marks it
`(orphan)` (`--json`: `orphan` and `orphan_reason` on each holder), and
`pom doctor` reports how many there are and the memory they hold.

```sh
pom ps --orphans                 # list them, with why each is an orphan
pom ps --orphans --kill          # stop them
pom ps --orphans --kill --json   # {schema: "pom.orphans/v1", orphans: [{name, pid, project, workspace, reason, memory_bytes, killed}], errors}
```

Only holders of projects this machine knows are judged; a holder of a
project Pomelo never opened here is left alone.

## Clean up merged workspaces

`pom ws gc` finds the workspaces whose pull request is merged in every repo of
the workspace that has one, lists each with the reason, and deletes them
through the same pipeline:

```sh
pom ws gc --dry-run   # list them; nothing is deleted
pom ws gc             # ask for each one
pom ws gc --yes       # delete them all without asking
pom ws gc --closed    # closed (unmerged) pull requests count too
```

```text
feat-login  api #12 merged, web #7 merged
feat-search  api #15 merged
  kept: web has 1 uncommitted change
  (--force deletes it anyway)
```

A workspace with uncommitted changes (untracked files included, except the
files Pomelo copied or generated) or with commits no remote has is **kept**,
and the reason is printed; `--force` deletes it anyway. Commits that are in
the pull request count as pushed, so a squash-merged branch whose remote
branch was deleted is not held back. On a terminal `pom ws gc` asks for each
workspace; anywhere else it refuses to delete without `--yes` (or lists with
`--dry-run`). It reads the pull requests with the GitHub token the PR tab uses
(`GH_TOKEN`, `GITHUB_TOKEN`, or the project's `github` secret). `--json`
prints `{schema: "pom.ws-gc/v1", workspaces: [{branch, reason, prs, action,
notes}]}`, where `action` is `deleted`, `kept`, `skipped`, `failed` or
`would_delete`.

The app can do the same when its pull requests refresh, set by
`workspaces.auto_cleanup` in `settings.json`:

```json
{ "workspaces": { "auto_cleanup": "ask" } }
```

- `"off"` (default) - nothing happens.
- `"ask"` - a notice says **N workspaces have merged PRs** with **Clean up**.
- `"auto"` - they are deleted without asking, except the one on screen.

Either way a workspace with uncommitted or unpushed work is kept: its delete
stops before changing anything and says why.

## Sync on push

When someone pushes to a workspace's branch on GitHub (a teammate, CI, an
agent on another machine), Pomelo can bring the workspace up to date by
itself. GitHub posts a webhook to the relay; the relay checks its signature,
finds the workspaces that have that repo on that branch, and syncs each one.

### Set it up

In the project, on the machine that runs its workspaces:

```sh
pom github webhook setup
```

```text
Payload URL:   https://hooks.dev.example.net/_pom/github
Content type:  application/json
Secret:        3f9c...e21a
               (shown once; it is stored in the project's secret store)
Events:        Just the push event
```

Enter those under the repository's **Settings > Webhooks** for every repo of
the project. The command never talks to GitHub. To add the hook from a
terminal instead:

```sh
gh api repos/myorg/api/hooks -f name=web -F active=true -f 'events[]=push' \
  -f config[url]=https://hooks.dev.example.net/_pom/github \
  -f config[content_type]=json -f config[secret]=<secret>
```

GitHub must be able to reach the payload URL. Locally it is
`http://127.0.0.1:8766/_pom/github`, which only a tunnel can reach; with
`proxy.domain` set it is `hooks.<domain>` (see
[Route GitHub webhooks to the relay](./network#route-github-webhooks-to-the-relay)).
GitHub's **Recent Deliveries** shows a green `ping` once it works, and
`pom sync status` lists it as `pong`. `--rotate` makes a new secret (update it
on GitHub too); `--json` prints `{schema: "pom.github/v1", payload_url,
secret, secret_created, ...}`, with `secret` only when it was just made.

### What a push does

`sync.on_push` in `pom.yml` decides, per project:

```yaml
sync:
  on_push: pull     # pull | notify | off; notify by default
```

- **`notify`** (default) - Pomelo fetches the branch and tells you: the app
  shows **feat-login: 3 new commits on GitHub (api)** with **Pull** when the
  worktree could take them cleanly. Nothing in the worktree changes.
- **`pull`** - a clean worktree that is only behind is fast-forwarded
  (`git fetch origin <branch>`, then `git merge --ff-only`). Then, by what the
  push changed:
  - a lockfile or other setup file (`package-lock.json`, `yarn.lock`,
    `Gemfile.lock`, `go.sum`, `.nvmrc`...) runs the repo's `setup` and
    restarts all of its running services;
  - a migration (`db/migrate/`, `migrations/`, `schema.rb`...) runs the
    repo's `migrate`;
  - otherwise only the running services whose `dir` contains a changed file
    restart (a service without `dir` counts every file).

  A sleeping workspace is only fast-forwarded; nothing starts.
- **`off`** - pushes are recorded and ignored.

Pomelo never pulls over your work. A worktree with uncommitted changes
(untracked files included, except the files Pomelo copied or generated) or
with local commits GitHub does not have is left exactly as it is, and the
notice says why: **not pulled: uncommitted changes** or **not pulled: local
commits GitHub does not have**. Pushes that arrive within 5 seconds of each
other (a rebase pushed commit by commit, several repos at once) sync once,
and a workspace never runs two syncs at the same time. A deleted branch only
gets a notice; tags are ignored.

### See what happened

```sh
pom sync status            # the last 20 deliveries and outcomes
pom sync status --json     # {schema: "pom.sync/v1", events: [...]}
```

```text
2026-10-22T09:15:04Z  push        pulled      myproject/feat-login api  2 commits  restarted api/web
2026-10-22T09:15:00Z  push        queued      myproject/feat-login api  - sync.on_push: pull
2026-10-22T09:02:11Z  push        dirty       myproject/feat-search api  1 commit  - 1 uncommitted change; the worktree was left as it is
2026-10-22T08:58:40Z  ping        pong
```

Each line is also in `sync/pushes.ndjson` in Pomelo's state folder
(`pom.push/v1`), and each delivery shows in the app's **Dev Requests** log
as `POST /_pom/github`. `pom ws ls --json` gives every workspace
`remote_ahead` (commits `origin/<branch>` has that the worktree does not, as
of the last fetch) and `last_sync` (`{time, outcome, repo, commits,
restarted, detail}` of the last push that reached it, or `null`).

::: warning Security
A delivery is trusted only when its `X-Hub-Signature-256` matches the
project's secret (HMAC-SHA256 of the body, compared in constant time).
Without a secret the endpoint answers `403`, and with a wrong or missing
signature `401`, and nothing happens. The secret is per project, kept
encrypted in the project's secret store under the internal name
`__github_webhook` (it never appears in `pom.yml` or in an agent's
`secrets_list`), and a delivery only reaches the repos of the project whose
secret signed it. Even a trusted push only ever fetches and fast-forwards:
it never resets, merges or rebases a branch.
:::

## Move a workspace

A workspace you started on one machine (the laptop, say) can open on another (a dev VM) exactly as you left
it: the same commits, including the ones you never pushed, the same uncommitted and untracked files, and the
test data in its databases.

```sh
pom ws export feat-login                 # writes myproject-feat-login.pomws here
pom ws import myproject-feat-login.pomws # on the other machine
pom ws export feat-login --to dev        # or stream it straight into a host of `pom host`
```

The other machine needs the project first, with its repos cloned on main. `pom project export` and
`pom project import` bring it over (see below), or set it up by hand: the import checks that each repo's
`origin` is the same repo as on the source (SSH and HTTPS URLs of one repo match).

**What travels**

| In the archive | How it comes back |
| --- | --- |
| Commits origin does not have (`git bundle` of the branch since it left origin's default branch) | The branch is created at the same commit; nothing is pushed |
| Uncommitted changes (`git diff --binary HEAD`), and which of them were staged | Applied to the new worktree, the staged part staged again |
| Untracked files git does not ignore | Unpacked into the worktree |
| Each database the workspace owns (`pg_dump -Fc`, run inside the shared Postgres) | Restored with `pg_restore` under this machine's names: `myproject_api_feat-login` becomes `<this project>_api_feat-login` |
| Docker volumes labelled `pom.workspace=<project>/<branch>` | Recreated with this machine's label |
| The display name and env profiles of `.pom-workspace.json` | Set on the new workspace |
| The secrets the config uses (`{{secret.NAME}}`), sealed with a passphrase | Stored in this machine's secrets store; one this machine already has keeps its value (a warning names it) |

**What does not travel**

- **Gitignored files** (`.env.local`, logs, build output, `node_modules`): they are machine-specific or can be
  made again. Env files are written again from `pom.yml` with this machine's paths and freshly leased ports,
  and setup runs as it does for a new workspace.
- **`secret.key`**, the key this machine encrypts its secrets with. The secrets are decrypted on the source
  and sealed again with your passphrase; the import stores them under the target's own key.
- Secrets the config does not use, other workspaces' data, databases shared with main, and running services.

**The passphrase.** When the config uses secrets, `pom ws export` asks for a passphrase on the terminal (twice)
and `pom ws import` asks for it again; in a script, set `POM_BUNDLE_PASSPHRASE` instead. It is never a
command-line argument. A wrong passphrase stops the import before anything is made. With `--to`, pom makes a
one-time passphrase itself and sends it to the host ahead of the archive, over the same SSH connection.

| Command | What it does |
| --- | --- |
| `pom ws export <branch> [-o file.pomws] [--no-db] [--json]` | Writes the archive (`-o -` writes it to stdout; `-o json` and `-o table` choose the report format, as for every command). `--no-db` leaves the databases and volumes out. |
| `pom ws export <branch> --to <host> [--no-db] [--json]` | Streams it over SSH into `pom ws import -` on a host of [`pom host`](/docs/remote); no archive file is written on either side. |
| `pom ws import <file.pomws \| -> [--project name] [--branch new] [--json]` | Opens it here. The project is found by name (or `--project`, or `-c`); `--branch` imports it under another branch name. |

Each step of the import is a stage, as in [Create](#create). If one fails, the error says which; run the same
import again to resume from that stage, or `pom ws delete <branch>` to remove what it made. An archive made by
a newer pom (a newer major version of its format, `pom.wsbundle/v1` today) is refused before anything
changes. Progress goes to stderr.

**JSON output.** With `--json` (or `-o json`), `ws export`, `ws import`, `project export` and
`project import` print exactly one `pom.ws-transfer/v1` document on stdout, also when they fail. A failure
exits non-zero with:

```json
{"schema": "pom.ws-transfer/v1", "error": {"code": "passphrase_required", "message": "..."}}
```

| Code | When |
| --- | --- |
| `passphrase_required` | The secrets need a passphrase: `POM_BUNDLE_PASSPHRASE` is not set and there is no terminal to ask on. |
| `passphrase_mismatch` | The two passphrases typed on the terminal differ. |
| `wrong_passphrase` | The archive does not open with that passphrase (or it is damaged). |
| `host_unreachable` | `--to`: SSH could not reach the host (exit 69). |
| `remote_failed` | `--to`: the import on the host failed; its own error is under `error.remote`. |
| `usage` | The command line is wrong (exit 2). |
| `failed` | Anything else; `message` says what. |

stderr then carries only JSON, one event per line, so a script can follow progress or ignore it:

```json
{"event": "progress", "stage": "repo", "message": "api: commits and changes"}
{"event": "stage", "index": 8, "of": 11, "stage": "Restoring databases and volumes"}
{"event": "warning", "message": "..."}
```

Export stages are `repo`, `database`, `volume` and `archive`, and a project import adds `clone`. An import also
reports its stages (`stage`, `progress`, `warning`, `stage_done`, `stage_skipped`). With `--to`, the host's own
events are passed on with `host` added.

### Move a project

```sh
pom project export                  # writes myproject.pomproj
pom project import myproject.pomproj
pom project export --to dev
```

`pom project export` carries `pom.yml`, every secret of the project (sealed with a passphrase, as above) and
each repo's `origin` and default branch. `pom project import` writes `pom.yml` into `~/pom/<project>` (or
`--dir`), stores the secrets under this machine's key, clones each repo on main and lists the project in
`pom project ls`. It refuses a project this machine already has.

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
| `workspace_info` / `services` / `ports` / `service_url` | See the branch, its repos, each service's running state, port and URL, and the shared services with theirs |
| `databases` | Get ready-to-use per-branch connection strings |
| `db_list` / `db_tables` / `db_columns` / `db_query` | Browse and query the branch's Postgres and Redis |
| `service_start` / `service_stop` / `service_restart` | Bring services up/down (ports are pre-flighted) |
| `shared_start` / `shared_stop` / `shared_restart` | Bring a shared service (a container or a shared command) up/down for every workspace; stopping one other workspaces may use needs `force: true` |
| `service_logs` | Read a service's recent output (e.g. to spot a crash) |
| `commands` | List the project's `setup` steps and tasks plus its package manager - so the agent runs *your* canonical install/migrate/lint/test commands |
| `run_shortcut` | Run one of those tasks in the repo's resolved env |
| `run_in_env` | Run a command in a worktree with the resolved env - migrations, tests, seeds - and read the result (refused on main) |
| `resolve_port_conflict` | Give the workspace's services fresh ports when something else grabbed one, and restart the running ones on them |
| `secrets_list` | List secret names (never values) |
| `config_get` / `config_validate` / `config_set` | Read and safely edit `pom.yml` - every write is validated before it lands, and new services get ports automatically |
| `config_doctor` / `config_normalize` | Check what keeps the project from running; clean up the config |

So mid-task you can say *"the migration failed - check the DB and rerun
it"* or *"add a worker service and start it"*, and the agent uses these
tools instead of guessing. Everything stays on your machine.

`pom mcp` is the underlying command; it's wired up automatically, so you
rarely run it yourself. Every tool, with its arguments, is listed in the
[MCP tools reference](/reference/mcp).

## Recovery

Workspace state lives on disk: machine-wide state in `~/.local/state/pom`,
a `.pom-workspace.json` (display name, env profiles) in each workspace
folder, and the `workspace--<branch>/` folders themselves - so the app can
quit and reopen without losing anything. If you delete a workspace folder
by hand, Pomelo prunes the stale git worktree registration before it adds a
worktree again.
