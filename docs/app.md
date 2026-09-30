# The app

Pomelo is a **native macOS app**, and the primary way to drive Pomelo day
to day. It is one Rust program with a GPU-rendered UI and the core built
in (no port, no browser), so everything you see is the real state of your
worktrees, services and agents. This page is the tour.

<AppShot :width="1440" :height="860" :window="false" text="The Pomelo window: workspaces, the Services panel, the editor and a terminal"><HeroWindow /></AppShot>

## Layout

- **Title bar** - the project name (click it to switch projects), the
  active workspace's branch, and at the right the agents'
  [usage chip](./agents#usage-and-plan-limits) and the app menu.
- **WORKSPACES sidebar** - every workspace of the project, on the left.
- **Center** - the editor: tabs and splits for files, diffs, tickets and
  other items.
- **Docks** - function panels (Files, Services, Git, Database), the
  terminal and the agent live in docks around the center. By default the
  panels open in the left dock, the terminal in the bottom dock and the
  agent in the right dock.
- **Status bar** - a button per panel, the terminal and the agent (hover
  one for its name and key), today's agent usage, diagnostics, the cursor
  position and the file's language.

Right-click a status bar button to move its panel (**Dock Left**, **Dock
Right**, **Dock Bottom**) or **Hide Button**. **Settings > Window &
Layout** sets the sidebar, agent and terminal sides and what the status and
title bars show.

## Projects

A project is one `pom.yml` and its workspaces. Click the project name in
the title bar to search your projects, switch the window to another one, and
reach **New session...** (the new project page), **Open a session...** and
**Edit pom.yml**. Hovering a project offers
**Open in New Window**, **Open in This Window**, **Reveal in Finder** and
**Remove from List** (which keeps the files). **New Project**
(`cmd-shift-n`) and **Open Project** (`cmd-o`) are in the command palette
and on the welcome page, next to **Import a bundle** and your recent
projects. See [Quick Start](./quickstart).

## WORKSPACES sidebar

Each row is a workspace:

- its name (the display name, or the branch) and a **PR pill** with the
  number of pull requests, colored by their state; click it to open the Git
  panel,
- the agent's state as a colored dot: **Thinking**, **Using tools**,
  **Compacting**, **Awaiting input** or **Idle** (see
  [Agent status](./agent-status)),
- under the name, the ticket key and its status (colored by category), or
  the branch, then how many services run (`2 running`) and what is wrong
  with the pull request (`Checks pending`, `CI failed`, `Conflict`).

<AppShot :width="280" :height="210" text="Workspace rows"><WorkspacesList /></AppShot>

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

Large files open without a wait: files of millions of lines (a big CSV or
log) load in the background on every core, then scroll and take typing as
smoothly as a small one.

The **main** workspace is the prepared source new workspaces copy from, so
its files are **read-only**: their tabs show a lock in place of the file
icon, and saving there says "main is read-only: make changes in a branch
workspace". The project config (`pom.yml`)
stays editable from main; every save of it is
[checked first](./project-config#checked-saves).

**Open in External Editor** (command palette) opens the active file in the
app chosen in **Settings > Editor > External Editor**.

## Panels

- **Files** (`cmd-shift-e`) - the workspace's file tree across all its
  repos, tinted by git status. Right-click for **New File** / **New
  Folder**, **Reveal in Finder**, **Open in Default App**, **Open in
  Terminal**, cut, copy, **Duplicate** and paste, **Copy Path** / **Copy
  Relative Path**, **Restore File**, **Add to .gitignore**, rename, trash
  or delete, and **Expand All** / **Collapse All**.
- **Services** (`ctrl-shift-s`) - what runs, what failed and why, with
  start, stop, restart and the logs a click away. Its header opens the
  **Secrets** and **Environment** tabs. See [Services](./services).
- **Git** (`ctrl-shift-g`) - see [below](#git). Hidden on main, which is
  never committed to.
- **Database** (`ctrl-shift-d`) - browse and query the workspace's
  databases. See [Databases](./databases).

A green dot on the Services button means a service of the active workspace
is running.

## Git

The Git panel works on all of the workspace's repos at once, in three tabs:

- **Changes** - the files the branch changed, **Staged** and **Not
  staged**, by repo. Type a message and **Commit** makes one commit per
  repo that has staged files, all with the same message; **Amend** amends
  them. The overflow menu has **Stash All**, **Stash Pop**, **Discard
  Tracked Changes**, the commit options **Amend**, **Signoff** and **Skip
  Hooks**, and **Pull**, **Push** and **Fetch All**; the view options show
  the files **By Repo** or as **One Timeline**, as a tree or a list.
- **Remote** - per repo, what is **Not pushed**, **Not published** or **On
  origin, not pulled**, the files changed on the branch, and the branch's
  pull request: its title, checks, reviews, and **Merge conflict** when it
  has one. **Create Pull Request** opens GitHub's page for a pushed branch.
- **History** - the branch's commits.

The sync button follows the branch: **Publish**, **Push**, **Pull**,
**Sync** or **Up to date**. Right-click a file for **Open Diff**, **Open
File**, **Mark as Reviewed**, **Copy Path**, **Copy Relative Path** and
**Discard Uncommitted Changes**, and a repo's remote for **Fetch**,
**Pull**, **Pull (Rebase)**, **Push** and **Force Push**.

<AppShot :width="360" :height="470" text="The Changes tab: one commit per repo from the staged files. Click a file to stage it."><GitPanel /></AppShot>

**View Diff** opens the branch's whole diff with every hunk expanded. The
two buttons in its tab bar switch between **unified** and **split**
(side-by-side, when the pane has room for it); the choice is kept for every
diff and matches **Split Diff** in the editor's menu.

<AppShot :width="720" :height="345" text="A branch diff, split. The two buttons switch to unified."><DiffView /></AppShot>

## Terminal and agent

The terminal dock (`` ctrl-` ``, new terminal `cmd-t`) holds real shells
in the workspace, in panes with tabs. Each runs in a PTY holder, so it keeps
running and reattaches when the app restarts; closing its tab ends the
shell. Right-click a terminal for **Copy**, **Paste**, **Select All**,
**Clear**, **Add Selection to Agent**, **Ask Agent about Selection** (or
**...about This Output**) and **Close Terminal Tab**.

The **agent** button (`cmd-?`) opens the workspace's main agent in the
agent dock, and **+** there starts side agents next to it. See
[Agents](./agents).

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
default key, such as **Open Project Config** or **Add Repository**, live
here.

## Pull requests

PR data comes from GitHub's API directly, no `gh` CLI needed. Diffs and
changed files are read from your local worktrees. Pomelo reads the token
from `GH_TOKEN` or `GITHUB_TOKEN` in its environment, otherwise from the
project's secret named `github`: add it in the Services panel's **Secrets**
tab, for example with the value of `gh auth token`. The token only needs to
read the repositories' pull requests. After a push, the Git panel offers
**Create Pull Request**, which opens GitHub's page.

## The menu bar

Pomelo's menus in the macOS menu bar hold every window command, with the
key bound to it right now (your `keymap.json` included):

| Menu | What's there |
| --- | --- |
| **Pomelo** | About, **Check for Updates...**, **Release Notes**, **Settings...**, **Keymap**, Hide, Quit. |
| **File** | **New Workspace**, **New Project...**, **Open Project...**, **Save**, **Close Tab**, **Close All Tabs**, **Close Window**. |
| **Edit** | Undo, Redo, Cut, Copy, Paste, Select All, **Find**, **Find in Project**; they act on whatever has focus, the editor, a terminal or a text field. |
| **View** | The docks, **Files**, **Git**, **Services**, **Database**, **Pull Requests**, **Agent**, **Terminal**, **Split Right**, **Markdown Preview**, **Next Theme**. |
| **Go** | **Command Palette...**, **Go to File...**, **Go to Line...**, **Back**, **Forward**, **Previous Tab**, **Next Tab**, **Switch Workspace...**. |
| **Window** | Minimize, Zoom, Bring All to Front and the open windows. |
| **Help** | The docs, **Keyboard Shortcuts**, **Release Notes**, **Report an Issue...**. |

## The app menu

The chevron at the far right of the title bar opens the app menu: the
Claude account signed in on this Mac, **Check for Updates...** (or
**Restart to Update 0.7.4** once one is ready), **Release Notes**,
**Settings**, **Keymap**, **Next Theme**, **Agent Usage** and **Panel
Layout**. While an update downloads, the title bar shows its progress; see
[Install > Updates](./install#updates).

## Settings

`cmd-,` opens Settings in its own window:

| Page | What's there |
| --- | --- |
| **General** | Start at Login; the version, with **Check Now**, **Restart to Update** or **Try Again**. |
| **Appearance** | Theme (built-in or [your own](./themes), static or following macOS light and dark; `cmd-k cmd-t` cycles) and the UI font. |
| **Window & Layout** | Status bar and title bar items, dock sides, agent and terminal buttons. Each window reopens where you left it (position, size, maximized or full screen). |
| **Editor** | The buffer font (family, size, weight, line height, [features and fallbacks](./themes#fonts)), soft wrap, diff view, external editor. |
| **Terminal** | The terminal font (family, size, weight, line height, features, fallbacks), shell, scrollback. |
| **Keymap** | Every window action and its binding; opens `keymap.json`. |
| **Agent** | Agent command; Claude Code MCP server and activity hooks, with **Reinstall**. |
| **Notifications** | Banners and a sound per agent event. |
| **Dev Services** | Turn the [dev-proxy and webhook relay](./network) on or off, set their ports, see their status and **Restart** them. **Open Requests** opens the Dev Requests tab. The [shared node_modules store](./workspace#shared-node-modules): on or off, the fallback where cloning is impossible, size limit, and **Open Store**. |
| **Integrations** | Jira (site, email, API token, test connection) and **Keep Main Fresh**. |
| **Project** | Repositories, config files and config bundles. See [Project config](./project-config). |

Settings are saved to `~/.config/pomelo/settings.json`.
