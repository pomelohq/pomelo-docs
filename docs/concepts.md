# Concepts

A short tour of the moving parts before you dive deeper. Pomelo is a
**native macOS app** that runs a full, isolated dev environment per git
branch — no browser, no server to point at.

## Project

A **project** (also called a session) is a set of repos that belong
together, plus its config (`pom.yml`). You add repos by folder or git URL;
Pomelo keeps them together under the project's folder (`~/pom/<name>` for
**New Project**, or the folder you pick with **Open Project**). Switch
projects from the project name at the top left of the window.

## Workspace

A **workspace** is one isolated copy of your project, anchored to a git
branch. Pomelo creates it as a sibling folder named `workspace--<branch>/`
containing one git worktree per repo. Each workspace has its own:

- Branch checkout for every repo it includes
- Database names (auto-resolved from `{{branch.safe}}` templates)
- Service ports (allocated on demand, conflict-free)
- Env files written from the per-repo `env:` block

You can run several workspaces side by side; their ports, databases, and
worktrees never collide.

## Repo

A **repo** is one source directory listed under `repos:` in `pom.yml`.
Each repo declares its own setup commands, env templates, services, and
databases. A workspace contains one git worktree per repo it activates.

## Service

A **service** is a long-running process — a web server, a worker, a
console. Each service runs **natively** on Pomelo's own managed PTY holder
— a real process in your login shell, **not** a container. That's lighter
and faster than Dockerizing every service (no image builds, no per-service
container overhead), and it uses your machine's tools directly (nvm, rbenv,
...). Logs persist and you can re-attach across restarts.

```yaml
services:
  server:
    cmd: go run . serve
    port: true              # request a conflict-free port
  worker:
    cmd: go run . worker
```

Start and stop services from the **Services** panel in the app. See
[Services](./services).

## Shared services

Containers shared across all workspaces — Postgres, Redis, MinIO,
OpenSearch — declared under `shared_services:`. **Docker is reserved for
these data/infra services** (the things you don't want to install and
version-manage by hand); your own repo services stay native. One set of
containers backs every workspace; isolation happens at the *data* layer
(per-branch databases, capacity slots), not by running N copies. Pomelo
starts them with docker compose (one `<project>-shared` project) and
exposes them on conflict-free ports.

```yaml
shared_services:
  postgres:                  # well-known: image/ports/creds filled in
  redis:
```

A shared service can also be a **command** instead of a container: one
process for every workspace, for a small server you don't want running once
per branch (a mock auth server, a local stub of an outside API). It runs in
the repo's checkout in the main workspace (or the project folder when no
`repo` is given), gets its port as `$PORT`, and keeps running when you close
and reopen Pomelo. Services reach it with `{{shared.<name>.url}}`, which is
`http://127.0.0.1:<port>`.

```yaml
shared_services:
  mock-as:
    cmd: node scripts/mock-as.js
    repo: api                # optional: run in api's main checkout
    port: 4010               # optional: a fixed port; otherwise one is picked
    environment:
      ISSUER: "http://127.0.0.1:$PORT"
    healthcheck:
      test: "curl -sf http://127.0.0.1:$PORT/health"
repos:
  api:
    shared_services: [mock-as]
    env:
      AUTH_ISSUER: "{{shared.mock-as.url}}"
```

It starts with the other shared services when a workspace starts its
services, and the Services panel's shared section starts, stops and restarts
it like the containers. Its tab shows its output, how long it has run, the
command, folder, port and URL. A shared service is either `image:` or
`cmd:`, never both; the config doctor checks that the command's program is
installed, and Docker is only needed when there is an `image:` service.

## Database

Each workspace gets its **own databases**, named from templates and
created automatically. `{{db.main}}` resolves to a session-prefixed,
branch-resolved name so two branches never share a database. New
workspaces can clone their databases from **main** (`seed_from_main`)
instead of migrating from scratch. See [Databases](./databases).

## Config doctor

The **config doctor** is a deterministic health check (no LLM): it checks
that the config loads and is valid, that git and Docker are installed and
Docker is running (when a shared service is a container), that each shared
command's program is installed, that main has every repo, and it flags removed config
keys, unset `{{secret.*}}` values and shared services nothing is wired to.
When it finds problems the window shows **Project setup needs attention**,
with **Fix with Claude** (or **Open pom.yml** when Claude Code is not
installed). The same check is `pom doctor` and the agent's `config_doctor`
tool.

## Onboarding agent

A new project's `pom.yml` is drafted from what Pomelo detects in each repo.
When you pick an agent CLI (Claude Code, Codex or Gemini CLI) in the
**Setup** step, an **onboarding agent** turns that draft into a runnable
config: Pomelo verifies it (the config doctor, the installs, a boot of each
service) and hands what fails back to the agent to repair, until it comes
out clean. Choose to write it yourself and you review the draft instead.
See [Quick Start](./quickstart).

## AI agent

Each workspace has a **main agent**, opened in the agent dock. It runs in
the workspace folder and is wired to Pomelo's MCP tools, so it can inspect
the real running stack (ports, databases, service state) and act on it.
**Side agents** answer a question, review the branch or fix one thing next
to it without touching its conversation. See [Agents](./agents).

**Choosing the CLI.** The agent is the command in **Settings > Agent >
Agent Command** (`claude` by default). With `claude` it also gets the MCP
tools, a conversation that resumes per workspace, and Pomelo's system
prompt; any other CLI runs as-is. You log in to the CLI yourself; Pomelo
never stores AI credentials.

## Pipeline

Workspace creation and deletion run as a multi-stage **pipeline**, with
parallel per-repo stages (create worktrees, write env files, run setup,
seed). The app shows progress live and can resume a failed run. See
[Workspace lifecycle](./workspace).
