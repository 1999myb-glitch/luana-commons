import { createClient } from '@/lib/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/supabase/auth'
import HomeClient from './HomeClient'

export default async function Home(props: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const [{ data: posts }, { data: meetings }] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('meetings').select('*').order('created_at', { ascending: false }),
  ])

  const { user, profile } = await getCurrentUserAndProfile(supabase)
  const currentUser = user
    ? { id: user.id, displayName: profile?.display_name || '', isAdmin: !!profile?.is_admin }
    : null

  return <HomeClient initialPosts={posts || []} initialMeetings={meetings || []} currentUser={currentUser} />
}
