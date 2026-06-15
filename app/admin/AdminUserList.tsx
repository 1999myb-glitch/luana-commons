'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileRow {
  id: string
  display_name: string
  email: string | null
  is_admin: boolean
  created_at: string
}

export default function AdminUserList({ initialProfiles, currentUserId }: { initialProfiles: ProfileRow[]; currentUserId: string }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function toggleAdmin(target: ProfileRow) {
    const nextValue = !target.is_admin
    if (target.id === currentUserId && !nextValue) {
      if (!window.confirm('自分の管理者権限を削除します。よろしいですか？')) return
    } else {
      const label = nextValue ? '管理者に追加' : '管理者から削除'
      if (!window.confirm(`${target.display_name || target.email}を${label}します。よろしいですか？`)) return
    }

    setUpdatingId(target.id)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ is_admin: nextValue }).eq('id', target.id)
    setUpdatingId(null)
    if (error) {
      setError('更新に失敗しました: ' + error.message)
      return
    }
    setProfiles(prev => prev.map(p => p.id === target.id ? { ...p, is_admin: nextValue } : p))
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      {profiles.map(p => (
        <div key={p.id} className="bg-white border border-[#F0F0F0] rounded-xl p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1A1A1A] truncate">
              {p.display_name || '(no name)'}
              {p.id === currentUserId && <span className="text-xs text-[#9B9B9B] font-normal"> (あなた)</span>}
            </p>
            <p className="text-xs text-[#9B9B9B] truncate">{p.email}</p>
          </div>
          {p.is_admin && (
            <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: '#4FAF7A', background: '#E8F6EF' }}>
              管理者
            </span>
          )}
          <button
            onClick={() => toggleAdmin(p)}
            disabled={updatingId === p.id}
            className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap border-2 disabled:opacity-50 ${p.is_admin ? 'border-[#E15252] text-[#E15252] bg-transparent' : 'border-[#E15252] bg-[#E15252] text-white'}`}
          >
            {updatingId === p.id ? '...' : p.is_admin ? '権限を削除' : '管理者にする'}
          </button>
        </div>
      ))}
    </div>
  )
}
