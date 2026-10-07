import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function CommentForm({ ideaId, userId, parentId, placeholder, onDone, onCancel }) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('comments').insert({
      idea_id: ideaId,
      user_id: userId,
      parent_id: parentId,
      body,
    })

    if (error) setError(error.message)
    else {
      setBody('')
      onDone()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ margin: '8px 0' }}>
      <textarea
        placeholder={placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        style={{ display: 'block', width: '100%', marginBottom: 8 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>{' '}
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      {error && <p>{error}</p>}
    </form>
  )
}

function CommentNode({ comment, childrenMap, ideaId, userId, onChanged }) {
  const [replying, setReplying] = useState(false)
  const replies = childrenMap[comment.id] || []

  async function handleDelete() {
    if (!window.confirm('Delete this comment and all its replies?')) return
    const { error } = await supabase.from('comments').delete().eq('id', comment.id)
    if (error) alert(error.message)
    else onChanged()
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ border: '1px solid #444', borderRadius: 8, padding: 12 }}>
        <p style={{ margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>{comment.body}</p>
        <small>
          {comment.user_id === userId ? 'You' : 'Member'} ·{' '}
          {new Date(comment.created_at).toLocaleString()}
        </small>{' '}
        <button onClick={() => setReplying(!replying)}>Reply</button>{' '}
        {comment.user_id === userId && <button onClick={handleDelete}>Delete</button>}
      </div>

      {replying && (
        <div style={{ marginLeft: 24 }}>
          <CommentForm
            ideaId={ideaId}
            userId={userId}
            parentId={comment.id}
            placeholder="Write a reply..."
            onDone={() => {
              setReplying(false)
              onChanged()
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div style={{ marginLeft: 24, borderLeft: '2px solid #444', paddingLeft: 12 }}>
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              childrenMap={childrenMap}
              ideaId={ideaId}
              userId={userId}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Comments({ ideaId, userId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setComments(data)
    setLoading(false)
  }, [ideaId])

  useEffect(() => {
    load()
  }, [load])

  const childrenMap = {}
  comments.forEach((c) => {
    const key = c.parent_id || 'root'
    if (!childrenMap[key]) childrenMap[key] = []
    childrenMap[key].push(c)
  })
  const topLevel = childrenMap['root'] || []

  return (
    <div>
      <h2>Discussion ({comments.length})</h2>
      <CommentForm
        ideaId={ideaId}
        userId={userId}
        parentId={null}
        placeholder="Share your thoughts, feedback or offer to help..."
        onDone={load}
      />
      {loading && <p>Loading comments...</p>}
      {error && <p>{error}</p>}
      {!loading && topLevel.length === 0 && <p>No comments yet. Start the discussion.</p>}
      {topLevel.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          childrenMap={childrenMap}
          ideaId={ideaId}
          userId={userId}
          onChanged={load}
        />
      ))}
    </div>
  )
}
