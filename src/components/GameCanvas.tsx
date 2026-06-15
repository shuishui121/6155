import { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { getIdlePose, getRunPose, getJumpPose, drawSkeleton, PIXELS_PER_METER } from '@/game/animation'
import { GROUND_Y, BAR_X, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants'
import { useGameLoop } from '@/hooks/useGameLoop'
import type { JumpStyle } from '@/game/types'

interface GameCanvasProps {
  width?: number
  height?: number
}

export default function GameCanvas({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const {
    phase,
    competition,
    playerAthlete,
    runUpProgress,
    selectedTechnique,
    animationFrame,
    setAnimationFrame,
    currentJumpResult,
  } = useGameStore()

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, barHeight: number) => {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    skyGradient.addColorStop(0, '#87CEEB')
    skyGradient.addColorStop(0.7, '#B3E5FC')
    skyGradient.addColorStop(1, '#E1F5FE')
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, width, GROUND_Y)

    for (let i = 0; i < 6; i++) {
      const cloudX = ((i * 160 + 40) + (Date.now() * 0.005 * (i % 2 === 0 ? 1 : -1))) % (width + 200) - 100
      const cloudY = 40 + (i % 3) * 35
      drawCloud(ctx, cloudX, cloudY, 0.6 + (i % 3) * 0.2)
    }

    const sunX = width - 70
    const sunY = 60
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 45)
    sunGrad.addColorStop(0, '#FFEB3B')
    sunGrad.addColorStop(0.5, 'rgba(255,193,7,0.5)')
    sunGrad.addColorStop(1, 'rgba(255,152,0,0)')
    ctx.fillStyle = sunGrad
    ctx.beginPath()
    ctx.arc(sunX, sunY, 45, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFF59D'
    ctx.beginPath()
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#66BB6A'
    ctx.fillRect(0, GROUND_Y, width, height - GROUND_Y)
    for (let i = 0; i < width; i += 8) {
      const g = 102 + Math.sin(i * 0.15) * 10
      ctx.fillStyle = `rgb(${80 + (i % 20) * 2}, ${g + (i % 15)}, 70)`
      ctx.fillRect(i, GROUND_Y, 4, 4)
    }

    const trackGrad = ctx.createLinearGradient(0, GROUND_Y + 15, 0, GROUND_Y + 65)
    trackGrad.addColorStop(0, '#C62828')
    trackGrad.addColorStop(0.5, '#E53935')
    trackGrad.addColorStop(1, '#B71C1C')
    ctx.fillStyle = trackGrad
    ctx.fillRect(0, GROUND_Y + 15, width, 50)

    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 3
    ctx.setLineDash([35, 18])
    ctx.beginPath()
    ctx.moveTo(30, GROUND_Y + 40)
    ctx.lineTo(BAR_X - 60, GROUND_Y + 40)
    ctx.stroke()
    ctx.setLineDash([])

    const barY = GROUND_Y - barHeight * PIXELS_PER_METER

    const standGrad = ctx.createLinearGradient(BAR_X - 10, 0, BAR_X + 10, 0)
    standGrad.addColorStop(0, '#4E342E')
    standGrad.addColorStop(0.5, '#6D4C41')
    standGrad.addColorStop(1, '#3E2723')
    ctx.fillStyle = standGrad
    roundRect(ctx, BAR_X - 10, barY - 10, 20, GROUND_Y - barY + 10, 4)
    ctx.fill()
    ctx.strokeStyle = '#2E1A14'
    ctx.lineWidth = 1
    ctx.stroke()
    roundRect(ctx, BAR_X + 105, barY - 10, 20, GROUND_Y - barY + 10, 4)
    ctx.fillStyle = standGrad
    ctx.fill()
    ctx.stroke()

    for (let h = 1; h <= Math.ceil(barHeight); h++) {
      const markY = GROUND_Y - h * PIXELS_PER_METER
      if (markY >= barY - 10) {
        ctx.fillStyle = '#FFF'
        ctx.fillRect(BAR_X - 10, markY, 20, 2)
        ctx.fillRect(BAR_X + 105, markY, 20, 2)
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${h}m`, BAR_X - 15, markY + 4)
      }
    }

    const poleGrad = ctx.createLinearGradient(BAR_X, barY - 5, BAR_X + 115, barY + 5)
    poleGrad.addColorStop(0, '#FFD54F')
    poleGrad.addColorStop(0.3, '#FFEB3B')
    poleGrad.addColorStop(0.7, '#FFC107')
    poleGrad.addColorStop(1, '#FFB300')
    ctx.fillStyle = poleGrad
    roundRect(ctx, BAR_X + 5, barY - 4, 100, 8, 4)
    ctx.fill()
    ctx.strokeStyle = '#E65100'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#FFF'
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 2
    ctx.font = 'bold 15px Anton, Inter, sans-serif'
    ctx.textAlign = 'center'
    const hText = `${barHeight.toFixed(2)}m`
    ctx.strokeText(hText, BAR_X + 55, barY - 14)
    ctx.fillText(hText, BAR_X + 55, barY - 14)

    const sandGrad = ctx.createLinearGradient(BAR_X + 125, GROUND_Y, BAR_X + 320, GROUND_Y + 65)
    sandGrad.addColorStop(0, '#FFECB3')
    sandGrad.addColorStop(0.5, '#FFE082')
    sandGrad.addColorStop(1, '#FFCC80')
    ctx.fillStyle = sandGrad
    roundRect(ctx, BAR_X + 125, GROUND_Y + 5, 195, 65, 8)
    ctx.fill()
    for (let i = 0; i < 40; i++) {
      const sx = BAR_X + 128 + Math.random() * 188
      const sy = GROUND_Y + 10 + Math.random() * 55
      ctx.fillStyle = `rgba(${200 + Math.random() * 40}, ${160 + Math.random() * 40}, ${100 + Math.random() * 40}, 0.5)`
      ctx.beginPath()
      ctx.arc(sx, sy, 1 + Math.random() * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#37474F'
    ctx.fillRect(420, 0, 380, GROUND_Y)
    const seatColors = ['#455A64', '#546E7A', '#607D8B', '#78909C']
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = seatColors[i % seatColors.length]
      for (let j = 0; j < 11; j++) {
        const sx = 420 + j * 34
        const sy = i * 47
        roundRect(ctx, sx, sy, 32, 44, 3)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    for (let n = 0; n < 14; n++) {
      const fx = 430 + (n * 29) % 360
      const fy = 10 + Math.floor(n / 5) * 50 + (n % 3) * 47
      drawFan(ctx, fx, fy, 0.55 + (n % 3) * 0.1)
    }
  }, [width, height])

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    const barHeight = competition?.currentHeight || 2.0
    drawBackground(ctx, barHeight)

    const currentAthlete = competition?.athletes[competition.currentAthleteIndex] || playerAthlete
    if (!currentAthlete) return

    const style: JumpStyle = currentAthlete.isPlayer ? selectedTechnique : currentAthlete.style
    const color = currentAthlete.color

    let pose
    if (phase === 'running') {
      const runProgress = Math.min(1, runUpProgress)
      const runX = 100 + runProgress * (BAR_X - 180)
      const runPose = getRunPose(timestamp, 1 + runProgress * 0.6)
      pose = {
        ...runPose,
        rootX: runX,
      }
    } else if (phase === 'jumping') {
      const maxHeight = currentJumpResult?.height || barHeight
      pose = getJumpPose(
        animationFrame,
        style,
        maxHeight,
        BAR_X - 70,
        240
      )
    } else {
      pose = getIdlePose(timestamp)
    }

    if (phase === 'result') {
      const barY = GROUND_Y - barHeight * PIXELS_PER_METER
      if (currentJumpResult) {
        const success = currentJumpResult.success
        ctx.save()
        ctx.globalAlpha = 0.9
        const flashGrad = ctx.createRadialGradient(BAR_X + 55, barY, 30, BAR_X + 55, barY, 180)
        flashGrad.addColorStop(0, success ? 'rgba(76,175,80,0.5)' : 'rgba(244,67,54,0.45)')
        flashGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = flashGrad
        ctx.fillRect(BAR_X - 100, barY - 180, 330, 360)
        ctx.restore()
      }
    }

    ctx.save()
    drawSkeleton(ctx, pose, color, 1)
    ctx.restore()

    const topOffset = 200
    ctx.save()
    ctx.font = 'bold 13px Inter, sans-serif'
    ctx.textAlign = 'center'
    const labelText = currentAthlete.isPlayer ? `${currentAthlete.name} (你)` : currentAthlete.name
    ctx.strokeStyle = 'rgba(0,0,0,0.8)'
    ctx.lineWidth = 3
    ctx.strokeText(labelText, pose.rootX, pose.rootY - topOffset)
    ctx.fillStyle = currentAthlete.isPlayer ? '#FFEB3B' : '#FFFFFF'
    ctx.fillText(labelText, pose.rootX, pose.rootY - topOffset)
    ctx.restore()
  }, [width, height, competition, playerAthlete, phase, runUpProgress, animationFrame, selectedTechnique, currentJumpResult, drawBackground])

  const gameLoop = useCallback((deltaTime: number, timestamp: number) => {
    if (phase === 'jumping') {
      const newFrame = animationFrame + deltaTime * 0.00075
      if (newFrame >= 1) {
        setAnimationFrame(1)
      } else {
        setAnimationFrame(newFrame)
      }
    }

    draw(timestamp)
  }, [phase, animationFrame, setAnimationFrame, draw])

  const { start } = useGameLoop(gameLoop, true)

  useEffect(() => {
    start()
  }, [start])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg shadow-2xl border-4 border-slate-800"
    />
  )
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath()
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2)
  ctx.arc(x + 22 * s, y - 4 * s, 22 * s, 0, Math.PI * 2)
  ctx.arc(x + 48 * s, y, 18 * s, 0, Math.PI * 2)
  ctx.arc(x + 30 * s, y + 8 * s, 16 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawFan(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save()
  const shirtColors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#FDD835']
  const shirt = shirtColors[Math.floor(x + y) % shirtColors.length]
  ctx.beginPath()
  ctx.arc(x, y + 10 * s, 8 * s, 0, Math.PI * 2)
  ctx.fillStyle = '#F5CBA7'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 0.8
  ctx.stroke()
  ctx.fillStyle = shirt
  roundRect(ctx, x - 9 * s, y + 17 * s, 18 * s, 22 * s, 3)
  ctx.fill()
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
