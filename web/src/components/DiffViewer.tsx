import styles from './DiffViewer.module.css'

interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  lineNumber?: number
}

interface DiffViewerProps {
  before: string
  after: string
  filename?: string
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.trim().split('\n')
  const afterLines = after.trim().split('\n')
  const lines: DiffLine[] = []

  const maxLen = Math.max(beforeLines.length, afterLines.length)
  for (let i = 0; i < maxLen; i++) {
    const b = beforeLines[i]
    const a = afterLines[i]
    if (b !== undefined && a !== undefined) {
      if (b === a) {
        lines.push({ type: 'context', content: b, lineNumber: i + 1 })
      } else {
        lines.push({ type: 'remove', content: b })
        lines.push({ type: 'add', content: a })
      }
    } else if (b !== undefined) {
      lines.push({ type: 'remove', content: b })
    } else {
      lines.push({ type: 'add', content: a })
    }
  }
  return lines
}

export default function DiffViewer({ before, after, filename }: DiffViewerProps) {
  const diff = computeDiff(before, after)

  return (
    <div className={styles.wrapper}>
      {filename && (
        <div className={styles.header}>
          <span className={styles.filename}>{filename}</span>
          <div className={styles.legend}>
            <span className={styles.legendAdd}>+ added</span>
            <span className={styles.legendRemove}>- removed</span>
          </div>
        </div>
      )}
      <div className={styles.scroll}>
        <pre className={styles.pre}>
          {diff.map((line, i) => (
            <div key={i} className={`${styles.line} ${styles[line.type]}`}>
              <span className={styles.gutter}>
                {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
              </span>
              <code className={styles.code}>{line.content}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
