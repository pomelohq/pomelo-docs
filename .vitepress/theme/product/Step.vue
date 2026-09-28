<script setup>
defineProps({
  n: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, default: '' },
  more: { type: String, default: '' },
})
</script>

<template>
  <div class="pp-step">
    <div class="pp-step-text">
      <span class="pp-step-n">[{{ n }}]</span>
      <h3>{{ title }}</h3>
      <p><slot name="text" /></p>
      <a v-if="link" class="pp-more" :href="link">{{ more }} <span aria-hidden="true">&gt;</span></a>
    </div>
    <div class="pp-step-visual"><slot /></div>
  </div>
</template>
