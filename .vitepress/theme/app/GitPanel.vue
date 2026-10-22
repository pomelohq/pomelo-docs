<script setup>
import { computed, reactive } from 'vue'
import Icon from './Icon.vue'

const file = (name, dir, icon, status, add, del, binary) => ({ name, dir, icon, status, add, del, binary, staged: false })
const repos = reactive([
  { name: 'api', open: true, files: [
    file('users_controller.rb', 'app/controllers', 'ruby', 'M', 6, 1),
    file('schema.rb', 'db', 'ruby', 'M', 3, 3),
    file('users_spec.rb', 'spec/requests', 'ruby', 'A', 42),
  ] },
  { name: 'web', open: true, files: [
    file('logo.png', 'public', 'image', 'M', undefined, undefined, true),
    file('UserList.tsx', 'src/users', 'react', 'M', 18, 4),
    file('legacyTable.css', 'src/users', 'css', 'D', undefined, 57),
    file('usePagination.ts', 'src/users', 'typescript', 'A', 31),
  ] },
])
const selected = 'users_controller.rb'
const mark = { M: 'square_dot', A: 'square_plus', D: 'square_minus' }
const all = computed(() => repos.flatMap(r => r.files))
const sum = files => files.reduce((t, f) => ({ add: t.add + (f.add || 0), del: t.del + (f.del || 0) }), { add: 0, del: 0 })
const total = computed(() => sum(all.value))
const check = files => files.every(f => f.staged) ? 'on' : files.some(f => f.staged) ? 'some' : 'off'
const targets = computed(() => repos.map(r => [r.name, r.files.filter(f => f.staged).length]).filter(([, n]) => n))
const plan = computed(() => {
  const t = targets.value
  if (!t.length) return 'nothing staged'
  if (t.length === 1) return `1 commit in ${t[0][0]} (${t[0][1]} file${t[0][1] === 1 ? '' : 's'})`
  return `${t.length} commits: ${t.map(([r, n]) => `${r} ${n}`).join(', ')}`
})
const sections = repo => [['Staged', true], ['Not staged', false]]
  .map(([title, staged]) => ({ title, staged, files: repo.files.filter(f => f.staged === staged) }))
  .filter(s => s.files.length)
const toggleRepo = repo => {
  const on = check(repo.files) !== 'on'
  repo.files.forEach(f => { f.staged = on })
}
const stageAll = () => {
  const on = !all.value.every(f => f.staged)
  all.value.forEach(f => { f.staged = on })
}
</script>

