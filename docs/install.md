# Install

Pomelo is a **native macOS app**. Download the DMG, drag it to Applications,
open it. That's the whole install - no account, no separate CLI to install,
no runtime.

::: info Requirements
macOS 14 (Sonoma) or later - Apple Silicon - signed with an Apple
Developer ID and notarized, so it opens without Gatekeeper warnings.
:::

## Download

1. Open the [latest release](https://github.com/pomelohq/pomelo/releases/latest).
2. Download **`Pomelo-<version>.dmg`**.
3. Open it and drag **Pomelo** into **Applications**.
4. Launch Pomelo (Applications or Spotlight).

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

The `pom` CLI ships inside the app at
`/Applications/Pomelo.app/Contents/MacOS/pom`; add that folder to your
`PATH` if you want it in a terminal.

## Existing config carries over

Already have a `pom.yml`? **Open Project** on its folder and Pomelo loads
it as-is. Keys the format no longer uses are ignored and flagged by the
[config doctor](./concepts#config-doctor); **Settings > Project >
Normalize** removes them (see [Project config](./project-config)).

## Updates

Pomelo updates itself, in the background and on your schedule. With
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
