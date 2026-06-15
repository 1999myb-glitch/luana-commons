'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthStatus({ displayName }: { displayName: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setLoading(false)
    router.push('/')
    router.refresh()
  }

  if (!displayName) {
    return (
      <Link
        href="/login"
        style={{ padding: '9px 16px', borderRadius: 10, background: '#FFFFFF', color: '#E15252', border: 'none', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        ログイン
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', maxWidth: 96, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {displayName}
      </span>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1 }}
      >
        ログアウト
      </button>
    </div>
  )
}
