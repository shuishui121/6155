import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import GameCanvas from '@/components/GameCanvas'
import DataPanel from '@/components/DataPanel'
import ControlPanel from '@/components/ControlPanel'
import { getAthleteBestHeight } from '@/game/competition'

export default function Game() {
  const navigate = useNavigate()
  const {
    phase,
    competition,
    playerAthlete,
    startFinal,
    resetGame,
  } = useGameStore()

  useEffect(() => {
    if (!competition || !playerAthlete) {
      navigate('/')
    }
  }, [competition, playerAthlete, navigate])

  useEffect(() => {
    if (competition?.phase === 'finished' && competition.type === 'qualifying') {
      const playerBest = getAthleteBestHeight(competition, playerAthlete!.id)
      const qualified = playerBest >= competition.qualifyingHeight

      if (qualified) {
        setTimeout(() => {
          const qualifiedAthletes = competition.athletes.filter(
            a => getAthleteBestHeight(competition, a.id) >= competition.qualifyingHeight
          )
          if (qualifiedAthletes.length > 0) {
            startFinal(qualifiedAthletes)
          } else {
            navigate('/award')
          }
        }, 2000)
      } else {
        setTimeout(() => {
          navigate('/award')
        }, 2000)
      }
    }

    if (phase === 'award') {
      navigate('/award')
    }
  }, [competition, phase, playerAthlete, startFinal, navigate])

  if (!competition || !playerAthlete) return null

  const playerBest = getAthleteBestHeight(competition, playerAthlete.id)
  const isQualified = playerBest >= competition.qualifyingHeight

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm('确定要退出比赛吗？当前进度将丢失。')) {
                resetGame()
                navigate('/')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
            退出
          </motion.button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-orange-400">
              {competition.name}
            </h1>
            <p className="text-xs text-slate-400">
              当前高度: {competition.currentHeight.toFixed(2)}m |
              你的最佳: {playerBest > 0 ? `${playerBest.toFixed(2)}m` : '-'}
              {competition.type === 'qualifying' && (
                <span className={isQualified ? 'text-green-400 ml-2' : 'text-slate-500 ml-2'}>
                  {isQualified ? '✓ 已晋级' : `目标: ${competition.qualifyingHeight}m`}
                </span>
              )}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Home size={18} />
            主页
          </motion.button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {competition.phase === 'finished' && competition.type === 'qualifying' && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                {isQualified ? (
                  <>
                    <div className="text-8xl mb-6">🎉</div>
                    <h2 className="text-5xl font-black text-green-400 mb-4">
                      恭喜晋级!
                    </h2>
                    <p className="text-xl text-slate-300 mb-2">
                      你成功通过了资格赛
                    </p>
                    <p className="text-slate-400">
                      最佳成绩: {playerBest.toFixed(2)}m
                    </p>
                    <p className="text-orange-400 mt-4 animate-pulse">
                      即将进入决赛...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-8xl mb-6">😢</div>
                    <h2 className="text-5xl font-black text-red-400 mb-4">
                      未能晋级
                    </h2>
                    <p className="text-xl text-slate-300 mb-2">
                      很遗憾，你没有达到及格线
                    </p>
                    <p className="text-slate-400">
                      你的最佳成绩: {playerBest > 0 ? `${playerBest.toFixed(2)}m` : '-'} / 目标: {competition.qualifyingHeight}m
                    </p>
                    <p className="text-orange-400 mt-4 animate-pulse">
                      正在查看最终结果...
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-center mb-6"
            >
              <GameCanvas />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ControlPanel />
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <DataPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
