import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/ideas">Ideas</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/about">About</Link>
        </nav>
        <small>© {new Date().getFullYear()} Learniverse</small>
      </div>
    </footer>
  )
}
