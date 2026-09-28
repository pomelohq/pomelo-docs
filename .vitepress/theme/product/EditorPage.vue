<script setup>
import AppWindow from '../app/AppWindow.vue'
import CodeView from '../app/CodeView.vue'
import ContextMenu from '../app/ContextMenu.vue'
import DiffView from '../app/DiffView.vue'
import Frame from '../app/Frame.vue'
import GitPanel from '../app/GitPanel.vue'
import TabBar from '../app/TabBar.vue'
import TerminalView from '../app/TerminalView.vue'
import WorkspacesList from '../app/WorkspacesList.vue'
import Step from './Step.vue'
import './product.css'

const code = `import { useState } from "react"
import { signIn } from "../api/session"

export function Login() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const result = await signIn(email)
    if (result.status === 429) setError("Too many attempts, try again in a minute")
  }`
const editorMenu = [
  { text: 'Go to Definition', keys: 'f12' }, { text: 'Go to Declaration', keys: 'ctrl-f12' },
  { text: 'Go to Type Definition', keys: 'cmd-f12' }, { text: 'Go to Implementation', keys: 'shift-f12' }, '-',
  { text: 'Cut', keys: 'cmd-x' }, { text: 'Copy', keys: 'cmd-c' }, { text: 'Copy and Trim' }, { text: 'Paste', keys: 'cmd-v' }, '-',
  { text: 'Reveal in Finder', keys: 'alt-cmd-r' }, { text: 'Open in Terminal' },
]
const terminalMenu = [
  { text: 'Copy', keys: 'cmd-c' }, { text: 'Paste', keys: 'cmd-v' }, { text: 'Select All', keys: 'cmd-a' },
  { text: 'Clear', keys: 'cmd-k' }, '-',
  { text: 'Add Selection to Agent', icon: 'sparkle' }, { text: 'Ask Agent about Selection', icon: 'help_circle' }, '-',
  { text: 'Close Terminal Tab' },
]
const terminal = [
  [['web', 6], [' % ', 'fg'], ['pnpm test', 'fg']],
  [[' RUN ', 'dim'], [' v2.1.4 /workspace/web', 'dim']],
  [[' x ', 1], ['src/pages/Login.test.tsx > shows the throttle message', 'fg']],
  [['   AssertionError: expected "Too many attempts" to be in the document', 1]],
  [[' Test Files ', 'dim'], [' 1 failed', 1], [' | 11 passed', 2]],
  [['web', 6], [' % ', 'fg']],
]
const rows = [
  { name: 'main', agent: 'idle' },
  { name: 'Login page', branch: 'feat-login', current: true, agent: 'idle', running: 2, pr: { count: 1, tone: 'ok' } },
  { name: 'Checkout flow', ticket: 'PROJ-101', status: ['In Review', 'accent'], agent: 'input', pr: { count: 1, tone: 'danger', trouble: 'failed' }, trouble: ['CI failed', 'error'] },
  { name: 'Invoice export', ticket: 'PROJ-97', status: ['Done', 'done'], agent: 'idle', pr: { count: 1, tone: 'merged' } },
]
</script>

