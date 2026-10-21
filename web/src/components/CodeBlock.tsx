import styles from './CodeBlock.module.css'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
}

export default function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const lines = code.trim().split('\n')

  return (
    <div className={styles.wrapper}>
      {filename && (
        <div className={styles.header}>
          <span className={styles.filename}>{filename}</span>
          <span className={styles.lang}>{language}</span>
        </div>
      )}
      <div className={styles.scroll}>
        <pre className={styles.pre}>
          {showLineNumbers && (
            <div className={styles.lineNumbers} aria-hidden="true">
              {lines.map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          )}
          <code className={styles.code}>{code.trim()}</code>
        </pre>
      </div>
    </div>
  )
}
