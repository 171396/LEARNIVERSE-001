import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { hueFor } from '../hue'
import { useProfiles } from '../useProfiles'

function CommentForm({ ideaId, userId, parentId, placeholder, submitLabel, onDone, onCancel }) {
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
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="input"
        aria-label={placeholder}
        placeholder={placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
      />
      <button className="btn btn-primary btn-small" type="submit" disabled={loading}>
        {loading ? 'Posting...' : submitLabel}
      </button>{' '}
      {onCancel && (
        <button className="btn btn-small" type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

function CommentNode({ comment, childrenMap, profiles, ideaId, userId, onChanged }) {
  const [replying, setReplying] = useState(false)
  const replies = childrenMap[comment.id] || []
  const mine = comment.user_id === userId
  const name = profiles[comment.user_id]?.display_name || 'New member'

  async function handleDelete() {
    if (!window.confirm('Delete this comment and all its replies?')) return
    const { error } = await supabase.from('comments').delete().eq('id', comment.id)
    if (error) alert(error.message)
    else onChanged()
  }

  return (
    <div className="comment">
      <div className="comment-box">
        <div className={`avatar ${hueFor(comment.user_id)}`} aria-hidden="true">
          {name[0].toUpperCase()}
        </div>
        <div className="comment-main">
          <div className="comment-head">
            <Link to={`/profile/${comment.user_id}`}>{mine ? `${name} (you)` : name}</Link>
            <time dateTime={comment.created_at}>
              {new Date(comment.created_at).toLocaleString(undefined, {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
          <p className="comment-text">{comment.body}</p>
          <div className="comment-actions">
            <button className="btn btn-small" onClick={() => setReplying(!replying)}>
              {replying ? 'Close' : 'Reply'}
            </button>
            {mine && (
              <button className="btn btn-small" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {replying && (
        <div className="reply-form-wrap">
          <CommentForm
            ideaId={ideaId}
            userId={userId}
            parentId={comment.id}
            placeholder="Write a reply..."
            submitLabel="Post reply"
            onDone={() => {
              setReplying(false)
              onChanged()
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="replies">
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              childrenMap={childrenMap}
              profiles={profiles}
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

  const profiles = useProfiles(comments.map((c) => c.user_id))

  const childrenMap = {}
  comments.forEach((c) => {
    const key = c.parent_id || 'root'
    if (!childrenMap[key]) childrenMap[key] = []
    childrenMap[key].push(c)
  })
  const topLevel = childrenMap['root'] || []

  return (
    <section className="discussion">
      <h2>Discussion ({comments.length})</h2>
      <CommentForm
        ideaId={ideaId}
        userId={userId}
        parentId={null}
        placeholder="Share feedback, ask a question or offer to help..."
        submitLabel="Post comment"
        onDone={load}
      />
      {loading && <p className="empty">Loading comments...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && topLevel.length === 0 && (
        <p className="empty">No comments yet. Start the discussion.</p>
      )}
      {topLevel.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          childrenMap={childrenMap}
          profiles={profiles}
          ideaId={ideaId}
          userId={userId}
          onChanged={load}
        />
      ))}
    </section>
  )
}
