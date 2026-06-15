import { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { getIdlePose, getRunPose, getJumpPose, drawSkeleton } from '@/game/animation'
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
  const animationTimeRef = useRef<number>(0)

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
    skyGradient.addColorStop(1, '#E0F6FF')
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, width, GROUND_Y)

    ctx.fillStyle = '#7CB342'
    ctx.fillRect(0, GROUND_Y, width, height - GROUND_Y)

    ctx.fillStyle = '#8D6E63'
    ctx.fillRect(0, GROUND_Y + 50, width, 10)

    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.setLineDash([20, 10])
    ctx.beginPath()
    ctx.moveTo(50, GROUND_Y + 55)
    ctx.lineTo(BAR_X - 50, GROUND_Y + 55)
    ctx.stroke()
    ctx.setLineDash([])

    const barY = GROUND_Y - barHeight * 50

    ctx.fillStyle = '#5D4037'
    ctx.fillRect(BAR_X - 5, barY - 10, 10, GROUND_Y - barY + 10)
    ctx.fillRect(BAR_X + 100, barY - 10, 10, GROUND_Y - barY + 10)

    ctx.fillStyle = '#FFD54F'
    ctx.fillRect(BAR_X, barY - 3, 100, 6)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${barHeight.toFixed(2)}m`, BAR_X + 50, barY - 10)

    const sandGradient = ctx.createLinearGradient(BAR_X + 120, GROUND_Y, BAR_X + 300, GROUND_Y + 50)
    sandGradient.addColorStop(0, '#F5DEB3')
    sandGradient.addColorStop(1, '#DEB887')
    ctx.fillStyle = sandGradient
    ctx.fillRect(BAR_X + 120, GROUND_Y, 180, 50)

    ctx.fillStyle = '#37474F'
    ctx.fillRect(450, 0, 350, GROUND_Y)
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#455A64' : '#546E7A'
      for (let j = 0; j < 10; j++) {
        ctx.fillRect(450 + j * 35, i * 45, 35, 45)
      }
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
      const runX = 100 + runProgress * (BAR_X - 150)
      const runPose = getRunPose(timestamp, 1 + runProgress * 0.5)
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
        BAR_X - 50,
        200
      )
    } else {
      pose = getIdlePose(timestamp)
    }

    drawSkeleton(ctx, pose, color, 1)

    if (currentAthlete.isPlayer) {
      ctx.fillStyle = color
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${currentAthlete.name} (你)`, pose.rootX, pose.rootY - 70)
    } else {
      ctx.fillStyle = color
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentAthlete.name, pose.rootX, pose.rootY - 70)
    }
  }, [width, height, competition, playerAthlete, phase, runUpProgress, animationFrame, selectedTechnique, currentJumpResult, drawBackground])

  const gameLoop = useCallback((deltaTime: number, timestamp: number) => {
    animationTimeRef.current = timestamp

    if (phase === 'jumping') {
      const newFrame = animationFrame + deltaTime * 0.0008
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
