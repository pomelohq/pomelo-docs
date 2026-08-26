# Agent status

Every workspace card (and the agent terminal header) shows a small status
orb for the AI agent running in that workspace. Its color tells you what the
agent is doing without opening the terminal.

## What the colors mean

<style>
.pom-orb { display:inline-block; width:11px; height:11px; border-radius:50%; position:relative; vertical-align:middle; }
.pom-orb.pom-active::after {
  content:""; position:absolute; inset:0; border-radius:50%; background:inherit;
  animation: pom-ping 1.1s ease-out infinite;
}
@keyframes pom-ping { from { transform:scale(1); opacity:.5 } to { transform:scale(2.6); opacity:0 } }
.pom-grey  { background:#8a8f98 }
.pom-green { background:#30d158 }
.pom-amber { background:#ff9f0a }
.pom-blue  { background:#64d2ff }
.pom-red   { background:#ff453a }
.pom-purple{ background:#bf5af2 }
.pom-cell  { text-align:center; }
</style>

| Orb | State | Meaning |
| :---: | --- | --- |
| <span class="pom-orb pom-grey"></span> | No agent | No agent is running in this workspace, or it is stopped. |
| <span class="pom-orb pom-green"></span> | Idle | The agent finished its turn and is ready — waiting for you. |
| <span class="pom-orb pom-amber pom-active"></span> | Thinking | The agent is reasoning about what to do next. |
| <span class="pom-orb pom-blue pom-active"></span> | Running a tool | The agent is executing a tool: an edit, a shell command, or an MCP call. |
| <span class="pom-orb pom-purple pom-active"></span> | Compacting | The agent is compacting its context to free up room. |
| <span class="pom-orb pom-red pom-active"></span> | Needs your input | The agent is blocked on you — a permission prompt or a question. |

The active states (amber, blue, purple, red) pulse with a ripple, just like in
the app; idle (green) and no-agent (grey) sit still.

## How it updates

The state comes from the agent's Claude Code hooks (session start, prompt,
tool use, stop, and notifications), which Pomelo maps to the states above.
The card polls this every few seconds, so the orb can lag a moment behind
what you see in the live terminal — that delay is expected.

## Get notified on a change

You don't have to watch the orb. Under **Settings > Notifications** each
transition can play a sound (and show a banner): **Started working**,
**Finished**, **Needs your input**, and **Compacting**. Pick a sound per
event — or several, played at random — so you can hear a run finish or ask
for input from a workspace you're not viewing. See
[Keyboard shortcuts](/docs/shortcuts) to jump to the agent with `Cmd-I`.
