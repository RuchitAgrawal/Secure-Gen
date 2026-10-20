import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'secondary-dark' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.btn,
        styles[variant],
        styles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
