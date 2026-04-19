<template>
  <div class="min-h-screen bg-gray-950 text-white pb-28">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏦</span>
          <h1 class="text-xl font-black text-yellow-400 tracking-tight">Monopoly Bank</h1>
        </div>
        <div class="flex items-center gap-2">
          <!-- Hide/show all balances -->
          <button
            @click="toggleHideAll"
            class="py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 min-h-[40px]"
            :title="allHidden ? 'Show all balances' : 'Hide all balances'"
          >
            <svg v-if="!allHidden" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button
            @click="showResetConfirm = true"
            class="py-2 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm font-semibold rounded-xl transition-all duration-200 min-h-[40px]"
          >
            New Game
          </button>
        </div>
      </div>
    </header>

    <!-- Player grid -->
    <main class="max-w-2xl mx-auto px-4 py-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <PlayerCard
          v-for="player in store.players"
          :key="player.id"
          :player="player"
          :hidden="hiddenIds.has(player.id)"
          @toggle="togglePlayerVisibility(player.id)"
        />
      </div>
    </main>

    <!-- Bottom action bar -->
    <div class="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 safe-area-bottom">
      <div class="max-w-2xl mx-auto grid grid-cols-4 gap-2">
        <button @click="startAction('add')"
          class="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-green-600 hover:bg-green-500 border border-green-500 rounded-xl transition-all duration-200 min-h-[64px] active:scale-95">
          <span class="text-xl">➕</span>
          <span class="text-xs font-bold text-white">Add</span>
        </button>
        <button @click="startAction('deduct')"
          class="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-red-600 hover:bg-red-500 border border-red-500 rounded-xl transition-all duration-200 min-h-[64px] active:scale-95">
          <span class="text-xl">➖</span>
          <span class="text-xs font-bold text-white">Deduct</span>
        </button>
        <button @click="startAction('transfer')"
          class="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-xl transition-all duration-200 min-h-[64px] active:scale-95">
          <span class="text-xl">🔁</span>
          <span class="text-xs font-bold text-white">Transfer</span>
        </button>
        <button @click="startAction('go')"
          class="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-yellow-400 hover:bg-yellow-300 border border-yellow-300 rounded-xl transition-all duration-200 min-h-[64px] active:scale-95">
          <span class="text-xl">🎲</span>
          <span class="text-xs font-bold text-gray-900">Pass Go</span>
          <span class="text-xs text-gray-700 font-medium">{{ formatMoney(store.passGoAmount) }}</span>
        </button>
      </div>
    </div>

    <!-- Step-by-step bottom sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="activeAction" class="fixed inset-0 z-50 flex flex-col justify-end">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cancelAction"></div>

          <!-- Panel -->
          <div ref="sheetPanelRef" class="relative bg-gray-900 rounded-t-3xl border-t border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto">
            <!-- Handle bar -->
            <div class="flex justify-center pt-3 pb-1">
              <div class="w-10 h-1 bg-gray-600 rounded-full"></div>
            </div>

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ actionEmoji }}</span>
                <h2 class="text-lg font-bold text-white">{{ actionTitle }}</h2>
              </div>
              <button @click="cancelAction" class="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors">✕</button>
            </div>

            <!-- Step 1: Select player (From for transfer) -->
            <div v-if="step === 1" class="px-6 py-5">
              <p class="text-gray-400 text-sm font-medium mb-4">
                {{ activeAction === 'transfer' ? 'Who is paying?' : activeAction === 'go' ? `Who's collecting ${formatMoney(store.passGoAmount)}?` : 'Select player' }}
              </p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="player in store.players"
                  :key="player.id"
                  @click="selectFrom(player)"
                  class="flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all duration-150 active:scale-95 min-h-[64px]"
                  :style="{ borderColor: player.color, backgroundColor: player.color + '30' }"
                >
                  <div class="w-5 h-5 rounded-full flex-shrink-0 shadow-md" :style="{ backgroundColor: player.color }"></div>
                  <div class="text-left">
                    <div class="text-white font-semibold text-sm">{{ player.name }}</div>
                    <div class="text-gray-400 text-xs">{{ formatMoney(player.balance) }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2 (Transfer only): Select "To" player -->
            <div v-else-if="step === 2 && activeAction === 'transfer'" class="px-6 py-5">
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: selectedFrom!.color }"></div>
                <span class="text-white text-sm font-semibold">{{ selectedFrom!.name }}</span>
                <span class="text-gray-400 text-xs">{{ formatMoney(selectedFrom!.balance) }}</span>
                <span class="text-gray-500 text-sm">→ who?</span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="player in store.players.filter(p => p.id !== selectedFrom!.id)"
                  :key="player.id"
                  @click="selectTo(player)"
                  class="flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all duration-150 active:scale-95 min-h-[64px]"
                  :style="{ borderColor: player.color, backgroundColor: player.color + '30' }"
                >
                  <div class="w-5 h-5 rounded-full flex-shrink-0 shadow-md" :style="{ backgroundColor: player.color }"></div>
                  <div class="text-left">
                    <div class="text-white font-semibold text-sm">{{ player.name }}</div>
                    <div class="text-gray-400 text-xs">{{ formatMoney(player.balance) }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Amount step -->
            <div v-else class="px-6 py-5">
              <!-- Who / summary -->
              <div class="flex items-center gap-2 mb-5 flex-wrap">
                <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: selectedFrom!.color }"></div>
                <span class="text-white font-semibold text-sm">{{ selectedFrom!.name }}</span>
                <span class="text-gray-400 text-xs">{{ formatMoney(selectedFrom!.balance) }}</span>
                <template v-if="selectedTo">
                  <span class="text-gray-500 text-sm">→</span>
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: selectedTo.color }"></div>
                  <span class="text-white font-semibold text-sm">{{ selectedTo.name }}</span>
                  <span class="text-gray-400 text-xs">{{ formatMoney(selectedTo.balance) }}</span>
                </template>
              </div>

              <!-- Number input -->
              <div class="relative mb-4">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl">$</span>
                <input
                  ref="amountInputRef"
                  v-model="amountInput"
                  @input="insufficientFunds = false"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="1"
                  placeholder="0"
                  class="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400 rounded-2xl pl-10 pr-4 py-4 text-white text-2xl font-bold outline-none transition-colors min-h-[64px]"
                  @keyup.enter.prevent
                />
              </div>

              <!-- Multiplier buttons (adapt to board denomination) -->
              <div class="grid grid-cols-2 gap-3 mb-3">
                <button
                  v-for="mult in multipliers"
                  :key="mult.value"
                  @click="confirmWithMultiplier(mult.value)"
                  :disabled="!amountInput || Number(amountInput) <= 0"
                  class="py-4 rounded-2xl font-black text-xl transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="actionColorClass + ' text-white'"
                >
                  {{ mult.label }} <span class="text-sm font-normal opacity-70">{{ mult.sub }}</span>
                </button>
              </div>

              <!-- Insufficient funds error -->
              <div v-if="insufficientFunds" class="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm font-medium">
                ✕ Insufficient balance for this transaction.
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reset Confirmation -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showResetConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showResetConfirm = false"></div>
          <div class="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" @click.stop>
            <h2 class="text-xl font-bold text-white mb-3">Start New Game?</h2>
            <p class="text-gray-400 text-sm mb-6">This will erase the current game. Continue?</p>
            <div class="flex gap-3">
              <button @click="showResetConfirm = false"
                class="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold rounded-xl transition-all min-h-[48px]">
                Cancel
              </button>
              <button @click="confirmReset"
                class="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all min-h-[48px]">
                Reset
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import type { Player } from '~/stores/game'

