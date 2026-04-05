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

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    players: [],
    started: false,
    createdAt: ''
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
    },
    addMoney(playerId: string, amount: number) {
      const player = this.players.find(p => p.id === playerId)
      if (player) player.balance += amount
    },
    deductMoney(playerId: string, amount: number) {
      const player = this.players.find(p => p.id === playerId)
      if (player) player.balance -= amount
    },
    transfer(fromId: string, toId: string, amount: number) {
      this.deductMoney(fromId, amount)
      this.addMoney(toId, amount)
    },
    resetGame() {
      this.players = []
      this.started = false
      this.createdAt = ''
    }
  },
  persist: true
})
