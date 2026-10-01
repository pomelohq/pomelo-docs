# Architecture

Pomelo is **one Rust program**. The app and the `pom` CLI are built from the
same crates, so there is no daemon, no background server and no `localhost`
port between the UI and the engine. The core turns your `pom.yml` into
running, isolated **per-branch environments** and drives the tools already
on your machine.

## High level

<figure class="diagram">
<svg viewBox="0 0 760 440" role="img" aria-label="Pomelo.app holds two binaries built from the same Rust crates: the pomelo app (GPU UI over the feature and core crates) and the pom CLI. The app re-runs its own binary for PTY holders, the MCP server and agent hooks. Underneath are Docker, git and your local toolchains." xmlns="http://www.w3.org/2000/svg">
  <rect x="24" y="14" width="712" height="266" rx="14" fill="rgba(217,180,91,0.06)" stroke="#d9b45b"/>
  <text x="44" y="40" fill="#f0d896" font-size="14" font-weight="700">Pomelo.app</text>
  <text x="44" y="58" fill="#c9a94f" font-size="11">one Rust workspace, two binaries</text>

  <rect x="44" y="74" width="440" height="190" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="64" y="98" fill="#e6e6e6" font-size="13" font-weight="600">pomelo (the app)</text>

  <rect x="64" y="110" width="400" height="56" rx="8" fill="none" stroke="#33343a"/>
  <text x="80" y="132" fill="#e6e6e6" font-size="12">UI: ui (wgpu + winit), workspace, editor</text>
  <text x="80" y="152" fill="#8b8b93" font-size="11">files_ui, git_ui, services_ui, database_ui, terminal_ui, ...</text>

  <rect x="64" y="180" width="400" height="68" rx="8" fill="none" stroke="#33343a"/>
  <text x="80" y="202" fill="#e6e6e6" font-size="12">Core: pom_config, pom_core, pom_services</text>
  <text x="80" y="222" fill="#8b8b93" font-size="11">pom_workspace, pom_ptyhost, pom_proxy, pom_mcp</text>
  <text x="80" y="240" fill="#8b8b93" font-size="11">pom_agent, pom_detect, pom_doctor, auto_update</text>

  <rect x="504" y="74" width="212" height="84" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="610" y="100" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">pom (the CLI)</text>
  <text x="610" y="122" text-anchor="middle" fill="#8b8b93" font-size="11">same core crates</text>
  <text x="610" y="140" text-anchor="middle" fill="#8b8b93" font-size="11">same holders and state</text>

  <rect x="504" y="172" width="212" height="92" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="610" y="196" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">Re-runs of itself</text>
  <text x="610" y="218" text-anchor="middle" fill="#8b8b93" font-size="11">pty: service and shell holders</text>
  <text x="610" y="236" text-anchor="middle" fill="#8b8b93" font-size="11">mcp: tools for agents</text>
  <text x="610" y="254" text-anchor="middle" fill="#8b8b93" font-size="11">claude-hook: agent state</text>

  <line x1="380" y1="280" x2="380" y2="330" stroke="#7c7d87" stroke-width="1.5"/>

  <rect x="24" y="330" width="712" height="96" rx="14" fill="none" stroke="#2c2d33" stroke-dasharray="4 4"/>
  <text x="44" y="354" fill="#8b8b93" font-size="12" font-weight="600">On your machine</text>

  <rect x="40" y="366" width="216" height="44" rx="9" fill="#1b1c20" stroke="#33343a"/>
  <text x="148" y="392" text-anchor="middle" fill="#e6e6e6" font-size="12">Docker: Postgres, Redis, ...</text>

  <rect x="272" y="366" width="216" height="44" rx="9" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="392" text-anchor="middle" fill="#e6e6e6" font-size="12">git: worktrees</text>

  <rect x="504" y="366" width="216" height="44" rx="9" fill="#1b1c20" stroke="#33343a"/>
  <text x="612" y="392" text-anchor="middle" fill="#e6e6e6" font-size="12">your toolchains: node, ruby, ...</text>
</svg>
</figure>

## The pieces

- **The app** (`crates/pomelo`) is a thin composition root: it opens the
  windows and wires the feature crates together. It holds no feature logic.
