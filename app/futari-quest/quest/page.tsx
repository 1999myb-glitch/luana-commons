'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  ENERGY_MAX,
  PLAYERS,
  THEME,
  WISH_EXP_BONUS,
  getLevel,
  getLevelProgress,
  getStageProgress,
  getThemeColor,
  type ThemeColorKey,
  type PlayerId,
} from '@/lib/futari-quest/constants'
import {
  completeQuestItem,
  getProgressSnapshot,
  getServerProgressSnapshot,
  setCurrentPlayer,
  subscribeProgress,
  updateProgress,
  redeemWishTicket,
  type GameEvent,
  type QuestItem,
  type WishEffect,
} from '@/lib/futari-quest/storage'
import { FQ_GLOBAL_STYLES } from '@/lib/futari-quest/styles'
import BottomNav from '../_components/BottomNav'
import EventOverlay from '../_components/EventOverlay'
import { PlayerAvatar } from '../_components/PlayerAvatar'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function QuestRow({
  item,
  themeColors,
  onToggle,
  onRemove,
}: {
  item: QuestItem
  themeColors: Record<PlayerId, ThemeColorKey>
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${
        item.completed ? 'border-[#F4EBE3] bg-[#FBF7F2]' : 'border-[#FDEAF1] bg-white'
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        aria-label={item.completed ? '未完了にする' : '完了にする'}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-black text-white transition-colors"
        style={{
          borderColor: item.completed ? THEME.accent : '#E8D5C8',
          background: item.completed ? THEME.accent : 'transparent',
        }}
      >
        {item.completed ? '✓' : ''}
      </button>
      <p className={`flex-1 text-sm ${item.completed ? 'text-[#C9B8AC] line-through' : 'text-[#6B5547]'}`}>
        {item.text}
      </p>
      {item.completed && item.completedBy && (
        <PlayerAvatar playerId={item.completedBy} themeColor={themeColors[item.completedBy]} size={22} />
      )}
      <button onClick={() => onRemove(item.id)} aria-label="削除" className="text-xs text-[#E0D0C5] hover:text-[#E08A8A]">
        ✕
      </button>
    </div>
  )
}

export default function FutariQuestListPage() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot)
  const [newText, setNewText] = useState('')
  const [diceFace, setDiceFace] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [diceResult, setDiceResult] = useState<QuestItem | null>(null)
  const [diceEmpty, setDiceEmpty] = useState(false)
  const [events, setEvents] = useState<GameEvent[]>([])
  const [showWish, setShowWish] = useState(false)
  const diceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (diceIntervalRef.current) clearInterval(diceIntervalRef.current)
    }
  }, [])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const text = newText.trim()
    if (!text) return
    const item: QuestItem = { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() }
    updateProgress((prev) => ({ ...prev, items: [...prev.items, item] }))
    setNewText('')
  }

  function toggleItem(id: string) {
    const { next, events: newEvents } = completeQuestItem(getProgressSnapshot(), id)
    updateProgress(() => next)
    if (newEvents.length > 0) setEvents(newEvents)
  }

  function removeItem(id: string) {
    updateProgress((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }))
    if (diceResult?.id === id) setDiceResult(null)
  }

  function selectPlayer(id: PlayerId) {
    setCurrentPlayer(id)
  }

  function applyWish(effect: WishEffect) {
    updateProgress((prev) => redeemWishTicket(prev, effect))
    setShowWish(false)
    if (effect === 'reroll') rollDice()
  }

  function rollDice() {
    const candidates = progress.items.filter((i) => !i.completed)
    if (candidates.length === 0) {
      setDiceResult(null)
      setDiceEmpty(true)
      return
    }
    setDiceEmpty(false)
    setDiceResult(null)
    setRolling(true)
    let ticks = 0
    diceIntervalRef.current = setInterval(() => {
      setDiceFace((f) => (f + 1) % DICE_FACES.length)
      ticks += 1
      if (ticks >= 12) {
        if (diceIntervalRef.current) clearInterval(diceIntervalRef.current)
        setRolling(false)
        const picked = candidates[Math.floor(Math.random() * candidates.length)]
        setDiceResult(picked)
      }
    }, 90)
  }

  const level = getLevel(progress.exp)
  const { percent } = getLevelProgress(progress.exp)
  const stageProgress = getStageProgress(progress.completedCount)
  const incompleteCount = progress.items.filter((i) => !i.completed).length
  const today = new Date().toISOString().slice(0, 10)
  const bothCompletedToday = PLAYERS.every((p) => progress.lastCompletionDate[p.id] === today)

  return (
    <main className="min-h-screen bg-[#FFF8F3] pb-24">
      <style>{FQ_GLOBAL_STYLES}</style>

      <div className="mx-auto max-w-md px-4 pt-6">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/futari-quest"
            aria-label="トップに戻る"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#FDEAF1] bg-white text-[#BBA697]"
          >
            ←
          </Link>
          <h1 className="text-lg font-black text-[#6B5547]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            🎒 ふたりの冒険ノート
          </h1>
        </header>

        {/* Player switcher */}
        <section className="mb-3 flex gap-2">
          {PLAYERS.map((player) => {
            const color = getThemeColor(progress.themeColors[player.id])
            const isYou = progress.currentPlayerId === player.id
            return (
              <button
                key={player.id}
                onClick={() => selectPlayer(player.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-2 text-sm font-bold transition-colors"
                style={{
                  borderColor: isYou ? color.main : THEME.light,
                  background: isYou ? color.light : '#fff',
                  color: isYou ? color.text : THEME.sub,
                }}
              >
                <span>{player.emoji}</span>
                {player.name}
                {isYou && ' ✓'}
              </button>
            )
          })}
        </section>
        <p className="mb-4 text-center text-[11px] text-[#BBA697]">
          今日の達成：
          {PLAYERS.map((p) => `${p.emoji}${progress.lastCompletionDate[p.id] === today ? '✅' : '・'}`).join('　')}
          {bothCompletedToday && '　🎊コンボ達成済み'}
        </p>

        {/* Compact stats strip */}
        <section className="mb-5 flex items-center gap-3 rounded-3xl border-2 bg-white px-4 py-3" style={{ borderColor: THEME.light }}>
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
            style={{ background: THEME.accent, fontFamily: "'Yusei Magic', sans-serif" }}
          >
            Lv{level}
          </div>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: THEME.light }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: THEME.accent }} />
            </div>
            <p className="mt-1 text-[10px] text-[#BBA697]">
              気 {progress.energy}/{ENERGY_MAX}・{stageProgress.stage.emoji}
              {stageProgress.stage.name}
            </p>
          </div>
          {progress.wishTickets > 0 && (
            <button
              onClick={() => setShowWish(true)}
              className="flex flex-shrink-0 flex-col items-center rounded-xl border-2 px-2 py-1"
              style={{ borderColor: THEME.accent }}
            >
              <span className="text-base">🌠</span>
              <span className="text-[10px] font-bold" style={{ color: THEME.accent }}>
                x{progress.wishTickets}
              </span>
            </button>
          )}
        </section>

        <form onSubmit={handleAdd} className="mb-5 flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="やりたいことを追加..."
            className="fq-input flex-1 rounded-2xl border-2 border-[#FDEAF1] bg-white px-4 py-3 text-sm text-[#6B5547] outline-none"
          />
          <button
            type="submit"
            className="rounded-2xl px-5 py-3 text-sm font-bold text-white"
            style={{ background: THEME.accent }}
          >
            追加
          </button>
        </form>

        <section className="mb-5 rounded-3xl border-2 p-5 text-center" style={{ borderColor: THEME.light }}>
          <p className="mb-3 text-[11px] font-bold tracking-widest text-[#BBA697]">QUEST DICE・未完了 {incompleteCount}件</p>
          <button
            onClick={rollDice}
            disabled={rolling}
            className="rounded-full px-8 py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-60"
            style={{ background: THEME.accent }}
          >
            🎲 サイコロを振る
          </button>
          <div className="mt-5 flex min-h-[84px] flex-col items-center justify-center gap-2">
            {rolling && <span className="fq-roll text-5xl">{DICE_FACES[diceFace]}</span>}
            {!rolling && diceEmpty && <p className="text-sm text-[#D9C7BC]">まだ冒険がありません</p>}
            {!rolling && diceResult && (
              <div className="fq-pop">
                <p className="mb-1 text-[11px] text-[#BBA697]">次の冒険は…</p>
                <p className="text-lg font-black text-[#6B5547]">{diceResult.text}</p>
              </div>
            )}
            {!rolling && !diceEmpty && !diceResult && <span className="text-5xl">🎲</span>}
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-bold tracking-widest text-[#BBA697]">やりたいことリスト（{progress.items.length}）</p>
          {progress.items.length === 0 ? (
            <div
              className="rounded-3xl border-2 border-dashed py-10 text-center text-sm text-[#D9C7BC]"
              style={{ borderColor: THEME.light }}
            >
              やりたいことを追加してみよう ✨
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {progress.items.map((item) => (
                <QuestRow key={item.id} item={item} themeColors={progress.themeColors} onToggle={toggleItem} onRemove={removeItem} />
              ))}
            </div>
          )}
        </section>
      </div>

      {showWish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6B5547]/40 px-6" onClick={() => setShowWish(false)}>
          <div
            className="fq-bounce-in w-full max-w-xs rounded-3xl border-2 bg-white p-5 text-center shadow-xl"
            style={{ borderColor: THEME.accent }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-4xl">🌠</p>
            <p className="mt-2 text-base font-black text-[#6B5547]">願いチケットを使う</p>
            <p className="mt-1 text-xs text-[#BBA697]">のこり {progress.wishTickets} 枚</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => applyWish('reroll')}
                className="rounded-2xl border-2 px-4 py-3 text-sm font-bold text-[#6B5547]"
                style={{ borderColor: THEME.light }}
              >
                🎲 サイコロの候補を再抽選
              </button>
              <button
                onClick={() => applyWish('expBonus')}
                className="rounded-2xl border-2 px-4 py-3 text-sm font-bold text-[#6B5547]"
                style={{ borderColor: THEME.light }}
              >
                ✨ EXPボーナス +{WISH_EXP_BONUS}
              </button>
              <button
                onClick={() => applyWish('companionBoost')}
                className="rounded-2xl border-2 px-4 py-3 text-sm font-bold text-[#6B5547]"
                style={{ borderColor: THEME.light }}
              >
                🐾 仲間ゲット率アップ
              </button>
            </div>
            <button onClick={() => setShowWish(false)} className="mt-3 text-xs text-[#BBA697]">
              やめる
            </button>
          </div>
        </div>
      )}

      <EventOverlay events={events} onClose={() => setEvents([])} />

      <BottomNav />
    </main>
  )
}
