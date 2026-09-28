<script setup>
import { computed } from 'vue'
const props = defineProps({ k: { type: String, required: true } })
const PATHS = {"cmd": ["M9.66667 4.66667V11.3333C9.66667 11.663 9.76441 11.9852 9.94755 12.2593C10.1307 12.5334 10.391 12.747 10.6955 12.8731C11.0001 12.9993 11.3352 13.0323 11.6585 12.968C11.9818 12.9037 12.2788 12.7449 12.5118 12.5118C12.7449 12.2788 12.9037 11.9818 12.968 11.6585C13.0323 11.3352 12.9993 11.0001 12.8731 10.6955C12.747 10.391 12.5334 10.1307 12.2593 9.94755C11.9852 9.76441 11.663 9.66667 11.3333 9.66667H4.66667C4.33703 9.66667 4.0148 9.76441 3.74072 9.94755C3.46663 10.1307 3.25301 10.391 3.12687 10.6955C3.00072 11.0001 2.96772 11.3352 3.03203 11.6585C3.09633 11.9818 3.25507 12.2788 3.48816 12.5118C3.72124 12.7449 4.01822 12.9037 4.34152 12.968C4.66482 13.0323 4.99993 12.9993 5.30447 12.8731C5.60902 12.747 5.86931 12.5334 6.05245 12.2593C6.23559 11.9852 6.33333 11.663 6.33333 11.3333V4.66667C6.33333 4.33703 6.23559 4.0148 6.05245 3.74072C5.86931 3.46663 5.60902 3.25301 5.30447 3.12687C4.99993 3.00072 4.66482 2.96772 4.34152 3.03203C4.01822 3.09633 3.72124 3.25507 3.48816 3.48816C3.25507 3.72124 3.09633 4.01822 3.03203 4.34152C2.96772 4.66482 3.00072 4.99993 3.12687 5.30447C3.25301 5.60902 3.46663 5.86931 3.74072 6.05245C4.0148 6.23559 4.33703 6.33333 4.66667 6.33333H11.3333C11.663 6.33333 11.9852 6.23559 12.2593 6.05245C12.5334 5.86931 12.747 5.60902 12.8731 5.30447C12.9993 4.99993 13.0323 4.66482 12.968 4.34152C12.9037 4.01822 12.7449 3.72124 12.5118 3.48816C12.2788 3.25507 11.9818 3.09633 11.6585 3.03203C11.3352 2.96772 11.0001 3.00072 10.6955 3.12687C10.391 3.25301 10.1307 3.46663 9.94755 3.74072C9.76441 4.0148 9.66667 4.33703 9.66667 4.66667Z"], "shift": ["M3.07136 7.95724L7.86916 3.05405C7.93967 2.98199 8.06036 2.98198 8.13087 3.05405L12.9286 7.95724C13.0866 8.11865 12.9652 8.38015 12.7324 8.38015H10.226V12.748C10.226 12.8872 10.1065 13 9.95892 13H6.04111C5.89358 13 5.77399 12.8872 5.77399 12.748V8.38015H3.26765C3.03479 8.38015 2.91342 8.11865 3.07136 7.95724Z"], "alt": ["M3 3H6.33333L9.66667 13H13", "M9.11108 3H13"], "ctrl": ["M3.5 6.12487L7.64656 1.97852C7.84183 1.78327 8.1584 1.78328 8.35366 1.97853L12.5 6.12487"], "up": ["M8 3L12.5 7.5M8 3L3.5 7.5M8 3V13"], "down": ["M8 13L12.5 8.5M8 13L3.5 8.5M8 13V3"], "enter": ["M6.00008 6.66669L2.66675 10L6.00008 13.3334", "M13.3334 2.66669V7.33335C13.3334 8.0406 13.0525 8.71888 12.5524 9.21897C12.0523 9.71907 11.374 10 10.6667 10H2.66675"], "backspace": ["M6.79998 4C6.50183 4.00002 6.21436 4.10574 5.99358 4.29657L2.19677 7.57657C2.1348 7.63013 2.08528 7.69545 2.05139 7.76832C2.01751 7.8412 2 7.92001 2 7.99971C2 8.07941 2.01751 8.15823 2.05139 8.23111C2.08528 8.30398 2.1348 8.36929 2.19677 8.42286L5.99358 11.7034C6.21436 11.8943 6.50183 12 6.79998 12H12.8C13.1183 12 13.4235 11.8796 13.6485 11.6653C13.8736 11.4509 14 11.1602 14 10.8571V5.14286C14 4.83975 13.8736 4.54906 13.6485 4.33474C13.4235 4.12041 13.1183 4 12.8 4H6.79998Z", "M8.5 6.5L11.5 9.5", "M11.5 6.5L8.5 9.5"], "tab": ["M10.3333 8H2", "M6.33325 12L10.3333 8L6.33325 4", "M13 3.33331V12.6666"], "left": ["M3.5 7.50001L8 3M3.5 7.50001L8 12M3.5 7.50001H12.5"], "right": ["M12.5 8L8 12.5M12.5 8L8 3.5M12.5 8H3.5"]}
const MODIFIERS = ['ctrl', 'alt', 'cmd', 'shift']
const NAMES = { cmd: 'Command', shift: 'Shift', alt: 'Option', ctrl: 'Control', up: 'Up', down: 'Down', left: 'Left', right: 'Right', enter: 'Return', backspace: 'Backspace', tab: 'Tab' }

function parse(stroke) {
  const mods = []
  let rest = stroke
  for (;;) {
    const i = rest.indexOf('-')
    if (i < 0 || i === rest.length - 1) break
    const head = rest.slice(0, i)
    if (!MODIFIERS.includes(head)) break
    mods.push(head)
    rest = rest.slice(i + 1)
  }
  const parts = MODIFIERS.filter(m => mods.includes(m)).map(m => ({ icon: m }))
  const key = rest === 'delete' ? 'backspace' : rest
  if (PATHS[key]) parts.push({ icon: key })
  else if (key === 'pageup') parts.push({ text: 'PageUp' })
  else if (key === 'pagedown') parts.push({ text: 'PageDown' })
  else parts.push({ text: key.charAt(0).toUpperCase() + key.slice(1) })
  return parts
}

const strokes = computed(() => props.k.trim().split(/\s+/).map(parse))
const spoken = computed(() => props.k.trim().split(/\s+/).map(s =>
  parse(s).map(p => p.icon ? NAMES[p.icon] : p.text).join('+')).join(', then '))
</script>

<template>
  <span class="pom-keys" :title="k" :aria-label="spoken">
    <span v-for="(parts, i) in strokes" :key="i" class="pom-stroke">
      <template v-for="(part, j) in parts" :key="j">
        <svg v-if="part.icon" class="pom-glyph" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path v-for="(d, n) in PATHS[part.icon]" :key="n" :d="d" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span v-else class="pom-key">{{ part.text }}</span>
      </template>
    </span>
  </span>
</template>

<style scoped>
.pom-keys { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; vertical-align: middle; }
.pom-stroke { display: inline-flex; align-items: center; padding: 1px 5px; border: 1px solid var(--vp-c-divider); border-radius: 5px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); line-height: 1; }
.pom-glyph { width: 14px; height: 14px; }
.pom-key { font-size: 13px; min-width: 14px; text-align: center; padding: 0 1px; }
</style>
