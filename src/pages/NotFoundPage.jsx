import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="container-narrow section">
      <h1>Page not found</h1>
      <p style={{ margin: '1rem 0' }}>
        This page does not exist, or it has moved.
      </p>
      <Link className="btn btn-primary" to="/">Go to the home page</Link>
    </main>
  )
}
