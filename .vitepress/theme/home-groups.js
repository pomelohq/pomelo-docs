import { h } from 'vue'
import AgentPopover from './app/AgentPopover.vue'
import ContextMenu from './app/ContextMenu.vue'
import DatabasePanel from './app/DatabasePanel.vue'
import DiffView from './app/DiffView.vue'
import Frame from './app/Frame.vue'
import GitPanel from './app/GitPanel.vue'
import Onboarding from './app/Onboarding.vue'
import ProxyUrls from './app/ProxyUrls.vue'
import ServicesPanel from './app/ServicesPanel.vue'
import TableView from './app/TableView.vue'
import TerminalView from './app/TerminalView.vue'
import UsageCard from './app/UsageCard.vue'
import WorkspaceCreate from './app/WorkspaceCreate.vue'
import WorkspacesList from './app/WorkspacesList.vue'

// A card's picture: an app fragment at its real size, scaled into the card and faded at the bottom.
const shot = (width, height, render, { window = true, fade = false, max } = {}) => ({
  render: () => h('div', { style: { maxWidth: (max || width) + 'px', margin: '0 auto' } },
    h(Frame, { width, height, window, fade, bare: !window }, { default: render })),
})
const statusRows = [
  { name: 'main', agent: 'idle' },
  { name: 'Login page', branch: 'feat-login', current: true, agent: 'thinking', running: 2 },
  { name: 'Checkout flow', ticket: 'PROJ-101', status: ['In Review', 'accent'], agent: 'input', running: 3 },
  { name: 'Search filters', ticket: 'PROJ-104', status: ['In Progress', 'accent'], agent: 'tools', running: 1 },
  { name: 'Invoice export', ticket: 'PROJ-97', status: ['Done', 'done'], agent: 'compacting' },
]
const prRows = [
  { name: 'main', agent: 'idle' },
  { name: 'Login page', branch: 'feat-login', current: true, agent: 'idle', running: 2, pr: { count: 1, tone: 'warn' }, trouble: ['Checks pending', 'warning'] },
  { name: 'Checkout flow', ticket: 'PROJ-101', status: ['In Review', 'accent'], agent: 'input', pr: { count: 1, tone: 'danger', trouble: 'failed' }, trouble: ['CI failed', 'error'] },
  { name: 'Invoice export', ticket: 'PROJ-97', status: ['Done', 'done'], agent: 'idle', pr: { count: 1, tone: 'merged' } },
]
const testOutput = [
  [['web', 6], [' % ', 'fg'], ['pnpm test', 'fg']],
  [[' x ', 1], ['src/pages/Login.test.tsx > shows the throttle message', 'fg']],
  [['   AssertionError: expected "Too many attempts"', 1]],
  [[' Test Files ', 'dim'], [' 1 failed', 1], [' | 11 passed', 2]],
  [['web', 6], [' % ', 'fg']],
]
const terminalMenu = [
  { text: 'Copy', keys: 'cmd-c' }, { text: 'Paste', keys: 'cmd-v' }, '-',
  { text: 'Add Selection to Agent', icon: 'sparkle' }, { text: 'Ask Agent about Selection', icon: 'help_circle' },
]

export const groups = [
  {
    id: 'environments',
    eyebrow: 'Dev environment',
    title: 'Pomelo runs the whole project.',
    sub: 'Point it at your repos once. Every branch after that comes up with its own worktrees, ports, databases and running services.',
    link: '/product/environments',
    cards: [
      { title: 'Workspaces per branch', link: '/product/environments#workspaces',
        body: 'Create one from a branch or a ticket. Worktrees, shared services, env, setup and seeds, each stage shown as it runs.',
        visual: shot(280, 250, () => h(WorkspaceCreate, { stage: 5 }), { window: false }) },
      { title: 'Services at a glance', link: '/product/environments#services',
        body: 'What runs, what crashed and why, with a new port, the logs or a fix one click away.',
        visual: shot(330, 460, () => h(ServicesPanel)) },
      { title: 'Databases per branch', link: '/product/environments#databases',
        body: 'Tables, Redis keyspaces and buckets in one tree, data grids and SQL consoles, with nothing to wire up.',
        visual: shot(300, 420, () => h(DatabasePanel)) },
      { title: 'One origin per workspace', link: '/product/environments#network',
        body: 'Every workspace gets its own URLs through the dev proxy, so cookies and CORS behave like production.',
        visual: shot(700, 150, () => h(ProxyUrls), { fade: false }) },
    ],
  },
  {
    id: 'agents',
    eyebrow: 'Agents',
    title: 'Agents that see the real stack.',
    sub: 'A main agent per workspace, side agents for questions, reviews and fixes, and the plan limits in view. Your AI CLI runs in a real terminal with Pomelo\'s tools.',
    link: '/product/agents',
    cards: [
      { title: 'Side agents', link: '/product/agents#side-agents',
        body: 'Ask, review, get a second opinion or fix, starting from a fork, a compacted fork or a fresh packet.',
        visual: shot(380, 440, () => h(AgentPopover), { window: false }) },
      { title: 'Status on every workspace', link: '/product/agents#status',
        body: 'Thinking, using tools, compacting or waiting for you, with a notification when it changes.',
        visual: shot(280, 250, () => h(WorkspacesList, { rows: statusRows })) },
      { title: 'Usage and plan limits', link: '/product/agents#usage',
        body: 'The 5-hour and weekly limits in the title bar, and cost by day from the agents\' own transcripts.',
        visual: shot(300, 230, () => h(UsageCard), { window: false, fade: false }) },
      { title: 'Project setup', link: '/product/agents#setup',
        body: 'An agent CLI writes pom.yml from what Pomelo detected; Pomelo checks every service boots.',
        visual: shot(720, 520, () => h(Onboarding)) },
    ],
  },
  {
    id: 'editor',
    eyebrow: 'Editor',
    title: 'The editor you need, next to it all.',
    sub: 'Language servers, split panes, diffs, real terminals and a Git panel that works across every repo of the branch.',
    link: '/product/editor',
    cards: [
      { title: 'Git across every repo', link: '/product/editor#git',
        body: 'Stage in any repo, then one message makes one commit per repo. Push, pull and checks on the Remote tab.',
        visual: shot(360, 470, () => h(GitPanel)) },
      { title: 'Unified or split diffs', link: '/product/editor#git',
        body: 'The whole branch diff with every hunk open, side by side when there is room.',
        visual: shot(720, 360, () => h(DiffView)) },
      { title: 'Terminals that hand off', link: '/product/editor#terminal',
        body: 'Shells that survive a restart, and a right-click that sends the selection to the agent.',
        visual: shot(560, 260, () => h('div', { class: 'col', style: { height: '100%', position: 'relative' } }, [
          h(TerminalView, { lines: testOutput, size: 13 }),
          h('div', { style: { position: 'absolute', right: '24px', top: '44px' } }, h(ContextMenu, { items: terminalMenu, width: 230 })),
        ])) },
      { title: 'Pull requests and Jira', link: '/product/editor#tickets',
        body: 'Each workspace shows its pull request\'s checks and its ticket\'s status; both open in tabs.',
        visual: shot(280, 250, () => h(WorkspacesList, { rows: prRows })) },
    ],
  },
]
