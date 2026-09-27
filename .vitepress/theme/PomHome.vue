<script setup>
import { ref, onMounted } from 'vue'

const GH = 'https://github.com/pomelohq/pomelo'
const RELEASES = `${GH}/releases`

// Read live so the button fetches the DMG in one click and never goes stale;
// the releases page is the offline fallback.
const version = ref('')
const DL = ref(`${RELEASES}/latest`)
onMounted(async () => {
  try {
    const r = await fetch('https://api.github.com/repos/pomelohq/pomelo/releases/latest')
    const j = await r.json()
    if (j.tag_name) version.value = String(j.tag_name).replace(/^v/, '')
    const dmg = (j.assets || []).find(a => a.name && a.name.endsWith('.dmg'))
    if (dmg?.browser_download_url) DL.value = dmg.browser_download_url
  } catch { /* keep fallbacks */ }
})

const values = [
  {
    title: 'One branch, one running stack',
    body: 'Every branch is its own git worktree with its own services, conflict-free ports and databases. Ten branches run side by side and never collide.',
  },
  {
    title: 'Native and fast',
    body: 'Written in Rust with a GPU-rendered UI. Services run natively on PTY holders that survive a restart; Docker is only for shared data like Postgres and Redis.',
  },
  {
    title: 'Agent-ready',
    body: 'Claude Code, or any AI CLI, runs in a terminal inside the workspace with pom\'s MCP tools, and each workspace keeps its own agent state.',
  },
]

const features = [
  {
    title: 'Workspaces per branch',
    body: 'Create a workspace from a branch or a ticket. Pomelo checks out the worktrees, starts shared services, runs setup and seeds databases, with each step shown as it goes.',
    img: '/shots/workspace-create.png',
    alt: 'A workspace being created, with its setup stages, next to the WORKSPACES list',
    link: '/docs/workspace',
  },
  {
    title: 'Services and their environment',
    body: 'Start, stop and reattach to every service from the Services panel. See each service\'s resolved env per branch and where each value comes from.',
    img: '/shots/service-env.png',
    alt: 'The resolved environment of the web service on the feat-login branch',
    link: '/docs/services',
  },
  {
    title: 'Database browser',
    body: 'Open a branch database as a data grid with filters, sorting and CSV export, or run SQL in a console saved with the project. Redis keyspaces sit in the same tree.',
    img: '/shots/database-table.png',
    alt: 'The users table of a branch database in a data grid',
    link: '/docs/databases',
  },
  {
    title: 'Git and pull requests',
    body: 'Stage, commit and publish from the Git panel. The pull request for a branch opens in a tab with its reviewers, checks and conversation.',
    img: '/shots/pull-request.png',
    alt: 'A pull request tab with reviewers, labels and description',
    link: '/docs/app#pull-requests',
  },
  {
    title: 'Jira tickets',
    body: 'Pick a ticket when you create a workspace and the branch is named after it. The ticket opens in a tab and its status shows in the sidebar.',
    img: '/shots/jira-ticket.png',
    alt: 'A Jira ticket tab with description, acceptance criteria and comments',
    link: '/docs/workspace#create',
  },
  {
    title: 'Project config',
    body: 'Add or remove repos from Settings, edit pom.yml, and every save is checked before it applies.',
    img: '/shots/project-settings.png',
    alt: 'The Project settings page with repositories and config actions',
    link: '/docs/project-config',
  },
]

const ai = [
  { title: 'Next to the code', body: 'The agent button opens your AI CLI in the workspace, rooted at its worktrees. It keeps running when you close the tab or quit the app.' },
  { title: 'Status on every workspace', body: 'The sidebar shows what each workspace\'s agent is doing: thinking, using tools, idle or awaiting your input, with a notification when it changes.' },
  { title: 'Tools for the real stack', body: 'pom\'s MCP server gives the agent the workspace\'s services, ports, logs and databases, and lets it start services and run queries.' },
  { title: 'Fix with Claude, Set up with AI', body: 'When the config doctor finds a problem, Fix with Claude opens an agent on it. A new project can be set up with AI from its repos.' },
]

const care = [
  ['Tabs and splits', 'drag a tab to split the center into panes'],
  ['Tree-sitter highlighting', 'with folding and an outline (cmd-shift-o)'],
  ['Language servers', 'rust-analyzer, gopls, clangd, TypeScript, Python'],
  ['Project search', 'cmd-shift-f in the workspace, cmd-p for files'],
  ['Markdown preview', 'side by side with the editor'],
  ['Inline git blame and diff hunks', 'right in the editor'],
  ['Same-origin dev proxy', 'one origin per workspace, so no CORS fights'],
  ['Webhook fan-out', 'each webhook reaches every workspace running the service'],
  ['Config bundles', 'share pom.yml, optionally sealed with secrets'],
  ['Encrypted secrets', 'per project, referenced by name in pom.yml'],
  ['Command palette', 'every command, with its key'],
  ['Verified self-updates', 'each update\'s signature is checked first'],
]

