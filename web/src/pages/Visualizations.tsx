import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
} from 'recharts'
import { leaderboardData } from '@/lib/demo-data'
import { useDocumentTitle } from '@/lib/hooks'
import RadarChart from '@/components/RadarChart'
import AtlasHeatmap from '@/components/AtlasHeatmap'
import styles from './Visualizations.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  vuln_detection: 'Vuln Detection',
  cve_triage: 'CVE Triage',
  sast_triage: 'SAST Triage',
  threat_modeling: 'Threat Modeling',
  prompt_injection: 'Prompt Injection',
  jailbreak: 'Jailbreak',
}

const MODEL_COLORS = ['#cc785c', '#5db8a6', '#e8a55a', '#8e8b82', '#5db872']

const barData = Object.keys(CATEGORY_LABELS).map(cat => {
  const row: Record<string, string | number> = { category: CATEGORY_LABELS[cat] }
  leaderboardData.forEach(m => {
    row[m.model] = m.category_scores[cat] ?? 0
  })
  return row
})

const scatterData = leaderboardData.map((m, i) => ({
  model: m.model,
  score: m.overall_score,
  latency: 700 + i * 120,
  color: MODEL_COLORS[i],
}))

const heatmapCategories = Object.keys(CATEGORY_LABELS)

const radarCategories = [
  'Vuln Detection',
  'CVE Triage',
  'SAST Triage',
  'Threat Modeling',
  'Prompt Injection',
  'Jailbreak',
]

const radarSeries = leaderboardData.slice(0, 3).map((m, i) => ({
  name: m.model,
  color: MODEL_COLORS[i],
  values: [
    m.category_scores.vuln_detection ?? 70,
    m.category_scores.cve_triage ?? 70,
    m.category_scores.sast_triage ?? 70,
    m.category_scores.threat_modeling ?? 70,
    m.category_scores.prompt_injection ?? 70,
    m.category_scores.jailbreak ?? 70,
  ],
}))

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      {payload.map(p => (
        <div key={p.name} className={styles.tooltipRow}>
          <span>{p.name}</span>
          <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  )
}

export default function Visualizations() {
  useDocumentTitle('Benchmark Visualizations | Secure Gen')

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.title}>Benchmark Visualizations</h1>
          <p className={styles.subtitle}>Visual breakdown of model performance across attack categories and security task domains.</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className="container">

          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Multi-axis security capability radar</h2>
            <p className={styles.chartDesc}>Head-to-head radar comparison across top frontier models showing domain balance.</p>
            <div className={styles.chartWrap} style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart
                categories={radarCategories}
                series={radarSeries}
                size={380}
              />
            </div>
          </section>

          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Score by category and model</h2>
            <p className={styles.chartDesc}>How each model performs across all evaluated security domains.</p>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={barData} margin={{ top: 8, right: 24, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,19,0.07)" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6c6a64' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: '#6c6a64' }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16, color: '#6c6a64' }} />
                  {leaderboardData.map((m, i) => (
                    <Bar key={m.model} dataKey={m.model} fill={MODEL_COLORS[i]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Score vs. latency</h2>
            <p className={styles.chartDesc}>Cost-effectiveness quadrant. Top-left is ideal: high score, low latency.</p>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,19,0.07)" />
                  <XAxis dataKey="latency" name="Latency" unit="ms" tick={{ fontSize: 12, fill: '#6c6a64' }} label={{ value: 'Avg Latency (ms)', position: 'insideBottom', offset: -4, fontSize: 12, fill: '#8e8b82' }} />
                  <YAxis dataKey="score" name="Score" unit="%" tick={{ fontSize: 12, fill: '#6c6a64' }} domain={[40, 90]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className={styles.tooltip}>
                          <strong style={{ display: 'block', marginBottom: 4 }}>{d.model}</strong>
                          <div className={styles.tooltipRow}><span>Score</span><strong>{d.score}%</strong></div>
                          <div className={styles.tooltipRow}><span>Latency</span><strong>{d.latency}ms</strong></div>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={scatterData} name="Models">
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Model performance heatmap</h2>
            <p className={styles.chartDesc}>Each cell shows the score percentage for a given model and category. Darker coral = better performance.</p>
            <div className={styles.heatmap}>
              <div className={styles.heatmapHeader}>
                <div className={styles.heatmapCorner} />
                {leaderboardData.map(m => (
                  <div key={m.model} className={styles.heatmapColLabel}>{m.model.split('-').slice(0, 2).join('-')}</div>
                ))}
              </div>
              {heatmapCategories.map(cat => (
                <div key={cat} className={styles.heatmapRow}>
                  <div className={styles.heatmapRowLabel}>{CATEGORY_LABELS[cat]}</div>
                  {leaderboardData.map(m => {
                    const score = m.category_scores[cat] ?? 0
                    const alpha = score / 100
                    return (
                      <div
                        key={m.model}
                        className={styles.heatmapCell}
                        style={{ backgroundColor: `rgba(204, 120, 92, ${alpha * 0.85 + 0.08})` }}
                        title={`${m.model}: ${score}%`}
                      >
                        <span className={styles.heatmapScore}>{score}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>MITRE ATLAS adversarial coverage matrix</h2>
            <p className={styles.chartDesc}>Adversarial techniques evaluated across our red-teaming datasets with frontier model resistance rates.</p>
            <div className={styles.chartWrap}>
              <AtlasHeatmap />
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
