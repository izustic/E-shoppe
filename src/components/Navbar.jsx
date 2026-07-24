import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../utils/images'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 220)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const navClass = ({ isActive }) => (isActive ? 'current' : undefined)

  return (
    <nav className={`nav${scrolled ? ' active' : ''}`}>
      <div className="container">
        <NavLink to="/" className="logo" onClick={closeMenu} aria-label="Trolley Dey home">
          <img
            src={getImageUrl(scrolled ? 'logo-dark.png' : 'logo-light.png')}
            alt="Trolley Dey"
          />
        </NavLink>
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
          <li><NavLink to="/" end className={navClass} onClick={closeMenu}>Home</NavLink></li>
          <li><NavLink to="/items" className={navClass} onClick={closeMenu}>Items</NavLink></li>
          <li><NavLink to="/products" className={navClass} onClick={closeMenu}>Products</NavLink></li>
          <li><NavLink to="/contact" className={navClass} onClick={closeMenu}>Contact</NavLink></li>
          <li>
            <NavLink to="/cart" className={({ isActive }) => `cart-link${isActive ? ' current' : ''}`} onClick={closeMenu}>
              <i className="ri-shopping-cart-2-line" aria-hidden="true" />
              <span>Cart</span>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}
