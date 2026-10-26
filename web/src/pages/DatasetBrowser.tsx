import { useState } from 'react'
import { useDocumentTitle, useDebounce } from '@/lib/hooks'
import Badge from '@/components/Badge'
import { useToast } from '@/components/Toast'
import { downloadJsonFile, copyToClipboard } from '@/lib/export'
import { attackCategories, benchmarkDomains } from '@/lib/demo-data'
import styles from './DatasetBrowser.module.css'

const SAMPLE_ATTACKS = [
  { id: 'pi_direct_001', category: 'prompt_injection', technique: 'direct_override', severity: 'high', mitre_atlas_id: 'AML.T0051.000', tags: ['direct', 'instruction-override'] },
  { id: 'pi_indirect_001', category: 'prompt_injection', technique: 'tool_output_injection', severity: 'critical', mitre_atlas_id: 'AML.T0054.003', tags: ['indirect', 'tool-output'] },
  { id: 'pi_supply_001', category: 'prompt_injection', technique: 'rag_document_injection', severity: 'critical', mitre_atlas_id: 'AML.T0054.003', tags: ['rag', 'document-injection'] },
  { id: 'pi_supply_002', category: 'prompt_injection', technique: 'email_content_injection', severity: 'critical', mitre_atlas_id: 'AML.T0054.000', tags: ['email-injection', 'agentic-attack'] },
  { id: 'jb_roleplay_001', category: 'jailbreak', technique: 'persona_roleplay', severity: 'high', mitre_atlas_id: 'AML.T0051.001', tags: ['persona', 'roleplay'] },
  { id: 'jb_encode_001', category: 'jailbreak', technique: 'base64_encoding', severity: 'high', mitre_atlas_id: 'AML.T0051.007', tags: ['base64', 'encoding'] },
  { id: 'jb_authority_001', category: 'jailbreak', technique: 'authority_claim', severity: 'high', mitre_atlas_id: 'AML.T0051.005', tags: ['authority-spoof', 'phishing'] },
  { id: 'jb_escalation_001', category: 'jailbreak', technique: 'gradual_escalation', severity: 'high', mitre_atlas_id: 'AML.T0051.010', tags: ['gradual-escalation', 'social-engineering'] },
  { id: 'de_sysprompt_001', category: 'data_extraction', technique: 'direct_elicitation', severity: 'critical', mitre_atlas_id: 'AML.T0056.000', tags: ['system-prompt', 'direct'] },
  { id: 'ta_func_001', category: 'tool_abuse', technique: 'function_hijacking', severity: 'critical', mitre_atlas_id: 'AML.T0054.008', tags: ['function-calling', 'email-exfiltration'] },
  { id: 'ta_func_002', category: 'tool_abuse', technique: 'ssrf_via_agent', severity: 'critical', mitre_atlas_id: 'AML.T0054.009', tags: ['ssrf', 'aws-metadata'] },
  { id: 'ta_func_003', category: 'tool_abuse', technique: 'shell_command_injection', severity: 'critical', mitre_atlas_id: 'AML.T0054.010', tags: ['shell', 'command-injection', 'agentic'] },
]

const SAMPLE_TASKS = [
  { id: 'vd_python_001', domain: 'vuln_detection', difficulty: 'easy', language: 'python', cwe_id: 'CWE-89', tags: ['sql-injection', 'flask'] },
  { id: 'vd_js_001', domain: 'vuln_detection', difficulty: 'easy', language: 'javascript', cwe_id: 'CWE-79', tags: ['xss', 'nodejs'] },
  { id: 'vd_python_002', domain: 'vuln_detection', difficulty: 'medium', language: 'python', cwe_id: 'CWE-78', tags: ['command-injection', 'subprocess'] },
  { id: 'vd_go_001', domain: 'vuln_detection', difficulty: 'medium', language: 'go', cwe_id: 'CWE-22', tags: ['path-traversal', 'http'] },
  { id: 'cve_001', domain: 'cve_triage', difficulty: 'easy', language: null, cwe_id: null, tags: ['rce', 'log4j'] },
  { id: 'cve_003', domain: 'cve_triage', difficulty: 'medium', language: null, cwe_id: null, tags: ['dos', 'http2'] },
  { id: 'cve_006', domain: 'cve_triage', difficulty: 'hard', language: null, cwe_id: null, tags: ['supply-chain', 'xz-utils'] },
  { id: 'sast_001', domain: 'sast_triage', difficulty: 'medium', language: 'python', cwe_id: null, tags: ['subprocess', 'false-positive'] },
  { id: 'sast_003', domain: 'sast_triage', difficulty: 'hard', language: 'java', cwe_id: null, tags: ['deserialization', 'true-positive'] },
  { id: 'tm_002', domain: 'threat_modeling', difficulty: 'hard', language: null, cwe_id: null, tags: ['llm', 'ai-security'] },
  { id: 'sc_python_001', domain: 'secure_codegen', difficulty: 'easy', language: 'python', cwe_id: 'CWE-89', tags: ['sql-injection', 'parameterized-query'] },
  { id: 'sc_python_002', domain: 'secure_codegen', difficulty: 'easy', language: 'python', cwe_id: 'CWE-916', tags: ['password-hashing', 'bcrypt'] },
]

