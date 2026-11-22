/**
 * Static QA scanners for development PR workflow (no Google Sheet required).
 */

import fs from "node:fs";
import path from "node:path";

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const SKIP_PARTS = new Set([
  "node_modules",
  ".next",
  "outputs",
  "coverage",
  ".git",
  "dist",
  "build",
]);

function normalize(filePath) {
  return filePath.replace(/\\/g, "/");
}

function shouldScan(filePath) {
  const n = normalize(filePath);
  if (!CODE_EXT.test(n)) return false;
  if (n.includes(".test.") || n.includes(".cy.") || n.endsWith(".d.ts")) return false;
  // QA tooling scans app code — do not scan its own regex sources (self false-positives)
  if (n.includes("scripts/qa-report/")) return false;
  const parts = n.split("/");
  return !parts.some((p) => SKIP_PARTS.has(p));
}

function readSafe(repoRoot, filePath) {
  try {
    const abs = path.isAbsolute(filePath)
      ? filePath
      : path.join(repoRoot, filePath);
    if (!fs.existsSync(abs)) return null;
    const stat = fs.statSync(abs);
    if (!stat.isFile() || stat.size > 400_000) return null;
    return fs.readFileSync(abs, "utf8");
  } catch {
    return null;
  }
}

/**
 * @param {string} repoRoot
 * @param {string[]} files
 * @returns {{ findings: object[], scorecardNotes: Record<string, string> }}
 */
