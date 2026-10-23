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
  knows, each with its `config` path. A project made on the host with the CLI (`pom init`, `pom onboard
  --new`, `pom project import`) is listed as soon as it exists, and one whose `pom.yml` you wrote by hand is
  listed the first time any `pom` command runs in it (`pom ws create`, `pom start`, ...).
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

- The host before the project name in the title bar, its server icon wearing a dot for the connection:
  green connected, yellow reconnecting, red disconnected. Click it to pick another project on that host.
- The host's workspaces in the WORKSPACES list, with how many services each runs. Pick one to look at it.
- The Files and Services panels in the left dock and the tabs in the middle, as for a local project: see
  [Files on a remote project](#files-on-a-remote-project) and
  [Services on a remote project](#services-on-a-remote-project). Agents are in the agent dock.
- While no tab is open, the middle says where the host stands. Under the project name, one line says how the
  connection is: connected (and when it last answered), connecting, reconnecting, or disconnected with SSH's
  reason and a **Reconnect** button; a banner says when the host's `pom` needs updating. A card gives the host
  and its address, the workspace and its folder there, what runs here (terminals, services and agents) and
  what stays on the host, with **Open in Editor**. What was read before stays on screen while the host is
  away. See [When the connection drops](#when-the-connection-drops).

### Live updates

When the host runs `pom server`, the window follows the shown workspace as it changes rather than asking
again and again. The server looks at the project every second, and at once when an agent reports, and sends
the workspace list, the services, the agents and the last turn you are reading only when one of them
changed. A change on the host shows within about a second; nothing crosses the connection while nothing
changes. The app still reads everything in full every 30 seconds, in case an update went missing.

A service's output that you read in its tab streams in as the service prints it. When the service restarts, the output goes on from the new run after a
`--- api/web restarted ---` line; a stopped service shows what it printed last, and its output comes in again
once it starts. Reading output never stops or slows the service: a reader that falls far behind skips ahead
to the last 1 MiB, as a terminal does.

All of it goes over one SSH session; the page says **Connected via pom server**. Updates stop while the
window is minimized, covered or on another Space, and start again with a full read when it shows.

A host whose `pom` has an older server without live updates is asked again every 2.5 seconds instead, and a
server without live output is asked for the service's recent output every 2.5 seconds while you read it. When
the host's `pom` has no server at all, every look is a short `pom ... --json` over the shared connection, the
page says **Connected over ssh** and why (for example "update pom on the VM to get terminals"). If the
host's `pom` is on another minor version than the app, the page says so too, with a button to update it: see
[Updating pom on the host](#updating-pom-on-the-host).

Git still needs the project's files on the laptop, so a remote project does not offer it yet: open the
worktree in an editor that works over SSH.

### Files on a remote project

When the host's `pom server` reads files, the window shows the shown workspace's files as it shows a local
project's: the file tree on the left (the Files panel) and the editor in the middle. Switch between the Files
and Services panels with their buttons at the left of the status bar. The files stay on the host; the app reads them through the same SSH session.

- **The tree** fills in as the host walks the workspace, and then follows it: a file an agent or a shell
  creates, changes or deletes on the host shows within about a second. Like on the laptop, `.git`,
  `node_modules`, `target`, `.pom` and `.ddata` folders are left out.
- **Gitignored folders** (build output such as `.next`, `dist` or `coverage`) are listed in the tree, but the
  host reads what is inside one only when you open it, one level at a time, so a large build folder does not
  slow the tree down. Once open, it follows changes like the rest of the tree. A host whose `pom` is older
  sends every folder's contents up front.
- **Opening a file** reads it from the host. Text opens with its highlighting and edits like a local file.
  Images open as on the laptop. A file larger than 64 MiB does not open: its tab says why and offers
  **Open in terminal**, which opens a terminal tab on the host paging through it with `less`.
- **Changes on the host.** When a file you have open changes on the host, for example because an agent
  edited it, its tab shows the new text. If you had edited it too, the tab's dot turns yellow: your text stays
  and nothing is overwritten until you save and choose (see below).
- **Go to File** (`cmd-p`) lists the workspace's files from the host, gitignored ones on request.
- **The main workspace** is read only, as on the laptop (its tabs wear a lock and the status bar says
  **Read only**); only its `pom.yml` can be edited there, and the host refuses a `pom.yml` that does not load.
  Work in a branch workspace instead.

Find in Files and language servers are not available on a remote project yet.

#### Saving

**Save** (`cmd-s`) sends the file to the host and does not hold up typing: the tab says **Saving...** until
the host answers, and stays unsaved meanwhile. What you type while a save is on its way stays unsaved after
it lands, so the next save sends it.

Each save carries what the file was when you opened it (or last saved it). If the file changed on the host
since, the host keeps its version and the app asks:

- **Overwrite** saves your text over the host's version as it is now.
- **Discard Edits** drops your edits and shows the host's version.
- **Cancel** keeps both: the tab stays unsaved with a yellow dot, and the next save asks again.

The file tree's **New File**, **New Folder**, **Rename**, **Paste** (cut and copy), **Duplicate**, **Trash**,
**Delete** and **Add to .gitignore** run on the host. The tree shows the change at once; if the host refuses
it, the tree goes back and a toast says why. Trash uses the host's trash folder (the freedesktop trash on
Linux).

#### Saving while the host is away

When the connection drops, the files you have open stay, and you can keep editing. A note over the file tree
says **Reconnecting to dev...**. A save made meanwhile waits: its tab says **Waiting for dev** and the status
bar **Will save when reconnected**. Once the connection is back the save goes out on its own, still checked
against the file you opened, so a file that changed on the host meanwhile asks first instead of being
overwritten. A save that lost its connection halfway is sent again and written once.

Unsaved edits to a host's files survive quitting the app: the tabs come back with your text, kept under the
host's name so they never mix with files on the laptop. If the file changed on the host meanwhile, the tab
comes back in conflict.

#### What the host allows

The server works only inside the workspace: a path with `..`, an absolute path, and a symlink that leads
out of the workspace are refused, and so is anything that is not a regular file or folder. Nothing under a
`.git` folder can be written. New folders on the way to a new file are made one at a time, each checked
again. The server log keeps the method and the size of each request, never a path or a file's contents.

A host whose `pom` reads files but predates saving them opens them read only. On a host whose `pom`
predates reading files the Files panel stays empty, and the middle says so with
**Update pom on dev** (see [Updating pom on the host](#updating-pom-on-the-host)).

### Services on a remote project

The Services panel is in the left dock and a service opens in a tab in the middle, as for a local project, with
the same controls; the server on the host answers them, reading the workspace there exactly as the app reads a
local one:

- **The panel.** The summary of what runs, with **Start all**, **Stop all** and **Restart failed**; what needs
  attention (a crash with its telling line, a port in use); the services by repo with their pips, ports,
  modes and uptimes; the shared services at the bottom with the repos that use them; the name filter and
  the All, Running, Failed and Stopped filters; the keyboard and the right-click menus.
- **Actions.** Start, stop, restart and **Use a New Port...** run on the host and the panel waits for them as
  it does locally. Stopping a shared service asks first while other workspaces' services run.
- **A service's tab.** Its facts card (status, PID, URL, port, env profile, env file, mode, command), the
  mode and env profile pickers, which apply from the next start and restart a running service, and its
  output, streamed as it prints (with a separator when it restarts). While it runs, typing goes to its
  console on the host, as locally. A shared service's tab shows its last 200 lines, read again every few
  seconds.
- **Open in Browser** goes through the host's dev proxy once it is forwarded here (see [Ports](#ports)).
  Before that, the URL shown is the host's, and opening it says it answers on the host only. A host whose
  dev proxy has a public address (`proxy.domain` in its settings) opens at that address directly.
- **Shared services' addresses.** A shared service forwarded here shows its port here, in the panel and in
  its tab's connection string.
- **Run Task.** A repo's commands (its `shortcuts`) run on the host, in the repo's worktree with the
  workspace's env, as a card in the WORKSPACES list with the command's output and how it exited.
- **Ports.** The arrow button at the top of the panel opens the [Ports](#ports) tab.
- **Changes on the host** (a service started by `pom` there, an agent restarting one) show within about a
  second, pushed by the server.

What differs from a local project:

- **Fix with Claude** and **Ask Claude About This Service** are left out: agents run on the host, so start
  one in the agent dock.
- The **Secrets** and **Environment** tabs are not in the panel; read a repo's env with `pom -H dev env ls api`
  instead.
- **Dev Requests** and the node_modules **Store** show this machine.
- A mode picked for a service lasts while the host's `pom server` runs, as one picked locally lasts while
  the app runs.
- A host whose `pom` predates this panel shows **Services need a newer pom on dev; update it there**, and a
  control its server does not offer yet is left out (see
  [Updating pom on the host](#updating-pom-on-the-host)).

### Creating, sleeping and waking workspaces

With `pom server` on the host, these run on the host from the app, each as a card in the WORKSPACES list
that shows its steps as they go:

- **New workspace.** The **+** of the WORKSPACES list opens the create form: a name, the branch and the repos
  to check out (all of main's by default). The create runs the same steps as `pom ws create` on the host,
  and the card lists them (worktrees, setup, seeding...) with the one running. Once it is ready the window
  switches to it.
- **Sleep Workspace** and **Wake Workspace** in a workspace's right-click menu stop or start its services and
  agents on the host, as `pom ws sleep` and `pom ws wake` there. A workspace whose agent is working stays
  awake, and its card says which agent.
- **Pull from Origin** in the same menu pulls every repo of the workspace from origin, as the Pull of a push
  notice does on the laptop.

**Cancel** on a running card stops the job before its next step; the step under way finishes first. A
cancelled or failed create stays as a card with **Retry**, which goes on from the step it stopped at, like a
create on the laptop; the workspace also shows as stopped part-way in `pom ws ls` on the host.

The jobs run on the host, not in the app: closing the app or losing the connection does not stop them. While
the app reconnects, the card waits; once the connection is back it picks up at the step it last showed (the
server keeps a job's steps for 10 minutes after it ends). If the app gives up reconnecting, the card fails
with the reason after half a minute, and `pom ws ls` on the host tells how the job ended.

Renaming or deleting a workspace, and the other items of a local workspace's menu, are done on the host for
now: `pom -H dev -c ... ws rename <branch> <name>` or `ws delete <branch>`. With a `pom` on the host that
predates jobs, the app says to update it, and `pom -H dev -c ... ws create <branch>` works as before.

## Terminals on a remote project

When the host runs `pom server` (the connection line says **via server**), the window of a remote project
has terminals, and they run on the host:

- **Terminal tabs.** A new tab starts your login shell on the host, in the shown workspace's worktree. Typing,
  resizing, splitting and the find bar work as on the laptop; each keystroke goes out on its own, at once.
- **Service output.** A running service's tab types into its console on the host, the same holder the
  service runs in there.
- **Agents.** The agent dock opens the workspace's agents on the host. See
  [Agents on a remote project](#agents-on-a-remote-project).

A connection holds more than 40 terminals at once: they share one channel for their exits.

What survives what:

- **Closing the app, a lost connection or a laptop asleep** leaves every shell, service and agent running on
  the host. A lost connection keeps the tab as it was and carries it on once the app reconnects (see
  [When the connection drops](#when-the-connection-drops)); reopening the tab, or the app, attaches again and
  replays the shell's recent output (the last 1 MiB).
- **Closing a terminal tab** ends its shell on the host. Closing a service's or an agent's tab only stops
  watching it.
- **The server stopping** (idle exit, `pom server stop`, an update) does not stop shells either: they run in
  their own holders, like services.

A program that prints faster than the laptop reads, such as a long build log, never makes the host wait: the
server keeps the last 1 MiB of output, and a tab that falls further behind skips ahead to it, clearing the
screen first.

PTY output and what you type pass through the server without being logged: its log has the method, the size
and the result of each request, never terminal bytes, input or environment.

## When the connection drops

The app notices a dropped connection at once when SSH or the network says so, and within 15 seconds when the
host just stops answering (a laptop lid closed, Wi-Fi gone). It then reconnects on its own, as the same app,
and nothing on the host stops meanwhile:

- **Reconnecting.** The page's connection line says "Lost connection. Reconnecting..." with the next attempt,
  and the host's dot in the title bar turns yellow. Terminals keep their screen as it was. Attempts come after 0.5, 1, 2, 4, 8 and 15 seconds (give or
  take a fifth), and at once when the window comes to the front or the laptop wakes from sleep. What you type
  while it reconnects is not sent later: the terminal refuses it, so nothing lands in a shell by surprise.
- **Back.** Each terminal carries on from the last byte it showed: no output is lost and none comes twice. A
  key you typed just as the connection dropped reaches the shell once. A service output you were reading
  goes on where it stopped (with a `--- api/web restarted ---` line if the service restarted meanwhile), the
  live updates send every value again, and a workspace job's card picks up at its last step. A terminal that
  was gone longer than its 1 MiB of recent output clears and shows the last 1 MiB.
- **Disconnected.** After the last attempt the line and the host's dot turn red, and the page offers
  **Reconnect**, which reconnects the page and every terminal. The screens stay as they were until then.

The server keeps what it needs to carry a client's terminals and streams on for 10 minutes after the client
went (`retained` in `pom server status --json`). A shell whose command ended while you were away shows as
exited when the app reconnects.

**The server restarted.** When the server the app reconnects to is a new one (it crashed, was stopped, or
was updated), the app says once "pom server on dev restarted; terminals and services kept running". Shells,
services and agents run in their own holders, so they are all still there and every tab carries on from its
last byte. Keys the old server may not have typed yet are dropped rather than sent again, so nothing is ever
typed twice.

## Agents on a remote project

The agent dock of a remote project shows the agents running on the host, and drives them the way it drives
agents on the laptop:

- **New agent.** The **+** of the dock starts an agent on the host, in the shown workspace, and opens it in
  the dock: the workspace's main agent when it does not run yet, else another one (`agent-2`, `agent-3`,
  ...). It runs the same command as `pom agent start` there. The first time an agent runs in a folder it asks
  whether to trust it; answer in its tab. The **+** shows only when the host's `pom` can start agents; with
  an older one, start them on the host with `pom -H dev -c ... agent start`.
- **Who drives.** The same lease rules apply as on the laptop. An agent you start from the app is yours. An
  agent an orchestrator or another agent drives (for example one a script started with `pom agent start`, or
  a session `pom agent send --take` took) shows "Watching - an orchestrator drives this session" over its
  tab. Your keys do not reach it while you watch.
- **Take over.** **Take over** on that strip makes the session yours: your keys reach it again, and whoever
  drove it gets it back with `pom agent release` on the host.
- **Approvals.** A tool call that waits for an approval shows over the tab with **Allow** and **Deny**,
  answered on the host as if you answered there.
- **Live state.** The agent's dot in the WORKSPACES list, its state in the agent dock and its last turn
  come with the live updates, so a turn that ends shows within a second.
- **Tabs come back.** The agent tabs you had open are kept per host, project and workspace. Opening the
  project again, or picking the workspace again, attaches them to their agents; an agent that stopped
  meanwhile gets no tab.

Closing an agent's tab leaves the agent running on the host, unless `agent_tab_close` is `"stop"` in your
settings: then it stops the agent there, as it does on the laptop.

## Ports

A remote project's services listen on the host, not on the laptop. The app opens them on the laptop for you,
on `127.0.0.1` only, through the SSH connection it already has to the host (an `ssh -L` forward). Nothing
opens a port on the host, and nothing listens on the laptop's network.

**Workspace addresses.** The dev proxy in the app (`*.localhost:8767`) stays the one address for every
project, local and remote. The app forwards the host's dev proxy to a private port on the laptop, and the
laptop's dev proxy sends each request for a remote project's workspace there, with its `Host` header as it
came. So `http://web.web.feat-login.localhost:8767` opens a remote workspace's service exactly as it would a
local one, and the remote project's own service URLs, cookies and `/_pom_dev/` paths work unchanged. The
host's dev proxy must be running there; `pom start` on the host starts it.

When a local project and a remote project both have a workspace with the same address (both have `main`, say),
the local one wins. Put the host's name after the workspace to reach the remote one:
`http://web.web.main.dev.localhost:8767` goes to `dev`, which gets `web.web.main.localhost:8767`.

**Shared services.** The shared services of the shown workspace (Postgres, Redis, MinIO and any other shared
service with a port) are forwarded as soon as they run, on the same port number when it is free on the laptop.
When it is taken (a local Postgres on 5432, say), the forward takes the next free port and says so: "port 5432
is in use on this machine, so it is on 5433". Connect from the laptop to `127.0.0.1:<port>` with the
credentials the host's env files give. When a forwarded shared service starts answering, the app says once
"postgres on dev is reachable here at 127.0.0.1:5432".

**The Ports tab.** **Ports** in the command palette opens the window's Ports tab: each forward with its port on
the host, its address here, what it is and its state, with **Open in browser**, **Copy** (the address) and
**Stop**. The field at the top forwards any other port of the host: `9229` takes the same number here when
free, `8080:18080` takes exactly `18080` and fails when that is in use. The line on the right says where the
workspace addresses go.

**Reconnects.** When the connection drops, forwards wait ("Reconnecting") and are opened again on the same
ports once the app is back on the host.

**Only while the app runs.** Forwards belong to the window: closing the window or quitting the app stops them.
There is no background process on the laptop.

From a terminal:

```sh
pom -H dev forward 5432          # 127.0.0.1:5432 here (or the next free port) until Ctrl-C
pom -H dev forward 8080:18080    # exactly 127.0.0.1:18080
pom host ports dev               # what the app and pom -H dev forward forward now
pom host ports dev --json
```

`pom -H <host> forward` uses the app's SSH connection to the host when one is open, else a connection of its
own, and stops the forward on Ctrl-C. `pom host ports <host> --json` prints `{"schema": "pom.ports/v1",
"host": ..., "records": [...]}`: one record per app window (its `project`) or `pom -H <host> forward`, each with
its `forwards` (`remote_port`, `local_port`, `wanted_port`, `label`, `kind` `gateway`, `shared` or `manual`,
`state` `forwarded`, `starting`, `lost` or `failed`, and `message`).

## pom server

`pom server` is a long-lived `pom` process on the host that answers the app. The app starts it on demand:
it runs `ssh <host> pom server proxy`, which connects to the server, or starts one first and waits up to 5
seconds for it. There is nothing to install or enable, and no network port: the server listens only on a Unix
socket in a folder only your user can open (`$XDG_RUNTIME_DIR/pom-server/`, else `/tmp/pom-server-<uid>/`),
refuses a connection from any other user, and is reached only through your SSH login.

```sh
pom server status          # pid, version, uptime, connections, open streams and running jobs; exit 3 when none runs
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
  never what a request or an answer carried: no service output, no job steps, no file paths or contents.
- **Settings.** Three keys under `server` in `~/.config/pomelo/settings.json` tune it, each read on the
  machine it names:

  | Key | Default | Where | What |
  | --- | --- | --- | --- |
  | `server.idle_exit_minutes` | `30` | the host | minutes without a client before the server exits; `0` never |
  | `server.reconnect_retention_minutes` | `10` | the host | minutes the server keeps a dropped client's terminals and streams for a reconnect |
  | `server.unconfirmed_input_kib` | `64` | your Mac | KiB of typed input the app keeps to send again after a drop; the server drops what it already typed |

  The server reads its two when it starts (`pom server stop` to apply a change); the app reads its key when
  a remote project opens.
- **Fallback.** A host whose `pom` predates `pom server`, or speaks another protocol version, is read with
  plain SSH as before, without terminals. A server from before terminals still serves the rest; updating
  `pom` on the host brings them.

### Starting it with systemd

The on-demand start is enough for most hosts. To have the server start with your user manager instead (on
Linux, with systemd), install its unit once on the host:

```sh
pom server install-unit     # writes ~/.config/systemd/user/pom-server.service and enables it
systemctl --user start pom-server
pom server uninstall-unit   # disables and removes it
```

The unit runs `pom server run --foreground` with the `PATH` you installed it from and restarts the server
if it fails (`Restart=on-failure`); a server that stops on purpose or after its idle time stays stopped until
the next connection starts one, so set `server.idle_exit_minutes` to `0` to keep it running. Nothing installs
the unit for you, and `--json` prints what it did. On macOS both commands say they are Linux only.

Without lingering, systemd stops your user manager and removes `$XDG_RUNTIME_DIR`, with the server's socket,
at your last logout: the server exits and forgets the terminals it kept for the app (they keep running). Keep
it across logouts with `loginctl enable-linger $USER`; `pom doctor` warns when lingering is off.

### Checking it with pom doctor

On a host that runs or ran `pom server`, `pom doctor` adds:

- whether the server of this `pom` version runs, with its pid, uptime, connections, open streams and what it
  keeps for apps that dropped (`retained`), and whether the systemd unit is installed;
- a warning when the socket folder is open to other users, and an error when it is not a folder or belongs to
  another user (the server cannot start);
- a warning, with the `kill` to stop it, for a server of an older `pom` version that still runs, and one for a
  newer server than the `pom` you ran;
- a warning when lingering is off while the server or its unit is in use (Linux only).

## Updating pom on the host

When the host's `pom server` is on another minor version than the app, the project's page says
"pom 0.8.2 on dev, the app is 0.9.3." with **Update pom on dev**. The button installs the app's own version
on the host:

1. It asks the host what machine it is (`uname -sm`; Linux on x86_64 or aarch64).
2. It downloads `pom-<version>-linux-<arch>.tar.gz` from the app's release on GitHub over HTTPS, on the
   laptop, and checks it against the release's `checksums-linux.txt`. A tarball that does not match is
   refused and nothing is installed.
3. It streams the tarball through SSH into a temporary folder on the host and runs its
   `install.sh --cli-only`, which puts `pom` in `~/.local/bin`. The host downloads nothing itself.
4. It stops the old version's server and reconnects, which starts the new one. Terminals, services and
   agents keep running throughout, and every tab carries on.

The page shows each step while it runs, and the reason if one fails (the host unreachable, a download that
timed out, a checksum that did not match). A development build of the app, which has no release to download,
and a host whose `pom` lives elsewhere (`--pom-path`) show the commands to run on the host instead:

```sh
curl -fLO https://github.com/pomelohq/pomelo/releases/download/v0.9.3/pom-0.9.3-linux-$(uname -m).tar.gz
tar -xzf pom-0.9.3-linux-*.tar.gz && pom server stop && pom-0.9.3/install.sh --cli-only
```

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
- A version warning: **Update pom on dev** on the project's page installs the app's version there, or update
  `pom` on the older side by hand; both should be on the same minor version.
- A remote workspace address answers with "backend not reachable": the host's dev proxy does not run there.
  `pom start` in a workspace on the host starts it with the services; `pom host ports dev` shows the forward
  to it.
- The page says it reads over SSH: update `pom` on the host (`pom host test dev` shows its version). On the
  host, `pom server status`, `pom doctor` and the server log say whether a server runs and what it served.
