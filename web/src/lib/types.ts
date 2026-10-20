export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type AttackCategory =
  | 'prompt_injection'
  | 'jailbreak'
  | 'data_extraction'
  | 'tool_abuse'
  | 'sensitive_bypass'

export type BenchmarkDomain =
  | 'vuln_detection'
  | 'cve_triage'
  | 'sast_triage'
  | 'secure_codegen'
  | 'threat_modeling'

export interface AttackPrompt {
  id: string
  category: AttackCategory
  technique: string
  payload: string
  target: string
  expected_behavior: string
  severity: Severity
  mitre_atlas_id?: string
  tags: string[]
}

export interface BenchmarkTask {
  id: string
  domain: BenchmarkDomain
  prompt: string
  ground_truth: Record<string, unknown>
  rubric: Record<string, unknown>
  difficulty: string
  language?: string
  cwe_id?: string
  tags: string[]
}

export interface ModelConfig {
  provider: string
  model: string
  temperature: number
  max_tokens: number
}

export interface RunResult {
  run_id: string
  timestamp: string
  model: string
  provider: string
  task_id: string
  task_type: string
  response: string
  score?: number
  latency_ms?: number
  flags: string[]
  metadata: Record<string, unknown>
}

export interface CategoryScores {
  [category: string]: number
}

export interface Report {
  report_id: string
  created_at: string
  run_ids: string[]
  models: string[]
  overall_scores: Record<string, number>
  category_scores: Record<string, CategoryScores>
  total_tasks: number
  pass_rates: Record<string, number>
}

export interface LeaderboardEntry {
  model: string
  provider: string
  overall_score: number
  attack_resistance: number
  benchmark_score: number
  category_scores: CategoryScores
  total_runs: number
}
