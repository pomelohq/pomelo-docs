# Project config

A project's config is its `pom.yml`, plus an optional `pom.d/` folder of
fragments merged into it (see [the reference](../reference/config)). This
page covers changing it from the app: editing, adding and removing repos,
and handing a config to a teammate. Most of it lives in **Settings >
Project** and the command palette.

## Edit the config

Open it any of these ways:

- **Open Project Config** in the command palette - pick `pom.yml` or one of
  its `pom.d` fragments.
- **Edit pom.yml** in the project menu (click the project name in the top
  bar).
- **Settings > Project > Config Files > Edit...**
- `pom config edit` in a terminal opens it in `$EDITOR`, then checks it
  still loads.

The config stays editable from **main**, even though main's other files are
read-only.

### Checked saves

Every save of `pom.yml` or a fragment is checked against the whole merged
config before it is written. A save that does not parse, or that would
leave a working config unable to load, is refused and nothing is written:
the editor says `Not saved: <the problem>`. When the config was already
broken elsewhere, a save goes through, so you can fix it one file at a
time.

### After a change

The app picks up a saved config at once ("pom.yml reloaded"), whether it
was saved in Pomelo or in another editor. It then:

- rewrites the env files of **every** workspace from the new config, and
- lists the running services whose command or env no longer matches what
  they were started with, in a notice (**N services still run the old
  config**) with a **Restart** button.

Nothing restarts on its own.

## Repositories

**Settings > Project > Repositories** lists each repo of the config with its
service count and where it is checked out: `not cloned into main`, `in
main`, or `in N of M workspaces besides main`.

### Add a repository

**Add Repository** (Settings > Project > **Add...**, or the command palette)
takes a **Git URL or folder** and an optional **Alias**. Pomelo clones it
into main, detects its services, and writes its entry where the config keeps
repos: a new `pom.d/repos` fragment when the config is split, else
`pom.yml`. Under **Also check it out in**, tick the workspaces that should
get it too. Then choose:

- **Let Claude wire its env and shared services** - Claude opens in a
  terminal to finish the new entry (env, shared services, setup) and runs
  the config doctor until it reports no errors.
- **Review its entry in the config afterwards** - the entry opens in the
  editor for you.

### Rename or remove

- **Rename Alias...** gives the repo a new alias and rewrites every
  reference to it across the config files (`{{api.server.url}}` and the
  like).
- **Remove...** takes the repo out of the config. It is refused while
  other repos still refer to it. Its worktree is removed from workspaces
  where it has no changes and kept where it does; main's clone stays on
  disk.

### Workspaces choose their repos

A new workspace checks out only the repos picked when it was created. To
add more of the config's repos to one later, right-click it in the sidebar
and choose **Add Repos...**.

Main is expected to have every repo. When the config names a repo main has
no clone of (a teammate added it, or the config came from a bundle), main's
row shows `not cloned: <repo>`. **Clone Missing Repos into Main** (command
palette), **Settings > Project > Clone Missing Repos** or the row's **Clone
Missing Repos...** asks where to clone each one from, with a URL guessed
from main's other repos.

## Tidy the config

- **Split into pom.d** moves `repos` (one file per repo), `environments`,
  `presets` and `shared_services` out of `pom.yml` into `pom.d/`. The old
  file is kept as `pom.yml.bak`.
- **Normalize** drops keys the format no longer uses, rewrites old colon
  tokens (`{{conn:x}}`) to dot notation, then splits.

## Config bundles

Share a project's setup with a teammate from **Settings > Project > Config
Bundle** (or **Export Config** / **Import Config** in the palette):

- **Export...** saves the merged config as plain YAML, or, with **Include
  secrets**, as a `.pombundle` with the project's secrets sealed under a
  password (AES-256-GCM). Share the password separately.
- **Import...** reads a `pom.yml` or `.pombundle`. Choose **Replace my
  pom.yml** (the old one is kept as `pom.yml.bak` and the new one split into
  `pom.d`) and, for a bundle, **Store these secrets in this project**. Or
  pick **Adapt with Claude** to have Claude merge it into your config.

After importing a config that names repos you don't have, use **Clone
Missing Repos into Main**.

## From a terminal

The `pom` CLI has the same operations:

```bash
pom config path
pom config edit
pom config split
pom config normalize
pom config export [--secrets]
pom config import <file>
pom apply [branch]      # check out repos the config added but a workspace lacks
```
