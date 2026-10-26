import styles from './RadarChart.module.css'

export interface RadarSeries {
  name: string
  color: string
  values: number[]
}

interface RadarChartProps {
  categories: string[]
  series: RadarSeries[]
  size?: number
}

export default function RadarChart({
  categories,
  series,
  size = 340,
}: RadarChartProps) {
  const center = size / 2
  const radius = center - 48
  const total = categories.length
  const angleStep = (Math.PI * 2) / total

  const rings = [0.25, 0.5, 0.75, 1.0]

  const getCoordinates = (index: number, factor: number) => {
    const angle = index * angleStep - Math.PI / 2
    const x = center + radius * factor * Math.cos(angle)
    const y = center + radius * factor * Math.sin(angle)
    return { x, y }
  }

  return (
    <div className={styles.wrapper}>
      <svg width={size} height={size} className={styles.svg} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ringFactor, rIdx) => {
          const points = categories
            .map((_, cIdx) => {
              const { x, y } = getCoordinates(cIdx, ringFactor)
              return `${x},${y}`
            })
            .join(' ')
          return (
            <polygon
              key={`ring-${rIdx}`}
              points={points}
              className={styles.webRing}
            />
          )
        })}

        {categories.map((cat, idx) => {
          const { x, y } = getCoordinates(idx, 1.0)
          const labelAngle = idx * angleStep - Math.PI / 2
          const lx = center + (radius + 22) * Math.cos(labelAngle)
          const ly = center + (radius + 22) * Math.sin(labelAngle)
          return (
            <g key={`axis-${cat}`}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className={styles.axisLine}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.categoryLabel}
              >
                {cat}
              </text>
            </g>
          )
        })}

        {series.map((s) => {
          const points = s.values
            .map((val, idx) => {
              const factor = Math.min(Math.max(val / 100, 0), 1)
              const { x, y } = getCoordinates(idx, factor)
              return `${x},${y}`
            })
            .join(' ')

          return (
            <g key={s.name}>
              <polygon
                points={points}
                fill={s.color}
                fillOpacity={0.22}
                stroke={s.color}
                strokeWidth={2}
                className={styles.seriesPolygon}
              />
              {s.values.map((val, idx) => {
                const factor = Math.min(Math.max(val / 100, 0), 1)
                const { x, y } = getCoordinates(idx, factor)
                return (
                  <circle
                    key={`dot-${s.name}-${idx}`}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill={s.color}
                    stroke="#faf9f5"
                    strokeWidth={1.5}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>

      <div className={styles.legend}>
        {series.map((s) => (
          <div key={`legend-${s.name}`} className={styles.legendItem}>
            <span className={styles.legendColor} style={{ backgroundColor: s.color }} />
            <span className={styles.legendLabel}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
