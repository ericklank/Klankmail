import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      await login(password)
      navigate('/analyze')
    } catch {
      toast.error('Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}><Zap size={20} /></div>
          <span>PitchIQ</span>
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sales intelligence for high-performance teams</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your team password"
                autoFocus
              />
              <button type="button" className={styles.toggle} onClick={() => setShow(!show)}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          Need access? Contact your team admin.
        </p>
      </div>
    </div>
  )
}
