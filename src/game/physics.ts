import {
  TECHNIQUE_MODIFIERS,
  OPTIMAL_ANGLE_BEST,
  WIND_MIN,
  WIND_MAX,
} from './constants'
import type { Athlete, JumpStyle } from './types'

export function calculateBaseHeight(athlete: Athlete): number {
  return 1.5 + athlete.strength * 0.01 + athlete.technique * 0.008
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
  const techniqueFactor = techModifier.base

  const windFactor = 1 + windSpeed * 0.02
  const fatigueFactor = 1 - athlete.fatigue * 0.005
  const angleFactor = 1 - Math.abs(jumpAngle - OPTIMAL_ANGLE_BEST) * 0.02
  const runUpFactor = 0.7 + runUpQuality * 0.3

  const baseHeight = calculateBaseHeight(athlete)
  const heightFactor = Math.max(0, 1 - (height - baseHeight) * 1.5)

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
  const fatigueFactor = 1 - athlete.fatigue * 0.003
  const windFactor = 1 + windSpeed * 0.015
  const angleFactor = 1 - Math.abs(jumpAngle - OPTIMAL_ANGLE_BEST) * 0.015
  const runUpFactor = 0.8 + runUpQuality * 0.2

  const randomFactor = 0.95 + Math.random() * 0.1

  const actualHeight = baseHeight *
    techModifier.base *
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
