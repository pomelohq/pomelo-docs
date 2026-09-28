<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
// Rows: [oldNo, oldText, newNo, newText, kind] with kind '' | 'add' | 'del' | 'mod'.
const rows = [
  [1, 'class SessionsController < ApplicationController', 1, 'class SessionsController < ApplicationController', ''],
  [null, '', 2, '  MAX_ATTEMPTS = 5', 'add'],
  [2, '', 3, '', ''],
  [3, '  def create', 4, '  def create', ''],
  [4, '    user = User.find_by(email: params[:email])', 5, '    user = User.find_by(email: params[:email])', ''],
  [null, '', 6, '', 'add'],
  [null, '', 7, '    if throttled?(params[:email])', 'add'],
  [null, '', 8, '      return render json: { error: "too many attempts" }, status: :too_many_requests', 'add'],
  [null, '', 9, '    end', 'add'],
  [5, '', 10, '', ''],
  [6, '    if user && user.authenticate(params[:password])', 11, '    if user&.authenticate(params[:password])', 'mod'],
  [7, '      session[:user_id] = user.id', 12, '      session[:user_id] = user.id', ''],
  [8, '      remember(user)', null, '', 'del'],
  [9, '    end', 13, '    end', ''],
]
const split = ref(true)
</script>

<template>
  <div class="pa-diff">
    <div class="row pa-diff-bar">
      <span class="pa-diff-btn" :class="{ on: !split }" @click="split = false"><Icon name="diff_unified" :size="14" /></span>
      <span class="pa-diff-btn" :class="{ on: split }" @click="split = true"><Icon name="diff_split" :size="14" /></span>
      <span class="pa-sm muted" style="margin-left: 6px">app/controllers/sessions_controller.rb</span>
      <span class="grow" />
      <span class="mono pa-sm"><span style="color: var(--pa-version-control-added)">+12</span> <span style="color: var(--pa-version-control-deleted)">-2</span></span>
    </div>
    <div class="pa-diff-body mono">
      <template v-if="split">
        <div v-for="(r, i) in rows" :key="i" class="pa-diff-row">
          <span class="pa-diff-side" :class="{ del: r[4] === 'mod' || r[4] === 'del', empty: r[0] === null }">
            <span class="pa-diff-no">{{ r[0] ?? '' }}</span><span class="pa-diff-text">{{ r[1] }}</span></span>
          <span class="pa-diff-side" :class="{ add: r[4] === 'add' || r[4] === 'mod', empty: r[2] === null }">
            <span class="pa-diff-no">{{ r[2] ?? '' }}</span><span class="pa-diff-text">{{ r[3] }}</span></span>
        </div>
      </template>
      <template v-else>
        <template v-for="(r, i) in rows" :key="i">
          <div v-if="r[4] === 'mod' || r[4] === 'del'" class="pa-diff-row"><span class="pa-diff-side del full"><span class="pa-diff-no">{{ r[0] }}</span><span class="pa-diff-text">{{ r[1] }}</span></span></div>
          <div v-if="r[4] !== 'del'" class="pa-diff-row"><span class="pa-diff-side full" :class="{ add: r[4] === 'add' || r[4] === 'mod' }">
            <span class="pa-diff-no">{{ r[2] }}</span><span class="pa-diff-text">{{ r[3] }}</span></span></div>
        </template>
      </template>
    </div>
  </div>
</template>

<style>
.pa-diff { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); }
.pa-diff-bar { height: 32px; padding: 0 8px; gap: 2px; background: var(--pa-toolbar-background); border-bottom: 1px solid var(--pa-border); flex: none; }
.pa-diff-btn { width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); cursor: pointer; }
.pa-diff-btn.on { background: var(--pa-element-selected); color: var(--pa-icon); }
.pa-diff-body { flex: 1; overflow: hidden; font-size: 13px; }
.pa-diff-row { display: flex; height: 21px; line-height: 21px; }
.pa-diff-side { flex: 1; min-width: 0; display: flex; white-space: pre; overflow: hidden; }
.pa-diff-side + .pa-diff-side { border-left: 1px solid var(--pa-border-variant); }
.pa-diff-side.full { flex: 1; }
.pa-diff-side.add { background: color-mix(in srgb, var(--pa-version-control-added) 14%, transparent); }
.pa-diff-side.del { background: color-mix(in srgb, var(--pa-version-control-deleted) 14%, transparent); }
/* The side with no line: 45 degree stripes in the panel color, 12px apart, as the app draws them. */
.pa-diff-side.empty .pa-diff-text { flex: 1; background: repeating-linear-gradient(135deg, var(--pa-panel-background) 0 1px, transparent 1px 8.49px); }
.pa-diff-no { width: 38px; flex: none; text-align: right; padding-right: 10px; color: var(--pa-editor-line-number); }
.pa-diff-text { color: var(--pa-editor-foreground); }
</style>
