<script setup>
import AgentPopover from '../app/AgentPopover.vue'
import AppWindow from '../app/AppWindow.vue'
import CodeView from '../app/CodeView.vue'
import Frame from '../app/Frame.vue'
import SideAgentBar from '../app/SideAgentBar.vue'
import TabBar from '../app/TabBar.vue'
import TerminalView from '../app/TerminalView.vue'
import UsageCard from '../app/UsageCard.vue'
import WorkspacesList from '../app/WorkspacesList.vue'
import Onboarding from '../app/Onboarding.vue'
import UsageChart from '../app/UsageChart.vue'
import Step from './Step.vue'
import './product.css'

const code = `class SessionsController < ApplicationController
  MAX_ATTEMPTS = 5

  def create
    user = User.find_by(email: params[:email])

    if throttled?(params[:email])
      return render json: { error: "too many attempts" }, status: :too_many_requests
    end

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to dashboard_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def throttled?(email)
    key = "login:#{email}"
    Rails.cache.increment(key, 1, expires_in: 1.minute) > MAX_ATTEMPTS
  end
end`
const sideChat = [
  [['> ', 'dim'], ['Why does the login throttle use Rails.cache and not the database?', 'bright']],
  [],
  [['* ', 5], ['Read ', 'fg'], ['app/controllers/sessions_controller.rb', 4]],
  [['* ', 5], ['Read ', 'fg'], ['config/environments/development.rb', 4]],
  [],
  [['The counter only has to live for a minute, and it is hit on every', 'fg']],
  [['sign-in attempt. Rails.cache (Redis here, see REDIS_URL) gives an', 'fg']],
  [['atomic increment with an expiry, so there is no table to clean up', 'fg']],
  [['and no write lock on users. In development it falls back to the', 'fg']],
  [['memory store unless you set ', 'fg'], ['config.cache_store', 3], ['.', 'fg']],
  [],
  [['> ', 'dim']],
]
const mainChat = [
  [['> ', 'dim'], ['Add a per-email throttle to the login endpoint', 'bright']],
  [],
  [['* ', 5], ['Edit ', 'fg'], ['app/controllers/sessions_controller.rb', 4], ['  +12 -1', 2]],
  [['* ', 5], ['Bash ', 'fg'], ['bin/rails test test/controllers', 'dim']],
  [['  6 runs, 0 failures', 2]],
  [],
  [['Done: five attempts a minute per email, then 429.', 'fg']],
  [],
  [['> ', 'dim'], ['Ask agent: the throttle uses Rails.cache because the counter only', 'fg']],
  [['  has to live for a minute and needs an atomic increment...', 'fg']],
]
const statusRows = [
  { name: 'main', agent: 'idle' },
  { name: 'Login page', branch: 'feat-login', current: true, agent: 'thinking', running: 2 },
  { name: 'Checkout flow', ticket: 'PROJ-101', status: ['In Review', 'accent'], agent: 'input', running: 3 },
  { name: 'Search filters', ticket: 'PROJ-104', status: ['In Progress', 'accent'], agent: 'tools', running: 1 },
  { name: 'Invoice export', ticket: 'PROJ-97', status: ['Done', 'done'], agent: 'compacting' },
]
</script>