const store = useGameStore()
const router = useRouter()

const showResetConfirm = ref(false)
const hiddenIds = ref(new Set<string>())

const allHidden = computed(() => store.players.length > 0 && store.players.every(p => hiddenIds.value.has(p.id)))

function toggleHideAll() {
  if (allHidden.value) {
    hiddenIds.value = new Set()
  } else {
    hiddenIds.value = new Set(store.players.map(p => p.id))
  }
}

function togglePlayerVisibility(playerId: string) {
  const next = new Set(hiddenIds.value)
  if (next.has(playerId)) next.delete(playerId)
  else next.add(playerId)
  hiddenIds.value = next
}

onMounted(() => {
  if (!store.started) router.push('/')
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

type ActionType = 'add' | 'deduct' | 'transfer' | 'go'

const activeAction = ref<ActionType | null>(null)
const step = ref(1)
const selectedFrom = ref<Player | null>(null)
const selectedTo = ref<Player | null>(null)
const amountInput = ref('')
const amountInputRef = ref<HTMLInputElement | null>(null)
const sheetPanelRef = ref<HTMLDivElement | null>(null)

// ── Audio ──────────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtx
  } catch { return null }
}

function playNote(ctx: AudioContext, freq: number, startOffset: number, duration: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset)
  gain.gain.setValueAtTime(0.25, ctx.currentTime + startOffset)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration)
  osc.start(ctx.currentTime + startOffset)
  osc.stop(ctx.currentTime + startOffset + duration + 0.01)
}

