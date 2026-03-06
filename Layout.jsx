import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import {
  Zap, LayoutDashboard, User, Settings, LogOut, ChevronRight
} from 'lucide-react'
import styles from './Layout.module.css'

const navItems = [
  { to: '/analyze', icon: Zap, label: 'Analyze Call' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Profile' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <Zap size={16} />
          </div>
          <span>PitchIQ</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={12} className={styles.chevron} />
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <Settings size={16} />
              <span>Admin</span>
              <ChevronRight size={12} className={styles.chevron} />
            </NavLink>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.avatar}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Rep'}</span>
              <span className={styles.userRole}>{user?.email || ''}</span>
            </div>
          </div>
          <button className={`btn btn-ghost ${styles.logoutBtn}`} onClick={handleLogout}>
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