<template>
  <div class="pa-gx">
    <div class="pa-gx-tabs">
      <span class="pa-gx-tab on">Changes<span class="pa-gx-count mono">{{ all.length }}</span></span>
      <span class="pa-gx-tab">Remote<span class="pa-gx-count mono">2</span></span>
      <span class="pa-gx-tab">History</span>
    </div>
    <div class="pa-gx-toolbar">
      <span class="pa-gx-viewdiff"><Icon name="diff_unified" :size="13" />View Diff
        <span class="pa-gx-add mono">+{{ total.add }}</span><span class="pa-gx-del mono">-{{ total.del }}</span></span>
      <span class="grow" />
      <span class="pa-gx-iconbtn"><Icon name="filter" :size="14" /></span>
      <span class="pa-gx-split" @click="stageAll"><span class="pa-gx-split-main">{{ all.every(f => f.staged) ? 'Unstage All' : 'Stage All' }}</span>
        <span class="pa-gx-split-menu"><Icon name="chevron_down" :size="12" /></span></span>
    </div>
    <div class="pa-gx-list">
      <div v-for="repo in repos" :key="repo.name" class="pa-gx-repo">
        <div class="pa-gx-repo-head">
          <Icon :name="repo.open ? 'chevron_down' : 'chevron_right'" :size="11" class="pa-gx-chev" @click="repo.open = !repo.open" />
          <span class="pa-gx-check" :class="check(repo.files)" @click="toggleRepo(repo)"><Icon v-if="check(repo.files) === 'on'" name="check" :size="10" /></span>
          <span class="pa-gx-repo-name">{{ repo.name }}</span>
          <span class="pa-gx-right"><span class="pa-gx-add mono">+{{ sum(repo.files).add }}</span><span class="pa-gx-del mono">-{{ sum(repo.files).del }}</span></span>
        </div>
        <template v-if="repo.open">
          <template v-for="section in sections(repo)" :key="section.title">
            <div class="pa-gx-section">
              <span class="pa-gx-check" :class="section.staged ? 'on' : 'off'"><Icon v-if="section.staged" name="check" :size="10" /></span>
              {{ section.title }}<span class="placeholder">{{ section.files.length }}</span>
            </div>
            <div v-for="f in section.files" :key="f.name" class="pa-gx-file" :class="{ selected: f.name === selected && !f.staged }" @click="f.staged = !f.staged">
              <span class="pa-gx-check" :class="f.staged ? 'on' : 'off'"><Icon v-if="f.staged" name="check" :size="10" /></span>
              <Icon :name="'file-' + f.icon" :size="14" />
              <span class="pa-gx-name" :class="{ gone: f.status === 'D' }">{{ f.name }}</span>
              <span class="pa-gx-dir">{{ f.dir }}</span>
              <span class="pa-gx-right">
                <span v-if="f.binary" class="placeholder">binary</span>
                <template v-else><span v-if="f.add !== undefined" class="pa-gx-add mono">+{{ f.add }}</span><span v-if="f.del !== undefined" class="pa-gx-del mono">-{{ f.del }}</span></template>
                <Icon :name="mark[f.status]" :size="13" :class="'pa-gx-st-' + f.status" />
              </span>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div class="pa-gx-footer">
      <div class="pa-gx-branch">
        <span class="pa-gx-branch-name"><Icon name="branch" :size="12" />feat-login</span>
        <span class="placeholder">in 2 of 2</span>
        <span class="pa-gx-link">2 to push</span>
      </div>
      <div class="pa-gx-message" :class="{ filled: targets.length }">
        <span v-if="targets.length">Paginate the users index</span>
        <span v-else class="placeholder">Stage files to commit</span>
      </div>
      <div class="pa-gx-commit-row">
        <span class="pa-gx-plan"><span class="trunc">{{ plan }}</span><Icon name="chevron_down" :size="10" /></span>
        <span class="pa-gx-commit" :class="{ disabled: !targets.length }"><span class="pa-gx-commit-main">Commit</span>
          <span class="pa-gx-commit-menu"><Icon name="chevron_down" :size="12" /></span></span>
      </div>
      <div v-if="!targets.length" class="pa-gx-why"><Icon name="info" :size="12" />Stage files to commit</div>
      <div class="pa-gx-last">
        <span class="placeholder">Last commit</span>
        <span class="pa-gx-last-subject">Seed 30 users for request specs - api</span>
        <span class="pa-gx-iconbtn"><Icon name="undo" :size="13" /></span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-gx { height: 100%; display: flex; flex-direction: column; background: var(--pa-panel-background); font-size: 12px; line-height: 16px; }
