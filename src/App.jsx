import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AuthPage from './pages/AuthPage'
import IdeaPage from './pages/IdeaPage'
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
        <h1>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Learniverse
          </Link>
        </h1>
        <div>
          <small>{session.user.email}</small>{' '}
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <IdeaForm userId={session.user.id} onPosted={() => setRefreshKey((k) => k + 1)} />
              <IdeasFeed refreshKey={refreshKey} />
            </>
          }
        />
        <Route path="/idea/:id" element={<IdeaPage userId={session.user.id} />} />
      </Routes>
    </div>
  )
}
