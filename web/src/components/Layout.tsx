import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/runs', label: 'Run Explorer' },
  { to: '/playground', label: 'Playground' },
  { to: '/visualizations', label: 'Visualizations' },
  { to: '/datasets', label: 'Datasets' },
  { to: '/reports', label: 'Reports' },
]

export default function Layout() {
  return (
    <div className={styles.root}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <NavLink to="/" className={styles.wordmark}>
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
          <nav className={styles.navLinks}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.navActions}>
            <a
              href="https://github.com/RuchitAgrawal/Secure-Gen"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              GitHub
            </a>
            <a href="/playground" className={styles.ctaButton}>
              Try Playground
            </a>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
