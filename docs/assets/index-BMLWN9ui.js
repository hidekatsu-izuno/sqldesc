(async () => {
  (function() {
    const t = document.createElement("link").relList;
    if (t && t.supports && t.supports("modulepreload")) return;
    for (const r of document.querySelectorAll('link[rel="modulepreload"]')) a(r);
    new MutationObserver((r) => {
      for (const s of r) if (s.type === "childList") for (const i of s.addedNodes) i.tagName === "LINK" && i.rel === "modulepreload" && a(i);
    }).observe(document, {
      childList: true,
      subtree: true
    });
    function n(r) {
      const s = {};
      return r.integrity && (s.integrity = r.integrity), r.referrerPolicy && (s.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? s.credentials = "include" : r.crossOrigin === "anonymous" ? s.credentials = "omit" : s.credentials = "same-origin", s;
    }
    function a(r) {
      if (r.ep) return;
      r.ep = true;
      const s = n(r);
      fetch(r.href, s);
    }
  })();
  const A = "modulepreload", j = function(e, t) {
    return new URL(e, t).href;
  }, E = {}, k = function(t, n, a) {
    let r = Promise.resolve();
    if (n && n.length > 0) {
      let i = function(u) {
        return Promise.all(u.map((p) => Promise.resolve(p).then((m) => ({
          status: "fulfilled",
          value: m
        }), (m) => ({
          status: "rejected",
          reason: m
        }))));
      };
      const c = document.getElementsByTagName("link"), S = document.querySelector("meta[property=csp-nonce]"), $ = (S == null ? void 0 : S.nonce) || (S == null ? void 0 : S.getAttribute("nonce"));
      r = i(n.map((u) => {
        if (u = j(u, a), u in E) return;
        E[u] = true;
        const p = u.endsWith(".css"), m = p ? '[rel="stylesheet"]' : "";
        if (!!a) for (let h = c.length - 1; h >= 0; h--) {
          const y = c[h];
          if (y.href === u && (!p || y.rel === "stylesheet")) return;
        }
        else if (document.querySelector(`link[href="${u}"]${m}`)) return;
        const d = document.createElement("link");
        if (d.rel = p ? "stylesheet" : A, p || (d.as = "script"), d.crossOrigin = "", d.href = u, $ && d.setAttribute("nonce", $), document.head.appendChild(d), p) return new Promise((h, y) => {
          d.addEventListener("load", h), d.addEventListener("error", () => y(new Error(`Unable to preload CSS for ${u}`)));
        });
      }));
    }
    function s(i) {
      const c = new Event("vite:preloadError", {
        cancelable: true
      });
      if (c.payload = i, window.dispatchEvent(c), !c.defaultPrevented) throw i;
    }
    return r.then((i) => {
      for (const c of i || []) c.status === "rejected" && s(c.reason);
      return t().catch(s);
    });
  }, P = `SELECT id, name
FROM users
WHERE id = ?`, D = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name TEXT NOT NULL
);`, M = [
    "generic",
    "postgresql",
    "mysql",
    "sqlite",
    "bigquery",
    "snowflake",
    "duckdb",
    "tsql",
    "oracle",
    "clickhouse"
  ];
  function _(e) {
    const t = [
      "#",
      "name",
      "type",
      "nullable",
      "confidence",
      "source",
      "note"
    ], n = e.map((a) => [
      String(a.index),
      a.name ?? "",
      a.type,
      a.nullable === void 0 ? "" : String(a.nullable),
      a.confidence,
      a.source ?? "",
      a.note ?? ""
    ]);
    return [
      t,
      ...n
    ];
  }
  function x(e) {
    switch (e) {
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
    switch (e) {
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
  const b = document.querySelector("#app");
  if (!b) throw new Error("#app not found");
  let v = "columns", g = "", L;
  O(M);
  R();
  function O(e) {
    b.innerHTML = `
    <div class="layout">
      <header class="header">
        <div class="header-brand">
          <h1>sqldesc</h1>
          <p>SQL \u306E\u7D50\u679C\u30BB\u30C3\u30C8\u5217\u3092\u9759\u7684\u306B\u63A8\u8AD6\u3057\u307E\u3059</p>
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
                <input id="binds" type="text" placeholder="int,text \u307E\u305F\u306F id=int,name=text" spellcheck="false" />
              </label>
              <label class="field field-check">
                <input id="jdbc" type="checkbox" />
                <span>JDBC</span>
              </label>
              <button id="analyze" type="button" class="btn-primary">\u89E3\u6790</button>
            </div>
          </div>
          <textarea id="sql" class="editor" spellcheck="false" aria-label="SQL">${l(P)}</textarea>

          <details class="schema-details" open>
            <summary>Schema DDL\uFF08\u4EFB\u610F\uFF09</summary>
            <textarea id="schema" class="editor editor-sm" spellcheck="false" aria-label="Schema DDL">${l(D)}</textarea>
          </details>
        </section>

        <section class="panel panel-output">
          <div class="panel-head">
            <h2>\u7D50\u679C</h2>
            <div class="tabs" role="tablist">
              <button type="button" class="tab active" data-tab="columns">Columns</button>
              <button type="button" class="tab" data-tab="statements">Statements</button>
              <button type="button" class="tab" data-tab="messages">Warnings</button>
              <button type="button" class="tab" data-tab="json">JSON</button>
            </div>
          </div>
          <div id="status" class="status status-idle">SQL \u3092\u5165\u529B\u3057\u3066\u300C\u89E3\u6790\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044</div>
          <div id="output" class="output"><p class="placeholder">\u89E3\u6790\u7D50\u679C\u304C\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059</p></div>
        </section>
      </main>
    </div>
  `;
    const t = o("#dialect"), n = o("#binds"), a = o("#analyze"), r = o("#sql");
    t.value = e.includes("generic") ? "generic" : e[0] ?? "generic", n.value = "int", a.addEventListener("click", () => void w());
    for (const s of b.querySelectorAll(".tab")) s.addEventListener("click", () => {
      const i = s.dataset.tab;
      if (i) {
        v = i;
        for (const c of b.querySelectorAll(".tab")) c.classList.toggle("active", c === s);
        T();
      }
    });
    r.addEventListener("keydown", (s) => {
      (s.ctrlKey || s.metaKey) && s.key === "Enter" && (s.preventDefault(), w());
    });
  }
  async function R() {
    f("loading", "SQL \u30A8\u30F3\u30B8\u30F3\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026");
    try {
      const { getSupportedDialects: e } = await k(async () => {
        const { getSupportedDialects: r } = await import("./analyzer-BJSoeHP-.js").then(async (m) => {
          await m.__tla;
          return m;
        });
        return {
          getSupportedDialects: r
        };
      }, [], import.meta.url), t = e(), n = o("#dialect"), a = n.value;
      n.innerHTML = q(t), n.value = t.includes(a) ? a : t.includes("generic") ? "generic" : t[0] ?? "generic", f("idle", "SQL \u3092\u5165\u529B\u3057\u3066\u300C\u89E3\u6790\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044");
    } catch (e) {
      const t = e instanceof Error ? e.message : String(e);
      f("error", `SQL \u30A8\u30F3\u30B8\u30F3\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${t}`);
    }
  }
  async function w() {
    const e = o("#analyze");
    e.disabled = true, f("loading", "\u89E3\u6790\u4E2D\u2026");
    try {
      const { analyzeSql: t } = await k(async () => {
        const { analyzeSql: r } = await import("./analyzer-BJSoeHP-.js").then(async (m) => {
          await m.__tla;
          return m;
        });
        return {
          analyzeSql: r
        };
      }, [], import.meta.url), n = await t({
        sql: o("#sql").value,
        dialect: o("#dialect").value,
        binds: o("#binds").value,
        jdbc: o("#jdbc").checked,
        schemaSql: o("#schema").value
      });
      L = n, g = JSON.stringify(n, null, 2);
      const a = n.resultSets.reduce((r, s) => r + s.columns.length, 0);
      f("success", `${n.statements.length} \u30B9\u30C6\u30FC\u30C8\u30E1\u30F3\u30C8 / ${n.resultSets.length} \u7D50\u679C\u30BB\u30C3\u30C8 / ${a} \u5217`), T();
    } catch (t) {
      g = "", L = void 0;
      const n = t instanceof Error ? t.message : String(t);
      f("error", n), o("#output").innerHTML = `<pre class="error-box">${l(n)}</pre>`;
    } finally {
      e.disabled = false;
    }
  }
  function T() {
    const e = o("#output"), t = L;
    if (!t) {
      if (g && v === "json") {
        e.innerHTML = `<pre class="json-box">${l(g)}</pre>`;
        return;
      }
      e.innerHTML = '<p class="placeholder">\u89E3\u6790\u7D50\u679C\u304C\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059</p>';
      return;
    }
    switch (v) {
      case "columns":
        e.innerHTML = H(t);
        break;
      case "statements":
        e.innerHTML = N(t);
        break;
      case "messages":
        e.innerHTML = B(t);
        break;
      case "json":
        e.innerHTML = `<pre class="json-box">${l(g)}</pre>`;
        break;
    }
  }
  function H(e) {
    return e.resultSets.length === 0 ? '<p class="placeholder">\u7D50\u679C\u5217\u306F\u3042\u308A\u307E\u305B\u3093</p>' : e.resultSets.map((t) => `${e.resultSets.length > 1 ? `<h3 class="result-set-title">Result set ${t.index}</h3>` : ""}${K(_(t.columns))}`).join("");
  }
  function N(e) {
    return e.statements.length === 0 ? '<p class="placeholder">\u30B9\u30C6\u30FC\u30C8\u30E1\u30F3\u30C8\u60C5\u5831\u306F\u3042\u308A\u307E\u305B\u3093</p>' : `
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
        <tbody>${e.statements.map((n) => `
    <tr>
      <td>${n.index}</td>
      <td><code>${l(n.kind)}</code></td>
      <td><span class="${C(n.resultKind)}">${l(x(n.resultKind))}</span></td>
      <td>${l(n.message ?? "")}</td>
    </tr>
  `).join("")}</tbody>
      </table>
    </div>
  `;
  }
  function B(e) {
    const t = e.warnings.map((a) => `<li class="msg-warning">${l(a)}</li>`).join(""), n = e.diagnostics.map((a) => {
      const r = a.line ? ` (${a.line}:${a.column ?? 0})` : "", s = a.severity ?? "info";
      return `<li class="msg-${l(s)}"><strong>${l(s)}</strong>${l(r)}: ${l(a.message)}</li>`;
    }).join("");
    return !t && !n ? '<p class="placeholder">\u8B66\u544A\u30FB\u8A3A\u65AD\u306F\u3042\u308A\u307E\u305B\u3093</p>' : `
    ${t ? `<section><h3 class="section-title">Warnings</h3><ul class="msg-list">${t}</ul></section>` : ""}
    ${n ? `<section><h3 class="section-title">Diagnostics</h3><ul class="msg-list">${n}</ul></section>` : ""}
  `;
  }
  function K(e) {
    if (e.length <= 1) return '<p class="placeholder">\u5217\u304C\u3042\u308A\u307E\u305B\u3093</p>';
    const [t, ...n] = e, a = t.map((s) => `<th>${l(s)}</th>`).join(""), r = n.map((s) => `<tr>${s.map((i) => `<td>${l(i)}</td>`).join("")}</tr>`).join("");
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
    return e.map((t) => `<option value="${z(t)}">${l(t)}</option>`).join("");
  }
  function f(e, t) {
    const n = o("#status");
    n.className = `status status-${e}`, n.textContent = t;
  }
  function o(e) {
    const t = b.querySelector(e);
    if (!t) throw new Error(`Missing element: ${e}`);
    return t;
  }
  function l(e) {
    return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }
  function z(e) {
    return l(e).replaceAll("'", "&#39;");
  }
})();
