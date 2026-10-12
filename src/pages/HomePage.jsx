import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { hueFor } from '../hue'

const EXAMPLES = [
  { title: 'A stock book for market traders', need: 'a mobile developer', hue: 'hue-1' },
  { title: 'Weekend coding club for high schoolers', need: 'volunteer mentors', hue: 'hue-0' },
  { title: 'Tote bags from recycled fabric', need: 'a designer and a seller', hue: 'hue-2' },
]

const CATEGORIES = ['Learn', 'Research', 'Templates', 'Funding', 'Launch']

export default function HomePage({ session }) {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setIdeas(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Where ideas find the people who can build them.</h1>
            <p>
              Share what you're making, say who you need, and get honest feedback
              from founders, makers and learners across Africa.
            </p>
            <div className="hero-cta">
              {session ? (
                <>
                  <Link className="btn btn-light" to="/ideas">Pitch an idea</Link>
                  <Link className="btn btn-outline-light" to="/resources">Explore resources</Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-light" to="/login?mode=signup">Join Learniverse</Link>
                  <a className="btn btn-outline-light" href="#how">See how it works</a>
                </>
              )}
            </div>
          </div>

          <div className="stack" role="img" aria-label="Three example ideas, each with who they are looking for">
            {EXAMPLES.map((ex) => (
              <div key={ex.title} className={`mini ${ex.hue}`}>
                <strong>{ex.title}</strong>
                <span>Looking for: {ex.need}</span>
              </div>
            ))}
            <small className="stack-note">Example ideas</small>
          </div>
        </div>
      </section>

      <section id="how" className="container section tight">
        <div className="section-head">
          <h2>How Learniverse works</h2>
          <p>From a rough thought to a plan, in three steps.</p>
        </div>
        <div className="how">
          <div className="how-step hue-0">
            <span className="step-num">1</span>
            <h3>Post your idea</h3>
            <p>Describe it in plain words and say who you need: a developer, a designer, a mentor or funding.</p>
          </div>
          <div className="how-step hue-1">
            <span className="step-num">2</span>
            <h3>Get real feedback</h3>
            <p>Members reply in threads with questions, advice and offers to help.</p>
          </div>
          <div className="how-step hue-3">
            <span className="step-num">3</span>
            <h3>Research and build</h3>
            <p>Use the Resources centre to test your thinking, then take the next step.</p>
          </div>
        </div>
      </section>

      <section className="container section tight">
        <div className="section-head section-head-row">
          <div>
            <h2>Latest ideas</h2>
            <p>Fresh from the community.</p>
          </div>
          <Link to="/ideas">See all ideas</Link>
        </div>

        {loading && <p className="empty">Loading ideas...</p>}
        {!loading && ideas.length === 0 && (
          <p className="empty">
            No ideas yet. <Link to={session ? '/ideas' : '/login?mode=signup'}>Pitch the first one.</Link>
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
      </section>

      <section className="container section tight">
        <div className="band">
          <div>
            <h2>Research before you build</h2>
            <p>
              Courses, data, templates and funding links, gathered in one place to
              help you test an idea and plan your next move.
            </p>
            <Link className="btn btn-primary" to="/resources">Open the Resources centre</Link>
          </div>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <Link key={c} className="chip-link" to="/resources">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section tight">
        <div className="cta-band">
          <h2>Ready to share what you're building?</h2>
          {session ? (
            <Link className="btn btn-light" to="/ideas">Pitch an idea</Link>
          ) : (
            <Link className="btn btn-light" to="/login?mode=signup">Join Learniverse</Link>
          )}
        </div>
      </section>
    </>
  )
}
