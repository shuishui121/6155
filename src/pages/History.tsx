import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Calendar, Trash2, Medal, Target, TrendingUp } from 'lucide-react'
import { getCompetitionHistory, clearCompetitionHistory, getStats } from '@/game/storage'
import type { StoredCompetition } from '@/game/types'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<StoredCompetition[]>(getCompetitionHistory())
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const stats = getStats()

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      clearCompetitionHistory()
      setHistory([])
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-slate-300'
    if (rank === 3) return 'text-amber-600'
    return 'text-slate-400'
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/50'
    if (rank === 2) return 'bg-slate-400/20 border-slate-400/50'
    if (rank === 3) return 'bg-amber-600/20 border-amber-600/50'
    return 'bg-slate-700/50 border-slate-600/50'
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </motion.button>

          <h1 className="text-xl font-bold text-orange-400 flex items-center gap-2">
            <Trophy size={22} />
            历史记录
          </h1>

          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-400 transition-colors"
            >
              <Trash2 size={18} />
              清空
            </motion.button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {stats.totalCompetitions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30 text-center">
              <Trophy className="mx-auto mb-2 text-yellow-400" size={28} />
              <div className="text-3xl font-black text-yellow-400">{stats.goldMedals}</div>
              <div className="text-xs text-slate-400">金牌</div>
            </div>

            <div className="bg-gradient-to-br from-slate-400/20 to-slate-500/20 rounded-xl p-4 border border-slate-400/30 text-center">
              <Medal className="mx-auto mb-2 text-slate-300" size={28} />
              <div className="text-3xl font-black text-slate-300">{stats.silverMedals + stats.bronzeMedals}</div>
              <div className="text-xs text-slate-400">银/铜牌</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30 text-center">
              <Target className="mx-auto mb-2 text-orange-400" size={28} />
              <div className="text-3xl font-black text-orange-400">{stats.bestHeight.toFixed(2)}m</div>
              <div className="text-xs text-slate-400">最佳记录</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30 text-center">
              <TrendingUp className="mx-auto mb-2 text-blue-400" size={28} />
              <div className="text-3xl font-black text-blue-400">{stats.averageRank}</div>
              <div className="text-xs text-slate-400">平均排名</div>
            </div>
          </motion.div>
        )}

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🏃</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-2">暂无比赛记录</h2>
            <p className="text-slate-500 mb-6">完成你的第一场比赛，记录将显示在这里</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold hover:shadow-xl hover:shadow-orange-500/30 transition-all"
            >
              开始比赛
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((comp, index) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${
                  selectedCompetition === comp.id
                    ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                    : getRankBg(comp.playerRank)
                }`}
                onClick={() => setSelectedCompetition(
                  selectedCompetition === comp.id ? null : comp.id
                )}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getMedalEmoji(comp.playerRank)}</div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {comp.name}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          comp.type === 'qualifying' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}>
                          {comp.type === 'qualifying' ? '资格赛' : '决赛'}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(comp.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRankColor(comp.playerRank)}`}>
                      第 {comp.playerRank} 名
                    </div>
                    <div className="text-sm text-slate-400">
                      {comp.playerBestHeight.toFixed(2)}m
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: selectedCompetition === comp.id ? 'auto' : 0,
                    opacity: selectedCompetition === comp.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-slate-900/50"
                >
                  <div className="p-4 border-t border-slate-700">
                    <h4 className="text-sm font-bold text-slate-400 mb-3">详细排名</h4>
                    <div className="space-y-2">
                      {comp.rankings.map((rank, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            rank.isPlayer ? 'bg-orange-500/20' : 'bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0
                                  ? 'bg-yellow-500 text-black'
                                  : idx === 1
                                  ? 'bg-slate-400 text-black'
                                  : idx === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-700 text-white'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className={rank.isPlayer ? 'text-orange-400 font-medium' : ''}>
                              {rank.athleteName}
                              {rank.isPlayer && <span className="ml-1 text-xs">(你)</span>}
                            </span>
                          </div>
                          <span className="font-mono font-bold">
                            {rank.bestHeight.toFixed(2)}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
