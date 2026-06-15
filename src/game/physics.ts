import {
  TECHNIQUE_MODIFIERS,
  OPTIMAL_ANGLE_BEST,
  WIND_MIN,
  WIND_MAX,
} from './constants'
import type { Athlete, JumpStyle } from './types'

export function calculateBaseHeight(athlete: Athlete): number {
  return 1.0 + athlete.strength * 0.007 + athlete.technique * 0.005
}

export function calculateSuccessProbability(
  athlete: Athlete,
  height: number,
  windSpeed: number,
  jumpAngle: number,
  technique: JumpStyle,
  runUpQuality: number
): number {
  const baseSuccess = (athlete.strength * 0.4 + athlete.technique * 0.6) / 100

  const techModifier = TECHNIQUE_MODIFIERS[technique]
  const techniqueFactor = techModifier.stability

  const windFactor = 1 + windSpeed * 0.018
  const fatigueFactor = 1 - athlete.fatigue * 0.004
  const angleFactor = 1 - Math.abs(jumpAngle - OPTIMAL_ANGLE_BEST) * 0.025
  const runUpFactor = 0.65 + runUpQuality * 0.35

  const baseHeight = calculateBaseHeight(athlete)
  const effectiveBase = baseHeight * techModifier.base
  const difficulty = height - effectiveBase
  const heightFactor = Math.max(0, 1 - difficulty * 2.8)

  const maxAchievable = effectiveBase * 1.15
  if (height > maxAchievable) {
    const overflowPenalty = (height - maxAchievable) * 5
    return Math.max(0, 0.05 - overflowPenalty)
  }

  const probability = baseSuccess *
    techniqueFactor *
    windFactor *
    fatigueFactor *
    angleFactor *
    runUpFactor *
    heightFactor

  return Math.max(0, Math.min(1, probability))
}

export function calculateActualHeight(
  athlete: Athlete,
  jumpAngle: number,
  windSpeed: number,
  technique: JumpStyle,
  runUpQuality: number
): number {
  const baseHeight = calculateBaseHeight(athlete)
  const techModifier = TECHNIQUE_MODIFIERS[technique]
  const fatigueFactor = 1 - athlete.fatigue * 0.0025
  const windFactor = 1 + windSpeed * 0.012
  const angleFactor = 1 - Math.abs(jumpAngle - OPTIMAL_ANGLE_BEST) * 0.012
  const runUpFactor = 0.78 + runUpQuality * 0.22

  const techniqueFactor = 0.85 + techModifier.base * 0.15

  const randomFactor = 0.92 + Math.random() * 0.16

  const actualHeight = baseHeight *
    techniqueFactor *
    fatigueFactor *
    windFactor *
    angleFactor *
    runUpFactor *
    randomFactor

  return Math.round(actualHeight * 100) / 100
}

export function generateWindSpeed(): number {
  return Math.round((WIND_MIN + Math.random() * (WIND_MAX - WIND_MIN)) * 10) / 10
}

export function calculateJumpTrajectory(
  startX: number,
  startY: number,
  maxHeight: number,
  distance: number,
  progress: number
): { x: number; y: number } {
  const x = startX + distance * progress
  const y = startY - 4 * maxHeight * progress * (1 - progress)
  return { x, y }
}

export const OPTIMAL_RUN_UP_POINT = 0.8

export function calculateRunUpQuality(runUpProgress: number): number {
  const diff = Math.abs(runUpProgress - OPTIMAL_RUN_UP_POINT)
  if (diff <= 0.02) return 1.0
  if (diff <= 0.05) return 0.95 - (diff - 0.02) * 1.67
  if (diff <= 0.15) return 0.9 - (diff - 0.05) * 1.0
  if (diff <= 0.3) return 0.8 - (diff - 0.15) * 1.33
  return Math.max(0.4, 0.6 - (diff - 0.3) * 1.0)
}
