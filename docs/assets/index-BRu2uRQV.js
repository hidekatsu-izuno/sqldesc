(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);
        new MutationObserver((a)=>{
            for (const s of a)if (s.type === "childList") for (const l of s.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function n(a) {
            const s = {};
            return a.integrity && (s.integrity = a.integrity), a.referrerPolicy && (s.referrerPolicy = a.referrerPolicy), a.crossOrigin === "use-credentials" ? s.credentials = "include" : a.crossOrigin === "anonymous" ? s.credentials = "omit" : s.credentials = "same-origin", s;
        }
        function r(a) {
            if (a.ep) return;
            a.ep = !0;
            const s = n(a);
            fetch(a.href, s);
        }
    })();
    const A = "modulepreload", j = function(e, t) {
        return new URL(e, t).href;
    }, $ = {}, k = function(t, n, r) {
        let a = Promise.resolve();
        if (n && n.length > 0) {
            let l = function(d) {
                return Promise.all(d.map((p)=>Promise.resolve(p).then((h)=>({
                            status: "fulfilled",
                            value: h
                        }), (h)=>({
                            status: "rejected",
                            reason: h
                        }))));
            };
            const c = document.getElementsByTagName("link"), S = document.querySelector("meta[property=csp-nonce]"), E = S?.nonce || S?.getAttribute("nonce");
            a = l(n.map((d)=>{
                if (d = j(d, r), d in $) return;
                $[d] = !0;
                const p = d.endsWith(".css"), h = p ? '[rel="stylesheet"]' : "";
                if (!!r) for(let f = c.length - 1; f >= 0; f--){
                    const y = c[f];
                    if (y.href === d && (!p || y.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${d}"]${h}`)) return;
                const u = document.createElement("link");
                if (u.rel = p ? "stylesheet" : A, p || (u.as = "script"), u.crossOrigin = "", u.href = d, E && u.setAttribute("nonce", E), document.head.appendChild(u), p) return new Promise((f, y)=>{
                    u.addEventListener("load", f), u.addEventListener("error", ()=>y(new Error(`Unable to preload CSS for ${d}`)));
                });
            }));
        }
        function s(l) {
            const c = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (c.payload = l, window.dispatchEvent(c), !c.defaultPrevented) throw l;
        }
        return a.then((l)=>{
            for (const c of l || [])c.status === "rejected" && s(c.reason);
            return t().catch(s);
        });
    }, P = `SELECT id, name
FROM users
WHERE id = ?`, x = `CREATE TABLE users (
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
        const n = t?.showJdbc ?? !1, r = n ? [
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
        ], a = e.map((s)=>{
            const l = [
                String(s.index),
                s.name,
                s.type
            ];
            return n && l.push(s.jdbcType ?? ""), l.push(s.nullable === void 0 ? "" : String(s.nullable), s.source ?? "", s.note ?? ""), l;
        });
        return [
            r,
            ...a
        ];
    }
    function _(e) {
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
    function C(e) {
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
    const m = document.querySelector("#app");
    if (!m) throw new Error("#app not found");
    let v = "columns", g = "", L;
    O(D);
    R();
    function O(e) {
        m.innerHTML = `
    <div class="layout">
      <header class="header">
        <div class="header-brand">
          <h1>sqldesc</h1>
          <p>SQL の結果セット列を静的に推論します</p>
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
                <select id="dialect">${q(e)}</select>
              </label>
              <label class="field field-inline">
                <span>Binds</span>
                <input id="binds" type="text" placeholder="int,text または id=int,name=text" spellcheck="false" />
              </label>
              <label class="field field-check">
                <input id="jdbc" type="checkbox" />
                <span>JDBC</span>
              </label>
              <button id="analyze" type="button" class="btn-primary">解析</button>
            </div>
          </div>
          <textarea id="sql" class="editor" spellcheck="false" aria-label="SQL">${i(P)}</textarea>

          <details class="schema-details" open>
            <summary>Schema DDL（任意）</summary>
            <textarea id="schema" class="editor editor-sm" spellcheck="false" aria-label="Schema DDL">${i(x)}</textarea>
          </details>
        </section>

        <section class="panel panel-output">
          <div class="panel-head">
            <h2>結果</h2>
            <div class="tabs" role="tablist">
              <button type="button" class="tab active" data-tab="columns">Columns</button>
              <button type="button" class="tab" data-tab="statements">Statements</button>
              <button type="button" class="tab" data-tab="messages">Warnings</button>
              <button type="button" class="tab" data-tab="json">JSON</button>
            </div>
          </div>
          <div id="status" class="status status-idle">SQL を入力して「解析」を押してください</div>
          <div id="output" class="output"><p class="placeholder">解析結果がここに表示されます</p></div>
        </section>
      </main>
    </div>
  `;
        const t = o("#dialect"), n = o("#binds"), r = o("#analyze"), a = o("#sql");
        t.value = e.includes("generic") ? "generic" : e[0] ?? "generic", n.value = "int", r.addEventListener("click", ()=>void w());
        for (const s of m.querySelectorAll(".tab"))s.addEventListener("click", ()=>{
            const l = s.dataset.tab;
            if (l) {
                v = l;
                for (const c of m.querySelectorAll(".tab"))c.classList.toggle("active", c === s);
                T();
            }
        });
        a.addEventListener("keydown", (s)=>{
            (s.ctrlKey || s.metaKey) && s.key === "Enter" && (s.preventDefault(), w());
        });
    }
    async function R() {
        b("loading", "SQL エンジンを読み込み中…");
        try {
            const { getSupportedDialects: e } = await k(async ()=>{
                const { getSupportedDialects: a } = await import("./analyzer-kZIokawR.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                });
                return {
                    getSupportedDialects: a
                };
            }, [], import.meta.url), t = e(), n = o("#dialect"), r = n.value;
            n.innerHTML = q(t), n.value = t.includes(r) ? r : t.includes("generic") ? "generic" : t[0] ?? "generic", b("idle", "SQL を入力して「解析」を押してください");
        } catch (e) {
            const t = e instanceof Error ? e.message : String(e);
            b("error", `SQL エンジンの読み込みに失敗しました: ${t}`);
        }
    }
    async function w() {
        const e = o("#analyze");
        e.disabled = !0, b("loading", "解析中…");
        try {
            const { analyzeSql: t } = await k(async ()=>{
                const { analyzeSql: a } = await import("./analyzer-kZIokawR.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                });
                return {
                    analyzeSql: a
                };
            }, [], import.meta.url), n = await t({
                sql: o("#sql").value,
                dialect: o("#dialect").value,
                binds: o("#binds").value,
                jdbc: o("#jdbc").checked,
                schemaSql: o("#schema").value
            });
            L = n, g = JSON.stringify(n, null, 2);
            const r = n.resultSets.reduce((a, s)=>a + s.columns.length, 0);
            b("success", `${n.statements.length} ステートメント / ${n.resultSets.length} 結果セット / ${r} 列`), T();
        } catch (t) {
            g = "", L = void 0;
            const n = t instanceof Error ? t.message : String(t);
            b("error", n), o("#output").innerHTML = `<pre class="error-box">${i(n)}</pre>`;
        } finally{
            e.disabled = !1;
        }
    }
    function T() {
        const e = o("#output"), t = L;
        if (!t) {
            if (g && v === "json") {
                e.innerHTML = `<pre class="json-box">${i(g)}</pre>`;
                return;
            }
            e.innerHTML = '<p class="placeholder">解析結果がここに表示されます</p>';
            return;
        }
        switch(v){
            case "columns":
                e.innerHTML = H(t);
                break;
            case "statements":
                e.innerHTML = N(t);
                break;
            case "messages":
                e.innerHTML = z(t);
                break;
            case "json":
                e.innerHTML = `<pre class="json-box">${i(g)}</pre>`;
                break;
        }
    }
    function H(e) {
        return e.resultSets.length === 0 ? '<p class="placeholder">結果列はありません</p>' : e.resultSets.map((t)=>`${e.resultSets.length > 1 ? `<h3 class="result-set-title">Result set ${t.index}</h3>` : ""}${B(M(t.columns, {
                showJdbc: e.jdbcEnabled
            }))}`).join("");
    }
    function N(e) {
        return e.statements.length === 0 ? '<p class="placeholder">ステートメント情報はありません</p>' : `
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
        <tbody>${e.statements.map((n)=>`
    <tr>
      <td>${n.index}</td>
      <td><code>${i(n.kind)}</code></td>
      <td><span class="${C(n.resultKind)}">${i(_(n.resultKind))}</span></td>
      <td>${i(n.message ?? "")}</td>
    </tr>
  `).join("")}</tbody>
      </table>
    </div>
  `;
    }
    function z(e) {
        const t = e.warnings.map((r)=>`<li class="msg-warning">${i(r)}</li>`).join(""), n = e.diagnostics.map((r)=>{
            const a = r.line ? ` (${r.line}:${r.column ?? 0})` : "", s = r.severity ?? "info";
            return `<li class="msg-${i(s)}"><strong>${i(s)}</strong>${i(a)}: ${i(r.message)}</li>`;
        }).join("");
        return !t && !n ? '<p class="placeholder">警告・診断はありません</p>' : `
    ${t ? `<section><h3 class="section-title">Warnings</h3><ul class="msg-list">${t}</ul></section>` : ""}
    ${n ? `<section><h3 class="section-title">Diagnostics</h3><ul class="msg-list">${n}</ul></section>` : ""}
  `;
    }
    function B(e) {
        if (e.length <= 1) return '<p class="placeholder">列がありません</p>';
        const [t, ...n] = e, r = t.map((s)=>`<th>${i(s)}</th>`).join(""), a = n.map((s)=>`<tr>${s.map((l)=>`<td>${i(l)}</td>`).join("")}</tr>`).join("");
        return `
    <div class="table-wrap">
      <table>
        <thead><tr>${r}</tr></thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  `;
    }
    function q(e) {
        return e.map((t)=>`<option value="${K(t)}">${i(t)}</option>`).join("");
    }
    function b(e, t) {
        const n = o("#status");
        n.className = `status status-${e}`, n.textContent = t;
    }
    function o(e) {
        const t = m.querySelector(e);
        if (!t) throw new Error(`Missing element: ${e}`);
        return t;
    }
    function i(e) {
        return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    }
    function K(e) {
        return i(e).replaceAll("'", "&#39;");
    }
})();
