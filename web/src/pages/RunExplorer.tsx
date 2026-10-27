import { useState } from 'react'
import { sampleAttackResults } from '@/lib/demo-data'
import Badge from '@/components/Badge'
import Modal from '@/components/Modal'
import { useDocumentTitle } from '@/lib/hooks'
import type { RunResult } from '@/lib/types'
import styles from './RunExplorer.module.css'

type Filter = 'all' | 'attack' | 'benchmark' | 'bypassed' | 'refused'

export default function RunExplorer() {
  useDocumentTitle('Run Explorer | Secure Gen')
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<RunResult | null>(null)
  const [compareTarget, setCompareTarget] = useState<RunResult | null>(null)
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const filtered = sampleAttackResults.filter(r => {
    if (filter === 'all') return true
    if (filter === 'attack') return r.task_type === 'attack'
    if (filter === 'benchmark') return r.task_type === 'benchmark'
    if (filter === 'bypassed') return r.metadata?.attack_succeeded === true
    if (filter === 'refused') return r.metadata?.attack_succeeded === false
    return true
  })

  const verdictBadge = (r: RunResult) => {
    const verdict = r.metadata?.verdict as string
    if (verdict === 'correctly_refused') return <Badge variant="success">Refused</Badge>
    if (verdict === 'complied') return <Badge variant="error">Bypassed</Badge>
    return <Badge variant="amber">{verdict || 'N/A'}</Badge>
  }

  const openCompareModal = () => {
    if (!selected) return
    const alternative = sampleAttackResults.find(
      r => r.task_id === selected.task_id && r.model !== selected.model
    ) || sampleAttackResults.find(r => r.run_id !== selected.run_id)
    setCompareTarget(alternative || null)
    setIsCompareOpen(true)
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.title}>Run Explorer</h1>
          <p className={styles.subtitle}>Browse individual prompt results, model responses, and evaluation verdicts.</p>
          <div className={styles.filters}>
            {(['all', 'attack', 'benchmark', 'bypassed', 'refused'] as Filter[]).map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="container">
          <div className={styles.layout}>
            <div className={styles.list}>
              {filtered.length === 0 && (
                <div className={styles.empty}>No results match the current filter.</div>
              )}
              {filtered.map(r => (
                <div
                  key={r.run_id}
                  className={`${styles.resultCard} ${selected?.run_id === r.run_id ? styles.resultCardActive : ''}`}
                  onClick={() => setSelected(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelected(r)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.taskId}>{r.task_id}</span>
                    {verdictBadge(r)}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.modelLabel}>{r.model}</span>
                    <span className={styles.metaDivider}>|</span>
                    <span className={styles.latency}>{r.latency_ms}ms</span>
                    {r.score !== undefined && (
                      <>
                        <span className={styles.metaDivider}>|</span>
                        <span className={styles.scoreLabel}>score: {r.score.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                  <p className={styles.preview}>{r.response.slice(0, 120)}{r.response.length > 120 ? '...' : ''}</p>
                </div>
              ))}
            </div>

            <div className={styles.detail}>
              {selected ? (
                <div className={styles.detailCard}>
                  <div className={styles.detailHeader}>
                    <h2 className={styles.detailTitle}>{selected.task_id}</h2>
                    <div className={styles.detailMeta} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={openCompareModal}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          color: 'var(--color-primary)',
                        }}
                      >
                        Compare Run
                      </button>
                      <Badge variant="default">{selected.provider}</Badge>
                      {verdictBadge(selected)}
                    </div>
                  </div>
                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Model</span>
                    <span className={styles.detailValue}>{selected.model}</span>
                  </div>
                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Latency</span>
                    <span className={styles.detailValue}>{selected.latency_ms}ms</span>
                  </div>
                  {selected.score !== undefined && (
                    <div className={styles.detailSection}>
                      <span className={styles.detailLabel}>Score</span>
                      <span className={styles.detailValue}>{(selected.score * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {selected.flags.length > 0 && (
                    <div className={styles.detailSection}>
                      <span className={styles.detailLabel}>Flags</span>
                      <div className={styles.flagList}>
                        {selected.flags.map(f => <Badge key={f} variant="amber">{f}</Badge>)}
                      </div>
                    </div>
                  )}
                  <div className={styles.responseSection}>
                    <span className={styles.detailLabel}>Model Response</span>
                    <div className={styles.responseBox}>{selected.response}</div>
                  </div>
                </div>
              ) : (
                <div className={styles.detailEmpty}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={styles.emptyIcon}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p>Select a result to inspect the full model response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        title="Side-by-Side Run Comparison"
        subtitle={`Task: ${selected?.task_id || ''}`}
        maxWidth="840px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {selected && (
            <div style={{ background: 'var(--color-surface-soft)', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <strong>{selected.model}</strong>
                {verdictBadge(selected)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Latency: {selected.latency_ms}ms | Provider: {selected.provider}
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '340px', overflowY: 'auto' }}>
                {selected.response}
              </div>
            </div>
          )}

          {compareTarget ? (
            <div style={{ background: 'var(--color-surface-soft)', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <strong>{compareTarget.model}</strong>
                {verdictBadge(compareTarget)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Latency: {compareTarget.latency_ms}ms | Provider: {compareTarget.provider}
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '340px', overflowY: 'auto' }}>
                {compareTarget.response}
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No alternative model response available for comparison.
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
