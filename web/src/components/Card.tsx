import { clsx } from 'clsx'
import styles from './Card.module.css'

type Surface = 'cream' | 'dark' | 'coral'

interface CardProps {
  surface?: Surface
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export default function Card({
  surface = 'cream',
  padding = 'lg',
  children,
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[surface],
        styles[`pad-${padding}`],
        className,
      )}
    >
      {children}
    </div>
  )
}
