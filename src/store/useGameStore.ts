import { create } from 'zustand'
import type { GameState, GamePhase, JumpStyle, Athlete, Competition, JumpResult } from '@/game/types'
import {
  createPlayerAthlete,
  createAIOpponents,
  createCompetition,
  createJumpResult,
  nextAthlete,
  processAIJump,
  updateRankings,
  getCurrentAthlete,
  getAthleteAttempts,
  canPlayerAttempt,
  getAthleteBestHeight,
} from '@/game/competition'
import { generateWindSpeed, calculateSuccessProbability, calculateActualHeight } from '@/game/physics'
import { saveCompetitionResult } from '@/game/storage'

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void
  setWindSpeed: (wind: number) => void
  setRunUpProgress: (progress: number) => void
  setJumpAngle: (angle: number) => void
  setSelectedTechnique: (style: JumpStyle) => void
  setAnimationFrame: (frame: number) => void
  setShowResult: (show: boolean) => void
  setCurrentJumpResult: (result: JumpResult | null) => void

  initGame: (playerName: string, style: JumpStyle) => void
  startQualifying: () => void
  startFinal: (qualifiedAthletes: Athlete[]) => void
  executePlayerJump: () => void
  executeAIJump: () => void
  processNextTurn: () => void
  finishCompetition: () => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  competition: null,
  playerAthlete: null,
  windSpeed: 0,
  runUpProgress: 0,
  jumpAngle: 45,
  selectedTechnique: 'fosbury',
  animationFrame: 0,
  currentJumpResult: null,
  showResult: false,

  setPhase: (phase) => set({ phase }),
  setWindSpeed: (windSpeed) => set({ windSpeed }),
  setRunUpProgress: (runUpProgress) => set({ runUpProgress }),
  setJumpAngle: (jumpAngle) => set({ jumpAngle }),
  setSelectedTechnique: (selectedTechnique) => set({ selectedTechnique }),
  setAnimationFrame: (animationFrame) => set({ animationFrame }),
  setShowResult: (showResult) => set({ showResult }),
  setCurrentJumpResult: (currentJumpResult) => set({ currentJumpResult }),

  initGame: (playerName, style) => {
    const player = createPlayerAthlete(playerName, style)
    const opponents = createAIOpponents()
    const allAthletes = [player, ...opponents]

    set({
      playerAthlete: player,
      selectedTechnique: style,
      windSpeed: generateWindSpeed(),
    })
  },

  startQualifying: () => {
    const { playerAthlete } = get()
    if (!playerAthlete) return

    const opponents = createAIOpponents()
    const allAthletes = [playerAthlete, ...opponents]
    const competition = createCompetition('qualifying', allAthletes)

    set({
      competition,
      phase: 'preparing',
      windSpeed: generateWindSpeed(),
    })
  },

  startFinal: (qualifiedAthletes) => {
    const competition = createCompetition('final', qualifiedAthletes)

    set({
      competition,
      phase: 'preparing',
      windSpeed: generateWindSpeed(),
    })
  },

  executePlayerJump: () => {
    const { competition, playerAthlete, windSpeed, jumpAngle, selectedTechnique, runUpProgress } = get()
    if (!competition || !playerAthlete) return

    const attempts = getAthleteAttempts(competition, playerAthlete.id)
    const bestHeight = getAthleteBestHeight(competition, playerAthlete.id)

    if (!canPlayerAttempt(competition)) return

    const successProb = calculateSuccessProbability(
      playerAthlete,
      competition.currentHeight,
      windSpeed,
      jumpAngle,
      selectedTechnique,
      runUpProgress
    )

    const actualHeight = calculateActualHeight(
      playerAthlete,
      jumpAngle,
      windSpeed,
      selectedTechnique,
      runUpProgress
    )

    const success = actualHeight >= competition.currentHeight && Math.random() < successProb + 0.2

    const result = createJumpResult(
      playerAthlete.id,
      competition.id,
      competition.currentHeight,
      success,
      windSpeed,
      playerAthlete.fatigue,
      selectedTechnique,
      attempts + 1,
      runUpProgress,
      jumpAngle
    )

    const updatedCompetition = {
      ...competition,
      results: [...competition.results, result],
    }

    const playerIndex = updatedCompetition.athletes.findIndex(a => a.id === playerAthlete.id)
    updatedCompetition.athletes[playerIndex] = {
      ...playerAthlete,
      fatigue: Math.min(100, playerAthlete.fatigue + 15),
    }

    set({
      competition: updatedCompetition,
      currentJumpResult: result,
      showResult: true,
      playerAthlete: updatedCompetition.athletes[playerIndex],
    })
  },

  executeAIJump: () => {
    const { competition } = get()
    if (!competition) return

    const aiResult = processAIJump(competition)
    if (!aiResult) return

    const { result, athlete } = aiResult

    const updatedCompetition = {
      ...competition,
      results: [...competition.results, result],
    }

    const athleteIndex = updatedCompetition.athletes.findIndex(a => a.id === athlete.id)
    updatedCompetition.athletes[athleteIndex] = {
      ...athlete,
      fatigue: Math.min(100, athlete.fatigue + 15),
    }

    set({
      competition: updatedCompetition,
      currentJumpResult: result,
      showResult: true,
    })
  },

  processNextTurn: () => {
    const { competition } = get()
    if (!competition) return

    const updated = nextAthlete(competition)
    const newWindSpeed = generateWindSpeed()

    set({
      competition: updated,
      windSpeed: newWindSpeed,
      showResult: false,
      currentJumpResult: null,
      runUpProgress: 0,
      phase: 'preparing',
    })

    if (updated.phase === 'finished') {
      get().finishCompetition()
    }
  },

  finishCompetition: () => {
    const { competition } = get()
    if (!competition) return

    const rankings = updateRankings(competition)
    const rankingsWithNames = rankings.map(r => ({
      athleteId: r.athleteId,
      bestHeight: r.bestHeight,
      isPlayer: competition.athletes.find(a => a.id === r.athleteId)?.isPlayer || false,
      athleteName: competition.athletes.find(a => a.id === r.athleteId)?.name || '',
    }))

    saveCompetitionResult(competition, rankingsWithNames)

    set({
      competition: {
        ...competition,
        rankings,
      },
      phase: 'award',
    })
  },

  resetGame: () => {
    set({
      phase: 'menu',
      competition: null,
      playerAthlete: null,
      windSpeed: 0,
      runUpProgress: 0,
      jumpAngle: 45,
      selectedTechnique: 'fosbury',
      animationFrame: 0,
      currentJumpResult: null,
      showResult: false,
    })
  },
}))
