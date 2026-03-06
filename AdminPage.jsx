import { Settings, Database, FileText, Users, Sliders } from 'lucide-react'
import styles from './AdminPage.module.css'

const sections = [
  { icon: Sliders, title: 'AI Prompt Config', desc: 'Configure the Claude system prompt for your workspace — product name, features, competitors, pricing tiers.', status: 'coming-soon' },
  { icon: Database, title: 'Knowledge Base', desc: 'Manage support articles and customer stories indexed in Pinecone. Upload, remove, or re-index content.', status: 'coming-soon' },
  { icon: Users, title: 'Team Members', desc: 'Invite reps, assign roles (rep/manager/admin), and manage access.', status: 'coming-soon' },
  { icon: FileText, title: 'Email Templates', desc: 'Customize the default follow-up email template for your team.', status: 'coming-soon' },
  { icon: Settings, title: 'Workspace Settings', desc: 'Rename your workspace, update branding, and manage billing.', status: 'coming-soon' },
]

export default function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.sub}>Workspace configuration and team management</p>
      </div>

      <div className={styles.grid}>
        {sections.map((s, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrap}><s.icon size={18} /></div>
              <span className="badge badge-amber">Coming Soon</span>
            </div>
            <h3 className={styles.cardTitle}>{s.title}</h3>
            <p className={styles.cardDesc}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
