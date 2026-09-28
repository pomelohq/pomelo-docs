# Agent status

Every workspace row in the WORKSPACES sidebar shows what the coding agent
running in that workspace is doing: a colored dot next to the name and a
state label under it. When the sidebar is folded into its rail, the ring
around the workspace's badge takes the same color. You can tell which agent
needs you without opening its terminal.

## What the states mean

<style>
.pom-dot { display:inline-block; width:10px; height:10px; border-radius:50%; vertical-align:middle; }
.pom-green  { background:#a1c181 }
.pom-yellow { background:#dec184 }
.pom-blue   { background:#74ade8 }
.pom-red    { background:#d07277 }
</style>

| Dot | Label | Meaning |
| :---: | --- | --- |
| (none) | (none) | No agent is running in this workspace. |
| <span class="pom-dot pom-green"></span> | Idle | The agent finished its turn, or just started, and waits for you. |
| <span class="pom-dot pom-yellow"></span> | Thinking | You sent a prompt and the agent is working on it. |
| <span class="pom-dot pom-blue"></span> | Using tools | The agent is running a tool: an edit, a shell command or an MCP call. |
| <span class="pom-dot pom-blue"></span> | Compacting | The agent is compacting its context to free up room. |
| <span class="pom-dot pom-red"></span> | Awaiting input | The agent is blocked on you: a permission prompt or a question. |

The colors come from the active theme (success, warning, info, accent and
error); the swatches above are the default One Dark theme, where Using
tools and Compacting share the same blue.

## How it updates

On launch Pomelo installs a hook for Claude Code in
`~/.claude/settings.json` (see **Settings > Agent > Activity Hooks**). Claude
calls it on session start, prompt submit, tool use, compaction, stop,
session end and notifications. The hook works out the workspace from the
folder the session runs in (`workspace--<branch>`) and writes the state to
`~/.local/state/pom/agents/state-<branch>.json`.

The app watches that folder, and re-reads it at least every 5 seconds.
The dot follows the workspace's main agent (and the onboarder while a
project sets up); [side agents](./agents#side-agents) never change it. A
state shows only while that agent is still running in its holder, so an agent that exits without saying so drops its dot. A working
state that has not changed for 15 minutes reads as idle. Only a real
permission or question prompt counts as Awaiting input; Claude's idle
reminder does not.

## Get notified on a change

You don't have to watch the dots. **Settings > Notifications** has:

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
