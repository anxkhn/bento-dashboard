/**
 * Renders a professional HTML QA report from report JSON.
 * Print CSS is tuned for Chrome/Edge --print-to-pdf.
 */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusClass(status) {
  if (status === "PASS") return "status-pass";
  if (status === "PASS WITH FINDINGS") return "status-findings";
  if (status === "FAIL") return "status-fail";
  return "status-blocked";
}

function severityClass(severity) {
  return `sev-${String(severity).toLowerCase()}`;
}

function countBySeverity(findings) {
  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Info: 0,
  };
  for (const finding of findings ?? []) {
    if (counts[finding.severity] !== undefined) {
      counts[finding.severity] += 1;
    }
  }
  return counts;
}

function rows(items, render) {
  if (!items?.length) {
    return `<tr><td colspan="8" class="muted">None</td></tr>`;
  }
  return items.map(render).join("");
}

export function renderHtmlReport(report) {
  const counts = countBySeverity(report.findings);
  const securityFindings = (report.findings ?? []).filter(
    (f) => f.area === "SEC" || f.severity === "Critical"
  );
  const otherFindings = (report.findings ?? []).filter(
    (f) => !(f.area === "SEC" || f.severity === "Critical") || f.area === "SEC"
  );

  const topRisks = (report.topRisks ?? [])
    .map((risk, index) => `<li><strong>${index + 1}.</strong> ${escapeHtml(risk)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(report.reportTitle)}</title>
  <style>
    :root {
      --ink: #1a2332;
      --muted: #5b6b7c;
      --line: #d8e0ea;
      --bg: #f7f9fc;
      --card: #ffffff;
      --brand: #0f3d5e;
      --accent: #1f6f8b;
      --pass: #1b7f4a;
      --findings: #b7791f;
      --fail: #b42318;
      --blocked: #475467;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
      background: var(--bg);
      font-size: 11.5pt;
      line-height: 1.45;
    }
    .page {
      max-width: 920px;
      margin: 0 auto;
      padding: 28px 32px 48px;
      background: var(--card);
    }
    .cover {
      border-bottom: 3px solid var(--brand);
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .eyebrow {
      color: var(--accent);
      font-size: 10pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      margin: 0 0 8px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 22pt;
      color: var(--brand);
      font-weight: 700;
      line-height: 1.2;
    }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 18px;
      color: var(--muted);
      font-size: 10pt;
      margin-top: 12px;
    }
    .meta strong { color: var(--ink); }
    .badge {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 10pt;
      letter-spacing: 0.04em;
      color: #fff;
    }
    .status-pass { background: var(--pass); }
    .status-findings { background: var(--findings); }
    .status-fail { background: var(--fail); }
    .status-blocked { background: var(--blocked); }
    h2 {
      margin: 28px 0 10px;
      font-size: 14pt;
      color: var(--brand);
      border-left: 4px solid var(--accent);
      padding-left: 10px;
    }
    h3 {
      margin: 16px 0 8px;
      font-size: 11.5pt;
      color: var(--ink);
    }
    p { margin: 0 0 10px; }
    ul { margin: 0 0 12px; padding-left: 18px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid var(--line);
      padding: 7px 8px;
      vertical-align: top;
      text-align: left;
    }
    th {
      background: #eef3f8;
      color: var(--brand);
      font-weight: 650;
    }
    .muted { color: var(--muted); }
    .sev-critical { color: #fff; background: #b42318; font-weight: 700; }
    .sev-high { color: #fff; background: #d92d20; font-weight: 650; }
    .sev-medium { color: #7a2e0e; background: #fef0c7; font-weight: 650; }
    .sev-low { color: #1849a9; background: #d1e0ff; }
    .sev-info { color: #344054; background: #f2f4f7; }
    .counts td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 9pt;
    }
    @media print {
      body { background: #fff; }
      .page { padding: 0; max-width: none; }
      h2 { break-after: avoid; }
      table { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="cover">
      <p class="eyebrow">PR QA pack — fix before merge</p>
      <h1>${escapeHtml(report.reportTitle)}</h1>
      <span class="badge ${statusClass(report.overallStatus)}">${escapeHtml(report.overallStatus)}</span>
      <div class="meta">
        <div><strong>Base branch:</strong> ${escapeHtml(report.targetBranch)}</div>
        <div><strong>Head SHA:</strong> ${escapeHtml(report.mergeSha)}</div>
        <div><strong>Date:</strong> ${escapeHtml(report.generatedAt)}</div>
        <div><strong>Repo:</strong> ${escapeHtml(report.repo)}</div>
        <div style="grid-column: 1 / -1"><strong>Sheet source:</strong> ${escapeHtml(report.sheetSource)}</div>
      </div>
    </header>

    <section>
      <h2>1. Executive summary</h2>
      <p>${escapeHtml(report.executiveSummary)}</p>
      <table class="counts">
        <thead><tr><th>Severity</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Critical</td><td>${counts.Critical}</td></tr>
          <tr><td>High</td><td>${counts.High}</td></tr>
          <tr><td>Medium</td><td>${counts.Medium}</td></tr>
          <tr><td>Low</td><td>${counts.Low}</td></tr>
          <tr><td>Info</td><td>${counts.Info}</td></tr>
        </tbody>
      </table>
      <h3>Top risks</h3>
      <ul>${topRisks || "<li class='muted'>None recorded</li>"}</ul>
    </section>

    <section>
      <h2>2. Testcase results</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Feature</th><th>Priority</th><th>Result</th><th>Evidence</th>
          </tr>
        </thead>
        <tbody>
          ${rows(
            report.testcases,
            (tc) => `<tr>
              <td>${escapeHtml(tc.id)}</td>
              <td>${escapeHtml(tc.feature)}</td>
              <td>${escapeHtml(tc.priority)}</td>
              <td>${escapeHtml(tc.result)}</td>
              <td>${escapeHtml(tc.evidence ?? "")}</td>
            </tr>`
          )}
        </tbody>
      </table>
    </section>

    <section>
      <h2>3. Code &amp; standards findings</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Severity</th><th>File</th><th>Issue</th><th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          ${rows(
            otherFindings.length ? otherFindings : report.findings,
            (f) => `<tr>
              <td>${escapeHtml(f.id)}</td>
              <td class="${severityClass(f.severity)}">${escapeHtml(f.severity)}</td>
              <td>${escapeHtml(f.file)}</td>
              <td>${escapeHtml(f.issue)}</td>
              <td>${escapeHtml(f.recommendation)}</td>
            </tr>`
          )}
        </tbody>
      </table>
    </section>

    <section>
      <h2>4. Security findings</h2>
      ${
        securityFindings.length
          ? `<table>
        <thead>
          <tr>
            <th>ID</th><th>Severity</th><th>File</th><th>Issue</th><th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          ${rows(
            securityFindings,
            (f) => `<tr>
              <td>${escapeHtml(f.id)}</td>
              <td class="${severityClass(f.severity)}">${escapeHtml(f.severity)}</td>
              <td>${escapeHtml(f.file)}</td>
              <td>${escapeHtml(f.issue)}</td>
              <td>${escapeHtml(f.recommendation)}</td>
            </tr>`
          )}
        </tbody>
      </table>`
          : `<p class="muted">No dedicated security findings in this run.</p>`
      }
    </section>

    <section>
      <h2>5. Test evidence</h2>
      <table>
        <thead><tr><th>Suite</th><th>Result</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td>Vitest (yarn test:run)</td>
            <td>${escapeHtml(report.testEvidence?.vitest?.result)}</td>
            <td>${escapeHtml(report.testEvidence?.vitest?.notes)}</td>
          </tr>
          <tr>
            <td>Cypress component</td>
            <td>${escapeHtml(report.testEvidence?.cypressComponent?.result)}</td>
            <td>${escapeHtml(report.testEvidence?.cypressComponent?.notes)}</td>
          </tr>
          <tr>
            <td>Cypress e2e</td>
            <td>${escapeHtml(report.testEvidence?.cypressE2e?.result)}</td>
            <td>${escapeHtml(report.testEvidence?.cypressE2e?.notes)}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>6. Structure &amp; standards scorecard</h2>
      <table>
        <thead><tr><th>Gate</th><th>Result</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td>Folder structure</td>
            <td>${escapeHtml(report.scorecard?.structure?.result)}</td>
            <td>${escapeHtml(report.scorecard?.structure?.notes)}</td>
          </tr>
          <tr>
            <td>Enums / constants / hooks</td>
            <td>${escapeHtml(report.scorecard?.standards?.result)}</td>
            <td>${escapeHtml(report.scorecard?.standards?.notes)}</td>
          </tr>
          <tr>
            <td>API actions / typing</td>
            <td>${escapeHtml(report.scorecard?.api?.result)}</td>
            <td>${escapeHtml(report.scorecard?.api?.notes)}</td>
          </tr>
          <tr>
            <td>Security static review</td>
            <td>${escapeHtml(report.scorecard?.security?.result)}</td>
            <td>${escapeHtml(report.scorecard?.security?.notes)}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>7. Appendix</h2>
      <h3>Commands run</h3>
      <ul>
        ${(report.appendix?.commandsRun ?? [])
          .map((c) => `<li><code>${escapeHtml(c)}</code></li>`)
          .join("") || "<li class='muted'>None</li>"}
      </ul>
      <h3>Files in scope</h3>
      <ul>
        ${(report.appendix?.filesInScope ?? [])
          .slice(0, 80)
          .map((f) => `<li><code>${escapeHtml(f)}</code></li>`)
          .join("") || "<li class='muted'>None</li>"}
      </ul>
      <h3>Residual risk</h3>
      <p>${escapeHtml(report.appendix?.residualRisk)}</p>
    </section>

    <footer class="footer">
      Gripo Workflow Frontend — Development PR Quality Report. Fix findings before merge.
    </footer>
  </div>
</body>
</html>`;
}
