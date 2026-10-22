<script setup>
import AppWindow from './AppWindow.vue'
import CodeView from './CodeView.vue'
import Frame from './Frame.vue'
import Icon from './Icon.vue'
import TabBar from './TabBar.vue'

const code = `class UsersController < ApplicationController
  before_action :authenticate_user!

  def index
    @users = User.where(active: true).order(:name)
    render json: @users
  end

  def show
    @user = User.find(params[:id])
  end
end`
// [depth, kind, name, icon]; kind: open | closed | leaf.
const tree = [
  [0, 'open', 'api', 'folder_open'], [1, 'open', 'app', 'folder_open'], [2, 'open', 'controllers', 'folder_open'],
  [3, 'leaf', 'sessions_controller.rb', 'file-ruby'], [3, 'leaf', 'users_controller.rb', 'file-ruby', true],
  [2, 'closed', 'models', 'folder'], [1, 'closed', 'config', 'folder'], [1, 'closed', 'spec', 'folder'],
  [1, 'leaf', 'Gemfile', 'file-gemfile'], [0, 'closed', 'web', 'folder'],
]
</script>

<template>
  <Frame :width="1440" :height="900" window>
    <AppWindow active="files" cursor="8:1">
      <template #dock>
        <div class="pa-panel-header"><span>Files</span><span class="pa-ws-btn"><Icon name="search" :size="14" /></span></div>
        <div class="pa-ftree">
          <div v-for="[depth, kind, name, icon, selected] in tree" :key="name" class="pa-ftree-row" :class="{ selected }">
            <span v-for="n in depth" :key="n" class="pa-ftree-guide" />
            <span class="pa-ftree-chevron"><Icon v-if="kind !== 'leaf'" :name="kind === 'open' ? 'chevron_down' : 'chevron_right'" :size="12" /></span>
            <Icon :name="icon" :size="icon.startsWith('file-') ? 16 : 14" class="pa-ftree-icon" />
            <span class="trunc">{{ name }}</span>
          </div>
        </div>
      </template>
      <TabBar nav :tabs="[
        { title: 'users_controller.rb', icon: 'file-ruby', active: true, dirty: true },
        { title: 'routes.rb', icon: 'file-ruby' },
        { title: 'README.md', icon: 'file-markdown' },
      ]" :buttons="['panel_right', 'panel_bottom', 'maximize']" />
      <CodeView :code="code" :active="8" :caret="8" :crumbs="['api', 'app/controllers', 'users_controller.rb']"
        :symbol="['class', 'UsersController']" tools />
      <template #right>
        <TabBar :tabs="[{ title: 'Main', icon: 'sparkle', active: true }, { title: 'review-1', icon: 'sparkle' }]" :buttons="['plus']" />
        <div class="pa-agent-term mono">
          <div><span class="dim">&gt;</span> Add pagination to the users index and cover it with a request spec.</div>
          <div class="gap" />
          <div><span class="accent">*</span> I'll add page and per params to UsersController#index,</div>
          <div class="indent">then write the request spec.</div>
          <div class="gap" />
          <div><span class="ok">*</span> <b>Update</b>(app/controllers/users_controller.rb)</div>
          <div class="indent dim">Updated with 6 additions and 1 removal</div>
          <div class="gap" />
          <div><span class="warn">*</span> <b>Bash</b>(bundle exec rspec spec/requests/users_spec.rb)</div>
          <div class="indent dim">Waiting for permission</div>
          <div class="spacer" />
          <div class="box"><span class="dim">&gt;</span> <span class="cursor" /></div>
          <div class="status"><span class="accent">[Pom | myproject | feat-login]</span><span class="dim"> Opus 12% of 1M $0.42</span></div>
        </div>
      </template>
    </AppWindow>
  </Frame>
</template>

<style>
.pa-panel-header { flex: none; height: 36px; padding: 0 8px 0 12px; gap: 8px; display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pa-text-muted); }
.pa-ftree { display: flex; flex-direction: column; gap: 1px; padding: 0 6px 8px; }
.pa-ftree-row { flex: none; height: 28px; padding: 0 8px 0 4px; gap: 6px; border-radius: 6px; display: flex; align-items: center; font-size: 13px; }
.pa-ftree-row:hover { background: var(--pa-element-hover); }
.pa-ftree-row.selected { background: var(--pa-element-selected); }
.pa-ftree-guide { position: relative; flex: none; width: 16px; align-self: stretch; margin-right: -6px; }
.pa-ftree-guide::before { content: ''; position: absolute; left: 50%; top: -1px; bottom: 0; width: 1px; background: var(--pa-panel-indent-guide); }
.pa-ftree-chevron { flex: none; width: 16px; display: inline-flex; justify-content: center; color: var(--pa-text-placeholder); }
.pa-ftree-icon { color: var(--pa-text-muted); }
.pa-ftree-row.selected .pa-ftree-icon { color: var(--pa-text-accent); }
.pa-agent-term { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 12px 14px 10px; font-size: 13px; line-height: 20px;
  background: var(--pa-editor-background); color: var(--pa-text); white-space: pre-wrap; }
.pa-agent-term .gap { height: 10px; }
.pa-agent-term .indent { padding-left: 2ch; }
.pa-agent-term .spacer { flex: 1; }
.pa-agent-term .dim { color: var(--pa-text-placeholder); }
.pa-agent-term .accent { color: var(--pa-text-accent); }
.pa-agent-term .ok { color: var(--pa-success); }
.pa-agent-term .warn { color: var(--pa-warning); }
.pa-agent-term .box { padding: 6px 10px; border-radius: 4px; box-shadow: inset 0 0 0 1px var(--pa-border); }
.pa-agent-term .cursor { display: inline-block; width: 8px; height: 15px; vertical-align: -2px; background: var(--pa-text); }
.pa-agent-term .status { padding: 6px 2px 0; font-size: 12px; line-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
