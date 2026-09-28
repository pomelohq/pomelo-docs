<script setup>
// lines: arrays of [text, color] parts; colors are ANSI indexes (0-15), 'fg', 'dim' or 'bright'.
defineProps({ lines: { type: Array, required: true }, cursor: { type: Boolean, default: true }, size: { type: Number, default: 15 } })
const color = c => typeof c === 'number' ? `var(--pa-ansi-${c})`
  : c === 'dim' ? 'var(--pa-terminal-dim-foreground)' : c === 'bright' ? 'var(--pa-terminal-bright-foreground)' : undefined
</script>

<template>
  <div class="pa-term mono" :style="{ fontSize: size + 'px', lineHeight: size * 1.3 + 'px' }">
    <div v-for="(line, i) in lines" :key="i" class="pa-term-line" :style="{ height: size * 1.3 + 'px' }"><span v-for="(part, j) in line" :key="j"
      :style="{ color: color(part[1]) }">{{ part[0] }}</span><span v-if="cursor && i === lines.length - 1" class="pa-term-cursor" /></div>
  </div>
</template>

<style>
.pa-term { flex: 1; min-height: 0; overflow: hidden; background: var(--pa-terminal-background); color: var(--pa-terminal-foreground);
  font-size: 15px; line-height: 19.5px; padding: 6px 9px; white-space: pre; }
.pa-term-line { height: 19.5px; }
.pa-term-cursor { display: inline-block; width: 0.6em; height: 1.2em; vertical-align: -0.25em; border: 1px solid var(--pa-player-cursor); }
</style>
