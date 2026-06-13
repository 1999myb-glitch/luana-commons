import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export default async function Home(props: {
  searchParams: Promise<{ category?: string }>
}) {
  let posts: Record<string, unknown>[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    posts = data || []
  } catch {
    posts = []
  }

  return <HomeClient initialPosts={posts} />
}
