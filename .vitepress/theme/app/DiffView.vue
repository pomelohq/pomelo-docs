<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'

// Rows of the split view: [oldNo, oldText, newNo, newText, kind]; kind '' | 'add' | 'del' | 'mod'.
// A 'mod' run pairs removed lines with the added ones; null numbers are the blank side.
const rows = [
  [1, 'class SessionsController < ApplicationController', 1, 'class SessionsController < ApplicationController', ''],
  [null, '', 2, '  MAX_ATTEMPTS = 5', 'add'],
  [2, '', 3, '', ''],
  [3, '  def create', 4, '  def create', ''],
  [4, '    user = User.find_by(email: params[:email])', 5, '    user = User.find_by(email: params[:email])', ''],
  [5, '', 6, '', ''],
  [6, '    if user && user.authenticate(params[:password])', 7, '    if throttled?(params[:email])', 'mod'],
  [null, '', 8, '      return render json: { error: "too many attempts" }, status: :too_many_requests', 'mod'],
  [null, '', 9, '    end', 'mod'],
  [null, '', 10, '', 'mod'],
  [null, '', 11, '    if user&.authenticate(params[:password])', 'mod'],
  [7, '      session[:user_id] = user.id', 12, '      session[:user_id] = user.id', ''],
  [8, '      remember(user)', null, '', 'del'],
  [9, '    end', 13, '    end', ''],
  [10, '  end', 14, '  end', ''],
  [11, 'end', 15, 'end', ''],
  [12, '', 16, '', ''],
]
const unified = rows.flatMap(([oldNo, oldText, newNo, newText, kind]) => {
  if (!kind) return [{ no: newNo, text: newText, kind: '' }]
  const out = []
  if (oldNo !== null) out.push({ no: oldNo, text: oldText, kind: 'del' })
  if (newNo !== null) out.push({ no: newNo, text: newText, kind: 'add', bar: kind })
  return out
})
const split = ref(true)

const KEYWORDS = new Set('class def end if else elsif unless return do private self nil true false'.split(' '))
const RULES = [
  [/^#.*/, 'comment'],
  [/^"(?:[^"\\]|\\.)*"/, 'string'],
  [/^:[a-z_]\w*[?!]?/, 'string-special-symbol'],
  [/^[a-z_]\w*:(?=\s)/, 'string-special-symbol'],
  [/^@\w+/, 'variable-special'],
  [/^\d+/, 'number'],
  [/^[A-Z][A-Z0-9_]+\b/, 'constant'],
  [/^[A-Z]\w*/, 'constructor'],
  [/^[a-z_]\w*[?!]?(?=\()/, 'function'],
  [/^[a-z_]\w*[?!]?/, 'word'],
  [/^[()[\]{}.,&|=<>]+/, 'punctuation'],
  [/^\s+/, null],
  [/^./, null],
]
function tokens(line) {
  const out = []
  let rest = line
  let afterDot = false
  while (rest.length) {
    for (const [re, kind] of RULES) {
      const m = rest.match(re)
      if (!m) continue
      let cls = kind
      if (kind === 'word') cls = KEYWORDS.has(m[0]) ? 'keyword' : afterDot ? 'function' : 'variable'
      out.push([cls, m[0]])
      if (kind !== null || m[0].trim()) afterDot = m[0].endsWith('.')
      rest = rest.slice(m[0].length)
      break
    }
  }
  return out
}
const color = kind => kind ? { color: `var(--pa-syntax-${kind}, var(--pa-editor-foreground))` } : undefined
</script>

<template>
  <div class="pa-diff">
    <div class="row pa-diff-bar">
      <span class="pa-diff-btn" :class="{ on: !split }" @click="split = false"><Icon name="diff_unified" :size="14" /></span>
      <span class="pa-diff-btn" :class="{ on: split }" @click="split = true"><Icon name="diff_split" :size="14" /></span>
      <span class="grow" />
      <span class="mono pa-diff-sum"><span class="pa-diff-plus">+6</span><span class="pa-diff-minus">-2</span></span>
    </div>
    <div class="row pa-diff-crumbs">
      <span class="muted">sessions_controller.rb</span>
      <Icon name="chevron_right" :size="12" class="pa-diff-chev" />
      <span class="mono"><span :style="color('keyword')">class</span> <span :style="color('constructor')">SessionsController</span></span>
      <span class="grow" />
      <span class="pa-diff-tool"><Icon name="search" :size="14" /></span>
      <span class="pa-diff-tool"><Icon name="cursor_i_beam" :size="14" /></span>
      <span class="pa-diff-tool"><Icon name="sliders" :size="14" /></span>
    </div>
    <div v-if="split" class="pa-diff-body mono">
      <div v-for="(r, i) in rows" :key="i" class="pa-diff-row">
        <span class="pa-diff-side old" :class="{ del: r[0] !== null && (r[4] === 'mod' || r[4] === 'del') }">
          <span class="pa-diff-no">{{ r[0] ?? '' }}</span>
          <span class="pa-diff-text"><span v-for="(t, j) in tokens(r[1])" :key="j" :style="color(t[0])">{{ t[1] }}</span></span>
        </span>
        <span class="pa-diff-side new" :class="{ add: r[2] !== null && (r[4] === 'add' || r[4] === 'mod'), active: i === 0 }">
          <span class="pa-diff-bar-mark" :class="r[2] === null ? (r[4] === 'del' ? 'gone' : '') : r[4]" />
          <span class="pa-diff-no">{{ r[2] ?? '' }}</span>
          <span class="pa-diff-fold"><Icon v-if="i === 0" name="chevron_down" :size="10" /></span>
          <span class="pa-diff-text"><span v-if="i === 0" class="pa-diff-caret" /><span v-for="(t, j) in tokens(r[3])" :key="j" :style="color(t[0])">{{ t[1] }}</span></span>
        </span>
      </div>
    </div>
    <div v-else class="pa-diff-body mono">
      <div v-for="(line, i) in unified" :key="i" class="pa-diff-row">
        <span class="pa-diff-side new full" :class="{ add: line.kind === 'add', del: line.kind === 'del', active: i === 0 }">
          <span class="pa-diff-bar-mark" :class="line.kind === 'del' ? 'del' : line.bar || ''" />
          <span class="pa-diff-no">{{ line.no }}</span>
          <span class="pa-diff-fold"><Icon v-if="i === 0" name="chevron_down" :size="10" /></span>
          <span class="pa-diff-text"><span v-if="i === 0" class="pa-diff-caret" /><span v-for="(t, j) in tokens(line.text)" :key="j" :style="color(t[0])">{{ t[1] }}</span></span>
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-diff { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); }
.pa-diff-bar { height: 32px; padding: 0 8px 0 9px; flex: none; border-bottom: 1px solid var(--pa-border); }
.pa-diff-btn { width: 22px; height: 21px; margin-top: -5px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
  color: var(--pa-icon-muted); cursor: pointer; }
