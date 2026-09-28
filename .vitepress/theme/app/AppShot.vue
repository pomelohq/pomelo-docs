<script setup>
import Frame from './Frame.vue'
// A fragment of the app inside a docs page: real size, scaled to the column, with a caption.
defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  window: { type: Boolean, default: true },
  text: { type: String, default: '' },
})
</script>

<template>
  <figure class="pa-shot">
    <div class="pa-shot-stage">
      <div :style="{ width: '100%', maxWidth: width + 'px' }">
        <Frame :width="width" :height="height" :window="window" :bare="!window"><slot /></Frame>
      </div>
    </div>
    <figcaption v-if="text">{{ text }}</figcaption>
  </figure>
</template>

<style>
.pa-shot { margin: 24px 0; }
.pa-shot-stage { border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 22px; display: flex; justify-content: center;
  background: radial-gradient(120% 120% at 70% 0%, var(--vp-c-brand-soft), transparent 60%), var(--vp-c-bg-alt); overflow: hidden; }
.pa-shot figcaption { margin-top: 8px; font-size: 13px; color: var(--vp-c-text-3); text-align: center; }
@media (max-width: 640px) { .pa-shot-stage { padding: 12px; } }
</style>
