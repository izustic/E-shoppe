import { useState } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { saveProduct, updateProductFlags } from '../../services/admin'
import { getImageUrl } from '../../utils/images'

const emptyProduct = {
  id: '',
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: '',
  in_stock: true,
  featured: false,
}

export default function AdminProducts() {
  const { products, refreshProducts } = useProducts()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const beginEdit = (product = emptyProduct) => {
    setEditing(product.id || 'new')
    setForm({ ...product, image_url: product.image_url ?? product.image })
    setError('')
  }

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveProduct(form)
      await refreshProducts()
      setEditing(null)
      setForm(emptyProduct)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleFlag = async (product, field) => {
    setError('')
    try {
      await updateProductFlags(product.id, { [field]: !product[field] })
      await refreshProducts()
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-section-heading">
        <div>
          <h2>Product catalog</h2>
          <p>Add products and control storefront availability.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => beginEdit()}>Add product</button>
      </div>
      {error && <p className="form-alert" role="alert">{error}</p>}

      {editing && (
        <form className="admin-product-form" onSubmit={handleSave}>
          <div className="admin-form-heading">
            <h3>{editing === 'new' ? 'Add product' : 'Edit product'}</h3>
            <button className="text-button" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <label><span>Product ID / slug</span><input name="id" required disabled={editing !== 'new'} value={form.id} onChange={updateField} /></label>
          <label><span>Name</span><input name="name" required value={form.name} onChange={updateField} /></label>
          <label><span>Category</span><input name="category" required value={form.category} onChange={updateField} /></label>
          <label><span>Price</span><input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={updateField} /></label>
          <label className="admin-form-wide"><span>Image URL or bundled filename</span><input name="image_url" required value={form.image_url} onChange={updateField} /></label>
          <label className="admin-form-wide"><span>Description</span><textarea name="description" rows="3" required value={form.description} onChange={updateField} /></label>
          <label className="checkbox-field"><input name="in_stock" type="checkbox" checked={form.in_stock} onChange={updateField} /><span>In stock</span></label>
          <label className="checkbox-field"><input name="featured" type="checkbox" checked={form.featured} onChange={updateField} /><span>Featured</span></label>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
        </form>
      )}

      <div className="admin-product-table-wrap">
        <table className="admin-product-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th /></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><div className="admin-product-name"><img src={getImageUrl(product.image)} alt="" /><strong>{product.name}</strong></div></td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td><button className={`status-toggle${product.in_stock ? ' is-on' : ''}`} type="button" onClick={() => toggleFlag(product, 'in_stock')}>{product.in_stock ? 'In stock' : 'Out of stock'}</button></td>
                <td><button className={`status-toggle${product.featured ? ' is-on' : ''}`} type="button" onClick={() => toggleFlag(product, 'featured')}>{product.featured ? 'Featured' : 'Standard'}</button></td>
                <td><button className="text-button" type="button" onClick={() => beginEdit(product)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
