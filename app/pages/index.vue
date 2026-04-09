<template>
  <div class="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-12">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="text-6xl mb-4">🏦</div>
      <h1 class="text-5xl font-black tracking-tight mb-2">
        <span class="text-yellow-400">Monopoly</span>
        <span class="text-white"> Bank</span>
      </h1>
      <p class="text-gray-400 text-lg mt-3">Digital banking for your board game</p>
    </div>

    <!-- Main Buttons -->
    <div class="flex flex-col gap-4 w-full max-w-sm mb-8">
      <button
        @click="handleNewGame"
        class="w-full py-4 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold text-xl rounded-2xl transition-all duration-200 min-h-[56px] shadow-lg shadow-yellow-400/20 active:scale-95"
      >
        New Game
      </button>
      <button
        @click="handleLoadGame"
        class="w-full py-4 px-8 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-2xl transition-all duration-200 min-h-[56px] border border-gray-700 active:scale-95"
      >
        Load Game
      </button>
    </div>

    <!-- Error message for no saved game -->
    <div v-if="loadError" class="w-full max-w-sm mb-6">
      <div class="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-center">
        No saved game found.
      </div>
    </div>

    <!-- New Game Setup Form -->
    <Transition name="slide-down">
      <div v-if="showSetupForm" class="w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 class="text-xl font-bold text-white mb-5">Setup Players</h2>

        <!-- Validation errors -->
        <div v-if="validationError" class="mb-4 bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm">
          {{ validationError }}
        </div>

        <!-- Player rows -->
        <div class="space-y-3 mb-5">
          <div
            v-for="(player, index) in playerSetup"
            :key="index"
            class="flex items-center gap-3"
          >
            <!-- Color swatch -->
            <div
              class="w-8 h-8 rounded-full flex-shrink-0 shadow-md"
              :style="{ backgroundColor: PLAYER_COLORS[index].hex }"
            ></div>
            <!-- Name input -->
            <input
              v-model="player.name"
              :placeholder="`Player ${index + 1}`"
              type="text"
              class="flex-1 bg-gray-800 border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all duration-200 min-h-[48px]"
              @keyup.enter="startGame"
            />
            <!-- Remove button -->
            <button
              v-if="playerSetup.length > 2"
              @click="removePlayer(index)"
              class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-red-900/60 border border-gray-700 hover:border-red-700 text-gray-400 hover:text-red-400 rounded-xl transition-all duration-200 flex-shrink-0"
              aria-label="Remove player"
            >
              ×
            </button>
            <div v-else class="w-10 h-10 flex-shrink-0"></div>
          </div>
        </div>

        <!-- Add Player button -->
        <button
          v-if="playerSetup.length < 6"
          @click="addPlayer"
          class="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 hover:border-gray-500 text-gray-400 hover:text-white rounded-xl transition-all duration-200 mb-5 min-h-[48px] text-sm font-medium"
        >
          + Add Player
        </button>

        <!-- Board Denomination -->
        <div class="mb-5">
          <p class="text-gray-400 text-sm font-medium mb-3">What's your board's denomination?</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in DENOMINATION_PRESETS"
              :key="preset.id"
              @click="selectedPreset = preset"
              class="flex flex-col items-start px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left active:scale-95"
              :class="selectedPreset.id === preset.id
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-500'"
            >
              <span class="font-bold text-sm text-white">{{ preset.label }}</span>
              <span class="text-xs text-gray-400 mt-0.5">Pass Go {{ preset.passGoLabel }}</span>
            </button>
          </div>
          <!-- Custom pass go input -->
          <div v-if="selectedPreset.id === 'custom'" class="mt-3 flex items-center gap-2">
            <span class="text-gray-400 font-bold text-lg flex-shrink-0">Pass Go $</span>
            <input
              v-model="customPassGo"
              type="number"
              inputmode="decimal"
              min="1"
              placeholder="e.g. 500000"
              class="flex-1 bg-gray-800 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all min-h-[48px]"
            />
          </div>
        </div>

        <!-- Start Game button -->
        <button
          @click="startGame"
          class="w-full py-4 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold text-lg rounded-2xl transition-all duration-200 min-h-[56px] shadow-lg shadow-yellow-400/20 active:scale-95"
        >
          Start Game
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { PLAYER_COLORS, useGameStore } from '~/stores/game'

const store = useGameStore()
const router = useRouter()

const showSetupForm = ref(false)
const loadError = ref(false)
const validationError = ref('')

const playerSetup = ref([
  { name: '' },
  { name: '' },
])

const DENOMINATION_PRESETS = [
  { id: 'millions',  label: 'Millions',   passGoLabel: '$2M',   passGo: 2_000_000,  start: 15_000_000 },
  { id: 'hundredk',  label: 'Hundred-K',  passGoLabel: '$200K', passGo: 200_000,    start: 1_500_000  },
  { id: 'classic',   label: 'Classic',    passGoLabel: '$200',  passGo: 200,        start: 1_500      },
  { id: 'custom',    label: 'Custom',     passGoLabel: '—',     passGo: 0,          start: 0          },
]

const selectedPreset = ref(DENOMINATION_PRESETS[0])
const customPassGo = ref('')

function handleNewGame() {
  loadError.value = false
  showSetupForm.value = !showSetupForm.value
  if (showSetupForm.value) {
    playerSetup.value = [{ name: '' }, { name: '' }]
    selectedPreset.value = DENOMINATION_PRESETS[0]
    customPassGo.value = ''
    validationError.value = ''
  }
}

function handleLoadGame() {
  showSetupForm.value = false
  if (store.started) {
    router.push('/game')
  } else {
    loadError.value = true
    setTimeout(() => { loadError.value = false }, 3000)
  }
}

function addPlayer() {
  if (playerSetup.value.length < 6) {
    playerSetup.value.push({ name: '' })
  }
}

function removePlayer(index: number) {
  if (playerSetup.value.length > 2) {
    playerSetup.value.splice(index, 1)
  }
}

function startGame() {
  validationError.value = ''

  const names = playerSetup.value.map(p => p.name.trim())

  if (names.some(n => !n)) {
    validationError.value = 'All player names must be filled in.'
    return
  }

  const unique = new Set(names.map(n => n.toLowerCase()))
  if (unique.size !== names.length) {
    validationError.value = 'Player names must be unique.'
    return
  }

  let passGo: number
  let startBal: number
  if (selectedPreset.value.id === 'custom') {
    const val = Math.floor(Number(customPassGo.value))
    if (!val || val <= 0) {
      validationError.value = 'Enter a valid Pass Go amount.'
      return
    }
    passGo = val
    startBal = Math.floor(val * 7.5)
  } else {
    passGo = selectedPreset.value.passGo
    startBal = selectedPreset.value.start
  }

  store.startGame(names, passGo, startBal)
  router.push('/game')
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
