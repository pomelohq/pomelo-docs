<script setup>
import Icon from './Icon.vue'
// stage: index of the running stage; the ones before it are done.
defineProps({
  name: { type: String, default: 'Dark mode' },
  stage: { type: Number, default: 5 },
  detail: { type: String, default: 'web: setup' },
})
const stages = [
  'Validating config and hosts', 'Provisioning workspace', 'Starting shared services and databases',
  'Creating git worktrees (parallel)', 'Configuring repos (parallel)', 'Running setup commands (parallel)',
  'Seeding databases (parallel)',
]
</script>

<template>
  <div class="pa-wc">
    <div class="row pa-wc-title"><Icon name="rotate_cw" :size="12" class="pa-spin" /><span>{{ name }}</span></div>
    <div class="muted pa-wc-now">{{ stages[stage] }}</div>
    <div class="pa-wc-bar"><i :style="{ width: ((stage + 0.5) / stages.length) * 100 + '%' }" /></div>
    <template v-for="(text, i) in stages" :key="text">
      <div class="row pa-wc-stage" :class="{ todo: i > stage }">
        <Icon :name="i < stage ? 'check' : i === stage ? 'rotate_cw' : 'chevron_right'" :size="11"
          :class="i < stage ? 'pa-ok' : i === stage ? 'pa-spin' : ''" />
        <span class="trunc">{{ text }}</span>
      </div>
      <div v-if="i === stage && detail" class="mono muted pa-wc-detail">{{ detail }}</div>
    </template>
  </div>
</template>

<style>
.pa-wc { margin: 2px 0 6px; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--pa-border-variant);
  background: rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; gap: 3px; }
.pa-wc-title { gap: 6px; font-size: 13px; }
.pa-wc-now { font-size: 11.5px; }
.pa-wc-bar { height: 3px; border-radius: 2px; background: var(--pa-border-variant); margin: 4px 0 6px; overflow: hidden; }
.pa-wc-bar i { display: block; height: 100%; background: var(--pa-text-accent); transition: width 0.6s; }
.pa-wc-stage { gap: 6px; font-size: 11.5px; color: var(--pa-text-muted); height: 19px; }
.pa-wc-stage.todo { color: var(--pa-text-placeholder); }
.pa-wc-detail { font-size: 10.5px; padding-left: 17px; }
.pa .pa-ok { color: var(--pa-success); }
.pa .pa-spin { color: var(--pa-text-accent); }
</style>
