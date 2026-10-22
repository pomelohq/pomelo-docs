<script setup>
import Icon from './Icon.vue'
import Meter from './Meter.vue'
import WorkspacesList from './WorkspacesList.vue'
import Keys from '../Keys.vue'

// The window: title bar, the workspaces column (or the folded rail) and the main column, where the docks and
// the center float as rounded panels on the window background, above the status bar.
defineProps({
  project: { type: String, default: 'myproject' },
  branch: { type: String, default: 'feat-login' },
  needs: { type: String, default: 'API-102 needs you' },
  needsKeys: { type: String, default: 'alt-cmd-a' },
  account: { type: String, default: 'Alex' },
  session: { type: Number, default: 8 },
  weekly: { type: Number, default: 26 },
  today: { type: String, default: '$128' },
  sidebar: { type: Number, default: 256 },
  rail: { type: Boolean, default: false },
  dock: { type: Number, default: 280 },
  right: { type: Number, default: 380 },
  bottom: { type: Number, default: 360 },
  active: { type: String, default: 'files' },
  cursor: { type: String, default: '8:12' },
  language: { type: String, default: 'Ruby' },
})
const functions = [['files', 'folder'], ['services', 'server'], ['git', 'branch'], ['database', 'cylinder']]
</script>

<template>
  <div class="pa-window">
    <div class="pa-title">
      <span class="pa-lights"><i /><i /><i /></span>
      <span class="pa-title-project">{{ project }}</span>
      <span class="pa-title-branch"><Icon name="branch" :size="12" />{{ branch }}</span>
      <span class="pa-title-right">
        <template v-if="needs">
          <span class="pa-pill-attention">{{ needs }}</span>
          <span class="pa-kbd pa-keys"><Keys :k="needsKeys" /></span>
        </template>
        <span class="pa-usage-chip mono">
          <Icon name="sparkle" :size="12" />
          <b>{{ account }}</b>
          <Meter :used="session" :width="36" />
          <b>{{ session }}%</b><span>5h</span><b>{{ weekly }}%</b><span>wk</span>
        </span>
        <span class="pa-title-menu"><Icon name="chevron_down" :size="12" /></span>
      </span>
    </div>
    <div class="pa-frame-row">
      <aside class="pa-side" :style="{ width: (rail ? 56 : sidebar) + 'px' }">
        <div class="pa-side-content"><slot name="sidebar"><WorkspacesList :rail="rail" /></slot></div>
        <div class="pa-side-foot" :class="{ rail }"><span class="pa-sb-btn" :class="{ on: !rail }"><Icon name="sidebar" :size="13" /></span></div>
      </aside>
      <div class="pa-main">
        <div class="pa-body">
          <div v-if="$slots.dock" class="pa-pane pa-pane-side" :style="{ width: dock + 'px' }"><slot name="dock" /></div>
          <div class="pa-body-center">
            <div class="pa-pane pa-pane-center"><slot /></div>
            <div v-if="$slots.bottom" class="pa-pane pa-pane-bottom" :style="{ height: bottom + 'px' }"><slot name="bottom" /></div>
          </div>
          <div v-if="$slots.right" class="pa-pane pa-pane-side" :style="{ width: right + 'px' }"><slot name="right" /></div>
        </div>
        <div class="pa-status">
          <span class="pa-fn-bar">
            <span v-for="[id, icon] in functions" :key="id" class="pa-sb-btn" :class="{ on: active === id }"><Icon :name="icon" :size="13" /></span>
          </span>
          <span class="pa-sb-btn"><Icon name="ticket" :size="13" /></span>
          <i class="pa-sb-sep" />
          <span class="pa-sb-btn"><Icon name="bolt_outlined" :size="14" /><i class="pa-sb-dot" /></span>
          <span class="pa-sb-item"><Icon name="check" :size="14" /></span>
          <span class="pa-status-right">
            <span v-if="cursor" class="pa-sb-item">{{ cursor }}</span>
            <span v-if="language" class="pa-sb-item">{{ language }}</span>
            <i v-if="cursor || language" class="pa-sb-sep" />
            <span class="pa-sb-btn pa-sb-today"><Icon name="sparkle" :size="12" />{{ today }} today</span>
            <i class="pa-sb-sep" />
            <span class="pa-sb-btn" :class="{ on: !!$slots.bottom }"><Icon name="terminal" :size="13" /></span>
            <span class="pa-sb-btn" :class="{ on: !!$slots.right }"><Icon name="sparkle" :size="13" /></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.pa-window { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--pa-background); color: var(--pa-text); }
