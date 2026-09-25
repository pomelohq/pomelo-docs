# The app

Pomelo is a **native macOS app**, and the primary way to drive Pomelo day
to day. It is one Rust program with a GPU-rendered UI and the core built
in (no port, no browser), so everything you see is the real state of your
worktrees, services and agents. This page is the tour.

<Shot src="/shots/app.png" text="The Pomelo window: workspaces on the left, the Files panel, the editor and a terminal" />

## Layout

- **Top bar** - the project name (click it to switch projects) and the
  active workspace's branch.
- **WORKSPACES sidebar** - every workspace of the project, on the left.
- **Center** - the editor: tabs and splits for files, diffs, tickets and
  other items.
- **Docks** - function panels (Files, Services, Git, Database), the
  terminal and the agent live in docks around the center. By default the
  panels open in the left dock, the terminal in the bottom dock and the
  agent in the right dock.
- **Status bar** - a button per panel, the terminal and the agent, plus
  diagnostics, the cursor position and the file's language.

Right-click a status bar button to move its panel (**Dock Left**, **Dock
Right**, **Dock Bottom**) or **Hide Button**. **Settings > Window &
Layout** sets the sidebar, agent and terminal sides and what the status and
title bars show.

## Projects

A project is one `pom.yml` and its workspaces. Click the project name in
the top bar to search your projects, switch the window to another one, and
reach **Open a session...** and **Edit pom.yml**. Hovering a project offers
**Open in New Window**, **Open in This Window**, **Reveal in Finder** and
**Remove from List** (which keeps the files). **New Project**
(`cmd-shift-n`) and **Open Project** (`cmd-o`) are in the command palette
and on the welcome page. See [Quick Start](./quickstart).

## WORKSPACES sidebar

Each row is a workspace:

- its name (the display name, or the branch) and a **PR pill** with the
  number of pull requests, colored by their state; click it to open the Git
  panel,
- the agent's state - a dot, and a label: **Thinking**, **Using tools**,
  **Compacting**, **Awaiting input** or **Idle** (see
  [Agent status](./agent-status)),
- how many services run (`2 running`),
- its Jira ticket status, colored by category; click it to open the ticket.

Click a row to switch to it. Each workspace keeps its own tabs,
terminals and agent; switching never restarts anything. Drag rows to
reorder them; **main** always stays first. The **+** in the header opens
**New Workspace** (`cmd-n`), and workspaces being created or deleted show
their stages and progress at the top, with **Retry** when one fails.

Main's row warns `not cloned: ...` when the config names repos main has no
clone of.

Right-click a row for:

| Item | Shown | Does |
| --- | --- | --- |
| **Rename...** | always | Sets the display name (the branch stays). |
| **Open Ticket** | the branch names a Jira ticket | Opens the ticket in a tab. |
| **Stop All Services** | services run | Stops every service of that workspace. |
| **Clone Missing Repos...** | main lacks repos | Clones them into main. |
| **Add Repos...** | branch workspaces | Checks out more of the config's repos there. |
| **Update Main from Origin** | main | Brings main's repos to their default branch as origin has it and migrates the ones that moved; repos with uncommitted work are left alone. |
| **Prepare Main...** | main | Resets main's databases, migrates and seeds. |
| **Delete Workspace** | branch workspaces | Stops it and removes its worktrees, databases and folder. |

Fold the sidebar (`cmd-b`, or the button in its footer) to a **rail** of
round badges: the ticket number or a short name inside, the **ring colored
by the agent's state**, and small dots for running services plus a pull
request mark underneath.

## Editor

