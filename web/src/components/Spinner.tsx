import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: number
  dark?: boolean
}

export default function Spinner({ size = 20, dark = false }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${dark ? styles.dark : ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}
