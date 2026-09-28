import { defineConfig } from 'vitepress'
import icons from './theme/app/icons.js'

const product = (icon: string, title: string, line: string, link: string) => ({
  text: `<span class="pm-item"><span class="pm-icon">${icons[icon]}</span><span class="pm-text"><b>${title}</b><small>${line}</small></span></span>`,
  link,
})
const PRODUCT = [
  {
    text: 'Dev environment',
    items: [
      product('branch', 'Workspaces per branch', 'Own worktrees, ports and databases', '/product/environments#workspaces'),
      product('server', 'Services', 'What runs, what broke, and the fix', '/product/environments#services'),
      product('cylinder', 'Databases', 'Browse tables, run SQL per branch', '/product/environments#databases'),
      product('monitor', 'Dev proxy and webhooks', 'One origin, events to every branch', '/product/environments#network'),
    ],
  },
  {
    text: 'Agents',
    items: [
      product('sparkle', 'Main and side agents', 'Ask, review or fix next to the main one', '/product/agents#side-agents'),
      product('square_dot', 'Agent status', 'What each workspace\'s agent is doing', '/product/agents#status'),
      product('clock', 'Usage and limits', 'Plan limits and cost by day', '/product/agents#usage'),
      product('wrench', 'Project setup', 'An agent writes pom.yml, Pomelo checks it boots', '/product/agents#setup'),
    ],
  },
  {
    text: 'Editor',
    items: [
      product('file', 'Code editor', 'Tree-sitter, language servers, splits', '/product/editor#editor'),
      product('file_git', 'Git', 'Stage, commit and push every repo at once', '/product/editor#git'),
      product('terminal', 'Terminal', 'Shells that survive a restart', '/product/editor#terminal'),
      product('pull_request', 'Pull requests and Jira', 'Checks, reviews and tickets in tabs', '/product/editor#tickets'),
    ],
  },
]

// One unified sidebar for both /docs/ and /reference/ — flat, practical-first.
const GROUPS = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Install', link: '/docs/install' },
      { text: 'Quick Start', link: '/docs/quickstart' },
      { text: 'Concepts', link: '/docs/concepts' },
    ],
  },
  {
    text: 'Using Pomelo',
    items: [
      { text: 'The app', link: '/docs/app' },
      { text: 'Workspaces', link: '/docs/workspace' },
      { text: 'Project config', link: '/docs/project-config' },
      { text: 'Agents', link: '/docs/agents' },
      { text: 'Agent status', link: '/docs/agent-status' },
      { text: 'Services', link: '/docs/services' },
      { text: 'Databases', link: '/docs/databases' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'pom.yml', link: '/reference/config' },
      { text: 'Templates', link: '/reference/templates' },
    ],
  },
  {
    text: 'More',
    items: [
      { text: 'Architecture', link: '/docs/architecture' },
      { text: 'Network', link: '/docs/network' },
      { text: 'Keyboard shortcuts', link: '/docs/shortcuts' },
      { text: 'FAQ & troubleshooting', link: '/docs/faq' },
      { text: 'Changelog', link: '/docs/changelog' },
    ],
  },
]
const sidebarGroups = () => ({ '/docs/': GROUPS, '/reference/': GROUPS })

export default defineConfig({
  title: 'Pomelo',
  description: 'A native macOS app that runs a full, isolated dev environment per branch',
  // Served at the root of the custom domain pomelohq.app (see public/CNAME),
  // so base is '/'. (Was '/pomelo-docs/' when hosted under github.io project path.)
  base: '/',
  cleanUrls: true,
  appearance: 'dark',
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap' }],
  ],

  // Pomelo docs are full of `{{var:NAME}}` / `{{db:name}}` templates. Inside
  // code, Vue's template tokenizer still scans `{{ }}` (even under v-pre)
  // and errors on the `:` (reads it as a TS annotation). Rather than change
  // Vue's delimiters globally — which breaks the default theme's own
  // `{{ }}` — we entity-encode the braces in rendered code so the tokenizer
  // never sees them; the browser decodes them back to literal `{{ }}`.
  markdown: {
    config: (md) => {
      const enc = (html: string) =>
        html.replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;')
      for (const rule of ['fence', 'code_inline'] as const) {
        const orig = md.renderer.rules[rule]!
        md.renderer.rules[rule] = (...args) => enc(orig(...args))
      }
    },
  },

  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Product', items: PRODUCT },
      { text: 'Docs', link: '/docs/install' },
      { text: 'Changelog', link: '/docs/changelog' },
      { text: 'GitHub', link: 'https://github.com/pomelohq/pomelo' },
      { text: 'Download', link: 'https://github.com/pomelohq/pomelo/releases/latest' }
    ],

    sidebar: sidebarGroups(),

    search: { provider: 'local' },

    footer: {
      copyright: '© 2026 Pomelo · AGPL-3.0'
    }
  }
})
