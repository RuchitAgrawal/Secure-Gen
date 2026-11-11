import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { leaderboardData } from '@/lib/demo-data'
import { useDocumentTitle } from '@/lib/hooks'
import ScoreGauge from '@/components/ScoreGauge'
import Badge from '@/components/Badge'
import styles from './Leaderboard.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  vuln_detection: 'Vuln Detection',
  cve_triage: 'CVE Triage',
  sast_triage: 'SAST Triage',
  threat_modeling: 'Threat Model',
  prompt_injection: 'Prompt Inject',
  jailbreak: 'Jailbreak',
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#5db8a6',
  anthropic: '#cc785c',
  google: '#e8a55a',
  ollama: '#8e8b82',
}

type SortKey = 'overall_score' | 'attack_resistance' | 'benchmark_score' | 'owasp_compliance'

interface DeploymentProfile {
  id: string
  label: string
  description: string
  weights: Record<string, number>
}

const DEPLOYMENT_PROFILES: DeploymentProfile[] = [
  {
    id: 'general',
    label: 'Balanced Generalist',
    description: 'Equal 1/6 weighting across all security defense and attack resilience benchmarks.',
    weights: {
      vuln_detection: 1 / 6,
      cve_triage: 1 / 6,
      sast_triage: 1 / 6,
      threat_modeling: 1 / 6,
      prompt_injection: 1 / 6,
      jailbreak: 1 / 6,
    },
  },
  {
    id: 'agent_rag',
    label: 'Enterprise Agent & RAG',
    description: 'Personalized profile weighting: 60% on prompt injection, tool hijacking, and jailbreak resilience.',
    weights: {
      prompt_injection: 0.35,
      jailbreak: 0.25,
      threat_modeling: 0.15,
      vuln_detection: 0.10,
      cve_triage: 0.08,
      sast_triage: 0.07,
    },
  },
  {
    id: 'appsec',
    label: 'AppSec & Code Auditor',
    description: 'Personalized profile weighting: 70% on vulnerability localization, CVE triage, and SAST false positives.',
    weights: {
      vuln_detection: 0.40,
      cve_triage: 0.30,
      sast_triage: 0.20,
      threat_modeling: 0.05,
      prompt_injection: 0.03,
      jailbreak: 0.02,
    },
  },
]

