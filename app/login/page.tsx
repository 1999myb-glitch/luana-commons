'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email.trim() || !password) return setError('メールアドレスとパスワードを入力してください')
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) return setError('ログインに失敗しました: ' + error.message)
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-md mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">☕</Link>
          <h1 className="text-lg font-black text-[#1A1A1A]">ログイン</h1>
        </header>

        <div className="flex flex-col gap-5 bg-white border border-[#F0F0F0] rounded-xl p-6">
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com"
              className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-[#E15252] text-white font-bold text-sm rounded-xl disabled:opacity-50">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <p className="text-xs text-[#9B9B9B] text-center">
            アカウントをお持ちでない方は <Link href="/signup" className="text-[#E15252] font-bold">新規登録</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
