'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteMeetingButton({ id, postId }: { id: string; postId: string | null }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('このミーティングログを削除します。よろしいですか？（元に戻せません）')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('meetings').delete().eq('id', id)
    if (postId) {
      await supabase.from('posts').delete().eq('id', postId)
    }
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      aria-label="削除"
      className="px-2 py-1 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#E15252] disabled:opacity-50 whitespace-nowrap"
    >
      {deleting ? '...' : '削除'}
    </button>
  )
}
