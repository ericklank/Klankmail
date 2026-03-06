import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, TrendingUp, FileText, Clock, ArrowRight } from 'lucide-react'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  // In a real multi-tenant build this pulls from API + user session
  const stats = [
    { label: 'Calls Analyzed', value: '—', icon: Zap, color: 'accent' },
    { label: 'Reports Shared', value: '—', icon: FileText, color: 'green' },
    { label: 'This Month', value: '—', icon: TrendingUp, color: 'amber' },
    { label: 'Avg. Generation', value: '~15s', icon: Clock, color: 'accent' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Your activity and quick access to recent reports</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={`${styles.statCard} ${styles[s.color]}`}>
            <div className={styles.statIcon}><s.icon size={18} /></div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to analyze a call?</h2>
          <p>Upload a transcript and get a full post-call package in ~15 seconds.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
          <Zap size={15} />
          Analyze Now
          <ArrowRight size={14} />
        </button>
      </div>

      <div className={styles.comingSoon}>
        <p className={styles.comingSoonLabel}>Coming Soon</p>
        <div className={styles.featureList}>
          {[
            'Full report history with search',
            'Objection pattern analytics across calls',
            'Manager review & coaching view',
            'Team leaderboard',
          ].map((f, i) => (
            <div key={i} className={styles.featureItem}>
              <div className={styles.featureDot} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