type Tab = 'attacks' | 'tasks'

export default function DatasetBrowser() {
  useDocumentTitle('Dataset Browser')
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('attacks')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  const debouncedSearch = useDebounce(search, 200)

  const filteredAttacks = SAMPLE_ATTACKS.filter(a => {
    const matchSearch = !debouncedSearch || a.id.includes(debouncedSearch) || a.technique.includes(debouncedSearch) || a.tags.some(t => t.includes(debouncedSearch))
    const matchCat = !catFilter || a.category === catFilter
    return matchSearch && matchCat
  })

  const filteredTasks = SAMPLE_TASKS.filter(t => {
    const matchSearch = !debouncedSearch || t.id.includes(debouncedSearch) || t.domain.includes(debouncedSearch) || t.tags.some(tag => tag.includes(debouncedSearch))
    const matchCat = !catFilter || t.domain === catFilter
    return matchSearch && matchCat
  })

  const handleExport = () => {
    const items = tab === 'attacks' ? filteredAttacks : filteredTasks
    downloadJsonFile(items, `securegen_${tab}_${Date.now()}.json`)
    showToast(`Exported ${items.length} ${tab} items to JSON`, 'success')
  }

  const handleCopyId = async (id: string) => {
    const ok = await copyToClipboard(id)
    if (ok) showToast(`Copied ${id} to clipboard`, 'info')
  }

  const severityVariant = (s: string) => {
    if (s === 'critical') return 'error' as const
    if (s === 'high') return 'amber' as const
    return 'default' as const
  }

  const difficultyVariant = (d: string) => {
    if (d === 'hard') return 'error' as const
    if (d === 'medium') return 'amber' as const
    return 'success' as const
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.title}>Dataset Browser</h1>
          <p className={styles.subtitle}>Browse all attack prompts and benchmark tasks. Filter by category, technique, or search by keyword.</p>
          <div className={styles.statsRow}>
            {attackCategories.map(c => (
              <div key={c.id} className={styles.statChip}>
                <span className={styles.statDot} style={{ backgroundColor: c.color }} />
                <span>{c.count} {c.label}</span>
              </div>
            ))}
            {benchmarkDomains.map(d => (
              <div key={d.id} className={styles.statChip}>
                <span>{d.count} {d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="container">
          <div className={styles.controls}>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tab === 'attacks' ? styles.tabActive : ''}`} onClick={() => { setTab('attacks'); setCatFilter('') }}>
                Attack Prompts ({filteredAttacks.length})
              </button>
              <button className={`${styles.tab} ${tab === 'tasks' ? styles.tabActive : ''}`} onClick={() => { setTab('tasks'); setCatFilter('') }}>
                Benchmark Tasks ({filteredTasks.length})
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                className={styles.search}
                type="search"
                placeholder="Search by ID, tag, or technique..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="dataset-search"
              />
              <button
                type="button"
                onClick={handleExport}
                className={styles.tab}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className={styles.categoryFilters}>
            <button className={`${styles.catBtn} ${!catFilter ? styles.catBtnActive : ''}`} onClick={() => setCatFilter('')}>All</button>
            {(tab === 'attacks' ? attackCategories : benchmarkDomains.map(d => ({ id: d.id, label: d.label }))).map(c => (
              <button key={c.id} className={`${styles.catBtn} ${catFilter === c.id ? styles.catBtnActive : ''}`} onClick={() => setCatFilter(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className={styles.list}>
            {tab === 'attacks' && filteredAttacks.map(a => (
              <div key={a.id} className={styles.item}>
                <div className={styles.itemTop}>
                  <code
                    className={styles.itemId}
                    onClick={() => handleCopyId(a.id)}
                    title="Click to copy ID"
                    style={{ cursor: 'pointer' }}
                  >
                    {a.id}
                  </code>
                  <div className={styles.itemBadges}>
                    <Badge variant={severityVariant(a.severity)}>{a.severity}</Badge>
                    <Badge variant="default">{a.category.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.technique}>{a.technique.replace(/_/g, ' ')}</span>
                  {a.mitre_atlas_id && <span className={styles.mitre}>{a.mitre_atlas_id}</span>}
                </div>
                <div className={styles.tags}>
                  {a.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            ))}

            {tab === 'tasks' && filteredTasks.map(t => (
              <div key={t.id} className={styles.item}>
                <div className={styles.itemTop}>
                  <code
                    className={styles.itemId}
                    onClick={() => handleCopyId(t.id)}
                    title="Click to copy ID"
                    style={{ cursor: 'pointer' }}
                  >
                    {t.id}
                  </code>
                  <div className={styles.itemBadges}>
                    <Badge variant={difficultyVariant(t.difficulty)}>{t.difficulty}</Badge>
                    <Badge variant="teal">{t.domain.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
                <div className={styles.itemMeta}>
                  {t.language && <span className={styles.technique}>{t.language}</span>}
                  {t.cwe_id && <span className={styles.mitre}>{t.cwe_id}</span>}
                </div>
                <div className={styles.tags}>
                  {t.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
            ))}

            {((tab === 'attacks' && filteredAttacks.length === 0) || (tab === 'tasks' && filteredTasks.length === 0)) && (
              <div className={styles.empty}>No items match your search or filter.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
