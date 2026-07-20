export type ScanType = "website" | "screenshot" | "ai";
export type Severity = "Low" | "Medium" | "High";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  scan_type: ScanType;
  target: string;
  title: string | null;
  status: string;
  pattern_count: number;
  created_at: string;
}

export interface DetectedPattern {
  id: string;
  scan_id: string;
  user_id: string;
  type: string;
  confidence: number;
  severity: Severity;
  description: string;
  evidence: string | null;
  recommendation: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PatternHit {
  type: string;
  confidence: number;
  severity: Severity;
  description: string;
  evidence: string;
  recommendation: string;
}
