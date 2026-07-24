import { useEffect, useMemo, useRef, useState } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { saveProduct, updateProductFlags, uploadProductImage } from '../../services/admin'
import { getImageUrl } from '../../utils/images'

const pageSize = 5
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
  const { products, loading, refreshProducts } = useProducts()
  const [editing, setEditing] = useState('new')
  const [form, setForm] = useState(emptyProduct)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [page, setPage] = useState(1)
  const editorRef = useRef(null)
  const slugInputRef = useRef(null)

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch = !normalizedQuery
        || product.name.toLowerCase().includes(normalizedQuery)
        || product.category.toLowerCase().includes(normalizedQuery)
      const matchesCategory = category === 'all' || product.category === category
      const matchesStock = stockFilter === 'all'
        || (stockFilter === 'in' && product.in_stock)
        || (stockFilter === 'out' && !product.in_stock)
      return matchesSearch && matchesCategory && matchesStock
    })
  }, [category, products, query, stockFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [query, category, stockFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : form.image_url ? getImageUrl(form.image_url) : ''),
    [form.image_url, imageFile],
  )

  useEffect(() => () => {
    if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imageFile, imagePreview])

  const beginEdit = (product = emptyProduct) => {
    setEditing(product.id || 'new')
    setForm({ ...product, image_url: product.image_url ?? product.image })
    setImageFile(null)
    setError('')
  }

  const beginNewProduct = () => {
    beginEdit()
    window.requestAnimationFrame(() => {
      slugInputRef.current?.focus()
      if (window.innerWidth <= 1100) {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const resetForm = () => {
    const originalProduct = products.find((product) => product.id === editing)
    setForm(editing === 'new' || !originalProduct
      ? emptyProduct
      : { ...originalProduct, image_url: originalProduct.image_url ?? originalProduct.image })
    setImageFile(null)
    setError('')
  }

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const chooseImage = (file) => {
    if (!file) return
    setImageFile(file)
    setError('')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    chooseImage(event.dataTransfer.files?.[0])
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const imageUrl = imageFile ? await uploadProductImage(imageFile) : form.image_url
      if (!imageUrl) throw new Error('Choose a product image.')
      await saveProduct({ ...form, image_url: imageUrl })
      await refreshProducts()
      setEditing(null)
      setForm(emptyProduct)
      setImageFile(null)
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
      if (editing === product.id) {
        setForm((current) => ({ ...current, [field]: !product[field] }))
      }
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const cycleStockFilter = () => {
    setStockFilter((current) => current === 'all' ? 'in' : current === 'in' ? 'out' : 'all')
  }

  return (
    <section className="admin-products-view">
      <header className="catalog-heading">
        <div>
          <h2>Product catalog</h2>
          <p>Add products and control storefront availability.</p>
        </div>
      </header>

      {error && <p className="form-alert" role="alert">{error}</p>}

      <div className="catalog-workspace">
        <aside className="catalog-browser">
          <div className="catalog-tools">
            <label className="catalog-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span className="sr-only">Search products</span>
              <input value={query} placeholder="Search products…" onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label>
              <span className="sr-only">Filter by category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </label>
            <button
              className={`catalog-filter-button${stockFilter !== 'all' ? ' active' : ''}`}
              type="button"
              title={`Stock filter: ${stockFilter === 'all' ? 'all products' : stockFilter === 'in' ? 'in stock' : 'out of stock'}`}
              onClick={cycleStockFilter}
            >
              <i className="fa-solid fa-filter" aria-hidden="true" />
            </button>
          </div>

          <div className="catalog-list">
            {loading
              ? Array.from({ length: pageSize }, (_, index) => (
                <div className="catalog-list-item catalog-list-skeleton" aria-hidden="true" key={`catalog-skeleton-${index}`}>
                  <span className="catalog-skeleton-image animated-bg" />
                  <span className="catalog-skeleton-copy">
                    <span className="animated-bg" />
                    <span className="animated-bg" />
                  </span>
                  <span className="catalog-skeleton-price animated-bg" />
                  <span className="catalog-skeleton-pill animated-bg" />
                  <span />
                </div>
              ))
              : visibleProducts.length === 0
              ? <p className="catalog-list-empty">No products match these filters.</p>
              : visibleProducts.map((product) => (
                <article
                  className={`catalog-list-item${editing === product.id ? ' selected' : ''}`}
                  key={product.id}
                  onClick={() => beginEdit(product)}
                >
                  <img src={getImageUrl(product.image)} alt="" />
                  <div className="catalog-list-copy">
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>
                  <strong className="catalog-list-price">${product.price.toFixed(2)}</strong>
                  <button
                    className={`catalog-stock-pill${product.in_stock ? ' in-stock' : ' out-of-stock'}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleFlag(product, 'in_stock')
                    }}
                  >
                    {product.in_stock ? 'In stock' : 'Out of stock'}
                  </button>
                  <button className="catalog-more-button" type="button" aria-label={`Edit ${product.name}`} onClick={() => beginEdit(product)}>
                    <i className="fa-solid fa-ellipsis-vertical" aria-hidden="true" />
                  </button>
                </article>
              ))}
          </div>

          <footer className="catalog-pagination">
            <span>
              {loading
                ? 'Loading products…'
                : filteredProducts.length === 0
                ? 'No products'
                : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filteredProducts.length)} of ${filteredProducts.length}`}
            </span>
            <div>
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page">‹</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button className={page === pageNumber ? 'active' : ''} type="button" onClick={() => setPage(pageNumber)} key={pageNumber}>{pageNumber}</button>
              ))}
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} aria-label="Next page">›</button>
            </div>
          </footer>
        </aside>

        <div className="catalog-editor" ref={editorRef}>
          {editing
            ? (
              <form className="catalog-product-form" onSubmit={handleSave}>
                <div className="catalog-form-heading">
                  <h3>{editing === 'new' ? 'Add new product' : 'Edit product'}</h3>
                  <button className="catalog-cancel-button" type="button" onClick={() => setEditing(null)}>Cancel</button>
                </div>

                <label>
                  <span>Product ID / Slug <b>*</b></span>
                  <input ref={slugInputRef} name="id" required disabled={editing !== 'new'} value={form.id} placeholder="e.g. golden-morn-450g" onChange={updateField} />
                  <small>Unique slug using letters, numbers, and hyphens.</small>
                </label>
                <label>
                  <span>Product name <b>*</b></span>
                  <input name="name" required value={form.name} placeholder="e.g. Golden Morn (450g)" onChange={updateField} />
                </label>
                <label>
                  <span>Category <b>*</b></span>
                  <input name="category" list="product-categories" required value={form.category} placeholder="Select or enter a category" onChange={updateField} />
                  <datalist id="product-categories">
                    {categories.map((item) => <option value={item} key={item} />)}
                  </datalist>
                </label>
                <label>
                  <span>Price ($) <b>*</b></span>
                  <input name="price" type="number" min="0" step="0.01" required value={form.price} placeholder="e.g. 18.00" onChange={updateField} />
                </label>

                <div className="catalog-image-field catalog-form-wide">
                  <span>Product image <b>*</b></span>
                  <div className="catalog-image-row">
                    <label
                      className={`catalog-dropzone${dragging ? ' dragging' : ''}`}
                      onDragEnter={() => setDragging(true)}
                      onDragLeave={() => setDragging(false)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => chooseImage(event.target.files?.[0])} />
                      {imagePreview
                        ? <img src={imagePreview} alt="Product upload preview" />
                        : <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />}
                      <strong>{imageFile ? imageFile.name : imagePreview ? 'Click to replace image' : 'Click to upload or drag and drop'}</strong>
                      <small>PNG, JPG, WebP or GIF up to 5 MB</small>
                    </label>
                    <aside className="catalog-image-tips">
                      <strong>Quick tips</strong>
                      <span>✓ Use a sharp, high-quality image</span>
                      <span>✓ White or light backgrounds work best</span>
                      <span>✓ Recommended size: 1200×1200px</span>
                      <span>✓ Maximum file size: 5 MB</span>
                    </aside>
                  </div>
                </div>

                <label className="catalog-form-wide">
                  <span>Description <b>*</b></span>
                  <textarea name="description" rows="4" minLength="10" required value={form.description} placeholder="Describe the product, key benefits, ingredients, etc." onChange={updateField} />
                  <small>Minimum 10 characters.</small>
                </label>

                <label className="catalog-checkbox">
                  <input name="in_stock" type="checkbox" checked={form.in_stock} onChange={updateField} />
                  <span><strong>In stock</strong><small>Product is available for purchase.</small></span>
                </label>
                <label className="catalog-checkbox">
                  <input name="featured" type="checkbox" checked={form.featured} onChange={updateField} />
                  <span><strong>Featured product</strong><small>Show on homepage and highlights.</small></span>
                </label>

                <footer className="catalog-form-actions catalog-form-wide">
                  <button className="text-button" type="button" onClick={resetForm}>Reset form</button>
                  <button className="primary-button" type="submit" disabled={saving}>
                    <i className="fa-regular fa-floppy-disk" aria-hidden="true" />
                    {saving ? 'Saving…' : 'Save product'}
                  </button>
                </footer>
              </form>
            )
            : (
              <div className="catalog-editor-empty">
                <i className="fa-solid fa-box-open" aria-hidden="true" />
                <h3>Select a product to edit</h3>
                <p>Choose a product from the catalog or add a new one.</p>
                <button className="primary-button" type="button" onClick={beginNewProduct}>Add product</button>
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
