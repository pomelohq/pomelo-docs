# Testing against a workspace

An end-to-end suite needs the same starting data before every test, to know when the services answer, and to
read back what one step logged and queried. A workspace gives each of these a command, and every command stays
inside that workspace: main and other branches are never touched.

The examples use a project `myproject` with repos `api` and `web` and a workspace `feat-login`.

## The loop

```sh
pom prepare-main                          # once: seed main, then save it as main__baseline
pom ws create feat-login                  # copies main__baseline, migrates, saves ws__baseline
pom start web --wait --timeout 2m         # returns once every service is ready

for test in checkout refund; do
  pom db restore ws__baseline -w feat-login   # same rows before every test
  pom mark "$test"                            # where logs and query counters are now
  run-the-test "$test"
  pom queue wait-idle api/worker              # let background jobs finish
  pom logs api/server --since "$test" -o json
  pom db stats --since "$test" -o json        # queries of this step, repeated ones flagged
done
```

## Running a repo's tests

`pom run` exports the workspace's dev env before it runs a command. dotenv never overwrites a variable that is
already set, so a test framework that loads `.env.test` would keep the dev values. The test profile fixes that:

```sh
pom run --profile test "bin/rspec"        # the repo's .env.test values, the workspace's connections
pom run test                              # same, when the repo has a test: block
pom run --explain-env --profile test "bin/rspec"   # where each variable comes from; runs nothing
```

Under the test profile:

- **The test env file wins.** `.env.test`, then `.env.test.local`, are read from the repo folder. A variable
  they set replaces the dev value, a secret included (CI does not see dev secrets either).
- **Connection values keep the workspace's.** A variable whose `env` template has a workspace token
  (`{{db.*}}`, `{{shared.*}}`, `{{slot.*}}`, `{{branch*}}`, `{{bind_ip}}`, `{{<repo>.<service>.*}}`), and
  `PORT`, keeps this workspace's value even when `.env.test` sets it: the tests still reach this workspace's
  databases, Redis, URLs and buckets. Which variables these are is decided from the template, never from the name.
- **`test.env` wins over everything.** Set a test database there.
- **Generated files are skipped.** A `.env.test.local` Pomelo wrote is not read; the `.env.test.local:` entry of
  the repo's `env` applies instead.

```yaml
repos:
  api:
    env:
      DATABASE_URL: "{{db.main.url}}"
      SOME_ALLOWED_DOMAINS: "*"
    databases:
      main: "{{branch.safe}}"
      test: "{{branch.safe}}_test"
    test:
      command: bin/rspec               # what `pom run test` runs
      env_file: .env.test              # the default; `<env_file>.local` is read after it
      env:
        DATABASE_URL: "{{db.test.url}}"
```

With a `test:` block, `pom run test` (or `pom run` of the exact `test.command`) applies the profile without
`--profile test`; `--profile dev` turns it off. Without `--profile` and without a `test:` block, `pom run`
exports the dev env as before.

`pom run --explain-env [--profile test] [--json] <command>` prints each variable with its value (secrets masked)
and its source: `workspace`, `connection`, the env file (`.env.test`), `pom.yml env <file>` or
`pom.yml test.env`. A connection value that the env file also set says which file it was kept over. `--json`
prints schema `pom.run/v1`:

```json
{
  "schema": "pom.run/v1",
  "workspace": "feat-login",
  "repo": "api",
  "command": "bin/rspec",
  "profile": "test",
  "env_files": [".env.test"],
  "env": [
    { "key": "DATABASE_URL", "value": "postgres://postgres:postgres@127.0.0.1:5432/myproject_feat_login",
      "source": "connection", "connection": true, "secret": false, "kept_over": ".env.test" },
    { "key": "SOME_ALLOWED_DOMAINS", "value": "example.test",
      "source": ".env.test", "connection": false, "secret": false, "kept_over": null }
  ]
}
```

## Database snapshots

| Command | What it does |
|---|---|
| `pom db snapshot <name> [-w b] [--replace]` | Copies every database the workspace owns into a snapshot. |
| `pom db restore <name> [-w b] [--no-restart]` | Stops the workspace's running services, puts the snapshot back, starts them again. |
| `pom db snapshots [-w b] [-o json]` | Lists snapshots with their sizes and the total. |
| `pom db snapshot drop <name> [-w b]` | Drops one snapshot. |
| `pom db baseline [-w b]` | Runs the branch's migrations, then saves `ws__baseline` again. |
| `pom db reseed [-w b] [--from main__baseline \| --snapshot <name>]` | Replaces the data from main's baseline or a snapshot, migrates, saves `ws__baseline`. |

How it works:

- **Snapshots are sealed templates.** Each database `<db>` is copied to `<db>__snap__<name>`, which nobody can
  connect to. Copying from such a template never has to disconnect anyone. A name longer than Postgres' 63 bytes
  is shortened and ends in a hash.
- **Two baselines.**
  - `prepare-main` ends by saving `main__baseline`. A new workspace copies main's data from that snapshot instead
    of from live main, so main's services keep their connections.
  - `ws create` then saves the workspace's own `ws__baseline`.
  - A project created before this has no `main__baseline` yet. `ws create` then copies live main, which
    disconnects it, and says so: run `pom prepare-main` once to stop that.
- **Only your databases.** A workspace only touches the databases whose names follow its branch. A name that does
  not change with the branch belongs to main.
- **Main needs `--main`.** Restoring or reseeding main is refused without it. Agents (the `db_*` MCP tools) can
  never change main's data.
