import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import IdeaPage from './pages/IdeaPage'
import ResourcesPage from './pages/ResourcesPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import Logo from './components/Logo'

const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

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

  if (!ready) return <p className="container section">Loading...</p>
  if (!session) return <AuthPage />

  const userId = session.user.id

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <Logo />
          </Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end className={navClass}>Ideas</NavLink>
            <NavLink to="/resources" className={navClass}>Resources</NavLink>
            <NavLink to="/about" className={navClass}>About</NavLink>
          </nav>
          <div className="header-user">
            <span>{session.user.email}</span>
            <button className="btn btn-small" onClick={() => supabase.auth.signOut()}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage userId={userId} />} />
        <Route path="/idea/:id" element={<IdeaPage userId={userId} />} />
        <Route path="/resources" element={<ResourcesPage userId={userId} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
