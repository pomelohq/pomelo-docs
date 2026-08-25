import { defineConfig } from 'vitepress'

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
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
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
      { text: 'Docs', link: '/docs/install' },
      { text: 'Reference', link: '/reference/config' },
      { text: 'Changelog', link: '/docs/changelog' },
      { text: 'Download', link: 'https://github.com/pomelohq/pomelo/releases/latest' }
    ],

    sidebar: sidebarGroups(),

    search: { provider: 'local' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pomelohq/pomelo' }
    ],

    footer: {
      copyright: '© 2026 Pomelo · AGPL-3.0'
    }
  }
})
