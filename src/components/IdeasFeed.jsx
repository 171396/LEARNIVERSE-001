import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

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

  if (loading) return <p>Loading ideas...</p>
  if (error) return <p>{error}</p>
  if (ideas.length === 0) return <p>No ideas yet. Be the first to post one.</p>

  return (
    <div>
      <h2>Ideas</h2>
      {ideas.map((idea) => (
        <div
          key={idea.id}
          style={{ border: '1px solid #555', borderRadius: 8, padding: 16, marginBottom: 16 }}
        >
          <h3 style={{ marginTop: 0 }}>{idea.title}</h3>
          <p>{idea.description}</p>
          {idea.looking_for && (
            <p>
              <strong>Looking for:</strong> {idea.looking_for}
            </p>
          )}
          <small>{new Date(idea.created_at).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  )
}
