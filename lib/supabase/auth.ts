import { SupabaseClient } from '@supabase/supabase-js'

export interface CurrentProfile {
  display_name: string
  is_admin: boolean
}

export async function getCurrentUserAndProfile(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, is_admin')
    .eq('id', user.id)
    .single()

  return { user, profile: profile as CurrentProfile | null }
}
