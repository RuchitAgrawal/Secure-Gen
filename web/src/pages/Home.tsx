import { Link } from 'react-router-dom'
import { leaderboardData, recentRuns, attackCategories } from '@/lib/demo-data'
import ScoreGauge from '@/components/ScoreGauge'
import Badge from '@/components/Badge'
import styles from './Home.module.css'

const STATS = [
  { value: '70+', label: 'Attack prompts' },
  { value: '34', label: 'Benchmark tasks' },
  { value: '5', label: 'LLM models evaluated' },
  { value: '425', label: 'Total runs' },
]

export default function Home() {
  const topModel = leaderboardData[0]

  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <Badge variant="default" uppercase className={styles.heroBadge}>
              Security Research
            </Badge>
            <h1 className={styles.heroTitle}>
              Red-team and benchmark LLMs on real security tasks
            </h1>
            <p className={styles.heroSub}>
              Secure Gen is an open framework for evaluating how well frontier models resist adversarial attacks and perform on vulnerability detection, CVE triage, SAST analysis, and threat modeling.
            </p>
            <div className={styles.heroActions}>
              <Link to="/playground" className={styles.ctaPrimary}>
                Try the Playground
              </Link>
              <Link to="/leaderboard" className={styles.ctaSecondary}>
                View Leaderboard
              </Link>
            </div>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <span className={styles.heroCardLabel}>Latest benchmark run</span>
              <Badge variant="success">Live</Badge>
            </div>
            <div className={styles.heroCardModels}>
              {leaderboardData.slice(0, 3).map(entry => (
                <div key={entry.model} className={styles.heroModelRow}>
                  <div className={styles.heroModelInfo}>
                    <span className={styles.heroModelName}>{entry.model}</span>
                    <span className={styles.heroModelProvider}>{entry.provider}</span>
                  </div>
                  <ScoreGauge score={entry.overall_score} size={64} dark />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map(stat => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What Secure Gen evaluates</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Attack Resistance</h3>
              <p className={styles.featureDesc}>Prompt injection, jailbreaks, data extraction, and tool abuse across 70+ curated adversarial prompts mapped to MITRE ATLAS.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Security Task Performance</h3>
              <p className={styles.featureDesc}>Vulnerability detection (CWE-grounded), CVE triage, SAST finding classification, and threat modeling with structured rubrics.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Head-to-head Comparison</h3>
              <p className={styles.featureDesc}>Compare models side-by-side on the same tasks. Identify which models are strongest on specific security domains.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.recentSection}>
        <div className="container">
          <div className={styles.recentHeader}>
            <h2 className={styles.sectionTitle}>Recent runs</h2>
            <Link to="/runs" className={styles.viewAll}>View all runs</Link>
          </div>
          <div className={styles.recentTable}>
            <div className={styles.tableRow + ' ' + styles.tableHead}>
              <span>Run ID</span>
              <span>Date</span>
              <span>Type</span>
              <span>Tasks</span>
              <span>Models</span>
              <span>Avg Score</span>
            </div>
            {recentRuns.map(run => (
              <Link to="/runs" key={run.id} className={styles.tableRow}>
                <span className={styles.runId}>{run.id}</span>
                <span className={styles.muted}>{run.date}</span>
                <Badge variant={run.type === 'attack' ? 'error' : 'teal'} className={styles.typeBadge}>
                  {run.type}
                </Badge>
                <span>{run.tasks}</span>
                <span>{run.models}</span>
                <span className={styles.score}>{run.avg_score}%</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.callout}>
        <div className="container">
          <div className={styles.calloutCard}>
            <h2 className={styles.calloutTitle}>Start red-teaming in minutes</h2>
            <p className={styles.calloutSub}>Use the playground to craft prompts and see how your target model responds. No setup required in demo mode.</p>
            <Link to="/playground" className={styles.calloutCta}>
              Open Playground
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <span className={styles.footerSpike} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="2.34" y1="2.34" x2="13.66" y2="13.66" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="13.66" y1="2.34" x2="2.34" y2="13.66" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </span>
              Secure Gen
            </div>
            <div className={styles.footerLinks}>
              <a href="https://github.com/RuchitAgrawal/Secure-Gen" target="_blank" rel="noopener noreferrer">GitHub</a>
              <Link to="/datasets">Datasets</Link>
              <Link to="/reports">Reports</Link>
            </div>
            <span className={styles.footerMeta}>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