.pa-title { flex: none; height: 40px; padding: 0 14px 0 20px; gap: 10px; display: flex; align-items: center; background: var(--pa-title-bar-background); }
.pa-lights { display: inline-flex; gap: 8px; margin-right: 4px; }
.pa-lights i { width: 12px; height: 12px; border-radius: 50%; background: #ff5f57; }
.pa-lights i:nth-child(2) { background: #febc2e; }
.pa-lights i:nth-child(3) { background: #28c840; }
.pa-title-project { font-size: 13px; font-weight: 500; line-height: 20px; }
.pa-title-branch { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--pa-text-muted); }
.pa-title-right { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; }
.pa-kbd { flex: none; height: 18px; padding: 0 5px; border-radius: 4px; display: inline-flex; align-items: center; white-space: nowrap;
  font-size: 11px; font-weight: 500; background: var(--pa-element-hover); color: var(--pa-text-muted); }
.pa .pa-kbd .pom-keys { gap: 4px; }
.pa .pa-kbd .pom-stroke { border: 0; background: none; padding: 0; gap: 1px; color: inherit; }
.pa .pa-kbd .pom-glyph { width: 11px; height: 11px; }
.pa .pa-kbd .pom-key { font-size: 11px; min-width: 0; }
.pa-usage-chip { height: 24px; padding: 0 8px; gap: 6px; border-radius: 12px; display: inline-flex; align-items: center; white-space: nowrap;
  font-size: 12px; line-height: 1; color: var(--pa-text-placeholder); background: color-mix(in srgb, var(--pa-text) 5%, transparent); }
.pa-usage-chip b { font-weight: 400; color: var(--pa-text); }
.pa-title-menu { width: 22px; height: 22px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: var(--pa-text-placeholder); }
.pa-frame-row { flex: 1; display: flex; min-height: 0; }
.pa-side { flex: none; display: flex; flex-direction: column; min-height: 0; }
.pa-side-content { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.pa-side-foot { flex: none; height: 28px; padding: 0 8px; display: flex; align-items: center; justify-content: flex-end; }
.pa-side-foot.rail { justify-content: center; padding: 0; }
.pa-main { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.pa-body { flex: 1; display: flex; gap: 6px; padding: 0 6px 0 0; min-height: 0; }
.pa-body-center { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; min-height: 0; }
.pa-pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; border-radius: 10px;
  box-shadow: 0 0 0 1px #00000040, 0 1px 2px #00000040; }
html:not(.dark) .pa-pane { box-shadow: 0 0 0 1px #1d17300f, 0 1px 2px #1d17300f; }
.pa-pane-side { flex: none; background: var(--pa-panel-background); }
.pa-pane-center { flex: 1; background: var(--pa-editor-background); }
.pa-pane-bottom { flex: none; background: var(--pa-editor-background); }
.pa-status { flex: none; height: 28px; padding: 0 8px; gap: 6px; display: flex; align-items: center; font-size: 12px; color: var(--pa-text-muted); }
.pa-fn-bar { display: inline-flex; gap: 2px; }
.pa-sb-btn { position: relative; height: 20px; min-width: 26px; padding: 0 4px; gap: 6px; border-radius: 5px; display: inline-flex; align-items: center;
  justify-content: center; white-space: nowrap; color: var(--pa-text-placeholder); }
.pa-sb-btn:hover { background: var(--pa-element-hover); }
.pa-sb-btn.on { color: var(--pa-text-accent); }
.pa-sb-dot { width: 6px; height: 6px; margin: 0 0 3px -5px; align-self: flex-end; border-radius: 50%; background: var(--pa-success); }
.pa-sb-item { height: 20px; padding: 0 4px; gap: 4px; display: inline-flex; align-items: center; color: var(--pa-text); }
.pa-sb-sep { flex: none; width: 1px; height: 14px; background: var(--pa-border-variant); }
.pa-status-right { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; }
.pa-sb-today { padding: 0 6px; color: var(--pa-text-muted); }
</style>
