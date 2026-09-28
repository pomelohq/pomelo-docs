<script setup>
import { computed } from 'vue'

// A read-only editor body: the app's gutter and line metrics, colored by a small highlighter that
// maps words to the app's syntax capture names.
const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'ruby' },
  active: { type: Number, default: 0 },
  start: { type: Number, default: 1 },
  added: { type: Array, default: () => [] },
  modified: { type: Array, default: () => [] },
  caret: { type: Number, default: -1 },
})

const KEYWORDS = {
  ruby: 'class module def end if elsif else unless return do while until case when then and or not self nil true false private protected require include yield begin rescue ensure',
  ts: 'import export from const let var function return if else for while type interface extends implements new class async await true false null undefined as of in',
  rust: 'fn let mut pub use mod struct enum impl trait for in if else match return self Self crate super where async await move const static true false',
  yaml: 'true false null',
}
const RULES = [
  [/^(#|\/\/).*/, 'comment'],
  [/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, 'string'],
  [/^:[a-z_]\w*[?!]?/, 'string-special-symbol'],
  [/^@[a-z_]\w*/, 'variable-special'],
  [/^\d[\d_.]*/, 'number'],
  [/^[A-Z][A-Za-z0-9_]*/, 'type'],
  [/^[a-z_][\w]*[?!]?(?=\()/, 'function'],
  [/^[a-z_][\w-]*(?=:\s)/, 'property'],
  [/^[a-z_][\w]*[?!]?/, 'word'],
  [/^\{\{[^}]*\}\}/, 'constant'],
  [/^[()[\]{}]/, 'punctuation-bracket'],
  [/^[.,;]/, 'punctuation-delimiter'],
  [/^(=>|==|!=|<=|>=|&&|\|\||[=+\-*/<>!|&?])/, 'operator'],
  [/^\s+/, null],
  [/^./, null],
]

function tokens(line) {
  const words = new Set((KEYWORDS[props.language] || '').split(' '))
  const out = []
  let rest = line
  while (rest.length) {
    for (const [re, kind] of RULES) {
      const m = rest.match(re)
      if (!m) continue
      let cls = kind
      if (kind === 'word') cls = words.has(m[0]) ? 'keyword' : 'variable'
      if (kind === 'property' && props.language !== 'yaml' && props.language !== 'ts') cls = words.has(m[0]) ? 'keyword' : 'variable'
      out.push([cls, m[0]])
      rest = rest.slice(m[0].length)
      break
    }
  }
  return out
}

const lines = computed(() => props.code.replace(/\n$/, '').split('\n').map((text, i) => ({
  number: props.start + i,
  parts: tokens(text),
  mark: props.added.includes(props.start + i) ? 'added' : props.modified.includes(props.start + i) ? 'modified' : '',
})))
</script>

<template>
  <div class="pa-code mono">
    <div v-for="line in lines" :key="line.number" class="pa-line" :class="{ active: line.number === active }">
      <span class="pa-gutter"><span v-if="line.mark" class="pa-change" :class="line.mark" />{{ line.number }}</span>
      <span class="pa-text"><span v-for="(part, i) in line.parts" :key="i"
        :style="part[0] ? { color: `var(--pa-syntax-${part[0]}, var(--pa-editor-foreground))` } : undefined">{{ part[1] }}</span><span
        v-if="line.number === caret" class="pa-caret" /></span>
    </div>
  </div>
</template>

<style>
.pa-code { flex: 1; min-height: 0; overflow: hidden; background: var(--pa-editor-background); color: var(--pa-editor-foreground);
  font-size: 15px; padding-top: 4px; }
.pa-line { display: flex; height: 24px; line-height: 24px; white-space: pre; }
.pa-line.active { background: var(--pa-editor-active-line); }
.pa-gutter { position: relative; flex: none; width: 76px; padding-right: 36px; text-align: right; color: var(--pa-editor-line-number); }
.pa-line.active .pa-gutter { color: var(--pa-editor-active-line-number); }
.pa-change { position: absolute; left: 12px; top: 0; bottom: 0; width: 3px; }
.pa-change.added { background: var(--pa-version-control-added); }
.pa-change.modified { background: var(--pa-version-control-modified); }
.pa-text { position: relative; }
.pa-caret { display: inline-block; width: 2px; height: 20px; vertical-align: -4px; background: var(--pa-player-cursor);
  animation: pa-blink 1.1s steps(1) infinite; }
@keyframes pa-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .pa-caret { animation: none; } }
</style>
