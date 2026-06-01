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

export default function NewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('learning')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!title.trim()) return setError('タイトルを入力してください')
    if (!body.trim()) return setError('本文を入力してください')
    if (!author.trim()) return setError('名前を入力してください')
    setError('')
    setLoading(true)
    const supabase = createClient()

    let imageUrl = ''
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile, { contentType: imageFile.type })
      if (uploadError) {
        setLoading(false)
        return setError('画像のアップロードに失敗しました')
      }
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      imageUrl = data.publicUrl
    }

    const finalBody = linkUrl
      ? `${body}\n\n📎 [${linkLabel || linkUrl}](${linkUrl})`
      : body

    const { error } = await supabase.from('posts').insert({
      title,
      body: finalBody,
      category,
      author_name: author,
      image_urls: imageUrl ? [imageUrl] : [],
      likes_count: 0,
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
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">IMAGE（画像アップロード）</label>
            <div className="w-full bg-white border-2 border-dashed border-[#D6C4A8] rounded-xl p-6 text-center">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg mb-3 object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview('') }} className="text-xs text-[#A09080] underline">削除</button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-sm text-[#A09080]">クリックして画像を選択</p>
                  <p className="text-xs text-[#C0B0A0] mt-1">JPG, PNG, GIF対応</p>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A6F4D] mb-2 tracking-wider">📎 リンク添付（Google Drive・PDF・URL）</label>
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
