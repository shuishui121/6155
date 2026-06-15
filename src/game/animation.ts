import type { SkeletonPose, JumpStyle } from './types'
import { GROUND_Y, BAR_X } from './constants'
import { calculateJumpTrajectory } from './physics'

export const PIXELS_PER_METER = 100
const HIP_HEIGHT = 92

const BASE_POSE: SkeletonPose = {
  bones: {
    torso: { angle: -90 },
    head: { angle: -90 },
    leftArm: { angle: 80 },
    rightArm: { angle: 100 },
    leftLeg: { angle: 90 },
    rightLeg: { angle: 90 },
    leftForearm: { angle: 85 },
    rightForearm: { angle: 95 },
    leftShin: { angle: 90 },
    rightShin: { angle: 90 },
  },
  rootX: 100,
  rootY: GROUND_Y - HIP_HEIGHT,
}

export function getIdlePose(time: number): SkeletonPose {
  const breathe = Math.sin(time * 0.003) * 2
  return {
    bones: {
      torso: { angle: -90 + breathe * 0.3 },
      head: { angle: -90 },
      leftArm: { angle: 78 + breathe },
      rightArm: { angle: 102 - breathe },
      leftLeg: { angle: 88 },
      rightLeg: { angle: 92 },
      leftForearm: { angle: 70 },
      rightForearm: { angle: 110 },
      leftShin: { angle: 90 },
      rightShin: { angle: 90 },
    },
    rootX: 100,
    rootY: GROUND_Y - HIP_HEIGHT,
  }
}

export function getRunPose(time: number, speed: number = 1): SkeletonPose {
  const t = time * 0.012 * speed
  const legSwing = Math.sin(t) * 38
  const armSwing = Math.sin(t + Math.PI) * 32
  const bobY = Math.abs(Math.sin(t * 2)) * 6
  const lean = Math.sin(t) * 3

  return {
    bones: {
      torso: { angle: -95 + lean },
      head: { angle: -88 + lean * 0.5 },
      leftArm: { angle: 90 - armSwing },
      rightArm: { angle: 90 + armSwing },
      leftLeg: { angle: 90 + legSwing },
      rightLeg: { angle: 90 - legSwing },
      leftForearm: { angle: 85 - armSwing * 0.8 - 25 },
      rightForearm: { angle: 95 + armSwing * 0.8 + 25 },
      leftShin: { angle: 90 + legSwing * 0.6 + (legSwing > 0 ? 20 : -10) },
      rightShin: { angle: 90 - legSwing * 0.6 + (-legSwing > 0 ? 20 : -10) },
    },
    rootX: 100,
    rootY: GROUND_Y - HIP_HEIGHT - bobY,
  }
}

