import { clsx } from 'clsx'
import styles from './Badge.module.css'

type Variant = 'default' | 'coral' | 'teal' | 'amber' | 'success' | 'error'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  uppercase?: boolean
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  uppercase = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        uppercase && styles.uppercase,
        className,
      )}
    >
      {children}
    </span>
  )
}