The center is a full code editor: tree-sitter highlighting, language
servers (found on your `PATH`), multiple cursors, find and replace, go to
file (`cmd-p`), project search (`cmd-shift-f`), an outline, Markdown
preview and diffs. Split with `cmd-\` and drag tabs between panes. See
[Keyboard shortcuts](./shortcuts).

The **main** workspace is the prepared source new workspaces copy from, so
its files are **read-only**: saving there says "main is read-only: make
changes in a branch workspace". The project config (`pom.yml` and `pom.d/`)
stays editable from main; every save of it is
[checked first](./project-config#checked-saves).

**Open in External Editor** (command palette) opens the active file in the
app chosen in **Settings > Editor > External Editor**.

## Panels

- **Files** (`cmd-shift-e`) - the workspace's file tree across all its
  repos, tinted by git status. Right-click for new file or folder, copy
  path, reveal in Finder, open in terminal, restore or add to `.gitignore`.
- **Services** (`ctrl-shift-s`) - start, stop and restart the workspace's
  services and see their output. Its **Environment** tab shows each
  service's resolved env and **Secrets** holds the project's encrypted
  secrets. See [Services](./services).
- **Git** (`ctrl-shift-g`) - per repo, the files the branch changed since
  it left the default branch, committed or not: stage, commit, amend,
  push, pull and fetch. Its **Pull Requests** (`ctrl-shift-p`) list the
  branch's pull requests with checks, reviewers and the conversation.
- **Database** (`ctrl-shift-d`) - browse and query the workspace's
  databases. See [Databases](./databases).

A green dot on the Services button means a service of the active workspace
is running.

## Terminal and agent

The terminal dock (`` ctrl-` ``, new terminal `cmd-t`) holds real shells
in the workspace, in panes with tabs. Each runs in a PTY holder, so it keeps
running and reattaches when the app restarts; closing its tab ends the
shell.

The **agent** button (`cmd-?`) opens the command set in **Settings >
Agent > Agent Command** (`claude` by default) in the agent dock, rooted at
the workspace. Claude Code resumes the workspace's conversation and gets
Pomelo's [MCP tools](./workspace#agent-tools-mcp), so mid-task it can check
ports, databases and services and act on the real stack. The agent runs in
its own holder: closing its tab or quitting the app leaves it running, and
the tab reattaches. Pomelo never stores AI credentials; you log in to the
CLI yourself.

## Notifications

Pomelo posts macOS notifications when a workspace's Claude finishes, needs
input or compacts, with a sound per event. Configure them in **Settings >
Notifications**; see [Agent status](./agent-status#get-notified-on-a-change).

Inside the window, notices appear for things that need a look:

- **Invalid pom.yml** - the config does not load; **Open pom.yml** jumps to
  the problem.
- **Project setup needs attention** - the config doctor found problems;
  **Fix with Claude** opens an agent on them (or **Open pom.yml** when
  Claude Code is not installed).
- **N services still run the old config** - after a config change;
  **Restart** restarts them.

## Command palette

`cmd-shift-p` lists the window's commands (as `workspace: <name>`, with
their keys), each panel's commands and the editor's. Commands with no
default key, such as **Open Project Config**, **Add Repository** or **Set
Up Project with AI**, live here.

## Pull requests

PR data comes from GitHub's API directly, no `gh` CLI needed. Diffs and
changed files are read from your local worktrees. Pomelo reads the token
from `GH_TOKEN` or `GITHUB_TOKEN` in its environment, otherwise from the
project's secret named `github`: add it in the Services panel's **Secrets**
tab, for example with the value of `gh auth token`. The token only needs to
read the repositories' pull requests. After a push, the Git panel offers
**Create Pull Request**, which opens the host's page.

## Settings

`cmd-,` opens Settings in its own window:

| Page | What's there |
| --- | --- |
| **General** | Start at Login; version and updates. |
| **Appearance** | Theme (One Dark, One Light, Ayu Mirage, Gruvbox Dark; `cmd-k cmd-t` cycles) and UI font. |
| **Window & Layout** | Status bar and title bar items, window size, dock sides, agent and terminal buttons. |
| **Editor** | Font size, soft wrap, diff view, external editor. |
| **Terminal** | Font size, shell, scrollback. |
| **Keymap** | Every window action and its binding; opens `keymap.json`. |
| **Agent** | Agent command; Claude Code MCP server and activity hooks, with **Reinstall**. |
| **Notifications** | Banners and a sound per agent event. |
| **Network** | Dev-proxy and webhook relay status and ports, recent proxied requests. |
| **Integrations** | Jira (site, email, API token, test connection) and **Keep Main Fresh**. |
| **Project** | Repositories, config files and config bundles. See [Project config](./project-config). |

Settings are saved to `~/.config/pomelo/settings.json`.
