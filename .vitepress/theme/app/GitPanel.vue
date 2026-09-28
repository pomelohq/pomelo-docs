<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const repos = ref([
  { name: 'api', branch: 'feat-login', files: [
    { name: 'sessions_controller.rb', dir: 'app/controllers', status: 'modified', add: 12, del: 1, staged: true },
    { name: 'sessions_controller_test.rb', dir: 'test/controllers', status: 'added', add: 38, del: 0, staged: true },
    { name: 'development.rb', dir: 'config/environments', status: 'modified', add: 2, del: 0, staged: false },
  ] },
  { name: 'web', branch: 'feat-login', files: [
    { name: 'Login.tsx', dir: 'src/pages', status: 'modified', add: 9, del: 3, staged: false },
    { name: 'LegacyForm.tsx', dir: 'src/components', status: 'deleted', add: 0, del: 54, staged: false },
  ] },
])
const tab = ref('Changes')
const icon = { added: 'square_plus', modified: 'square_dot', deleted: 'square_minus' }
const tone = { added: 'var(--pa-version-control-added)', modified: 'var(--pa-version-control-modified)', deleted: 'var(--pa-version-control-deleted)' }
const all = computed(() => repos.value.flatMap(r => r.files))
const staged = computed(() => all.value.filter(f => f.staged))
const plan = computed(() => {
  const by = repos.value.filter(r => r.files.some(f => f.staged))
  if (!by.length) return 'nothing staged'
  return by.length === 1 ? `1 commit in ${by[0].name} (${by[0].files.filter(f => f.staged).length} files)`
    : `${by.length} commits: ${by.map(r => r.name).join(', ')}`
})
const toggle = f => { f.staged = !f.staged }
</script>

<template>
  <div class="pa-git">
    <div class="pa-git-tabs">
      <span v-for="[t, n] in [['Changes', all.length], ['Remote', 1], ['History', null]]" :key="t" :class="{ on: tab === t }" @click="tab = t">
        {{ t }}<span v-if="n !== null" class="placeholder"> ({{ n }})</span>
      </span>
    </div>
    <div class="row pa-git-tool">
      <span class="pa-ghost"><Icon name="diff_unified" :size="14" />View Diff</span>
      <span class="pa-sm"><span style="color: var(--pa-version-control-added)">+61</span> <span style="color: var(--pa-version-control-deleted)">-58</span></span>
      <span class="grow" />
      <span class="pa-split"><span>Stage All</span><i /><Icon name="chevron_down" :size="10" /></span>
    </div>
    <div class="pa-git-list">
      <template v-for="repo in repos" :key="repo.name">
        <div class="pa-git-row repo">
          <Icon name="chevron_down" :size="12" class="icon-muted" />
          <span class="pa-git-repo">{{ repo.name }}</span><span class="mono warn pa-xs">on {{ repo.branch }}</span>
          <span class="grow" />
        </div>
        <template v-for="section in [['Staged', true], ['Not staged', false]]" :key="section[0]">
          <div v-if="repo.files.some(f => f.staged === section[1])" class="pa-git-row sec">
            <span class="muted">{{ section[0] }}</span><span class="placeholder pa-xs">{{ repo.files.filter(f => f.staged === section[1]).length }}</span>
          </div>
          <div v-for="f in repo.files.filter(f => f.staged === section[1])" :key="f.name" class="pa-git-row file" @click="toggle(f)">
            <Icon :name="icon[f.status]" :size="14" :style="{ color: tone[f.status] }" />
            <span :class="{ gone: f.status === 'deleted' }">{{ f.name }}</span>
            <span class="muted pa-sm trunc">{{ f.dir }}</span>
            <span class="grow" />
            <span class="pa-sm"><span v-if="f.add" style="color: var(--pa-version-control-added)">+{{ f.add }}</span>
              <span v-if="f.del" style="color: var(--pa-version-control-deleted)"> -{{ f.del }}</span></span>
            <span class="pa-check" :class="{ on: f.staged }"><Icon v-if="f.staged" name="check" :size="12" /></span>
          </div>
        </template>
      </template>
    </div>
    <div class="pa-git-foot">
      <div class="row pa-git-branch">
        <Icon name="branch" :size="14" class="icon-muted" /><span class="pa-sm">feat-login</span>
        <span class="placeholder pa-sm">in 2 of 2</span><span class="grow" /><span class="pa-sm pa-link">1 to push</span>
      </div>
      <div class="pa-git-msg">
        <span v-if="staged.length" class="placeholder">Throttle repeated sign-in attempts</span>
        <span v-else class="placeholder">Stage files to commit</span>
      </div>
      <div class="row pa-git-commit">
        <span class="muted pa-xs">{{ plan }}</span><span class="grow" />
        <span class="pa-split primary"><span>Commit</span><i /><Icon name="chevron_down" :size="10" /></span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-git { height: 100%; display: flex; flex-direction: column; }
