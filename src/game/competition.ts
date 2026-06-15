import type { Athlete, Competition, CompetitionPhase, JumpResult, Ranking, JumpStyle } from './types'
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

// ============================================================================
// 架构说明
// ============================================================================
//
// 本文件采用三层架构，将业务逻辑与状态操作彻底分离：
//
// 【第一层】纯函数层（Pure Computation Layer）
//   所有与状态变更无关的计算逻辑，包括：
//   - 资格赛晋级判断、决赛排名计算、平局比较
//   - 颁奖信息生成、高度赛程生成、运动员状态判定
//   输入输出类型明确，不依赖任何外部闭包变量
//   同一输入永远产出相同输出，可独立单元测试
//   命名约定：compute / is / find / count / generate / compare
//   ★ 新增计算逻辑应优先放入此层
//
// 【第二层】决策层（Decision Layer）
//   根据当前竞赛状态，返回变更描述对象（CompetitionChange）
//   不直接修改任何状态，只描述"应该发生什么变更"
//   决策逻辑与状态构造完全分离
//   命名约定：decide
//
// 【第三层】执行层（Execution Layer）
//   将变更描述对象应用到实际 Competition 状态上
//   仅此层负责构造新的 Competition 对象
//   命名约定：apply
//
// 【向后兼容适配层】
//   保留所有原有导出函数签名不变，内部委托至三层架构
//   上层调用方无需任何修改
//
// ============================================================================

// ============================================================================
// 变更描述类型定义
// ============================================================================

interface FatigueUpdate {
  athleteId: string
  newFatigue: number
}

type CompetitionChange =
  | { type: 'advance_athlete'; nextIndex: number; fatigueUpdates: FatigueUpdate[] }
  | { type: 'advance_height'; newHeight: number; phase: CompetitionPhase; qualifiedAthletes: string[]; fatigueUpdates: FatigueUpdate[] }
  | { type: 'finish_competition'; phase: CompetitionPhase; qualifiedAthletes: string[]; fatigueUpdates: FatigueUpdate[] }

// ============================================================================
// 第一层 · 纯函数层（Pure Computation Layer）
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function computeBestHeight(results: JumpResult[], athleteId: string): number {
  const successResults = results.filter(r => r.athleteId === athleteId && r.success)
  if (successResults.length === 0) return 0
  return Math.max(...successResults.map(r => r.height))
}

export function countAttemptsAtHeight(results: JumpResult[], athleteId: string, height: number): number {
  return results.filter(r => r.athleteId === athleteId && r.height === height).length
}

export function isQualified(results: JumpResult[], athleteId: string, qualifyingHeight: number): boolean {
  return computeBestHeight(results, athleteId) >= qualifyingHeight
}

export function isEliminatedAtHeight(results: JumpResult[], athleteId: string, height: number, maxAttempts: number): boolean {
  return countAttemptsAtHeight(results, athleteId, height) >= maxAttempts
}

export function isAthleteDone(
  results: JumpResult[],
  athleteId: string,
  currentHeight: number,
  qualifyingHeight: number,
  competitionType: 'qualifying' | 'final',
  maxAttempts: number
): boolean {
  if (competitionType === 'qualifying' && isQualified(results, athleteId, qualifyingHeight)) {
    return true
  }
  return isEliminatedAtHeight(results, athleteId, currentHeight, maxAttempts)
}

export function findNextEligibleAthleteIndex(
  athletes: Athlete[],
  results: JumpResult[],
  currentHeight: number,
  qualifyingHeight: number,
  competitionType: 'qualifying' | 'final',
  startIndex: number,
  maxAttempts: number
): number {
  let index = startIndex
  while (index < athletes.length) {
    const athlete = athletes[index]
    if (isAthleteDone(results, athlete.id, currentHeight, qualifyingHeight, competitionType, maxAttempts)) {
      index++
      continue
    }
    break
  }
  return index
}

export function computeNextHeight(currentHeight: number, increment: number): number {
  return Math.round((currentHeight + increment) * 100) / 100
}

export function computeQualifiedAthletes(athletes: Athlete[], results: JumpResult[], qualifyingHeight: number): string[] {
  return athletes
    .filter(a => computeBestHeight(results, a.id) >= qualifyingHeight)
    .map(a => a.id)
}

export function computeRankings(
  athletes: Athlete[],
  results: JumpResult[],
  currentHeight: number,
  maxAttempts: number
): Ranking[] {
  const rankings: Ranking[] = athletes.map(athlete => {
    const bestHeight = computeBestHeight(results, athlete.id)
    const totalAttempts = results.filter(r => r.athleteId === athlete.id).length
    const failedResults = results.filter(r => r.athleteId === athlete.id && !r.success)
    const failedAtHeight = failedResults.length >= maxAttempts ? currentHeight : null
    return {
      athleteId: athlete.id,
      bestHeight,
      totalAttempts,
      failedAtHeight,
    }
  })
  rankings.sort(compareRankings)
  return rankings
}

export function compareRankings(a: Ranking, b: Ranking): number {
  if (b.bestHeight !== a.bestHeight) {
    return b.bestHeight - a.bestHeight
  }
  return a.totalAttempts - b.totalAttempts
}

export function computeAwardInfo(
  athletes: Athlete[],
  results: JumpResult[]
): Array<{ athlete: Athlete; bestHeight: number; rank: number }> {
  const sorted = athletes
    .map(athlete => ({
      athlete,
      bestHeight: computeBestHeight(results, athlete.id),
    }))
    .sort((a, b) => b.bestHeight - a.bestHeight)
  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))
}

