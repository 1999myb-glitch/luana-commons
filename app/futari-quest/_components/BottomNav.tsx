'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { THEME } from '@/lib/futari-quest/constants'

const TABS = [
  { href: '/futari-quest', label: 'ホーム', emoji: '🏠' },
  { href: '/futari-quest/quest', label: 'クエスト', emoji: '📜' },
  { href: '/futari-quest/map', label: 'マップ', emoji: '🗺️' },
  { href: '/futari-quest/collection', label: '図鑑', emoji: '📖' },
  { href: '/futari-quest/settings', label: 'せってい', emoji: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t-2 bg-white/95" style={{ borderColor: THEME.light }}>
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {TABS.map((tab) => {
          const active = tab.href === '/futari-quest' ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-colors"
              style={{ color: active ? THEME.accent : THEME.sub }}
            >
              <span className="text-lg">{tab.emoji}</span>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