export function getJumpPose(
  progress: number,
  style: JumpStyle,
  maxHeight: number,
  startX: number = 100,
  distance: number = 300
): SkeletonPose {
  const trajectory = calculateJumpTrajectory(
    startX,
    GROUND_Y - HIP_HEIGHT,
    maxHeight * PIXELS_PER_METER,
    distance,
    progress
  )

  if (progress < 0.12) {
    const p = progress / 0.12
    return {
      bones: {
        torso: { angle: -80 + p * 25 },
        head: { angle: -85 + p * 10 },
        leftArm: { angle: 120 - p * 160 },
        rightArm: { angle: 60 + p * 160 },
        leftLeg: { angle: 110 - p * 50 },
        rightLeg: { angle: 70 + p * 30 },
        leftForearm: { angle: 130 - p * 150 },
        rightForearm: { angle: 50 + p * 150 },
        leftShin: { angle: 105 - p * 35 },
        rightShin: { angle: 65 + p * 35 },
      },
      rootX: trajectory.x,
      rootY: trajectory.y,
    }
  }

  if (progress < 0.5) {
    const p = (progress - 0.12) / 0.38
    if (style === 'fosbury') {
      const arch = Math.sin(p * Math.PI) * 55
      return {
        bones: {
          torso: { angle: -60 + arch },
          head: { angle: -70 + arch * 0.6 },
          leftArm: { angle: -80 + p * 60 },
          rightArm: { angle: 260 - p * 60 },
          leftLeg: { angle: 150 - p * 80 },
          rightLeg: { angle: 30 + p * 80 },
          leftForearm: { angle: -60 + p * 70 },
          rightForearm: { angle: 240 - p * 70 },
          leftShin: { angle: 160 - p * 90 },
          rightShin: { angle: 20 + p * 90 },
        },
        rootX: trajectory.x,
        rootY: trajectory.y,
      }
    } else if (style === 'straddle') {
      const lean = Math.sin(p * Math.PI) * 70
      return {
        bones: {
          torso: { angle: -20 - lean * 0.3 },
          head: { angle: -30 - lean * 0.2 },
          leftArm: { angle: -10 },
          rightArm: { angle: 190 },
          leftLeg: { angle: 10 },
          rightLeg: { angle: 170 },
          leftForearm: { angle: 0 },
          rightForearm: { angle: 180 },
          leftShin: { angle: -10 },
          rightShin: { angle: 190 },
        },
        rootX: trajectory.x,
        rootY: trajectory.y,
      }
    } else {
      const spread = Math.sin(p * Math.PI) * 60
      return {
        bones: {
          torso: { angle: -90 + p * 15 },
          head: { angle: -85 },
          leftArm: { angle: 150 - p * 80 },
          rightArm: { angle: 30 + p * 80 },
          leftLeg: { angle: 145 + spread * 0.4 },
          rightLeg: { angle: 35 - spread * 0.4 },
          leftForearm: { angle: 160 - p * 70 },
          rightForearm: { angle: 20 + p * 70 },
          leftShin: { angle: 150 + spread * 0.3 + 20 },
          rightShin: { angle: 30 - spread * 0.3 - 20 },
        },
        rootX: trajectory.x,
        rootY: trajectory.y,
      }
    }
  }

  if (progress < 0.82) {
    const p = (progress - 0.5) / 0.32
    return {
      bones: {
        torso: { angle: -95 + p * 30 },
        head: { angle: -80 + p * 15 },
        leftArm: { angle: 160 - p * 60 },
        rightArm: { angle: 20 + p * 60 },
        leftLeg: { angle: 130 + p * 10 },
        rightLeg: { angle: 50 - p * 10 },
        leftForearm: { angle: 155 - p * 50 },
        rightForearm: { angle: 25 + p * 50 },
        leftShin: { angle: 120 + p * 20 },
        rightShin: { angle: 60 - p * 20 },
      },
      rootX: trajectory.x,
      rootY: trajectory.y,
    }
  }

  const p = (progress - 0.82) / 0.18
  const landY = Math.min(trajectory.y, GROUND_Y - HIP_HEIGHT)
  const impact = p < 0.4 ? Math.sin(p * Math.PI * 1.25) * 8 : 0

  return {
    bones: {
      torso: { angle: -65 + p * 30 - impact * 0.5 },
      head: { angle: -70 + p * 20 },
      leftArm: { angle: 140 - p * 50 + impact * 2 },
      rightArm: { angle: 40 + p * 50 - impact * 2 },
      leftLeg: { angle: 100 },
      rightLeg: { angle: 80 },
      leftForearm: { angle: 130 - p * 30 },
      rightForearm: { angle: 50 + p * 30 },
      leftShin: { angle: 95 - impact },
      rightShin: { angle: 85 - impact },
    },
    rootX: trajectory.x,
    rootY: landY + impact,
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
    torso: 44,
    head: 0,
    leftArm: 24,
    rightArm: 24,
    leftForearm: 22,
    rightForearm: 22,
    leftLeg: 36,
    rightLeg: 36,
    leftShin: 36,
    rightShin: 36,
  }

  const joints: Record<string, { x: number; y: number }> = {
    torso: { x: rootX, y: rootY },
  }

  function drawLimb(
    name: string,
    parentName: string | null,
    width: number,
    fillColor: string,
    strokeColor: string
  ) {
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

    if (length <= 0) return

    const perpX = -Math.sin(angle)
    const perpY = Math.cos(angle)
    const w = width * scale * 0.5

    ctx.beginPath()
    ctx.moveTo(startX + perpX * w, startY + perpY * w)
    ctx.lineTo(startX - perpX * w, startY - perpY * w)
    ctx.lineTo(endX - perpX * w * 0.75, endY - perpY * w * 0.75)
    ctx.lineTo(endX + perpX * w * 0.75, endY + perpY * w * 0.75)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.5 * scale
    ctx.stroke()
  }

  const skinColor = '#F5CBA7'
  const skinStroke = '#C9A17A'
  const uniBody = color
  const uniStroke = shadeColor(color, -25)
  const uniShorts = shadeColor(color, -18)

  drawLimb('leftLeg', 'torso', 13, uniShorts, uniStroke)
  drawLimb('rightLeg', 'torso', 13, uniShorts, uniStroke)
  drawLimb('leftShin', 'leftLeg', 11, skinColor, skinStroke)
  drawLimb('rightShin', 'rightLeg', 11, skinColor, skinStroke)

  const torBone = bones.torso
  const torLen = boneLengths.torso * scale
  const torAng = (torBone.angle * Math.PI) / 180
  const torEndX = rootX + Math.cos(torAng) * torLen
  const torEndY = rootY + Math.sin(torAng) * torLen
  joints.torso = { x: torEndX, y: torEndY }

  drawTorso(ctx, rootX, rootY, torEndX, torEndY, uniBody, uniStroke, scale)

  drawLimb('leftArm', 'torso', 10, skinColor, skinStroke)
  drawLimb('rightArm', 'torso', 10, skinColor, skinStroke)
  drawLimb('leftForearm', 'leftArm', 9, skinColor, skinStroke)
  drawLimb('rightForearm', 'rightArm', 9, skinColor, skinStroke)

  drawHands(ctx, joints.leftForearm, bones.leftForearm.angle, skinColor, skinStroke, scale)
  drawHands(ctx, joints.rightForearm, bones.rightForearm.angle, skinColor, skinStroke, scale)

  drawHead(ctx, torEndX, torEndY, bones.torso.angle, color, scale)

  drawShoes(ctx, joints.leftShin, bones.leftShin.angle, scale)
  drawShoes(ctx, joints.rightShin, bones.rightShin.angle, scale)
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  shoulderX: number,
  shoulderY: number,
  color: string,
  strokeColor: string,
  scale: number
) {
  const dx = shoulderX - hipX
  const dy = shoulderY - hipY
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len
  const ny = dx / len

  const hipW = 14 * scale
  const shoulderW = 17 * scale
  const midW = 11 * scale
  const midX = (hipX + shoulderX) / 2
  const midY = (hipY + shoulderY) / 2

  ctx.beginPath()
  ctx.moveTo(hipX + nx * hipW, hipY + ny * hipW)
  ctx.quadraticCurveTo(midX + nx * midW, midY + ny * midW, shoulderX + nx * shoulderW, shoulderY + ny * shoulderW)
  ctx.lineTo(shoulderX - nx * shoulderW, shoulderY - ny * shoulderW)
  ctx.quadraticCurveTo(midX - nx * midW, midY - ny * midW, hipX - nx * hipW, hipY - ny * hipW)
  ctx.closePath()

  const grad = ctx.createLinearGradient(
    hipX + nx * hipW,
    hipY,
    shoulderX - nx * shoulderW,
    shoulderY
  )
  grad.addColorStop(0, shadeColor(color, 8))
  grad.addColorStop(0.5, color)
  grad.addColorStop(1, shadeColor(color, -10))
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1.5 * scale
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(hipX + nx * 5, hipY + ny * hipW * 0.75)
  ctx.quadraticCurveTo(midX + nx * midW * 0.2, midY, shoulderX - nx * shoulderW * 0.8, shoulderY + ny * shoulderW * 0.2)
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2 * scale
  ctx.stroke()
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  neckX: number,
  neckY: number,
  torsoAngle: number,
  jerseyColor: string,
  scale: number
) {
  const headR = 13 * scale
  const headDir = ((torsoAngle - 5) * Math.PI) / 180
  const headCX = neckX + Math.cos(headDir) * 12 * scale
  const headCY = neckY + Math.sin(headDir) * 12 * scale

  ctx.beginPath()
  ctx.arc(headCX, headCY, headR, 0, Math.PI * 2)
  const skinGrad = ctx.createRadialGradient(headCX - 3, headCY - 4, 2, headCX, headCY, headR)
  skinGrad.addColorStop(0, '#FDEBD0')
  skinGrad.addColorStop(1, '#E5B98A')
  ctx.fillStyle = skinGrad
  ctx.fill()
  ctx.strokeStyle = '#B08050'
  ctx.lineWidth = 1.2 * scale
  ctx.stroke()

  const hairAng = headDir - Math.PI / 2
  const hairTopX = headCX + Math.cos(hairAng) * headR * 1.05
  const hairTopY = headCY + Math.sin(hairAng) * headR * 1.05
  ctx.beginPath()
  ctx.arc(hairTopX, hairTopY, headR * 0.85, hairAng - 1.8, hairAng + 1.8)
  ctx.fillStyle = '#2C1810'
  ctx.fill()

  const faceRightX = headCX + Math.cos(headDir) * headR * 0.9
  const faceRightY = headCY + Math.sin(headDir) * headR * 0.9
  const perpX = -Math.sin(headDir)
  const perpY = Math.cos(headDir)
  const eyeOffset = headR * 0.35
  const eyeFront = headR * 0.45

  ctx.beginPath()
  ctx.arc(faceRightX + perpX * eyeOffset - Math.cos(headDir) * headR * 0.15, faceRightY + perpY * eyeOffset - Math.sin(headDir) * headR * 0.15, 1.8 * scale, 0, Math.PI * 2)
  ctx.fillStyle = '#1a1a1a'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(faceRightX - perpX * eyeOffset - Math.cos(headDir) * headR * 0.15, faceRightY - perpY * eyeOffset - Math.sin(headDir) * headR * 0.15, 1.8 * scale, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(faceRightX + perpX * eyeOffset - Math.cos(headDir) * headR * 0.08 - 0.5 * scale, faceRightY + perpY * eyeOffset - Math.sin(headDir) * headR * 0.08 - 0.5 * scale, 0.6 * scale, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(faceRightX - perpX * eyeOffset - Math.cos(headDir) * headR * 0.08 - 0.5 * scale, faceRightY - perpY * eyeOffset - Math.sin(headDir) * headR * 0.08 - 0.5 * scale, 0.6 * scale, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()

  ctx.beginPath()
  const mouthX = faceRightX - Math.cos(headDir) * headR * 0.15
  const mouthY = faceRightY - Math.sin(headDir) * headR * 0.15 + headR * 0.25
  ctx.arc(mouthX, mouthY, headR * 0.18, 0.2, Math.PI - 0.2)
  ctx.strokeStyle = '#8B3A3A'
  ctx.lineWidth = 1.4 * scale
  ctx.lineCap = 'round'
  ctx.stroke()
}

function drawHands(
  ctx: CanvasRenderingContext2D,
  wrist: { x: number; y: number },
  forearmAngle: number,
  color: string,
  strokeColor: string,
  scale: number
) {
  const a = (forearmAngle * Math.PI) / 180
  const hx = wrist.x + Math.cos(a) * 4 * scale
  const hy = wrist.y + Math.sin(a) * 4 * scale
  ctx.beginPath()
  ctx.arc(hx, hy, 5 * scale, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1 * scale
  ctx.stroke()
}

function drawShoes(
  ctx: CanvasRenderingContext2D,
  ankle: { x: number; y: number },
  shinAngle: number,
  scale: number
) {
  const a = (shinAngle * Math.PI) / 180
  const toeX = ankle.x + Math.cos(a) * 7 * scale + Math.cos(a + Math.PI / 2) * 4 * scale
  const toeY = ankle.y + Math.sin(a) * 7 * scale + Math.sin(a + Math.PI / 2) * 4 * scale
  const heelX = ankle.x + Math.cos(a) * 2 * scale - Math.cos(a + Math.PI / 2) * 4 * scale
  const heelY = ankle.y + Math.sin(a) * 2 * scale - Math.sin(a + Math.PI / 2) * 4 * scale

  ctx.beginPath()
  ctx.ellipse(
    (toeX + heelX) / 2,
    (toeY + heelY) / 2 + 3 * scale,
    11 * scale,
    5 * scale,
    a,
    0,
    Math.PI * 2
  )
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 1.2 * scale
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(
    (toeX + heelX) / 2,
    (toeY + heelY) / 2 + 4 * scale,
    10 * scale,
    2.5 * scale,
    a,
    0,
    Math.PI * 2
  )
  ctx.fillStyle = '#222222'
  ctx.fill()
}

function shadeColor(color: string, percent: number): string {
  const f = parseInt(color.slice(1), 16)
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100
  const R = f >> 16
  const G = (f >> 8) & 0x00ff
  const B = f & 0x0000ff
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  )
}
