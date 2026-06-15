import type { Athlete, JumpStyle, AIStyle } from './types'
import { calculateBaseHeight, generateWindSpeed } from './physics'
import { MAX_ATTEMPTS_PER_HEIGHT, OPTIMAL_ANGLE_MIN, OPTIMAL_ANGLE_MAX } from './constants'

export function generateAIDecision(
  athlete: Athlete,
  currentHeight: number,
  attemptsAtHeight: number,
  bestHeight: number
): {
  jumpAngle: number
  technique: JumpStyle
  runUpQuality: number
  windSpeed: number
} {
  const aiStyle = athlete.aiStyle || 'balanced'
  const baseHeight = calculateBaseHeight(athlete)

  let jumpAngle: number
  let technique: JumpStyle
  let runUpQuality: number

  switch (aiStyle) {
    case 'conservative':
      jumpAngle = OPTIMAL_ANGLE_MIN + Math.random() * (OPTIMAL_ANGLE_MAX - OPTIMAL_ANGLE_MIN)
      technique = athlete.style
      runUpQuality = 0.85 + Math.random() * 0.1
      break

    case 'aggressive':
      const angleBias = currentHeight > baseHeight ? (currentHeight - baseHeight) * 10 : 0
      jumpAngle = OPTIMAL_ANGLE_MIN + Math.random() * (OPTIMAL_ANGLE_MAX - OPTIMAL_ANGLE_MIN) + angleBias
      technique = athlete.style
      runUpQuality = 0.75 + Math.random() * 0.25
      break

    case 'balanced':
    default:
      jumpAngle = OPTIMAL_ANGLE_MIN + Math.random() * (OPTIMAL_ANGLE_MAX - OPTIMAL_ANGLE_MIN)
      technique = athlete.style
      runUpQuality = 0.8 + Math.random() * 0.15
      break
  }

  jumpAngle = Math.max(35, Math.min(55, jumpAngle))

  return {
    jumpAngle: Math.round(jumpAngle * 10) / 10,
    technique,
    runUpQuality: Math.round(runUpQuality * 100) / 100,
    windSpeed: generateWindSpeed(),
  }
}

export function shouldAIContinue(
  athlete: Athlete,
  currentHeight: number,
  attemptsAtHeight: number,
  bestHeight: number,
  phase: 'qualifying' | 'final'
): boolean {
  if (attemptsAtHeight >= MAX_ATTEMPTS_PER_HEIGHT) {
    return false
  }

  const aiStyle = athlete.aiStyle || 'balanced'
  const baseHeight = calculateBaseHeight(athlete)
  const difficulty = currentHeight - baseHeight

  if (phase === 'qualifying') {
    return true
  }

  switch (aiStyle) {
    case 'conservative':
      if (difficulty > 0.15 && attemptsAtHeight >= 1) {
        return false
      }
      return true

    case 'aggressive':
      if (difficulty > 0.25 && attemptsAtHeight >= 2) {
        return false
      }
      return true

    case 'balanced':
    default:
      if (difficulty > 0.2 && attemptsAtHeight >= 2) {
        return false
      }
      return true
  }
}

export function simulateAIJump(
  athlete: Athlete,
  currentHeight: number,
  attemptsAtHeight: number,
  bestHeight: number
): {
  angle: number
  runUpQuality: number
  technique: JumpStyle
  windSpeed: number
  success: boolean
  actualHeight: number
} {
  const decision = generateAIDecision(athlete, currentHeight, attemptsAtHeight, bestHeight)
  
  const baseSuccess = (athlete.strength * 0.4 + athlete.technique * 0.6) / 100
  const windFactor = 1 + decision.windSpeed * 0.02
  const fatigueFactor = 1 - athlete.fatigue * 0.005
  const angleFactor = 1 - Math.abs(decision.jumpAngle - 45) * 0.02
  const runUpFactor = 0.7 + decision.runUpQuality * 0.3
  const baseHeight = calculateBaseHeight(athlete)
  const heightFactor = Math.max(0, 1 - (currentHeight - baseHeight) * 1.5)

  const successProbability = baseSuccess * windFactor * fatigueFactor * angleFactor * runUpFactor * heightFactor
  const success = Math.random() < successProbability

  const actualHeight = baseHeight * windFactor * fatigueFactor * angleFactor * runUpFactor * (0.95 + Math.random() * 0.1)

  return {
    angle: decision.jumpAngle,
    runUpQuality: decision.runUpQuality,
    technique: decision.technique,
    windSpeed: decision.windSpeed,
    success,
    actualHeight: Math.round(actualHeight * 100) / 100,
  }
}
