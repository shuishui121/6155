import type { JumpStyle, AIStyle } from './types'

export const QUALIFYING_HEIGHT = 2.0

export const STARTING_HEIGHT_FINAL = 2.0

export const HEIGHT_INCREMENT = 0.05

export const MAX_ATTEMPTS_PER_HEIGHT = 3

export const WIND_MIN = -5
export const WIND_MAX = 5

export const FATIGUE_PER_JUMP = 15
export const FATIGUE_RECOVERY = 5

export const OPTIMAL_ANGLE_MIN = 40
export const OPTIMAL_ANGLE_MAX = 50
export const OPTIMAL_ANGLE_BEST = 45

export const TECHNIQUE_MODIFIERS: Record<JumpStyle, { base: number; ceiling: number; stability: number }> = {
  fosbury: { base: 1.12, ceiling: 2.40, stability: 0.85 },
  straddle: { base: 1.06, ceiling: 2.25, stability: 0.92 },
  scissors: { base: 0.98, ceiling: 2.05, stability: 0.96 },
}

export const STYLE_NAMES: Record<JumpStyle, string> = {
  fosbury: '背越式',
  straddle: '俯卧式',
  scissors: '跨越式',
}

export const AI_STYLE_NAMES: Record<AIStyle, string> = {
  conservative: '稳健型',
  aggressive: '冲击型',
  balanced: '平衡型',
}

export const ATHLETE_COLORS = [
  '#FF6B35',
  '#004E89',
  '#6BAA75',
  '#9B59B6',
  '#E74C3C',
  '#F39C12',
  '#3498DB',
  '#1ABC9C',
]

export const AI_ATHLETE_TEMPLATES = [
  { name: '张宇', strength: 62, technique: 68, stamina: 70, style: 'fosbury' as JumpStyle, aiStyle: 'aggressive' as AIStyle },
  { name: '李明', strength: 58, technique: 72, stamina: 75, style: 'straddle' as JumpStyle, aiStyle: 'conservative' as AIStyle },
  { name: '王强', strength: 65, technique: 65, stamina: 80, style: 'fosbury' as JumpStyle, aiStyle: 'balanced' as AIStyle },
  { name: '赵飞', strength: 70, technique: 58, stamina: 68, style: 'scissors' as JumpStyle, aiStyle: 'aggressive' as AIStyle },
  { name: '陈晨', strength: 60, technique: 70, stamina: 72, style: 'straddle' as JumpStyle, aiStyle: 'balanced' as AIStyle },
  { name: '刘洋', strength: 68, technique: 62, stamina: 66, style: 'fosbury' as JumpStyle, aiStyle: 'conservative' as AIStyle },
  { name: '孙磊', strength: 56, technique: 75, stamina: 78, style: 'fosbury' as JumpStyle, aiStyle: 'balanced' as AIStyle },
]

export const STORAGE_KEY = 'high_jump_game_history'

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 500

export const GROUND_Y = 420
export const BAR_X = 550
