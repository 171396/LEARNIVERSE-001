import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Logo from '../components/Logo'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) setMessage({ type: 'error', text: error.message })
    else if (mode === 'signup')
      setMessage({
        type: 'note',
        text: 'Account created. If you were sent a confirmation email, open it, then log in.',
      })

    setLoading(false)
  }

  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="logo">
          <Logo />
        </div>
        <div>
          <h1>Where ideas find the people who can build them.</h1>
          <p>
            Learniverse is a community for founders, makers and learners across
            Africa.
          </p>
          <ul className="auth-points">
            <li>Post an idea and say who you need</li>
            <li>Get feedback in open discussions</li>
            <li>Learn from what others are building</li>
          </ul>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Log in to Learniverse' : 'Create your account'}</h2>
          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <small className="hint">At least 6 characters.</small>
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>
          {message && (
            <p className={message.type === 'error' ? 'form-error' : 'form-note'}>
              {message.text}
            </p>
          )}
          <p className="auth-switch">
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <button
              className="btn-link"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setMessage(null)
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
