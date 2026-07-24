import { useEffect, useState } from 'react'

const products = [
  'hat1.png', 'hat2.png', 'hat3.png',
  'shoe1.png', 'shoe2.png', 'shoe3.png',
  'sneaker1.png', 'sneaker2.png', 'sneaker3.png',
  'shirt1.png', 'shirt2.png', 'shirt3.png',
  'denim1.png', 'denim2.png', 'denim3.png',
  'hat4.png', 'hat5.png', 'hat6.png',
]

const featuredProducts = ['sneaker4.png', 'sneaker6.png', 'sneaker5.png']
const pageSize = 6

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 220)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`nav${scrolled ? ' active' : ''}`}>
      <div className="container">
        <h1 className="logo">
          <a href="#top" onClick={closeMenu} aria-label="Trolley Dey home">
            <img
              src={scrolled ? '/images/logo-dark.png' : '/images/logo-light.png'}
              alt="Trolley Dey"
            />
          </a>
        </h1>
        <button
          className="checkbtn"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </button>
        <ul className={menuOpen ? 'menu-open' : ''}>
          <li><a href="#top" className="current" onClick={closeMenu}>Home</a></li>
          <li><a href="#items" onClick={closeMenu}>Items</a></li>
          <li><a href="#products" onClick={closeMenu}>Products</a></li>
          <li><a href="#footer" onClick={closeMenu}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}

function ProductCard({ image, loading }) {
  const [added, setAdded] = useState(false)

  if (loading) {
    return (
      <article className="card" aria-busy="true">
        <div className="card-header animated-bg">&nbsp;</div>
        <div className="card-content">
          <h3 className="card-title animated-bg animated-bg-text">&nbsp;</h3>
          <p className="card-excerpt">
            <span className="span animated-bg animated-bg-text">&nbsp;</span>
            <span className="span animated-bg animated-bg-text">&nbsp;</span>
            <span className="span animated-bg animated-bg-text">&nbsp;</span>
          </p>
          <div className="author">
            <div className="profile-img animated-bg">&nbsp;</div>
            <div className="author-info">
              <strong className="animated-bg animated-bg-text">&nbsp;</strong>
              <small className="animated-bg animated-bg-text">&nbsp;</small>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="card">
      <div className="card-header">
        <img src={`/images/${image}`} alt="Trolley Dey product" />
      </div>
      <div className="card-content">
        <h3 className="card-title">Lorem ipsum dolor sit amet.</h3>
        <p className="card-excerpt">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Praesentium</p>
        <div className="author">
          <button className="profile-img cart-action" type="button" aria-label="Add item to cart" onClick={() => setAdded(true)}>
            <i className="ri-shopping-cart-2-line" aria-hidden="true" />
          </button>
          <div className="author-info">
            <button className={`cart-label${added ? ' added' : ''}`} type="button" onClick={() => setAdded(true)}>
              {added ? 'Added!' : 'Add to Cart'}
            </button>
            <small>Jan 15, 2023</small>
          </div>
        </div>
      </div>
    </article>
  )
}

function Pagination({ currentPage, totalPages, onChange }) {
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
                onClick={() => onChange(page)}
              >
                {page}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="progress-buttons">
        <button className="btn" type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>Prev</button>
        <button className="btn" type="button" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>Next</button>
      </div>
    </nav>
  )
}

function Footer() {
  const columns = [
    ['Products', 'Sell your Products', 'Advertise', 'Pricing', 'Product Buisness'],
    ['Services', 'Return', 'Cash Back', 'Affiliate Marketing', 'Others'],
    ['Company', 'Complaint', 'Careers', 'Affiliate Marketing', 'Support'],
    ['Get Help', 'Help Center', 'Privacy Policy', 'Terms', 'Login'],
  ]
  const socials = ['square-facebook', 'linkedin', 'youtube', 'instagram', 'square-twitter']

  return (
    <footer id="footer">
      <div className="footer1">Connect with us at:
        <div className="social-media">
          {socials.map((social) => (
            <a href="#" aria-label={social.replace('square-', '')} key={social}>
              <i className={`fa-brands fa-${social}`} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <div className="footer2">
        {columns.map(([heading, ...items]) => (
          <div key={heading}>
            <div className="heading">{heading}</div>
            {items.map((item) => <div className="div" key={item}>{item}</div>)}
          </div>
        ))}
      </div>
      <div className="footer3">Copyright © <h4>Trolley Dey</h4> 2023</div>
    </footer>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(products.length / pageSize)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2500)
    return () => window.clearTimeout(timer)
  }, [])

  const firstProduct = (currentPage - 1) * pageSize
  const visibleProducts = products.slice(firstProduct, firstProduct + pageSize)

  return (
    <>
      <div id="top" />
      <Navbar />
      <header className="hero">
        <div className="container">
          <h1>Welcome to Trolley Dey</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis, a!</p>
        </div>
      </header>

      <main>
        <section className="container content" id="items">
          <h2 className="container-h2">Items Listings</h2>
          <div className="content-wrap">
            {(loading ? products.slice(0, pageSize) : visibleProducts).map((image) => (
              <ProductCard image={image} loading={loading} key={image} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </section>

        <section className="featured" id="products">
          <div className="featured-container">
            <h2 className="sectionTitle">Featured Products</h2>
            <div className="split">
              {featuredProducts.map((image) => (
                <a href="#products" className="featuredItem" key={image}>
                  <img src={`/images/${image}`} alt="Featured shoe" className="featuredImg" />
                  <p className="featuredDetails"><span className="price">$99</span>Shoe Name</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
