import type { SkeletonPose, JumpStyle } from './types'
import { GROUND_Y, BAR_X } from './constants'
import { calculateJumpTrajectory } from './physics'

const BASE_POSE: SkeletonPose = {
  bones: {
    torso: { angle: -90 },
    head: { angle: -90 },
    leftArm: { angle: -120 },
    rightArm: { angle: -60 },
    leftLeg: { angle: -90 },
    rightLeg: { angle: -90 },
    leftForearm: { angle: -120 },
    rightForearm: { angle: -60 },
    leftShin: { angle: -90 },
    rightShin: { angle: -90 },
  },
  rootX: 100,
  rootY: GROUND_Y - 80,
}

export function getIdlePose(time: number): SkeletonPose {
  const breathe = Math.sin(time * 0.003) * 2
  return {
    bones: {
      torso: { angle: -90 + breathe },
      head: { angle: -90 },
      leftArm: { angle: -130 + breathe },
      rightArm: { angle: -50 - breathe },
      leftLeg: { angle: -90 },
      rightLeg: { angle: -90 },
      leftForearm: { angle: -140 },
      rightForearm: { angle: -40 },
      leftShin: { angle: -90 },
      rightShin: { angle: -90 },
    },
    rootX: 100,
    rootY: GROUND_Y - 80,
  }
}

export function getRunPose(time: number, speed: number = 1): SkeletonPose {
  const t = time * 0.01 * speed
  const legSwing = Math.sin(t) * 35
  const armSwing = Math.sin(t + Math.PI) * 30
  const bobY = Math.abs(Math.sin(t * 2)) * 5

  return {
    bones: {
      torso: { angle: -80 },
      head: { angle: -90 },
      leftArm: { angle: -90 - armSwing },
      rightArm: { angle: -90 + armSwing },
      leftLeg: { angle: -90 + legSwing },
      rightLeg: { angle: -90 - legSwing },
      leftForearm: { angle: -90 - armSwing - 20 },
      rightForearm: { angle: -90 + armSwing + 20 },
      leftShin: { angle: -90 + legSwing * 0.7 },
      rightShin: { angle: -90 - legSwing * 0.7 },
    },
    rootX: 100,
    rootY: GROUND_Y - 80 - bobY,
  }
}

