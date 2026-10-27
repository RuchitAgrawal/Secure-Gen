import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Modal from '@/components/Modal'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Overview', end: true, key: '1' },
  { to: '/leaderboard', label: 'Leaderboard', key: '2' },
  { to: '/runs', label: 'Run Explorer', key: '3' },
  { to: '/playground', label: 'Playground', key: '4' },
  { to: '/visualizations', label: 'Visualizations', key: '5' },
  { to: '/datasets', label: 'Datasets', key: '6' },
  { to: '/reports', label: 'Reports', key: '7' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setShortcutsOpen(prev => !prev)
      } else if (e.key === '1') {
        navigate('/')
      } else if (e.key === '2') {
        navigate('/leaderboard')
      } else if (e.key === '3') {
        navigate('/runs')
      } else if (e.key === '4') {
        navigate('/playground')
      } else if (e.key === '5') {
        navigate('/visualizations')
      } else if (e.key === '6') {
        navigate('/datasets')
      } else if (e.key === '7') {
        navigate('/reports')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div className={styles.root}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <NavLink to="/" className={styles.wordmark} onClick={() => setMenuOpen(false)}>
            <span className={styles.spike} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
                <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="2.34" y1="2.34" x2="13.66" y2="13.66" stroke="currentColor" strokeWidth="1.5" />
                <line x1="13.66" y1="2.34" x2="2.34" y2="13.66" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            Secure Gen
          </NavLink>
          <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`} aria-label="Main navigation">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.navActions}>
            <button
              type="button"
              className={styles.shortcutBtn}
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts (?)"
              aria-label="View keyboard shortcuts"
            >
              ?
            </button>
            <a
              href="https://github.com/RuchitAgrawal/Secure-Gen"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
              aria-label="View source on GitHub"
            >
              GitHub
            </a>
            <NavLink to="/playground" className={styles.ctaButton}>
              Try Playground
            </NavLink>
            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={`${styles.menuBar} ${menuOpen ? styles.menuBarOpen : ''}`} />
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>

      <Modal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard Navigation Shortcuts"
        subtitle="Quickly jump between views across the platform"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {navItems.map(item => (
            <div
              key={item.to}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.25rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{item.label}</span>
              <kbd
                style={{
                  background: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-primary)',
                }}
              >
                {item.key}
              </kbd>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.25rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Toggle Shortcuts Modal</span>
            <kbd
              style={{
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary)',
              }}
            >
              ?
            </kbd>
          </div>
        </div>
      </Modal>
    </div>
  )
}
