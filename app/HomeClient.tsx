'use client'
import { useState, useEffect, useRef } from "react"
import { createClient } from '@/lib/supabase/client'

const CATS = [
  { id: "all",      label: "All" },
  { id: "notice",   label: "お知らせ" },
  { id: "project",  label: "プロジェクト" },
  { id: "learning", label: "Learning" },
  { id: "meeting",  label: "Meeting Notes" },
  { id: "knowledge",label: "Knowledge Base" },
]

const CAT_META: Record<string, { icon: string; color: string; bg: string }> = {
  notice:    { icon: "📢", color: "#C97B4B", bg: "#FDF4EC" },
  project:   { icon: "🚀", color: "#4B8A6A", bg: "#EDF7F2" },
  learning:  { icon: "📖", color: "#4B6A8A", bg: "#EDF2F7" },
  meeting:   { icon: "📝", color: "#7A5A8A", bg: "#F5EDF7" },
  knowledge: { icon: "💡", color: "#8A7A4B", bg: "#F7F5ED" },
}

const TAGS = ["AI","ビジネス","マーケティング","SNS","トレンド","ツール","海外事例","議事録","ノウハウ","ChatGPT","Claude","イベント"]

function timeAgo(d: string) {
  const s = (new Date().getTime() - new Date(d).getTime()) / 1000
  if (s < 86400)  return "今日"
  if (s < 172800) return "昨日"
  if (s < 604800) return `${Math.floor(s/86400)}日前`
  return new Date(d).toLocaleDateString("ja-JP",{month:"long",day:"numeric"})
}

function getCatMeta(cat: string) {
  return CAT_META[cat] || { icon: "📄", color: "#8A7A6A", bg: "#F6F2EC" }
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const palette = ["#C97B4B","#4B8A6A","#4B6A8A","#7A5A8A","#8A7A4B","#5A6A8A"]
  const bg = palette[(name||"").charCodeAt(0) % palette.length]
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {(name||"?").slice(0,1)}
    </div>
  )
}

