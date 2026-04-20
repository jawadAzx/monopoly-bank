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
  passGoAmount: number
  startingBalance: number
  bankPot: number
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
  state: (): GameState => {
    const saved = loadState()
    return {
      players: saved.players ?? [],
      started: saved.started ?? false,
      createdAt: saved.createdAt ?? '',
      passGoAmount: saved.passGoAmount ?? 2_000_000,
      startingBalance: saved.startingBalance ?? 15_000_000,
      bankPot: saved.bankPot ?? 0,
    }
  },
  actions: {
    startGame(playerNames: string[], passGoAmount: number, startingBalance: number) {
      this.passGoAmount = passGoAmount
      this.startingBalance = startingBalance
      this.bankPot = 0
      this.players = playerNames.map((name, i) => ({
        id: uuidv4(),
        name,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length]!.hex,
        balance: startingBalance
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
    transferToBank(fromId: string, amount: number) {
      const player = this.players.find(p => p.id === fromId)
      if (player) player.balance -= amount
      this.bankPot += amount
      saveState(this.$state)
    },
    collectFreeParking(playerId: string) {
      const player = this.players.find(p => p.id === playerId)
      if (player) {
        player.balance += this.bankPot
        this.bankPot = 0
      }
      saveState(this.$state)
    },
    resetGame() {
      this.players = []
      this.started = false
      this.createdAt = ''
      this.bankPot = 0
      clearState()
    }
  }
})
