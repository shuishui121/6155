import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Play, History, Info, User, Zap } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { STYLE_NAMES } from '@/game/constants'
import { getPersonalBest, getStats } from '@/game/storage'
import type { JumpStyle } from '@/game/types'

export default function Home() {
  const navigate = useNavigate()
  const { initGame, startQualifying } = useGameStore()
  const [playerName, setPlayerName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<JumpStyle>('fosbury')
  const [showTutorial, setShowTutorial] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const stats = getStats()
  const personalBest = getPersonalBest()

  const handleStartGame = () => {
    if (!playerName.trim()) return
    setIsStarting(true)
    setTimeout(() => {
      initGame(playerName.trim(), selectedStyle)
      startQualifying()
      navigate('/game')
    }, 500)
  }

  const styles: { value: JumpStyle; label: string; desc: string; icon: string }[] = [
    { value: 'fosbury', label: STYLE_NAMES.fosbury, desc: '现代主流技术，潜力巨大但需要精准控制', icon: '🔄' },
    { value: 'straddle', label: STYLE_NAMES.straddle, desc: '传统技术，稳定性高，适合追求稳妥', icon: '⬆️' },
    { value: 'scissors', label: STYLE_NAMES.scissors, desc: '简单易学，但上限较低', icon: '✂️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-700/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-slate-700/20 rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
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
            className="inline-flex items-center gap-3 px-6 py-2 bg-orange-500/20 rounded-full mb-6"
          >
            <Zap className="text-orange-400" size={24} />
            <span className="text-orange-400 font-bold text-lg">田径运动会模拟</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
            跳高锦标赛
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            挑战极限，突破自我！控制你的运动员，征服每一个高度，
            从资格赛一路杀进决赛，争夺金牌！
          </p>
        </motion.div>

        {stats.totalCompetitions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10"
          >
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl font-bold text-yellow-400">{stats.goldMedals}</div>
              <div className="text-xs text-slate-400 mt-1">🥇 金牌</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl font-bold text-slate-300">{stats.silverMedals}</div>
              <div className="text-xs text-slate-400 mt-1">🥈 银牌</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl font-bold text-amber-600">{stats.bronzeMedals}</div>
              <div className="text-xs text-slate-400 mt-1">🥉 铜牌</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl font-bold text-orange-400">{personalBest.toFixed(2)}m</div>
              <div className="text-xs text-slate-400 mt-1">📏 最佳记录</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl font-bold text-blue-400">{stats.totalCompetitions}</div>
              <div className="text-xs text-slate-400 mt-1">🏆 参赛次数</div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <User size={18} className="text-orange-400" />
              你的名字
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="输入你的名字..."
              maxLength={10}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Trophy size={18} className="text-orange-400" />
              选择技术风格
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {styles.map((style, index) => (
                <motion.button
                  key={style.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStyle(style.value)}
                  className={`p-5 rounded-xl text-left transition-all ${
                    selectedStyle === style.value
                      ? 'bg-gradient-to-br from-orange-500/30 to-red-500/30 border-2 border-orange-500 shadow-lg shadow-orange-500/20'
                      : 'bg-slate-900/50 border-2 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <div className="font-bold text-lg mb-1">{style.label}</div>
                  <div className="text-sm text-slate-400">{style.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartGame}
              disabled={!playerName.trim() || isStarting}
              className={`py-5 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
                playerName.trim() && !isStarting
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-xl hover:shadow-orange-500/30'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play size={28} />
              {isStarting ? '开始中...' : '开始比赛'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/history')}
              className="py-5 rounded-xl font-bold text-xl flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            >
              <History size={28} />
              历史记录
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowTutorial(true)}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 transition-all"
          >
            <Info size={20} />
            游戏规则与操作说明
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-slate-500 text-sm"
        >
          <p>💡 提示：注意风速和疲劳度的影响，选择最佳时机起跳！</p>
        </motion.div>
      </div>

      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTutorial(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
          >
            <h2 className="text-3xl font-bold mb-6 text-orange-400 flex items-center gap-3">
              <Info size={32} />
              游戏说明
            </h2>

            <div className="space-y-6 text-slate-300">
              <section>
                <h3 className="text-xl font-bold text-white mb-2">🎯 比赛流程</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>资格赛</strong>：达到 {2.0}m 及格线即可晋级决赛</li>
                  <li><strong>决赛</strong>：横杆逐步升高，每位选手每个高度有 3 次试跳机会</li>
                  <li><strong>颁奖</strong>：根据最终成绩决出冠亚季军</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-2">🎮 操作指南</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>选择技术</strong>：背越式潜力大但难控制，俯卧式更稳定</li>
                  <li><strong>调整角度</strong>：最佳起跳角度为 40-50 度</li>
                  <li><strong>开始助跑</strong>：点击按钮开始助跑</li>
                  <li><strong>把握时机</strong>：在进度条绿色区域（约 75%-85%）按下起跳</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-2">📊 影响因素</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-green-400">顺风 (+)</strong>：帮助你跳得更高</li>
                  <li><strong className="text-red-400">逆风 (-)</strong>：会降低你的成绩</li>
                  <li><strong className="text-yellow-400">疲劳度</strong>：每次试跳增加疲劳，影响发挥</li>
                  <li><strong className="text-blue-400">技术选择</strong>：不同技术有不同的上限和稳定性</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-2">🤖 AI 对手类型</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-blue-400">稳健型</strong>：求稳，保守选择高度</li>
                  <li><strong className="text-red-400">冲击型</strong>：激进，敢于挑战高难度</li>
                  <li><strong className="text-purple-400">平衡型</strong>：综合能力强，发挥稳定</li>
                </ul>
              </section>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTutorial(false)}
              className="w-full mt-8 py-3 bg-orange-500 rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              我知道了
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
