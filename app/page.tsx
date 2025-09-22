import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function IndexPage() {
  // 👇 CAMBIO 2: Llama a createClient() sin 'await'
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  redirect(session ? '/dashboard' : '/login')
}