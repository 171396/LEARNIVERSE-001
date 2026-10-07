import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AuthPage from './pages/AuthPage'
import IdeaForm from './components/IdeaForm'
import IdeasFeed from './components/IdeasFeed'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', textAlign: 'left' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Learniverse</h1>
        <div>
          <small>{session.user.email}</small>{' '}
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </header>

      <IdeaForm userId={session.user.id} onPosted={() => setRefreshKey((k) => k + 1)} />
      <IdeasFeed refreshKey={refreshKey} />
    </div>
  )
}
