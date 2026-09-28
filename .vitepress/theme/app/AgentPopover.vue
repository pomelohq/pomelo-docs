<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({ branch: { type: String, default: 'feat-login' }, main: { type: String, default: '9.3k' } })
const roles = [
  { id: 'Ask', icon: 'help_circle', note: 'Why, how or where - about the code or the plan', tag: 'read-only' },
  { id: 'Review', icon: 'search', note: 'Read the branch diff and report bugs', tag: 'read-only' },
  { id: 'Second opinion', icon: 'messages', note: 'Same question to codex', tag: 'read-only' },
  { id: 'Fix', icon: 'wrench', note: 'Fix a bug or a failing check', tag: 'can edit' },
]
const role = ref('Ask')
const start = ref('Auto')
const second = computed(() => role.value === 'Second opinion')
const starts = computed(() => [
  { id: 'Auto', tokens: second.value ? '~2.1k' : '~' + props.main,
    note: second.value ? 'Another CLI cannot read Claude\'s session; it gets a Pomelo packet.' : `Main is ${props.main}: fork the whole session.` },
  { id: 'Fork', tokens: '~' + props.main, disabled: second.value,
    note: second.value ? 'Another CLI cannot read Claude\'s session; it gets a Pomelo packet.' : 'A copy of main\'s whole session. Most detail; reuses main\'s prompt cache.' },
  { id: 'Compacted', tokens: '~3.4k', disabled: second.value,
    note: second.value ? 'Another CLI cannot read Claude\'s session; it gets a Pomelo packet.' : 'Fork, then /compact inside the fork. Main itself is never compacted.' },
  { id: 'Fresh', tokens: '~2.1k', note: 'No history. Pomelo writes a packet: branch, ticket, recent commits, changes.' },
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
    <div v-for="r in roles" :key="r.id" class="pa-pop-row" :class="{ on: role === r.id }" @click="pick(r.id)">
      <Icon :name="r.icon" :size="15" class="icon-muted" />
      <div class="col pa-pop-text">
        <span class="pa-pop-title">{{ r.id }}</span>
        <span class="muted pa-pop-note">{{ r.note }}</span>
      </div>
      <span class="grow" />
      <span class="pa-access" :class="{ edit: r.tag === 'can edit' }">{{ r.tag }}</span>
    </div>
    <div class="pa-pop-sep" />
    <div class="row pa-pop-sec"><span class="grow">Starts with</span><span>main: {{ main }} tokens</span></div>
    <div v-for="s in starts" :key="s.id" class="pa-pop-row start" :class="{ on: start === s.id, disabled: s.disabled }"
      @click="!s.disabled && (start = s.id)">
      <span class="pa-radio" :class="{ on: start === s.id }"><i /></span>
      <div class="col grow pa-pop-text wide">
        <span class="row"><span class="pa-pop-title grow">{{ s.id }}</span><span class="mono muted pa-pop-tokens">{{ s.tokens }}</span></span>
        <span class="muted pa-pop-note">{{ s.note }}</span>
      </div>
    </div>
    <div class="row pa-pop-foot">
      <span class="muted pa-pop-note grow">Double-click a type to start</span>
      <span class="pa-start">Start {{ role }} - {{ chosen.tokens }} tokens</span>
    </div>
    <div class="pa-pop-sep" />
    <div class="pa-pop-row">
      <Icon name="square_plus" :size="15" class="icon-muted" />
      <div class="col pa-pop-text wide">
        <span class="pa-pop-title">New agent in a new workspace</span>
        <span class="muted pa-pop-note">For parallel code changes: its own branch, ports and database</span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-pop { width: 380px; padding: 4px; border-radius: 8px; background: var(--pa-elevated-surface-background);
  border: 1px solid var(--pa-border); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28); }
.pa-pop-head { height: 30px; padding: 0 10px; display: flex; align-items: center; font-size: 12.5px; color: var(--pa-text-muted); }
.pa-pop-row { padding: 6px 10px; gap: 10px; border-radius: 6px; display: flex; align-items: flex-start; cursor: pointer; }
.pa-pop-row > .pa-icon { margin-top: 2px; }
.pa-pop-row:hover { background: var(--pa-ghost-element-hover); }
.pa-pop-row.on { background: var(--pa-element-selected); }
.pa-pop-row.disabled { opacity: 0.45; cursor: default; }
.pa-pop-text { width: 215px; gap: 1px; }
.pa-pop-text.wide { width: auto; flex: 1; }
.pa-pop-title { font-size: 14px; }
.pa-pop-note { font-size: 12.5px; line-height: 1.35; }
.pa-pop-tokens { font-size: 13px; }
.pa-access { height: 20px; padding: 0 6px; border-radius: 4px; font-size: 12px; display: inline-flex; align-items: center;
  color: var(--pa-text-muted); border: 1px solid var(--pa-border-variant); white-space: nowrap; align-self: center; }
.pa-access.edit { color: var(--pa-warning); border-color: color-mix(in srgb, var(--pa-warning) 50%, transparent); }
.pa-pop-sep { margin: 4px; height: 1px; background: var(--pa-border-variant); }
.pa-pop-sec { height: 28px; padding: 0 10px; font-size: 12.5px; color: var(--pa-text-muted); }
.pa-radio { flex: none; width: 16px; height: 16px; margin-top: 2px; border-radius: 8px; border: 1.5px solid var(--pa-border);
  display: flex; align-items: center; justify-content: center; }
.pa-radio.on { border-color: var(--pa-text-accent); }
.pa-radio i { width: 8px; height: 8px; border-radius: 50%; display: none; background: var(--pa-text-accent); }
.pa-radio.on i { display: block; }
.pa-pop-foot { height: 40px; padding: 0 10px; gap: 8px; }
.pa-start { height: 28px; padding: 0 12px; border-radius: 5px; display: inline-flex; align-items: center; font-size: 13px;
  background: var(--pa-info-background); border: 1px solid var(--pa-info-border); white-space: nowrap; }
.pa-start:hover { background: color-mix(in srgb, var(--pa-info-border) 40%, transparent); }
</style>
