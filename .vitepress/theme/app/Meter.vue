<script setup>
import { computed } from 'vue'
const props = defineProps({ used: { type: Number, required: true }, width: { type: Number, default: 0 }, height: { type: Number, default: 5 } })
const tone = computed(() => props.used >= 90 ? 'var(--pa-error)' : props.used >= 70 ? 'var(--pa-warning)' : 'var(--pa-success)')
</script>

<template>
  <span class="pa-meter" :style="{ width: width ? width + 'px' : undefined, flex: width ? 'none' : '1', height: height + 'px', borderRadius: height / 2 + 'px' }">
    <span :style="{ width: Math.min(100, used) + '%', background: tone, borderRadius: height / 2 + 'px' }" />
  </span>
</template>

<style>
.pa-meter { display: flex; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
html:not(.dark) .pa-meter { background: rgba(0, 0, 0, 0.1); }
.pa-meter > span { display: block; height: 100%; }
</style>
