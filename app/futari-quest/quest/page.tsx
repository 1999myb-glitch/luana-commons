'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { EXP_PER_QUEST, PLAYERS, THEME, getLevel, getLevelProgress } from '@/lib/futari-quest/constants'
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
  updateProgress,
  type QuestItem,
} from '@/lib/futari-quest/storage'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function QuestRow({
  item,
  onToggle,
  onRemove,
}: {
  item: QuestItem
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
      <button onClick={() => onRemove(item.id)} aria-label="削除" className="text-xs text-[#E0D0C5] hover:text-[#E08A8A]">
        ✕
      </button>
    </div>
  )
}

export default function FutariQuestListPage() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot)
  const [newText, setNewText] = useState('')
  const [levelUp, setLevelUp] = useState(false)
  const [diceFace, setDiceFace] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [diceResult, setDiceResult] = useState<QuestItem | null>(null)
  const [diceEmpty, setDiceEmpty] = useState(false)
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
    updateProgress((prev) => {
      const target = prev.items.find((i) => i.id === id)
      if (!target) return prev
      const becomingComplete = !target.completed
      const delta = becomingComplete ? 1 : -1
      const items = prev.items.map((i) => (i.id === id ? { ...i, completed: becomingComplete } : i))
      const exp = Math.max(0, prev.exp + delta * EXP_PER_QUEST)
      const completedCount = Math.max(0, prev.completedCount + delta)
      if (getLevel(exp) > getLevel(prev.exp)) {
        setLevelUp(true)
        setTimeout(() => setLevelUp(false), 2400)
      }
      return { items, exp, completedCount }
    })
  }

  function removeItem(id: string) {
    updateProgress((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }))
    if (diceResult?.id === id) setDiceResult(null)
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
  const { current, max, percent } = getLevelProgress(progress.exp)
  const incompleteCount = progress.items.filter((i) => !i.completed).length

  return (
    <main className="min-h-screen bg-[#FFF8F3] pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&family=Noto+Serif+JP:wght@900&display=swap');
        @keyframes fq-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
        @keyframes fq-shake { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-6px) rotate(8deg) } }
        .fq-pop { animation: fq-pop .4s ease-out; }
        .fq-roll { display: inline-block; animation: fq-shake .25s ease-in-out infinite; }
        .fq-input:focus { border-color: ${THEME.accent}; }
      `}</style>

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

        <section className="mb-5 rounded-3xl border-2 bg-white p-5" style={{ borderColor: THEME.light }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white"
                style={{ background: THEME.accent, fontFamily: "'Yusei Magic', sans-serif" }}
              >
                Lv{level}
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">LEVEL</p>
                <p className="text-base font-black text-[#6B5547]">
                  {PLAYERS.map((p) => p.emoji).join(' ')} {PLAYERS.map((p) => p.name).join(' ✕ ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold tracking-widest text-[#BBA697]">達成数</p>
              <p className="text-xl font-black" style={{ color: THEME.accent }}>
                {progress.completedCount}
              </p>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: THEME.light }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%`, background: THEME.accent }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] text-[#BBA697]">
            EXP {current} / {max}
          </p>
        </section>

        {levelUp && (
          <div
            className="fq-pop mb-5 rounded-2xl border-2 p-4 text-center"
            style={{ borderColor: THEME.accent, background: THEME.light }}
          >
            <p className="text-sm font-black text-[#6B5547]">🎉 レベルアップ！ Lv.{level} になりました</p>
          </div>
        )}

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
                <QuestRow key={item.id} item={item} onToggle={toggleItem} onRemove={removeItem} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
