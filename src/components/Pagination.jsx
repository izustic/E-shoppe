export default function Pagination({ currentPage, totalPages, loading, onChange }) {
  const progress = totalPages > 1 ? ((currentPage - 1) / (totalPages - 1)) * 100 : 0

  return (
    <nav className="pagination" aria-label="Product pages">
      <ol className="progress-container">
        <li className="progress" style={{ width: `${progress}%` }} aria-hidden="true" />
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1
          return (
            <li key={page}>
              <button
                type="button"
                className={`circle${page <= currentPage ? ' active' : ''}`}
                aria-current={page === currentPage ? 'page' : undefined}
                disabled={loading}
                onClick={() => onChange(page)}
              >
                {page}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="progress-buttons">
        <button className="btn" type="button" disabled={loading || currentPage === 1} onClick={() => onChange(currentPage - 1)}>Prev</button>
        <button className="btn" type="button" disabled={loading || currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>Next</button>
      </div>
    </nav>
  )
}
