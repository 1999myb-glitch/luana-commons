import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export default async function Home(props: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return <HomeClient initialPosts={posts || []} />
}
