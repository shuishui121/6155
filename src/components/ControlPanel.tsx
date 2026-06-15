import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, Zap, Target, Info } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { STYLE_NAMES, OPTIMAL_ANGLE_MIN, OPTIMAL_ANGLE_MAX, MAX_ATTEMPTS_PER_HEIGHT } from '@/game/constants'
import { getAthleteAttempts } from '@/game/competition'
import type { JumpStyle } from '@/game/types'

export default function ControlPanel() {
  const {
    phase,
    competition,
    windSpeed,
    runUpProgress,
    jumpAngle,
    selectedTechnique,
    setPhase,
    setRunUpProgress,
    setJumpAngle,
    setSelectedTechnique,
    executePlayerJump,
    executeAIJump,
    processNextTurn,
    animationFrame,
    showResult,
  } = useGameStore()

  const [isRunning, setIsRunning] = useState(false)
  const runUpRef = useRef(0)

  const currentAthlete = competition?.athletes[competition?.currentAthleteIndex || 0]
  const isPlayerTurn = currentAthlete?.isPlayer
  const attempts = currentAthlete && competition
    ? getAthleteAttempts(competition, currentAthlete.id)
    : 0

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning && phase === 'running') {
      interval = setInterval(() => {
        runUpRef.current += 0.02
        if (runUpRef.current >= 1) {
          runUpRef.current = 1
          setIsRunning(false)
        }
        setRunUpProgress(runUpRef.current)
      }, 30)
    }
    return () => clearInterval(interval)
  }, [isRunning, phase, setRunUpProgress])

  useEffect(() => {
    if (phase === 'preparing') {
      runUpRef.current = 0
    }
  }, [phase])

  const handleStartRun = useCallback(() => {
    if (!isPlayerTurn || phase !== 'preparing') return
    setIsRunning(true)
    setPhase('running')
  }, [isPlayerTurn, phase, setPhase])

  const handleJump = useCallback(() => {
    if (!isPlayerTurn || phase !== 'running') return
    setIsRunning(false)
    setPhase('jumping')
    executePlayerJump()
  }, [isPlayerTurn, phase, setPhase, executePlayerJump])

  const handleNextTurn = useCallback(() => {
    processNextTurn()
  }, [processNextTurn])

  const handleAIJump = useCallback(() => {
    if (isPlayerTurn || phase !== 'preparing') return
    setPhase('jumping')
    executeAIJump()
  }, [isPlayerTurn, phase, setPhase, executeAIJump])

  useEffect(() => {
    if (phase === 'jumping' && animationFrame >= 1) {
      setTimeout(() => {
        setPhase('result')
      }, 500)
    }
  }, [phase, animationFrame, setPhase])

  const techniques: { value: JumpStyle; label: string; desc: string }[] = [
    { value: 'fosbury', label: STYLE_NAMES.fosbury, desc: '现代主流，潜力大' },
    { value: 'straddle', label: STYLE_NAMES.straddle, desc: '传统技术，稳定性高' },
    { value: 'scissors', label: STYLE_NAMES.scissors, desc: '简单易学，上限低' },
  ]

  const getRunUpQuality = () => {
    const diff = Math.abs(runUpProgress - 0.8)
    if (diff < 0.05) return { text: '完美!', color: 'text-green-400' }
    if (diff < 0.15) return { text: '不错', color: 'text-blue-400' }
    if (diff < 0.25) return { text: '一般', color: 'text-yellow-400' }
    return { text: '过早/过晚', color: 'text-red-400' }
  }

  const canJump = isPlayerTurn && phase === 'running' && runUpProgress >= 0.5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 text-white shadow-xl border border-slate-700"
    >
      <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
        <Zap size={20} />
        控制面板
      </h3>

      {phase === 'preparing' && isPlayerTurn && (
        <>
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
              <Target size={14} />
              选择技术动作
            </label>
            <div className="grid grid-cols-3 gap-2">
              {techniques.map(tech => (
                <button
                  key={tech.value}
                  onClick={() => setSelectedTechnique(tech.value)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    selectedTechnique === tech.value
                      ? 'bg-orange-500 text-white ring-2 ring-orange-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-bold">{tech.label}</div>
                  <div className="text-[10px] opacity-80">{tech.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info size={14} />
                起跳角度: {jumpAngle}°
              </span>
              <span className={
                jumpAngle >= OPTIMAL_ANGLE_MIN && jumpAngle <= OPTIMAL_ANGLE_MAX
                  ? 'text-green-400'
                  : 'text-yellow-400'
              }>
                最佳: {OPTIMAL_ANGLE_MIN}-{OPTIMAL_ANGLE_MAX}°
              </span>
            </label>
            <input
              type="range"
              min="35"
              max="55"
              value={jumpAngle}
              onChange={(e) => setJumpAngle(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>35°</span>
              <span className="text-orange-400">45°</span>
              <span>55°</span>
            </div>
          </div>

          <div className="mb-4 p-3 bg-slate-800 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">当前风速</div>
            <div className={`text-xl font-bold ${
              windSpeed > 2 ? 'text-green-400' :
              windSpeed < -2 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {windSpeed > 0 ? '顺风 +' : windSpeed < 0 ? '逆风 ' : '无风 '}
              {windSpeed.toFixed(1)} m/s
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">剩余试跳次数</span>
              <span className="text-yellow-400">{MAX_ATTEMPTS_PER_HEIGHT - attempts}/{MAX_ATTEMPTS_PER_HEIGHT}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartRun}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 transition-shadow flex items-center justify-center gap-2"
          >
            <Play size={24} />
            开始助跑
          </motion.button>
        </>
      )}

      {phase === 'running' && isPlayerTurn && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">助跑进度</span>
              <span className={getRunUpQuality().color}>
                {getRunUpQuality().text} {Math.round(runUpProgress * 100)}%
              </span>
            </div>
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${runUpProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: '80%' }}
              />
              <div className="absolute top-0 bottom-0 left-[75%] w-[10%] bg-green-500/30" />
            </div>
            <div className="text-xs text-slate-500 mt-1 text-center">
              在绿色区域按下起跳按钮获得最佳效果
            </div>
          </div>

          <motion.button
            whileHover={{ scale: canJump ? 1.02 : 1 }}
            whileTap={{ scale: canJump ? 0.98 : 1 }}
            onClick={handleJump}
            disabled={!canJump}
            className={`w-full py-6 rounded-xl font-bold text-2xl shadow-lg flex items-center justify-center gap-3 transition-all ${
              canJump
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30 cursor-pointer'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Zap size={32} />
            起跳!
          </motion.button>
        </>
      )}

      {phase === 'preparing' && !isPlayerTurn && currentAthlete && (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">AI 选手准备中...</div>
          <div className="text-xl font-bold mb-4" style={{ color: currentAthlete.color }}>
            {currentAthlete.name}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAIJump}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-shadow flex items-center justify-center gap-2"
          >
            <Play size={24} />
            观看 {currentAthlete.name} 试跳
          </motion.button>
        </div>
      )}

      {phase === 'jumping' && (
        <div className="text-center py-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-2xl font-bold text-orange-400 mb-2"
          >
            跳跃中...
          </motion.div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${animationFrame * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === 'result' && showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className={`text-4xl font-bold mb-4 ${
            useGameStore.getState().currentJumpResult?.success
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            {useGameStore.getState().currentJumpResult?.success ? '✓ 成功!' : '✗ 失败'}
          </div>
          <div className="text-slate-400 mb-2">
            实际高度: <span className="text-white font-bold">
              {useGameStore.getState().currentJumpResult?.height.toFixed(2)}m
            </span>
          </div>
          <div className="text-sm text-slate-500 mb-4">
            风速: {useGameStore.getState().currentJumpResult?.windSpeed.toFixed(1)}m/s |
            角度: {useGameStore.getState().currentJumpResult?.jumpAngle}°
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextTurn}
            className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl font-bold shadow-lg hover:shadow-slate-500/30 transition-shadow flex items-center justify-center gap-2"
          >
            <SkipForward size={20} />
            继续
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}
