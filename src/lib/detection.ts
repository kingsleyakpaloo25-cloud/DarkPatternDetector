import type { PatternHit } from "./types";

interface Rule {
  type: string;
  patterns: RegExp[];
  severity: "Low" | "Medium" | "High";
  description: string;
  recommendation: string;
}

const RULES: Rule[] = [
  {
    type: "Hidden Costs",
    patterns: [
      /fees?\s*may\s*apply/i,
      /processing\s*fee/i,
      /service\s*charge/i,
      /additional\s*charges?\s*may/i,
      /plus\s*taxes?\s*and\s*fees/i,
      /\$\d+\s*\/mo\s*\+?\s*taxes/i,
    ],
    severity: "High",
    description:
      "Additional costs are revealed late in the checkout flow, hiding the true price from the user.",
    recommendation: "Display the full total price upfront, including all fees and taxes.",
  },
  {
    type: "Forced Action",
    patterns: [
      /you\s*must\s*(?:accept|subscribe|continue)/i,
      /required\s*to\s*continue/i,
      /cannot\s*continue\s*without/i,
      /in\s*order\s*to\s*complete/i,
    ],
    severity: "High",
    description:
      "The user is forced to perform an action they did not intend in order to proceed.",
    recommendation: "Make all optional actions genuinely optional and allow skipping.",
  },
  {
    type: "Confirmshaming",
    patterns: [
      /no\s*thanks[,.\s]*i\s*(?:don'?t|do\s*not)\s*(?:want|care|need)/i,
      /no[,.\s]*i\s*(?:prefer|would\s*rather)\s*(?:to\s*)?(?:stay|keep|not)/i,
      /i\s*don'?t\s*want\s*(?:any|a)\s*(?:benefit|discount|reward)/i,
      /no[,.\s]*i\s*(?:hate|dislike)\s*saving/i,
    ],
    severity: "High",
    description:
      "The decline option uses guilt-tripping or shame-inducing language to manipulate the user.",
    recommendation: "Use neutral wording for the decline option, e.g. 'No thanks'.",
  },
  {
    type: "Sneak into Basket",
    patterns: [
      /we'?ve\s*added\s*(?:a|some)\s*(?:free\s*)?(?:gift|item|product)/i,
      /free\s*trial\s*included/i,
      /added\s*to\s*your\s*(?:cart|basket)\s*(?:for\s*you|automatically)/i,
    ],
    severity: "Medium",
    description: "Items are added to the user's basket without explicit consent.",
    recommendation: "Never add items automatically; require explicit opt-in.",
  },
  {
    type: "Fake Countdown Timer",
    patterns: [
      /hurry[,!]\s*(?:offer|sale)\s*ends?\s*in/i,
      /limited\s*time\s*(?:offer|deal)/i,
      /only\s*\d+\s*(?:hours?|mins?|minutes?|seconds?)\s*left/i,
      /offer\s*expires?\s*at\s*midnight/i,
      /\d+:\d+:\d+\s*(?:remaining|left)/i,
    ],
    severity: "Medium",
    description:
      "A countdown timer creates false urgency; the offer is not actually time-limited.",
    recommendation: "Only use countdown timers for genuinely time-bound offers.",
  },
  {
    type: "Misdirection",
    patterns: [
      /no\s*thanks[,]\s*continue\s*(?:to|with)\s*(?:the\s*)?(?:full\s*)?price/i,
      /skip\s*and\s*pay\s*full\s*price/i,
    ],
    severity: "Medium",
    description:
      "The desired action is visually de-emphasised while the profitable action is highlighted.",
    recommendation: "Present both options with equal visual weight and neutral language.",
  },
  {
    type: "Privacy Manipulation",
    patterns: [
      /we\s*(?:may|will)\s*share\s*your\s*(?:data|information)\s*with/i,
      /by\s*continuing\s*you\s*agree\s*to\s*(?:our|the)\s*(?:privacy|data)\s*(?:policy|practices)/i,
      /we\s*collect\s*(?:all|your)\s*(?:data|information)/i,
    ],
    severity: "High",
    description:
      "The interface manipulates users into sharing more personal data than necessary.",
    recommendation: "Request only essential data and provide clear, granular privacy controls.",
  },
  {
    type: "Obstruction",
    patterns: [
      /are\s*you\s*sure\s*you\s*want\s*to\s*(?:cancel|leave|unsubscribe)\??/i,
      /please\s*reconsider/i,
      /wait!?\s*don'?t\s*go/i,
      /are\s*you\s*sure\?/i,
    ],
    severity: "Medium",
    description: "The process of leaving or cancelling is made deliberately difficult.",
    recommendation: "Make cancellation as easy as sign-up; remove confirmation friction.",
  },
  {
    type: "Roach Motel",
    patterns: [
      /to\s*(?:cancel|delete)\s*(?:your\s*)?(?:account|subscription)[,]?\s*(?:please\s*)?call/i,
      /contact\s*(?:us\s*)?(?:customer\s*)?support\s*to\s*(?:cancel|delete)/i,
      /cancellation\s*(?:form|request)\s*(?:required|by\s*mail)/i,
    ],
    severity: "High",
    description:
      "Signing up is easy but cancelling requires contacting support or other friction.",
    recommendation: "Allow self-service cancellation through the same interface.",
  },
  {
    type: "Pre-selected Checkboxes",
    patterns: [/checked\s*=\s*"?true"?/i, /default\s*checked/i],
    severity: "Medium",
    description:
      "Checkboxes for marketing or data sharing are pre-selected to obtain default consent.",
    recommendation: "Always default checkboxes to unchecked for consent options.",
  },
];

export function analyzeText(text: string): PatternHit[] {
  const hits: PatternHit[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    for (const pat of rule.patterns) {
      const m = text.match(pat);
      if (m && !seen.has(rule.type)) {
        seen.add(rule.type);
        hits.push({
          type: rule.type,
          confidence: Math.min(95, 70 + Math.round((m[0].length / 40) * 25)),
          severity: rule.severity,
          description: rule.description,
          evidence: m[0].trim().slice(0, 200),
          recommendation: rule.recommendation,
        });
      }
    }
  }
  return hits;
}

export const DARK_PATTERN_TYPES = RULES.map((r) => r.type);
