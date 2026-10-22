# Remote machine

Pomelo can run a project on another machine, such as a Linux VM you reach over SSH, while your laptop
stays a thin client. Everything of the project (worktrees, services, databases, agents) lives on that
machine; nothing is synced back and forth. From the laptop you drive it with `pom -H <host>` in a terminal
or a script, and watch and control it in the app.

What you need:

- `pom` installed on the machine (for Linux, see [Install](/docs/install)). Pomelo looks for it in
  `~/.local/bin/pom`, then on the `PATH` of a non-interactive shell there.
- SSH access from the laptop with your own keys and `~/.ssh/config`. Pomelo runs the system `ssh`; it never
  creates, copies or installs keys. The app does not prompt for a passphrase, so load the key into your
  SSH agent (or use a key without one).
- The same minor version of `pom` on both ends (`pom host test` tells you).

## Hosts

Name the machine once. The name is what every other command and the app use.

```sh
pom host add dev ssh://dev@dev.example.net
pom host add lab ssh://me@100.64.0.10:2222 --pom-path /opt/pom/bin/pom
pom host ls
pom host test dev
pom host rm lab
```

| Command | What it does |
| --- | --- |
| `pom host add <name> ssh://user@host[:port] [--pom-path p] [--transport server\|ssh]` | Adds the host, or replaces one of that name. Without a user, your SSH config picks it. `--pom-path` is where `pom` lives there (`~/` works). `--transport` picks how the app reads it (see [pom server](#pom-server)). |
| `pom host ls` | The hosts. |
| `pom host rm <name>` | Forgets one. Nothing changes on the machine. |
| `pom host test <name>` | Connects, runs `pom --version` there and compares it with this one. A different major or minor version prints a warning. |

Every `host` command takes `--json`. `host test --json` reports `reachable`, `remote_version`,
`local_version` and `version_mismatch`.

The hosts live in `~/.config/pomelo/hosts.json`:

```json
{
  "schema": "pom.hosts/v1",
  "hosts": {
    "dev": { "url": "ssh://dev@dev.example.net" },
    "lab": { "url": "ssh://me@100.64.0.10:2222", "pom_path": "/opt/pom/bin/pom", "transport": "ssh" }
  }
}
```

`transport` is optional: without it the app reads the host through `pom server` and falls back to plain SSH
when the host cannot serve; `"ssh"` always uses plain SSH.

## Running a command there: `pom -H`

`pom -H <host>` (or `--host <host>`, or `--host=<host>`) runs the rest of the line as `pom ...` on that
host. The flag can go anywhere on the line, like `-c`.

```sh
pom -H dev project ls
pom -H dev -c pom/myproject/pom.yml ws ls --json
pom -H dev -c pom/myproject/pom.yml -w feat-login start web --wait
pom -H dev -c pom/myproject/pom.yml -w feat-login logs api/web
pom -H dev -c pom/myproject/pom.yml agent ls feat-login --json
```

- **Which project.** On the host, `pom` starts in your home folder, so name the project's `pom.yml` with
  `-c`: relative to that home folder (`pom/myproject/pom.yml`) or in full. Do not use `~` there: your own
  shell would turn it into the laptop's home. `pom -H dev project ls --json` lists the projects the host
  knows, each with its `config` path.
- **Output and exit code pass through.** stdout and stdin are the remote command's, stderr is relayed, and
  the exit code is the one `pom` returned there. With `--json`, the JSON is exactly what the host printed,
  so a script or an orchestrator can call `pom -H dev ... --json` as it calls `pom ... --json` locally.
- **Arguments are kept as they are.** Each argument is quoted on its own before it crosses SSH, so spaces,
  quotes, `$`, backticks and newlines arrive unchanged.
- **Terminal.** When both stdin and stdout are a terminal, the remote command gets one too (so
  `pom -H dev attach api/web` works). Otherwise it runs without a terminal and SSH never stops to ask for a
  password (`BatchMode`).
- **One connection.** The first command opens a shared SSH connection that stays up for 10 minutes after the
  last one, so the next commands start without a new handshake. Its socket is in
  `$XDG_RUNTIME_DIR/pom-ssh/`, else `~/.ssh/pom/`.
- **When SSH fails.** If SSH cannot connect (host down, key refused, name not resolved), `pom -H` exits
  with **69** and prints SSH's reason. With `--json` (or `-o json`) it also prints an error object on
  stdout, so a script can tell "the host did not answer" from "the command failed":

  ```json
  {"schema":"pom.hosts/v1","error":{"code":"unreachable","host":"dev","message":"could not reach host dev over ssh (ssh: connect to host dev.example.net port 22: Connection refused); check it with: pom host test dev"}}
  ```

  An unknown host name exits 1 with `"code": "unknown_host"`.

## Moving work to the host

A workspace started on the laptop moves to the host with its unpushed commits, uncommitted files and database
data; the project itself (its `pom.yml`, secrets and repos) moves the same way:

```sh
pom project export --to dev          # once: the project, its secrets, its repos cloned there
pom ws export feat-login --to dev    # the workspace, as it is now
```

`--to` streams the archive through the same SSH connection `pom -H` uses into `pom ... import -` on the host,
so no archive file is written on either side. The secrets travel sealed with a one-time passphrase sent ahead
of the archive; `secret.key` and gitignored files stay on the laptop. The import on the host leases its own
ports, writes env files from `pom.yml` and runs setup; with `--json` the report includes the host's own
report under `remote`. If SSH cannot connect, the export exits with **69** like `pom -H`.

What travels, what does not, and how to move one through a file instead are in
[Move a workspace](/docs/workspace#move-a-workspace).

## In the app

**Connect to a host** is on the welcome page and in the project menu (**Connect to host...**). It lists
the hosts of `hosts.json`, then the projects the chosen host knows (`pom project ls` there). Pick one and it
opens in the window. It stays in the recent projects, marked with its host, so the next time it opens from
there.

The window of a remote project shows:

- The host's workspaces in the WORKSPACES list, with how many services each runs. Pick one to look at it.
- A line with the connection: connected (and when it last answered), connecting, or disconnected with
  SSH's reason and a **Reconnect** button. What was read before stays on screen while the host is away.
- The workspace's services by repo, with **Start**, **Stop**, **Restart** and their recent output, the
  shared services, and the workspace's agents with their state; click an agent to read its last turn (or, with
  terminals, to open it).

The app asks the host again every 2.5 seconds while the window is visible, and stops asking while it is
minimized, covered or on another Space. Each look is a request to `pom server` on the host, all over one SSH
session; the connection line ends in **via server**. When the host's `pom` has no server, every look is a
short `pom ... --json` over the shared connection instead, the line says **via ssh**, and the page says why
(for example "update pom on the VM to get terminals"). If the host's `pom` is on another minor version than
the app, the page says so too. There is no live stream yet.

The editor, the file tree and Git need the project's files on the laptop, so a remote project does not
offer them: open the worktree in an editor that works over SSH. Creating, renaming or deleting a workspace is
done on the host for now: `pom -H dev -c ... ws create <branch>`.

## Terminals on a remote project

When the host runs `pom server` (the connection line says **via server**), the window of a remote project
has terminals, and they run on the host:

- **Terminal tabs.** A new tab starts your login shell on the host, in the shown workspace's worktree. Typing,
  resizing, splitting and the find bar work as on the laptop; each keystroke goes out on its own, at once.
- **Service output.** The terminal button of a running service opens its live output in a terminal tab, the
  same holder the service runs in on the host.
- **Agents.** Clicking an agent in the Services panel opens its session in the agent dock. The dock shows the
  agents running on the host; it does not start new ones there.

What survives what:

- **Closing the app, a lost connection or a laptop asleep** leaves every shell, service and agent running on
  the host. A lost connection ends the tab's stream with a note; reopening the tab, or the app, attaches
  again and replays the shell's recent output (the last 1 MiB). Reconnecting a tab on its own comes later.
- **Closing a terminal tab** ends its shell on the host. Closing a service's or an agent's tab only stops
  watching it.
- **The server stopping** (idle exit, `pom server stop`, an update) does not stop shells either: they run in
  their own holders, like services.

A program that prints faster than the laptop reads, such as a long build log, never makes the host wait: the
server keeps the last 1 MiB of output, and a tab that falls further behind skips ahead to it, clearing the
screen first.

PTY output and what you type pass through the server without being logged: its log has the method, the size
and the result of each request, never terminal bytes, input or environment.

## pom server

`pom server` is a long-lived `pom` process on the host that answers the app. The app starts it on demand:
it runs `ssh <host> pom server proxy`, which connects to the server, or starts one first and waits up to 5
seconds for it. There is nothing to install or enable, and no network port: the server listens only on a Unix
socket in a folder only your user can open (`$XDG_RUNTIME_DIR/pom-server/`, else `/tmp/pom-server-<uid>/`),
refuses a connection from any other user, and is reached only through your SSH login.

```sh
pom server status          # pid, version, uptime and connections; exit 3 when none runs
pom server status --json   # the same as pom.server/v1
pom server stop
pom server run             # start one in the background yourself
```

- **One per version.** Each `pom` version runs its own server (`<version>.sock`), so after an update the old
  one goes away on its own while the new one starts on the next connection.
- **Idle exit.** With no client connected for 30 minutes the server exits; the next connection starts it
  again. `server.idle_exit_minutes` in `~/.config/pomelo/settings.json` on the host changes the 30, and `0`
  keeps it running. It also exits when its socket file is deleted.
- **Services survive it.** Services and agents run in their own holders, so stopping the server, or its
  exit, stops none of them.
- **Log.** `$XDG_STATE_HOME/pom/server/<version>.log` (else `~/.local/state/pom/server/`), rotated at 5 MiB
  with one `.log.1` kept. It records connections and each request's method, size, duration and result,
  never what a request or an answer carried.
- **Fallback.** A host whose `pom` predates `pom server`, or speaks another protocol version, is read with
  plain SSH as before, without terminals. A server from before terminals still serves the rest; updating
  `pom` on the host brings them.

## Open in Editor

**Open in Editor** on a remote project's page, in a workspace's right-click menu, and **Open in External
Editor** open that workspace's worktree on the host in an editor on the laptop that works over SSH.

The `remote_editor` setting in `~/.config/pomelo/settings.json` picks the command:

- Empty (the default): `zed ssh://<host>/<path>` if `zed` is installed, else
  `code --remote ssh-remote+<host> <path>`.
- A template: each word is one argument, with `{host}` (`user@host[:port]` from `hosts.json`), `{path}`
  (the worktree on the host) and `{url}` (`ssh://{host}/{path}`) filled in. For example:

  ```json
  { "remote_editor": "cursor --remote ssh-remote+{host} {path}" }
  ```

Editors that read the host from your SSH config may not accept a port in `{host}`. For a host on another
port, add a `Host` entry with its `Port` to `~/.ssh/config` and use that alias in `hosts.json`
(`ssh://dev-vm`).

## Troubleshooting

- `pom host test dev` first: it says whether SSH connects and which `pom` version answers.
- `Permission denied (publickey)`: the app and scripts never prompt, so add the key to your SSH agent
  (`ssh-add`) or check `~/.ssh/config`.
- `pom is not installed on dev`: install it in `~/.local/bin`, or set `--pom-path` with `pom host add`.
- A version warning: update `pom` on the older side; both should be on the same minor version.
- The page says it reads over SSH: update `pom` on the host (`pom host test dev` shows its version). On the
  host, `pom server status` and the server log say whether a server runs and what it served.
