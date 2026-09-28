<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import './base.css'

// The app is drawn at its real size and scaled to the column, so text and spacing keep the app's
// proportions on any screen instead of reflowing.
const props = defineProps({
  width: { type: Number, default: 1280 },
  height: { type: Number, default: 800 },
  window: { type: Boolean, default: false },
  fade: { type: Boolean, default: false },
  bare: { type: Boolean, default: false },
})
const box = ref(null)
const scale = ref(1)
let observer
onMounted(() => {
  const fit = () => { if (box.value) scale.value = Math.min(1, box.value.clientWidth / props.width) }
  fit()
  observer = new ResizeObserver(fit)
  observer.observe(box.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="box" class="pa-frame" :class="{ 'pa-frame-window': window, 'pa-frame-fade': fade, 'pa-frame-bare': bare }"
    :style="{ height: height * scale + 'px' }">
    <div class="pa pa-stage" :style="{ width: width + 'px', height: height + 'px', transform: `scale(${scale})` }">
      <slot />
    </div>
  </div>
</template>

<style>
.pa-frame { position: relative; width: 100%; max-width: 100%; overflow: hidden; }
.pa-stage { transform-origin: top left; position: absolute; top: 0; left: 0; overflow: hidden;
  background: var(--pa-background); border-radius: 10px; }
.pa-frame-window .pa-stage { border: 1px solid var(--pa-border); box-shadow: 0 40px 120px -40px rgba(0, 0, 0, 0.6); }
.pa-frame-bare .pa-stage { background: none; border-radius: 0; overflow: visible; }
.pa-frame-fade { -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent);
  mask-image: linear-gradient(to bottom, #000 70%, transparent); }
</style>
