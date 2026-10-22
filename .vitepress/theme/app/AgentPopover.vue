<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './kit.css'

const props = defineProps({ branch: { type: String, default: 'feat-login' }, main: { type: String, default: '62k' } })
const roles = [
  { id: 'Ask', icon: 'help_circle', note: 'Why, how or where - about the code or the plan', tag: 'read-only' },
  { id: 'Review', icon: 'search', note: 'Read the branch diff and report bugs', tag: 'read-only' },
  { id: 'Second opinion', icon: 'messages', note: 'Same question to codex', tag: 'read-only' },
  { id: 'Fix', icon: 'wrench', note: 'Fix a bug or a failing check', tag: 'can edit' },
]
const role = ref('Ask')
const start = ref('Auto')
const second = computed(() => role.value === 'Second opinion')
const packet = 'Another CLI cannot read Claude\'s session; it gets a Pomelo packet.'
const starts = computed(() => [
  { id: 'Auto', tokens: second.value ? '~5.2k' : '~9.3k', note: second.value ? packet : `Main is ${props.main}, over 50k: fork it, then compact inside the fork.` },
  { id: 'Fork', tokens: '~' + props.main, disabled: second.value, note: second.value ? packet : 'A copy of main\'s whole session. Most detail; reuses main\'s prompt cache.' },
  { id: 'Compacted', tokens: '~9.3k', disabled: second.value, note: second.value ? packet : 'Fork, then /compact inside the fork. Main itself is never compacted.' },
  { id: 'Fresh', tokens: '~5.2k', note: 'No history. Pomelo writes a packet: branch, ticket, recent commits, changes.' },
])
const chosen = computed(() => starts.value.find(s => s.id === start.value) || starts.value[0])
function pick(id) {
  role.value = id
  if (id === 'Second opinion' && (start.value === 'Fork' || start.value === 'Compacted')) start.value = 'Fresh'
}
</script>

<template>
  <div class="pa-pop">
    <div class="pa-pop-head">New side agent in {{ branch }}</div>
    <div v-for="r in roles" :key="r.id" class="pa-pop-row role" :class="{ on: role === r.id }" @click="pick(r.id)">
      <Icon :name="r.icon" :size="13" class="pa-pop-icon" />
      <span class="pa-pop-text">
        <span class="pa-pop-title">{{ r.id }}</span>
        <span class="pa-pop-note">{{ r.note }}</span>
      </span>
      <span class="pa-pop-tag" :class="{ edit: r.tag === 'can edit' }">{{ r.tag }}</span>
    </div>
    <div class="pa-pop-sep" />
    <div class="pa-pop-sec"><span>Starts with</span><span>main: {{ main }} tokens</span></div>
    <div v-for="s in starts" :key="s.id" class="pa-pop-row start" :class="{ disabled: s.disabled }" @click="!s.disabled && (start = s.id)">
      <span class="pa-pop-radio" :class="{ on: start === s.id }" />
      <span class="pa-pop-text">
        <span class="pa-pop-line"><span class="pa-pop-title">{{ s.id }}</span><span class="pa-pop-tokens">{{ s.tokens }}</span></span>
        <span class="pa-pop-note">{{ s.note }}</span>
      </span>
    </div>
    <div class="pa-pop-foot">
      <span class="pa-pop-note">Double-click a type to start</span>
      <span class="pa-pop-start">Start {{ role }} - {{ chosen.tokens }} tokens</span>
    </div>
    <div class="pa-pop-sep" />
    <div class="pa-pop-row new">
      <Icon name="square_plus" :size="13" class="pa-pop-icon" />
      <span class="pa-pop-text">
        <span class="pa-pop-title">New agent in a new workspace</span>
        <span class="pa-pop-note">For parallel code changes: its own branch, ports and database</span>
      </span>
    </div>
  </div>
</template>

<style>
.pa-pop { width: 380px; min-height: 720px; padding: 4px; border-radius: 8px; background: var(--pa-elevated-surface-background);
  box-shadow: inset 0 0 0 1px var(--pa-border), 0 12px 32px rgba(0, 0, 0, 0.3); color: var(--pa-text); }
.pa-pop-head { height: 30px; padding: 0 10px; display: flex; align-items: center; font-size: 12.5px; color: var(--pa-text-muted); }
.pa-pop-row { display: flex; gap: 12px; padding: 0 10px; border-radius: 6px; cursor: pointer; }
.pa-pop-row.role { height: 50px; align-items: center; }
.pa-pop-row:hover { background: var(--pa-ghost-element-hover); }
.pa-pop-row.on { background: var(--pa-element-selected); }
.pa-pop-row.disabled { opacity: 0.45; cursor: default; }
.pa-pop-icon { color: var(--pa-icon-muted); }
.pa-pop-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pa-pop-title { font-size: 14px; line-height: 18px; }
.pa-pop-note { font-size: 12.5px; line-height: 16px; color: var(--pa-text-muted); }
.pa-pop-row.role .pa-pop-note { white-space: nowrap; }
.pa-pop-tag { flex: none; align-self: center; height: 20px; padding: 0 5px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 12px;
  color: var(--pa-text-muted); background: var(--pa-element-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-pop-tag.edit { color: var(--pa-warning); background: color-mix(in srgb, var(--pa-warning) 10%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa-warning) 50%, transparent); }
.pa-pop-sep { margin: 4px 0; height: 1px; background: var(--pa-border-variant); }
.pa-pop-sec { height: 28px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--pa-text-muted); }
.pa-pop-row.start { padding-top: 7px; padding-bottom: 7px; gap: 10px; min-height: 71px; align-items: flex-start; }
.pa-pop-line { display: flex; justify-content: space-between; align-items: center; }
.pa-pop-tokens { font: 13px/18px 'Lilex', ui-monospace, monospace; color: var(--pa-text-muted); }
.pa-pop-radio { flex: none; width: 16px; height: 16px; margin-top: 1px; border-radius: 50%; background: var(--pa-element-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-pop-radio.on { background: var(--pa-text-accent); box-shadow: inset 0 0 0 1.5px var(--pa-text-accent), inset 0 0 0 4px var(--pa-element-background); }
.pa-pop-foot { height: 42px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pa-pop-start { height: 28px; padding: 0 12px; border-radius: 5px; display: inline-flex; align-items: center; font-size: 13px; white-space: nowrap; cursor: pointer;
  background: var(--pa-info-background); box-shadow: inset 0 0 0 1px var(--pa-info-border); }
.pa-pop-row.new { padding-top: 6px; padding-bottom: 6px; align-items: center; }
</style>
