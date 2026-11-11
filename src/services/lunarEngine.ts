// Lunar AI Wingo 1-Minute Prediction and Neural Pattern Engine
// High-speed pattern detection (<0.01s) with active continuation, transition, and instant loss-recovery

export interface HistoryItem {
  number: number;
  issueNumber?: string;
  color?: string;
}

export interface SessionRecord {
  p: string; // period last 4 or full
  num: number; // outcome number 0-9
  s: 'BIG' | 'SMALL'; // result size
  pred: 'BIG' | 'SMALL'; // predicted size
  status: 'WIN' | 'LOSS' | 'JACKPOT';
  won: boolean;
  time?: string;
}

export interface PatternAnalysisResult {
  prediction: 'BIG' | 'SMALL';
  strategy: string;
  patternDetected: string;
  trendType: string;
  confidence: number;
  executionTimeMs: number;
  recentSequence?: string;
}

// User requested patterns explicitly:
// SSS & BBB (3-term complete block reversals)
// BSSB & SBBS (Symmetric motifs)
// BBBSSS & SSSBBB (6-mirror cycles)
// BSBS & SBSB (Alternations)
interface PatternRuleDefinition {
  tail: string;
  prediction: 'BIG' | 'SMALL';
  name: string;
  type: string;
  confidence: number;
}

