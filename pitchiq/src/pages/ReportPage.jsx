import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ChevronDown, ChevronUp, Copy, Check, Share2,
  FileText, Mail, Briefcase, Users, Lightbulb,
  AlertTriangle, HelpCircle, ArrowRight, Star,
  BookOpen, ClipboardList, TrendingUp, Download
} from 'lucide-react'
import styles from './ReportPage.module.css'

// ── Widget wrapper ──────────────────────────────────────────────────────────
function Widget({ icon: Icon, title, badge, badgeType = 'accent', defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={styles.widget}>
      <button className={styles.widgetHeader} onClick={() => setOpen(!open)}>
        <div className={styles.widgetLeft}>
          <Icon size={16} className={styles.widgetIcon} />
          <span className={styles.widgetTitle}>{title}</span>
          {badge && <span className={`badge badge-${badgeType}`}>{badge}</span>}
        </div>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className={styles.widgetBody}>{children}</div>}
    </div>
  )
}

// ── Copy button ─────────────────────────────────────────────────────────────
function CopyBtn({ text, label = '' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className={`btn btn-ghost ${styles.copyBtn}`} onClick={copy}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [editableEmail, setEditableEmail] = useState('')
  const [editableProposal, setEditableProposal] = useState('')
  const [editEmail, setEditEmail] = useState(false)

  useEffect(() => {
    if (id === 'current') {
      const stored = sessionStorage.getItem('pitchiq_current_report')
      if (stored) {
        const r = JSON.parse(stored)
        setReport(r)
        setEditableEmail(r.followUpEmail || '')
        setEditableProposal(r.proposal || '')
      } else {
        navigate('/analyze')
      }
    } else {
      fetch(`/api/get-report?id=${id}`)
        .then(r => r.json())
        .then(r => {
          setReport(r)
          setEditableEmail(r.followUpEmail || '')
          setEditableProposal(r.proposal || '')
        })
        .catch(() => navigate('/analyze'))
    }
    setLoading(false)
  }, [id])

  const handleShare = async () => {
    setSharing(true)
    try {
      const res = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report })
      })
      const { id: shareId } = await res.json()
      const url = `${window.location.origin}/report/${shareId}`
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard!')
    } catch {
      toast.error('Failed to create share link')
    } finally {
      setSharing(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: editableProposal, repProfile: report.repProfile })
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'proposal.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('PDF generation failed')
    }
  }

  if (loading || !report) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading report…</p>
      </div>
    )
  }

  const {
    companyName, contactName, dealStage, createdAt, fileName,
    currentSituation, discussedInCall, missedOpportunities,
    objectionsRaised, digDeeper, recommendedNextSteps,
    customerStories = [], followUpEmail, salesforceFields = {},
    sfCoaching = [], repProfile
  } = report

  const hasSfGaps = sfCoaching && sfCoaching.length > 0

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <span>Reports</span>
            <ArrowRight size={12} />
            <span>{companyName || fileName || 'Call Report'}</span>
          </div>
          <h1 className={styles.pageTitle}>{companyName || 'Call Report'}</h1>
          <div className={styles.meta}>
            {contactName && <span>{contactName}</span>}
            {dealStage && <span className="badge badge-accent">{dealStage}</span>}
            {createdAt && <span>{new Date(createdAt).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-secondary" onClick={handleShare} disabled={sharing}>
            <Share2 size={14} />
            {sharing ? 'Saving…' : 'Share Report'}
          </button>
        </div>
      </div>

      {/* Widget grid */}
      <div className={styles.widgetGrid}>
        {/* Row 1 */}
        <Widget icon={Briefcase} title="Current Situation">
          <p className={styles.prose}>{currentSituation || 'No data extracted.'}</p>
        </Widget>

        <Widget icon={BookOpen} title="Discussed in Call">
          <ul className={styles.list}>
            {(discussedInCall || []).map((item, i) => (
              <li key={i}><span>{item}</span></li>
            ))}
          </ul>
        </Widget>

        {/* Row 2 */}
        <Widget icon={Lightbulb} title="You Might Have Missed" badgeType="amber" badge="AI">
          <ul className={styles.list}>
            {(missedOpportunities || []).map((item, i) => (
              <li key={i}><span>{item}</span></li>
            ))}
          </ul>
        </Widget>

        <Widget icon={AlertTriangle} title="Objections Raised" badgeType="red">
          {(objectionsRaised || []).length === 0 ? (
            <p className={styles.empty}>No objections logged.</p>
          ) : (
            <ul className={styles.objectionList}>
              {objectionsRaised.map((obj, i) => (
                <li key={i}>
                  <div className={styles.objectionLabel}>{obj.objection}</div>
                  {obj.suggestion && (
                    <div className={styles.objectionResponse}>
                      <ArrowRight size={12} />
                      <span>{obj.suggestion}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Widget>

        {/* Row 3 */}
        <Widget icon={HelpCircle} title="Dig Deeper">
          {(digDeeper || []).length === 0 ? (
            <p className={styles.empty}>No unanswered topics.</p>
          ) : (
            <ul className={styles.digList}>
              {digDeeper.map((item, i) => (
                <li key={i}>
                  <span className={styles.digTopic}>{item.topic}</span>
                  <span className={styles.digQuestion}>"{item.question}"</span>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget icon={ArrowRight} title="Recommended Next Steps" badgeType="green" badge={recommendedNextSteps?.length}>
          <ol className={styles.stepsList}>
            {(recommendedNextSteps || []).map((step, i) => (
              <li key={i}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Widget>

        {/* Customer Stories - full width */}
        <div className={styles.fullWidth}>
          <Widget icon={Star} title="Customer Stories" badge={customerStories.length} badgeType="green">
            {customerStories.length === 0 ? (
              <p className={styles.empty}>No matching stories found.</p>
            ) : (
              <div className={styles.storiesGrid}>
                {customerStories.map((story, i) => (
                  <div key={i} className={styles.storyCard}>
                    <div className={styles.storyCompany}>{story.company}</div>
                    <p className={styles.storyText}>{story.summary}</p>
                    {story.url && (
                      <a href={story.url} target="_blank" rel="noopener noreferrer" className={styles.storyLink}>
                        Read story <ArrowRight size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Widget>
        </div>

        {/* Proposal - full width */}
        <div className={styles.fullWidth}>
          <Widget icon={FileText} title="1-Pager Proposal">
            <div className={styles.proposalActions}>
              <CopyBtn text={editableProposal} label="Copy" />
              <button className="btn btn-secondary" onClick={handleDownloadPdf} style={{ fontSize: '13px', padding: '6px 14px' }}>
                <Download size={13} />
                Download PDF
              </button>
            </div>
            <textarea
              className={styles.proposalEditor}
              value={editableProposal}
              onChange={e => setEditableProposal(e.target.value)}
              rows={14}
            />
          </Widget>
        </div>

        {/* Follow-up Email - full width */}
        <div className={styles.fullWidth}>
          <Widget icon={Mail} title="Follow-up Email">
            <div className={styles.emailActions}>
              {editEmail ? (
                <button className="btn btn-ghost" style={{ fontSize: '13px' }} onClick={() => setEditEmail(false)}>Done editing</button>
              ) : (
                <button className="btn btn-ghost" style={{ fontSize: '13px' }} onClick={() => setEditEmail(true)}>Edit</button>
              )}
              <CopyBtn text={editableEmail} label="Copy email" />
            </div>
            {editEmail ? (
              <textarea
                className={styles.emailEditor}
                value={editableEmail}
                onChange={e => setEditableEmail(e.target.value)}
                rows={16}
              />
            ) : (
              <div
                className={styles.emailPreview}
                dangerouslySetInnerHTML={{ __html: editableEmail.replace(/\n/g, '<br/>') }}
              />
            )}
          </Widget>
        </div>

        {/* Salesforce Fields - full width */}
        <div className={styles.fullWidth}>
          <Widget icon={ClipboardList} title="Salesforce Fields">
            <div className={styles.sfGrid}>
              {Object.entries(salesforceFields).map(([key, val]) => (
                <div key={key} className={styles.sfRow}>
                  <span className={styles.sfKey}>{key}</span>
                  <span className={styles.sfVal}>{val || <em className={styles.sfEmpty}>—</em>}</span>
                  <CopyBtn text={val || ''} />
                </div>
              ))}
            </div>
          </Widget>
        </div>

        {/* SF Coaching — only if gaps exist */}
        {hasSfGaps && (
          <div className={styles.fullWidth}>
            <Widget icon={TrendingUp} title="SF Coaching" badgeType="amber" badge="Gaps Found" defaultOpen={true}>
              <p className={styles.coachingIntro}>These fields are blank. Ask these questions to fill them in on your next touch:</p>
              <div className={styles.coachingList}>
                {sfCoaching.map((item, i) => (
                  <div key={i} className={styles.coachingItem}>
                    <span className={styles.coachingField}>{item.field}</span>
                    <span className={styles.coachingQuestion}>"{item.question}"</span>
                  </div>
                ))}
              </div>
            </Widget>
          </div>
        )}
      </div>
    </div>
  )
}
