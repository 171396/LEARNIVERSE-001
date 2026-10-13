import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import IdeasPage from './pages/IdeasPage'
import IdeaPage from './pages/IdeaPage'
import ResourcesPage from './pages/ResourcesPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import Logo from './components/Logo'
import Footer from './components/Footer'

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

  const userId = session?.user.id
  const member = (page) => (session ? page : <Navigate to="/login" replace />)

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/ideas" replace /> : <AuthPage />}
      />
      <Route
        path="*"
        element={
          <>
            <header className="site-header">
              <div className="container header-inner">
                <Link to="/" className="logo">
                  <Logo />
                </Link>
                <nav className="nav" aria-label="Main">
                  <NavLink to="/" end className={navClass}>Home</NavLink>
                  {session && <NavLink to="/ideas" className={navClass}>Ideas</NavLink>}
                  {session && <NavLink to="/resources" className={navClass}>Resources</NavLink>}
                  {session && (
                    <NavLink to={`/profile/${userId}`} end className={navClass}>Profile</NavLink>
                  )}
                  <NavLink to="/about" className={navClass}>About</NavLink>
                </nav>
                <div className="header-user">
                  {session ? (
                    <>
                      <span>{session.user.email}</span>
                      <button className="btn btn-small" onClick={() => supabase.auth.signOut()}>
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link className="btn btn-small" to="/login">Log in</Link>
                      <Link className="btn btn-primary btn-small" to="/login?mode=signup">Join</Link>
                    </>
                  )}
                </div>
              </div>
            </header>

            <Routes>
              <Route path="/" element={<HomePage session={session} />} />
              <Route path="/ideas" element={member(<IdeasPage userId={userId} />)} />
              <Route path="/idea/:id" element={member(<IdeaPage userId={userId} />)} />
              <Route path="/resources" element={member(<ResourcesPage userId={userId} />)} />
              <Route path="/profile/:id" element={member(<ProfilePage userId={userId} />)} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            <Footer />
          </>
        }
      />
    </Routes>
  )
}
