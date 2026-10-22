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
| `pom host add <name> ssh://user@host[:port] [--pom-path p]` | Adds the host, or replaces one of that name. Without a user, your SSH config picks it. `--pom-path` is where `pom` lives there (`~/` works). |
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
    "lab": { "url": "ssh://me@100.64.0.10:2222", "pom_path": "/opt/pom/bin/pom" }
  }
}
```

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
  shared services, and the workspace's agents with their state; click an agent to read its last turn.

The app asks the host again every 2.5 seconds while the window is visible, and stops asking while it is
minimized, covered or on another Space. Each look is a short `pom ... --json` over the shared connection;
there is no live stream yet.

The editor, the file tree, Git, terminals and the agent dock need the project's files on the laptop, so a
remote project does not offer them. They come with the Pomelo server, which will run on the host. Until
then, open the worktree in an editor that works over SSH. Creating, renaming or deleting a workspace is done
on the host for now: `pom -H dev -c ... ws create <branch>`.

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