- **UI toolkit** - `ui` draws everything on the GPU (wgpu + winit) from an
  element tree, with a bundled UI font so text renders the same on every
  Mac. `workspace` is the window layout: the WORKSPACES sidebar, docks,
  pane groups with tabs and splits, the status bar and the keymap. `editor`
  is the code editor core (rope buffer, tree-sitter highlighting,
  multi-cursor, undo).
- **Feature views** - one crate per screen: `files_ui` (the center editor,
  file finder, project search), `git_ui`, `pull_request_ui`, `services_ui`,
  `database_ui`, `terminal_ui`, `settings_ui`, `jira_ui`, `markdown` and
  more.
- **Core crates** hold the logic, with no rendering:
  - `pom_config` - reads `pom.yml`, resolves
    [templates](../reference/templates), validates, and makes checked edits
    (normalize, rename alias, remove repo).
  - `pom_core` - projects, new-project scaffolding, adding and removing
    repos.
  - `pom_services` - the service runner, env files, ports and the shared
    services: Docker containers, and commands run once for every workspace.
  - `pom_workspace` - the staged [workspace](./workspace) create and delete
    pipelines.
  - `pom_ptyhost` - Pomelo's own PTY holders.
  - `pom_proxy` - the [dev-proxy and webhook relay](./network).
  - `pom_mcp` - the [MCP server](./workspace#agent-tools-mcp) agents use.
  - `pom_agent` - launching agents, their hooks and
    [state](./agent-status).
  - `pom_detect` - stack detection that drafts a new project's `pom.yml`.
  - `pom_doctor` - the [config doctor](./concepts#config-doctor).
  - `auto_update` - verified self-updates.
- **The `pom` CLI** (`crates/pom_cli`) drives the same crates from a
  terminal. A service started with `pom start` shows up in the app, and the
  other way round. It ships inside the app bundle at
  `Pomelo.app/Contents/MacOS/pom`.

## Processes

The app re-runs its own binary for the helpers it needs, so nothing else has
to be installed:

- **`pty`** - every service, terminal and agent runs in a **PTY holder**: a
  detached process behind a Unix socket. Holders outlive the app, so
  services keep running and terminals reattach after a restart.
- **`mcp`** - the stdio MCP server a coding agent talks to. On launch the
  app registers it in `~/.claude.json`.
- **`claude-hook`** - Claude Code's hooks call it on each event to record the
  agent's state. The app installs the hooks in `~/.claude/settings.json`.

Only the dev-proxy (`127.0.0.1:8767`) and the webhook relay
(`127.0.0.1:8766`) listen on a port. Settings > Dev Services moves or turns
them off; `POM_WEB_PORT` overrides both: the relay takes that port + 1 and the
proxy + 2.

## Where things live

| Path | What |
| --- | --- |
| `~/pom/<name>/` | A project created in the app (`pom.yml`, `workspace--<branch>/` folders). `POM_SESSIONS_ROOT` moves it. |
| `~/.local/state/pom/` | Runtime state: ports, the session list, secrets, agent states. `XDG_STATE_HOME` moves it. |
| `~/.config/pomelo/settings.json` | App settings. |
| `~/.config/pomelo/keymap.json` | Your [key bindings](./shortcuts#your-own-bindings). |
| `~/.config/pomelo/themes/` | Your own [themes](./themes#your-own-themes). |
| `~/.config/pomelo/running-Pomelo.json` | Marks a running app so the next launch can tell a crash at startup; removed on a clean quit. The dev build keeps `running-PomeloDev.json`. |
| `~/.config/pomelo/quiet-language-servers.json` | Missing language servers you chose **Don't show again** for. |
| `~/.config/pomelo/dismissed-grammar-suggestions.json` | Language packages you chose **Don't show again** for. |
| `~/.config/pomelo/recent-languages.json` | Languages you opened lately, so their packages install again after an update. |
| `~/.config/pomelo/auto-installed-grammars.json` | Language packages already installed that way. |
| `~/Library/Application Support/Pomelo/languages/` | Language servers Pomelo downloaded or built. |
| `~/Library/Application Support/Pomelo/grammars/` | Installed [language packages](./app#language-packages), one folder per version. |
| `~/Library/Application Support/Pomelo/update/` | A downloaded app update waiting to install. |
| `~/Library/Logs/pomelo-panic.log` | What the app was doing when it crashed, to attach to a bug report. |

`POMELO_CONFIG_DIR` moves everything under `~/.config/pomelo/`. Every file Pomelo keeps is listed in the
[files reference](/reference/files).
