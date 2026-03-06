import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Zap } from 'lucide-react'
import ReportPage from './ReportPage.jsx'
import styles from './SharedReportPage.module.css'

export default function SharedReportPage() {
  // ReportPage already handles /report/:id fetching from Redis
  // This wrapper just adds the public header banner
  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles.logo}>
          <div className={styles.logoMark}><Zap size={13} /></div>
          <span>PitchIQ</span>
        </div>
        <span className={styles.bannerText}>Shared report — view only</span>
      </div>
      <ReportPage />
    </div>
  )
}
