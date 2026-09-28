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

Pomelo updates itself. With **Settings > General > Check for Updates
Automatically** on (the default), the installed app looks for a newer
release on launch, downloads it, checks its signature against the release
key built into the app, and only then swaps itself and relaunches. **Check
for Updates** on the same page checks right away.

Installs of 0.6.x and older (the previous app) update to 0.7.0 through
their existing updater, with no manual download.

## Build from source

Requires Rust through `rustup` (the repo pins its toolchain and installs it
on first build), Xcode command line tools, Docker and `zsh`.

```bash
git clone https://github.com/pomelohq/pomelo
cd pomelo
make run      # build and open PomeloDev.app (runs alongside an installed Pomelo.app)
make check    # fmt, clippy and tests: the gate CI runs
```

A dev build never updates itself.
