import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Trophy, Medal, RotateCcw, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { getAthleteBestHeight } from '@/game/competition'

export default function Award() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const { competition, playerAthlete, resetGame } = useGameStore()

  const [showConfetti, setShowConfetti] = useState(true)
  const [playerRank, setPlayerRank] = useState(0)
  const [playerBest, setPlayerBest] = useState(0)

  useEffect(() => {
    if (!competition || !playerAthlete) {
      navigate('/')
      return
    }

    const rankings = competition.athletes
      .map(athlete => ({
        athlete,
        bestHeight: getAthleteBestHeight(competition, athlete.id),
      }))
      .sort((a, b) => b.bestHeight - a.bestHeight)

    const rank = rankings.findIndex(r => r.athlete.id === playerAthlete.id) + 1
    const best = getAthleteBestHeight(competition, playerAthlete.id)

    setPlayerRank(rank)
    setPlayerBest(best)
  }, [competition, playerAthlete, navigate])

  useEffect(() => {
    if (!canvasRef.current || !showConfetti) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
      rotation: number
      rotationSpeed: number
    }[] = []

    const colors = ['#FF6B35', '#FFD700', '#FF4757', '#2ED573', '#1E90FF', '#FF69B4']

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      })
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()

        if (p.y > canvas.height + 50) {
          p.y = -50
          p.x = Math.random() * canvas.width
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showConfetti])

  if (!competition || !playerAthlete) return null

  const rankings = competition.athletes
    .map(athlete => ({
      athlete,
      bestHeight: getAthleteBestHeight(competition, athlete.id),
    }))
    .sort((a, b) => b.bestHeight - a.bestHeight)

  const topThree = rankings.slice(0, 3)

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-slate-300'
    if (rank === 3) return 'text-amber-600'
    return 'text-slate-500'
  }

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-48'
    if (rank === 2) return 'h-36'
    return 'h-28'
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-yellow-500/20 rounded-full mb-6"
          >
            <Sparkles className="text-yellow-400" size={24} />
            <span className="text-yellow-400 font-bold text-lg">比赛结束</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
            {competition.name}
          </h1>

          <p className="text-xl text-slate-300">
            你的成绩: <span className="text-orange-400 font-bold">{playerBest.toFixed(2)}m</span>
            {' | '}
            排名: <span className={`font-bold ${getMedalColor(playerRank)}`}>第 {playerRank} 名</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Trophy className="text-yellow-400" size={28} />
            领奖台
          </h2>

          <div className="flex items-end justify-center gap-4 md:gap-8">
            {topThree.map((item, index) => {
              const rank = index + 1
              const isPlayer = item.athlete.isPlayer

              return (
                <motion.div
                  key={item.athlete.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.2, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.2, type: 'spring', stiffness: 200 }}
                    className="text-5xl mb-2"
                  >
                    {getMedalEmoji(rank)}
                  </motion.div>

                  <div
                    className={`text-center mb-2 p-2 rounded-lg ${
                      isPlayer ? 'bg-orange-500/30 border border-orange-500' : ''
                    }`}
                  >
                    <div
                      className="font-bold text-lg"
                      style={{ color: item.athlete.color }}
                    >
                      {item.athlete.name}
                      {isPlayer && <span className="ml-1 text-xs">(你)</span>}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {item.bestHeight.toFixed(2)}m
                    </div>
                  </div>

                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: 0.6 + index * 0.2, duration: 0.5 }}
                    className={`w-24 md:w-32 ${getPodiumHeight(rank)} rounded-t-xl flex items-center justify-center text-4xl font-bold ${
                      rank === 1
                        ? 'bg-gradient-to-t from-yellow-600 to-yellow-400 text-black'
                        : rank === 2
                        ? 'bg-gradient-to-t from-slate-600 to-slate-400 text-black'
                        : 'bg-gradient-to-t from-amber-700 to-amber-500 text-black'
                    } shadow-2xl`}
                  >
                    {rank}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 mb-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Medal className="text-yellow-400" size={24} />
            完整排名
          </h3>

          <div className="space-y-2">
            {rankings.map((item, index) => {
              const rank = index + 1
              const isPlayer = item.athlete.isPlayer

              return (
                <motion.div
                  key={item.athlete.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    isPlayer
                      ? 'bg-orange-500/20 border border-orange-500/50'
                      : 'bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank === 1
                          ? 'bg-yellow-500 text-black'
                          : rank === 2
                          ? 'bg-slate-400 text-black'
                          : rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {rank}
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: item.athlete.color }}
                    >
                      {item.athlete.name}
                      {isPlayer && <span className="ml-1 text-xs text-orange-400">(你)</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {item.athlete.aiStyle === 'conservative' ? '稳健型' :
                       item.athlete.aiStyle === 'aggressive' ? '冲击型' :
                       item.athlete.aiStyle ? '平衡型' : ''}
                    </span>
                    <span className="font-mono font-bold text-lg">
                      {item.bestHeight > 0 ? `${item.bestHeight.toFixed(2)}m` : '-'}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetGame()
              navigate('/')
            }}
            className="py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-xl hover:shadow-orange-500/30 transition-all"
          >
            <RotateCcw size={24} />
            再来一局
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          >
            <Home size={24} />
            返回主页
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
