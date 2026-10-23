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
  <text x="575" y="54" text-anchor="middle" fill="#8b8b93" font-size="11">Stripe · GitHub · ... (via tunnel)</text>

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
`<service>.<repo>.<workspace>.localhost:8767` (the workspace part is the
branch's ticket id when it has one, else the branch with `/` as `-`), and a
frontend reaches a backend
at the same-origin path `/_pom_dev/<repo>/<service>`. Same origin -> **no
CORS, cookies behave like production**. `.localhost` resolves to loopback with
no `/etc/hosts` edits.

In the hostname, `<repo>` is the repo's alias or name, and `<branch>` is the
branch lowercased with anything outside `a-z`, `0-9` and `-` turned into `-`
(`feat/login` becomes `feat-login`), or just its leading ticket key (such as
`proj-101`) when no other workspace shares it.

Each request goes to the port the service was given. When nothing answers
there, the proxy goes to whatever port the service's processes listen on, over
IPv4 or IPv6, so a dev server that ignores `$PORT` (Vite's 5173, say) still
works. A service that isn't up answers with why instead:
`... is still starting (building, not listening yet)` while it builds, and
`... is not running in <branch>` once stopped.

In a browser that answer is a page: it says whether the service is starting, stopped, not answering or unknown,
shows the `pom start` command for a stopped one, and checks again in the background, so it opens the app by itself
as soon as the service is up. Scripts, `fetch` and curl still get the one-line text.

A workspace on a remote host opens at the same address, or at
`<service>.<repo>.<workspace>.<host>.localhost:8767` to name the host; when the
laptop and the host both have it, a service stopped on the laptop is served by
the host. See [Remote machine > Ports](/docs/remote#ports).

**Settings > Dev Services** turns the proxy and the relay on or off and sets
their ports (8767 and 8766 by default). Service URLs in env files use the
proxy port too, so restart running services after changing it. `POM_WEB_PORT`
overrides both, so a second copy of the app can run beside the first: the relay
listens on that port + 1 and the proxy on + 2.

The **Dev Requests** tab (**Open Requests** in Settings, or `Dev Requests` in
the command palette) lists every `/_pom_dev/` request the proxy handled, page
loads and failed requests on a service hostname (a page's module and asset
requests are left out, so they don't push everything else out), and every
webhook the relay fanned out, newest first. The toolbar filters by kind
(**All**, **Proxy**, **Webhooks**), by status (**Any Status**, **Errors**)
and by path or service, and shows whether the proxy and the webhook relay
are up, with **Restart**. Select a row to see it beside the list: the
service, when it arrived, the profile and the target URL, then:

- **Request** - the headers and body that came in (JSON is indented, keys in
  the order they were sent; **Copy** puts the body on the clipboard).
- **Fan-out** (webhooks) - each workspace it was handed to, with the status it
  answered and how long it took, or why it could not be reached.
- **Response** - the headers and body sent back.

<AppShot :width="1002" :height="602" text="Dev Requests. Click a row, the tabs, the filters or Show Hidden; the 15:39:02 webhook shows a fan-out that one of two branches failed."><DevRequests /></AppShot>

Bodies are kept in memory for the session only: the first 256 KB of each, and
64 MB for the whole log (the oldest are dropped first). Authorization, cookie
and token headers stay hidden until you click **Show Hidden**.

<figure class="diagram">
<svg viewBox="0 0 760 350" role="img" aria-label="Same-origin dev-proxy: the browser loads one origin; the dev-proxy routes / to the frontend and /_pom_dev/api/server to the backend." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="np-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c7d87"/>
    </marker>
  </defs>

  <rect x="230" y="14" width="300" height="52" rx="10" fill="#1b1c20" stroke="#33343a"/>
  <text x="380" y="37" text-anchor="middle" fill="#e6e6e6" font-size="14" font-weight="600">Browser</text>
  <text x="380" y="55" text-anchor="middle" fill="#8b8b93" font-size="11">app.web.feat-a.localhost:8767 - one origin</text>

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
(-> `/_pom_dev/<repo>/<service>`), or its full URL with
`{{<repo>.<service>.url}}`.

To make a service fail or slow down through the proxy on purpose, use
[`pom proxy fault`](/docs/testing#failing-a-backend-on-purpose). `add`, `rm`
and `clear` return only once the running proxy obeys the change (or at once,
with `applied: false`, when no proxy runs), so a test's next request already
meets it.

## Switch environment without touching the URL

The frontend always calls the **same-origin path** `/_pom_dev/api/server` — it
never changes. The dev-proxy is a **reverse proxy**: for each request it
forwards `/_pom_dev/<repo>/<service>` to the **local** service by default, or
to a **deployed** backend when a non-local profile is active. So you retarget
an environment by **flipping a profile** (right-click the frontend service
in the Services panel > **Env** > **staging**), and the browser URL — same origin,
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
      VITE_API_URL: "{{api.server.path}}"   # -> /_pom_dev/api/server (same origin, always)
environments:
  staging:
    api.server: "https://api.acme.dev"      # dev-proxy forwards there when staging is active
```

See [Environments & profiles](../reference/config#top-level).

## Webhook fan-out

Testing a feature across several branches at once? An external provider
(Stripe, a Git host, an OAuth vendor) only knows **one** URL. Pomelo's
**webhook relay** bridges that: a single local port receives an inbound event
and **fans it out** to every workspace running the target service. It runs
inside the app on loopback, one per machine, and routes across every open
project - routes are derived from your repos and services, **nothing to
configure**.

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
  <text x="392" y="80" fill="#8b8b93" font-size="11">POST /&lt;repo&gt;/&lt;service&gt;/...</text>

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

A request path is `/<repo>/<service>/<rest...>`. The relay resolves
`<repo>/<service>` against your config — the repo by **alias or name**, the
service by name (both are required) - strips that prefix, and
forwards `/<rest...>` with the original query string, headers (including the
provider's **signature**) and body unchanged.

It **ACKs `200` immediately** (`{"ok":true,"service":"api/server","fanout":N}`),
then forwards the event in the background to **every** workspace whose service
is currently listening. Each has its own database, so they process
independently, and one slow or stopped branch never makes the provider retry.
Stopped workspaces are skipped; a body over 32 MB is forwarded empty. The
Dev Requests tab shows each delivery, so a branch that answered with an error
or refused the connection stands out.

Paths starting with `/_` belong to the relay itself (repo names and aliases
may not start with `_`): `/_pom/github` receives signed GitHub pushes and
syncs the workspaces on that branch, see
[Sync on push](./workspace#sync-on-push).

To use it, expose **one** public URL that forwards to `http://127.0.0.1:8766`,
then let the provider call `/<repo>/<service>/<their-path>`:

```bash
cloudflared tunnel --url http://127.0.0.1:8766
# or: ngrok http 8766
```

## OAuth callbacks — target one branch

Fan-out is right for **events** (a Stripe charge) that every branch may
process. An **OAuth callback** (`.../callback?code=...`) is different: the code
is single-use and must return to the **one** branch that started the flow,
so it must not be fanned out — and it doesn't go through the relay at all.

An OAuth callback is a **browser** redirect, not a server-to-server call, so
it needs no tunnel. Point the OAuth app's redirect URI at the workspace's
dev-proxy hostname:

```
http://<service>.<repo>.<workspace>.localhost:8767/oauth/callback
```

The browser resolves `.localhost` to loopback on its own and hits the
dev-proxy, which reads the **branch** from the hostname and forwards to that
one workspace. Nothing to configure — the hostname names the branch.

::: tip Requirements
The dev-proxy routes hosts ending in `.localhost` (and in `proxy.domain`, see
below), so register the `.localhost` URL above as an allowed redirect URI in
your OAuth app (most dev/test apps allow it). Each branch is its own host —
there is no single-URL-for-every-branch mode.
:::

## Reach it from another machine

By default the dev-proxy and the webhook relay listen on loopback only, and
service hosts end in `.localhost`. When Pomelo runs on another machine (a Linux
VM, a homelab box) you can open its workspaces from your laptop's browser
through a reverse proxy that terminates TLS, with no SSH tunnel:
`https://web.web.proj-101.dev.example.net`.

Seven machine settings, under `proxy` in `~/.config/pomelo/settings.json`,
control this. Set them in **Settings > Dev Services > Remote Access** or with
`pom proxy config`:

| Setting | Default | What it does |
|---|---|---|
| `proxy.bind` | `127.0.0.1` | Another address the proxy and relay listen on. Loopback stays bound too, so `pom` and services on the machine keep working. `0.0.0.0` or `::` listens on every address. |
| `proxy.domain` | `localhost` | Service hosts become `<service>.<repo>.<workspace>.<domain>`. `.localhost` hosts keep routing. |
| `proxy.public_scheme` | `http` | The scheme in service URLs. Use `https` when the reverse proxy terminates TLS. |
| `proxy.public_port` | `0` (the proxy's port) | The port in service URLs. 443 with https (or 80 with http) leaves the port out. |
| `proxy.trusted_proxies` | `[]` | Addresses or CIDR ranges whose `X-Forwarded-Proto` and `X-Forwarded-Host` the proxy believes. |
| `proxy.token_env` | `POM_PROXY_TOKEN` | The environment variable holding the token other machines present. The token itself is never stored in settings. |
| `proxy.allow_unauthenticated` | `false` | Serve a non-loopback `bind` with no token. |

```bash
pom proxy config                                   # show them (-o json for scripts)
pom proxy config set bind 100.64.0.10              # the VM's Tailscale or LAN address
pom proxy config set domain dev.example.net
pom proxy config set public_scheme https
pom proxy config set public_port 443
pom proxy config set trusted_proxies 127.0.0.1     # where the reverse proxy connects from
pom proxy config reset bind                        # back to the default
pom proxy token new                                # the token other machines present
```

With those settings, `{{web.web.url}}` resolves to
`https://web.web.proj-101.dev.example.net` and `{{web.web.ws}}` to
`wss://web.web.proj-101.dev.example.net`; with `public_port 8443` they keep
`:8443`. When the domain, scheme or port changes, Pomelo rewrites every
workspace's env files and lists the running services that still use the old
URLs. Restart those services. A new `bind` or `trusted_proxies` takes effect
when the proxy restarts: the app restarts its own; stop `pom proxy` and run it
again.

### The proxy token

When `bind` is not loopback, other machines must present a token, and the
proxy and the relay refuse to start without one:

```text
dev proxy: refusing to listen on 100.64.0.10: other machines could open every workspace with no token. ...
```

`pom proxy token new` makes a random token and keeps it encrypted in pom's
secrets; `pom proxy token` shows it and `pom proxy token rm` removes it. To
manage it yourself, put it in `POM_PROXY_TOKEN` (or the variable
`proxy.token_env` names) where the app or `pom proxy` starts; the variable wins
over the kept token. A token is at least 16 characters of letters, digits,
`-`, `_`, `.` and `~`. Restart the proxy after changing it.

Requests from the machine itself (loopback, or one of its own addresses) need
no token, so `pom`, services and a reverse proxy on the same machine work as
before. From anywhere else:

- **A browser** opens a link once with the token added:
  `https://web.web.proj-101.dev.example.net/?pom_token=<token>`. The proxy
  answers with a redirect to the same page without it and sets an HttpOnly
  `pom_token` cookie for the whole `proxy.domain` (`Secure` under https,
  `SameSite=Lax`, 30 days), so every service host opens after that.
- **A script** sends the `X-Pom-Token: <token>` header.
- **A webhook provider** posting to the relay gets the token in the URL it
  is given: `https://hooks.dev.example.net/api/server/stripe?pom_token=<token>`.
  `/_pom/github` needs no token: it checks GitHub's signature instead.

The token is taken out of the header, cookie and query before a request goes
on, so services and the Dev Requests tab never see it.

`pom proxy config set allow_unauthenticated true` serves a non-loopback bind
with no token. Anyone who can reach the address then opens every workspace's
services, including admin pages and APIs, so use it only on a network you
trust. `pom doctor` and the app's doctor report a bind that will not start,
and warn while the flag is on with no token.

### Requests the proxy refuses

- **Other host names.** The proxy answers only `*.localhost`, hosts under
  `proxy.domain`, loopback addresses and the bind address. A request for any
  other name gets `421`, so a web page whose own name resolves to your
  machine (DNS rebinding) cannot read your workspaces.
- **Web pages calling pom.** Paths under `/_pom/` belong to pom and never
  reach a service. They, and every request to the relay, refuse a request
  another web page makes (`Sec-Fetch-Site: cross-site` or `same-site`, or an
  `Origin` other than the request's own host) with `403`. `pom proxy fault`
  and webhook providers send neither, so they work as before.

Requests to your services are not checked beyond the host name: their own
CSRF protection applies as it would in production.

### Forwarded headers

Every request the proxy forwards carries `X-Forwarded-Host` (the host the
browser asked for) and `X-Forwarded-Proto`, so a backend builds correct
redirects and absolute URLs. The proxy believes the values that come in only
from an address in `trusted_proxies`. From anyone else it replaces them with
the request's own `Host` and `http`, so a client cannot claim https or another
host. `X-Forwarded-For` gets the client address appended, as before.

### Cookies

With `proxy.domain` left at `localhost`, nothing changes: `Secure` is dropped
(the proxy is plain http) and a deployed backend's cookie loses its `Domain`.
With a real domain, a `Set-Cookie` from a workspace service is changed only
where the browser would otherwise reject it:

- `Domain` stays when it covers the public host (`Domain=.dev.example.net` on
  `web.web.proj-101.dev.example.net`); any other `Domain` is removed, so the
  cookie lands on the host itself.
- `Secure` stays when `public_scheme` is `https`, and goes under plain http.
- `SameSite` is left as it is (except a deployed backend's `SameSite=None`
  under plain http, which becomes `Lax` as before).
- Paths under `/_pom_dev/<repo>/<service>` are rewritten as before.

A request that still uses a `.localhost` host gets the localhost rewrite.

### Sample Caddyfile

On the VM, with the proxy bound to loopback (or to a private address) on its
default port 8767, Caddy serves a wildcard certificate for
`*.dev.example.net` and forwards every request to the proxy. Point
`*.dev.example.net` at the VM in DNS (or in your Tailscale or LAN DNS).

```text
*.dev.example.net {
	# A wildcard certificate needs the DNS-01 challenge: build Caddy with your
	# DNS provider's module, or use `tls internal` for Caddy's own CA and trust
	# its root on your laptop.
	tls {
		dns <provider> {env.DNS_API_TOKEN}
	}

	reverse_proxy 127.0.0.1:8767 {
		header_up X-Forwarded-Proto https
	}
}
```

Then, on the VM:

```bash
pom proxy config set domain dev.example.net
pom proxy config set public_scheme https
pom proxy config set public_port 443
pom proxy config set trusted_proxies 127.0.0.1
```

Caddy keeps the `Host` header and sets `X-Forwarded-Host` itself. If Caddy runs
on another machine, bind the proxy to the VM's private address, have
`reverse_proxy` point there, and trust Caddy's address instead of `127.0.0.1`.

### Route GitHub webhooks to the relay

[Sync on push](./workspace#sync-on-push) needs GitHub to reach the webhook
relay (port 8766), not the proxy. Give the relay its own name,
`hooks.dev.example.net`, which the wildcard certificate already covers. A site
block for an exact name wins over the wildcard one:

```text
hooks.dev.example.net {
	tls {
		dns <provider> {env.DNS_API_TOKEN}
	}

	# Only GitHub's endpoint is public; the per-service relay paths stay private.
	handle /_pom/github {
		reverse_proxy 127.0.0.1:8766
	}
	handle {
		respond 404
	}
}
```

`pom github webhook setup` then prints
`https://hooks.dev.example.net/_pom/github`. GitHub's servers must reach that
name over the internet, so a VM only on Tailscale or a LAN needs a public way
in for that one path: a Caddy on a public host, Tailscale Funnel, or a tunnel
such as `cloudflared tunnel --url http://127.0.0.1:8766`. Every delivery is
checked against the project's webhook secret before anything happens, and an
unsigned or wrongly signed one gets `401`.
