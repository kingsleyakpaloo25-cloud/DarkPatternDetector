import { useRef, useState } from "react";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { UserLayout } from "../components/UserLayout";
import { DetectionReport } from "../components/DetectionReport";
import { analyzeText } from "../lib/detection";
import { saveScan } from "../lib/saveScan";
import type { PatternHit } from "../lib/types";

export function ScreenshotScannerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    patterns: PatternHit[];
    extractedText: string;
  } | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.).");
      return;
    }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Dynamic import to keep initial bundle small
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(preview, "eng", {
        logger: () => {},
      });
      const extractedText = data.text || "";

      // Detect pre-selected checkboxes visually is hard via OCR; rely on text
      const patterns = analyzeText(extractedText);

      // Additional screenshot-specific heuristics on button text
      const buttonPatterns = detectDeceptiveButtons(extractedText);
      const seen = new Set(patterns.map((p) => p.type));
      for (const bp of buttonPatterns) {
        if (!seen.has(bp.type)) {
          patterns.push(bp);
          seen.add(bp.type);
        }
      }

      setResult({ patterns, extractedText });
      await saveScan("screenshot", fileName || "screenshot", fileName || "Screenshot scan", patterns);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Camera size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Screenshot Scanner</h1>
            <p className="text-sm text-slate-400">
              Upload a screenshot — OCR extracts the text, then we detect
              suspicious wording and deceptive buttons and return a full report.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 py-16 transition hover:border-cyan-500/50"
          >
            <Upload size={32} className="text-slate-500" />
            <p className="mt-3 text-sm text-slate-400">
              Click to upload a screenshot
            </p>
            <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
          </div>
        ) : (
          <div>
            <div className="relative">
              <img
                src={preview}
                alt="Screenshot preview"
                className="max-h-80 w-full rounded-xl border border-slate-800 object-contain"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setFileName("");
                  setResult(null);
                }}
                className="absolute right-2 top-2 rounded-lg bg-slate-900/80 p-1.5 text-slate-300 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">{fileName}</span>
              <button
                onClick={handleScan}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Scanning...
                  </>
                ) : (
                  <>
                    <Camera size={16} /> Run OCR Scan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !result && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-amber-400" />
          <p className="mt-4 text-sm text-slate-400">
            Running OCR and analysing extracted text...
          </p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <DetectionReport
            patterns={result.patterns}
            title={fileName}
            target="Screenshot OCR analysis"
            onClose={() => setResult(null)}
          />
          <details className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Extracted text ({result.extractedText.length} chars)
            </summary>
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
              {result.extractedText || "(no text extracted)"}
            </pre>
          </details>
        </div>
      )}
    </UserLayout>
  );
}

function detectDeceptiveButtons(text: string): PatternHit[] {
  const hits: PatternHit[] = [];
  const lines = text.split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(yes|accept|continue|subscribe|buy\s*now|add\s*to\s*cart)$/i.test(trimmed)) {
      // check if a contrasting negative option nearby is shaming
    }
    if (/no[,.\s]*i\s*(?:don'?t|do\s*not)\s*(?:want|need|care)/i.test(trimmed)) {
      hits.push({
        type: "Confirmshaming",
        confidence: 88,
        severity: "High",
        description: "A button uses shame-inducing language for the decline option.",
        evidence: trimmed.slice(0, 120),
        recommendation: "Use neutral wording for the decline option, e.g. 'No thanks'.",
      });
    }
    if (/cancel\s*(?:anytime|now|subscription)/i.test(trimmed) && /call\s*us/i.test(text)) {
      hits.push({
        type: "Roach Motel",
        confidence: 80,
        severity: "High",
        description: "Cancellation requires calling support, making it hard to leave.",
        evidence: trimmed.slice(0, 120),
        recommendation: "Allow self-service cancellation through the same interface.",
      });
    }
  }
  return hits;
}
