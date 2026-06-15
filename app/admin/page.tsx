import { createClient } from '@/lib/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/supabase/auth'
import Link from 'next/link'
import AdminUserList from './AdminUserList'

export default async function AdminPage() {
  const supabase = await createClient()
  const { user, profile } = await getCurrentUserAndProfile(supabase)

  if (!user || !profile?.is_admin) {
    return (
      <main className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="bg-white border border-[#F0F0F0] rounded-xl p-8 text-center max-w-sm">
          <p className="text-sm text-[#9B9B9B] mb-4">このページは管理者のみアクセスできます</p>
          <Link href="/" className="text-sm font-bold text-[#E15252]">トップへ戻る</Link>
        </div>
      </main>
    )
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, is_admin, created_at')
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">☕</Link>
          <h1 className="text-lg font-black text-[#1A1A1A] flex-1">管理者設定</h1>
        </header>

        <AdminUserList initialProfiles={profiles || []} currentUserId={user.id} />
      </div>
    </main>
  )
}
