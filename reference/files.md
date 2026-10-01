# Files and folders

Every file and folder Pomelo reads or writes, and the environment variables
that move them. Paths use `myproject` for a project and `feat-login` for a
workspace branch.

## Environment variables

| Variable | Moves | Default |
| --- | --- | --- |
| `POMELO_CONFIG_DIR` | [App config](#app-config) | `~/.config/pomelo` |
| `XDG_STATE_HOME` | [Runtime state](#runtime-state), to `$XDG_STATE_HOME/pom` | `~/.local/state/pom` |
| `POM_SESSIONS_ROOT` | Where the app creates new projects | `~/pom` |
| `POM_PTY_SOCK_DIR` | The sockets of the processes that hold services and terminals | `$XDG_RUNTIME_DIR/pom-pty`, else `/tmp/pom-pty-<uid>` |

## Project folder

A project created in the app lives in `~/pom/myproject/`; one you opened
lives where it already was.

| Path | What |
| --- | --- |
| `pom.yml` | The project's [config](./config). |
| `pom.yml.bak` | The config as it was before **Import Config** replaced it, or before an old split config was merged into it. |
| `pom.d.bak/` | An old split config (`pom.d/`), kept after it was merged into `pom.yml` the first time the project opened. |
| `pom-import-source.yml` | An imported config waiting for the agent to merge it into `pom.yml`. |
| `docker-compose.shared.yml` | The [shared services](./config#shared-services) that run in Docker, written from the config. |
| `workspace--main/` | The main workspace: one checkout per repo. |
| `workspace--feat-login/` | The workspace for `feat-login`: one git worktree per repo. |
| `workspace--feat-login/.pom-workspace.json` | That workspace's choices: its display name, the environment profile each repo or service runs with, and repos on a branch other than the workspace's. |
| `workspace--feat-login/<repo>/.env.local` | The repo's env, written from its `env` (or one file per name under `env`, see [`env`](../docs/project-config#write-the-env)). |

## App config

In `~/.config/pomelo/` (`POMELO_CONFIG_DIR` moves it).

| Path | What |
| --- | --- |
| `settings.json` | App [settings](./settings). |
| `keymap.json` | Your [key bindings](./shortcuts). |
| `themes/` | Your own [themes](/docs/themes#your-own-themes). |
| `snippets/` | Your own editor snippets. |
| `unsaved/` | Edits not saved to their file yet, kept for the next launch. |
| `workspaces/` | Each project's open panes and tabs, one file per project folder. |
| `running-Pomelo.json` | Marks a running app so the next launch can tell a crash at startup; removed on a clean quit. The dev build keeps `running-PomeloDev.json`. |
| `quiet-language-servers.json` | Missing language servers you chose **Don't show again** for. |
| `dismissed-grammar-suggestions.json` | Language packages you chose **Don't show again** for. |
| `recent-languages.json` | Languages you opened lately, so their packages install again after an update. |
| `auto-installed-grammars.json` | Language packages already installed that way. |

## Runtime state

In `~/.local/state/pom/` (`XDG_STATE_HOME` moves it). Files named for a
project use its `session` name from `pom.yml`.

| Path | What |
| --- | --- |
| `sessions.json` | The projects Pomelo knows and which one is current. |
| `registry.json` | Each project's folder. |
| `last_project` | The project opened last. |
| `active_workspaces.json` | The workspace last active in each project. |
| `workspace_order.json` | The order you dragged each project's workspaces into. |
| `window-bounds.json` | Where each window was, and its size. |
| `ports.d/` | One file per leased port: who holds it. |
| `shared_slots.json` | Each workspace's slot in a shared service that serves several from one container, such as its Redis database number. |
| `secrets/myproject.bin` | The project's secrets, encrypted. |
| `integrations/myproject.json` | The project's Jira connection and **Keep Main Fresh** schedule. |
| `cache/` | Jira tickets and pull requests, so lists show at once. |
| `agents/state-feat-login.json` | What the workspace's Claude is doing, written by its hooks. |
| `agents/rate_limits.json` | Claude's usage limits, for the Agent Usage tab. |
| `pipeline-feat-login.json` | A workspace create or delete that stopped at a stage, waiting to be resumed (`--from-stage`). |
| `active/` | Workspace creates and deletes in progress. |
| `nm-store/` | The [shared node_modules store](/docs/workspace#shared-node-modules). |
| `db-consoles/myproject.json` | The project's saved database consoles. |
| `db-values/` | Database values opened in a tab. |
| `mcp-out/` | MCP tool results too long to return whole (see [MCP tools](./mcp)). |
| `pom-mcp` | The script Claude Code runs to start the [MCP server](./mcp). |
| `claude-hook` | The script Claude Code's hooks run to report the agent's state. |
| `proxy.log` | Output of a dev proxy started by `pom start`. |

## Elsewhere

| Path | What |
| --- | --- |
| `~/Library/Application Support/Pomelo/languages/` | [Language servers](./language-servers) Pomelo downloaded or built. |
| `~/Library/Application Support/Pomelo/grammars/` | Installed [language packages](./languages), one folder per version. |
| `~/Library/Application Support/Pomelo/update/` | A downloaded app update waiting to install. |
| `~/Library/Caches/Pomelo/just-updated` | Marks the first launch after an update, for the **Updated to Pomelo** notice. |
| `~/Library/Logs/pomelo-panic.log` | What the app was doing when it crashed, to attach to a bug report. |
| `~/.claude.json` | Claude Code's config: Pomelo adds its MCP server here. |
| `~/.claude/settings.json` | Claude Code's settings: Pomelo adds its hooks here and reads your status line. |
