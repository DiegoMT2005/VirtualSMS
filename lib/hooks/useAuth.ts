import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'client_admin' | 'viewer';
  client_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router])

  return { user, loading }
}

export function useUserProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) {
        // If no user is logged in, return a default profile for demo purposes
        return {
          id: 'demo-user',
          email: 'demo@example.com',
          role: 'client_admin' as const,
          client_id: process.env.NEXT_PUBLIC_DEFAULT_CLIENT_ID || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // If user_profiles table doesn't exist or user has no profile, use default
      if (error || !data) {
        return {
          id: user.id,
          email: user.email || 'user@example.com',
          role: 'client_admin' as const,
          client_id: process.env.NEXT_PUBLIC_DEFAULT_CLIENT_ID || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      return data as UserProfile
    },
    enabled: true, // Always enabled, will use default if no user
  })
}

export function useSignOut() {
  const router = useRouter()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return { signOut }
}
