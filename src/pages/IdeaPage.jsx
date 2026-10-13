import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { hueFor } from '../hue'
import { useProfiles } from '../useProfiles'
import Comments from '../components/Comments'

export default function IdeaPage({ userId }) {
  const { id } = useParams()
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const profiles = useProfiles([idea?.user_id])

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) setError('This idea could not be found. It may have been deleted.')
      else setIdea(data)
      setLoading(false)
    }
    load()
  }, [id])

  const author = idea ? profiles[idea.user_id]?.display_name || 'New member' : ''

  return (
    <main className="container-narrow">
      <Link className="back-link" to="/ideas">Back to ideas</Link>

      {loading && <p className="empty">Loading...</p>}
      {error && <p className="empty">{error}</p>}

      {idea && (
        <>
          <article className={`idea-panel ${hueFor(idea.id)}`}>
            <h1>{idea.title}</h1>
            <p className="idea-body">{idea.description}</p>
            {idea.looking_for && (
              <p className="looking-for">
                <strong>Looking for:</strong> {idea.looking_for}
              </p>
            )}
            <p className="meta">
              Posted by <Link to={`/profile/${idea.user_id}`}>{author}</Link> on{' '}
              {new Date(idea.created_at).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </article>

          <Comments ideaId={idea.id} userId={userId} />
        </>
      )}
    </main>
  )
}