const footer = [
  {
    title: 'Get started',
    links: [
      ['Install', '/docs/install'],
      ['Quick Start', '/docs/quickstart'],
      ['Concepts', '/docs/concepts'],
      ['The app', '/docs/app'],
    ],
  },
  {
    title: 'Docs',
    links: [
      ['Workspaces', '/docs/workspace'],
      ['Services', '/docs/services'],
      ['Databases', '/docs/databases'],
      ['Agent status', '/docs/agent-status'],
      ['pom.yml reference', '/reference/config'],
    ],
  },
  {
    title: 'Project',
    links: [
      ['GitHub', GH],
      ['Releases', RELEASES],
      ['Changelog', '/docs/changelog'],
      ['License: AGPL-3.0', `${GH}/blob/main/LICENSE`],
    ],
  },
]
</script>

<template>
<div class="ph">
  <section class="wrap hero">
    <img class="hero-icon" src="/hero-icon.png" alt="" />
    <h1>Every branch gets<br>its own running stack.</h1>
    <p class="lead">Pomelo is a native macOS app that gives each branch its own worktree,
      services and databases, with the editor, terminals and your AI agent right next to them.</p>
    <div class="actions">
      <a class="btn primary" :href="DL">Download now</a>
      <a class="btn ghost" :href="GH">View source</a>
    </div>
    <p class="meta">Available for macOS 14+ on Apple Silicon<span v-if="version"> - v{{ version }}</span></p>
    <img class="shot hero-shot" src="/shots/main-window.png"
      alt="The Pomelo window: workspaces on the left, the Files panel, the editor and a terminal" />
  </section>

  <section class="wrap sec">
    <div class="values">
      <div v-for="v in values" :key="v.title" class="value">
        <h3>{{ v.title }}</h3>
        <p>{{ v.body }}</p>
      </div>
    </div>
  </section>

  <section class="wrap sec">
    <div class="head">
      <h2>Pomelo runs the whole project.</h2>
      <p class="sub">Point it at your repos once. Every branch after that comes up ready to run.</p>
    </div>
    <div class="cards">
      <article v-for="f in features" :key="f.title" class="card">
        <div class="card-media"><img :src="f.img" :alt="f.alt" loading="lazy" /></div>
        <div class="card-text">
          <h3>{{ f.title }}</h3>
          <p>{{ f.body }}</p>
          <a class="more" :href="f.link">Learn more &gt;</a>
        </div>
      </article>
    </div>
  </section>

  <section class="wrap sec">
    <div class="split">
      <div>
        <h2>An agent that works the way you work.</h2>
        <p class="sub">No chat window bolted on. Your AI CLI runs in a real terminal in the
          workspace and sees the same stack you do.</p>
        <div class="ai-list">
          <div v-for="a in ai" :key="a.title" class="ai-item">
            <h3>{{ a.title }}</h3>
            <p>{{ a.body }}</p>
          </div>
        </div>
        <div class="actions">
          <a class="btn ghost" href="/docs/agent-status">Agent status</a>
          <a class="btn ghost" href="/docs/quickstart">Quick Start</a>
        </div>
      </div>
      <img class="shot" src="/shots/agent-settings.png" loading="lazy"
        alt="Agent settings: the agent command, the pom MCP server and activity hooks" />
    </div>
  </section>

  <section class="wrap sec">
    <div class="head">
      <h2>Built with care.</h2>
      <p class="sub">The small things you reach for every day.</p>
    </div>
    <ul class="care">
      <li v-for="[name, detail] in care" :key="name"><b>{{ name }}</b><span>{{ detail }}</span></li>
    </ul>
  </section>

  <section class="wrap sec">
    <div class="cta">
      <h2>Daily drive Pomelo.</h2>
      <p class="sub">Free and open source. No account, nothing to sign up for.</p>
      <div class="actions center">
        <a class="btn primary" :href="DL">Download now</a>
        <a class="btn ghost" :href="GH">View source</a>
      </div>
      <p class="meta">Available for macOS 14+ on Apple Silicon</p>
    </div>
  </section>

  <footer class="wrap foot">
    <div class="foot-brand">
      <img src="/logo.png" alt="" />
      <span>Pomelo</span>
    </div>
    <div class="foot-cols">
      <div v-for="col in footer" :key="col.title">
        <h4>{{ col.title }}</h4>
        <a v-for="[label, href] in col.links" :key="label" :href="href">{{ label }}</a>
      </div>
    </div>
  </footer>
</div>
</template>

<style scoped>
.ph { width: 100vw; margin-left: calc(50% - 50vw); }
.wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
@media (max-width: 640px) { .wrap { padding: 0 16px; } }

