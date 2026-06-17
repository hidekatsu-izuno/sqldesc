(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);
        new MutationObserver((a)=>{
            for (const n of a)if (n.type === "childList") for (const l of n.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function s(a) {
            const n = {};
            return a.integrity && (n.integrity = a.integrity), a.referrerPolicy && (n.referrerPolicy = a.referrerPolicy), a.crossOrigin === "use-credentials" ? n.credentials = "include" : a.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin", n;
        }
        function r(a) {
            if (a.ep) return;
            a.ep = !0;
            const n = s(a);
            fetch(a.href, n);
        }
    })();
    const q = "modulepreload", j = function(e, t) {
        return new URL(e, t).href;
    }, $ = {}, k = function(t, s, r) {
        let a = Promise.resolve();
        if (s && s.length > 0) {
            let l = function(d) {
                return Promise.all(d.map((h)=>Promise.resolve(h).then((f)=>({
                            status: "fulfilled",
                            value: f
                        }), (f)=>({
                            status: "rejected",
                            reason: f
                        }))));
            };
            const u = document.getElementsByTagName("link"), c = document.querySelector("meta[property=csp-nonce]"), m = c?.nonce || c?.getAttribute("nonce");
            a = l(s.map((d)=>{
                if (d = j(d, r), d in $) return;
                $[d] = !0;
                const h = d.endsWith(".css"), f = h ? '[rel="stylesheet"]' : "";
                if (!!r) for(let g = u.length - 1; g >= 0; g--){
                    const L = u[g];
                    if (L.href === d && (!h || L.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${d}"]${f}`)) return;
                const p = document.createElement("link");
                if (p.rel = h ? "stylesheet" : q, h || (p.as = "script"), p.crossOrigin = "", p.href = d, m && p.setAttribute("nonce", m), document.head.appendChild(p), h) return new Promise((g, L)=>{
                    p.addEventListener("load", g), p.addEventListener("error", ()=>L(new Error(`Unable to preload CSS for ${d}`)));
                });
            }));
        }
        function n(l) {
            const u = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (u.payload = l, window.dispatchEvent(u), !u.defaultPrevented) throw l;
        }
        return a.then((l)=>{
            for (const u of l || [])u.status === "rejected" && n(u.reason);
            return t().catch(n);
        });
    }, x = `SELECT id, name
FROM users
WHERE id = ?`, P = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name TEXT NOT NULL
);`, D = [
        "athena",
        "bigquery",
        "clickhouse",
        "cockroachdb",
        "databricks",
        "datafusion",
        "doris",
        "dremio",
        "drill",
        "druid",
        "duckdb",
        "dune",
        "exasol",
        "fabric",
        "generic",
        "hive",
        "materialize",
        "mysql",
        "oracle",
        "postgresql",
        "presto",
        "redshift",
        "risingwave",
        "singlestore",
        "snowflake",
        "solr",
        "spark",
        "sqlite",
        "starrocks",
        "tableau",
        "teradata",
        "tidb",
        "trino",
        "tsql"
    ];
    function M(e, t) {
        const s = t?.showJdbc ?? !1, r = s ? [
            "#",
            "name",
            "type",
            "jdbc",
            "nullable",
            "source",
            "note"
        ] : [
            "#",
            "name",
            "type",
            "nullable",
            "source",
            "note"
        ], a = e.map((n)=>{
            const l = [
                String(n.index),
                n.name,
                n.type
            ];
            return s && l.push(n.jdbcType ?? ""), l.push(n.nullable === void 0 ? "" : String(n.nullable), n.source ?? "", n.note ?? ""), l;
        });
        return [
            r,
            ...a
        ];
    }
    function N(e) {
        switch(e){
            case "static":
                return "static";
            case "none":
                return "no result";
            case "runtime":
                return "runtime dependent";
            case "metadata":
                return "metadata dependent";
            default:
                return "unknown";
        }
    }
    function O(e) {
        switch(e){
            case "static":
                return "badge badge-static";
            case "none":
                return "badge badge-none";
            case "runtime":
                return "badge badge-runtime";
            case "metadata":
                return "badge badge-metadata";
            default:
                return "badge badge-unknown";
        }
    }
    const y = document.querySelector("#app");
    if (!y) throw new Error("#app not found");
    let E = "columns", v = "", S;
    _(D);
    C();
    function _(e) {
        y.innerHTML = `
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
                <select id="dialect">${T(e)}</select>
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
              <textarea id="sql" class="editor sql-editor" spellcheck="false" aria-label="SQL">${o(x)}</textarea>
            </div>
            <div class="schema-section schema-open">
              <button type="button" class="schema-toggle" aria-expanded="true">Schema DDL (optional)</button>
              <div class="schema-body">
                <textarea id="schema" class="editor schema-editor" spellcheck="false" aria-label="Schema DDL">${o(P)}</textarea>
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
        const t = i("#dialect"), s = i("#binds"), r = i("#analyze"), a = i("#sql");
        t.value = e.includes("generic") ? "generic" : e[0] ?? "generic", s.value = "int", r.addEventListener("click", ()=>void w());
        const n = i(".input-body"), l = i(".schema-section"), u = i(".schema-toggle");
        u.addEventListener("click", ()=>{
            const c = l.classList.toggle("schema-open");
            n.classList.toggle("schema-open", c), u.setAttribute("aria-expanded", c ? "true" : "false");
        });
        for (const c of y.querySelectorAll(".tab"))c.addEventListener("click", ()=>{
            const m = c.dataset.tab;
            if (m) {
                E = m;
                for (const d of y.querySelectorAll(".tab"))d.classList.toggle("active", d === c);
                A();
            }
        });
        a.addEventListener("keydown", (c)=>{
            (c.ctrlKey || c.metaKey) && c.key === "Enter" && (c.preventDefault(), w());
        });
    }
    async function C() {
        b("loading", "Loading SQL engine…");
        try {
            const { getSupportedDialects: e } = await k(async ()=>{
                const { getSupportedDialects: a } = await import("./analyzer-SrMyLfIG.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                });
                return {
                    getSupportedDialects: a
                };
            }, [], import.meta.url), t = e(), s = i("#dialect"), r = s.value;
            s.innerHTML = T(t), s.value = t.includes(r) ? r : t.includes("generic") ? "generic" : t[0] ?? "generic", b("idle", "Enter SQL and click Analyze");
        } catch (e) {
            const t = e instanceof Error ? e.message : String(e);
            b("error", `Failed to load SQL engine: ${t}`);
        }
    }
    async function w() {
        const e = i("#analyze");
        e.disabled = !0, b("loading", "Analyzing…");
        try {
            const { analyzeSql: t } = await k(async ()=>{
                const { analyzeSql: a } = await import("./analyzer-SrMyLfIG.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                });
                return {
                    analyzeSql: a
                };
            }, [], import.meta.url), s = await t({
                sql: i("#sql").value,
                dialect: i("#dialect").value,
                binds: i("#binds").value,
                jdbc: i("#jdbc").checked,
                schemaSql: i("#schema").value
            });
            S = s, v = JSON.stringify(s, null, 2);
            const r = s.resultSets.reduce((a, n)=>a + n.columns.length, 0);
            b("success", `${s.statements.length} statements / ${s.resultSets.length} result sets / ${r} columns`), A();
        } catch (t) {
            v = "", S = void 0;
            const s = t instanceof Error ? t.message : String(t);
            b("error", s), i("#output").innerHTML = `<pre class="error-box">${o(s)}</pre>`;
        } finally{
            e.disabled = !1;
        }
    }
    function A() {
        const e = i("#output"), t = S;
        if (!t) {
            if (v && E === "json") {
                e.innerHTML = `<pre class="json-box">${o(v)}</pre>`;
                return;
            }
            e.innerHTML = '<p class="placeholder">Analysis results will appear here</p>';
            return;
        }
        switch(E){
            case "columns":
                e.innerHTML = R(t);
                break;
            case "statements":
                e.innerHTML = z(t);
                break;
            case "messages":
                e.innerHTML = H(t);
                break;
            case "json":
                e.innerHTML = `<pre class="json-box">${o(v)}</pre>`;
                break;
        }
    }
    function R(e) {
        return e.resultSets.length === 0 ? '<p class="placeholder">No result columns</p>' : e.resultSets.map((t)=>`${e.resultSets.length > 1 ? `<h3 class="result-set-title">Result set ${t.index}</h3>` : ""}${B(M(t.columns, {
                showJdbc: e.jdbcEnabled
            }))}`).join("");
    }
    function z(e) {
        return e.statements.length === 0 ? '<p class="placeholder">No statement information</p>' : `
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
        <tbody>${e.statements.map((s)=>`
    <tr>
      <td>${s.index}</td>
      <td><code>${o(s.kind)}</code></td>
      <td><span class="${O(s.resultKind)}">${o(N(s.resultKind))}</span></td>
      <td>${o(s.message ?? "")}</td>
    </tr>
  `).join("")}</tbody>
      </table>
    </div>
  `;
    }
    function H(e) {
        const t = e.warnings.map((r)=>`<li class="msg-warning">${o(r)}</li>`).join(""), s = e.diagnostics.map((r)=>{
            const a = r.line ? ` (${r.line}:${r.column ?? 0})` : "", n = r.severity ?? "info";
            return `<li class="msg-${o(n)}"><strong>${o(n)}</strong>${o(a)}: ${o(r.message)}</li>`;
        }).join("");
        return !t && !s ? '<p class="placeholder">No warnings or diagnostics</p>' : `
    ${t ? `<section><h3 class="section-title">Warnings</h3><ul class="msg-list">${t}</ul></section>` : ""}
    ${s ? `<section><h3 class="section-title">Diagnostics</h3><ul class="msg-list">${s}</ul></section>` : ""}
  `;
    }
    function B(e) {
        if (e.length <= 1) return '<p class="placeholder">No columns</p>';
        const [t, ...s] = e, r = t.map((n)=>`<th>${o(n)}</th>`).join(""), a = s.map((n)=>`<tr>${n.map((l)=>`<td>${o(l)}</td>`).join("")}</tr>`).join("");
        return `
    <div class="table-wrap">
      <table>
        <thead><tr>${r}</tr></thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  `;
    }
    function T(e) {
        return e.map((t)=>`<option value="${K(t)}">${o(t)}</option>`).join("");
    }
    function b(e, t) {
        const s = i("#status");
        s.className = `status status-${e}`, s.textContent = t;
    }
    function i(e) {
        const t = y.querySelector(e);
        if (!t) throw new Error(`Missing element: ${e}`);
        return t;
    }
    function o(e) {
        return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    }
    function K(e) {
        return o(e).replaceAll("'", "&#39;");
    }
})();
