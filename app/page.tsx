import { createClient } from '@/lib/supabase/server'

const cats = [
  { id: 'all', label: 'All' },
  { id: 'notice', label: 'お知らせ' },
  { id: 'project', label: 'プロジェクト' },
  { id: 'learning', label: 'Learning' },
  { id: 'meeting', label: 'Meeting Notes' },
  { id: 'knowledge', label: 'Knowledge Base' },
]

export default async function Home(props: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const params = await props.searchParams
  const category = params.category

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: posts } = await query

  return (
    <main className="min-h-screen bg-[#F6F2EC]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8A6F4D] flex items-center justify-center text-white text-sm">☕</div>
          <h1 className="text-lg font-black text-[#2C2C2C]">Luana Commons</h1>
        </header>
        <nav className="flex gap-0 overflow-x-auto border-b border-[#EDE8E0] mb-6">
          {cats.map((cat) => (
            <a key={cat.id} href={`/?category=${cat.id}`} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${(category || 'all') === cat.id ? 'border-[#8A6F4D] text-[#8A6F4D] font-bold' : 'border-transparent text-[#8A7A6A]'}`}>
              {cat.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="bg-white border border-[#EDE8E0] rounded-2xl p-5">
                <div className="text-xs font-bold text-[#8A6F4D] mb-2">{post.category}</div>
                <h2 className="text-sm font-bold text-[#2C2C2C] leading-relaxed mb-3">{post.title}</h2>
                <div className="flex items-center gap-2 text-xs text-[#A09080]">
                  <span>{post.author_name}</span>
                  <span>·</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-16 text-[#C0B0A0]">
              <div className="text-4xl mb-3">☕</div>
              <p className="text-sm">まだ投稿がありません</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
