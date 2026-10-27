# Release channels

Pomelo ships on two channels. Pick one in **Settings > General > Update
Channel** (the `update_channel` setting), or per command with
`pom self-update --channel` and `install.sh --channel`.

| Channel | What you get | Version |
| :--- | :--- | :--- |
| **Stable** (default) | Each release, cut from a commit nightly users already ran | `0.10.1` |
| **Nightly** | A build of `main` every night it changed, and every stable release newer than it | `0.10.2-nightly.20261024` |

A nightly is named for the next patch release and the day it was built. A
release ranks above its own nightlies (`0.10.2` is newer than
`0.10.2-nightly.20261024`), so on the nightly channel you get each stable
release, and each hotfix, as soon as it is out.

Switching from nightly back to stable never goes back a version: you keep
the nightly you run until a stable release newer than it comes out, and the
app installs that one.

## Where the builds live

- Stable releases are the [GitHub releases](https://github.com/pomelohq/pomelo/releases)
  tagged `v<version>`; the latest one is what the download links point at.
- Nightly builds go into one prerelease tagged
  [`nightly`](https://github.com/pomelohq/pomelo/releases/tag/nightly), never
  marked latest. It keeps the last 7 nights' builds, named by version: the
  DMG, the app's update tarball, the Linux tarballs, each with its `.sig`, and
  `checksums-<version>.txt`.

Every build on both channels is built, signed and notarized the same way,
and every updater (the macOS app, the Linux app, `pom self-update`, and
**Update pom on host**) installs a download only after its signature
verifies against the release key built into it.

## Hosts on another machine

**Update pom on host** installs the app's own version on the host: from its
stable release, or from the nightly release while it still keeps that build.
A nightly older than 7 nights gets the newest nightly instead.

An app and a host's `pom` of the same version work together fully. Of
different versions, the app uses only what the host's `pom server` says it
supports when they connect, and offers the update once their major or minor
version differs. See [Remote machine](./remote#updating-pom-on-the-host).

## Hotfixes

An urgent fix is a normal stable release, made from `main` as soon as the fix
lands, without waiting for a nightly. Nightly users get it at once too. When
`main` cannot be released, the fix is released from the last release with
only that fix on top, and `main` carries it on.