export default function Leaderboard() {
  useDocumentTitle('Model Leaderboard | Secure Gen')
  const [sortBy, setSortBy] = useState<SortKey>('overall_score')
  const [activeProfile, setActiveProfile] = useState<string>('general')
  const [selected, setSelected] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet-20241022'])

  const currentProfile = DEPLOYMENT_PROFILES.find(p => p.id === activeProfile) || DEPLOYMENT_PROFILES[0]

  const calculateProfileScore = (entry: typeof leaderboardData[0]): number => {
    let weightedSum = 0
    for (const [key, weight] of Object.entries(currentProfile.weights)) {
      weightedSum += (entry.category_scores[key] ?? 70) * weight
    }
    return Math.round(weightedSum)
  }

  const enhancedData = leaderboardData.map(entry => ({
    ...entry,
    weighted_score: calculateProfileScore(entry),
  }))

  const sorted = [...enhancedData].sort((a, b) => {
    if (sortBy === 'overall_score') {
      return b.weighted_score - a.weighted_score
    }
    return (b[sortBy] ?? 0) - (a[sortBy] ?? 0)
  })

  const toggleSelect = (model: string) => {
    setSelected(prev =>
      prev.includes(model) ? prev.filter(m => m !== model) : prev.length < 3 ? [...prev, model] : prev
    )
  }

  const comparisonModels = leaderboardData.filter(m => selected.includes(m.model))

  const radarData = Object.keys(CATEGORY_LABELS).map(key => {
    const point: Record<string, string | number> = { subject: CATEGORY_LABELS[key] }
    comparisonModels.forEach(m => {
      point[m.model] = m.category_scores[key] ?? 0
    })
    return point
  })

  const getBadge = (index: number) => {
    if (index === 0) return { label: 'Most Robust', emoji: 'Most Robust' }
    if (index === 1) return { label: 'Best Analyst', emoji: 'Best Analyst' }
    return null
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.title}>Model Leaderboard</h1>
          <p className={styles.subtitle}>Ranked by security evaluation score across adversarial robustness and defensive reasoning.</p>

          <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
              <span className={styles.profileLabel}>Deployment Profile:</span>
              <div className={styles.profilePills}>
                {DEPLOYMENT_PROFILES.map(prof => (
                  <button
                    key={prof.id}
                    type="button"
                    className={`${styles.profileBtn} ${activeProfile === prof.id ? styles.profileBtnActive : ''}`}
                    onClick={() => setActiveProfile(prof.id)}
                  >
                    {prof.label}
                  </button>
                ))}
              </div>
            </div>
            <p className={styles.profileDesc}>{currentProfile.description}</p>
          </div>

          <div className={styles.sortRow}>
            <span className={styles.sortLabel}>Sort by:</span>
            {(['overall_score', 'attack_resistance', 'benchmark_score', 'owasp_compliance'] as SortKey[]).map(key => (
              <button
                key={key}
                className={`${styles.sortBtn} ${sortBy === key ? styles.sortBtnActive : ''}`}
                onClick={() => setSortBy(key)}
              >
                {key === 'overall_score'
                  ? (activeProfile === 'general' ? 'Overall Score' : `${currentProfile.label} Score`)
                  : key === 'owasp_compliance'
                  ? 'OWASP Top 10'
                  : key.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.tableSection}>
              {selected.length > 0 && (
                <div className={styles.compareHint}>
                  {selected.length} model{selected.length > 1 ? 's' : ''} selected for radar comparison
                  {selected.length === 2 && selected.includes('gpt-4o') && selected.includes('claude-3-5-sonnet-20241022') && (
                    <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.7 }}>· pre-selected: top 2 by overall score</span>
                  )}
                  <button className={styles.clearBtn} onClick={() => setSelected([])}>Clear</button>
                </div>
              )}
              <div className={styles.table}>
                <div className={`${styles.row} ${styles.thead}`}>
                  <span>#</span>
                  <span>Model</span>
                  <span>Overall</span>
                  <span>Attack Resist.</span>
                  <span>Benchmark</span>
                  <span>OWASP Top 10</span>
                  <span>Compare</span>
                </div>
                {sorted.map((entry, i) => {
                  const badge = getBadge(i)
                  const isSelected = selected.includes(entry.model)
                  return (
                    <div key={entry.model} className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}>
                      <span className={styles.rank}>{i + 1}</span>
                      <div className={styles.modelCell}>
                        <div className={styles.modelDot} style={{ backgroundColor: PROVIDER_COLORS[entry.provider] }} />
                        <div>
                          <div className={styles.modelName}>{entry.model}</div>
                          <div className={styles.modelProvider}>{entry.provider}</div>
                        </div>
                        {badge && <Badge variant="default" className={styles.rowBadge}>{badge.label}</Badge>}
                      </div>
                      <div className={styles.scoreCell}>
                        <ScoreGauge score={entry.weighted_score} size={56} />
                      </div>
                      <span className={styles.numScore}>{entry.attack_resistance}%</span>
                      <span className={styles.numScore}>{entry.benchmark_score}%</span>
                      <span className={styles.numScore}>{entry.owasp_compliance ?? 70}%</span>
                      <button
                        className={`${styles.compareToggle} ${isSelected ? styles.compareToggleActive : ''}`}
                        onClick={() => toggleSelect(entry.model)}
                      >
                        {isSelected ? 'Remove' : 'Compare'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {comparisonModels.length > 0 && (
              <div className={styles.radarSection}>
                <h2 className={styles.radarTitle}>Capability radar</h2>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(20,20,19,0.12)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6c6a64' }} />
                    {comparisonModels.map((m, idx) => (
                      <Radar
                        key={m.model}
                        name={m.model}
                        dataKey={m.model}
                        stroke={Object.values(PROVIDER_COLORS)[idx % 4]}
                        fill={Object.values(PROVIDER_COLORS)[idx % 4]}
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{
                        background: '#faf9f5',
                        border: '1px solid #e6dfd8',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className={styles.radarLegend}>
                  {comparisonModels.map((m, idx) => (
                    <div key={m.model} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: Object.values(PROVIDER_COLORS)[idx % 4] }} />
                      <span>{m.model}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
