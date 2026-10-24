# Driving agents from scripts

`pom agent` lets a script, an orchestrator or another coding agent work with the agent sessions Pomelo
hosts. It can start a session, send it a turn, wait for the turn to end, read what the agent did, and
answer its approvals. The output is structured JSON, never scraped from the screen. You can still open any
of these sessions in the app, watch it, and take it over.

Everything happens inside **one workspace** (one ticket, one branch). A command names one workspace, and an
agent can only reach the other sessions of its own.

## A first round trip

```sh
# A reviewer next to the workspace's main agent, on a conversation of its own
pom agent start feat-login --fresh --role reviewer --tools Read,Grep,Glob

# One question, one answer
pom agent ask feat-login/reviewer "Review the diff on this branch" --json
```

`ask` sends the turn, waits for the agent's Stop, and prints that turn:

```json
{"schema": "pom.agent/v1", "handle": "feat-login/reviewer", "turn": 1,
 "wait": {"reached": "turn-end", "stop_reason": "end_turn", "state": "idle", "turn": 1},
 "result": {"turn": 1, "origin": "orchestrator", "depth": 0, "stop_reason": "end_turn",
            "prompt": "Review the diff on this branch",
            "items": [{"kind": "tool_call", "id": "toolu_1", "name": "Bash", "input": {"command": "git diff main"},
                       "result": "...", "is_error": false, "truncated": true},
                      {"kind": "text", "text": "Two things to fix: ..."}],
            "usage": {"input_tokens": 1200, "output_tokens": 340, "cache_read": 9000, "cache_write": 0}}}
```

## Sessions and handles

- **Handles.** A session is `<workspace>/<role>`, for example `feat-login/claude`, which is the workspace's
  main agent. Inside a workspace folder the role alone works.
- **Roles.** `claude` is the main agent and `fixer` a fixer. Side agents are `ask-1`, `review-1` and
  `fix-1`. A session started with `--fresh --role <name>` is `<name>`.
- **Other agent CLIs** (Codex, Gemini) are listed but cannot be driven yet.

## Commands

All of them take `--json`.

