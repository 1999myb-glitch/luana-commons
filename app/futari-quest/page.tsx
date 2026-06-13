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

      <div className="flex w-full max-w-sm flex-col gap-5">
        {PLAYERS.map((player) => (
          <Link
            key={player.id}
            href={`/futari-quest/${player.id}`}
            className="group block rounded-3xl border-2 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ borderColor: player.light }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{ background: player.light }}
              >
                {player.emoji}
              </div>
              <div className="flex-1">
                <p className="text-lg font-black text-[#6B5547]">{player.name}</p>
                <p className="mt-1 text-xs text-[#BBA697]">冒険をはじめる →</p>
              </div>
              <span
                className="text-2xl transition-transform group-hover:translate-x-1"
                style={{ color: player.accent }}
              >
                ▶
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-xs text-[#D9C7BC]">💌 ふたりだけのリストで、毎日を楽しく</p>
    </main>
  )
}
