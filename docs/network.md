# Network

Every workspace runs its own copy of each service on its own port. Pomelo's
networking layer makes that practical: services share **one origin** (so the
browser never hits CORS), a backend can be **retargeted** local ↔ deployed
**without editing code**, and inbound **webhooks fan out** to every branch at
once.

## Overview

Two local ports do all the work: the **dev-proxy** fronts browser traffic
(same origin, and can retarget to a deployed backend), and the **webhook
relay** fans inbound events out to every branch. Both land on the per-branch
workspace services.

<figure class="diagram">
<svg viewBox="0 0 760 356" role="img" aria-label="Overview: the browser reaches the dev-proxy and a webhook provider reaches the relay; both route to the per-branch workspace services." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="no-ov" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c7d87"/>
    </marker>
  </defs>

  <rect x="70" y="14" width="230" height="48" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="185" y="37" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">Browser</text>
  <text x="185" y="54" text-anchor="middle" fill="#8b8b93" font-size="11">loads the app · same origin</text>

  <rect x="460" y="14" width="230" height="48" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="575" y="37" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">Webhook provider</text>
  <text x="575" y="54" text-anchor="middle" fill="#8b8b93" font-size="11">Stripe · GitHub · … (via tunnel)</text>

  <line x1="185" y1="62" x2="185" y2="122" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#no-ov)"/>
  <line x1="575" y1="62" x2="575" y2="122" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#no-ov)"/>

  <rect x="24" y="100" width="712" height="228" rx="14" fill="none" stroke="#2c2d33" stroke-dasharray="4 4"/>
  <text x="712" y="120" text-anchor="end" fill="#8b8b93" font-size="12" font-weight="600">Your machine · one pom</text>

  <rect x="70" y="124" width="230" height="62" rx="12" fill="rgba(217,180,91,0.12)" stroke="#d9b45b"/>
  <text x="185" y="150" text-anchor="middle" fill="#f0d896" font-size="14" font-weight="700">Dev-proxy :8767</text>
  <text x="185" y="169" text-anchor="middle" fill="#c9a94f" font-size="11">same origin · routes by profile</text>

  <rect x="460" y="124" width="230" height="62" rx="12" fill="rgba(217,180,91,0.12)" stroke="#d9b45b"/>
  <text x="575" y="150" text-anchor="middle" fill="#f0d896" font-size="14" font-weight="700">Webhook relay :8766</text>
  <text x="575" y="169" text-anchor="middle" fill="#c9a94f" font-size="11">fan-out to every branch</text>

  <polyline points="185,186 185,216 330,216 330,246" fill="none" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#no-ov)"/>
  <polyline points="575,186 575,216 430,216 430,246" fill="none" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#no-ov)"/>

  <rect x="210" y="246" width="340" height="64" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="274" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">workspace services</text>
  <text x="380" y="294" text-anchor="middle" fill="#8b8b93" font-size="11">one set per branch · own ports &amp; DB</text>

  <text x="380" y="348" text-anchor="middle" fill="#8b8b93" font-size="11">the dev-proxy can also forward same-origin traffic to a deployed backend (profiles)</text>
</svg>
</figure>

## Same-origin dev-proxy

A frontend on `:3000` calling a backend on `:4000` is **cross-origin** — you
fight CORS, and cookies don't behave like production. Pomelo's **dev-proxy**
removes that: it fronts every service in a workspace under **one origin**,
`<service>.<repo>.<branch>.localhost:8767`, and a frontend reaches a backend
at the same-origin path `/_pom_dev/<repo>/<service>`. Same origin → **no
CORS, cookies behave like production**. `.localhost` resolves to loopback with
no `/etc/hosts` edits.

