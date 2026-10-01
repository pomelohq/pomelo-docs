# FAQ & troubleshooting

Answers to the questions that come up most — especially the non-obvious
ones. If something here is out of date, please open an issue.

## macOS won't open the app ("unidentified developer" / Gatekeeper)

It shouldn't - the app is signed with an Apple Developer ID and notarized,
so Gatekeeper opens it silently. If a stray copy is quarantined (e.g.
downloaded oddly), right-click **Pomelo.app** > **Open** once, or verify
from Terminal:

```bash
spctl -a -vv /Applications/Pomelo.app
```

## No agent is offered to set up a project

The **Setup** step lists the agent CLIs Pomelo finds: `claude`, `codex` and
`gemini`, on your `PATH` and in the installers' usual locations such as
`~/.local/bin`. With none installed, install one (for Claude Code,
`npm install -g @anthropic-ai/claude-code`), or write `pom.yml` yourself -
see the [config reference](../reference/config). **Fix with Claude** needs
Claude Code.

## "Project setup needs attention"

That notice is the config doctor: it found something that keeps the project
from running - git or Docker missing, Docker not running, a repo not cloned
into main, a removed config key, an unset `{{secret.*}}`, or a shared
service nothing is wired to. **Fix with Claude** opens an agent on the
findings; `pom doctor` prints the full list with a fix for each. A config
that does not load shows **Invalid pom.yml** instead, with **Open pom.yml**
at the problem. The doctor is deterministic (no LLM).

## Shared services (Postgres/Redis/...) aren't running

They need **docker**. You don't have to start them manually — starting a
repo service first brings its shared dependencies up. Check `docker ps`,
and that Docker Desktop is running.

## A service starts fine in my terminal but fails in Pomelo

Pomelo runs services in a **login, non-interactive** shell (`zsh -lc`) and
deliberately **does not source your `~/.zshrc`** - sourcing it can trip a
macOS permission prompt (a prompt plugin touching the Media library, etc.).
Instead it prepends the well-known version-manager and tool dirs to `PATH`
(pnpm, volta, bun, fnm, asdf, rbenv, pyenv, nvm, `~/.cargo/bin`, Homebrew),
so `node`, `ruby`, and friends resolve without `.zshrc`.

If a service still can't find a binary, its toolchain isn't on a standard
manager path - put the setup (a `use`/`export`) in the service's or repo's
`pre_start` hook. `pre_start` runs after the `cd` into the worktree and
before the command.

## PR pills / checks don't show up

- Pomelo talks to GitHub directly (no `gh` CLI). It reads the token from
  `GH_TOKEN` or `GITHUB_TOKEN` in the environment the app was launched with
  (an app opened from Finder doesn't see your shell's exports), otherwise
  from the project's secret named `github`: add it in the Services panel's
  **Secrets** tab. A read-only token is enough. See
  [Pull requests](/docs/git#pull-requests).
- On an **organization**, a fine-grained token must be approved by an org
  admin before it works.
- The repo needs a GitHub `origin` remote. **SSH host aliases work**
  (e.g. `git@myalias:owner/repo` from your `~/.ssh/config`) - Pomelo reads
  `owner/repo` from any URL form.
- A workspace shows **no PR pill** when its branch has no open or merged PR.

## Where is "Delete Workspace"?

Right-click a workspace in the sidebar > **Delete Workspace** (it asks
first). It's offered on branch workspaces only - **main** is the project's
home and can't be deleted; its menu has **Update Main from Origin**,
**Prepare Main...** and, when repos are missing, **Clone Missing Repos...**
instead. Branch workspaces also have **Add Repos...**, and every row has
**Rename...**.

## How do I add a repo to the project?

**Settings > Project > Add Repository** (or **Add Repository** in the
command palette): enter a git URL or folder and an optional alias, and tick
the workspaces that should get it. Pomelo clones it into main, detects its
services and adds it to the config. On a **branch** workspace, right-click
> **Add Repos...** adds worktrees for repos already in the project. See
[Project config](./project-config#repositories).

## How do I remove a project from the list?

Open the project switcher (the project name, top-left) and hover the
project: **Remove from List** unregisters it and leaves the files on disk.
You can't remove the project open in this window - switch first. To delete
the files, remove the folder in Finder.

## Two services grabbed the same port / ports keep changing

Each service with a port gets a random free port reserved atomically, and
keeps it across restarts while it is in use. Shared services keep their
usual port when it is free, for stable connection strings. If a start
reports a port in use, something outside Pomelo is holding it: free it, or
click **Use a new port** on the service's row.

## A service URL says "backend not reachable"

The proxy reached the service's port and got no answer, while the service has
no process of its own listening anywhere: it crashed, or it was started outside
Pomelo on another port. Open its tab to see its output and restart it. When the
service is only building or is stopped, the page says so instead
(`still starting`, `not running`).

## I deleted a workspace folder by hand and now create fails

Deleting a `workspace--...` folder with `rm -rf` instead of the **Delete
Workspace** action leaves git with a stale worktree registration. Pomelo
prunes stale registrations automatically before adding a worktree, so a
retry usually just works. Prefer **Delete Workspace** - it removes
worktrees, databases, and ports together, so nothing goes stale.

## When are `.env` files (re)written?

They are generated from the config: at workspace create (Configuring
repos), whenever a service starts, whenever the config changes (for every
workspace), and before commands run through Pomelo (tasks, agent
tools). Services also get their env injected directly. Don't hand-edit
them.

## How do I update the app?

It updates itself. A newer release downloads in the background and waits:
the title bar shows **Restart to Update** when it is ready, and quitting
installs it too. **Check for Updates** in the app menu checks right away.
See [Install > Updates](./install#updates).
