# Architecture

Pomelo is a **native macOS app** with a **Go core linked in-process** — no
daemon, no background server, and no `localhost` port between the UI and the
engine. The core turns your `pom.yml` into running, isolated **per-branch
environments** and drives the tools already on your machine.

## High level

<figure class="diagram">
<svg viewBox="0 0 760 420" role="img" aria-label="The SwiftUI app talks to the Go core (libpom) over in-process FFI; libpom holds four subsystems — workspaces, services, network, AI agent — on top of Docker, git and your local toolchains." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c7d87"/>
    </marker>
  </defs>

  <rect x="230" y="14" width="300" height="50" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="37" text-anchor="middle" fill="#e6e6e6" font-size="14" font-weight="600">Pomelo.app</text>
  <text x="380" y="54" text-anchor="middle" fill="#8b8b93" font-size="11">SwiftUI · native macOS UI</text>

  <line x1="380" y1="64" x2="380" y2="100" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#ar-a)"/>
  <text x="392" y="86" fill="#8b8b93" font-size="11">in-process FFI · no HTTP port</text>

  <rect x="24" y="100" width="712" height="184" rx="14" fill="rgba(217,180,91,0.06)" stroke="#d9b45b"/>
  <text x="44" y="126" fill="#f0d896" font-size="14" font-weight="700">libpom · Go core</text>
  <text x="44" y="144" fill="#c9a94f" font-size="11">orchestrates everything · in-process</text>

  <rect x="44" y="164" width="156" height="98" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="122" y="196" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">Workspaces</text>
  <text x="122" y="218" text-anchor="middle" fill="#8b8b93" font-size="11">git worktrees</text>
  <text x="122" y="236" text-anchor="middle" fill="#8b8b93" font-size="11">per-branch DB · ports</text>

  <rect x="216" y="164" width="156" height="98" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="294" y="196" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">Services</text>
  <text x="294" y="218" text-anchor="middle" fill="#8b8b93" font-size="11">native PTY holders</text>
  <text x="294" y="236" text-anchor="middle" fill="#8b8b93" font-size="11">real processes</text>

  <rect x="388" y="164" width="156" height="98" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="466" y="196" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">Network</text>
  <text x="466" y="218" text-anchor="middle" fill="#8b8b93" font-size="11">dev-proxy :8767</text>
  <text x="466" y="236" text-anchor="middle" fill="#8b8b93" font-size="11">webhook :8766</text>

  <rect x="560" y="164" width="156" height="98" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="638" y="196" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">AI agent</text>
  <text x="638" y="218" text-anchor="middle" fill="#8b8b93" font-size="11">MCP tools</text>
  <text x="638" y="236" text-anchor="middle" fill="#8b8b93" font-size="11">Claude headless</text>

  <line x1="380" y1="284" x2="380" y2="324" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#ar-a)"/>

  <rect x="24" y="324" width="712" height="88" rx="14" fill="none" stroke="#2c2d33" stroke-dasharray="4 4"/>
  <text x="44" y="346" fill="#8b8b93" font-size="12" font-weight="600">On your machine</text>

  <rect x="40" y="354" width="216" height="44" rx="9" fill="#1b1c20" stroke="#33343a"/>
  <text x="148" y="380" text-anchor="middle" fill="#e6e6e6" font-size="12">Docker · Postgres/Redis</text>

  <rect x="272" y="354" width="216" height="44" rx="9" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="380" text-anchor="middle" fill="#e6e6e6" font-size="12">git · worktrees</text>

  <rect x="504" y="354" width="216" height="44" rx="9" fill="#1b1c20" stroke="#33343a"/>
  <text x="612" y="380" text-anchor="middle" fill="#e6e6e6" font-size="12">your toolchains · node/ruby…</text>
</svg>
</figure>

## The pieces

- **Pomelo.app** — the SwiftUI UI. It calls the core directly through an
  in-process **FFI** boundary (`libpom`, a Go c-archive), so there is no
  daemon and no internal port to secure.
- **libpom · Go core** — reads `pom.yml`, resolves [templates](../reference/templates),
  and holds the subsystems below.
- **Workspaces** — one isolated copy of the project per branch: a
  [git worktree](./workspace) per repo, its own
  [databases](./databases) and ports.
- **Services** — each long-running process runs **natively** on Pomelo's own
  managed [PTY holders](./services) — real processes, not containers.
- **Network** — the [dev-proxy](./network) (same-origin URLs, `:8767`) and the
  [webhook relay](./network#webhook-fan-out) (`:8766`).
- **AI agent** — a workspace-scoped [MCP server](./workspace#agent-tools-mcp)
  plus the headless agent driver, so the agent acts on the *real* running
  stack.

Only genuinely external listeners bind a port — the dev-proxy and the webhook
relay. Everything between the UI and the core stays in-process.
