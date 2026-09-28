// Captures the link-preview image: `npm run dev` in one shell, then `node scripts/og-image.mjs [url]`.
// Needs playwright-core and a Chromium (PLAYWRIGHT_CHROMIUM or the playwright cache).
import { chromium } from 'playwright-core'
const url = process.argv[2] || 'http://localhost:5173/og-card'
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await page.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } })
await browser.close()
console.log('wrote public/og.png')