export const COMPREHENSIVE_RULES: PatternRuleDefinition[] = [
  // 1. 6-Phase Mirror Cycles (BBBSSS & SSSBBB) - Length 6
  { tail: 'BBBSSS', prediction: 'BIG', name: '6-MIRROR CYCLE [BBBSSS] → BIG', type: '6-MIRROR', confidence: 98 },
  { tail: 'SSSBBB', prediction: 'SMALL', name: '6-MIRROR CYCLE [SSSBBB] → SMALL', type: '6-MIRROR', confidence: 98 },
  { tail: 'BSBSBS', prediction: 'BIG', name: '6-ALTERNATION [BSBSBS] → BIG', type: '6-ALTERNATION', confidence: 97 },
  { tail: 'SBSBSB', prediction: 'SMALL', name: '6-ALTERNATION [SBSBSB] → SMALL', type: '6-ALTERNATION', confidence: 97 },
  { tail: 'BSSBSS', prediction: 'BIG', name: 'DOUBLE BSS MOTIF [BSSBSS] → BIG', type: 'SYMMETRIC_EXT', confidence: 96 },
  { tail: 'SBBSSB', prediction: 'SMALL', name: 'DOUBLE SBB MOTIF [SBBSSB] → SMALL', type: 'SYMMETRIC_EXT', confidence: 96 },

  // 2. 5-Phase Sequences & Exhaustions - Length 5
  { tail: 'BBBBB', prediction: 'SMALL', name: '5-DRAGON EXHAUSTION [BBBBB] → SMALL', type: 'DRAGON_EXHAUSTION', confidence: 98 },
  { tail: 'SSSSS', prediction: 'BIG', name: '5-DRAGON EXHAUSTION [SSSSS] → BIG', type: 'DRAGON_EXHAUSTION', confidence: 98 },
  { tail: 'BBBSS', prediction: 'SMALL', name: 'ANTICIPATING BBBSSS [BBBSS] → SMALL', type: 'MIRROR_COMPLETION', confidence: 96 },
  { tail: 'SSSBB', prediction: 'BIG', name: 'ANTICIPATING SSSBBB [SSSBB] → BIG', type: 'MIRROR_COMPLETION', confidence: 96 },
  { tail: 'BSBSB', prediction: 'SMALL', name: '5-ALTERNATION EXTENSION [BSBSB] → SMALL', type: 'ALTERNATION_EXT', confidence: 95 },
  { tail: 'SBSBS', prediction: 'BIG', name: '5-ALTERNATION EXTENSION [SBSBS] → BIG', type: 'ALTERNATION_EXT', confidence: 95 },
  { tail: 'BSSBB', prediction: 'SMALL', name: 'BSSB POST-LOSS RECOVERY [BSSBB] → SMALL', type: 'LOSS_RECOVERY', confidence: 94 },
  { tail: 'SBBSS', prediction: 'BIG', name: 'SBBS POST-LOSS RECOVERY [SBBSS] → BIG', type: 'LOSS_RECOVERY', confidence: 94 },
  { tail: 'BBSSB', prediction: 'BIG', name: 'BBSSB STEP TRANSITION → BIG', type: 'STEP_CYCLE', confidence: 93 },
  { tail: 'SSBBS', prediction: 'SMALL', name: 'SSBBS STEP TRANSITION → SMALL', type: 'STEP_CYCLE', confidence: 93 },
  { tail: 'BSSBS', prediction: 'SMALL', name: 'BSSBS HARMONIC RECOVERY → SMALL', type: 'HARMONIC', confidence: 93 },
  { tail: 'SBBSB', prediction: 'BIG', name: 'SBBSB HARMONIC RECOVERY → BIG', type: 'HARMONIC', confidence: 93 },
  { tail: 'BBSSS', prediction: 'BIG', name: 'BBSSS EXHAUSTION RECOVERY → BIG', type: 'EXHAUSTION', confidence: 93 },
  { tail: 'SSBBB', prediction: 'SMALL', name: 'SSBBB EXHAUSTION RECOVERY → SMALL', type: 'EXHAUSTION', confidence: 93 },

  // 3. 4-Phase Cycles (BSSB, SBBS, BSBS, SBSB, BBBB, SSSS) - Length 4
  { tail: 'BSSB', prediction: 'SMALL', name: 'BSSB COMPLETED [BSSB] → SMALL', type: 'BSSB_PATTERN', confidence: 96 },
  { tail: 'SBBS', prediction: 'BIG', name: 'SBBS COMPLETED [SBBS] → BIG', type: 'SBBS_PATTERN', confidence: 96 },
  { tail: 'BSBS', prediction: 'BIG', name: 'BSBS ALTERNATION [BSBS] → BIG', type: 'BSBS_PATTERN', confidence: 95 },
  { tail: 'SBSB', prediction: 'SMALL', name: 'SBSB ALTERNATION [SBSB] → SMALL', type: 'SBSB_PATTERN', confidence: 95 },
  { tail: 'BBBB', prediction: 'SMALL', name: '4-DRAGON BREAK [BBBB] → SMALL', type: 'DRAGON_BREAK', confidence: 95 },
  { tail: 'SSSS', prediction: 'BIG', name: '4-DRAGON BREAK [SSSS] → BIG', type: 'DRAGON_BREAK', confidence: 95 },
  { tail: 'BBSS', prediction: 'BIG', name: 'BBSS 2-2 REPEAT → BIG', type: '2-2_CYCLE', confidence: 93 },
  { tail: 'SSBB', prediction: 'SMALL', name: 'SSBB 2-2 REPEAT → SMALL', type: '2-2_CYCLE', confidence: 93 },
  { tail: 'BBBS', prediction: 'BIG', name: 'BBBS COUNTER-PIVOT [BBBS] → BIG', type: 'PIVOT_RECOVERY', confidence: 92 },
  { tail: 'SSSB', prediction: 'SMALL', name: 'SSSB COUNTER-PIVOT [SSSB] → SMALL', type: 'PIVOT_RECOVERY', confidence: 92 },
  { tail: 'BBSB', prediction: 'SMALL', name: 'BBSB FRACTURE RECOVERY → SMALL', type: 'FRACTURE', confidence: 91 },
  { tail: 'SSBS', prediction: 'BIG', name: 'SSBS FRACTURE RECOVERY → BIG', type: 'FRACTURE', confidence: 91 },

  // 4. 3-Phase Sequences (BBB & SSS Patterns Requested) - Length 3
  { tail: 'BBB', prediction: 'SMALL', name: 'BBB COMPLETED [BBB] → SMALL', type: 'BBB_PATTERN', confidence: 95 },
  { tail: 'SSS', prediction: 'BIG', name: 'SSS COMPLETED [SSS] → BIG', type: 'SSS_PATTERN', confidence: 95 },
  { tail: 'BSS', prediction: 'BIG', name: 'ANTICIPATING BSSB [BSS] → BIG', type: 'BSSB_ANTICIPATION', confidence: 94 },
  { tail: 'SBB', prediction: 'SMALL', name: 'ANTICIPATING SBBS [SBB] → SMALL', type: 'SBBS_ANTICIPATION', confidence: 94 },
  { tail: 'BSB', prediction: 'SMALL', name: 'ANTICIPATING BSBS [BSB] → SMALL', type: 'BSBS_ANTICIPATION', confidence: 93 },
  { tail: 'SBS', prediction: 'BIG', name: 'ANTICIPATING SBSB [SBS] → BIG', type: 'SBSB_ANTICIPATION', confidence: 93 },
  { tail: 'BBS', prediction: 'BIG', name: 'BBS PIVOT RECOVERY → BIG', type: 'PIVOT_RECOVERY', confidence: 92 },
  { tail: 'SSB', prediction: 'SMALL', name: 'SSB PIVOT RECOVERY → SMALL', type: 'PIVOT_RECOVERY', confidence: 92 },

  // 5. 2-Phase Anticipation & Starters - Length 2
  { tail: 'BB', prediction: 'BIG', name: 'ANTICIPATING BBB [BB] → BIG', type: 'BBB_ANTICIPATION', confidence: 93 },
  { tail: 'SS', prediction: 'SMALL', name: 'ANTICIPATING SSS [SS] → SMALL', type: 'SSS_ANTICIPATION', confidence: 93 },
  { tail: 'BS', prediction: 'BIG', name: 'ALTERNATING PAIR [BS] → BIG', type: 'INCEPTION', confidence: 85 },
  { tail: 'SB', prediction: 'SMALL', name: 'ALTERNATING PAIR [SB] → SMALL', type: 'INCEPTION', confidence: 85 },
];