<figure class="diagram">
<svg viewBox="0 0 760 350" role="img" aria-label="Same-origin dev-proxy: the browser loads one origin; the dev-proxy routes / to the frontend and /_pom_dev/api/server to the backend." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="np-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c7d87"/>
    </marker>
  </defs>

  <rect x="230" y="14" width="300" height="52" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="37" text-anchor="middle" fill="#e6e6e6" font-size="14" font-weight="600">Browser</text>
  <text x="380" y="55" text-anchor="middle" fill="#8b8b93" font-size="11">web.feat-a.localhost:8767 — one origin</text>

  <line x1="380" y1="66" x2="380" y2="100" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#np-a)"/>

  <rect x="250" y="100" width="260" height="56" rx="12" fill="rgba(217,180,91,0.12)" stroke="#d9b45b"/>
  <text x="380" y="125" text-anchor="middle" fill="#f0d896" font-size="15" font-weight="700">Dev-proxy :8767</text>
  <text x="380" y="144" text-anchor="middle" fill="#c9a94f" font-size="11">one origin for every service</text>

  <line x1="380" y1="156" x2="380" y2="200" stroke="#7c7d87" stroke-width="1.5"/>
  <line x1="200" y1="200" x2="560" y2="200" stroke="#7c7d87" stroke-width="1.5"/>
  <line x1="200" y1="200" x2="200" y2="248" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#np-a)"/>
  <line x1="560" y1="200" x2="560" y2="248" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#np-a)"/>
  <text x="200" y="224" text-anchor="middle" fill="#8b8b93" font-size="11">/</text>
  <text x="560" y="224" text-anchor="middle" fill="#8b8b93" font-size="11">/_pom_dev/api/server</text>

  <rect x="100" y="248" width="200" height="62" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="200" y="274" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">web · frontend</text>
  <text x="200" y="293" text-anchor="middle" fill="#8b8b93" font-size="11">the app you loaded</text>

  <rect x="460" y="248" width="200" height="62" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="560" y="274" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">api · backend</text>
  <text x="560" y="293" text-anchor="middle" fill="#8b8b93" font-size="11">:41000 — same origin, no CORS</text>

  <text x="380" y="336" text-anchor="middle" fill="#8b8b93" font-size="11">both served under one origin — the browser makes same-origin requests</text>
</svg>
</figure>

Reference another service's same-origin path with `{{<repo>.<service>.path}}`
(→ `/_pom_dev/<repo>/<service>`), or its full URL with
`{{<repo>.<service>.url}}`.

## Switch environment without touching the URL

The frontend always calls the **same-origin path** `/_pom_dev/api/server` — it
never changes. The dev-proxy is a **reverse proxy**: for each request it
forwards `/_pom_dev/<repo>/<service>` to the **local** service by default, or
to a **deployed** backend when a non-local profile is active. So you retarget
an environment by **flipping a profile**, and the browser URL — same origin,
CORS-free — stays exactly the same.

