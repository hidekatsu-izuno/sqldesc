import type { AnalyzeResult } from "./analyzer";
import { DEFAULT_SCHEMA, DEFAULT_SQL, FALLBACK_DIALECTS } from "./constants";
import { formatColumnsTable, resultKindClass, resultKindLabel } from "./format";
import "./styles.css";

type TabId = "columns" | "statements" | "messages" | "json";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app not found");

let activeTab: TabId = "columns";
let lastJson = "";
let lastResult: AnalyzeResult | undefined;

renderShell(FALLBACK_DIALECTS);
void bootstrap();

function renderShell(dialects: string[]): void {
  app!.innerHTML = `
    <div class="layout">
      <header class="header">
        <div class="header-brand">
          <h1>sqldesc</h1>
          <p>Infer SQL result-set columns statically</p>
        </div>
        <a class="header-link" href="https://github.com/hidekatsu-izuno/sqldesc" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </header>

      <main class="main">
        <section class="panel panel-input">
          <div class="panel-head">
            <h2>SQL</h2>
            <div class="controls">
              <label class="field field-inline">
                <span>Dialect</span>
                <select id="dialect">${renderDialectOptions(dialects)}</select>
              </label>
              <label class="field field-inline">
                <span>Binds</span>
                <input id="binds" type="text" placeholder="int,text or id=int,name=text" spellcheck="false" />
              </label>
              <label class="field field-check">
                <input id="jdbc" type="checkbox" />
                <span>JDBC</span>
              </label>
              <button id="analyze" type="button" class="btn-primary">Analyze</button>
            </div>
          </div>
          <div class="input-body schema-open">
            <div class="sql-body">
              <textarea id="sql" class="editor sql-editor" spellcheck="false" aria-label="SQL">${escapeHtml(DEFAULT_SQL)}</textarea>
            </div>
            <div class="schema-section schema-open">
              <button type="button" class="schema-toggle" aria-expanded="true">Schema DDL (optional)</button>
              <div class="schema-body">
                <textarea id="schema" class="editor schema-editor" spellcheck="false" aria-label="Schema DDL">${escapeHtml(DEFAULT_SCHEMA)}</textarea>
              </div>
            </div>
          </div>
        </section>

        <section class="panel panel-output">
          <div class="panel-head">
            <h2>Output</h2>
            <div class="tabs" role="tablist">
              <button type="button" class="tab active" data-tab="columns">Columns</button>
              <button type="button" class="tab" data-tab="statements">Statements</button>
              <button type="button" class="tab" data-tab="messages">Warnings</button>
              <button type="button" class="tab" data-tab="json">JSON</button>
            </div>
          </div>
          <div id="status" class="status status-idle">Enter SQL and click Analyze</div>
          <div id="output" class="output"><p class="placeholder">Analysis results will appear here</p></div>
        </section>
      </main>
    </div>
  `;

  const dialectEl = mustGet<HTMLSelectElement>("#dialect");
  const bindsEl = mustGet<HTMLInputElement>("#binds");
  const analyzeBtn = mustGet<HTMLButtonElement>("#analyze");
  const sqlEl = mustGet<HTMLTextAreaElement>("#sql");

  dialectEl.value = dialects.includes("generic") ? "generic" : (dialects[0] ?? "generic");
  bindsEl.value = "int";

  analyzeBtn.addEventListener("click", () => void runAnalysis());

  const inputBody = mustGet<HTMLDivElement>(".input-body");
  const schemaSection = mustGet<HTMLDivElement>(".schema-section");
  const schemaToggle = mustGet<HTMLButtonElement>(".schema-toggle");
  schemaToggle.addEventListener("click", () => {
    const open = schemaSection.classList.toggle("schema-open");
    inputBody.classList.toggle("schema-open", open);
    schemaToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  for (const button of app!.querySelectorAll<HTMLButtonElement>(".tab")) {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab as TabId | undefined;
      if (!tab) return;
      activeTab = tab;
      for (const item of app!.querySelectorAll<HTMLButtonElement>(".tab")) {
        item.classList.toggle("active", item === button);
      }
      renderOutput();
    });
  }

  sqlEl.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void runAnalysis();
    }
  });
}

async function bootstrap(): Promise<void> {
  setStatus("loading", "Loading SQL engine…");
  try {
    const { getSupportedDialects } = await import("./analyzer");
    const dialects = getSupportedDialects();
    const dialectEl = mustGet<HTMLSelectElement>("#dialect");
    const selected = dialectEl.value;
    dialectEl.innerHTML = renderDialectOptions(dialects);
    dialectEl.value = dialects.includes(selected)
      ? selected
      : dialects.includes("generic")
        ? "generic"
        : (dialects[0] ?? "generic");
    setStatus("idle", "Enter SQL and click Analyze");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus("error", `Failed to load SQL engine: ${message}`);
  }
}

