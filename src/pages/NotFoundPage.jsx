import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="page-main">
      <div className="empty-state not-found">
        <p className="error-code">404</p>
        <h1>That page wandered off</h1>
        <p>The address may be incorrect, or the page may have moved.</p>
        <Link className="primary-button" to="/">Return home</Link>
      </div>
    </main>
  )
}
