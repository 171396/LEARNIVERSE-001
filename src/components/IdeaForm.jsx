import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function IdeaForm({ userId, onPosted }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('ideas').insert({
      user_id: userId,
      title,
      description,
      looking_for: lookingFor || null,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setDescription('')
      setLookingFor('')
      onPosted()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Share an idea</h2>
      <input
        placeholder="Idea title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ display: 'block', width: '100%', marginBottom: 12 }}
      />
      <textarea
        placeholder="Describe your idea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={4}
        style={{ display: 'block', width: '100%', marginBottom: 12 }}
      />
      <input
        placeholder="Looking for (e.g. a developer, a designer, funding)"
        value={lookingFor}
        onChange={(e) => setLookingFor(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post idea'}
      </button>
      {error && <p>{error}</p>}
    </form>
  )
}
