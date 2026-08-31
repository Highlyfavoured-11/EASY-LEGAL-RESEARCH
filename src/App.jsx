import React, { useState } from "react";
import { Search, AlertTriangle, ChevronRight } from "lucide-react";

const INK = "#1C2541";
const PAPER = "#FAF8F4";
const BURGUNDY = "#7A2E2E";
const GOLD = "#A6813F";
const LINE = "#D9D3C6";

function parseSections(text) {
  const headers = [
    "ISSUE SUMMARY",
    "RELEVANT LAW",
    "KEY CASE LAW",
    "ANALYSIS",
    "GAPS & NEXT STEPS",
  ];
  const pattern = new RegExp(
    `(?:^|\\n)\\s*\\d\\.\\s*(${headers.join("|")})\\s*\\n`,
    "g"
  );
  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return [{ title: null, body: text }];
  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    sections.push({
      title: matches[i][1],
      body: text.slice(start, end).trim(),
    });
  }
  return sections;
}

export default function LitigationResearch() {
  const [jurisdiction, setJurisdiction] = useState("");
  const [issue, setIssue] = useState("");
  const [facts, setFacts] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const canSubmit = jurisdiction.trim() && issue.trim() && facts.trim() && !loading;

  async function runResearch() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const userMsg = `Court / area of law: ${jurisdiction}\n\nLegal issue: ${issue}\n\nKey facts: ${facts}`;
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMsg }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      const text = (data.content || [])
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim();
      if (!text) throw new Error("Empty response");
      setResult(text);
    } catch (e) {
      setError("Something went wrong generating the memo. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const sections = result ? parseSections(result) : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        color: INK,
        fontFamily: "'Source Serif 4', Georgia, serif",
        padding: "0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .lbl {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: #6B6455;
          letter-spacing: 0.01em;
        }
        textarea, input {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 15.5px;
        }
        textarea::placeholder, input::placeholder {
          color: #A79E8C;
          font-style: italic;
        }
        .field {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid ${LINE};
          padding: 10px 2px;
          outline: none;
          color: ${INK};
          resize: none;
        }
        .field:focus {
          border-bottom: 1px solid ${BURGUNDY};
        }
        .submit-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.01em;
          background: ${INK};
          color: ${PAPER};
          border: none;
          padding: 13px 22px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s ease;
        }
        .submit-btn:hover:not(:disabled) { background: ${BURGUNDY}; }
        .submit-btn:disabled { background: #C9C2B2; cursor: not-allowed; }
        .sec-body p { margin: 0 0 0.85em 0; line-height: 1.6; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "44px 22px 80px" }}>
        <div style={{ borderBottom: `2px solid ${INK}`, paddingBottom: 18, marginBottom: 34 }}>
          <div className="lbl" style={{ marginBottom: 6 }}>NIGERIAN LAW RESEARCH MEMO — DRAFT</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, lineHeight: 1.25 }}>
            Frame an issue. Get a first-pass memo.
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 30 }}>
          <div>
            <div className="lbl" style={{ marginBottom: 4 }}>Court / area of law</div>
            <input
              className="field"
              placeholder="e.g. National Industrial Court; Lagos State High Court; CAMA matter"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </div>
          <div>
            <div className="lbl" style={{ marginBottom: 4 }}>Legal issue</div>
            <textarea
              className="field"
              rows={2}
              placeholder="e.g. Whether dismissal without the notice period stated in the contract is wrongful"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />
          </div>
          <div>
            <div className="lbl" style={{ marginBottom: 4 }}>Key facts</div>
            <textarea
              className="field"
              rows={4}
              placeholder="Lay out the facts that matter to this issue — parties, timeline, relevant documents or conduct"
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
            />
          </div>
        </div>

        <button className="submit-btn" onClick={runResearch} disabled={!canSubmit}>
          <Search size={15} strokeWidth={2} />
          {loading ? "Researching…" : "Generate research memo"}
        </button>

        {error && (
          <div style={{ marginTop: 20, color: BURGUNDY, fontFamily: "Inter, sans-serif", fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginTop: 40, fontFamily: "Inter, sans-serif", fontSize: 14, color: "#6B6455" }}>
            Pulling relevant law and case précedent…
          </div>
        )}

        {result && !loading && (
          <div style={{ marginTop: 46, borderTop: `1px solid ${LINE}`, paddingTop: 30 }}>
            {sections.map((s, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                {s.title && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: GOLD }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 style={{ fontSize: 16.5, fontWeight: 600, margin: 0, color: INK }}>
                      {s.title.charAt(0) + s.title.slice(1).toLowerCase()}
                    </h2>
                  </div>
                )}
                <div className="sec-body" style={{ fontSize: 15.5, color: "#2E2A22" }}>
                  {s.body.split(/\n{2,}/).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 10,
                padding: "14px 16px",
                background: "#F1EBDE",
                borderLeft: `3px solid ${GOLD}`,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "#4A4433",
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} color={GOLD} />
              <span>
                Draft output only. Verify every citation against a primary source — official
                law reports, LawPavilion, or the relevant court's records — before use in any
                filing or client communication.
              </span>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 13, color: "#A79E8C" }}>
            <ChevronRight size={14} />
            Fill in the fields above and generate a memo to see output here.
          </div>
        )}
      </div>
    </div>
  );
}
