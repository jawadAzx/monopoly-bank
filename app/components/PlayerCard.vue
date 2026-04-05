<template>
  <div
    class="relative bg-gray-800 rounded-2xl p-5 border border-gray-700 overflow-hidden transition-all duration-200"
  >
    <!-- Colored left accent bar -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
      :style="{ backgroundColor: player.color }"
    ></div>

    <!-- Flash overlay -->
    <div
      class="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700"
      :class="overlayClass"
    ></div>

    <div class="pl-3 relative">
      <!-- Player color dot + name -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2 min-w-0">
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: player.color }"
          ></div>
          <span class="text-gray-300 text-sm font-medium uppercase tracking-wide truncate">
            {{ player.name }}
          </span>
        </div>
        <!-- Individual hide/show toggle -->
        <button
          @click.stop="emit('toggle')"
          class="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-1"
          :title="hidden ? 'Show balance' : 'Hide balance'"
        >
          <!-- Eye (show) -->
          <svg v-if="hidden" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <!-- Eye-slash (hide) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>

      <!-- Balance -->
      <div class="text-2xl font-black tracking-tight" :class="hidden ? 'text-gray-600' : balanceColorClass">
        {{ hidden ? '••••••' : formatMoney(player.balance) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/stores/game'

const props = defineProps<{
  player: Player
  hidden: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const overlayClass = ref('opacity-0 bg-transparent')
const balanceColorClass = ref('text-white')

let flashTimeout: ReturnType<typeof setTimeout> | null = null

function formatMoney(amount: number) {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    const str = (abs / 1_000_000).toFixed(3).replace(/\.?0+$/, '')
    return sign + '$' + str + 'M'
  }
  if (abs >= 1_000) {
    const str = (abs / 1_000).toFixed(1).replace(/\.?0+$/, '')
    return sign + '$' + str + 'K'
  }
  return sign + '$' + abs
}

watch(() => props.player.balance, (newVal, oldVal) => {
  if (flashTimeout) clearTimeout(flashTimeout)
  if (newVal > oldVal) {
    overlayClass.value = 'opacity-30 bg-green-500'
    balanceColorClass.value = 'text-green-400'
  } else {
    overlayClass.value = 'opacity-30 bg-red-500'
    balanceColorClass.value = 'text-red-400'
  }
  flashTimeout = setTimeout(() => {
    overlayClass.value = 'opacity-0 bg-transparent'
    balanceColorClass.value = 'text-white'
  }, 800)
})
</script>
