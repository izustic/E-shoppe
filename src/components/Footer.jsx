import { Link } from 'react-router-dom'

const socials = ['square-facebook', 'linkedin', 'youtube', 'instagram', 'square-twitter']

export default function Footer() {
  return (
    <footer>
      <div className="footer1">Connect with us:
        <div className="social-media">
          {socials.map((social) => (
            <span
              className="disabled-social"
              aria-label={`${social.replace('square-', '')} coming soon`}
              title="Coming soon"
              key={social}
            >
              <i className={`fa-brands fa-${social}`} aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
      <div className="footer2">
        <div>
          <div className="heading">Shop</div>
          <Link className="footer-link" to="/items">Items</Link>
          <Link className="footer-link" to="/products">All Products</Link>
          <Link className="footer-link" to="/cart">Your Cart</Link>
        </div>
        <div>
          <div className="heading">Support</div>
          <Link className="footer-link" to="/contact">Contact Us</Link>
          <span className="footer-disabled">Returns · Coming soon</span>
          <span className="footer-disabled">Help Center · Coming soon</span>
        </div>
        <div>
          <div className="heading">Company</div>
          <span className="footer-disabled">About · Coming soon</span>
          <span className="footer-disabled">Careers · Coming soon</span>
          <span className="footer-disabled">Privacy · Coming soon</span>
        </div>
      </div>
      <div className="footer3">Copyright © <h4>Trolley Dey</h4> {new Date().getFullYear()}</div>
    </footer>
  )
}
