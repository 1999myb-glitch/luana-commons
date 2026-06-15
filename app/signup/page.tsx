'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)

  async function handleSubmit() {
    if (!displayName.trim()) return setError('表示名を入力してください')
    if (!email.trim()) return setError('メールアドレスを入力してください')
    if (password.length < 6) return setError('パスワードは6文字以上で入力してください')
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    })
    setLoading(false)
    if (error) return setError('登録に失敗しました: ' + error.message)

    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setConfirmSent(true)
    }
  }

  if (confirmSent) {
    return (
      <main className="min-h-screen bg-[#F3F3F3]">
        <div className="max-w-md mx-auto px-4 pb-20">
          <header className="py-5 flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">☕</Link>
            <h1 className="text-lg font-black text-[#1A1A1A]">新規登録</h1>
          </header>
          <div className="bg-white border border-[#F0F0F0] rounded-xl p-6 text-center">
            <p className="text-sm text-[#1A1A1A] font-bold mb-2">確認メールを送信しました</p>
            <p className="text-xs text-[#9B9B9B]">メール内のリンクをクリックしてからログインしてください</p>
            <Link href="/login" className="inline-block mt-4 px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold">
              ログイン画面へ
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-md mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">☕</Link>
          <h1 className="text-lg font-black text-[#1A1A1A]">新規登録</h1>
        </header>

        <div className="flex flex-col gap-5 bg-white border border-[#F0F0F0] rounded-xl p-6">
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">表示名</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="あなたの名前"
              className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              placeholder="6文字以上"
              className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-[#E15252] text-white font-bold text-sm rounded-xl disabled:opacity-50">
            {loading ? '登録中...' : '登録する'}
          </button>

          <p className="text-xs text-[#9B9B9B] text-center">
            すでにアカウントをお持ちの方は <Link href="/login" className="text-[#E15252] font-bold">ログイン</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
