#!/usr/bin/env node
/**
 * Build a PDF (and HTML companion) from a development PR QA report JSON.
 *
 * Usage:
 *   node scripts/qa-report/build-pdf.mjs --input outputs/qa-reports/QA-....json
 *   node scripts/qa-report/build-pdf.mjs --input path/to/report.json --out outputs/qa-reports
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { renderHtmlReport } from "./lib/html-report.mjs";

function parseArgs(argv) {
  const args = { input: null, out: "outputs/qa-reports" };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--input" && value) {
      args.input = value;
      i += 1;
    } else if (key === "--out" && value) {
      args.out = value;
      i += 1;
    } else if (key === "--help" || key === "-h") {
      args.help = true;
    }
  }
  return args;
}

function resolveBrowser() {
  const candidates = [
    process.env.QA_REPORT_BROWSER,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function printToPdf(browserPath, htmlPath, pdfPath) {
  const htmlUrl = pathToFileURL(path.resolve(htmlPath)).href;
  const result = spawnSync(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${path.resolve(pdfPath)}`,
      htmlUrl,
    ],
    { encoding: "utf8" }
  );

  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join("\n");
    throw new Error(
      `Browser print-to-pdf failed (exit ${result.status}): ${detail || "no output"}`
    );
  }
  if (!fs.existsSync(pdfPath)) {
    throw new Error("Browser reported success but PDF file was not created");
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.input) {
    console.log(
      "Usage: node scripts/qa-report/build-pdf.mjs --input <report.json> [--out outputs/qa-reports]"
    );
    process.exit(args.help ? 0 : 1);
  }

  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const outDir = path.resolve(args.out);
  fs.mkdirSync(outDir, { recursive: true });

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const htmlPath = path.join(outDir, `${baseName}.html`);
  const pdfPath = path.join(outDir, `${baseName}.pdf`);

  const html = renderHtmlReport(report);
  fs.writeFileSync(htmlPath, html, "utf8");

  const browserPath = resolveBrowser();
  if (!browserPath) {
    console.error(
      "No Chrome/Edge found for PDF print. HTML written to:\n  " + htmlPath
    );
    console.error(
      "Install Chrome/Edge or set QA_REPORT_BROWSER to the browser executable."
    );
    process.exit(2);
  }

  printToPdf(browserPath, htmlPath, pdfPath);
  console.log(`HTML: ${htmlPath}`);
  console.log(`PDF:  ${pdfPath}`);
}

main();