export function getJumpPose(
  progress: number,
  style: JumpStyle,
  maxHeight: number,
  startX: number = 100,
  distance: number = 300
): SkeletonPose {
  const trajectory = calculateJumpTrajectory(startX, GROUND_Y - 80, maxHeight * 50, distance, progress)

  if (progress < 0.1) {
    const takeoffProgress = progress / 0.1
    return {
      bones: {
        torso: { angle: -70 + takeoffProgress * 20 },
        head: { angle: -85 },
        leftArm: { angle: -120 + takeoffProgress * 60 },
        rightArm: { angle: -60 - takeoffProgress * 60 },
        leftLeg: { angle: -110 + takeoffProgress * 40 },
        rightLeg: { angle: -70 - takeoffProgress * 40 },
        leftForearm: { angle: -130 + takeoffProgress * 50 },
        rightForearm: { angle: -50 - takeoffProgress * 50 },
        leftShin: { angle: -100 + takeoffProgress * 30 },
        rightShin: { angle: -80 - takeoffProgress * 30 },
      },
      rootX: trajectory.x,
      rootY: trajectory.y,
    }
  }

  if (progress < 0.5) {
    const ascentProgress = (progress - 0.1) / 0.4
    if (style === 'fosbury') {
      const arch = Math.sin(ascentProgress * Math.PI) * 40
      return {
        bones: {
          torso: { angle: -90 + arch },
          head: { angle: -90 + arch * 0.5 },
          leftArm: { angle: -180 + ascentProgress * 45 },
          rightArm: { angle: 0 - ascentProgress * 45 },
          leftLeg: { angle: -130 + ascentProgress * 50 },
          rightLeg: { angle: -50 - ascentProgress * 50 },
          leftForearm: { angle: -160 + ascentProgress * 30 },
          rightForearm: { angle: 20 - ascentProgress * 30 },
          leftShin: { angle: -120 + ascentProgress * 40 },
          rightShin: { angle: -60 - ascentProgress * 40 },
        },
        rootX: trajectory.x,
        rootY: trajectory.y,
      }
    } else if (style === 'straddle') {
      const lean = Math.sin(ascentProgress * Math.PI) * 60
      return {
        bones: {
          torso: { angle: -30 - lean * 0.3 },
          head: { angle: -45 - lean * 0.2 },
          leftArm: { angle: -45 },
          rightArm: { angle: -135 },
          leftLeg: { angle: -10 },
          rightLeg: { angle: -170 },
          leftForearm: { angle: -45 },
          rightForearm: { angle: -135 },
          leftShin: { angle: 0 },
          rightShin: { angle: -180 },
        },
        rootX: trajectory.x,
        rootY: trajectory.y,
      }
    } else {
      const spread = Math.sin(ascentProgress * Math.PI) * 50
      return {
        bones: {
          torso: { angle: -90 },
          head: { angle: -90 },
          leftArm: { angle: -135 },
          rightArm: { angle: -45 },
          leftLeg: { angle: -140 + spread * 0.5 },
          rightLeg: { angle: -40 - spread * 0.5 },
          leftForearm: { angle: -150 },
          rightForearm: { angle: -30 },
          leftShin: { angle: -135 + spread * 0.3 },
          rightShin: { angle: -45 - spread * 0.3 },
        },
        rootX: trajectory.x,
        rootY: trajectory.y,
      }
    }
  }

  if (progress < 0.8) {
    const descentProgress = (progress - 0.5) / 0.3
    return {
      bones: {
        torso: { angle: -90 + descentProgress * 30 },
        head: { angle: -80 },
        leftArm: { angle: -160 + descentProgress * 40 },
        rightArm: { angle: -20 - descentProgress * 40 },
        leftLeg: { angle: -110 + descentProgress * 30 },
        rightLeg: { angle: -70 - descentProgress * 30 },
        leftForearm: { angle: -150 + descentProgress * 30 },
        rightForearm: { angle: -30 - descentProgress * 30 },
        leftShin: { angle: -100 + descentProgress * 20 },
        rightShin: { angle: -80 - descentProgress * 20 },
      },
      rootX: trajectory.x,
      rootY: trajectory.y,
    }
  }

  const landProgress = (progress - 0.8) / 0.2
  return {
    bones: {
      torso: { angle: -60 + landProgress * 30 },
      head: { angle: -70 },
      leftArm: { angle: -120 + landProgress * 30 },
      rightArm: { angle: -60 - landProgress * 30 },
      leftLeg: { angle: -80 },
      rightLeg: { angle: -100 },
      leftForearm: { angle: -110 + landProgress * 20 },
      rightForearm: { angle: -70 - landProgress * 20 },
      leftShin: { angle: -90 },
      rightShin: { angle: -90 },
    },
    rootX: trajectory.x,
    rootY: Math.min(trajectory.y, GROUND_Y - 80),
  }
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  pose: SkeletonPose,
  color: string = '#FF6B35',
  scale: number = 1
) {
  const { bones, rootX, rootY } = pose

  const boneLengths: Record<string, number> = {
    torso: 40,
    head: 0,
    leftArm: 25,
    rightArm: 25,
    leftForearm: 25,
    rightForearm: 25,
    leftLeg: 35,
    rightLeg: 35,
    leftShin: 35,
    rightShin: 35,
  }

  const joints: Record<string, { x: number; y: number; parentAngle?: number }> = {
    torso: { x: rootX, y: rootY },
  }

  function drawBone(name: string, parentName?: string) {
    const bone = bones[name]
    if (!bone) return

    const length = boneLengths[name] * scale
    const angle = (bone.angle * Math.PI) / 180

    let startX = rootX
    let startY = rootY

    if (parentName && joints[parentName]) {
      startX = joints[parentName].x
      startY = joints[parentName].y
    }

    const endX = startX + Math.cos(angle) * length
    const endY = startY + Math.sin(angle) * length

    joints[name] = { x: endX, y: endY }

    if (length > 0) {
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = color
      ctx.lineWidth = 6 * scale
      ctx.lineCap = 'round'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(startX, startY, 4 * scale, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }
  }

  drawBone('torso')
  drawBone('head', 'torso')
  drawBone('leftArm', 'torso')
  drawBone('rightArm', 'torso')
  drawBone('leftForearm', 'leftArm')
  drawBone('rightForearm', 'rightArm')
  drawBone('leftLeg', 'torso')
  drawBone('rightLeg', 'torso')
  drawBone('leftShin', 'leftLeg')
  drawBone('rightShin', 'rightLeg')

  const headX = joints.torso.x + Math.cos((bones.torso.angle + 90) * Math.PI / 180) * 15 * scale
  const headY = joints.torso.y + Math.sin((bones.torso.angle + 90) * Math.PI / 180) * 15 * scale
  ctx.beginPath()
  ctx.arc(headX, headY, 12 * scale, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2 * scale
  ctx.stroke()
}