<template>
  <div class="pp">
    <section class="pp-hero pp-wrap">
      <div class="pp-eyebrow">Editor</div>
      <h1>The editor, the terminal<br>and git, for every repo at once.</h1>
      <p class="pp-lead">A native, GPU-drawn editor with language servers, split panes and diffs, next to real shells
        and a Git panel that commits across all of the branch's repos in one go.</p>
      <div class="pp-hero-window">
        <Frame :width="1440" :height="820" window>
          <AppWindow active="git" :sidebar="248" :dock="340" :bottom="180" language="Ruby" cursor="11:23">
            <template #sidebar><WorkspacesList :rows="rows" /></template>
            <template #dock><GitPanel /></template>
            <TabBar nav :tabs="[
              { title: 'Login.tsx', icon: 'file-react' },
              { title: 'Branch diff', icon: 'diff_split', active: true },
            ]" :buttons="['diff_unified', 'diff_split', 'panel_right', 'panel_bottom', 'maximize']" />
            <DiffView />
            <template #bottom>
              <TabBar :tabs="[{ title: 'web - zsh', icon: 'terminal', active: true }]" :buttons="['plus', 'panel_right', 'panel_bottom', 'maximize']" />
              <TerminalView :lines="terminal" />
            </template>
          </AppWindow>
        </Frame>
      </div>
    </section>

    <section id="editor" class="pp-section">
      <div class="pp-wrap">
        <h2>Code editor</h2>
        <p class="pp-sub">Tree-sitter highlighting, the language servers on your PATH, multiple cursors, project search
          and split panes. Main stays read-only: changes happen in branch workspaces.</p>
        <div class="pp-steps">
          <Step n="01" title="Everything a right-click away" link="/docs/app#editor" more="The editor">
            <template #text>Go to definition, type definition and implementation, reveal the file in Finder or open a
              terminal there. Every item shows its key.</template>
            <div class="pp-stage pp-overlay">
              <div style="width: 100%"><Frame :width="680" :height="360" window>
                <div class="col" style="height: 100%">
                  <TabBar :tabs="[{ title: 'Login.tsx', icon: 'file-react', active: true }]" :buttons="['eye', 'panel_right', 'maximize']" />
                  <CodeView :code="code" language="ts" :active="10" :caret="10" />
                </div>
                <div style="position: absolute; left: 300px; top: 70px"><ContextMenu :items="editorMenu" :width="260" /></div>
              </Frame></div>
            </div>
          </Step>
        </div>
      </div>
    </section>

    <section id="git" class="pp-section">
      <div class="pp-wrap">
        <h2>Git, across every repo</h2>
        <p class="pp-sub">The branch's changes in every repo, in one list. Stage, then one message makes one commit
          per repo. Push, pull and the pull request's checks sit on the Remote tab.</p>
        <div class="pp-grid">
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%; max-width: 360px"><Frame :width="360" :height="470" window><GitPanel /></Frame></div></div>
            <div class="pp-card-text"><h3>Stage and commit together</h3>
              <p>Click a file to stage or unstage it; the footer says how many commits it will make.</p></div>
          </div>
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%"><Frame :width="720" :height="470" window><DiffView /></Frame></div></div>
            <div class="pp-card-text"><h3>Unified or split</h3>
              <p>The whole branch diff with every hunk open. Switch between unified and side-by-side with the two
                buttons; the choice is kept for every diff.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section id="terminal" class="pp-section">
      <div class="pp-wrap">
        <h2>Terminal</h2>
        <p class="pp-sub">Real shells in the workspace, in panes with tabs. Each one runs in a holder that keeps going
          when the app restarts, and reattaches.</p>
        <div class="pp-steps">
          <Step n="01" title="Hand output to the agent" link="/docs/agents#asking-from-anywhere" more="Asking from anywhere">
            <template #text>Select a failing test's output and right-click: <b>Add Selection to Agent</b> puts it in the
              main agent's prompt, <b>Ask Agent about Selection</b> starts a side agent on it.</template>
            <div class="pp-stage">
              <div style="width: 100%"><Frame :width="680" :height="300" window>
                <div class="col" style="height: 100%">
                  <TabBar :tabs="[{ title: 'web - zsh', icon: 'terminal', active: true }]" :buttons="['plus', 'panel_right', 'maximize']" />
                  <TerminalView :lines="terminal" />
                </div>
                <div style="position: absolute; left: 330px; top: 60px"><ContextMenu :items="terminalMenu" :width="240" /></div>
              </Frame></div>
            </div>
          </Step>
        </div>
      </div>
    </section>

    <section id="tickets" class="pp-section">
      <div class="pp-wrap">
        <h2>Pull requests and Jira</h2>
        <p class="pp-sub">Each workspace shows its pull request's state and its ticket's status. The pull request opens
          in a tab with its checks, reviewers and conversation; the ticket with its description and comments.</p>
        <div class="pp-grid">
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%; max-width: 280px"><Frame :width="280" :height="210" window><WorkspacesList :rows="rows" /></Frame></div></div>
            <div class="pp-card-text"><h3>On every workspace row</h3>
              <p>Checks pending, changes requested, CI failed or a conflict, and the ticket's status, without opening
                anything.</p></div>
          </div>
          <div class="pp-card">
            <div class="pp-stage pp-card-text-only">
              <p class="pp-quote">Straight from GitHub's API and your local worktrees: no <code>gh</code> CLI needed.
                Jira needs a site, an email and an API token in Settings.</p>
            </div>
            <div class="pp-card-text"><h3>Nothing else to install</h3>
              <p><a href="/docs/app#pull-requests">Pull requests</a> and <a href="/docs/workspace#create">tickets</a> in the docs.</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.pp-card-text-only { min-height: 250px; }
.pp-quote { margin: 0; max-width: 40ch; font-size: 16px; line-height: 1.6; color: var(--vp-c-text-1); }
</style>