export function scanPrFiles(repoRoot, files) {
  const findings = [];
  let findingSeq = {
    STR: 0,
    STD: 0,
    LOG: 0,
    SEC: 0,
    TEST: 0,
    DIFF: 0,
  };

  const nextId = (area) => {
    findingSeq[area] += 1;
    return `F-${area}-${String(findingSeq[area]).padStart(3, "0")}`;
  };

  const scoped = files.map(normalize);
  const codeFiles = scoped.filter(shouldScan);

  // --- Structure ---
  const legacy = scoped.filter((f) => f.includes("/compoents/"));
  if (legacy.length) {
    findings.push({
      id: nextId("STR"),
      severity: "Medium",
      area: "STR",
      file: legacy[0],
      issue: `PR touches legacy path "compoents" (${legacy.length} file(s)).`,
      recommendation:
        "Do not add new files under legacy compoents/; use components/ for new work.",
    });
  }

  for (const file of codeFiles) {
    if (!/\/index\.(ts|tsx|js|jsx)$/.test(file)) continue;
    if (!file.includes("/features/") && !file.includes("/components/")) continue;
    const content = readSafe(repoRoot, file);
    if (!content) continue;
    const exportStar = (content.match(/export\s+\*\s+from/g) || []).length;
    const otherExports = (
      content.match(/export\s+(?:async\s+)?(?:function|const|class|type|interface|enum|{)/g) ||
      []
    ).length;
    if (exportStar >= 2 && otherExports === 0) {
      findings.push({
        id: nextId("STR"),
        severity: "Low",
        area: "STR",
        file,
        issue: "Barrel-only re-export index detected (export * only).",
        recommendation:
          "Prefer direct imports from concrete modules; avoid new barrel-only index files.",
      });
    }
  }

  // --- Standards / logic / security on file contents ---
  let consoleHits = 0;
  let asCastHits = 0;
  let xssHits = 0;
  let secretPatternHits = 0;

  for (const file of codeFiles) {
    const content = readSafe(repoRoot, file);
    if (!content) continue;

    if (/\bconsole\.(log|debug|info|warn|error)\s*\(/.test(content)) {
      consoleHits += 1;
      if (consoleHits <= 5) {
        findings.push({
          id: nextId("STD"),
          severity: "Low",
          area: "STD",
          file,
          issue: "console.* usage found (eslint no-console).",
          recommendation: "Remove debug logging or use approved error reporting only.",
        });
      }
    }

    if (/\bas\s+[A-Z][A-Za-z0-9_<>,\s|&]*/.test(content) && file.includes("/actions/")) {
      asCastHits += 1;
      if (asCastHits <= 5) {
        findings.push({
          id: nextId("STD"),
          severity: "Medium",
          area: "STD",
          file,
          issue: "Type assertion (`as`) in actions path — prefer typed ApiFetch/ApiAdd data.",
          recommendation:
            "Return response.data without casting; type the Api helper generics instead.",
        });
      }
    }

    if (
      /xxxQuery\.(data|isPending|isFetching|isSuccess)/.test(content) ||
      /\w+Query\.(data|isPending)\b/.test(content)
    ) {
      findings.push({
        id: nextId("STD"),
        severity: "Low",
        area: "STD",
        file,
        issue: "Possible non-destructured query object access (xxxQuery.data pattern).",
        recommendation:
          "Destructure useQuery/useMutation results: const { data, isPending } = useX().",
      });
    }

    // Split marker so this scanners file never matches its own detector source
    const xssMarker = "dangerouslySet" + "InnerHTML";
    if (content.includes(xssMarker)) {
      xssHits += 1;
      findings.push({
        id: nextId("SEC"),
        severity: "High",
        area: "SEC",
        file,
        issue: `${xssMarker} usage — XSS review required.`,
        recommendation:
          "Ensure content is sanitized/trusted; avoid raw user HTML when possible.",
      });
    }

    // Avoid enum/label false positives like Password = "password"
    const hardCodedSecret =
      /(api[_-]?key|secret|password|private[_-]?key)\s*[:=]\s*['"][^'"]{16,}['"]/i.test(
        content
      ) ||
      /AKIA[0-9A-Z]{16}/.test(content) ||
      /-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----/.test(content);

    if (hardCodedSecret) {
      secretPatternHits += 1;
      findings.push({
        id: nextId("SEC"),
        severity: "Critical",
        area: "SEC",
        file,
        issue: "Possible hardcoded secret / key material in source.",
        recommendation:
          "Remove secret from source immediately; rotate credentials; use env/secrets store.",
      });
    }

    if (
      /process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]+/.test(content) &&
      (file.includes("/src/") || file.startsWith("src/"))
    ) {
      // Flag non-NEXT_PUBLIC env in client-ish paths (heuristic)
      if (!file.includes("next.config") && !file.includes("/scripts/")) {
        findings.push({
          id: nextId("SEC"),
          severity: "Medium",
          area: "SEC",
          file,
          issue: "Non-NEXT_PUBLIC process.env usage in src — confirm it is not leaked to client bundles.",
          recommendation:
            "Client code should only use NEXT_PUBLIC_* ; keep server secrets server-only.",
        });
      }
    }
  }

  const envTouched = scoped.filter((f) => /(^|\/)\.env(\.|$)/.test(f) && !f.endsWith(".example"));
  if (envTouched.length) {
    findings.push({
      id: nextId("SEC"),
      severity: "High",
      area: "SEC",
      file: envTouched[0],
      issue: "Environment secret files appear in the PR file list.",
      recommendation:
        "Do not commit .env / .env.local. Keep examples only in .env.example.",
    });
  }

  // Coverage gap: feature src changes without nearby cypress/vitest touches
  const featureSrc = scoped.filter(
    (f) => f.startsWith("src/features/") && CODE_EXT.test(f)
  );
  const testTouched = scoped.some(
    (f) => f.includes("cypress/") || f.includes(".test.") || f.includes("vitest")
  );
  if (featureSrc.length >= 3 && !testTouched) {
    findings.push({
      id: nextId("TEST"),
      severity: "Info",
      area: "TEST",
      file: featureSrc[0],
      issue: `PR changes ${featureSrc.length} feature source files with no test file updates in scope.`,
      recommendation:
        "Add or update Vitest/Cypress coverage for the changed feature when behavior changes.",
    });
  }

  findings.push({
    id: nextId("TEST"),
    severity: "Info",
    area: "TEST",
    file: "tests/",
    issue:
      "Keep Vitest coverage green on the PR; add UI/E2E coverage when user flows change.",
    recommendation:
      "Run npm test locally and ensure CI QA PDF report stays PASS before merge.",
  });

  const scorecardNotes = {
    structure: legacy.length
      ? "Legacy compoents/ paths present in PR scope."
      : "No new legacy folder issues beyond scanned barrels.",
    standards: `Scanned ${codeFiles.length} code files; console hits≈${consoleHits}, as-cast in actions≈${asCastHits}.`,
    api: "Actions paths checked for `as` casts against ApiFetch/ApiAdd guidance.",
    security: `XSS hits=${xssHits}; secret-pattern hits=${secretPatternHits}; env files=${envTouched.length}.`,
  };

  return { findings, scorecardNotes, scannedFileCount: codeFiles.length };
}
