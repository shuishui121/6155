import type { StoredCompetition, Competition, Athlete } from './types'
import { STORAGE_KEY } from './constants'

export function saveCompetitionResult(
  competition: Competition,
  rankings: { athleteId: string; bestHeight: number; isPlayer: boolean; athleteName: string }[]
): void {
  try {
    const playerAthlete = competition.athletes.find(a => a.isPlayer)
    if (!playerAthlete) return

    const playerRank = rankings.findIndex(r => r.athleteId === playerAthlete.id) + 1
    const playerBest = rankings.find(r => r.athleteId === playerAthlete.id)?.bestHeight || 0

    const stored: StoredCompetition = {
      id: competition.id,
      name: competition.name,
      date: competition.date,
      type: competition.type,
      rankings: rankings.map(r => ({
        athleteName: r.athleteName,
        bestHeight: r.bestHeight,
        isPlayer: r.isPlayer,
      })),
      playerBestHeight: playerBest,
      playerRank,
    }

    const history = getCompetitionHistory()
    history.unshift(stored)

    if (history.length > 50) {
      history.splice(50)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Failed to save competition result:', e)
  }
}

export function getCompetitionHistory(): StoredCompetition[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (e) {
    console.error('Failed to load competition history:', e)
    return []
  }
}

export function clearCompetitionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear competition history:', e)
  }
}

export function getPersonalBest(): number {
  const history = getCompetitionHistory()
  if (history.length === 0) return 0
  return Math.max(...history.map(h => h.playerBestHeight))
}

export function getStats(): {
  totalCompetitions: number
  bestHeight: number
  averageRank: number
  goldMedals: number
  silverMedals: number
  bronzeMedals: number
} {
  const history = getCompetitionHistory()

  let gold = 0
  let silver = 0
  let bronze = 0
  let totalRank = 0

  history.forEach(h => {
    totalRank += h.playerRank
    if (h.playerRank === 1) gold++
    else if (h.playerRank === 2) silver++
    else if (h.playerRank === 3) bronze++
  })

  return {
    totalCompetitions: history.length,
    bestHeight: getPersonalBest(),
    averageRank: history.length > 0 ? Math.round((totalRank / history.length) * 10) / 10 : 0,
    goldMedals: gold,
    silverMedals: silver,
    bronzeMedals: bronze,
  }
}
