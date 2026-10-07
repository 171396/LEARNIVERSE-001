import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AuthPage from './pages/AuthPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!ready) return <p>Loading...</p>
  if (!session) return <AuthPage />

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto' }}>
      <h1>Welcome to Learniverse</h1>
      <p>Logged in as {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Log out</button>
    </div>
  )
}
