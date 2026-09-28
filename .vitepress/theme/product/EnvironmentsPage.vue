<script setup>
import AppWindow from '../app/AppWindow.vue'
import DatabasePanel from '../app/DatabasePanel.vue'
import Frame from '../app/Frame.vue'
import ProxyUrls from '../app/ProxyUrls.vue'
import ServicesPanel from '../app/ServicesPanel.vue'
import ServiceTab from '../app/ServiceTab.vue'
import TableView from '../app/TableView.vue'
import TabBar from '../app/TabBar.vue'
import TerminalView from '../app/TerminalView.vue'
import WorkspaceCreate from '../app/WorkspaceCreate.vue'
import WorkspacesList from '../app/WorkspacesList.vue'
import Step from './Step.vue'
import './product.css'

const rows = [
  { name: 'main', agent: 'idle' },
  { name: 'Login page', branch: 'feat-login', current: true, agent: 'thinking', running: 2, pr: { count: 2, tone: 'warn' } },
  { name: 'Checkout flow', ticket: 'PROJ-101', status: ['In Review', 'accent'], agent: 'input', running: 3 },
]
const terminal = [
  [['api', 6], [' % ', 'fg'], ['git status --short && git log --oneline -2', 'fg']],
  [[' M ', 1], ['app/controllers/sessions_controller.rb', 'fg']],
  [['83ddadb ', 3], ['(', 'fg'], ['HEAD -> feat-login', 2], [') Throttle repeated sign-in attempts', 'fg']],
  [['4066b02 ', 3], ['(', 'fg'], ['origin/main', 1], [', main) Initial commit', 'fg']],
  [['api', 6], [' % ', 'fg']],
]
</script>

<template>
  <div class="pp">
    <section class="pp-hero pp-wrap">
      <div class="pp-eyebrow">Dev environment</div>
      <h1>Every branch comes up<br>with its own running stack.</h1>
      <p class="pp-lead">A workspace is a branch with its own git worktrees, ports and databases, and the services
        already running. Ten of them run side by side and never collide.</p>
      <div class="pp-hero-window">
        <Frame :width="1440" :height="820" window>
          <AppWindow active="database" :sidebar="260" :dock="300" :bottom="190" language="" cursor="">
            <template #sidebar>
              <div style="padding: 10px 10px 0"><WorkspaceCreate /></div>
              <WorkspacesList :rows="rows" style="padding-top: 0" />
            </template>
            <template #dock><DatabasePanel /></template>
            <TabBar nav :tabs="[
              { title: 'sessions_controller.rb', icon: 'file' },
              { title: 'web/vite', icon: 'terminal' },
              { title: 'users', icon: 'table', detail: '[main]', active: true },
            ]" :buttons="['panel_right', 'panel_bottom', 'maximize']" />
            <TableView />
            <template #bottom>
              <TabBar :tabs="[{ title: 'api - zsh', icon: 'terminal', active: true }]" :buttons="['plus', 'panel_right', 'panel_bottom', 'maximize']" />
              <TerminalView :lines="terminal" />
            </template>
          </AppWindow>
        </Frame>
      </div>
    </section>

    <section id="workspaces" class="pp-section">
      <div class="pp-wrap">
        <h2>Workspaces per branch</h2>
        <p class="pp-sub">Pick a branch or a ticket. Pomelo does the rest in stages you can watch, repo by repo in
          parallel, and retries from the stage that failed.</p>
        <div class="pp-steps">
          <Step n="01" title="Create one from a branch or a ticket" link="/docs/workspace" more="Workspace lifecycle">
            <template #text>It checks out a worktree of every repo, starts the shared services, writes each service's
              env, runs your setup commands and seeds the databases from main.</template>
            <div class="pp-stage"><div style="width: 100%; max-width: 280px"><Frame :width="280" :height="236" bare><WorkspaceCreate :stage="4" detail="" /></Frame></div></div>
          </Step>
          <Step n="02" title="Its own ports, databases and URLs" link="/docs/network" more="How the network works">
            <template #text>Ports are handed out so they never clash. Each workspace gets its own databases in the shared
              Postgres, and one origin per workspace through the dev proxy, so cookies and CORS behave like production.</template>
            <div class="pp-stage"><div style="width: 100%"><Frame :width="700" :height="150" window><ProxyUrls /></Frame></div></div>
          </Step>
        </div>
      </div>
    </section>

    <section id="services" class="pp-section">
      <div class="pp-wrap">
        <h2>Services</h2>
        <p class="pp-sub">What runs, what broke and why, and the fix one click away. Each service runs in a holder
          that outlives the app, so a restart of Pomelo never restarts your stack.</p>
        <div class="pp-steps">
          <Step n="01" title="See what needs attention" link="/docs/services#the-services-panel" more="The Services panel">
            <template #text>A crash, a port already in use or a failed start shows first, with its last line and what
              to do: <b>Use a new port</b>, <b>View logs</b>, <b>Fix with Claude</b> or restart. Shared services stay
              pinned at the bottom. Try the filter above the list.</template>
            <div class="pp-stage"><div style="width: 100%; max-width: 330px"><Frame :width="330" :height="880" window><ServicesPanel /></Frame></div></div>
          </Step>
          <Step n="02" title="Open a service as a tab" link="/docs/services#the-service-tab" more="The service tab">
            <template #text>Its URL, port, mode and command, and its logs live, with a filter, pause, follow and wrap.
              Type in the filter to try it.</template>
            <div class="pp-stage"><div style="width: 100%"><Frame :width="760" :height="380" window><ServiceTab /></Frame></div></div>
          </Step>
        </div>
      </div>
    </section>

    <section id="databases" class="pp-section">
      <div class="pp-wrap">
        <h2>Databases</h2>
        <p class="pp-sub">Pomelo already knows every workspace's connection, so there is nothing to wire up.</p>
        <div class="pp-grid">
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%; max-width: 300px"><Frame :width="300" :height="400" window><DatabasePanel /></Frame></div></div>
            <div class="pp-card-text"><h3>One tree for the branch's data</h3>
              <p>Postgres tables and columns, Redis keyspaces and MinIO buckets, with a filter and a menu on every row.
                Click a table to open it.</p></div>
          </div>
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%"><Frame :width="600" :height="400" window><TableView /></Frame></div></div>
            <div class="pp-card-text"><h3>Tables and SQL consoles</h3>
              <p>WHERE and ORDER BY, paging, sorting by a column and CSV export. Consoles run a statement with
                cmd-enter and are saved with the project.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section id="network" class="pp-section">
      <div class="pp-wrap">
        <h2>Dev proxy and webhooks</h2>
        <p class="pp-sub">One origin per workspace at <code>http://&lt;service&gt;.&lt;repo&gt;.&lt;workspace&gt;.localhost:8767</code>,
          a backend retargeted to staging by flipping a profile, and each inbound webhook fanned out to every workspace
          running the service.</p>
        <p class="pp-sub"><a href="/docs/network">How the network works &gt;</a></p>
      </div>
    </section>
  </div>
</template>
