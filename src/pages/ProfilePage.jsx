import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { hueFor } from '../hue'

const DEFAULT_NAME = 'New member'

function ProfileForm({ userId, profile, isNew, onSaved, onCancel }) {
  const [form, setForm] = useState({
    display_name: profile?.display_name === DEFAULT_NAME ? '' : profile?.display_name || '',
    headline: profile?.headline || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    skills: profile?.skills || '',
    website: profile?.website || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: form.display_name.trim(),
      headline: form.headline.trim() || null,
      location: form.location.trim() || null,
      bio: form.bio.trim() || null,
      skills: form.skills.trim() || null,
      website: form.website.trim() || null,
    })

    if (error) setError(error.message)
    else onSaved()
    setLoading(false)
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>{isNew ? 'Set up your profile' : 'Edit your profile'}</h2>
      {isNew && (
        <p>Add your name so people know who is replying to them and who is behind each idea.</p>
      )}
      <div className="form-row">
        <label className="field">
          <span>Your name</span>
          <input
            className="input"
            value={form.display_name}
            onChange={set('display_name')}
            maxLength={40}
            required
          />
        </label>
        <label className="field">
          <span>Location</span>
          <input
            className="input"
            placeholder="Nakuru, Kenya"
            value={form.location}
            onChange={set('location')}
            maxLength={60}
          />
        </label>
      </div>
      <label className="field">
        <span>Headline</span>
        <input
          className="input"
          placeholder="Founder, designer, student, mentor..."
          value={form.headline}
          onChange={set('headline')}
          maxLength={80}
        />
      </label>
      <label className="field">
        <span>About you</span>
        <textarea
          className="input"
          rows={4}
          value={form.bio}
          onChange={set('bio')}
          maxLength={500}
        />
        <small className="hint">What you work on and what you want to learn. Up to 500 characters.</small>
      </label>
      <label className="field">
        <span>Skills</span>
        <input
          className="input"
          placeholder="Web design, marketing, Python"
          value={form.skills}
          onChange={set('skills')}
          maxLength={200}
        />
        <small className="hint">Separate them with commas.</small>
      </label>
      <label className="field">
        <span>Website</span>
        <input
          className="input"
          type="url"
          placeholder="https://"
          value={form.website}
          onChange={set('website')}
        />
      </label>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save profile'}
      </button>{' '}
      {!isNew && (
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

export default function ProfilePage({ userId }) {
  const { id } = useParams()
  const isMe = id === userId
  const [profile, setProfile] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    const [{ data: p }, { data: i }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('ideas')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false }),
    ])
    setProfile(p)
    setIdeas(i || [])
    setEditing(isMe && (!p || p.display_name === DEFAULT_NAME))
    setLoading(false)
  }, [id, isMe])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  if (loading) return <p className="container section">Loading...</p>

  if (!profile && !isMe) {
    return (
      <main className="container-narrow section">
        <p className="empty">This member could not be found.</p>
      </main>
    )
  }

  const name = profile?.display_name || DEFAULT_NAME
  const isNew = isMe && name === DEFAULT_NAME
  const skills = (profile?.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const safeWebsite = profile?.website && /^https?:\/\//i.test(profile.website)

  return (
    <main className={`container-narrow section ${hueFor(id)}`}>
      <div className="profile-head">
        <div className="profile-avatar" aria-hidden="true">
          {name[0].toUpperCase()}
        </div>
        <div className="profile-id">
          <h1>{name}</h1>
          {profile?.headline && <p className="profile-headline">{profile.headline}</p>}
          <p className="profile-meta">
            {profile?.location && <span>{profile.location}</span>}
            {safeWebsite && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
            {profile?.created_at && (
              <span>
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </p>
        </div>
        {isMe && !editing && (
          <button className="btn btn-small edit-btn" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        )}
      </div>

      {editing ? (
        <ProfileForm
          userId={userId}
          profile={profile}
          isNew={isNew}
          onSaved={load}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="panel">
            <h2>About</h2>
            {profile?.bio ? (
              <p style={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
            ) : (
              <p>
                {isMe
                  ? 'Add a short bio so people know what you work on.'
                  : 'This member has not added a bio yet.'}
              </p>
            )}
            {skills.length > 0 && (
              <ul className="skills" aria-label="Skills">
                {skills.map((s) => (
                  <li key={s} className="skill">{s}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="section-head">
            <h2>Ideas by {isMe ? 'you' : name}</h2>
            <p>
              {ideas.length === 0
                ? isMe
                  ? 'You have not posted an idea yet.'
                  : 'No ideas posted yet.'
                : `${ideas.length} posted so far.`}
            </p>
          </div>

          {isMe && ideas.length === 0 && (
            <p>
              <Link className="btn btn-primary" to="/ideas">Pitch your first idea</Link>
            </p>
          )}

          <div className="idea-grid">
            {ideas.map((idea) => (
              <article key={idea.id} className={`idea-card ${hueFor(idea.id)}`}>
                <div className="idea-card-body">
                  <h3>
                    <Link to={`/idea/${idea.id}`}>{idea.title}</Link>
                  </h3>
                  <p className="excerpt">{idea.description}</p>
                </div>
                <div className="idea-card-foot">
                  <span className="foot-label">
                    {idea.looking_for ? 'Looking for' : 'Open to any help'}
                  </span>
                  {idea.looking_for && <span>{idea.looking_for}</span>}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
