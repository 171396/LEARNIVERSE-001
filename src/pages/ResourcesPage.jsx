import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIES = ['Learn', 'Research', 'Templates', 'Funding', 'Launch']
const HUES = {
  Learn: 'hue-0',
  Research: 'hue-3',
  Templates: 'hue-1',
  Funding: 'hue-2',
  Launch: 'hue-0',
}

function SuggestForm({ userId, onDone, onCancel }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('resources').insert({
      user_id: userId,
      title,
      url,
      description,
      category,
    })

    if (error) setError(error.message)
    else onDone()
    setLoading(false)
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Suggest a resource</h2>
      <div className="form-row">
        <label className="field">
          <span>Title</span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Category</span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Link</span>
        <input
          className="input"
          type="url"
          placeholder="https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>What will people learn from it?</span>
        <textarea
          className="input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Add resource'}
      </button>{' '}
      <button className="btn" type="button" onClick={onCancel}>
        Cancel
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

export default function ResourcesPage({ userId }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setResources(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemove(id) {
    if (!window.confirm('Remove this resource?')) return
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) alert(error.message)
    else load()
  }

  const search = query.trim().toLowerCase()
  const shown = resources.filter(
    (r) =>
      (category === 'All' || r.category === category) &&
      `${r.title} ${r.description}`.toLowerCase().includes(search)
  )

  return (
    <>
      <section className="hero">
        <div className="container page-head">
          <h1>Resources centre</h1>
          <p>
            Courses, data, templates and funding links to help you research your
            idea and take the next step.
          </p>
        </div>
      </section>

      <section className="container section">
        {showForm && (
          <SuggestForm
            userId={userId}
            onDone={() => {
              setShowForm(false)
              load()
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="toolbar">
          <input
            className="input search"
            type="search"
            aria-label="Search resources"
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Suggest a resource
            </button>
          )}
        </div>

        <div className="chips" role="group" aria-label="Filter by category">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="empty">Loading resources...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && shown.length === 0 && (
          <p className="empty">
            Nothing matches your search. Try another word or category, or suggest
            a resource.
          </p>
        )}

        <div className="idea-grid">
          {shown.map((r) => (
            <article key={r.id} className={`idea-card ${HUES[r.category]}`}>
              <div className="idea-card-body">
                <h3>{r.title}</h3>
                <p className="resource-desc">{r.description}</p>
              </div>
              <div className="idea-card-foot">
                <span className="foot-label">{r.category}</span>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  Open resource
                </a>
                {r.user_id === userId && (
                  <button
                    className="btn-link"
                    style={{ textAlign: 'left' }}
                    onClick={() => handleRemove(r.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