function playTransactionSound(type: ActionType) {
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    if (type === 'add') {
      playNote(ctx, 523, 0, 0.12)
      playNote(ctx, 659, 0.13, 0.18)
    } else if (type === 'deduct') {
      playNote(ctx, 400, 0, 0.10)
      playNote(ctx, 280, 0.12, 0.18)
    } else if (type === 'transfer') {
      playNote(ctx, 440, 0, 0.09)
      playNote(ctx, 554, 0.10, 0.09)
      playNote(ctx, 659, 0.20, 0.14)
    } else if (type === 'go') {
      playNote(ctx, 523, 0, 0.08)
      playNote(ctx, 659, 0.10, 0.08)
      playNote(ctx, 784, 0.20, 0.08)
      playNote(ctx, 1047, 0.30, 0.22)
    }
  } catch { /* ignore */ }
}

function vibrateTransaction(type: ActionType) {
  if (!navigator.vibrate) return
  const patterns: Record<ActionType, number[]> = {
    add:      [40, 20, 60],
    deduct:   [80, 30, 80],
    transfer: [40, 20, 40, 20, 60],
    go:       [60, 30, 60, 30, 120],
  }
  navigator.vibrate(patterns[type])
}

// Scroll main window to top and reset sheet scroll when dialog closes
watch(activeAction, (newVal, oldVal) => {
  if (oldVal !== null && newVal === null) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

// Reset sheet panel scroll when step changes
watch(step, () => {
  nextTick(() => { if (sheetPanelRef.value) sheetPanelRef.value.scrollTop = 0 })
})

// Multiplier buttons adapt to the board's denomination
const multipliers = computed(() => {
  if (store.startingBalance >= 1_000_000) {
    return [
      { label: 'M', sub: '×1,000,000', value: 1_000_000 },
      { label: 'K', sub: '×1,000',     value: 1_000 },
    ]
  }
  // Classic / small denomination boards: K for big amounts, ×1 for exact entry
  return [
    { label: 'K',  sub: '×1,000', value: 1_000 },
    { label: '×1', sub: 'exact',  value: 1 },
  ]
})

const actionTitle = computed(() => ({
  add: 'Add Money', deduct: 'Deduct Money', transfer: 'Transfer', go: 'Pass Go'
}[activeAction.value!] ?? ''))

const actionEmoji = computed(() => ({
  add: '➕', deduct: '➖', transfer: '🔁', go: '🎲'
}[activeAction.value!] ?? ''))

const actionColorClass = computed(() => ({
  add: 'bg-green-600 hover:bg-green-500',
  deduct: 'bg-red-600 hover:bg-red-500',
  transfer: 'bg-blue-600 hover:bg-blue-500',
  go: 'bg-yellow-500 hover:bg-yellow-400',
}[activeAction.value!] ?? 'bg-gray-600'))

const insufficientFunds = ref(false)

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

function startAction(action: ActionType) {
  activeAction.value = action
  step.value = 1
  selectedFrom.value = null
  selectedTo.value = null
  amountInput.value = ''
  insufficientFunds.value = false
}

function cancelAction() {
  activeAction.value = null
  insufficientFunds.value = false
}

function selectFrom(player: Player) {
  selectedFrom.value = player
  if (activeAction.value === 'go') {
    // Pass Go: immediately add $2M, no amount step
    store.addMoney(player.id, store.passGoAmount)
    playTransactionSound('go')
    vibrateTransaction('go')
    activeAction.value = null
    return
  }
  if (activeAction.value === 'transfer') {
    step.value = 2
  } else {
    step.value = 3
    nextTick(() => amountInputRef.value?.focus())
  }
}

function selectTo(player: Player) {
  selectedTo.value = player
  step.value = 3
  nextTick(() => amountInputRef.value?.focus())
}

function confirmWithMultiplier(multiplier: number) {
  const raw = Number(amountInput.value)
  if (!raw || raw <= 0) return
  const amount = Math.floor(raw * multiplier)

  // Block if would go negative
  if (activeAction.value === 'deduct' || activeAction.value === 'transfer') {
    if (selectedFrom.value!.balance - amount < 0) {
      insufficientFunds.value = true
      setTimeout(() => { insufficientFunds.value = false }, 2500)
      return
    }
  }

  const completedAction = activeAction.value
  if (activeAction.value === 'add') {
    store.addMoney(selectedFrom.value!.id, amount)
  } else if (activeAction.value === 'deduct') {
    store.deductMoney(selectedFrom.value!.id, amount)
  } else if (activeAction.value === 'transfer') {
    store.transfer(selectedFrom.value!.id, selectedTo.value!.id, amount)
  }

  playTransactionSound(completedAction!)
  vibrateTransaction(completedAction!)
  activeAction.value = null
}

function confirmReset() {
  store.resetGame()
  showResetConfirm.value = false
  router.push('/')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cancelAction()
}
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .relative, .sheet-leave-active .relative {
  transition: transform 0.25s ease;
}
.sheet-enter-from, .sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .relative, .sheet-leave-to .relative {
  transform: translateY(100%);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.safe-area-bottom {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}
</style>