<template>
  <div class="pp">
    <section class="pp-hero pp-wrap">
      <div class="pp-eyebrow">Agents</div>
      <h1>A main agent per branch,<br>and side agents next to it.</h1>
      <p class="pp-lead">Each workspace keeps one conversation that does the work. Questions, reviews and small
        fixes go to side agents that start from the right amount of context and hand back what they found.</p>
      <div class="pp-hero-window">
        <Frame :width="1440" :height="820" window>
          <AppWindow active="" :sidebar="248" :right="520" language="Ruby" cursor="22:5">
            <template #sidebar><WorkspacesList /></template>
            <TabBar nav :tabs="[{ title: 'sessions_controller.rb', icon: 'file', active: true }]"
              :buttons="['eye', 'diff_unified', 'panel_right', 'panel_bottom', 'maximize']" />
            <CodeView :code="code" :active="23" :caret="23" :added="[2, 7, 8, 9, 21, 22, 23, 24]" />
            <template #right>
              <TabBar :tabs="[
                { title: 'Main', icon: 'sparkle', pinned: true, size: 12 },
                { title: 'Ask: sessions_controller.rb', icon: 'help_circle', active: true, size: 12 },
              ]" :buttons="['plus', 'clock', 'maximize']" />
              <SideAgentBar role="Ask" started="Auto: fork - 9.3k" />
              <TerminalView :lines="sideChat" :size="12" />
            </template>
          </AppWindow>
        </Frame>
      </div>
    </section>

    <section id="side-agents" class="pp-section">
      <div class="pp-wrap">
        <h2>Side agents</h2>
        <p class="pp-sub">Keep the main conversation on the task. Everything else starts on the side, read-only
          unless it is there to fix something.</p>
        <div class="pp-steps">
          <Step n="01" title="Start one for a narrow job" link="/docs/agents#side-agents" more="Learn about side agents">
            <template #text>Click + in the agent dock and pick what it is for: <b>Ask</b> about the code,
              <b>Review</b> the branch diff, get a <b>Second opinion</b> from another CLI, or <b>Fix</b> a bug.
              Only Fix may edit files; the rest run in plan mode.</template>
            <div class="pp-stage"><div style="width: 100%; max-width: 380px"><Frame :width="380" :height="700" bare><AgentPopover /></Frame></div></div>
          </Step>
          <Step n="02" title="Start from just enough context" link="/docs/agents#side-agents" more="How it starts">
            <template #text>A side agent can fork main's whole session, fork and compact it, or start fresh from
              a short packet Pomelo writes: branch, ticket, recent commits and changes. <b>Auto</b> forks while main
              is small and compacts once it passes 50k tokens. Each choice shows what it will cost to start.</template>
            <div class="pp-stage">
              <div class="pp-bars" style="width: 100%; max-width: 560px">
                <Frame :width="560" :height="166" bare>
                  <div class="col" style="gap: 12px">
                    <SideAgentBar role="Ask" started="Auto: fork - 9.3k" />
                    <SideAgentBar role="Review" started="Compacted - 3.4k" />
                    <SideAgentBar role="Fix" edit started="Fresh - 2.1k" />
                  </div>
                </Frame>
              </div>
            </div>
          </Step>
          <Step n="03" title="Send the answer back to main" link="/docs/agents#the-side-agent-bar" more="The side agent bar">
            <template #text><b>Send to main</b> puts the side agent's last answer into the main agent's prompt,
              without sending it, so you can add a line and send it yourself. <b>Archive</b> closes it and keeps
              the transcript to reopen later.</template>
            <div class="pp-stage">
              <div style="width: 100%; max-width: 620px">
                <Frame :width="620" :height="252" window>
                  <div class="col" style="height: 100%">
                    <TabBar :tabs="[
                      { title: 'Main', icon: 'sparkle', pinned: true, active: true, size: 12 },
                      { title: 'Ask: sessions_controller.rb', icon: 'help_circle', size: 12 },
                    ]" :buttons="['plus', 'clock', 'maximize']" />
                    <TerminalView :lines="mainChat" :size="12" />
                  </div>
                </Frame>
              </div>
            </div>
          </Step>
        </div>
      </div>
    </section>

    <section id="status" class="pp-section">
      <div class="pp-wrap">
        <h2>Every workspace's agent, at a glance</h2>
        <p class="pp-sub">Pomelo reads the agents' own activity hooks. The dot on each workspace says whether its
          agent is thinking, using tools, compacting, waiting for you or done, and a notification tells you when
          that changes.</p>
        <div class="pp-grid">
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%; max-width: 280px"><Frame :width="280" :height="250" window>
              <WorkspacesList :rows="statusRows" /></Frame></div></div>
            <div class="pp-card-text"><h3>Status on every row</h3>
              <p>Idle, Thinking, Using tools, Compacting and Awaiting input, next to the branch's pull request
                and running services. Side agents never move the dot.</p></div>
          </div>
          <div class="pp-card">
            <div class="pp-stage pp-legend-stage">
              <ul class="pa pp-legend">
                <li><i style="background: var(--pa-success)" />Idle<span>finished, waiting for you</span></li>
                <li><i style="background: var(--pa-warning)" />Thinking<span>working on your prompt</span></li>
                <li><i style="background: var(--pa-info)" />Using tools<span>an edit, a command, an MCP call</span></li>
                <li><i style="background: var(--pa-text-accent)" />Compacting<span>freeing up context</span></li>
                <li><i style="background: var(--pa-error)" />Awaiting input<span>a permission prompt or a question</span></li>
              </ul>
            </div>
            <div class="pp-card-text"><h3>Notified when it matters</h3>
              <p>A banner and a sound when an agent finishes, needs your input or compacts, for workspaces you
                are not looking at.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section id="usage" class="pp-section">
      <div class="pp-wrap">
        <h2>Usage and plan limits</h2>
        <p class="pp-sub">Read from the agents' own transcripts, so knowing costs no tokens. The title bar shows the
          signed-in Claude account's 5-hour and weekly limits; the Agent usage tab breaks the week down.</p>
        <div class="pp-grid">
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%; max-width: 300px"><Frame :width="300" :height="222" bare><UsageCard /></Frame></div></div>
            <div class="pp-card-text"><h3>Limits in the title bar</h3>
              <p>Both windows with when they reset, turning yellow at 70% and red at 90%.</p></div>
          </div>
          <div class="pp-card">
            <div class="pp-stage"><div style="width: 100%"><Frame :width="520" :height="222" window><UsageChart /></Frame></div></div>
            <div class="pp-card-text"><h3>Cost by day, by workspace</h3>
              <p>API-equivalent cost, tokens and cache reads for today, 7 or 30 days, stacked by workspace, agent
                or model.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section id="setup" class="pp-section">
      <div class="pp-wrap">
        <h2>An agent sets up the project</h2>
        <p class="pp-sub">Point Pomelo at your repos. It clones them and detects each stack without spending a token,
          then Claude Code, Codex or Gemini CLI writes pom.yml. Pomelo verifies that every service boots and hands back
          what fails until it comes out clean.</p>
        <div class="pp-steps">
          <Step n="01" title="Detect, draft, verify, repair" link="/docs/quickstart#_5-setting-up" more="Quick Start">
            <template #text>Each phase shows as it runs. The agent works in a terminal you can watch or type into;
              verification is Pomelo's own check, not the agent's word.</template>
            <div class="pp-stage"><div style="width: 100%"><Frame :width="720" :height="640" window><Onboarding /></Frame></div></div>
          </Step>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.pp-legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 360px; }
.pp-legend li { display: grid; grid-template-columns: 12px auto 1fr; gap: 10px; align-items: center; margin: 0;
  font-size: 14px; font-weight: 500; color: var(--vp-c-text-1); }
.pp-legend li i { width: 8px; height: 8px; border-radius: 50%; }
.pp-legend li span { font-weight: 400; color: var(--vp-c-text-2); font-size: 13.5px; }
.pp-legend-stage { min-height: 290px; }
</style>
