import styles from './ScoreGauge.module.css'

interface ScoreGaugeProps {
  score: number
  size?: number
  label?: string
  dark?: boolean
}

export default function ScoreGauge({
  score,
  size = 80,
  label,
  dark = false,
}: ScoreGaugeProps) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const offset = circumference - (clampedScore / 100) * circumference

  const color =
    clampedScore >= 75
      ? '#5db872'
      : clampedScore >= 50
        ? '#e8a55a'
        : '#c64545'

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        className={styles.svg}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={dark ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,19,0.08)'}
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          className={styles.arc}
        />
      </svg>
      <div className={`${styles.label} ${dark ? styles.labelDark : ''}`}>
        <span className={styles.score}>{Math.round(clampedScore)}</span>
        {label && <span className={styles.sublabel}>{label}</span>}
      </div>
    </div>
  )
}
