<script setup>
// lines: arrays of [text, color] parts; colors are ANSI indexes (0-15), 'fg', 'dim', 'bright', 'bold',
// or the prompt's 'path', 'branch' and 'prompt'.
defineProps({ lines: { type: Array, required: true }, cursor: { type: Boolean, default: true }, size: { type: Number, default: 15 } })
const NAMED = {
  dim: 'var(--pa-terminal-dim-foreground)', bright: 'var(--pa-terminal-bright-foreground)',
  path: 'var(--pa-info)', branch: 'var(--pa-text-placeholder)', prompt: 'var(--pa-text-accent)',
}
const style = c => typeof c === 'number' ? { color: `var(--pa-ansi-${c})` }
  : c === 'bold' ? { fontWeight: 600 } : NAMED[c] ? { color: NAMED[c] } : undefined
</script>

<template>
  <div class="pa-term mono" :style="{ fontSize: size + 'px', lineHeight: size * 1.3 + 'px' }">
    <div v-for="(line, i) in lines" :key="i" class="pa-term-line" :style="{ minHeight: size * 1.3 + 'px' }"><span v-for="(part, j) in line" :key="j"
      :style="style(part[1])">{{ part[0] }}</span><span v-if="cursor && i === lines.length - 1" class="pa-term-cursor"
      :style="{ width: size * 0.6 + 'px', height: size * 1.3 + 'px' }" /></div>
  </div>
</template>

<style>
.pa-term { position: relative; flex: 1; min-height: 0; overflow: hidden; padding: 0 0 0 9px; background: var(--pa-terminal-background);
  color: var(--pa-terminal-foreground); white-space: pre; }
.pa-term-line { white-space: pre; }
.pa-term-cursor { display: inline-block; vertical-align: top; background: var(--pa-player-cursor); }
</style>
