import { motion } from 'framer-motion'
import { Wind, Activity, Ruler, Timer, Trophy } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { getAthleteBestHeight, getAthleteAttempts } from '@/game/competition'
import { STYLE_NAMES } from '@/game/constants'
import type { Athlete } from '@/game/types'

export default function DataPanel() {
  const { competition, windSpeed, playerAthlete, selectedTechnique, phase } = useGameStore()

  const currentAthlete = competition?.athletes[competition.currentAthleteIndex]
  const isPlayerTurn = currentAthlete?.isPlayer

  const getWindColor = (wind: number) => {
    if (wind > 2) return 'text-green-400'
    if (wind < -2) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getWindIcon = (wind: number) => {
    if (wind > 0) return '→'
    if (wind < 0) return '←'
    return '↔'
  }

  const getFatigueColor = (fatigue: number) => {
    if (fatigue < 30) return 'bg-green-500'
    if (fatigue < 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!competition) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 text-white shadow-xl border border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
          <Trophy size={20} />
          {competition.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          competition.type === 'qualifying' ? 'bg-blue-600' : 'bg-purple-600'
        }`}>
          {competition.type === 'qualifying' ? '资格赛' : '决赛'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Wind size={14} />
            风速
          </div>
          <div className={`text-2xl font-bold ${getWindColor(windSpeed)}`}>
            {getWindIcon(windSpeed)} {windSpeed.toFixed(1)} m/s
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Ruler size={14} />
            当前高度
          </div>
          <div className="text-2xl font-bold text-white">
            {competition.currentHeight.toFixed(2)} m
          </div>
        </div>
      </div>

      {currentAthlete && (
        <motion.div
          key={currentAthlete.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 rounded-lg p-3 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg" style={{ color: currentAthlete.color }}>
              {currentAthlete.name}
              {isPlayerTurn && <span className="ml-2 text-xs bg-orange-500 px-2 py-0.5 rounded">你的回合</span>}
            </span>
            {!isPlayerTurn && currentAthlete.aiStyle && (
              <span className="text-xs text-slate-400">
                {currentAthlete.aiStyle === 'conservative' ? '稳健型' :
                 currentAthlete.aiStyle === 'aggressive' ? '冲击型' : '平衡型'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div>
              <span className="text-slate-400">力量</span>
              <div className="font-bold">{currentAthlete.strength}</div>
            </div>
            <div>
              <span className="text-slate-400">技术</span>
              <div className="font-bold">{currentAthlete.technique}</div>
            </div>
            <div>
              <span className="text-slate-400">耐力</span>
              <div className="font-bold">{currentAthlete.stamina}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Activity size={12} /> 疲劳度
              </span>
              <span>{currentAthlete.fatigue}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getFatigueColor(currentAthlete.fatigue)}`}
                initial={{ width: 0 }}
                animate={{ width: `${currentAthlete.fatigue}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="mt-2 flex justify-between text-xs">
            <div>
              <span className="text-slate-400">技术风格: </span>
              <span className="text-blue-400">
                {STYLE_NAMES[isPlayerTurn ? selectedTechnique : currentAthlete.style]}
              </span>
            </div>
            <div>
              <span className="text-slate-400">试跳: </span>
              <span className="text-yellow-400">
                {getAthleteAttempts(competition, currentAthlete.id)}/3
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="border-t border-slate-700 pt-3">
        <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
          <Timer size={14} />
          实时排名
        </h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {competition.athletes
            .map((athlete: Athlete) => ({
              athlete,
              bestHeight: getAthleteBestHeight(competition, athlete.id),
            }))
            .sort((a, b) => b.bestHeight - a.bestHeight)
            .map((item, index) => (
              <div
                key={item.athlete.id}
                className={`flex justify-between text-sm p-1.5 rounded ${
                  item.athlete.isPlayer ? 'bg-orange-500/20' : ''
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-slate-400 text-black' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-slate-700 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span style={{ color: item.athlete.color }}>{item.athlete.name}</span>
                </span>
                <span className="font-mono">
                  {item.bestHeight > 0 ? `${item.bestHeight.toFixed(2)}m` : '-'}
                </span>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  )
}
