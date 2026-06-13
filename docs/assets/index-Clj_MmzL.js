(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);
        new MutationObserver((r)=>{
            for (const n of r)if (n.type === "childList") for (const i of n.addedNodes)i.tagName === "LINK" && i.rel === "modulepreload" && a(i);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function s(r) {
            const n = {};
            return r.integrity && (n.integrity = r.integrity), r.referrerPolicy && (n.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? n.credentials = "include" : r.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin", n;
        }
        function a(r) {
            if (r.ep) return;
            r.ep = !0;
            const n = s(r);
            fetch(r.href, n);
        }
    })();
    const A = "modulepreload", j = function(e, t) {
        return new URL(e, t).href;
    }, E = {}, k = function(t, s, a) {
        let r = Promise.resolve();
        if (s && s.length > 0) {
            let i = function(d) {
                return Promise.all(d.map((p)=>Promise.resolve(p).then((m)=>({
                            status: "fulfilled",
                            value: m
                        }), (m)=>({
                            status: "rejected",
                            reason: m
                        }))));
            };
            const c = document.getElementsByTagName("link"), S = document.querySelector("meta[property=csp-nonce]"), $ = S?.nonce || S?.getAttribute("nonce");
            r = i(s.map((d)=>{
                if (d = j(d, a), d in E) return;
                E[d] = !0;
                const p = d.endsWith(".css"), m = p ? '[rel="stylesheet"]' : "";
                if (!!a) for(let b = c.length - 1; b >= 0; b--){
                    const y = c[b];
                    if (y.href === d && (!p || y.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${d}"]${m}`)) return;
                const u = document.createElement("link");
                if (u.rel = p ? "stylesheet" : A, p || (u.as = "script"), u.crossOrigin = "", u.href = d, $ && u.setAttribute("nonce", $), document.head.appendChild(u), p) return new Promise((b, y)=>{
                    u.addEventListener("load", b), u.addEventListener("error", ()=>y(new Error(`Unable to preload CSS for ${d}`)));
                });
            }));
        }
        function n(i) {
            const c = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (c.payload = i, window.dispatchEvent(c), !c.defaultPrevented) throw i;
        }
        return r.then((i)=>{
            for (const c of i || [])c.status === "rejected" && n(c.reason);
            return t().catch(n);
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
    function M(e) {
        const t = [
            "#",
            "name",
            "type",
            "nullable",
            "source",
            "note"
        ], s = e.map((a)=>[
                String(a.index),
                a.name,
                a.type,
                a.nullable === void 0 ? "" : String(a.nullable),
                a.source ?? "",
                a.note ?? ""
            ]);
        return [
            t,
            ...s
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
    const h = document.querySelector("#app");
    if (!h) throw new Error("#app not found");
    let v = "columns", g = "", L;
    O(D);
    R();
    function O(e) {
        h.innerHTML = `
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
          <textarea id="sql" class="editor" spellcheck="false" aria-label="SQL">${l(P)}</textarea>

          <details class="schema-details" open>
            <summary>Schema DDL（任意）</summary>
            <textarea id="schema" class="editor editor-sm" spellcheck="false" aria-label="Schema DDL">${l(x)}</textarea>
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
        const t = o("#dialect"), s = o("#binds"), a = o("#analyze"), r = o("#sql");
        t.value = e.includes("generic") ? "generic" : e[0] ?? "generic", s.value = "int", a.addEventListener("click", ()=>void w());
        for (const n of h.querySelectorAll(".tab"))n.addEventListener("click", ()=>{
            const i = n.dataset.tab;
            if (i) {
                v = i;
                for (const c of h.querySelectorAll(".tab"))c.classList.toggle("active", c === n);
                T();
            }
        });
        r.addEventListener("keydown", (n)=>{
            (n.ctrlKey || n.metaKey) && n.key === "Enter" && (n.preventDefault(), w());
        });
    }
    async function R() {
        f("loading", "SQL エンジンを読み込み中…");
        try {
            const { getSupportedDialects: e } = await k(async ()=>{
                const { getSupportedDialects: r } = await import("./analyzer-BJSoeHP-.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                });
                return {
                    getSupportedDialects: r
                };
            }, [], import.meta.url), t = e(), s = o("#dialect"), a = s.value;
            s.innerHTML = q(t), s.value = t.includes(a) ? a : t.includes("generic") ? "generic" : t[0] ?? "generic", f("idle", "SQL を入力して「解析」を押してください");
        } catch (e) {
            const t = e instanceof Error ? e.message : String(e);
            f("error", `SQL エンジンの読み込みに失敗しました: ${t}`);
        }
    }
    async function w() {
        const e = o("#analyze");
        e.disabled = !0, f("loading", "解析中…");
        try {
            const { analyzeSql: t } = await k(async ()=>{
                const { analyzeSql: r } = await import("./analyzer-BJSoeHP-.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                });
                return {
                    analyzeSql: r
                };
            }, [], import.meta.url), s = await t({
                sql: o("#sql").value,
                dialect: o("#dialect").value,
                binds: o("#binds").value,
                jdbc: o("#jdbc").checked,
                schemaSql: o("#schema").value
            });
            L = s, g = JSON.stringify(s, null, 2);
            const a = s.resultSets.reduce((r, n)=>r + n.columns.length, 0);
            f("success", `${s.statements.length} ステートメント / ${s.resultSets.length} 結果セット / ${a} 列`), T();
        } catch (t) {
            g = "", L = void 0;
            const s = t instanceof Error ? t.message : String(t);
            f("error", s), o("#output").innerHTML = `<pre class="error-box">${l(s)}</pre>`;
        } finally{
            e.disabled = !1;
        }
    }
    function T() {
        const e = o("#output"), t = L;
        if (!t) {
            if (g && v === "json") {
                e.innerHTML = `<pre class="json-box">${l(g)}</pre>`;
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
                e.innerHTML = `<pre class="json-box">${l(g)}</pre>`;
                break;
        }
    }
    function H(e) {
        return e.resultSets.length === 0 ? '<p class="placeholder">結果列はありません</p>' : e.resultSets.map((t)=>`${e.resultSets.length > 1 ? `<h3 class="result-set-title">Result set ${t.index}</h3>` : ""}${B(M(t.columns))}`).join("");
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
        <tbody>${e.statements.map((s)=>`
    <tr>
      <td>${s.index}</td>
      <td><code>${l(s.kind)}</code></td>
      <td><span class="${C(s.resultKind)}">${l(_(s.resultKind))}</span></td>
      <td>${l(s.message ?? "")}</td>
    </tr>
  `).join("")}</tbody>
      </table>
    </div>
  `;
    }
    function z(e) {
        const t = e.warnings.map((a)=>`<li class="msg-warning">${l(a)}</li>`).join(""), s = e.diagnostics.map((a)=>{
            const r = a.line ? ` (${a.line}:${a.column ?? 0})` : "", n = a.severity ?? "info";
            return `<li class="msg-${l(n)}"><strong>${l(n)}</strong>${l(r)}: ${l(a.message)}</li>`;
        }).join("");
        return !t && !s ? '<p class="placeholder">警告・診断はありません</p>' : `
    ${t ? `<section><h3 class="section-title">Warnings</h3><ul class="msg-list">${t}</ul></section>` : ""}
    ${s ? `<section><h3 class="section-title">Diagnostics</h3><ul class="msg-list">${s}</ul></section>` : ""}
  `;
    }
    function B(e) {
        if (e.length <= 1) return '<p class="placeholder">列がありません</p>';
        const [t, ...s] = e, a = t.map((n)=>`<th>${l(n)}</th>`).join(""), r = s.map((n)=>`<tr>${n.map((i)=>`<td>${l(i)}</td>`).join("")}</tr>`).join("");
        return `
    <div class="table-wrap">
      <table>
        <thead><tr>${a}</tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>
  `;
    }
    function q(e) {
        return e.map((t)=>`<option value="${K(t)}">${l(t)}</option>`).join("");
    }
    function f(e, t) {
        const s = o("#status");
        s.className = `status status-${e}`, s.textContent = t;
    }
    function o(e) {
        const t = h.querySelector(e);
        if (!t) throw new Error(`Missing element: ${e}`);
        return t;
    }
    function l(e) {
        return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    }
    function K(e) {
        return l(e).replaceAll("'", "&#39;");
    }
})();
