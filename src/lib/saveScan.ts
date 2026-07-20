import { supabase } from "./supabase";
import type { PatternHit, ScanType } from "./types";

export async function saveScan(
  scanType: ScanType,
  target: string,
  title: string | null,
  patterns: PatternHit[],
): Promise<void> {
  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .insert({
      scan_type: scanType,
      target,
      title,
      pattern_count: patterns.length,
    })
    .select()
    .single();

  if (scanError || !scan) {
    console.error("Failed to save scan:", scanError);
    return;
  }

  if (patterns.length > 0) {
    const rows = patterns.map((p) => ({
      scan_id: scan.id,
      type: p.type,
      confidence: p.confidence,
      severity: p.severity,
      description: p.description,
      evidence: p.evidence,
      recommendation: p.recommendation,
    }));
    const { error: patError } = await supabase
      .from("detected_patterns")
      .insert(rows);
    if (patError) console.error("Failed to save patterns:", patError);
  }
}
