import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile.js'
import { Upload, FileText, X, Zap, AlertCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './AnalyzePage.module.css'

export default function AnalyzePage() {
  const { profile, isProfileComplete } = useProfile()
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [dealStage, setDealStage] = useState('discovery')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  const stages = [
    { value: 'discovery', label: 'Discovery' },
    { value: 'demo', label: 'Demo' },
    { value: 'evaluation', label: 'Evaluation' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closing', label: 'Closing' },
  ]

  const loadingMessages = [
    'Reading your transcript…',
    'Identifying key moments…',
    'Matching customer stories…',
    'Generating follow-up email…',
    'Building proposal…',
    'Compiling your package…',
  ]

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped)
    } else {
      toast.error('Please upload a PDF file')
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload a call transcript')
    if (!isProfileComplete) return toast.error('Complete your profile first — we need your name, email, and phone for the package')

    setLoading(true)
    let msgIdx = 0
    setLoadingMsg(loadingMessages[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length
      setLoadingMsg(loadingMessages[msgIdx])
    }, 2800)

    try {
      // Convert PDF to base64
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.onerror = rej
        reader.readAsDataURL(file)
      })

      // Run analysis + Pinecone searches in parallel
      const [analyzeRes, storiesRes] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdf: base64,
            repName: profile.name,
            repEmail: profile.email,
            repPhone: profile.phone,
            repTitle: profile.title,
            dealStage,
            notes,
          })
        }),
        fetch('/api/search-stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdf: base64 })
        })
      ])

      if (!analyzeRes.ok) throw new Error('Analysis failed')
      const analysis = await analyzeRes.json()
      const stories = storiesRes.ok ? await storiesRes.json() : { stories: [] }

      // Save to session storage and navigate to report
      const reportData = {
        ...analysis,
        customerStories: stories.stories || [],
        repProfile: { name: profile.name, email: profile.email, phone: profile.phone, title: profile.title },
        dealStage,
        createdAt: new Date().toISOString(),
        fileName: file.name,
      }
      sessionStorage.setItem('pitchiq_current_report', JSON.stringify(reportData))
      navigate('/report/current')
    } catch (err) {
      toast.error('Analysis failed. Check your API connection.')
      console.error(err)
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analyze Call</h1>
          <p className={styles.sub}>Upload a transcript and get a full post-call package in ~15 seconds</p>
        </div>
      </div>

      {!isProfileComplete && (
        <div className={styles.profileBanner}>
          <User size={15} />
          <span>Your profile is incomplete — <a href="/profile">add your name, email & phone</a> so we can auto-populate your package.</span>
        </div>
      )}

      <div className={styles.grid}>
        {/* Upload zone */}
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} hidden />
          {file ? (
            <div className={styles.fileInfo}>
              <FileText size={28} className={styles.fileIcon} />
              <div>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <Upload size={32} className={styles.uploadIcon} />
              <p className={styles.dropTitle}>Drop your transcript here</p>
              <p className={styles.dropSub}>PDF files only · click to browse</p>
            </div>
          )}
        </div>

        {/* Config panel */}
        <div className={styles.config}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Deal Stage</label>
            <div className={styles.stages}>
              {stages.map(s => (
                <button
                  key={s.value}
                  className={`${styles.stageBtn} ${dealStage === s.value ? styles.stageActive : ''}`}
                  onClick={() => setDealStage(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Additional Context <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything the AI should know — key objections, competitor mentioned, deal size, urgency signals…"
              rows={4}
            />
          </div>

          <div className={styles.repSummary}>
            <p className={styles.repLabel}>Rep Package</p>
            {isProfileComplete ? (
              <div className={styles.repDetails}>
                <span className={styles.repName}>{profile.name}</span>
                <span className={styles.repEmail}>{profile.email}</span>
                {profile.phone && <span className={styles.repPhone}>{profile.phone}</span>}
              </div>
            ) : (
              <p className={styles.repMissing}>
                <AlertCircle size={13} /> Profile incomplete
              </p>
            )}
          </div>

          <button
            className={`btn btn-primary ${styles.analyzeBtn}`}
            onClick={handleAnalyze}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                {loadingMsg}
              </>
            ) : (
              <>
                <Zap size={15} />
                Generate Package
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
