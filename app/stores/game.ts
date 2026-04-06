import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export interface Player {
  id: string
  name: string
  color: string
  balance: number
}

export interface GameState {
  players: Player[]
  started: boolean
  createdAt: string
}

export const PLAYER_COLORS = [
  { name: 'Red',    hex: '#ff3b3b' },
  { name: 'Blue',   hex: '#3b9eff' },
  { name: 'Green',  hex: '#2ecc40' },
  { name: 'Yellow', hex: '#ffe033' },
  { name: 'Purple', hex: '#bf5fff' },
  { name: 'Pink',   hex: '#ff4dd2' },
]

const STORAGE_KEY = 'monopoly-game-state'

function loadState(): Partial<GameState> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveState(state: GameState) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearState() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    players: [],
    started: false,
    createdAt: '',
    ...loadState()
  }),
  actions: {
    startGame(playerNames: string[]) {
      this.players = playerNames.map((name, i) => ({
        id: uuidv4(),
        name,
        color: PLAYER_COLORS[i].hex,
        balance: 15_000_000
      }))
      this.started = true
      this.createdAt = new Date().toISOString()
      saveState(this.$state)
    },
    addMoney(playerId: string, amount: number) {
      const player = this.players.find(p => p.id === playerId)
      if (player) player.balance += amount
      saveState(this.$state)
    },
    deductMoney(playerId: string, amount: number) {
      const player = this.players.find(p => p.id === playerId)
      if (player) player.balance -= amount
      saveState(this.$state)
    },
    transfer(fromId: string, toId: string, amount: number) {
      this.deductMoney(fromId, amount)
      this.addMoney(toId, amount)
    },
    resetGame() {
      this.players = []
      this.started = false
      this.createdAt = ''
      clearState()
    }
  }
})
