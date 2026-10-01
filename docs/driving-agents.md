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
| `pom agent ls [ws] [--all-workspaces]` | The workspace's sessions: role, state, turn, holder, age. A session whose agent is gone shows `died`. |
| `pom agent start [ws] [--role r] [--fresh] [options]` | Starts the main agent (or reuses it), or with `--fresh` a new role on a conversation of its own. You hold its lease. |
| `pom agent send <handle> <text \| --file f> [--queue] [--take]` | Submits exactly one turn and prints its number. |
| `pom agent wait <handle> [--until turn-end\|idle\|awaiting_input] [--turn n] [--timeout d]` | Blocks until that happens. |
| `pom agent ask <handle> <text> [--take] [--timeout d]` | `send`, `wait` and `read` in one. |
| `pom agent read <handle> [--turn n \| --since n] [--full]` | What the agent did in a turn (the last by default). |
| `pom agent watch [ws] [--from-start] [--timeout d]` | Streams the workspace's events as NDJSON. |
| `pom agent interrupt <handle>` | Stops the current turn; it ends `cancelled`. |
| `pom agent approve\|deny <handle> <request> [--always]` | Answers a pending approval. |
| `pom agent takeover [ws] --session-id <id> [--settings f] [--mcp-config f]` | Hands a session to a person, reopening its conversation when it is not running. |
| `pom agent release <handle>` | Hands it back. |
| `pom agent stop <handle>` | Ends the session. |

- **`send` rules.** It is refused unless the session is idle. Only a person or an orchestrator may
  `--queue` (the turn is delivered once the session is idle, in order) or `--take` (take the session over
  first).
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
| 1 | Error, for example an unknown session |
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
  sent it: `human`, `orchestrator` or `agent`.
- **States.** `idle`, `thinking`, `tool_use`, `compacting` and `awaiting_input` (a permission is needed).
- **Death.** A session counts as dead only after several checks in a row find no agent. `wait` then reports
  `cause`:
  - `killed`: it was stopped;
  - `user_exited`: someone quit it;
  - `auth_failed`: a login problem;
  - `crashed`: anything else.

  A session with no events for a long time only shows `stale`. Pomelo never kills it for that.

## watch

One JSON line per event:

```json
{"schema":"pom.agent/v1","t_ms":1759400000000,"workspace":"feat-login","role":"reviewer","session_id":"...","event":"PreToolUse","state":"tool_use","turn":2,"tool":"Read"}
```

Besides the agents' own events (`UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `Stop`, ...),
`watch` also shows:
- `permission_request` and `permission_decision`;
- `lease`: who drives a session, from and to;
- `message`: one session sent another a turn, with its depth.

An orchestrator watching several tickets runs one `watch` per workspace.

## Who drives a session: the lease

Every session has one driver.
- **A person** at the app, by default.
- **An orchestrator** that started or took the session.
- **The agent** that started it.

Only the driver sends turns. Everyone else attached to the session watches. The app shows
**Watching - an orchestrator drives this session** with **Take over**, and drops the keys you type there
until you take over. `pom agent takeover` and `pom agent release` do the same from a script.

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
| A person's session | Cannot send to it | Only with `--take` |

- **Never itself.** A session never drives itself.
- **Identity.** An agent is recognized by the process it runs in, not by what its environment says.
- **Codes.** A refusal names its reason: `other_workspace`, `self`, `depth`, `rate`, `rate_hour`, `busy`,
  `queue`, `wait_cap`, `approve_always`, `lease`, `not_drivable`.

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

## For agents: the MCP tools

The agent in a session gets the same operations as tools of Pomelo's MCP server. They are `agent_list`,
`agent_start`, `agent_send`, `agent_wait`, `agent_read`, `agent_ask` and `agent_approve`.

They take a role, never a workspace: the workspace is the agent's own, and the guard rails above apply. A
coder can ask a reviewer it started, and a fixer can report back to the agent that drives it.
