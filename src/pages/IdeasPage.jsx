import { useState } from 'react'
import IdeaForm from '../components/IdeaForm'
import IdeasFeed from '../components/IdeasFeed'

export default function IdeasPage({ userId }) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Got an idea? Put it in front of the people who can build it.</h1>
            <p>
              Share what you're making, say who you need, and get honest feedback
              from founders, makers and learners across Africa.
            </p>
          </div>
          <IdeaForm userId={userId} onPosted={() => setRefreshKey((k) => k + 1)} />
        </div>
      </section>

      <section className="container section">
        <IdeasFeed refreshKey={refreshKey} />
      </section>
    </>
  )
}
