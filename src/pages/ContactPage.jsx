import { useState } from 'react'

const initialForm = { name: '', email: '', message: '' }

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address.'
  if (form.message.trim().length < 10) errors.message = 'Please enter at least 10 characters.'
  return errors
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    // TODO: Wire this form to a real endpoint or form service such as Netlify Forms.
    console.info('Contact form demo submission', form)
    setForm(initialForm)
    setSubmitted(true)
  }

  return (
    <main className="page-main">
      <section className="page-section contact-layout">
        <div className="contact-intro">
          <p className="eyebrow">We would love to hear from you</p>
          <h1>Contact Trolley Dey</h1>
          <p>Have a question about an item or the shopping demo? Send us a message and we’ll point you in the right direction.</p>
          <div className="contact-note">
            <i className="fa-regular fa-clock" aria-hidden="true" />
            <div>
              <strong>Demo response time</strong>
              <span>This form is client-side only and does not send messages yet.</span>
            </div>
          </div>
        </div>
        <form className="contact-form" noValidate onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" value={form.name} onChange={updateField} aria-invalid={Boolean(errors.name)} />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} />
            {errors.email && <small className="field-error">{errors.email}</small>}
          </label>
          <label>
            <span>Message</span>
            <textarea name="message" rows="6" value={form.message} onChange={updateField} aria-invalid={Boolean(errors.message)} />
            {errors.message && <small className="field-error">{errors.message}</small>}
          </label>
          <button className="primary-button" type="submit">Send message</button>
          {submitted && <p className="success-message" role="status">Thanks! Your demo submission was received locally.</p>}
        </form>
      </section>
    </main>
  )
}