<figure class="diagram">
<svg viewBox="0 0 760 300" role="img" aria-label="The frontend always calls the same-origin /_pom_dev path; the dev-proxy reverse-proxies it to the local service or a deployed backend depending on the active profile." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="np-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c7d87"/>
    </marker>
  </defs>

  <rect x="20" y="112" width="250" height="80" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="145" y="138" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">web · frontend</text>
  <text x="145" y="159" text-anchor="middle" fill="#a9b7f0" font-size="11">fetch('/_pom_dev/api/server')</text>
  <text x="145" y="178" text-anchor="middle" fill="#8b8b93" font-size="11">same origin — never changes</text>

  <line x1="270" y1="152" x2="316" y2="152" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#np-b)"/>

  <rect x="316" y="118" width="184" height="70" rx="12" fill="rgba(217,180,91,0.12)" stroke="#d9b45b"/>
  <text x="408" y="142" text-anchor="middle" fill="#f0d896" font-size="14" font-weight="700">Dev-proxy :8767</text>
  <text x="408" y="160" text-anchor="middle" fill="#c9a94f" font-size="11">reverse proxy</text>
  <text x="408" y="176" text-anchor="middle" fill="#c9a94f" font-size="11">routes by active profile</text>

  <polyline points="500,152 545,152 545,74 588,74" fill="none" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#np-b)"/>
  <polyline points="500,152 545,152 545,240 588,240" fill="none" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#np-b)"/>
  <text x="552" y="66" fill="#5aa06e" font-size="11">local</text>
  <text x="552" y="228" fill="#c9a94f" font-size="11">staging</text>

  <rect x="588" y="44" width="168" height="60" rx="10" fill="#1b1c20" stroke="#2f5540"/>
  <text x="672" y="70" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">api service</text>
  <text x="672" y="89" text-anchor="middle" fill="#8b8b93" font-size="11">:41000 · local</text>

  <rect x="588" y="210" width="168" height="60" rx="10" fill="#1b1c20" stroke="#5a4a2a"/>
  <text x="672" y="236" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">api.acme.dev</text>
  <text x="672" y="255" text-anchor="middle" fill="#8b8b93" font-size="11">deployed backend</text>

  <text x="380" y="294" text-anchor="middle" fill="#8b8b93" font-size="11">the browser always hits /_pom_dev (same origin) — the dev-proxy routes local or deployed underneath</text>
</svg>
</figure>

Use `{{<repo>.<service>.path}}` (not `.url`) for browser calls — it's always
the same-origin `/_pom_dev` route, so flipping profiles changes only what the
dev-proxy forwards to, never what the browser requests:

```yaml
repos:
  web:
    profiles: [local, staging]
    env:
      VITE_API_URL: "{{api.server.path}}"   # → /_pom_dev/api/server (same origin, always)
environments:
  staging:
    api.server: "https://api.acme.dev"      # dev-proxy forwards there when staging is active
```

