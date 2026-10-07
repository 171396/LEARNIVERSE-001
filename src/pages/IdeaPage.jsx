import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Comments from '../components/Comments'

export default function IdeaPage({ userId }) {
  const { id } = useParams()
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) setError('Idea not found.')
      else setIdea(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <Link to="/">← Back to ideas</Link>
      <h2>{idea.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{idea.description}</p>
      {idea.looking_for && (
        <p>
          <strong>Looking for:</strong> {idea.looking_for}
        </p>
      )}
      <small>{new Date(idea.created_at).toLocaleDateString()}</small>
      <hr style={{ margin: '24px 0' }} />
      <Comments ideaId={idea.id} userId={userId} />
    </div>
  )
}
