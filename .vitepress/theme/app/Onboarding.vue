<script setup>
import Icon from './Icon.vue'
const repos = [['api', 'linked'], ['web', 'linked'], ['worker', 'cloned']]
const scan = [['api', ['Rails', 'postgres', 'redis'], '3 env'], ['web', ['Vite'], '1 env'], ['worker', ['Node', 'redis', 'minio'], '0 env']]
const log = [
  [['api:', 1], [' services ', 0], ['web', 1], [' (bundle exec puma), ', 0], ['jobs', 1], [' (bundle exec sidekiq)', 0]],
  [['api:', 1], [' setup bundle install - migrate bin/rails db:migrate', 0]],
  [['api:', 1], [' DATABASE_URL -> postgresql://{{shared.postgres.url}}/{{db.main}}', 0]],
  [['web:', 1], [' services ', 0], ['dev', 1], [' (pnpm vite --port $PORT)', 0]],
]
</script>

<template>
  <div class="pa-ob">
    <div class="row pa-ob-head">
      <span class="pa-ob-logo">P</span>
      <div class="col grow">
        <span class="pa-ob-title">Setting up myproject</span>
        <span class="muted pa-ob-sub">3 repositories - 1m 12s so far</span>
      </div>
      <span class="pa-ob-btn"><Icon name="sparkle" :size="12" />Hide agent CLI</span>
      <span class="pa-ob-btn">Pause</span>
      <span class="pa-ob-btn ghost">Cancel</span>
    </div>
    <div class="pa-ob-rule" />
    <div class="row pa-ob-progress"><span class="pa-ob-track"><i style="width: 50%" /></span><span class="muted">50%</span></div>
    <div class="pa-ob-phase">
      <div class="pa-ob-rail"><span class="pa-mark done"><Icon name="check" :size="11" /></span><i /></div>
      <div class="col grow pa-ob-body">
        <div class="row pa-ob-ptitle"><span class="grow">Clone repositories</span><span class="muted pa-hint">4s</span></div>
        <div v-for="[name, how] in repos" :key="name" class="row pa-ob-repo">
          <span class="mono pa-ob-name">{{ name }}</span><span class="pa-ob-track thin"><i style="width: 100%" /></span>
          <span class="muted pa-hint pa-ob-how">{{ how }}</span>
        </div>
      </div>
    </div>
    <div class="pa-ob-phase">
      <div class="pa-ob-rail"><span class="pa-mark done"><Icon name="check" :size="11" /></span><i /></div>
      <div class="col grow pa-ob-body">
        <div class="row pa-ob-ptitle"><span>Scan</span><span class="pa-ob-chip">0 tokens</span><span class="grow" /><span class="muted pa-hint">1s</span></div>
        <div class="pa-ob-table">
          <div v-for="[name, chips, env] in scan" :key="name" class="row pa-ob-trow">
            <span class="mono pa-ob-name">{{ name }}</span>
            <span class="row grow" style="gap: 6px"><span v-for="c in chips" :key="c" class="pa-ob-chip">{{ c }}</span></span>
            <span class="muted pa-hint">{{ env }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="pa-ob-phase">
      <div class="pa-ob-rail"><span class="pa-mark working"><Icon name="rotate_cw" :size="11" /></span><i /></div>
      <div class="col grow pa-ob-body">
        <div class="row pa-ob-ptitle"><span class="grow">Configure with Claude Code</span><span class="muted pa-hint">52s</span></div>
        <div class="pa-ob-log mono">
          <div v-for="(line, i) in log" :key="i" class="trunc"><span v-for="(p, j) in line" :key="j" :class="p[1] ? 'strong' : 'muted'">{{ p[0] }}</span></div>
        </div>
        <div class="row" style="gap: 6px">
          <span class="pa-ob-btn"><Icon name="sparkle" :size="12" />Hide agent CLI</span>
          <span class="pa-ob-btn">Open pom.yml</span>
          <span class="grow" />
          <span class="muted pa-ob-link">Skip the agent - finish manually</span>
        </div>
      </div>
    </div>
    <div class="pa-ob-phase last">
      <div class="pa-ob-rail"><span class="pa-mark">4</span></div>
      <div class="col grow pa-ob-body"><div class="row pa-ob-ptitle muted">Verify</div></div>
    </div>
  </div>
</template>

<style>
.pa-ob { height: 100%; padding: 32px 40px; background: var(--pa-editor-background); display: flex; flex-direction: column; }
.pa-ob-head { gap: 16px; }
.pa-ob-logo { width: 40px; height: 40px; border-radius: 9px; background: #a63d9e; color: #fff; font-weight: 600; font-size: 17px;
  display: flex; align-items: center; justify-content: center; }
.pa-ob-title { font-size: 20px; font-weight: 600; }
.pa-ob-sub { font-size: 12.5px; font-style: italic; margin-top: 2px; }
.pa-ob-btn { height: 28px; padding: 0 12px; gap: 6px; border-radius: 5px; display: inline-flex; align-items: center; font-size: 13px;
  border: 1px solid var(--pa-border); background: var(--pa-element-background); white-space: nowrap; }
.pa-ob-btn.ghost { border-color: transparent; background: none; color: var(--pa-text-muted); }
.pa-ob-rule { height: 1px; background: var(--pa-border-variant); margin: 22px 0 18px; }
.pa-ob-progress { gap: 12px; font-size: 12px; margin-bottom: 22px; }
.pa-ob-track { flex: 1; height: 4px; border-radius: 2px; background: var(--pa-border-variant); overflow: hidden; display: flex; }
.pa-ob-track i { background: var(--pa-text-accent); display: block; }
.pa-ob-track.thin { height: 3px; }
.pa-ob-phase { display: flex; gap: 12px; }
.pa-ob-rail { width: 20px; display: flex; flex-direction: column; align-items: center; }
.pa-ob-rail > i { width: 1px; flex: 1; background: var(--pa-border-variant); display: block; }
.pa-mark { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--pa-border); display: flex; align-items: center;
  justify-content: center; font-size: 11px; color: var(--pa-text-muted); flex: none; }
.pa-mark.done { border-color: color-mix(in srgb, var(--pa-success) 60%, transparent); color: var(--pa-success);
  background: color-mix(in srgb, var(--pa-success) 15%, transparent); }
.pa-mark.working { border-color: var(--pa-text-accent); color: var(--pa-text-accent); }
.pa-ob-body { padding-bottom: 16px; gap: 6px; }
.pa-ob-ptitle { gap: 8px; font-size: 14px; min-height: 20px; }
.pa .pa-hint { font-size: 12px; }
.pa-ob-repo { gap: 10px; font-size: 13px; }
.pa-ob-name { width: 150px; flex: none; font-size: 13px; }
.pa-ob-how { width: 60px; text-align: right; }
.pa-ob-chip { height: 20px; padding: 0 6px; border-radius: 4px; border: 1px solid var(--pa-border-variant); font-size: 12px;
  display: inline-flex; align-items: center; }
.pa-ob-table { border: 1px solid var(--pa-border-variant); border-radius: 6px; }
.pa-ob-trow { height: 34px; padding: 0 10px; gap: 10px; }
.pa-ob-trow + .pa-ob-trow { border-top: 1px solid var(--pa-border-variant); }
.pa-ob-log { padding: 8px 10px; border-radius: 6px; background: rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; gap: 3px; font-size: 12px; }
html:not(.dark) .pa-ob-log { background: rgba(0, 0, 0, 0.05); }
.pa-ob-log .strong { color: var(--pa-text); font-weight: 500; }
.pa-ob-link { font-size: 12.5px; }
</style>
