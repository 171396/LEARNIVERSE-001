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
    <form className="pitch" onSubmit={handleSubmit}>
      <h2>Pitch your idea</h2>
      <label className="field">
        <span>Idea title</span>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>What is it?</span>
        <textarea
          className="input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Who do you need?</span>
        <input
          className="input"
          placeholder="A developer, a designer, a mentor, funding..."
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
        />
        <small className="hint">Optional. Tell people how they can help.</small>
      </label>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post idea'}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}