function PostCard({ post, onClick }: { post: any; onClick: (p: any) => void }) {
  const meta = getCatMeta(post.category)
  const catLabel = CATS.find(c => c.id === post.category)?.label || post.category
  const tags = Array.isArray(post.tags) ? post.tags : []
  return (
    <article onClick={() => onClick(post)}
      style={{ background: "#fff", border: "1px solid #EDE8E0", borderRadius: 18, padding: "20px 22px", cursor: "pointer", transition: "all .22s", position: "relative", overflow: "hidden" }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px #D6C4A848" }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "" }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "18px 0 0 18px", background: meta.color, opacity: .6 }} />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg }}>{catLabel}</span>
            {tags.slice(0,2).map((t: string) => (
              <span key={t} style={{ fontSize: 10, color: "#A08060", background: "#F6F2EC", border: "1px solid #D6C4A8", padding: "2px 8px", borderRadius: 10 }}>#{t}</span>
            ))}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2C2C2C", lineHeight: 1.5, marginBottom: 8 }}>{post.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={post.author_name || "?"} size={22} />
            <span style={{ fontSize: 12, color: "#A09080" }}>{post.author_name}</span>
            <span style={{ fontSize: 11, color: "#C0B0A0", marginLeft: "auto" }}>{timeAgo(post.created_at)}</span>
            <span style={{ fontSize: 11, color: "#C0B0A0" }}>♡ {post.likes_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function PostSheet({ post, onClose, onLike, liked }: { post: any; onClose: () => void; onLike: (id: string) => void; liked: boolean }) {
  const meta = getCatMeta(post.category)
  const catLabel = CATS.find(c => c.id === post.category)?.label || post.category
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const tags = Array.isArray(post.tags) ? post.tags : []

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  function submitComment() {
    if (!comment.trim()) return
    setComments(p => [...p, { id: Date.now(), text: comment, author: "あなた", date: new Date().toISOString() }])
    setComment("")
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#2C2C2C70", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#FEFCF8", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 720, maxHeight: "92vh", overflow: "auto", padding: "0 0 40px", animation: "sheetUp .32s ease" }}>
        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: "#D6C4A8" }} />
        </div>
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{meta.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{catLabel}</div>
              <div style={{ fontSize: 11, color: "#A09080" }}>{post.created_at?.slice(0,10)} · {post.author_name}</div>
            </div>
            <button onClick={onClose} style={{ marginLeft: "auto", width: 32, height: 32, borderRadius: 8, border: "1px solid #D6C4A8", background: "#F6F2EC", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C2C2C", lineHeight: 1.45, marginBottom: 14 }}>{post.title}</h2>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {tags.map((t: string) => <span key={t} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, border: "1.5px solid #D6C4A8", color: "#8A6F4D" }}>{t}</span>)}
            </div>
          )}
          <div style={{ width: "100%", height: 1, background: "#EDE8E0", marginBottom: 20 }} />
          <p style={{ fontSize: 14, color: "#3C3C3C", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{post.body}</p>

          {/* 添付ファイル表示 */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#8A6F4D", marginBottom: 8 }}>📎 添付ファイル</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {post.image_urls.map((url: string, i: number) => {
                  const parts = url.split("::")
                  const name = parts.length > 1 ? parts[0] : url
                  const link = parts.length > 1 ? parts[1] : url
                  const isImg = /\.(png|jpg|jpeg|gif|webp)$/i.test(name)
                  return isImg ? (
                    <img key={i} src={link} alt={name} style={{ maxWidth: "100%", borderRadius: 12 }} />
                  ) : (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 8, background: "#F6F2EC", border: "1px solid #D6C4A8", borderRadius: 10, padding: "10px 14px", textDecoration: "none", color: "#2C2C2C", fontSize: 13 }}>
                      <span>📄</span><span>{name}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => onLike(post.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, border: `1.5px solid ${liked ? "#C97B4B" : "#D6C4A8"}`, background: liked ? "#C97B4B" : "transparent", color: liked ? "#fff" : "#8A7A6A", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              {liked ? "♥" : "♡"} {(post.likes_count || 0) + (liked ? 1 : 0)}
            </button>
            <span style={{ fontSize: 12, color: "#C0B0A0" }}>{liked ? "いいね済み" : "役に立ったらいいね"}</span>
          </div>

          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#2C2C2C", marginBottom: 14 }}>コメント {comments.length > 0 && `(${comments.length})`}</h4>
            {comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <Avatar name={c.author} size={28} />
                <div style={{ background: "#F6F2EC", borderRadius: 12, padding: "10px 14px", flex: 1 }}>
                  <p style={{ fontSize: 13, color: "#2C2C2C", lineHeight: 1.6 }}>{c.text}</p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitComment())}
                placeholder="コメントを入力..." style={{ flex: 1, background: "#F6F2EC", border: "1.5px solid #D6C4A8", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#2C2C2C", fontFamily: "inherit", outline: "none" }} />
              <button onClick={submitComment} style={{ padding: "10px 18px", background: "#8A6F4D", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>送信</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostForm({ onSubmit, onClose }: { onSubmit: (p: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ title: "", category: "learning", body: "", author: "" })
  const [tags, setTags] = useState<string[]>([])
  const [linkUrl, setLinkUrl] = useState("")
  const [linkLabel, setLinkLabel] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selected])
    selected.forEach(file => {
      const isImg = /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
      setPreviews(prev => [...prev, isImg ? URL.createObjectURL(file) : ""])
    })
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError("タイトルを入力してください")
    if (!form.body.trim())  return setError("本文を入力してください")
    if (!form.author.trim()) return setError("名前を入力してください")
    setError(""); setLoading(true)
    const supabase = createClient()
    const uploadedUrls: string[] = []
    for (const file of files) {
      const path = `${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from("post-images").upload(path, file, { contentType: file.type })
      if (upErr) { setLoading(false); return setError(`アップロード失敗: ${file.name}`) }
      const { data } = supabase.storage.from("post-images").getPublicUrl(path)
      uploadedUrls.push(`${file.name}::${data.publicUrl}`)
    }
    const linkPart = linkUrl ? `\n\n📎 [${linkLabel || linkUrl}](${linkUrl})` : ""
    const { data, error } = await supabase.from("posts").insert({
      title: form.title, body: form.body + linkPart, category: form.category,
      author_name: form.author, image_urls: uploadedUrls, likes_count: 0,
    }).select().single()
    setLoading(false)
    if (error) return setError("投稿に失敗しました")
    onSubmit(data)
  }

  const inp = "w-full bg-[#F6F2EC] border border-[#D6C4A8] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none"

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#2C2C2C70", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#FEFCF8", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 720, maxHeight: "94vh", overflow: "auto", padding: "0 0 48px", animation: "sheetUp .32s ease" }}>
        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: "#D6C4A8" }} />
        </div>
        <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#2C2C2C" }}>新しい投稿 ☕</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #D6C4A8", background: "#F6F2EC", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
        <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>TITLE *</label>
            <input className={inp} value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="タイトルを入力" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>CATEGORY *</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATS.filter(c => c.id !== "all").map(cat => (
                <button key={cat.id} onClick={() => setForm(p => ({...p, category: cat.id}))}
                  style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${form.category === cat.id ? "#8A6F4D" : "#D6C4A8"}`, background: form.category === cat.id ? "#8A6F4D" : "transparent", color: form.category === cat.id ? "#fff" : "#8A6F4D", cursor: "pointer", fontFamily: "inherit" }}>
                  {getCatMeta(cat.id).icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>BODY *</label>
            <textarea className={inp} style={{ minHeight: 140, resize: "vertical" }} value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} placeholder="内容を入力..." />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>📎 ファイル添付</label>
            <label style={{ display: "block", width: "100%", background: "#F6F2EC", border: "2px dashed #D6C4A8", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>📁</div>
              <p style={{ fontSize: 13, color: "#A09080" }}>クリックしてファイルを選択</p>
              <p style={{ fontSize: 11, color: "#C0B0A0", marginTop: 4 }}>PNG・JPG・PDF・DOCX・XLSX・PPTX（複数可）</p>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFiles} style={{ display: "none" }} />
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #EDE8E0", borderRadius: 10, padding: "10px 14px" }}>
                    {previews[i] ? <img src={previews[i]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>📄</span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#2C2C2C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: "#A09080" }}>{(file.size/1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => { setFiles(p => p.filter((_,j) => j !== i)); setPreviews(p => p.filter((_,j) => j !== i)) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#A09080", fontSize: 16 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>🔗 リンク添付（Google Drive・URL）</label>
            <input className={inp} style={{ marginBottom: 8 }} value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/... または任意のURL" />
            <input className={inp} value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="リンクの表示名（例：資料はこちら）" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>TAGS</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  style={{ padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1.5px solid ${tags.includes(tag) ? "#8A6F4D" : "#D6C4A8"}`, background: tags.includes(tag) ? "#8A6F4D" : "transparent", color: tags.includes(tag) ? "#fff" : "#8A6F4D", cursor: "pointer", fontFamily: "inherit" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>YOUR NAME *</label>
            <input className={inp} value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))} placeholder="投稿者名" />
          </div>
          {error && <p style={{ fontSize: 12, color: "#C97B4B" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#8A6F4D", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", opacity: loading ? .5 : 1 }}>
            {loading ? "投稿中..." : "投稿する ☕"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomeClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [liked, setLiked] = useState<string[]>([])
  const [cat, setCat] = useState("all")
  const [openPost, setOpenPost] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = (cat === "all" ? posts : posts.filter(p => p.category === cat))
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.author_name||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const popularLearning = [...posts].filter(p => p.category === "learning").sort((a,b) => (b.likes_count||0) - (a.likes_count||0)).slice(0,5)

  async function handleLike(id: string) {
    if (liked.includes(id)) return
    setLiked(p => [...p, id])
    const supabase = createClient()
    await supabase.from("likes").insert({ post_id: id, user_id: "anonymous" }).catch(() => {})
    setPosts(p => p.map(x => x.id === id ? {...x, likes_count: (x.likes_count||0)+1} : x))
    if (openPost?.id === id) setOpenPost((p: any) => ({...p, likes_count: (p.likes_count||0)+1}))
  }

  function handleNewPost(p: any) {
    setPosts(prev => [p, ...prev])
    setShowForm(false)
    setCat("all")
  }

  return (
    <div style={{ background: "#F6F2EC", minHeight: "100vh", fontFamily: "'Noto Sans JP', sans-serif", color: "#2C2C2C" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes sheetUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #D6C4A8; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#F6F2ECEE", backdropFilter: "blur(14px)", borderBottom: "1px solid #EDE8E0", padding: "12px 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#8A6F4D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>☕</div>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif" }}>Luana Commons</span>
          </div>
          <button onClick={() => setShowSearch(s => !s)} style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #D6C4A8", background: "#fff", cursor: "pointer", fontSize: 17 }}>🔍</button>
          <button onClick={() => setShowForm(true)} style={{ padding: "9px 18px", borderRadius: 10, background: "#8A6F4D", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>＋ 投稿</button>
        </div>
        {showSearch && (
          <div style={{ maxWidth: 720, margin: "10px auto 0" }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="記事を検索..."
              style={{ width: "100%", background: "#fff", border: "1.5px solid #D6C4A8", borderRadius: 12, padding: "11px 16px", fontSize: 14, color: "#2C2C2C", outline: "none", fontFamily: "inherit" }} />
          </div>
        )}
      </header>

      {/* Category Nav */}
      <div style={{ background: "#F6F2ECEE", backdropFilter: "blur(14px)", borderBottom: "1px solid #EDE8E0", position: "sticky", top: showSearch ? 110 : 60, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ padding: "14px 16px", background: "none", border: "none", borderBottom: cat === c.id ? "2px solid #8A6F4D" : "2px solid transparent", color: cat === c.id ? "#8A6F4D" : "#8A7A6A", fontWeight: cat === c.id ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>
        {cat === "all" && !search && (
          <>
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif", marginBottom: 14 }}>最近の投稿</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.slice(0,3).map((p: any) => <PostCard key={p.id} post={p} onClick={setOpenPost} />)}
              </div>
            </section>
            {popularLearning.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif" }}>今月の人気 Learning</h2>
                  <p style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>AI・トレンド・便利ツール</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {popularLearning.map((p: any, i: number) => (
                    <div key={p.id} onClick={() => setOpenPost(p)}
                      style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #EDE8E0", borderRadius: 14, padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: i < 3 ? "#C97B4B" : "#C0B0A0", width: 22, textAlign: "center" }}>{i+1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#2C2C2C", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.title}</p>
                        <p style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>{p.author_name} · ♡ {p.likes_count || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <div style={{ height: 1, background: "#EDE8E0", marginBottom: 28 }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif", marginBottom: 14 }}>すべての投稿</h2>
          </>
        )}

        {cat !== "all" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "18px 20px", background: getCatMeta(cat).bg, borderRadius: 18, border: `1px solid ${getCatMeta(cat).color}28` }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: getCatMeta(cat).color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{getCatMeta(cat).icon}</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif" }}>{CATS.find(c => c.id === cat)?.label}</h2>
              <p style={{ fontSize: 12, color: "#A09080" }}>{filtered.length} 件の投稿</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 0", color: "#C0B0A0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>☕</div>
                <p style={{ fontSize: 14 }}>まだ投稿がありません</p>
                <button onClick={() => setShowForm(true)} style={{ marginTop: 14, padding: "10px 20px", background: "#8A6F4D", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>最初に投稿する</button>
              </div>
            : filtered.map((p: any) => <PostCard key={p.id} post={p} onClick={setOpenPost} />)
          }
        </div>
      </main>

      {openPost && <PostSheet post={posts.find((p: any) => p.id === openPost.id) || openPost} onClose={() => setOpenPost(null)} onLike={handleLike} liked={liked.includes(openPost.id)} />}
      {showForm && <PostForm onSubmit={handleNewPost} onClose={() => setShowForm(false)} />}
    </div>
  )
}
ENDOFFILEcat > ~/Desktop/luana-commons/app/HomeClient.tsx << 'ENDOFFILE'
'use client'
import { useState, useEffect, useRef } from "react"
import { createClient } from '@/lib/supabase/client'

const CATS = [
  { id: "all",      label: "All" },
  { id: "notice",   label: "お知らせ" },
  { id: "project",  label: "プロジェクト" },
  { id: "learning", label: "Learning" },
  { id: "meeting",  label: "Meeting Notes" },
  { id: "knowledge",label: "Knowledge Base" },
]

const CAT_META: Record<string, { icon: string; color: string; bg: string }> = {
  notice:    { icon: "📢", color: "#C97B4B", bg: "#FDF4EC" },
  project:   { icon: "🚀", color: "#4B8A6A", bg: "#EDF7F2" },
  learning:  { icon: "📖", color: "#4B6A8A", bg: "#EDF2F7" },
  meeting:   { icon: "📝", color: "#7A5A8A", bg: "#F5EDF7" },
  knowledge: { icon: "💡", color: "#8A7A4B", bg: "#F7F5ED" },
}

const TAGS = ["AI","ビジネス","マーケティング","SNS","トレンド","ツール","海外事例","議事録","ノウハウ","ChatGPT","Claude","イベント"]

function timeAgo(d: string) {
  const s = (new Date().getTime() - new Date(d).getTime()) / 1000
  if (s < 86400)  return "今日"
  if (s < 172800) return "昨日"
  if (s < 604800) return `${Math.floor(s/86400)}日前`
  return new Date(d).toLocaleDateString("ja-JP",{month:"long",day:"numeric"})
}

function getCatMeta(cat: string) {
  return CAT_META[cat] || { icon: "📄", color: "#8A7A6A", bg: "#F6F2EC" }
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const palette = ["#C97B4B","#4B8A6A","#4B6A8A","#7A5A8A","#8A7A4B","#5A6A8A"]
  const bg = palette[(name||"").charCodeAt(0) % palette.length]
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {(name||"?").slice(0,1)}
    </div>
  )
}

function PostCard({ post, onClick }: { post: any; onClick: (p: any) => void }) {
  const meta = getCatMeta(post.category)
  const catLabel = CATS.find(c => c.id === post.category)?.label || post.category
  const tags = Array.isArray(post.tags) ? post.tags : []
  return (
    <article onClick={() => onClick(post)}
      style={{ background: "#fff", border: "1px solid #EDE8E0", borderRadius: 18, padding: "20px 22px", cursor: "pointer", transition: "all .22s", position: "relative", overflow: "hidden" }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px #D6C4A848" }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "" }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "18px 0 0 18px", background: meta.color, opacity: .6 }} />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg }}>{catLabel}</span>
            {tags.slice(0,2).map((t: string) => (
              <span key={t} style={{ fontSize: 10, color: "#A08060", background: "#F6F2EC", border: "1px solid #D6C4A8", padding: "2px 8px", borderRadius: 10 }}>#{t}</span>
            ))}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2C2C2C", lineHeight: 1.5, marginBottom: 8 }}>{post.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={post.author_name || "?"} size={22} />
            <span style={{ fontSize: 12, color: "#A09080" }}>{post.author_name}</span>
            <span style={{ fontSize: 11, color: "#C0B0A0", marginLeft: "auto" }}>{timeAgo(post.created_at)}</span>
            <span style={{ fontSize: 11, color: "#C0B0A0" }}>♡ {post.likes_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function PostSheet({ post, onClose, onLike, liked }: { post: any; onClose: () => void; onLike: (id: string) => void; liked: boolean }) {
  const meta = getCatMeta(post.category)
  const catLabel = CATS.find(c => c.id === post.category)?.label || post.category
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const tags = Array.isArray(post.tags) ? post.tags : []

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  function submitComment() {
    if (!comment.trim()) return
    setComments(p => [...p, { id: Date.now(), text: comment, author: "あなた", date: new Date().toISOString() }])
    setComment("")
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#2C2C2C70", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#FEFCF8", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 720, maxHeight: "92vh", overflow: "auto", padding: "0 0 40px", animation: "sheetUp .32s ease" }}>
        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: "#D6C4A8" }} />
        </div>
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{meta.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{catLabel}</div>
              <div style={{ fontSize: 11, color: "#A09080" }}>{post.created_at?.slice(0,10)} · {post.author_name}</div>
            </div>
            <button onClick={onClose} style={{ marginLeft: "auto", width: 32, height: 32, borderRadius: 8, border: "1px solid #D6C4A8", background: "#F6F2EC", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C2C2C", lineHeight: 1.45, marginBottom: 14 }}>{post.title}</h2>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {tags.map((t: string) => <span key={t} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, border: "1.5px solid #D6C4A8", color: "#8A6F4D" }}>{t}</span>)}
            </div>
          )}
          <div style={{ width: "100%", height: 1, background: "#EDE8E0", marginBottom: 20 }} />
          <p style={{ fontSize: 14, color: "#3C3C3C", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{post.body}</p>

          {/* 添付ファイル表示 */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#8A6F4D", marginBottom: 8 }}>📎 添付ファイル</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {post.image_urls.map((url: string, i: number) => {
                  const parts = url.split("::")
                  const name = parts.length > 1 ? parts[0] : url
                  const link = parts.length > 1 ? parts[1] : url
                  const isImg = /\.(png|jpg|jpeg|gif|webp)$/i.test(name)
                  return isImg ? (
                    <img key={i} src={link} alt={name} style={{ maxWidth: "100%", borderRadius: 12 }} />
                  ) : (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 8, background: "#F6F2EC", border: "1px solid #D6C4A8", borderRadius: 10, padding: "10px 14px", textDecoration: "none", color: "#2C2C2C", fontSize: 13 }}>
                      <span>📄</span><span>{name}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => onLike(post.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, border: `1.5px solid ${liked ? "#C97B4B" : "#D6C4A8"}`, background: liked ? "#C97B4B" : "transparent", color: liked ? "#fff" : "#8A7A6A", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              {liked ? "♥" : "♡"} {(post.likes_count || 0) + (liked ? 1 : 0)}
            </button>
            <span style={{ fontSize: 12, color: "#C0B0A0" }}>{liked ? "いいね済み" : "役に立ったらいいね"}</span>
          </div>

          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#2C2C2C", marginBottom: 14 }}>コメント {comments.length > 0 && `(${comments.length})`}</h4>
            {comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <Avatar name={c.author} size={28} />
                <div style={{ background: "#F6F2EC", borderRadius: 12, padding: "10px 14px", flex: 1 }}>
                  <p style={{ fontSize: 13, color: "#2C2C2C", lineHeight: 1.6 }}>{c.text}</p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitComment())}
                placeholder="コメントを入力..." style={{ flex: 1, background: "#F6F2EC", border: "1.5px solid #D6C4A8", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#2C2C2C", fontFamily: "inherit", outline: "none" }} />
              <button onClick={submitComment} style={{ padding: "10px 18px", background: "#8A6F4D", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>送信</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostForm({ onSubmit, onClose }: { onSubmit: (p: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ title: "", category: "learning", body: "", author: "" })
  const [tags, setTags] = useState<string[]>([])
  const [linkUrl, setLinkUrl] = useState("")
  const [linkLabel, setLinkLabel] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selected])
    selected.forEach(file => {
      const isImg = /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
      setPreviews(prev => [...prev, isImg ? URL.createObjectURL(file) : ""])
    })
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError("タイトルを入力してください")
    if (!form.body.trim())  return setError("本文を入力してください")
    if (!form.author.trim()) return setError("名前を入力してください")
    setError(""); setLoading(true)
    const supabase = createClient()
    const uploadedUrls: string[] = []
    for (const file of files) {
      const path = `${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from("post-images").upload(path, file, { contentType: file.type })
      if (upErr) { setLoading(false); return setError(`アップロード失敗: ${file.name}`) }
      const { data } = supabase.storage.from("post-images").getPublicUrl(path)
      uploadedUrls.push(`${file.name}::${data.publicUrl}`)
    }
    const linkPart = linkUrl ? `\n\n📎 [${linkLabel || linkUrl}](${linkUrl})` : ""
    const { data, error } = await supabase.from("posts").insert({
      title: form.title, body: form.body + linkPart, category: form.category,
      author_name: form.author, image_urls: uploadedUrls, likes_count: 0,
    }).select().single()
    setLoading(false)
    if (error) return setError("投稿に失敗しました")
    onSubmit(data)
  }

  const inp = "w-full bg-[#F6F2EC] border border-[#D6C4A8] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] outline-none"

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#2C2C2C70", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#FEFCF8", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 720, maxHeight: "94vh", overflow: "auto", padding: "0 0 48px", animation: "sheetUp .32s ease" }}>
        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: "#D6C4A8" }} />
        </div>
        <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#2C2C2C" }}>新しい投稿 ☕</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #D6C4A8", background: "#F6F2EC", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
        <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>TITLE *</label>
            <input className={inp} value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="タイトルを入力" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>CATEGORY *</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATS.filter(c => c.id !== "all").map(cat => (
                <button key={cat.id} onClick={() => setForm(p => ({...p, category: cat.id}))}
                  style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${form.category === cat.id ? "#8A6F4D" : "#D6C4A8"}`, background: form.category === cat.id ? "#8A6F4D" : "transparent", color: form.category === cat.id ? "#fff" : "#8A6F4D", cursor: "pointer", fontFamily: "inherit" }}>
                  {getCatMeta(cat.id).icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>BODY *</label>
            <textarea className={inp} style={{ minHeight: 140, resize: "vertical" }} value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} placeholder="内容を入力..." />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>📎 ファイル添付</label>
            <label style={{ display: "block", width: "100%", background: "#F6F2EC", border: "2px dashed #D6C4A8", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>📁</div>
              <p style={{ fontSize: 13, color: "#A09080" }}>クリックしてファイルを選択</p>
              <p style={{ fontSize: 11, color: "#C0B0A0", marginTop: 4 }}>PNG・JPG・PDF・DOCX・XLSX・PPTX（複数可）</p>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFiles} style={{ display: "none" }} />
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #EDE8E0", borderRadius: 10, padding: "10px 14px" }}>
                    {previews[i] ? <img src={previews[i]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>📄</span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#2C2C2C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: "#A09080" }}>{(file.size/1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => { setFiles(p => p.filter((_,j) => j !== i)); setPreviews(p => p.filter((_,j) => j !== i)) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#A09080", fontSize: 16 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>🔗 リンク添付（Google Drive・URL）</label>
            <input className={inp} style={{ marginBottom: 8 }} value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/... または任意のURL" />
            <input className={inp} value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="リンクの表示名（例：資料はこちら）" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>TAGS</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  style={{ padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1.5px solid ${tags.includes(tag) ? "#8A6F4D" : "#D6C4A8"}`, background: tags.includes(tag) ? "#8A6F4D" : "transparent", color: tags.includes(tag) ? "#fff" : "#8A6F4D", cursor: "pointer", fontFamily: "inherit" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8A6F4D", marginBottom: 6, letterSpacing: ".06em" }}>YOUR NAME *</label>
            <input className={inp} value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))} placeholder="投稿者名" />
          </div>
          {error && <p style={{ fontSize: 12, color: "#C97B4B" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#8A6F4D", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", opacity: loading ? .5 : 1 }}>
            {loading ? "投稿中..." : "投稿する ☕"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomeClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [liked, setLiked] = useState<string[]>([])
  const [cat, setCat] = useState("all")
  const [openPost, setOpenPost] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = (cat === "all" ? posts : posts.filter(p => p.category === cat))
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.author_name||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const popularLearning = [...posts].filter(p => p.category === "learning").sort((a,b) => (b.likes_count||0) - (a.likes_count||0)).slice(0,5)

  async function handleLike(id: string) {
    if (liked.includes(id)) return
    setLiked(p => [...p, id])
    const supabase = createClient()
    await supabase.from("likes").insert({ post_id: id, user_id: "anonymous" }).catch(() => {})
    setPosts(p => p.map(x => x.id === id ? {...x, likes_count: (x.likes_count||0)+1} : x))
    if (openPost?.id === id) setOpenPost((p: any) => ({...p, likes_count: (p.likes_count||0)+1}))
  }

  function handleNewPost(p: any) {
    setPosts(prev => [p, ...prev])
    setShowForm(false)
    setCat("all")
  }

  return (
    <div style={{ background: "#F6F2EC", minHeight: "100vh", fontFamily: "'Noto Sans JP', sans-serif", color: "#2C2C2C" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes sheetUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #D6C4A8; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#F6F2ECEE", backdropFilter: "blur(14px)", borderBottom: "1px solid #EDE8E0", padding: "12px 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#8A6F4D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>☕</div>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif" }}>Luana Commons</span>
          </div>
          <button onClick={() => setShowSearch(s => !s)} style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #D6C4A8", background: "#fff", cursor: "pointer", fontSize: 17 }}>🔍</button>
          <button onClick={() => setShowForm(true)} style={{ padding: "9px 18px", borderRadius: 10, background: "#8A6F4D", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>＋ 投稿</button>
        </div>
        {showSearch && (
          <div style={{ maxWidth: 720, margin: "10px auto 0" }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="記事を検索..."
              style={{ width: "100%", background: "#fff", border: "1.5px solid #D6C4A8", borderRadius: 12, padding: "11px 16px", fontSize: 14, color: "#2C2C2C", outline: "none", fontFamily: "inherit" }} />
          </div>
        )}
      </header>

      {/* Category Nav */}
      <div style={{ background: "#F6F2ECEE", backdropFilter: "blur(14px)", borderBottom: "1px solid #EDE8E0", position: "sticky", top: showSearch ? 110 : 60, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ padding: "14px 16px", background: "none", border: "none", borderBottom: cat === c.id ? "2px solid #8A6F4D" : "2px solid transparent", color: cat === c.id ? "#8A6F4D" : "#8A7A6A", fontWeight: cat === c.id ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>
        {cat === "all" && !search && (
          <>
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif", marginBottom: 14 }}>最近の投稿</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.slice(0,3).map((p: any) => <PostCard key={p.id} post={p} onClick={setOpenPost} />)}
              </div>
            </section>
            {popularLearning.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif" }}>今月の人気 Learning</h2>
                  <p style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>AI・トレンド・便利ツール</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {popularLearning.map((p: any, i: number) => (
                    <div key={p.id} onClick={() => setOpenPost(p)}
                      style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #EDE8E0", borderRadius: 14, padding: "12px 16px", cursor: "pointer" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: i < 3 ? "#C97B4B" : "#C0B0A0", width: 22, textAlign: "center" }}>{i+1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#2C2C2C", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.title}</p>
                        <p style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>{p.author_name} · ♡ {p.likes_count || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <div style={{ height: 1, background: "#EDE8E0", marginBottom: 28 }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif", marginBottom: 14 }}>すべての投稿</h2>
          </>
        )}

        {cat !== "all" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "18px 20px", background: getCatMeta(cat).bg, borderRadius: 18, border: `1px solid ${getCatMeta(cat).color}28` }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: getCatMeta(cat).color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{getCatMeta(cat).icon}</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#2C2C2C", fontFamily: "'Noto Serif JP', serif" }}>{CATS.find(c => c.id === cat)?.label}</h2>
              <p style={{ fontSize: 12, color: "#A09080" }}>{filtered.length} 件の投稿</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 0", color: "#C0B0A0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>☕</div>
                <p style={{ fontSize: 14 }}>まだ投稿がありません</p>
                <button onClick={() => setShowForm(true)} style={{ marginTop: 14, padding: "10px 20px", background: "#8A6F4D", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>最初に投稿する</button>
              </div>
            : filtered.map((p: any) => <PostCard key={p.id} post={p} onClick={setOpenPost} />)
          }
        </div>
      </main>

      {openPost && <PostSheet post={posts.find((p: any) => p.id === openPost.id) || openPost} onClose={() => setOpenPost(null)} onLike={handleLike} liked={liked.includes(openPost.id)} />}
      {showForm && <PostForm onSubmit={handleNewPost} onClose={() => setShowForm(false)} />}
    </div>
  )
}
