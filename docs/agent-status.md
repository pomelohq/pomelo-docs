# Agent status

Every workspace row in the WORKSPACES sidebar says what the coding agent
running in that workspace is doing, in the one line under its name: **Agent
working** while it works, and a yellow **Waiting for you** pill when it is
blocked on you. While it works, a thin bar also moves along the bottom of the
workspace's tile. When the sidebar is folded into its rail, the tile itself
turns yellow while its agent waits, and hovering a tile names the workspace,
its ticket and the agent's state. You can tell which agent needs you without
opening its terminal.

<AppShot :width="280" :height="330" text="From the top: main with no agent running, an agent working, an agent waiting for you, and an idle workspace"><WorkspacesList :creating="[]" :rows='[{"id":"main","title":"main","branch":"main","running":2},{"id":"101","title":"Login page","branch":"feat-login","key":"PROJ-101","group":"In progress","agent":"thinking","running":2,"current":true},{"id":"104","title":"Checkout flow","key":"PROJ-104","group":"In progress","agent":"waiting","running":3},{"id":"97","title":"Invoice export","key":"PROJ-97","group":"In review","agent":"idle"}]' /></AppShot>

## What the states mean

| State | The row shows | Meaning |
| --- | --- | --- |
| (none) | nothing | No agent is running in this workspace. |
| Idle | nothing | The agent finished its turn, or just started, and waits for your next prompt. |
| Thinking | **Agent working** | You sent a prompt and the agent is working on it. |
| Using tools | **Agent working** | The agent is running a tool: an edit, a shell command or an MCP call. |
| Compacting | **Agent working** | The agent is compacting its context to free up room. |
| Awaiting input | **Waiting for you** | The agent is blocked on you: a permission prompt or a question. |

The row keeps to one line, so it shows what matters most: a pull request in
trouble (**CI failed**, **Conflict**, **Changes requested**) comes before
**Agent working**, and a waiting agent comes before everything. The title bar
shows a **needs you** pill for a workspace whose agent waits; click it, or
press <Keys k="cmd-alt-a"/>, to go to the next one.

## How it updates

On launch Pomelo installs a hook for Claude Code in
`~/.claude/settings.json` (see **Settings > Agent > Activity Hooks**). Claude
calls it on session start, prompt submit, tool use, compaction, stop,
session end and notifications. The hook works out the workspace from the
folder the session runs in (`workspace--<branch>`) and writes the state to
`~/.local/state/pom/agents/state-<branch>.json`.

The app watches that folder, and re-reads it at least every 5 seconds.
The state follows the workspace's main agent (and the onboarder while a
project sets up); [side agents](./agents#side-agents) never change it. A
state shows only while that agent is still running in its holder, so an agent that exits without saying so drops its state. A working
state that has not changed for 15 minutes reads as idle. Only a real
permission or question prompt counts as Awaiting input; Claude's idle
reminder does not.

## Get notified on a change

You don't have to watch the sidebar. **Settings > Notifications** has:

- **Notify on Claude Activity** - the master switch for banners and sounds
  (on by default; macOS asks for notification permission).
- **Alert While Viewing** - also alert for the workspace on screen in the
  focused window (off by default).
- **Test Notification** - posts a sample banner.
- **Alert Sounds** - a macOS sound per event: **Started Working**,
  **Finished** (Glass by default), **Needs Your Input** (Ping by default)
  and **Compacting**. Picking a sound plays it; None turns it off.

Finished, needs input and compacting post a banner as well as their sound;
started working only plays its sound, if one is set. Click a banner to jump
to that workspace.
