import { useState } from 'react'
import { sampleAttackResults } from '@/lib/demo-data'
import Badge from '@/components/Badge'
import CodeBlock from '@/components/CodeBlock'
import type { RunResult } from '@/lib/types'
import styles from './RunExplorer.module.css'

type Filter = 'all' | 'attack' | 'benchmark' | 'bypassed' | 'refused'

export default function RunExplorer() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<RunResult | null>(null)

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
                    <div className={styles.detailMeta}>
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
    </div>
  )
}