.pa-diff-btn.on { background: var(--pa-element-selected); color: var(--pa-icon-accent); }
.pa-diff-sum { display: flex; gap: 8px; font-size: 12px; }
.pa-diff-plus { color: var(--pa-version-control-added); }
.pa-diff-minus { color: var(--pa-version-control-deleted); }
.pa-diff-crumbs { height: 32px; padding: 0 10px 0 13px; gap: 6px; flex: none; font-size: 12px; }
.pa-diff-crumbs .mono { font-size: 13px; }
.pa-diff-chev { color: var(--pa-icon-muted); }
.pa-diff-tool { width: 24px; height: 22px; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); }
.pa-diff-body { flex: 1; min-height: 0; overflow: hidden; font-size: 13px; color: var(--pa-editor-foreground); }
.pa-diff-row { display: flex; height: 20px; line-height: 20px; }
.pa-diff-side { position: relative; flex: none; width: 50.1%; min-width: 0; display: flex; white-space: pre; overflow: hidden; }
.pa-diff-side.new { flex: 1; width: auto; border-left: 1px solid var(--pa-border-variant); }
.pa-diff-side.full { border-left: 0; }
.pa-diff-side.add { background: color-mix(in srgb, var(--pa-version-control-added) 12%, transparent); }
.pa-diff-side.del { background: color-mix(in srgb, var(--pa-version-control-deleted) 12%, transparent); }
.pa-diff-side.active:not(.add) { background: var(--pa-editor-active-line); }
.pa-diff-no { flex: none; text-align: right; color: var(--pa-editor-line-number); }
.pa-diff-side.old .pa-diff-no { width: 80px; margin-right: 16px; }
.pa-diff-side.new .pa-diff-no { width: 53px; margin-left: -5px; }
.pa-diff-side.active .pa-diff-no { color: var(--pa-editor-active-line-number); }
.pa-diff-fold { width: 36px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); }
.pa-diff-bar-mark { width: 5px; flex: none; align-self: stretch; }
.pa-diff-bar-mark.add { background: var(--pa-version-control-added); }
.pa-diff-bar-mark.mod { background: var(--pa-version-control-modified); }
.pa-diff-bar-mark.del { background: var(--pa-version-control-deleted); }
.pa-diff-bar-mark.gone { width: 7px; margin-right: -2px; border-radius: 0 10px 10px 0; background: var(--pa-version-control-deleted); }
.pa-diff-text { position: relative; }
.pa-diff-caret { position: absolute; left: 0; top: 0; width: 2px; height: 20px; background: var(--pa-player-cursor); }
</style>
