import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { hueFor } from '../hue'

export default function IdeasFeed({ refreshKey }) {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) setError(error.message)
      else setIdeas(data)
      setLoading(false)
    }
    load()
  }, [refreshKey])

  return (
    <>
      <div className="section-head">
        <h2>Fresh ideas</h2>
        <p>Open an idea to read more and join the discussion.</p>
      </div>

      {loading && <p className="empty">Loading ideas...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && ideas.length === 0 && (
        <p className="empty">
          No ideas yet. Post the first one and tell people who you need.
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
              <span className="foot-date">
                {new Date(idea.created_at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
