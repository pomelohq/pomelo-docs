// Mirror the canonical CHANGELOG.md from the pomelo repo into docs/changelog.md
// at build time — one source of truth, rendered on the docs site. (#N) is
// linkified to the PR; a stub links back to GitHub if the fetch fails offline.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const REPO = 'https://github.com/pomelohq/pomelo'
const RAW = 'https://raw.githubusercontent.com/pomelohq/pomelo/main/CHANGELOG.md'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'changelog.md')
const NOTE = `> Mirrored from the [\`pomelo\`](${REPO}/blob/main/CHANGELOG.md) repo. Download builds on [GitHub Releases](${REPO}/releases).\n\n`

try {
  const res = await fetch(RAW)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  let md = await res.text()
  md = md.replace(/\(#(\d+)\)/g, `([#$1](${REPO}/pull/$1))`)
  md = md.replace(/\n## \[/, `\n${NOTE}## [`)
  await writeFile(OUT, md)
  console.log('changelog synced from', RAW)
} catch (e) {
  console.warn('changelog fetch failed:', e.message)
  await writeFile(OUT, `# Changelog\n\n${NOTE}See the [full changelog](${REPO}/blob/main/CHANGELOG.md) and [releases](${REPO}/releases).\n`)
}