See [Environments & profiles](../reference/config#environments-profiles).

## Webhook fan-out

Testing a feature across several branches at once? An external provider
(Stripe, a Git host, an OAuth vendor) only knows **one** URL. Pomelo's
**webhook relay** bridges that: a single local port receives an inbound event
and **fans it out** to every workspace running the target service. It runs
inside the app on loopback, one per machine, and follows the active session —
routes are derived from your repos and services, **nothing to configure**.

<figure class="diagram">
<svg viewBox="0 0 760 490" role="img" aria-label="Webhook fan-out: an external provider posts to one relay port, which ACKs immediately and forwards the event to every workspace running the service." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="wh-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c7d87"/>
    </marker>
    <marker id="wh-arrow-ack" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#5aa06e"/>
    </marker>
  </defs>

  <rect x="270" y="14" width="220" height="46" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="35" text-anchor="middle" fill="#e6e6e6" font-size="14" font-weight="600">External provider</text>
  <text x="380" y="51" text-anchor="middle" fill="#8b8b93" font-size="11">Stripe · GitHub · OAuth vendor</text>

  <line x1="380" y1="60" x2="380" y2="92" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#wh-arrow)"/>
  <text x="392" y="80" fill="#8b8b93" font-size="11">POST /&lt;repo&gt;/&lt;service&gt;/…</text>

  <rect x="270" y="92" width="220" height="42" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="118" text-anchor="middle" fill="#e6e6e6" font-size="13">Tunnel (ngrok / cloudflared)</text>

  <line x1="380" y1="134" x2="380" y2="196" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#wh-arrow)"/>

  <rect x="24" y="164" width="712" height="312" rx="16" fill="none" stroke="#2c2d33" stroke-dasharray="4 4"/>
  <text x="712" y="186" text-anchor="end" fill="#8b8b93" font-size="12" font-weight="600">Your machine · one pom</text>

  <rect x="248" y="200" width="264" height="58" rx="12" fill="rgba(217,180,91,0.12)" stroke="#d9b45b"/>
  <text x="380" y="225" text-anchor="middle" fill="#f0d896" font-size="15" font-weight="700">Webhook relay</text>
  <text x="380" y="244" text-anchor="middle" fill="#c9a94f" font-size="11">:8766 — one per machine, zero-config</text>

  <polyline points="248,226 148,226 148,37 268,37" fill="none" stroke="#5aa06e" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#wh-arrow-ack)"/>
  <text x="60" y="120" fill="#5aa06e" font-size="11">200 ACK</text>
  <text x="60" y="135" fill="#5aa06e" font-size="11">(instant)</text>

  <line x1="380" y1="258" x2="380" y2="322" stroke="#7c7d87" stroke-width="1.5"/>
  <text x="392" y="296" fill="#8b8b93" font-size="11">fan-out (background)</text>
  <line x1="140" y1="322" x2="620" y2="322" stroke="#7c7d87" stroke-width="1.5"/>
  <line x1="140" y1="322" x2="140" y2="364" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#wh-arrow)"/>
  <line x1="380" y1="322" x2="380" y2="364" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#wh-arrow)"/>
  <line x1="620" y1="322" x2="620" y2="364" stroke="#7c7d87" stroke-width="1.5" marker-end="url(#wh-arrow)"/>

  <rect x="40" y="366" width="200" height="66" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="140" y="393" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">workspace feat-a</text>
  <text x="140" y="412" text-anchor="middle" fill="#8b8b93" font-size="11">api · :41001 · own DB</text>

  <rect x="280" y="366" width="200" height="66" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="393" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">workspace feat-b</text>
  <text x="380" y="412" text-anchor="middle" fill="#8b8b93" font-size="11">api · :41002 · own DB</text>

  <rect x="520" y="366" width="200" height="66" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="620" y="393" text-anchor="middle" fill="#e6e6e6" font-size="13" font-weight="600">workspace main</text>
  <text x="620" y="412" text-anchor="middle" fill="#8b8b93" font-size="11">api · :41000 · own DB</text>

  <text x="380" y="462" text-anchor="middle" fill="#8b8b93" font-size="11">every workspace running the service receives the same event — stopped ones are skipped</text>
</svg>
</figure>

A request path is `/<repo>/<service>/<rest…>`. The relay resolves
`<repo>/<service>` against your config — the repo by **alias or name**, the
service explicitly (or the repo's sole service) — strips that prefix, and
forwards `/<rest…>` with the original query string, headers (including the
provider's **signature**) and body unchanged.

It **ACKs `200` immediately** (`{"ok":true,"service":"api/server","fanout":N}`),
then forwards the event in the background to **every** workspace whose service
is currently listening. Each has its own database, so they process
independently, and one slow or stopped branch never makes the provider retry.
Stopped workspaces are skipped; the body is capped at 32 MB.

To use it, expose **one** public URL that forwards to `http://localhost:8766`,
then let the provider call `/<repo>/<service>/<their-path>`:

```bash
cloudflared tunnel --url http://localhost:8766
# or: ngrok http 8766
```

## OAuth callbacks — target one branch

Fan-out is right for **events** (a Stripe charge) that every branch may
process. An **OAuth callback** (`…/callback?code=…`) is different: the code
is single-use and must return to the **one** branch that started the flow,
so it must not be fanned out — and it doesn't go through the relay at all.

An OAuth callback is a **browser** redirect, not a server-to-server call, so
it needs no tunnel. Point the OAuth app's redirect URI at the workspace's
dev-proxy hostname:

```
http://<service>.<repo>.<branch>.localhost:8767/oauth/callback
```

The browser resolves `.localhost` to loopback on its own and hits the
dev-proxy, which reads the **branch** from the hostname and forwards to that
one workspace. Nothing to configure — the hostname names the branch.

::: tip Requirements
The dev-proxy only routes hosts ending in `.localhost`, so register the
`.localhost` URL above as an allowed redirect URI in your OAuth app (most
dev/test apps allow it). Each branch is its own host — there is no
single-URL-for-every-branch mode.
:::