.pa-git-tabs { height: 32px; display: flex; border-bottom: 1px solid var(--pa-border); flex: none; }
.pa-git-tabs > span { flex: 1; display: flex; align-items: center; justify-content: center; gap: 2px; font-size: 13px; cursor: pointer;
  background: color-mix(in srgb, var(--pa-editor-background) 60%, transparent); }
.pa-git-tabs > span + span { border-left: 1px solid var(--pa-border-variant); }
.pa-git-tabs > span:hover { background: var(--pa-element-hover); }
.pa-git-tabs > span.on { background: var(--pa-panel-background); }
.pa-git-tabs .placeholder { font-size: 12px; }
.pa-git-tool { height: 32px; padding: 0 8px 0 4px; gap: 4px; flex: none; }
.pa-ghost { height: 22px; padding: 0 6px; gap: 5px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 12px; color: var(--pa-text-muted); }
.pa-ghost:hover { color: var(--pa-text); background: var(--pa-ghost-element-hover); }
.pa-split { height: 22px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 12px;
  background: var(--pa-element-background); border: 1px solid var(--pa-border-variant); }
.pa-split > span { padding: 0 7px; }
.pa-split > i { width: 1px; align-self: stretch; background: var(--pa-border-variant); }
.pa-split > .pa-icon { width: 20px !important; justify-content: center; color: var(--pa-icon-muted); }
.pa-split.primary { background: var(--pa-info-background); border-color: var(--pa-info-border); }
.pa-git-list { flex: 1; min-height: 0; overflow: hidden; }
.pa-git-row { height: 28px; padding: 0 4px 0 10px; gap: 6px; display: flex; align-items: center; font-size: 13px; white-space: nowrap; }
.pa-git-row:hover { background: var(--pa-ghost-element-hover); }
.pa-git-row.sec { padding-left: 28px; font-size: 12px; }
.pa-git-row.file { padding-left: 28px; cursor: pointer; }
.pa-git-repo { font-weight: 600; }
.pa-git-row .gone { color: var(--pa-text-disabled); text-decoration: line-through; }
.pa-check { width: 16px; height: 16px; margin: 0 2px; border-radius: 2px; border: 1px solid var(--pa-border); display: flex;
  align-items: center; justify-content: center; color: var(--pa-text-accent); flex: none; }
.pa-git-foot { flex: none; border-top: 1px solid var(--pa-border); background: var(--pa-panel-background); }
.pa-git-branch { height: 30px; padding: 0 8px; gap: 4px; border-bottom: 1px solid var(--pa-border); }
.pa-git-msg { height: 76px; padding: 8px; font-size: 13px; background: var(--pa-editor-background); border-bottom: 1px solid var(--pa-border-variant); }
.pa-git-commit { height: 34px; padding: 0 6px; gap: 6px; background: var(--pa-editor-background); }
</style>
