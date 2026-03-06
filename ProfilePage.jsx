import { useState } from 'react'
import { useProfile } from '../hooks/useProfile.js'
import { User, Save, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile()
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateProfile(form)
    setSaved(true)
    toast.success('Profile saved')
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Jane Smith', required: true },
    { key: 'email', label: 'Email', placeholder: 'jane@company.com', type: 'email', required: true },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', required: true },
    { key: 'title', label: 'Title', placeholder: 'Account Executive' },
    { key: 'company', label: 'Company', placeholder: 'Acme Corp' },
    { key: 'linkedIn', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/jane' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerIcon}><User size={20} /></div>
        <div>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.sub}>Your info auto-populates every package — fill it in once, never again.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>
          {fields.map(f => (
            <div key={f.key} className={styles.field}>
              <label className={styles.label}>
                {f.label}
                {f.required && <span className={styles.required}>*</span>}
              </label>
              <input
                className={styles.input}
                type={f.type || 'text'}
                value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '24px' }}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className={styles.previewCard}>
        <p className={styles.previewLabel}>Signature Preview</p>
        <div className={styles.preview}>
          <strong>{form.name || 'Your Name'}</strong>
          {form.title && <span> · {form.title}</span>}
          {form.company && <span> · {form.company}</span>}
          <br />
          {form.email && <a href={`mailto:${form.email}`}>{form.email}</a>}
          {form.phone && <span> · {form.phone}</span>}
        </div>
      </div>
    </div>
  )
}
