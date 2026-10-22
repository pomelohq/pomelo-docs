# Install

Pomelo is a **native app for macOS and Linux**. On a Mac, download the DMG,
drag it to Applications, open it. On Linux, unpack a tarball and run its
`install.sh` (see [Linux](#linux)). No account, no runtime.

::: info Requirements
macOS 14 (Sonoma) or later, Apple Silicon - signed with an Apple Developer
ID and notarized, so it opens without Gatekeeper warnings.
Linux x86_64 or aarch64 with glibc (Ubuntu 24.04 or newer is tested), on
Wayland or X11; the `pom` CLI alone needs no desktop.
:::

## Download

1. Open the [latest release](https://github.com/pomelohq/pomelo/releases/latest).
2. Download **`Pomelo-<version>.dmg`**.
3. Open it and drag **Pomelo** into **Applications**.
4. Launch Pomelo (Applications or Spotlight).

## Linux

Each [release](https://github.com/pomelohq/pomelo/releases/latest) has two
tarballs per architecture (`x86_64`, `aarch64`):

- **`Pomelo-<version>-linux-<arch>.tar.gz`** - the app and the `pom` CLI.
- **`pom-<version>-linux-<arch>.tar.gz`** - the `pom` CLI alone, for a server
  without a desktop. It needs no display libraries.

```bash
tar xzf Pomelo-<version>-linux-x86_64.tar.gz
./pomelo-<version>/install.sh            # app + pom into ~/.local
./pomelo-<version>/install.sh --cli-only # only ~/.local/bin/pom
```

`install.sh` copies the files under `~/.local` (set `PREFIX` for another
place) and writes a desktop entry that points at the installed app, so
Pomelo shows in the app grid and the dock with its icon. Make sure
`~/.local/bin` is on your `PATH` to run `pom` in a terminal.

Shared services need **Docker Engine** with the **Compose plugin**, and your
user in the `docker` group:

```bash
sudo apt install docker.io docker-compose-v2 git
sudo usermod -aG docker $USER   # then log out and back in
pom doctor                      # checks git, Docker, Compose and the tools pom.yml uses
```

On Linux the keys use **Ctrl** where macOS uses **Cmd**, the window draws its
own title bar, and Pomelo does not update itself: install a newer tarball
over the old one.

On Linux `pom doctor` also warns about a machine that is about to hang. Each
check reads `/proc` and `/run` only; none runs a command inside a container:

- **Docker nested in an LXC container** (`systemd-detect-virt --container`,
  `container=lxc` in PID 1's environment, or `/run/systemd/container`).
  Docker inside LXC is known to hang `runc exec` (`docker exec`, exec
  healthchecks) when the host kernel misbehaves, which can freeze the host.
  Prefer a VM; if it must stay in LXC, give the container `nesting=1` and
  `keyctl=1` and keep its kernel current. Pomelo's own health checks run from
  the host and never `docker exec`.
- **High load** - the 1-minute load average above twice the CPU count.
- **Stuck processes** - processes in state `D` (uninterruptible sleep) at two
  scans 1 s apart that started more than 30 s ago, listed by pid and name.
  They wait on the kernel (a disk, network storage, a hung `runc`) and cannot
  be killed; `dmesg` usually says why.

### Workspace limits

The [`limits:`](./services#resource-limits) caps in `pom.yml` use cgroup v2
through your systemd user manager, which Ubuntu 24.04 runs for every login
and ssh session. `pom doctor` reports what keeps them from holding:

- **No systemd user session** (`$XDG_RUNTIME_DIR/systemd/private` is missing):
  workspaces run uncapped. Run pom from a login or ssh session. In a container
  or another tree delegated to you, set `POM_CGROUP_ROOT` to a cgroup v2
  directory you may write to; `POM_CGROUP=off` turns limits off.
- **Missing controllers** - your cgroup tree must offer `cpu` and `memory`
  (Ubuntu delegates both to user sessions by default).
- **Lingering off** - capped processes run under your user manager, which
  stops at your last logout. Keep them across logouts with:

```bash
loginctl enable-linger $USER
```

## First run

The first window is the welcome page:

- **New project** - name it, add your repos (local folders or git URLs), and
  pick who writes `pom.yml`: an agent CLI or you. Pomelo clones the repos,
  detects how they run and drafts the config.
- **Open a project folder** - pick a folder that already has a `pom.yml`.
- **Import a bundle** - start from a config bundle a teammate exported.

Full walkthrough: [Quick Start](./quickstart).

## Tools it drives

Pomelo shells out to a few standard dev tools. Install the ones your
projects use.

| Tool | Needed for | Install |
| :--- | :--- | :--- |
| **git** | Per-branch worktrees (always) | `xcode-select --install` |
| **docker** | Shared services (Postgres, Redis, MinIO, OpenSearch) | `brew install --cask docker` |
| **claude** | The agent, setting up a project, Fix with Claude, usage | `npm i -g @anthropic-ai/claude-code` |
| **codex**, **gemini** | Optional: setting up a project, second opinions | their own installers |

On macOS the `pom` CLI ships inside the app at
`/Applications/Pomelo.app/Contents/MacOS/pom`; add that folder to your
`PATH` if you want it in a terminal. On Linux `install.sh` puts it in
`~/.local/bin`. Its commands are listed in the
[pom CLI reference](/reference/cli).

## Existing config carries over

Already have a `pom.yml`? **Open Project** on its folder and Pomelo loads
it as-is. Keys the format no longer uses are ignored and flagged by the
[config doctor](./concepts#config-doctor); **Settings > Project >
Normalize** removes them (see [Project config](./project-config)).

## Updates

On macOS, Pomelo updates itself, in the background and on your schedule. With
**Settings > General > Check for Updates Automatically** on (the default),
the installed app looks for a newer release at launch and every hour, and
stays quiet unless it finds one.

A new version downloads while you work. The title bar shows **Downloading
0.7.4** with its progress (hover it for the percentage), then **Verifying**
while its signature is checked against the release key built into the app,
then **Restart to Update**. Nothing is installed until you choose:

- **Restart to Update** swaps in the new version and reopens Pomelo.
  Services and terminals keep running across the restart.
- **Quit** installs a downloaded update too, so the next launch is the new
  version.
- The **x** on the button hides it; **Restart to Update** stays in the app
  menu.

If a step fails the title bar says **Update failed**; hover it for the
reason, and **Try Again** in Settings retries. **Check for Updates** (the
app menu, or **Check Now** in **Settings > General**) checks right away and
says what it found: checking, up to date, or the download.

After an update, a notification offers the release notes; **Release
Notes** in the app menu shows them any time.

Installs of 0.6.x and older (the previous app) update to 0.7.0 through
their existing updater, with no manual download.

## Build from source

Requires Rust through `rustup` (the repo pins its toolchain and installs it
on first build), Xcode command line tools, `cmake` (`brew install cmake`; the
runtime for language packages builds with it), Docker and `zsh`.

```bash
git clone https://github.com/pomelohq/pomelo
cd pomelo
make run      # build and open PomeloDev.app (runs alongside an installed Pomelo.app)
make check    # fmt, clippy and tests: the gate CI runs
```

A dev build never updates itself.
