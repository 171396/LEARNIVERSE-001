import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <>
      <section className="hero">
        <div className="container page-head">
          <h1>About Learniverse</h1>
          <p>
            A community where people with ideas meet the people who can help
            build them.
          </p>
        </div>
      </section>

      <main className="container-narrow section">
        <div className="panel">
          <h2>Why it exists</h2>
          <p>
            Many people have good ideas but do not know how to shape them into
            something real, or who to ask for help. Learniverse gives those ideas
            a place to be seen, questioned and improved.
          </p>
          <p>
            It is built for entrepreneurs, students, creatives and startup
            builders across Africa.
          </p>
        </div>

        <div className="panel">
          <h2>How it works</h2>
          <ol className="steps">
            <li>Post your idea and say who you are looking for.</li>
            <li>Members read it and reply with feedback, questions or offers to help.</li>
            <li>Use the Resources centre to research, plan and take the next step.</li>
          </ol>
        </div>

        <div className="panel">
          <h2>Community guidelines</h2>
          <ul className="steps">
            <li>Give feedback that is specific and kind.</li>
            <li>Credit other people's work and ideas.</li>
            <li>Keep it relevant. No spam or unrelated promotion.</li>
            <li>Share resources you have actually used.</li>
          </ul>
        </div>

        <p>
          <Link className="btn btn-primary" to="/ideas">Browse ideas</Link>{' '}
          <Link className="btn" to="/resources">Open the Resources centre</Link>
        </p>
      </main>
    </>
  )
}
