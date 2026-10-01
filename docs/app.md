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

Click a row to switch to it; click the ticket status under the name to open
the ticket the same way as **Open Ticket** below. Each workspace keeps its own tabs,
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
| **Open Ticket** | the branch names a Jira ticket | Switches to that workspace if it is not the one on screen, then opens the ticket in a tab (or focuses it). |
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

The center is a full code editor: tree-sitter highlighting,
[language servers](#language-servers), multiple cursors, find and replace,
go to file (`cmd-p`), project search (`cmd-shift-f`),
[project diagnostics](#project-diagnostics) (`cmd-shift-m`), an outline,
Markdown preview and diffs. Split with `cmd-\` and drag tabs between panes. See
[Keyboard shortcuts](./shortcuts).

A single click on a file in the Files tree opens it as a **preview tab**,
with its title in italics: the next file you preview replaces it, so
browsing does not pile up tabs. It becomes a tab of its own when you edit
it, pin it, drag it, double-click its tab, or open the file another way
(double-click in the tree, go to file, search). Go to definition into
another file also opens that file as the preview, and keeps the preview
you came from. Tab titles longer than 24 characters end in `...`.

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

### The editor's toolbar

A bar under each file's tabs shows where you are: the file's path, then the
symbols around the caret (a class, then its method), colored like the code.
Click it to open the outline. On its right:

- **Search** opens the find bar.
- **Selection Controls** (the text cursor): Select All, Select Next
  Occurrence, Expand and Shrink Selection, Add Cursor Above and Below, Go to
  Symbol, Go to Line/Column, Next and Previous Problem, Next and Previous
  Hunk, Move Line Up and Down, Duplicate Selection, each with its key.
- **Editor Controls** (the sliders) turns things on or off in this editor:
  - **Minimap**: the whole file in miniature beside the scrollbar. It scrolls
    with the editor, and its thumb frames what you see. Click it to jump
    there, or drag the thumb.
  - **Diagnostics**: the squiggles under problems.
  - **Inline Diagnostics** (off at first): each line's most severe problem
    at the end of that line.
  - **Line Numbers**, **Inline Git Blame**, **Soft Wrap**.

### Language packages

Most languages are highlighted out of the box. These are a small download
instead, so the app stays smaller: C#, Dart, Elixir, Elm, Erlang, Gleam,
GraphQL, Haskell, HCL, Kotlin, Lua, Nix, OCaml, Prisma, Proto, R, Scala,
Svelte, Swift, XML and Zig.

A file in one of them is still recognized (the status bar names its
language) and opens as plain text, with a notice such as **Kotlin is
available for this file**.

- **Install Kotlin** (the language's name) downloads its package (highlighting, outline,
  indentation, comments and brackets for that language), checks it against
  its checksum and Pomelo's signature, and highlights every open file of
  that language in place.
- **Don't show again** stops the notice for that language for good.

Languages you opened lately are installed in the background the first time
you start a version of Pomelo that no longer carries them, so they stay
highlighted.

Installed packages stay up to date on their own: when a newer one is
published, Pomelo downloads and checks it in the background, switches open
files to it, then removes the old one. If the update fails, the package you
have keeps working.

Packages live in `~/Library/Application Support/Pomelo/grammars/`, one
folder per language and version. Delete a language's folder to remove it.

Offline, a file whose package is not installed stays plain text, and an
install that cannot download says so in a notice. Pomelo checks the list of
packages at most once a day; until it can, it uses the list it shipped with.

### Language servers

Go to definition (`cmd`-click, or `F12`), hover, completions and the
squiggles under problems come from a language server for the file's
language:

| Language | Server |
| --- | --- |
| TypeScript, TSX, JavaScript | vtsls, or typescript-language-server |
| Python | basedpyright, pyright or ty |
| Rust | rust-analyzer |
| Go | gopls |
| C, C++ | clangd |
| Ruby | solargraph (ruby-lsp when you name it, see below) |
| TypeScript, TSX, JavaScript, CSS, HTML, Svelte, PHP | also tailwindcss-language-server |
| TypeScript, TSX, JavaScript, Svelte | also ESLint |

A file can have several servers at once, such as vtsls and the Tailwind
server for a `.tsx` file. Their problems show together, their completions
are merged into one menu, hover shows each server's answer, and go to
definition lists the targets from all of them.

Each server runs in the folder of the project the file belongs to, so a
workspace with several repos gets one server per repo: the folder with the
nearest `Gemfile` (Ruby), `pyproject.toml`, `setup.py`, `setup.cfg`,
`requirements.txt` or `pyrightconfig.json` (Python), or
`compile_commands.json`, `CMakeLists.txt` or `.clangd` (C, C++); the
outermost `package.json`, `tsconfig.json` or `jsconfig.json` (TypeScript,
JavaScript, Tailwind), `Cargo.toml` (Rust), or `go.work` or `go.mod` (Go).
A file outside any of these uses the workspace folder.

Pomelo looks for the server on your login shell's `PATH` first. vtsls,
basedpyright, pyright and the Tailwind server are downloaded when they are
missing (with your `node` and `npm`) into
`~/Library/Application Support/Pomelo/languages`, and kept up to date there.
ESLint is built once from its source release there (also with `node` and
`npm`), and runs in the project's outermost `package.json` folder with the
project's own `eslint`. The others you install yourself (for example
`gem install solargraph`). When one is missing and can't be downloaded, a
notice names the command that installs it (`gem install solargraph`,
`gem install ruby-lsp`, `rustup component add rust-analyzer`,
`go install golang.org/x/tools/gopls@latest`, `uv tool install ty`), once
per launch; **Don't show again** stops it for that server. When
a project's `Gemfile` lists a server (such as `ruby-lsp`), the version locked
in its `Gemfile.lock` is the one that runs.

The **bolt** button in the status bar lists the servers of the open folder,
grouped under the folder each one runs in, each with a dot: green running, amber starting (or downloading), grey
stopped, red failed. A server's menu has **View Message** (when it has one),
**View Logs** (once it has started: a read-only tab with the server, its
folder and program, then its last 2000 lines of output and log messages,
growing as they come), **Restart Server**, **Stop Server**, and a line with
its version and memory;
hover that line for the program that runs it. **Restart All Servers** and
**Stop All Servers** are at the bottom. Next to the diagnostics counts, one
line says what the servers are doing: indexing progress, a download, an
update check, or a failure (click it to see the error).

Messages a server sends you show as a notification with the server's name,
an icon for how serious it is and a copy button; when the server asks a
question, each answer is a button, and closing the notification answers
none. When solargraph says the workspace is too large to index, the
notification offers **Use ruby-lsp**, which makes ruby-lsp the Ruby server
(it writes the `languages` setting below) and restarts it.

When none of a file's servers can go to a definition (or a declaration, a
type definition or an implementation), a short message says which server
and version can't, such as `ruby-lsp 0.4.1 does not support go to
definition`.

**Settings > Languages & Tools** turns servers on or off, for all languages
or one (**Languages**, then **Configure**). **Language Servers** is a list in
`settings.json`: a name puts that server first, `!name` turns it off, and
`...` stands for the rest of the language's servers:

```json
"languages": {
  "Python": { "language_servers": ["ty", "!basedpyright", "..."] },
  "Ruby": { "language_servers": ["ruby-lsp", "..."] }
}
```

### Project diagnostics

Click the error and warning counts in the status bar, or press
`cmd-shift-m`, to open the **Diagnostics** tab. Every file with errors is
listed by path, each problem as the lines of code around it with its message
underneath (and its source and code, such as `ts 2322`), plus a button that
copies the message. Click any line to open the file there. The tab's title
shows the counts, or **No problems**.

The toolbar's **warning** button shows or hides warnings; opening the tab
from the status bar when there are only warnings shows them. Refresh reloads
the list. It updates as the servers report, and shows what they reported:
some (vtsls, for one) report only on the files you have open.

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
- **Invalid settings.json** - a hand edit of `settings.json` does not parse;
  the settings stay as they were, and **Open settings.json** jumps to the
  line. It goes away once the file parses again.
- **Kotlin is available for this file** (or another language) - see
  [Language packages](#language-packages).
- **A language server's message** - see
  [Language servers](#language-servers).
- **A language server is missing** - the command that installs it, and
  **Don't show again**; see [Language servers](#language-servers).

Language server notices wait their turn: the next one shows when you close
the current notice.

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
| **Appearance** | Theme (built-in or [your own](./themes), static or following macOS light and dark; `cmd-k cmd-t` cycles); every font: the **Buffer Font** (the editor's family, size, weight, line height, [features and fallbacks](./themes#fonts)), the **UI Font**, the **Agent Panel Font** (the agent tabs' text size) and the **Terminal Font**; and the cursor: **Multi Cursor Modifier** (Alt-click adds a caret or drops the one there, Cmd-click goes to definition; Cmd Or Ctrl swaps them), **Cursor Blink**, **Cursor Animation** (the caret glides to where it moves, trailing on long jumps), **Cursor Shape** (bar, block, underline or hollow), **Hide Mouse** (the pointer hides while you type or use the keyboard, until the mouse moves) and **Reduce Motion** (holds loading shimmers, pulsing placeholders and the caret's glide still). |
| **Window & Layout** | Status bar and title bar items, including a toggle per status bar button (Files, Services, Git, Database, Terminal, Agent), plus dock sides and agent/terminal buttons. A button's right-click menu moves its panel to another side. Each window reopens where you left it (position, size, maximized or full screen). |
| **Editor** | Soft wrap, diff view, external editor. |
| **Languages & Tools** | Language servers on or off, which ones, and in what order (see [Language servers](#language-servers)); **Go To Definition Scroll Strategy**; completions on or off and how long to wait for them; the least severe diagnostic shown; inline diagnostics on for new editors, their padding and minimum column; **File Type Associations** (`settings.json`); and per language, under **Languages**, its own servers and completions. |
| **Terminal** | Shell, scrollback. |
| **Keymap** | Every window action and its binding; opens `keymap.json`. |
| **Agent** | Agent command; Claude Code MCP server and activity hooks, with **Reinstall**. |
| **Notifications** | Banners and a sound per agent event. |
| **Dev Services** | Turn the [dev-proxy and webhook relay](./network) on or off, set their ports, see their status and **Restart** them. **Open Requests** opens the Dev Requests tab. The [shared node_modules store](./workspace#shared-node-modules): on or off, the fallback where cloning is impossible, size limit, and **Open Store**. |
| **Integrations** | Jira (site, email, API token, test connection) and **Keep Main Fresh**. |
| **Project** | Repositories, config files and config bundles. See [Project config](./project-config). |

Settings are saved to `~/.config/pomelo/settings.json`. **Edit in
settings.json** opens it in a tab in the window. Edits you make to the file
yourself apply while the app runs, within a second of saving. Keys the app
does not know, such as ones a newer version added, are kept when it saves.