export function generateHeightSchedule(startHeight: number, increment: number, ceiling: number): number[] {
  const schedule: number[] = []
  let h = startHeight
  while (h <= ceiling) {
    schedule.push(h)
    h = computeNextHeight(h, increment)
  }
  return schedule
}

export function shouldFinishFinal(athletes: Athlete[], results: JumpResult[]): boolean {
  const athletesWithSuccess = athletes.filter(a => computeBestHeight(results, a.id) > 0)
  return athletesWithSuccess.length <= 1
}

export function canAthleteAttempt(
  results: JumpResult[],
  athleteId: string,
  currentHeight: number,
  qualifyingHeight: number,
  competitionType: 'qualifying' | 'final',
  maxAttempts: number
): boolean {
  if (competitionType === 'qualifying' && isQualified(results, athleteId, qualifyingHeight)) {
    return false
  }
  return !isEliminatedAtHeight(results, athleteId, currentHeight, maxAttempts)
}

// ============================================================================
// 第二层 · 决策层（Decision Layer）
// ============================================================================

export function decideCompetitionTransition(competition: Competition): CompetitionChange {
  const currentAthlete = competition.athletes[competition.currentAthleteIndex] ?? null

  const nextIndex = findNextEligibleAthleteIndex(
    competition.athletes,
    competition.results,
    competition.currentHeight,
    competition.qualifyingHeight,
    competition.type,
    competition.currentAthleteIndex + 1,
    MAX_ATTEMPTS_PER_HEIGHT
  )

  if (nextIndex < competition.athletes.length) {
    const fatigueUpdates: FatigueUpdate[] = []
    if (currentAthlete) {
      fatigueUpdates.push({
        athleteId: currentAthlete.id,
        newFatigue: Math.min(100, currentAthlete.fatigue + FATIGUE_PER_JUMP),
      })
    }
    return { type: 'advance_athlete', nextIndex, fatigueUpdates }
  }

  if (competition.type === 'qualifying') {
    return {
      type: 'finish_competition',
      phase: 'finished',
      qualifiedAthletes: computeQualifiedAthletes(competition.athletes, competition.results, competition.qualifyingHeight),
      fatigueUpdates: [],
    }
  }

  if (shouldFinishFinal(competition.athletes, competition.results)) {
    return { type: 'finish_competition', phase: 'finished', qualifiedAthletes: [], fatigueUpdates: [] }
  }

  const newHeight = computeNextHeight(competition.currentHeight, HEIGHT_INCREMENT)
  return {
    type: 'advance_height',
    newHeight,
    phase: competition.type,
    qualifiedAthletes: [],
    fatigueUpdates: [],
  }
}

// ============================================================================
// 第三层 · 执行层（Execution Layer）
// ============================================================================

export function applyCompetitionChange(competition: Competition, change: CompetitionChange): Competition {
  const updated = { ...competition }

  if (change.fatigueUpdates.length > 0) {
    updated.athletes = updated.athletes.map(athlete => {
      const fu = change.fatigueUpdates.find(f => f.athleteId === athlete.id)
      return fu ? { ...athlete, fatigue: fu.newFatigue } : athlete
    })
  }

  switch (change.type) {
    case 'advance_athlete':
      updated.currentAthleteIndex = change.nextIndex
      break

    case 'advance_height':
      updated.currentHeight = change.newHeight
      updated.heightHistory = [...updated.heightHistory, change.newHeight]
      updated.currentAthleteIndex = 0
      break

    case 'finish_competition':
      updated.phase = change.phase
      updated.qualifiedAthletes = change.qualifiedAthletes
      break
  }

  return updated
}

// ============================================================================
// 向后兼容适配层 — 保留所有原有导出函数签名不变
// ============================================================================

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
  return countAttemptsAtHeight(competition.results, athleteId, competition.currentHeight)
}

export function getAthleteBestHeight(competition: Competition, athleteId: string): number {
  return computeBestHeight(competition.results, athleteId)
}

export function processAIJump(competition: Competition): {
  result: JumpResult
  athlete: Athlete
} | null {
  const athlete = getCurrentAthlete(competition)
  if (!athlete || athlete.isPlayer) return null

  const attempts = countAttemptsAtHeight(competition.results, athlete.id, competition.currentHeight)
  const bestHeight = computeBestHeight(competition.results, athlete.id)

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
  return computeRankings(competition.athletes, competition.results, competition.currentHeight, MAX_ATTEMPTS_PER_HEIGHT)
}

export function nextAthlete(competition: Competition): Competition {
  const change = decideCompetitionTransition(competition)
  return applyCompetitionChange(competition, change)
}

export function nextHeight(competition: Competition): Competition {
  const updated = { ...competition }

  if (competition.type === 'qualifying') {
    updated.phase = 'finished'
    updated.qualifiedAthletes = computeQualifiedAthletes(competition.athletes, competition.results, competition.qualifyingHeight)
    return updated
  }

  if (shouldFinishFinal(competition.athletes, competition.results)) {
    updated.phase = 'finished'
    return updated
  }

  const newHeight = computeNextHeight(competition.currentHeight, HEIGHT_INCREMENT)
  updated.currentHeight = newHeight
  updated.heightHistory = [...updated.heightHistory, newHeight]
  updated.currentAthleteIndex = 0

  return updated
}

export function canPlayerAttempt(competition: Competition): boolean {
  const player = competition.athletes.find(a => a.isPlayer)
  if (!player) return false

  return canAthleteAttempt(
    competition.results,
    player.id,
    competition.currentHeight,
    competition.qualifyingHeight,
    competition.type,
    MAX_ATTEMPTS_PER_HEIGHT
  )
}
