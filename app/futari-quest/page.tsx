import Link from 'next/link'
import { PLAYERS } from '@/lib/futari-quest/constants'

export default function FutariQuestTopPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F3] flex flex-col items-center px-4 py-14">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&family=Noto+Serif+JP:wght@900&display=swap');`}</style>
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-bold tracking-[0.3em] text-[#BBA697]">TWO PLAYER ADVENTURE</p>
        <h1 className="text-4xl font-black text-[#6B5547]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          🎲 Futari Quest
        </h1>
        <p className="mt-3 text-sm text-[#BBA697]">二人でやりたいことを叶える、ふたりだけの冒険ノート</p>
      </div>

      <div className="mb-10 flex w-full max-w-sm items-center justify-center gap-4 rounded-3xl border-2 border-[#FDEAF1] bg-white p-6 shadow-sm">
        {PLAYERS.map((player, i) => (
          <div key={player.name} className="flex flex-1 items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDEAF1] text-3xl">
                {player.emoji}
              </div>
              <p className="text-base font-black text-[#6B5547]">{player.name}</p>
            </div>
            {i === 0 && <span className="text-xl font-black text-[#F2A0C4]">✕</span>}
          </div>
        ))}
      </div>

      <Link
        href="/futari-quest/quest"
        className="block w-full max-w-sm rounded-full px-8 py-4 text-center text-base font-black text-white shadow-md transition-transform active:scale-95"
        style={{ background: '#F2A0C4' }}
      >
        二人のやりたいことリストへ →
      </Link>

      <p className="mt-12 text-xs text-[#D9C7BC]">💌 ふたりだけのリストで、毎日を楽しく</p>
    </main>
  )
}