async function runAnalysis(): Promise<void> {
  const analyzeBtn = mustGet<HTMLButtonElement>("#analyze");
  analyzeBtn.disabled = true;
  setStatus("loading", "Analyzing…");

  try {
    const { analyzeSql } = await import("./analyzer");
    const result = await analyzeSql({
      sql: mustGet<HTMLTextAreaElement>("#sql").value,
      dialect: mustGet<HTMLSelectElement>("#dialect").value,
      binds: mustGet<HTMLInputElement>("#binds").value,
      jdbc: mustGet<HTMLInputElement>("#jdbc").checked,
      schemaSql: mustGet<HTMLTextAreaElement>("#schema").value,
    });
    lastResult = result;
    lastJson = JSON.stringify(result, null, 2);
    const columnCount = result.resultSets.reduce((sum, rs) => sum + rs.columns.length, 0);
    setStatus(
      "success",
      `${result.statements.length} statements / ${result.resultSets.length} result sets / ${columnCount} columns`,
    );
    renderOutput();
  } catch (error) {
    lastJson = "";
    lastResult = undefined;
    const message = error instanceof Error ? error.message : String(error);
    setStatus("error", message);
    mustGet<HTMLDivElement>("#output").innerHTML =
      `<pre class="error-box">${escapeHtml(message)}</pre>`;
  } finally {
    analyzeBtn.disabled = false;
  }
}

function renderOutput(): void {
  const outputEl = mustGet<HTMLDivElement>("#output");
  const result = lastResult;

  if (!result) {
    if (lastJson && activeTab === "json") {
      outputEl.innerHTML = `<pre class="json-box">${escapeHtml(lastJson)}</pre>`;
      return;
    }
    outputEl.innerHTML = '<p class="placeholder">Analysis results will appear here</p>';
    return;
  }

  switch (activeTab) {
    case "columns":
      outputEl.innerHTML = renderColumnsPanel(result);
      break;
    case "statements":
      outputEl.innerHTML = renderStatementsPanel(result);
      break;
    case "messages":
      outputEl.innerHTML = renderMessagesPanel(result);
      break;
    case "json":
      outputEl.innerHTML = `<pre class="json-box">${escapeHtml(lastJson)}</pre>`;
      break;
  }
}

function renderColumnsPanel(result: AnalyzeResult): string {
  if (result.resultSets.length === 0) {
    return '<p class="placeholder">No result columns</p>';
  }

  return result.resultSets
    .map((resultSet) => {
      const title =
        result.resultSets.length > 1
          ? `<h3 class="result-set-title">Result set ${resultSet.index}</h3>`
          : "";
      return `${title}${renderTable(formatColumnsTable(resultSet.columns, { showJdbc: result.jdbcEnabled }))}`;
    })
    .join("");
}

function renderStatementsPanel(result: AnalyzeResult): string {
  if (result.statements.length === 0) {
    return '<p class="placeholder">No statement information</p>';
  }

  const rows = result.statements
    .map(
      (statement) => `
    <tr>
      <td>${statement.index}</td>
      <td><code>${escapeHtml(statement.kind)}</code></td>
      <td><span class="${resultKindClass(statement.resultKind)}">${escapeHtml(resultKindLabel(statement.resultKind))}</span></td>
      <td>${escapeHtml(statement.message ?? "")}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>kind</th>
            <th>result</th>
            <th>message</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderMessagesPanel(result: AnalyzeResult): string {
  const warnings = result.warnings
    .map((message) => `<li class="msg-warning">${escapeHtml(message)}</li>`)
    .join("");
  const diagnostics = result.diagnostics
    .map((diagnostic) => {
      const location = diagnostic.line ? ` (${diagnostic.line}:${diagnostic.column ?? 0})` : "";
      const severity = diagnostic.severity ?? "info";
      return `<li class="msg-${escapeHtml(severity)}"><strong>${escapeHtml(severity)}</strong>${escapeHtml(location)}: ${escapeHtml(diagnostic.message)}</li>`;
    })
    .join("");

  if (!warnings && !diagnostics) {
    return '<p class="placeholder">No warnings or diagnostics</p>';
  }

  return `
    ${warnings ? `<section><h3 class="section-title">Warnings</h3><ul class="msg-list">${warnings}</ul></section>` : ""}
    ${diagnostics ? `<section><h3 class="section-title">Diagnostics</h3><ul class="msg-list">${diagnostics}</ul></section>` : ""}
  `;
}

function renderTable(rows: string[][]): string {
  if (rows.length <= 1) {
    return '<p class="placeholder">No columns</p>';
  }

  const [headers, ...body] = rows;
  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const data = body
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${data}</tbody>
      </table>
    </div>
  `;
}

function renderDialectOptions(dialects: string[]): string {
  return dialects.map((d) => `<option value="${escapeAttr(d)}">${escapeHtml(d)}</option>`).join("");
}

function setStatus(kind: "idle" | "loading" | "success" | "error", message: string): void {
  const statusEl = mustGet<HTMLDivElement>("#status");
  statusEl.className = `status status-${kind}`;
  statusEl.textContent = message;
}

function mustGet<T extends Element>(selector: string): T {
  const element = app!.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