| Command | What it does |
|---|---|
| `pom agent ls [ws] [--all-workspaces]` | The workspace's sessions: role, state, reason, running, phase, turn, holder, age, and the permission prompt each waits on. A session whose agent is gone shows `died`. |
| `pom agent start [ws] [--role r] [--fresh] [options]` | Starts the main agent (or reuses it), or with `--fresh` a new role on a conversation of its own. You hold its lease. |
| `pom agent send <handle> <text \| --file f> [--queue] [--take \| --as-person] [--timeout d]` | Submits exactly one turn and prints its number once the agent has taken it. |
| `pom agent wait <handle> [--until turn-end\|idle\|awaiting_input] [--turn n] [--timeout d]` | Blocks until that happens (see [Waiting for a turn](#waiting-for-a-turn)). |
| `pom agent ask <handle> <text> [--take \| --as-person] [--timeout d]` | `send`, `wait` and `read` in one. |
| `pom agent read <handle> [--turn n \| --since n] [--full] [--live]` | What the agent did in a turn (the last by default); `--live` adds the reply it is still writing. |
| `pom agent watch [ws] [--role r] [--live] [--until turn-end] [--from-start] [--timeout d]` | Streams the workspace's events as NDJSON. |
| `pom agent interrupt <handle> [--as-person]` | Stops the current turn; it ends `cancelled`. |
| `pom agent allow\|deny <handle> [<id> \| --id id] [--reason r] [--as-person]` | Answers the permission prompt the session waits on. |
| `pom agent approve <handle> <request> [--always]` | Approves a pending approval of the workspace policy. |
| `pom agent takeover [ws] --session-id <id> [--settings f] [--mcp-config f]` | Hands a session to a person, reopening its conversation when it is not running. |
| `pom agent release <handle>` | Hands it back. |
| `pom agent stop <handle>` | Ends the session. |

- **`send` rules.** It is refused while the session is working (`thinking`, `tool_use`, `compacting`) or
  waits on an approval (`awaiting_input` with reason `pending_approval`). Only a person or an orchestrator
  may `--queue` (the turn is delivered once the session is idle, in order), `--take` (take the session over
  first) or `--as-person` (type as the person who drives it; see [the lease](#who-drives-a-session-the-lease)).
- **State right after `send`.** `send` returns once the agent has started the turn, and from then on
  `pom agent ls` and `watch` show it running (`running: true`, `phase` `working`) until the turn ends. If an
  idle event lands just after the prompt, `send` records a `Submitted` event so the session reads `thinking`
  with reason `submitted` until the agent's next hook. The turn's Stop still ends it as usual.
- **`--queue` timeout.** A queued send waits 30 minutes unless `--timeout` says otherwise. It then exits 2
  with error `timeout`, and the message names the state and reason it was still waiting on.
- **`start` options:**
  - `--prompt <text>` or `--prompt-file <file>`, and `--system-prompt-file <file>`, added to Pomelo's own;
  - `--tools <list>` (the tool set the session has at all), `--allowed-tools <list>` and
    `--disallowed-tools <list>`;
  - `--permission-mode <mode>` and `--model <name>`;
  - `--extra-mcp-config <file>`: more MCP servers, loaded next to Pomelo's own. It cannot replace them.

  A session `pom agent start` opens reads no project or local Claude settings and loads no other MCP
  servers. A repo's `.claude/settings.json` therefore cannot switch its hooks off or allow more.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Done (for `wait`: reached) |
| 1 | Error, for example an unknown session, or `stale`: an answer names a permission prompt that no longer waits |
| 2 | `wait` timed out |
| 3 | The agent asks for a permission |
| 4 | The session died |
| 5 | The prompt was typed but never started a turn |
| 6 | Refused by a guard rail (see below) |
| 7 | `start`: the agent waits at its "trust this folder" prompt (see below) |

With `--json`, an error is `{"schema": "pom.agent/v1", "error": "<code>", "message": "..."}` on stderr.

## A folder the agent has not trusted yet

The first time Claude Code opens a folder it asks whether you trust it, and nothing runs until someone answers.
A new workspace is a new folder, so a session you start without a tab can stop there:

- `pom agent start` notices within seconds, exits with code 7 and says how to go on;
- `pom agent ls` and `watch` show the session as `needs_trust`, with its session id.

Answer it in one of two ways:

- open the session in Pomelo (or `pom agent takeover`) and pick **Yes, I trust this folder**;
- start it with `--trust`, which answers yes for you. Only a person or an orchestrator can pass it, never an agent.

Pomelo never edits Claude's own config to skip the question.

## Turns, state and death

- **Turns.** A turn starts when the agent takes a prompt and ends at its Stop hook. Every turn records who
  sent it: `human` (also a turn sent with `--as-person`), `orchestrator` or `agent`.
- **States.** `state` is always one of these:

  | State | Means | `phase` | `running` |
  |---|---|---|---|
  | `starting` | Pomelo launched it; the agent has not reported yet. Nothing can be sent. | `waiting` | false |
  | `needs_trust` | It waits at the "trust this folder" prompt. | `waiting` | false |
  | `idle` | It takes a turn now. | `idle` | false |
  | `thinking` | It works on a turn. | `working` | true |
  | `tool_use` | It runs a tool in a turn. | `working` | true |
  | `compacting` | It compacts its conversation. | `working` | true |
  | `awaiting_input` | A permission or a question waits on an answer (reason `pending_approval`). | `waiting` | true |
  | `died` | It was working when its agent went away. | `gone` | false |
  | `ended` | The agent exited after its session ended. | `gone` | false |
  | `unknown` | A live session that never reported (started by an older version). | `waiting` | false |

  `running` is true while a turn is in progress, including a permission waiting inside it. `phase` is what a
  client does next: `working` (wait), `waiting` (someone has to act, or it is still starting), `idle` (send)
  or `gone`. Both are in `pom agent ls --json` and on every `watch` line; no field was renamed or removed.
- **Reason.** `pom agent ls --json` gives each session a `reason` next to its state:

  | Reason | Means |
  |---|---|
  | `pending_approval` | A permission or a question waits on an answer. A send is refused. |
  | `idle_notification` | The agent's "waiting for your input" reminder. The session is idle. |
  | `stop` | The last turn ended. |
  | `interrupted` | The last turn was interrupted. |
  | `stale` | A working state that no event has refreshed for 15 minutes. |
  | `submitted` | `send` saw the turn start before the agent reported working on it. The session is `thinking`. |
  | `null` | Nothing more to say (the agent is working, or has just started). |

  Sessions recorded by an older version have no stored reason; Pomelo works it out from the last event.
- **Death.** A session counts as dead only after several checks in a row find no agent. `wait` then reports
  `cause`:
  - `killed`: it was stopped;
  - `user_exited`: someone quit it;
  - `auth_failed`: a login problem;
  - `crashed`: anything else.

  A session with no events for a long time only shows `stale`. Pomelo never kills it for that.

## Waiting for a turn

`pom agent wait --until turn-end` (the default) never returns the end of an older turn:

- **`--turn n`** waits for exactly turn `n`. A turn that already ended returns at once; a later one waits for
  it to start and end.
- **Without `--turn`** it waits for the turn that is running now. If none runs, it waits for the turn your
  last `send` started, as long as it is still the latest turn and the session was not reopened since (a
  launch, resume or clear; a compact does not count). Otherwise it waits for the next turn to start and end.

So a session that is idle, or was just reopened, makes `wait` block until a new turn ends (or the timeout).
The surest pattern is to pass the number `send` printed: `pom agent wait <handle> --turn 4`. The result names
it as `for_turn`:

```json
{"schema": "pom.agent/v1", "handle": "feat-login/reviewer", "reached": "turn-end", "state": "idle",
 "turn": 4, "for_turn": 4, "stop_reason": "end_turn"}
```

`turn` is the session's latest turn; `stop_reason` is `end_turn` or `cancelled`.

## watch

One JSON line per event:

```json
{"schema":"pom.agent/v1","t_ms":1759400000000,"workspace":"feat-login","role":"reviewer","session_id":"...","event":"PreToolUse","state":"tool_use","turn":2,"tool":"Read"}
```

Every session line carries `state`, `reason`, `running` and `phase` as in `ls`. Besides the agents' own
events (`UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `Stop`, ...),
`watch` also shows:
- `permission_request` (a policy's ask), `permission_decision` (a prompt was answered) and
  `permission_released` (pom stopped holding a prompt and the agent drew its dialog);
- `lease`: who drives a session, from and to;
- `message`: one session sent another a turn, with its depth.

Options:
- `--role r` keeps one session's lines;
- `--live` adds `live_text` lines while a reply is written (see below);
- `--until turn-end` (with `--role`) ends with a `watch_end` line once that session's turn ends, picked as
  `wait` picks it: `{"event":"watch_end","role":"reviewer","reached":"turn-end","for_turn":4}` (`reached`
  is `died` if the agent went away).

An orchestrator watching several tickets runs one `watch` per workspace.

## The reply being written

The transcript only gets a block once it is complete, so `read` shows nothing of a reply still streaming.
Claude Code runs a display hook on each batch of finished lines as a reply streams to its screen; Pomelo
records those batches per turn.

- `pom agent read <handle> --live --json` adds `state`, `reason`, `running`, `phase` and `live`:

  ```json
  {"live": {"turn": 4, "source": "display_hook", "text": "Here is the plan:\n1. read the code",
            "messages": [{"message_id": "...", "text": "Here is the plan:\n1. read the code", "final": false}]}}
  ```

- `pom agent watch [ws] --role r --live` streams each batch as it comes:

  ```json
  {"schema":"pom.agent/v1","event":"live_text","workspace":"feat-login","role":"reviewer","session_id":"...","t_ms":1759400000000,"turn":4,"message_id":"...","index":0,"final":false,"delta":"Here is the plan:\n"}
  ```

  A client joining mid-reply first gets the batches of the current turn so far.

Limits:
- It comes in whole lines, never token by token; the last batch of a message may end mid-line, and
  `final: true` marks it.
- It is the text the agent shows, not tool calls or results; those are in `read` once done.
- A message that is `final` is also in the transcript (in `read`) shortly after; show `live` only for what
  `read` does not have yet.
- It needs a Claude Code version with the `MessageDisplay` hook. Older versions show no live text.
- Only the current and the previous turn are kept.

## Permission prompts

When the agent itself asks to run a tool (its own permission dialog, not a [policy](#a-policy-for-tool-calls)
ask), `pom agent ls --json` shows it on the session:

```json
{"handle": "feat-login/reviewer", "state": "awaiting_input", "reason": "pending_approval", "running": true,
 "pending_permission": {"id": "3f2a9c1b7d40", "kind": "agent", "tool_name": "Bash",
   "tool_input": {"command": "make test", "description": "Run the tests"}, "summary": "make test",
   "since_ms": 1759400000000, "answer_by": "hook"}}
```

- `id` belongs to this one prompt: the same call asked again gets a new id, so an answer cannot reach a
  later prompt. `watch` shows the prompt as a `PermissionRequest` line with the same fields in `detail`
  (`request`, `tool`, `input`, `answer_by`).
- `kind` is `agent`, or `policy` for a policy's ask (then `answer_by` is `policy`).

Answer it with `pom agent allow <handle> [--id id]` or `pom agent deny <handle> [--id id] [--reason r]`.
Without `--id` it answers whatever waits now; with it, an id that no longer waits is refused with error
`stale` (exit 1). How the answer gets to the agent depends on `answer_by`:

| `answer_by` | When | How |
|---|---|---|
| `hook` | An orchestrator or an agent holds the lease: nobody is at the terminal. | Pomelo holds the prompt in the agent's permission hook and hands it the answer. A deny `--reason` is told to the agent, which carries on. The holder of the lease answers. |
| `terminal` | A person drives, or the hook stopped holding the prompt. | The agent's dialog is on screen and Pomelo types the answer into it. A client of that person passes `--as-person`. |
| `policy` | The workspace policy answered ask. | As `approve` (once) or a policy deny. |

- **Held prompts.** Pomelo holds a prompt for up to 30 minutes. If a person takes the session over (in the
  app or with `takeover`) it lets go at once, and the dialog shows in the terminal as usual.
- **Typing into the dialog.** Pomelo checks the screen first. It presses Enter only while the plain
  **1. Yes** is highlighted, never a "don't ask again" choice; if someone moved the highlight, answer in the
  terminal. A deny is the dialog's own Esc, which also stops the turn: the session goes `idle` with reason
  `interrupted`, and `--reason` is not passed on. Pomelo then checks the dialog closed.
- **At the terminal** nothing changes: a person answers the dialog with the keyboard, and the prompt clears
  once the tool runs or the turn moves on.
- **`approve`** keeps its meaning (a policy ask, with `--always` for a person). `deny <handle> <request>`
  still denies a policy ask.



## Who drives a session: the lease

Every session has one driver.
- **A person** at the app, by default.
- **An orchestrator** that started or took the session.
- **The agent** that started it.

Only the driver sends turns. Everyone else attached to the session watches. The app shows
**Watching - an orchestrator drives this session** with **Take over**, and drops the keys you type there
until you take over. `pom agent takeover` and `pom agent release` do the same from a script.

Three ways to type into a session from a script, and what each does to the lease:

| | Use it when | The lease afterwards |
|---|---|---|
| `send --take` | An orchestrator takes the session over to drive it itself. | The orchestrator's. A person's session goes to it; its turns are `orchestrator` turns. |
| `send --as-person` | A client of the person who drives it (their web or phone client) sends what that person typed. | Unchanged: still the person's. The turn is a `human` turn. |
| `takeover` / `release` | A person takes an orchestrator's session over, and later hands it back. | `takeover`: the person's, remembering who drove before. `release`: back to that driver, or to an orchestrator when nobody drove before. |

- A plain `send` into a person's session is refused (`lease`). An orchestrator has to say which it means:
  `--take` to drive, or `--as-person` to act for the person.
- `--as-person` is a statement the caller makes on the person's behalf; Pomelo cannot tell the person's own
  client from any other script on the machine, so use it only to relay what the person typed. An agent can
  never use it, and it is refused while an orchestrator or an agent holds the lease (take the session over
  first). It works for `send`, `ask`, `interrupt`, `allow` and `deny`.
- `--take` and `--as-person` do not go together.

## Guard rails

The same rules apply to `pom agent` and to the agent MCP tools.

| | An agent in a session | A person or an orchestrator |
|---|---|---|
| Reach | Only the sessions of its own workspace | One workspace per command |
| Sends | Once per 5 s, 20 per hour | No limit |
| Chains | At most 2 agents deep (the depth resets when the sent turn ends) | Not counted |
| `wait` | At most 10 minutes per call | As long as asked |
| A busy session | Refused | Refused, or `--queue` |
| Approvals | Once or deny | Once, always or deny |
| A person's session | Cannot send to it | Only with `--take` or `--as-person` |

- **Never itself.** A session never drives itself.
- **Identity.** An agent is recognized by the process it runs in, not by what its environment says.
- **Codes.** A refusal names its reason: `other_workspace`, `self`, `depth`, `rate`, `rate_hour`, `busy`,
  `queue`, `wait_cap`, `approve_always`, `lease`, `not_drivable`. A `busy` refusal also carries the
  session's `state` and `reason`.

## A policy for tool calls

A project can name a command that Pomelo asks before every tool call an agent makes in one of its
workspaces:

```yaml
agents:
  policy: ./scripts/agent-policy.sh
  policy_timeout_sec: 5
```

- **Input.** It reads `{tool_name, tool_input, session_id, role, workspace, origin, driven_by}` on stdin.
- **Output.** It prints `{"decision": "allow" | "deny" | "ask", "reason": "..."}`.
- **`ask`.** In a session a person drives, `ask` shows the agent's own permission prompt. In a session an
  orchestrator drives, nobody is at the prompt: the call is denied with `pending approval <id>`, and a
  `permission_request` appears on `watch` and in the app. `pom agent approve <handle> <id>`, or Allow in the
  app, lets the retried call through once.
- **Fails closed.** The policy denies the call when:
  - it fails or exits non-zero;
  - it takes longer than the timeout;
  - it prints something that is not JSON;
  - it cannot run, or the project's config cannot be read.

  A hook that merely errored would let the tool run.
- **Only you change it.** The MCP `config_set` tool refuses any edit that adds, changes or removes the
  `agents` section, and refuses to overwrite a `pom.yml` it cannot read; the agent is told to ask you to
  edit it. An agent with a shell can still edit `pom.yml` or the policy script directly, so a policy
  should deny those edits too.

## For agents: the MCP tools

The agent in a session gets the same operations as tools of Pomelo's MCP server. They are `agent_list`,
`agent_start`, `agent_send`, `agent_wait`, `agent_read`, `agent_ask` and `agent_approve`.

They take a role, never a workspace: the workspace is the agent's own, and the guard rails above apply. A
coder can ask a reviewer it started, and a fixer can report back to the agent that drives it.

`agent_list` returns the same fields as `pom agent ls --json`, including `running`, `phase` and
`pending_permission`. `agent_approve` answers the prompt a session waits on: give `request` (its id) or
leave it out for the one waiting now, and `deny: true` with an optional `reason`. An agent answers a
session's own prompt only when it drives that session.

**An agent only denies.** An agent can deny another agent's prompt, but an allow (`pom agent approve`,
`pom agent allow`, `agent_approve` without `deny`) from inside an agent is refused with
`allow_needs_person`: a person or an orchestrator outside the agents allows it. A project whose agents
should approve each other turns that on in `pom.yml`; an agent's `config_set` cannot change it:

```yaml
agents:
  peer_approve: true
```
