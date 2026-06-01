'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const cats = [
  { id: 'notice', label: 'お知らせ' },
  { id: 'project', label: 'プロジェクト' },
  { id: 'learning', label: 'Learning' },
  { id: 'meeting', label: 'Meeting Notes' },
  { id: 'knowledge', label: 'Knowledge Base' },
]

const TAGS = ['AI','ビジネス','マーケティング','SNS','トレンド','ツール','議事録','ノウハウ']

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', ppt: '📊', pptx: '📊', xls: '📗', xlsx: '📗',
  doc: '📘', docx: '📘', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return FILE_ICONS[ext] || '📎'
}

function isImage(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ['png','jpg','jpeg','gif','webp'].includes(ext)
}

export default function NewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('learning')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selected])
    selected.forEach(file => {
      if (isImage(file.name)) {
        setPreviews(prev => [...prev, URL.createObjectURL(file)])
      } else {
        setPreviews(prev => [...prev, ''])
      }
    })
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!title.trim()) return setError('タイトルを入力してください')
    if (!body.trim()) return setError('本文を入力してください')
    if (!author.trim()) return setError('名前を入力してください')
    setError('')
    setLoading(true)
    const supabase = createClient()

    const uploadedUrls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file, { contentType: file.type })
      if (uploadError) {
        setLoading(false)
        return setError(`ファイルのアップロードに失敗しました: ${file.name}`)
      }
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      uploadedUrls.push(`${file.name}::${data.publicUrl}`)
    }

    const linkPart = linkUrl
      ? `\n\n📎 [${linkLabel || linkUrl}](${linkUrl})` : ''
    const finalBody = body + linkPart

    const { error } = await supabase.from('posts').insert({
      title, body: finalBody, category, author_name: author,
      image_urls: uploadedUrls, likes_count: 0,
    })
    setLoading(false)
    if (error) return setError('投稿に失敗しました: ' + error.message)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-[#F6F2EC]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <a href="/" className="w-8 h-8 rounded-lg bg-[#8A6F4D] flex items-center justify-center text-white text-sm">☕</a>
          <h1 className="text-lg font-black text-[#2C2C2C]">新しい投稿</h1>
        </header>

        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">TITLE *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトルを入力" className="w-full bg-white border border-[#EDE8E0] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#8A6F4D]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">CATEGORY *</label>
            <div className="flex flex-wrap gap-2">
              {cats.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-colors ${category === cat.id ? 'bg-[#8A6F4D] border-[#8A6F4D] text-white' : 'bg-transparent border-[#D6C4A8] text-[#8A6F4D]'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">BODY *</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="内容を入力..." rows={8} className="w-full bg-white border border-[#EDE8E0] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#8A6F4D] resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">📎 ファイル添付</label>
            <p className="text-xs text-[#A09080] mb-3">画像・PDF・Word・Excel・PowerPoint対応（複数可）</p>
            <label className="block w-full bg-white border-2 border-dashed border-[#D6C4A8] rounded-xl p-6 text-center cursor-pointer hover:border-[#8A6F4D] transition-colors">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm text-[#A09080]">クリックしてファイルを選択</p>
              <p className="text-xs text-[#C0B0A0] mt-1">PNG・JPG・PDF・DOCX・XLSX・PPTX</p>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFiles} className="hidden" />
            </label>

            {files.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-[#EDE8E0] rounded-xl px-4 py-3">
                    {previews[i] ? (
                      <img src={previews[i]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-2xl">{getFileIcon(file.name)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2C2C2C] truncate">{file.name}</p>
                      <p className="text-xs text-[#A09080]">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-xs text-[#A09080] hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">🔗 リンク添付（Google Drive・URL）</label>
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/... または任意のURL" className="w-full bg-white border border-[#EDE8E0] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#8A6F4D] mb-2" />
            <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="リンクの表示名（例：資料はこちら）" className="w-full bg-white border border-[#EDE8E0] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#8A6F4D]" />
            <p className="text-xs text-[#A09080] mt-2">💡 Google DriveのリンクはURLをそのまま貼り付けてください</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">TAGS</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${tags.includes(tag) ? 'bg-[#8A6F4D] border-[#8A6F4D] text-white' : 'bg-transparent border-[#D6C4A8] text-[#8A6F4D]'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">YOUR NAME *</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="投稿者名" className="w-full bg-white border border-[#EDE8E0] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#8A6F4D]" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-[#8A6F4D] text-white font-bold text-sm rounded-xl disabled:opacity-50">
            {loading ? '投稿中...' : '投稿する ☕'}
          </button>
        </div>
      </div>
    </main>
  )
}
