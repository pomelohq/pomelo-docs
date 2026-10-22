<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

// A read-only editor body: the app's gutter, indent guides and line metrics, colored by a small highlighter
// that maps words to the app's syntax capture names. crumbs/symbol draw the breadcrumb bar above it.
const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'ruby' },
  active: { type: Number, default: 0 },
  start: { type: Number, default: 1 },
  added: { type: Array, default: () => [] },
  modified: { type: Array, default: () => [] },
  caret: { type: Number, default: -1 },
  crumbs: { type: Array, default: () => [] },
  symbol: { type: Array, default: () => [] },
  tools: { type: Boolean, default: false },
  indent: { type: Number, default: 2 },
})

const KEYWORDS = {
  ruby: 'class module def end if elsif else unless return do while until case when then and or not self nil private protected require include yield begin rescue ensure',
  ts: 'import export from const let var function return if else for while type interface extends implements new class async await null undefined as of in',
  rust: 'fn let mut pub use mod struct enum impl trait for in if else match return self Self crate super where async await move const static',
  yaml: '',
}
const RULES = [
  [/^(#|\/\/).*/, 'comment'],
  [/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'|^`(?:[^`\\]|\\.)*`/, 'string'],
  [/^:[a-z_]\w*[?!]?/, 'symbol'],
  [/^@[a-z_]\w*/, 'property'],
  [/^\d[\d_.]*/, 'number'],
  [/^(true|false)\b/, 'string'],
  [/^[A-Z][A-Za-z0-9_]*/, 'constructor'],
  [/^[a-z_][\w-]*:(?=\s)/, 'key'],
  [/^[a-z_]\w*[?!]?(?=\()/, 'function'],
  [/^[a-z_]\w*[?!]?/, 'word'],
  [/^\{\{[^}]*\}\}/, 'constant'],
  [/^[()[\]{}]/, 'punctuation'],
  [/^[.,;]/, 'punctuation'],
  [/^(=>|==|!=|<=|>=|&&|\|\||[=+\-*/<>!|&?])/, 'operator'],
  [/^\s+/, null],
  [/^./, null],
]
const COLOR = {
  comment: 'comment', string: 'string', symbol: 'number', property: 'property', number: 'number', constructor: 'constructor',
  function: 'function', keyword: 'keyword', variable: 'variable', constant: 'constant', punctuation: 'punctuation', operator: 'operator',
}

function tokens(line) {
  const words = new Set((KEYWORDS[props.language] || '').split(' '))
  const out = []
  let rest = line
  let afterDot = false
  let lead = true
  while (rest.length) {
    for (const [re, kind] of RULES) {
      const m = rest.match(re)
      if (!m) continue
      let cls = kind
      if (kind === 'key') cls = props.language === 'ruby' ? 'symbol' : props.language === 'yaml' ? 'property' : 'variable'
      if (kind === 'word') {
        if (words.has(m[0])) cls = 'keyword'
        else if (afterDot) cls = 'function'
        else if (props.language === 'ruby' && lead && /^\s+[^=\s]/.test(rest.slice(m[0].length))) cls = 'function'
        else cls = 'variable'
      }
      if (kind !== null) { afterDot = m[0] === '.'; lead = false }
      out.push([COLOR[cls] || null, m[0]])
      rest = rest.slice(m[0].length)
      break
    }
  }
  return out
}

const symbols = computed(() => Array.isArray(props.symbol[0]) ? props.symbol : props.symbol.length ? [props.symbol] : [])
const texts = computed(() => props.code.replace(/\n$/, '').split('\n'))

// One guide per (block, level); a blank line takes the shallower of its neighbours' depths so guides run through it.
const guides = computed(() => {
  const unit = props.indent
  const raw = texts.value.map(t => t.trim() ? Math.floor((t.length - t.trimStart().length) / unit) : -1)
  const depth = raw.map((v, i) => {
    if (v >= 0) return v
    const before = raw.slice(0, i).reverse().find(e => e >= 0) ?? 0
    const after = raw.slice(i + 1).find(e => e >= 0) ?? 0
    return Math.min(before, after)
  })
  const out = []
  const deepest = Math.max(0, ...depth)
  for (let level = 0; level < deepest; level++) {
    let start = -1
    depth.forEach((v, i) => {
      if (v > level && start < 0) start = i
      if ((v <= level || i === depth.length - 1) && start >= 0) {
        out.push({ level, start, end: v > level ? i : i - 1, active: false })
        start = -1
      }
    })
  }
  const cursor = props.active - props.start
  const around = out.filter(g => g.start <= cursor && cursor <= g.end).sort((a, b) => b.level - a.level)[0]
  if (around) around.active = true
  return out
})

const lines = computed(() => texts.value.map((text, i) => ({
  number: props.start + i,
  parts: tokens(text),
  mark: props.added.includes(props.start + i) ? 'added' : props.modified.includes(props.start + i) ? 'modified' : '',
})))
</script>

<template>
  <div class="pa-editor">
    <div v-if="crumbs.length" class="pa-crumbs">
      <template v-for="(crumb, i) in crumbs" :key="crumb">
        <Icon v-if="i" name="chevron_right" :size="12" />
        <span :class="{ here: i === crumbs.length - 1 }">{{ crumb }}</span>
      </template>
      <span v-for="[kind, name] in symbols" :key="name" class="pa-crumb-symbol mono"><Icon name="chevron_right" :size="12" /><span
        style="color: var(--pa-syntax-keyword)">{{ kind }}</span> <span :style="{ color: kind === 'class' ? 'var(--pa-syntax-constructor)' : 'var(--pa-syntax-function)' }">{{ name }}</span></span>
      <span v-if="tools" class="pa-crumb-tools">
        <Icon name="search" :size="14" /><Icon name="cursor_i_beam" :size="14" /><Icon name="sliders" :size="14" />
      </span>
    </div>
    <div class="pa-code mono">
      <div v-if="active" class="pa-active-line" :style="{ top: 4 + (active - start) * 20 + 'px' }" />
      <div class="pa-gutter">
        <div v-for="line in lines" :key="line.number" :class="{ current: line.number === active }">
          <span v-if="line.mark" class="pa-change" :class="line.mark" />{{ line.number }}
        </div>
      </div>
      <div class="pa-text">
        <span class="pa-guides">
          <i v-for="g in guides" :key="g.level + '-' + g.start" :class="{ on: g.active }"
            :style="{ left: g.level * indent + 'ch', top: g.start * 20 + 'px', height: (g.end - g.start + 1) * 20 + 'px' }" />
        </span>
        <div v-for="line in lines" :key="line.number" class="pa-line"><span v-for="(part, i) in line.parts" :key="i"
          :style="part[0] ? { color: `var(--pa-syntax-${part[0]})` } : undefined">{{ part[1] }}</span><span
          v-if="line.number === caret" class="pa-caret" /></div>
      </div>
    </div>
  </div>
</template>

<style>
.pa-editor { flex: 1; min-height: 0; display: flex; flex-direction: column; background: var(--pa-editor-background); overflow: hidden; }
.pa-crumbs { flex: none; height: 28px; padding: 0 14px; gap: 4px; display: flex; align-items: center; font-size: 12px;
  color: var(--pa-text-placeholder); white-space: nowrap; overflow: hidden; }
.pa-crumbs .here { color: var(--pa-text-muted); }
.pa-crumb-symbol { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; white-space: pre; }
.pa-crumb-tools { margin-left: auto; margin-right: -6px; display: inline-flex; align-items: center; gap: 10px; }
.pa-code { position: relative; flex: 1; min-height: 0; display: flex; padding-top: 4px; overflow: hidden;
  color: var(--pa-editor-foreground); font-size: 13px; line-height: 20px; }
.pa-active-line { position: absolute; left: 0; right: 0; height: 20px; background: var(--pa-editor-active-line); pointer-events: none; }
.pa-gutter { position: relative; flex: none; width: 55px; padding-right: 34px; box-sizing: content-box !important; text-align: right;
  color: var(--pa-editor-line-number); }
.pa-gutter > div { position: relative; height: 20px; }
.pa-gutter .current { color: var(--pa-editor-active-line-number); }
.pa-change { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
.pa-change.added { background: var(--pa-version-control-added); }
.pa-change.modified { background: var(--pa-version-control-modified); }
.pa-text { position: relative; flex: 1; min-width: 0; }
.pa-line { height: 20px; white-space: pre; }
.pa-guides { position: absolute; inset: 0; pointer-events: none; }
.pa-guides i { position: absolute; width: 1px; background: var(--pa-editor-indent-guide); }
.pa-guides i.on { background: var(--pa-editor-indent-guide-active); }
.pa-caret { display: inline-block; width: 2px; height: 20px; vertical-align: top; background: var(--pa-player-cursor); }
</style>
