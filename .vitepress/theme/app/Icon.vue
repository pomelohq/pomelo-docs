<script setup>
import { computed } from 'vue'
import icons from './icons.js'
const props = defineProps({ name: { type: String, required: true }, size: { type: Number, default: 14 } })
const svg = computed(() => icons[props.name] || '')
</script>

<template>
  <span class="pa-icon" :style="{ width: size + 'px', height: size + 'px' }" v-html="svg" aria-hidden="true" />
</template>

<style>
.pa-icon { display: inline-flex; flex: none; }
.pa-icon svg { width: 100%; height: 100%; display: block; }
</style>
