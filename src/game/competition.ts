import type { Athlete, Competition, JumpResult, Ranking, JumpStyle } from './types'
import {
  QUALIFYING_HEIGHT,
  STARTING_HEIGHT_FINAL,
  HEIGHT_INCREMENT,
  MAX_ATTEMPTS_PER_HEIGHT,
  AI_ATHLETE_TEMPLATES,
  ATHLETE_COLORS,
  FATIGUE_PER_JUMP,
} from './constants'
import { generateWindSpeed } from './physics'
import { simulateAIJump } from './ai'

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function createAthlete(
  name: string,
  strength: number,
  technique: number,
  stamina: number,
  style: JumpStyle,
  isPlayer: boolean,
  colorIndex: number
): Athlete {
  return {
    id: generateId(),
    name,
    strength,
    technique,
    stamina,
    style,
    isPlayer,
    fatigue: 0,
    color: ATHLETE_COLORS[colorIndex % ATHLETE_COLORS.length],
  }
}

export function createPlayerAthlete(name: string, style: JumpStyle): Athlete {
  return createAthlete(name, 62, 65, 78, style, true, 0)
}

export function createAIOpponents(): Athlete[] {
  return AI_ATHLETE_TEMPLATES.slice(0, 5).map((template, index) => ({
    ...createAthlete(
      template.name,
      template.strength,
      template.technique,
      template.stamina,
      template.style,
      false,
      index + 1
    ),
    aiStyle: template.aiStyle,
  }))
}

export function createCompetition(
  type: 'qualifying' | 'final',
  athletes: Athlete[],
  qualifyingHeight: number = QUALIFYING_HEIGHT
): Competition {
  const now = new Date()
  const name = type === 'qualifying' ? '跳高资格赛' : '跳高决赛'

  const athleteAttempts: Record<string, number> = {}
  athletes.forEach(a => {
    athleteAttempts[a.id] = 0
  })

  return {
    id: generateId(),
    name,
    type,
    date: now.toISOString().split('T')[0],
    qualifyingHeight,
    currentHeight: type === 'qualifying' ? qualifyingHeight : STARTING_HEIGHT_FINAL,
    phase: type,
    athletes,
    results: [],
    currentAthleteIndex: 0,
    athleteAttempts,
    heightHistory: type === 'qualifying' ? [qualifyingHeight] : [STARTING_HEIGHT_FINAL],
    rankings: [],
    qualifiedAthletes: [],
  }
}

export function createJumpResult(
  athleteId: string,
  competitionId: string,
  height: number,
  success: boolean,
  windSpeed: number,
  fatigue: number,
  technique: JumpStyle,
  attemptNumber: number,
  runUpQuality: number,
  jumpAngle: number
): JumpResult {
  return {
    id: generateId(),
    athleteId,
    competitionId,
    height,
    success,
    windSpeed,
    fatigue,
    technique,
    timestamp: Date.now(),
    attemptNumber,
    runUpQuality,
    jumpAngle,
  }
}

export function getCurrentAthlete(competition: Competition): Athlete | null {
  if (competition.currentAthleteIndex >= competition.athletes.length) {
    return null
  }
  return competition.athletes[competition.currentAthleteIndex]
}

export function getAthleteAttempts(competition: Competition, athleteId: string): number {
  const heightResults = competition.results.filter(
    r => r.athleteId === athleteId && r.height === competition.currentHeight
  )
  return heightResults.length
}

export function getAthleteBestHeight(competition: Competition, athleteId: string): number {
  const successResults = competition.results.filter(
    r => r.athleteId === athleteId && r.success
  )
  if (successResults.length === 0) return 0
  return Math.max(...successResults.map(r => r.height))
}