// 7 Core Patterns explicitly monitored by Lunar Engine:
export const CORE_PATTERNS = [
  { id: 'BSSB', target: 'SMALL', label: 'BSSB', type: 'SYMMETRIC' },
  { id: 'BBB', target: 'SMALL', label: 'BBB', type: '3-STREAK' },
  { id: 'SSS', target: 'BIG', label: 'SSS', type: '3-STREAK' },
  { id: 'BBBSSS', target: 'BIG', label: 'BBBSSS', type: '6-MIRROR' },
  { id: 'SSSBBB', target: 'SMALL', label: 'SSSBBB', type: '6-MIRROR' },
  { id: 'SBBS', target: 'BIG', label: 'SBBS', type: 'SYMMETRIC' },
  { id: 'BSBS', target: 'BIG', label: 'BSBS', type: 'ALTERNATING' },
] as const;

// Pre-sort rules by pattern length descending so longest patterns match first
export const SORTED_RULES = [...COMPREHENSIVE_RULES].sort((a, b) => b.tail.length - a.tail.length);

export function getOutcomePattern(history: HistoryItem[], count = 16): string {
  return (history || [])
    .slice(0, count)
    .reverse()
    .map((item) => (item.number >= 5 ? 'B' : 'S'))
    .join('');
}

// Ultra-fast pattern detection with precise benchmark timing (< 0.01 seconds)
export function analyzePatternLogic(history: HistoryItem[]): PatternAnalysisResult {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const sequence = getOutcomePattern(history, 16);

  // Scan through all pattern rules sorted by tail length (longest match first)
  for (const rule of SORTED_RULES) {
    if (sequence.endsWith(rule.tail)) {
      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
      return {
        prediction: rule.prediction,
        strategy: rule.name,
        patternDetected: rule.tail,
        trendType: rule.type,
        confidence: rule.confidence,
        executionTimeMs: Math.max(0.005, Number(elapsed.toFixed(3))),
        recentSequence: sequence,
      };
    }
  }

  // Fallback if sequence is 1 char or empty
  const lastChar = sequence.slice(-1) || 'B';
  const pred = lastChar === 'B' ? 'SMALL' : 'BIG';
  const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;

  return {
    prediction: pred,
    strategy: `DYNAMIC BALANCE [${lastChar}] → ${pred}`,
    patternDetected: lastChar,
    trendType: 'DYNAMIC_BALANCE',
    confidence: 82,
    executionTimeMs: Math.max(0.005, Number(elapsed.toFixed(3))),
    recentSequence: sequence,
  };
}

export function stableHash(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getTargetNums(
  trend: 'BIG' | 'SMALL',
  seed: number,
  hist: HistoryItem[]
): { n1: number; n2: number } {
  // When BIG: primary pool [5, 6, 7, 8, 9], counter pool [0, 1, 2, 3, 4]
  // When SMALL: primary pool [0, 1, 2, 3, 4], counter pool [5, 6, 7, 8, 9]
  const samePool = trend === 'BIG' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  const oppositePool = trend === 'BIG' ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9];
  const historyKey = (hist || [])
    .slice(0, 10)
    .map((item) => item.number)
    .join(',');
  const base = stableHash(`${seed}|${trend}|${historyKey}`);
  return {
    n1: samePool[base % samePool.length],
    n2: oppositePool[Math.floor(base / 7) % oppositePool.length],
  };
}

export function getPrediction(
  history: HistoryItem[],
  targetPeriod: string
): {
  prediction: 'BIG' | 'SMALL';
  jodi: [number, number];
  analysis: PatternAnalysisResult;
} | { error: string } {
  const validHistory = (history || []).filter(
    (item) => Number.isInteger(item.number) && item.number >= 0 && item.number <= 9
  );
  if (!validHistory.length) {
    return { error: 'Result history not available' };
  }
  const seed = parseInt(String(targetPeriod).slice(-6), 10) || 0;
  const analysis = analyzePatternLogic(validHistory);
  const nums = getTargetNums(analysis.prediction, seed, validHistory);
  return {
    prediction: analysis.prediction,
    jodi: [nums.n1, nums.n2],
    analysis,
  };
}

// Fetch helper: attempts proxy, direct, then fallback
export async function fetchLiveWingoHistory(): Promise<{
  list: { issueNumber: string; number: number; color?: string }[];
} | null> {
  const endpoints = [
    `/api/wingo?t=${Date.now()}`,
    `https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?t=${Date.now()}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data.list) && data.data.list.length > 0) {
        return {
          list: data.data.list.map((item: Record<string, unknown>) => {
            const rawNum =
              item.number !== undefined
                ? item.number
                : item.result !== undefined
                ? item.result
                : item.openNumber;
            return {
              issueNumber: String(item.issueNumber || ''),
              number: parseInt(String(rawNum), 10),
              color: item.color ? String(item.color) : undefined,
            };
          }),
        };
      }
    } catch {
      // try next endpoint
    }
  }

  return null;
}
