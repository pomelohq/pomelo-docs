<script setup>
import { computed } from 'vue'
const props = defineProps({ used: { type: Number, required: true }, width: { type: Number, default: 0 }, height: { type: Number, default: 5 } })
const tone = computed(() => props.used >= 90 ? 'var(--pa-error)' : props.used >= 70 ? 'var(--pa-warning)' : 'var(--pa-success)')
</script>

<template>
  <span class="pa-meter" :style="{ width: width ? width + 'px' : undefined, flex: width ? 'none' : '1', height: height + 'px', borderRadius: Math.ceil(height / 2) + 'px' }">
    <span :style="{ width: Math.min(100, used) + '%', background: tone, borderRadius: Math.ceil(height / 2) + 'px' }" />
  </span>
</template>

<style>
.pa-meter { display: flex; background: color-mix(in srgb, var(--pa-text) 10%, transparent); overflow: hidden; }
.pa-meter > span { display: block; height: 100%; }
</style>