h1, h2, h3, h4 { border: 0; padding: 0; margin: 0; color: var(--vp-c-text-1); }
h1 { font-size: clamp(2.4rem, 6.4vw, 4.4rem); font-weight: 700; letter-spacing: -0.035em; line-height: 1.04; }
h2 { font-size: clamp(1.8rem, 3.6vw, 2.6rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
h3 { font-size: 16px; font-weight: 600; line-height: 1.35; }
.sub { margin: 14px 0 0; max-width: 60ch; font-size: 16px; line-height: 1.6; color: var(--vp-c-text-2); }

.hero { padding-top: clamp(56px, 9vw, 112px); text-align: center; }
.hero-icon { width: 88px; height: 88px; margin: 0 auto 28px; display: block;
  filter: drop-shadow(0 18px 40px rgba(120, 30, 110, 0.45)); }
.lead { max-width: 58ch; margin: 22px auto 0; font-size: clamp(16px, 1.6vw, 19px); line-height: 1.6; color: var(--vp-c-text-2); }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
.hero .actions, .actions.center { justify-content: center; }
.meta { margin: 16px 0 0; font-size: 13px; color: var(--vp-c-text-3); }

.btn { display: inline-flex; align-items: center; font-size: 15px; font-weight: 600; text-decoration: none;
  padding: 11px 24px; border-radius: 10px; transition: background 0.16s, border-color 0.16s, color 0.16s; }
.btn.primary { background: var(--vp-c-brand-1); color: #fff; }
.dark .btn.primary { color: #1a0f18; }
.btn.primary:hover { background: var(--vp-c-brand-3); }
.btn.ghost { border: 1px solid var(--vp-c-border); color: var(--vp-c-text-1); }
.btn.ghost:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

.shot { display: block; width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--vp-c-border); }
.hero-shot { margin-top: clamp(40px, 6vw, 72px); box-shadow: 0 60px 140px -70px rgba(166, 61, 158, 0.65); }

.sec { padding-top: clamp(72px, 10vw, 136px); }
.head { margin-bottom: 40px; }

.values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.value { border-top: 1px solid var(--vp-c-divider); padding-top: 22px; }
.value h3 { font-size: 18px; }
.value p { margin: 10px 0 0; font-size: 15px; line-height: 1.6; color: var(--vp-c-text-2); }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.card { display: flex; flex-direction: column; border: 1px solid var(--vp-c-divider); border-radius: 16px;
  background: var(--vp-c-bg-alt); overflow: hidden; }
.card-media { aspect-ratio: 16 / 10; overflow: hidden; background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider); }
/* Zoomed to the top-left so the UI text stays legible at card size. */
.card-media img { width: 165%; max-width: none; height: auto; display: block; }
.card-text { display: flex; flex-direction: column; flex: 1; padding: 20px 22px 22px; }
.card-text p { margin: 8px 0 0; flex: 1; font-size: 14.5px; line-height: 1.6; color: var(--vp-c-text-2); }
.more { margin-top: 16px; font-size: 14px; font-weight: 600; color: var(--vp-c-brand-1); text-decoration: none; }
.more:hover { text-decoration: underline; }

.split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.ai-list { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 28px; margin-top: 32px; }
.ai-item p { margin: 6px 0 0; font-size: 14.5px; line-height: 1.6; color: var(--vp-c-text-2); }

.care { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0 32px; border-top: 1px solid var(--vp-c-divider); }
.care li { display: flex; flex-direction: column; gap: 4px; padding: 16px 0; border-bottom: 1px solid var(--vp-c-divider); margin: 0; }
.care b { font-size: 15px; font-weight: 600; color: var(--vp-c-text-1); }
.care span { font-size: 14px; color: var(--vp-c-text-3); }

.cta { text-align: center; padding: clamp(48px, 7vw, 88px) 24px; border: 1px solid var(--vp-c-divider);
  border-radius: 20px; background: radial-gradient(120% 140% at 50% 0%, var(--vp-c-brand-soft), transparent 70%); }
.cta .sub { margin-left: auto; margin-right: auto; }

.foot { margin-top: clamp(72px, 10vw, 128px); padding-top: 40px; padding-bottom: 56px;
  border-top: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
.foot-brand { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--vp-c-text-1); }
.foot-brand img { width: 28px; height: 28px; }
.foot-cols { display: grid; grid-template-columns: repeat(3, minmax(140px, auto)); gap: 32px 56px; }
.foot-cols h4 { font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--vp-c-text-1); }
.foot-cols a { display: block; font-size: 14px; line-height: 2; color: var(--vp-c-text-2); text-decoration: none; }
.foot-cols a:hover { color: var(--vp-c-brand-1); }

@media (max-width: 960px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
  .split { grid-template-columns: 1fr; gap: 40px; }
  .care { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .values, .cards, .ai-list, .care { grid-template-columns: 1fr; }
  .values { gap: 28px; }
  .foot-cols { grid-template-columns: repeat(2, 1fr); gap: 28px; }
}
</style>
