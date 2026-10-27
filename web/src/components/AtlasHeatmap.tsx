import styles from './AtlasHeatmap.module.css'

export interface AtlasTechnique {
  id: string
  name: string
  tactic: string
  testCount: number
  resistanceScore: number
}

const DEFAULT_TECHNIQUES: AtlasTechnique[] = [
  { id: 'AML.T0051.000', name: 'Direct Override', tactic: 'Initial Access', testCount: 20, resistanceScore: 78 },
  { id: 'AML.T0051.001', name: 'Persona Roleplay', tactic: 'Initial Access', testCount: 20, resistanceScore: 82 },
  { id: 'AML.T0051.007', name: 'Base64 Obfuscation', tactic: 'Initial Access', testCount: 8, resistanceScore: 89 },
  { id: 'AML.T0054.003', name: 'RAG Doc Injection', tactic: 'Execution', testCount: 5, resistanceScore: 64 },
  { id: 'AML.T0054.008', name: 'Function Hijacking', tactic: 'Execution', testCount: 15, resistanceScore: 71 },
  { id: 'AML.T0054.004', name: 'Interpreter Escape', tactic: 'Execution', testCount: 5, resistanceScore: 86 },
  { id: 'AML.T0056.000', name: 'System Prompt Extraction', tactic: 'Exfiltration', testCount: 15, resistanceScore: 69 },
  { id: 'AML.T0048.000', name: 'Model Card Poisoning', tactic: 'Resource Dev', testCount: 5, resistanceScore: 92 },
]

interface AtlasHeatmapProps {
  techniques?: AtlasTechnique[]
}

export default function AtlasHeatmap({ techniques = DEFAULT_TECHNIQUES }: AtlasHeatmapProps) {
  const tactics = Array.from(new Set(techniques.map(t => t.tactic)))

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-teal)'
    if (score >= 70) return 'var(--color-primary)'
    return '#c94a4a'
  }

  return (
    <div className={styles.container}>
      <div className={styles.tacticColumns}>
        {tactics.map(tactic => {
          const group = techniques.filter(t => t.tactic === tactic)
          return (
            <div key={tactic} className={styles.tacticCol}>
              <div className={styles.tacticHeader}>
                <span className={styles.tacticTitle}>{tactic}</span>
                <span className={styles.tacticCount}>{group.length}</span>
              </div>
              <div className={styles.cardList}>
                {group.map(t => (
                  <div key={t.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <code className={styles.techId}>{t.id}</code>
                      <span
                        className={styles.scorePill}
                        style={{ color: getScoreColor(t.resistanceScore), borderColor: getScoreColor(t.resistanceScore) }}
                      >
                        {t.resistanceScore}%
                      </span>
                    </div>
                    <div className={styles.techName}>{t.name}</div>
                    <div className={styles.cardFooter}>
                      <span className={styles.testCount}>{t.testCount} tests</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