export function processAIJump(competition: Competition): {
  result: JumpResult
  athlete: Athlete
} | null {
  const athlete = getCurrentAthlete(competition)
  if (!athlete || athlete.isPlayer) return null

  const attempts = getAthleteAttempts(competition, athlete.id)
  const bestHeight = getAthleteBestHeight(competition, athlete.id)

  const jump = simulateAIJump(athlete, competition.currentHeight, attempts, bestHeight)

  const result = createJumpResult(
    athlete.id,
    competition.id,
    competition.currentHeight,
    jump.success,
    jump.windSpeed,
    athlete.fatigue,
    jump.technique,
    attempts + 1,
    jump.runUpQuality,
    jump.angle
  )

  return { result, athlete }
}

export function updateRankings(competition: Competition): Ranking[] {
  const rankings: Ranking[] = competition.athletes.map(athlete => {
    const bestHeight = getAthleteBestHeight(competition, athlete.id)
    const totalAttempts = competition.results.filter(
      r => r.athleteId === athlete.id
    ).length
    const failedResults = competition.results.filter(
      r => r.athleteId === athlete.id && !r.success
    )
    const failedAtHeight = failedResults.length >= MAX_ATTEMPTS_PER_HEIGHT
      ? competition.currentHeight
      : null

    return {
      athleteId: athlete.id,
      bestHeight,
      totalAttempts,
      failedAtHeight,
    }
  })

  rankings.sort((a, b) => {
    if (b.bestHeight !== a.bestHeight) {
      return b.bestHeight - a.bestHeight
    }
    return a.totalAttempts - b.totalAttempts
  })

  return rankings
}

export function nextAthlete(competition: Competition): Competition {
  const updated = { ...competition }

  const currentAthlete = getCurrentAthlete(competition)
  if (currentAthlete) {
    const athleteIndex = updated.athletes.findIndex(a => a.id === currentAthlete.id)
    updated.athletes[athleteIndex] = {
      ...currentAthlete,
      fatigue: Math.min(100, currentAthlete.fatigue + FATIGUE_PER_JUMP),
    }
  }

  let nextIndex = competition.currentAthleteIndex + 1
  while (nextIndex < competition.athletes.length) {
    const athlete = competition.athletes[nextIndex]
    const bestHeight = getAthleteBestHeight(competition, athlete.id)
    const attempts = getAthleteAttempts(competition, athlete.id)

    if (competition.type === 'qualifying' && bestHeight >= competition.qualifyingHeight) {
      nextIndex++
      continue
    }

    if (attempts >= MAX_ATTEMPTS_PER_HEIGHT) {
      nextIndex++
      continue
    }

    break
  }

  if (nextIndex >= competition.athletes.length) {
    return nextHeight(competition)
  }

  updated.currentAthleteIndex = nextIndex
  return updated
}

export function nextHeight(competition: Competition): Competition {
  const updated = { ...competition }

  if (competition.type === 'qualifying') {
    updated.phase = 'finished'
    updated.qualifiedAthletes = competition.athletes
      .filter(a => getAthleteBestHeight(competition, a.id) >= competition.qualifyingHeight)
      .map(a => a.id)
    return updated
  }

  const athletesWithSuccess = competition.athletes.filter(
    a => getAthleteBestHeight(competition, a.id) > 0
  )

  if (athletesWithSuccess.length <= 1) {
    updated.phase = 'finished'
    return updated
  }

  const newHeight = Math.round((competition.currentHeight + HEIGHT_INCREMENT) * 100) / 100
  updated.currentHeight = newHeight
  updated.heightHistory.push(newHeight)
  updated.currentAthleteIndex = 0

  return updated
}

export function canPlayerAttempt(competition: Competition): boolean {
  const player = competition.athletes.find(a => a.isPlayer)
  if (!player) return false

  const bestHeight = getAthleteBestHeight(competition, player.id)

  if (competition.type === 'qualifying' && bestHeight >= competition.qualifyingHeight) {
    return false
  }

  const attempts = getAthleteAttempts(competition, player.id)
  return attempts < MAX_ATTEMPTS_PER_HEIGHT
}
