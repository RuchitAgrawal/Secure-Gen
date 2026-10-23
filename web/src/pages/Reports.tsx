import { recentRuns } from '@/lib/demo-data'
import Badge from '@/components/Badge'
import styles from './Reports.module.css'

const REPORT_FILES = recentRuns.map(r => ({
  ...r,
  filename: `${r.id}.md`,
  size: `${Math.floor(12 + Math.random() * 40)} KB`,
}))

export default function Reports() {
  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>Generated reports from benchmark and attack runs. Download as Markdown or JSON.</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className="container">
          <div className={styles.howTo}>
            <h2 className={styles.howTitle}>Generate a report via CLI</h2>
            <div className={styles.codeBlock}>
              <pre className={styles.pre}>
                <code>{`# Run a benchmark and generate a report
securegen benchmark run --dataset datasets/security_tasks/cve_triage.json \\
  --model openai:gpt-4o --model anthropic:claude-3-5-sonnet

securegen report generate --run runs/bench_cve_triage.json --format md`}</code>
              </pre>
            </div>
          </div>

          <div className={styles.tableSection}>
            <h2 className={styles.sectionLabel}>Available reports</h2>
            <div className={styles.table}>
              <div className={`${styles.row} ${styles.thead}`}>
                <span>Run ID</span>
                <span>Date</span>
                <span>Type</span>
                <span>Tasks</span>
                <span>Avg Score</span>
                <span>Download</span>
              </div>
              {REPORT_FILES.map(r => (
                <div key={r.id} className={styles.row}>
                  <div>
                    <div className={styles.runId}>{r.id}</div>
                    <div className={styles.filename}>{r.filename}</div>
                  </div>
                  <span className={styles.muted}>{r.date}</span>
                  <Badge variant={r.type === 'attack' ? 'error' : 'teal'}>{r.type}</Badge>
                  <span>{r.tasks}</span>
                  <span className={styles.score}>{r.avg_score}%</span>
                  <div className={styles.downloadLinks}>
                    <a href="#" className={styles.downloadLink} onClick={e => e.preventDefault()}>MD</a>
                    <a href="#" className={styles.downloadLink} onClick={e => e.preventDefault()}>JSON</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.calloutSection}>
            <div className={styles.calloutCard}>
              <div className={styles.calloutContent}>
                <h3 className={styles.calloutTitle}>Share results publicly</h3>
                <p className={styles.calloutText}>Export your run as JSON and open a pull request to the dataset repository to contribute findings to the community.</p>
              </div>
              <a
                href="https://github.com/RuchitAgrawal/Secure-Gen"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.calloutCta}
              >
                Contribute findings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