- **Postgres version.** Restore uses `STRATEGY FILE_COPY` on Postgres 15 and later, which is fast for big
  databases. It triggers a server-wide checkpoint, so other workspaces may slow down for a moment during a
  restore.
- **Disk.** Every snapshot is a full copy. `pom db snapshots` shows the sizes, and a snapshot warns when the
  Postgres container has less than twice the workspace's size free. `ws delete` drops the workspace's snapshots,
  and `pom db clean` drops snapshots whose workspace is gone.

## Waiting until services are ready

Give a service a healthcheck in `pom.yml`:

```yaml
repos:
  api:
    services:
      server:
        type: backend
        cmd: bin/rails s -p $PORT
        healthcheck:
          http: /up            # a GET on the service's own port; 2xx or 3xx is healthy
          interval: 1s
          timeout: 3s
      worker:
        cmd: bundle exec sidekiq
        healthcheck:
          cmd: bin/rails runner 'exit 0'   # run in the service's folder with its env; exit 0 is healthy
```

`pom start <target> --wait [--timeout 120s]` starts the target, then waits until each service is ready:

- with a healthcheck, the healthcheck passes;
- with a port and no healthcheck, the port listens;
- with neither, the process runs.

When the target includes a repo service, `--wait` also waits until every shared service answers on its host
port (see [Services](./services#urls)); nothing is run inside the containers.

| Exit code | Meaning |
|---|---|
| 0 | Every service is ready |
| 2 | Timed out; the services not ready yet are listed |
| 3 | A service stopped while starting; its last lines are printed |

`pom status -o json` reports `up`, `ready` and `healthy` for every service. `healthy` is null for a service with
no healthcheck. Its `shared` list reports `up` and `ready` for each shared service; `pom status` shows a shared
service that runs but does not answer yet as `starting`.

## What one step did

- **`pom mark <name>`** saves two things at once: where every running service's output has got to, and the
  Postgres query counters of the workspace's databases.
- **`pom logs <service> --since <name> [-o json]`** prints only what the service wrote after the mark.
  - Each service keeps its last 1 MB of output. If more was written since the mark, you get what is left, with
    `truncated: true`.
  - Escape codes are stripped; add `--raw` to keep them.
- **`pom db stats --since <name> [--repeated 10] -o json`** reports the step's queries:
  - totals: queries, calls and time;
  - the slowest ten;
  - `repeated`: the same query run more than the threshold, the usual sign of an N+1;
  - live connections, by service.

Every service gets `PGAPPNAME=pom:<branch>:<repo>/<service>`, so Postgres can tell whose connection is whose.

Query stats need `pg_stat_statements`. The built-in `postgres` shared service loads it. A Postgres you declared
yourself may not: `db stats` then says which `command:` line to add. Pomelo never recreates your container.

## Background jobs

A worker service can name the queue it drains:

```yaml
      worker:
        cmd: bundle exec sidekiq
        queue: { kind: sidekiq }               # or { kind: bullmq, prefix: bull, queues: [emails] }
```

`pom queue wait-idle api/worker [--timeout 60s]` waits until the queue holds no work, in the workspace's own Redis
slot. No work means nothing waiting, nothing running, and no scheduled or retried job already due; for BullMQ, no
delayed or prioritized job either. It checks twice, 200 ms apart, before it calls the queue idle. It exits 0
when idle, or 2 when still busy, with the counts. `pom queue counts api/worker` prints them once.

## Failing a backend on purpose

```sh
pom proxy fault add api/server --path /v1/payments --status 503 --rate 0.5 --ttl 5m
pom proxy fault add api/server --delay 2s
pom proxy fault ls
pom proxy fault rm <id>
pom proxy fault clear
```

How a rule works:

- **What it matches.** Requests to that service of this workspace through the dev proxy, both on its hostname
  and on `/_pom_dev/` paths. Webhooks are never affected.
- **What it does.** `--status` answers with that status instead of forwarding. `--delay` waits first. With
  both, the proxy answers after the delay.
- **Rate.** `--rate` applies the rule to that share of matching requests.
- **Expiry.** Every rule expires after `--ttl` (10 minutes by default).
- **In Dev Requests.** A request a rule changed shows the rule's id.
- **When it applies.** `add`, `rm` and `clear` return once the running dev proxy obeys the change, so the very
  next request meets it. They ask the proxy to re-read its rules at once and wait up to 3 seconds. With no
  proxy running they return at once: the rule is saved and applies when a proxy starts.

With `--json` (or `-o json`), `add` prints the rule, `rm` prints `{"removed": "<id>"}` and `clear` prints
`{"workspace": "<branch>", "cleared": <n>}`, each with `applied`:

```json
{"id": "f3a91c", "session": "myproject", "branch": "feat-login", "repo": "api", "alias": "api", "service": "server",
 "path": "/v1/payments", "status": 503, "delay_ms": 0, "rate": 0.5, "expires_ms": 1792730000000, "applied": true}
{"schema": "pom.proxy/v1", "workspace": "feat-login", "cleared": 1, "applied": false, "reason": "no proxy running"}
```

`applied` is `false` with a `reason` when no proxy runs, when the proxy on the port reads another state folder,
or when it did not take the change within 3 seconds.

## For agents

The MCP tools `db_snapshots`, `db_snapshot`, `db_restore`, `db_baseline` and `db_reseed` do the same for the
agent's own workspace, and refuse main.
