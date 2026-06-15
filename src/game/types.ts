export type JumpStyle = 'straddle' | 'fosbury' | 'scissors'

export type AIStyle = 'conservative' | 'aggressive' | 'balanced'

export type CompetitionPhase = 'qualifying' | 'final' | 'finished'

export type GamePhase = 'menu' | 'preparing' | 'running' | 'jumping' | 'result' | 'award' | 'history'

export interface Athlete {
  id: string
  name: string
  strength: number
  technique: number
  stamina: number
  style: JumpStyle
  aiStyle?: AIStyle
  isPlayer: boolean
  fatigue: number
  color: string
}

export interface JumpResult {
  id: string
  athleteId: string
  competitionId: string
  height: number
  success: boolean
  windSpeed: number
  fatigue: number
  technique: JumpStyle
  timestamp: number
  attemptNumber: number
  runUpQuality: number
  jumpAngle: number
}

export interface Ranking {
  athleteId: string
  bestHeight: number
  totalAttempts: number
  failedAtHeight: number | null
}

export interface Competition {
  id: string
  name: string
  type: 'qualifying' | 'final'
  date: string
  qualifyingHeight: number
  currentHeight: number
  phase: CompetitionPhase
  athletes: Athlete[]
  results: JumpResult[]
  currentAthleteIndex: number
  athleteAttempts: Record<string, number>
  heightHistory: number[]
  rankings: Ranking[]
  qualifiedAthletes: string[]
}

export interface GameState {
  phase: GamePhase
  competition: Competition | null
  playerAthlete: Athlete | null
  windSpeed: number
  runUpProgress: number
  jumpAngle: number
  selectedTechnique: JumpStyle
  animationFrame: number
  currentJumpResult: JumpResult | null
  showResult: boolean
}

export interface Bone {
  name: string
  length: number
  angle: number
  parent?: string
}

export interface SkeletonPose {
  bones: Record<string, { angle: number }>
  rootX: number
  rootY: number
}

export interface AnimationKeyframe {
  time: number
  pose: SkeletonPose
}

export type AnimationType = 'idle' | 'run' | 'jump' | 'land'

export interface StoredCompetition {
  id: string
  name: string
  date: string
  type: 'qualifying' | 'final'
  rankings: {
    athleteName: string
    bestHeight: number
    isPlayer: boolean
  }[]
  playerBestHeight: number
  playerRank: number
}
