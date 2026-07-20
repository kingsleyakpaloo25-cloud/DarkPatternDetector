import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PatternHit {
  type: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  evidence: string;
  recommendation: string;
}

const RULES: Array<{
  type: string;
  patterns: RegExp[];
  severity: "Low" | "Medium" | "High";
  description: string;
  recommendation: string;
}> = [
  {
    type: "Hidden Costs",
    patterns: [/fees?\s*may\s*apply/i, /processing\s*fee/i, /service\s*charge/i, /additional\s*charges?\s*may/i, /\$\d+\s*(?:\/mo|\/month)\s*\+?\s*taxes/i, /plus\s*taxes?\s*and\s*fees/i],
    severity: "High",
    description: "Additional costs are revealed late in the checkout flow, hiding the true price from the user.",
    recommendation: "Display the full total price upfront, including all fees and taxes.",
  },
  {
    type: "Forced Action",
    patterns: [/you\s*must\s*(?:accept|subscribe|continue)/i, /required\s*to\s*continue/i, /cannot\s*continue\s*without/i, /in\s*order\s*to\s*complete/i],
    severity: "High",
    description: "The user is forced to perform an action they did not intend in order to proceed.",
    recommendation: "Make all optional actions genuinely optional and allow skipping.",
  },
  {
    type: "Confirmshaming",
    patterns: [/no\s*thanks[,.\s]*i\s*(?:don'?t|do\s*not)\s*(?:want|care|need)/i, /no[,.\s]*i\s*(?:prefer|would\s*rather)\s*(?:to\s*)?(?:stay|keep|not)/i, /i\s*don'?t\s*want\s*(?:any|a)\s*(?:benefit|discount|reward)/i, /no[,.\s]*i\s*(?:hate|dislike)\s*saving/i],
    severity: "High",
    description: "The decline option uses guilt-tripping or shame-inducing language to manipulate the user.",
    recommendation: "Use neutral wording for the decline option, e.g. 'No thanks'.",
  },
  {
    type: "Sneak into Basket",
    patterns: [/we'?ve\s*added\s*(?:a|some)\s*(?:free\s*)?(?:gift|item|product)/i, /free\s*trial\s*included/i, /added\s*to\s*your\s*(?:cart|basket)\s*(?:for\s*you|automatically)/i],
    severity: "Medium",
    description: "Items are added to the user's basket without explicit consent.",
    recommendation: "Never add items automatically; require explicit opt-in.",
  },
  {
    type: "Fake Countdown Timer",
    patterns: [/hurry[,!]\s*(?:offer|sale)\s*ends?\s*in/i, /limited\s*time\s*(?:offer|deal)/i, /only\s*\d+\s*(?:hours?|mins?|minutes?|seconds?)\s*left/i, /offer\s*expires?\s*at\s*midnight/i, /\d+:\d+:\d+\s*(?:remaining|left)/i],
    severity: "Medium",
    description: "A countdown timer creates false urgency; the offer is not actually time-limited.",
    recommendation: "Only use countdown timers for genuinely time-bound offers.",
  },
  {
    type: "Misdirection",
    patterns: [/no\s*thanks[,]\s*continue\s*(?:to|with)\s*(?:the\s*)?(?:full\s*)?price/i, /skip\s*and\s*pay\s*full\s*price/i],
    severity: "Medium",
    description: "The desired action is visually de-emphasised while the profitable action is highlighted.",
    recommendation: "Present both options with equal visual weight and neutral language.",
  },
  {
    type: "Privacy Manipulation",
    patterns: [/we\s*(?:may|will)\s*share\s*your\s*(?:data|information)\s*with/i, /by\s*continuing\s*you\s*agree\s*to\s*(?:our|the)\s*(?:privacy|data)\s*(?:policy|practices)/i, /we\s*collect\s*(?:all|your)\s*(?:data|information)/i],
    severity: "High",
    description: "The interface manipulates users into sharing more personal data than necessary.",
    recommendation: "Request only essential data and provide clear, granular privacy controls.",
  },
  {
    type: "Obstruction",
    patterns: [/are\s*you\s*sure\s*you\s*want\s*to\s*(?:cancel|leave|unsubscribe)\??/i, /please\s*reconsider/i, /wait!?\s*don'?t\s*go/i, /are\s*you\s*sure\?/i],
    severity: "Medium",
    description: "The process of leaving or cancelling is made deliberately difficult.",
    recommendation: "Make cancellation as easy as sign-up; remove confirmation friction.",
  },
  {
    type: "Roach Motel",
    patterns: [/to\s*(?:cancel|delete)\s*(?:your\s*)?(?:account|subscription)[,]?\s*(?:please\s*)?call/i, /contact\s*(?:us\s*)?(?:customer\s*)?support\s*to\s*(?:cancel|delete)/i, /cancellation\s*(?:form|request)\s*(?:required|by\s*mail)/i],
    severity: "High",
    description: "Signing up is easy but cancelling requires contacting support or other friction.",
    recommendation: "Allow self-service cancellation through the same interface.",
  },
  {
    type: "Pre-selected Checkboxes",
    patterns: [/checked\s*=\s*"?true"?/i, /default\s*checked/i],
    severity: "Medium",
    description: "Checkboxes for marketing or data sharing are pre-selected to obtain default consent.",
    recommendation: "Always default checkboxes to unchecked for consent options.",
  },
];

function analyze(text: string): PatternHit[] {
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(normalized, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DarkScanBot/1.0)",
        Accept: "text/html,*/*",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    const html = await resp.text();

    // Extract CSS from <style> blocks and style attributes
    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
    const inlineStyles = [...html.matchAll(/style="([^"]*)"/gi)].map((m) => m[1]);
    const css = styleBlocks.join("\n") + "\n" + inlineStyles.join("\n");

    // Extract visible text (strip tags + scripts)
    const textOnly = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

    // Detect pre-selected checkboxes from raw HTML
    const htmlHits = analyze(html);
    // Detect textual patterns from visible text
    const textHits = analyze(textOnly);

    // Merge, dedupe by type
    const merged: PatternHit[] = [];
    const seenTypes = new Set<string>();
    for (const h of [...htmlHits, ...textHits]) {
      if (!seenTypes.has(h.type)) {
        seenTypes.add(h.type);
        merged.push(h);
      }
    }

    // CSS-based heuristics
    if (/display\s*:\s*none/i.test(css) && /countdown|timer|expiry/i.test(textOnly)) {
      if (!seenTypes.has("Fake Countdown Timer")) {
        merged.push({
          type: "Fake Countdown Timer",
          confidence: 78,
          severity: "Medium",
          description: "A countdown element is hidden via CSS, suggesting it is decorative rather than real.",
          evidence: "display:none on countdown element",
          recommendation: "Only use countdown timers for genuinely time-bound offers.",
        });
      }
    }

    return new Response(
      JSON.stringify({
        url: normalized,
        title: (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim() || normalized,
        patterns: merged,
        stats: {
          htmlLength: html.length,
          cssLength: css.length,
          textLength: textOnly.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
