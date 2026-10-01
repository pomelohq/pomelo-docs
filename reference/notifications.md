# Notifications

Everything Pomelo tells you without being asked, what makes it appear and
the buttons it has. There are three kinds:

- **macOS notifications** about a workspace's agent, in Notification Center.
- **Notices**: a card at the bottom right of the window, above the status
  bar, for something that needs a look. One shows at a time; language server notices wait their
  turn and the next one shows when you close the current one.
- **Toasts**: a short line centered above the status bar after an action. A toast
  closes itself after 10 seconds (it stays while the pointer is on it) and
  has a close button; some have an action button.

## macOS notifications

Posted when a workspace's Claude changes state. The text under the title is
`<project> - <branch>`; clicking the notification switches to that
workspace. **Settings > Notifications** turns them on or off
(`notify_claude`), picks a sound per event, and says whether the workspace
on screen in the focused window also alerts (`notify_when_focused`).

| Title | When | Banner |
| --- | --- | --- |
| Claude is working | Claude starts working after being idle | No, only its sound (none by default) |
| Claude finished | Claude stops working | Yes |
| Claude needs your input | Claude waits for an answer or a permission | Yes |
| Claude is compacting | Claude compacts its context | Yes |

**Test Notification** in **Settings > Notifications** posts a sample banner,
"Test notification - delivery is working.", to check that macOS lets
Pomelo's banners through.

## Notices

| Title | When | Buttons |
| --- | --- | --- |
| Invalid pom.yml | The project's config does not load or does not validate. Goes away once it does. | **Open pom.yml** (at the problem's line) |
| Project setup needs attention | The [config doctor](/docs/concepts#config-doctor) found problems. | **Fix with Claude**, or **Open pom.yml** when Claude Code is not installed |
| N services still run the old config | `pom.yml` changed while services were running with the previous version. | **Restart** |
| Invalid settings.json | A hand edit of `settings.json` does not parse; the settings stay as they were. Goes away once it parses. | **Open settings.json** (at the line) |
| Updated to Pomelo X | The first launch after an update. | **Release Notes** |
| Pomelo quit unexpectedly last time | The last launch crashed while starting, so the tabs were not reopened. After two such crashes in a row, language servers and language packages also stay off until Pomelo starts normally. | **Reopen Tabs** |
| A fixed version is ready | After such a crash, a newer release was downloaded. | **Restart to Update** |
| Kotlin is available for this file | A file of a [package language](./languages) is open and its package is not installed. | **Install Kotlin** (the language's name), **Don't show again** |
| Could not install Kotlin | A language package failed to download or verify; the message says why. | - |
| The server's name, such as `rust-analyzer` | A [language server](./language-servers) is missing and cannot be downloaded; the message names the command that installs it. Once per launch. | **Don't show again** |
| The server's name | A language server sent a message, or asks a question. | One button per answer; closing answers none |
| solargraph | solargraph says the workspace is too large to index. | **Use ruby-lsp** (makes ruby-lsp the Ruby server and restarts it) |

Notices from language servers also have a copy button for their message,
and an icon for how serious they are.

## Toasts

| Area | Toast | When |
| --- | --- | --- |
| Project | `pom.yml reloaded` | The config changed on disk and loaded. |
| Project | `Open a project to export its config` / `Open a project to import a config into it` | **Export Config** or **Import Config** with no project open. |
| Project | `Import failed: <error>` | A config file or bundle could not be imported. |
| Project | `Install Claude Code to set up with AI` | **Set Up Project with AI** without the `claude` CLI. |
| Project | `Install Docker Desktop or OrbStack to run shared services` | The welcome page's Docker fix found neither app to open. |
| New project | `A project is being created in another window` | **New Project** while another window is creating one. |
| New project | `No new git repos in what was chosen` | The folders picked for a new project hold no repo it lacks. |
| New project | `Stopped. Nothing was created.` / `Stopped. The session folder was removed.` | Stopping a new project's setup. |
| New project | `<agent> stopped. Finishing from the drafted pom.yml` | The setup agent quit before it was done. |
| New project | `Starting main's services...` | The new project is ready and main starts. |
| Repos | `Cloning the missing repos into main...` / `Main has every repo of the config` | **Clone Missing Repos into Main**. |
| Repos | `Another repository is still being added` | **Add Repository** while one is being added. |
| Repos | `Could not add the repository: <error>` | **Add Repository** failed. |
| Workspaces | `<branch> is still being created` | Opening a new project's workspace before it is ready. |
| Workspaces | `<branch> is no longer a workspace` | Opening an agent from Agent Usage whose workspace was deleted. |
| Workspaces | `<branch> names no Jira ticket` | **Open Jira Ticket** on a branch without a ticket key. |
| Workspaces | `Another branch checkout is still running` | Switching a repo's branch while another switch runs. |
| Workspaces | `Could not rename: <error>` / `Failed to switch workspace: <error>` | Renaming or switching failed. |
| Agents | `The main agent is not open; start it first` | Sending to the main agent while it is not running. |
| Agents | `Start the agent first to add the selection to it` | **Add Selection to Agent** in a terminal with no main agent running. |
| Agents | `The agent is not open; open it with Show agent CLI` | Sending output to a setup agent whose tab is closed. |
| Agents | `Sent to <agent> with the output` | Output sent to an agent. |
| Agents | `That was a one-off agent (onboarding or a fix); it cannot be reopened` | Reopening such an agent from Agent Usage. |
| Agents | `A second opinion needs codex or gemini on PATH` | Asking for a second opinion without either CLI. |
| Editor | `No external editor found; pick one in Settings > Editor` | **Open in External Editor** with none installed. |
| Editor | `Failed to open <path or link>: <error>` | A file, link or editor did not open. |
| Services | `Could not start the command` | A command from the config failed to start. |
| Services | `Env files: <error>` | The env files could not be written before running a command. |
| Git | `git <action> failed` | A pull, push or sync failed. **View Log** opens git's output. |
| Git | `Synced <branch> with <remote>` and similar, one line per repo | A pull, push or sync finished. |
| Git | `Every repo matches origin` | Pull or sync with nothing to do. |
| Git | `No changes to show` | Opening the changes of a clean repo. |
| Git | `That commit is already pushed, so it stays` | **Uncommit** on a commit that is already pushed. |
| Git | `Uncommitted "<subject>" in <repo>: its changes are staged again` | **Uncommit** finished. |
| Git | `Only GitHub remotes can start a pull request here` | **Create Pull Request** for a remote that is not on GitHub. |
| Git | `Could not discard <path>: <error>` | Discarding a file's changes failed. |

Other toasts carry an error message as it came, such as a failed git
command in one repo or a database action that did not work.