.pa-gx-tabs { flex: none; display: flex; gap: 2px; margin: 8px 8px 0; padding: 2px; border-radius: 6px; background: var(--pa-background); }
.pa-gx-tab { flex: 1; height: 26px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 4px; color: var(--pa-text-muted); }
.pa-gx-tab.on { background: var(--pa-element-background); color: var(--pa-text); font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2); }
.pa-gx-count { padding: 0 5px; border-radius: 8px; background: var(--pa-element-hover); color: var(--pa-text-muted); font-size: 10.5px; line-height: 16px; font-weight: 500; }
.pa-gx-toolbar { flex: none; height: 38px; padding: 0 8px; display: flex; align-items: center; gap: 4px; color: var(--pa-text-muted); }
.pa-gx-viewdiff { height: 26px; padding: 0 8px; gap: 6px; display: inline-flex; align-items: center; border-radius: 4px; color: var(--pa-text); }
.pa-gx-iconbtn { width: 26px; height: 24px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; color: var(--pa-text-placeholder); }
.pa-gx-split { height: 26px; display: inline-flex; align-items: stretch; border-radius: 4px; background: var(--pa-element-background); cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2); }
.pa-gx-split-main { display: inline-flex; align-items: center; padding: 0 10px; color: var(--pa-text); }
.pa-gx-split-menu { display: inline-flex; align-items: center; padding: 0 6px; color: var(--pa-text-muted); box-shadow: inset 1px 0 0 var(--pa-border-variant); }
.pa-gx-add { color: var(--pa-version-control-added); font-size: 11.5px; line-height: 1; }
.pa-gx-del { color: var(--pa-version-control-deleted); font-size: 11.5px; line-height: 1; }
.pa-gx-list { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 6px; padding: 0 6px 8px; }
.pa-gx-repo { flex: none; display: flex; flex-direction: column; gap: 1px; padding: 4px; border-radius: 10px; background: var(--pa-editor-background); }
.pa-gx-repo-head { height: 30px; padding: 0 6px; display: flex; align-items: center; gap: 7px; color: var(--pa-text-placeholder); }
.pa-gx-chev { cursor: pointer; }
.pa-gx-repo-name { color: var(--pa-text); font-weight: 600; }
.pa-gx-right { margin-left: auto; flex: none; display: inline-flex; align-items: center; gap: 6px; }
.pa-gx-section { height: 24px; padding: 0 8px; display: flex; align-items: center; gap: 7px; color: var(--pa-text-muted); font-weight: 500; }
.pa-gx-file { height: 26px; padding: 0 8px; display: flex; align-items: center; gap: 8px; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.pa-gx-file:hover { background: var(--pa-element-hover); }
.pa-gx-file.selected { background: var(--pa-element-selected); box-shadow: inset 0 0 0 1px var(--pa-text-accent); }
.pa-gx-name.gone { text-decoration: line-through; color: var(--pa-text-muted); }
.pa-gx-dir { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: var(--pa-text-placeholder); }
.pa-gx-check { width: 14px; height: 14px; flex: none; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 0 1.5px var(--pa-border); color: var(--pa-on-accent); cursor: pointer; }
.pa-gx-check.on, .pa-gx-check.some { background: var(--pa-accent-fill); box-shadow: none; }
.pa-gx-check.some::after { content: ''; width: 7px; height: 2px; border-radius: 1px; background: var(--pa-on-accent); }
.pa-gx-st-M { color: var(--pa-version-control-modified); }
.pa-gx-st-A { color: var(--pa-version-control-added); }
.pa-gx-st-D { color: var(--pa-version-control-deleted); }
.pa-gx-footer { flex: none; display: flex; flex-direction: column; gap: 8px; padding: 10px; font-size: 13px; line-height: 20px;
  background: var(--pa-editor-background); box-shadow: 0 -1px 0 var(--pa-border-variant); }
.pa-gx-branch { height: 24px; display: flex; align-items: center; gap: 6px; color: var(--pa-text-muted); white-space: nowrap; }
.pa-gx-branch-name { padding: 2px 6px; gap: 5px; display: inline-flex; align-items: center; border-radius: 4px; color: var(--pa-text); font-weight: 500; }
.pa-gx-link { margin-left: auto; color: var(--pa-text-accent); }
.pa-gx-message { min-height: 80px; font-family: 'Lilex', ui-monospace, monospace; padding: 8px 10px; border-radius: 6px; background: var(--pa-panel-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-gx-message.filled { box-shadow: inset 0 0 0 1px var(--pa-text-accent); }
.pa-gx-commit-row { display: flex; align-items: center; gap: 8px; }
.pa-gx-plan { flex: 1; min-width: 0; display: inline-flex; align-items: center; gap: 4px; color: var(--pa-text-accent); white-space: nowrap; }
.pa-gx-commit { height: 28px; flex: none; display: inline-flex; align-items: stretch; border-radius: 6px; background: var(--pa-accent-fill); color: var(--pa-on-accent); }
.pa-gx-commit-main { display: inline-flex; align-items: center; padding: 0 12px; font-weight: 600; }
.pa-gx-commit-menu { display: inline-flex; align-items: center; padding: 0 7px; box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.2); }
.pa-gx-commit.disabled { background: var(--pa-element-hover); color: var(--pa-text-placeholder); }
.pa-gx-commit.disabled .pa-gx-commit-menu { box-shadow: inset 1px 0 0 var(--pa-border-variant); }
.pa-gx-why { display: flex; align-items: center; gap: 6px; color: var(--pa-text-placeholder); }
.pa-gx-last { display: flex; align-items: center; gap: 8px; padding-top: 6px; box-shadow: inset 0 1px 0 var(--pa-border-variant); white-space: nowrap; }
.pa-gx-last-subject { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; color: var(--pa-text-muted); }
</style>
