let Uy, jm;
let __tla = (async () => {
  function Qs(e) {
    if (!e || e.trim() === "") return {
      mode: "none",
      binds: []
    };
    const t = e.split(",").map((s) => s.trim()).filter(Boolean);
    if (t.length === 0) return {
      mode: "none",
      binds: []
    };
    const n = t.some((s) => s.includes("=")), r = t.some((s) => !s.includes("="));
    if (n && r) throw new Error('Mixed bind syntax is not supported. Use either "int,text" or "id=int,name=text".');
    if (n) {
      const s = /* @__PURE__ */ new Set();
      return {
        mode: "named",
        binds: t.map((a) => {
          const [o, ...c] = a.split("="), u = o.trim(), l = c.join("=").trim();
          if (!u || !l) throw new Error(`Invalid named bind "${a}". Expected name=type.`);
          if (s.has(u)) throw new Error(`Duplicate bind name "${u}".`);
          return s.add(u), {
            name: u,
            type: l
          };
        })
      };
    }
    return {
      mode: "positional",
      binds: t.map((s, a) => {
        if (!s) throw new Error(`Invalid positional bind at index ${a + 1}.`);
        return {
          index: a + 1,
          type: s
        };
      })
    };
  }
  const Gs = new URL("" + new URL("polyglot_sql-C3wwNi5b.wasm", import.meta.url).href, import.meta.url).href, Zs = async (e = {}, t) => {
    let n;
    if (t.startsWith("data:")) {
      const r = t.replace(/^data:.*?base64,/, "");
      let s;
      if (typeof Buffer == "function" && typeof Buffer.from == "function") s = Buffer.from(r, "base64");
      else if (typeof atob == "function") {
        const a = atob(r);
        s = new Uint8Array(a.length);
        for (let o = 0; o < a.length; o++) s[o] = a.charCodeAt(o);
      } else throw new Error("Cannot decode base64-encoded data URL");
      n = await WebAssembly.instantiate(s, e);
    } else {
      const r = await fetch(t), s = r.headers.get("Content-Type") || "";
      if ("instantiateStreaming" in WebAssembly && s.startsWith("application/wasm")) n = await WebAssembly.instantiateStreaming(r, e);
      else {
        const a = await r.arrayBuffer();
        n = await WebAssembly.instantiate(a, e);
      }
    }
    return n.instance.exports;
  };
  class lt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, hn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmassignmentarray_free(t, 0);
    }
    len() {
      return i.wasmassignmentarray_len(this.__wbg_ptr) >>> 0;
    }
    constructor() {
      const t = i.wasmassignmentarray_new();
      return this.__wbg_ptr = t >>> 0, hn.register(this, this.__wbg_ptr, this), this;
    }
    push(t, n) {
      const r = v(t, i.__wbindgen_export, i.__wbindgen_export2), s = x;
      q(n, A), i.wasmassignmentarray_push(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
  }
  Symbol.dispose && (lt.prototype[Symbol.dispose] = lt.prototype.free);
  class Me {
    static __wrap(t) {
      t = t >>> 0;
      const n = Object.create(Me.prototype);
      return n.__wbg_ptr = t, St.register(n, n.__wbg_ptr, n), n;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, St.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmcasebuilder_free(t, 0);
    }
    build_expr() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmcasebuilder_build_expr(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return A.__wrap(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    else_(t) {
      q(t, A), i.wasmcasebuilder_else_(this.__wbg_ptr, t.__wbg_ptr);
    }
    constructor() {
      const t = i.wasmcasebuilder_new();
      return this.__wbg_ptr = t >>> 0, St.register(this, this.__wbg_ptr, this), this;
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmcasebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    when(t, n) {
      q(t, A), q(n, A), i.wasmcasebuilder_when(this.__wbg_ptr, t.__wbg_ptr, n.__wbg_ptr);
    }
  }
  Symbol.dispose && (Me.prototype[Symbol.dispose] = Me.prototype.free);
  class Mt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, xn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmdeletebuilder_free(t, 0);
    }
    build() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmdeletebuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    constructor(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasmdeletebuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, xn.register(this, this.__wbg_ptr, this), this;
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmdeletebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    where_expr(t) {
      q(t, A), i.wasmdeletebuilder_where_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (Mt.prototype[Symbol.dispose] = Mt.prototype.free);
  class A {
    static __wrap(t) {
      t = t >>> 0;
      const n = Object.create(A.prototype);
      return n.__wbg_ptr = t, vn.register(n, n.__wbg_ptr, n), n;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, vn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmexpr_free(t, 0);
    }
    add(t) {
      q(t, A);
      const n = i.wasmexpr_add(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    alias(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasmexpr_alias(this.__wbg_ptr, n, r);
      return A.__wrap(s);
    }
    and(t) {
      q(t, A);
      const n = i.wasmexpr_and(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    asc() {
      const t = i.wasmexpr_asc(this.__wbg_ptr);
      return A.__wrap(t);
    }
    between(t, n) {
      q(t, A), q(n, A);
      const r = i.wasmexpr_between(this.__wbg_ptr, t.__wbg_ptr, n.__wbg_ptr);
      return A.__wrap(r);
    }
    cast(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasmexpr_cast(this.__wbg_ptr, n, r);
      return A.__wrap(s);
    }
    desc() {
      const t = i.wasmexpr_desc(this.__wbg_ptr);
      return A.__wrap(t);
    }
    div(t) {
      q(t, A);
      const n = i.wasmexpr_div(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    eq(t) {
      q(t, A);
      const n = i.wasmexpr_eq(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    gt(t) {
      q(t, A);
      const n = i.wasmexpr_gt(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    gte(t) {
      q(t, A);
      const n = i.wasmexpr_gte(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    ilike(t) {
      q(t, A);
      const n = i.wasmexpr_ilike(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    in_list(t) {
      q(t, ne);
      const n = i.wasmexpr_in_list(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    is_not_null() {
      const t = i.wasmexpr_is_not_null(this.__wbg_ptr);
      return A.__wrap(t);
    }
    is_null() {
      const t = i.wasmexpr_is_null(this.__wbg_ptr);
      return A.__wrap(t);
    }
    like(t) {
      q(t, A);
      const n = i.wasmexpr_like(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    lt(t) {
      q(t, A);
      const n = i.wasmexpr_lt(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    lte(t) {
      q(t, A);
      const n = i.wasmexpr_lte(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    mul(t) {
      q(t, A);
      const n = i.wasmexpr_mul(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    neq(t) {
      q(t, A);
      const n = i.wasmexpr_neq(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    not() {
      const t = i.wasmexpr_not(this.__wbg_ptr);
      return A.__wrap(t);
    }
    not_in(t) {
      q(t, ne);
      const n = i.wasmexpr_not_in(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    or(t) {
      q(t, A);
      const n = i.wasmexpr_or(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    rlike(t) {
      q(t, A);
      const n = i.wasmexpr_rlike(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    sub(t) {
      q(t, A);
      const n = i.wasmexpr_sub(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    to_json() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmexpr_to_json(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmexpr_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    xor(t) {
      q(t, A);
      const n = i.wasmexpr_xor(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
  }
  Symbol.dispose && (A.prototype[Symbol.dispose] = A.prototype.free);
  class ne {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Cn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmexprarray_free(t, 0);
    }
    len() {
      return i.wasmexprarray_len(this.__wbg_ptr) >>> 0;
    }
    constructor() {
      const t = i.wasmassignmentarray_new();
      return this.__wbg_ptr = t >>> 0, Cn.register(this, this.__wbg_ptr, this), this;
    }
    push(t) {
      q(t, A), i.wasmexprarray_push(this.__wbg_ptr, t.__wbg_ptr);
    }
    push_col(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmexprarray_push_col(this.__wbg_ptr, n, r);
    }
    push_float(t) {
      i.wasmexprarray_push_float(this.__wbg_ptr, t);
    }
    push_int(t) {
      i.wasmexprarray_push_int(this.__wbg_ptr, t);
    }
    push_star() {
      i.wasmexprarray_push_star(this.__wbg_ptr);
    }
    push_str(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmexprarray_push_str(this.__wbg_ptr, n, r);
    }
  }
  Symbol.dispose && (ne.prototype[Symbol.dispose] = ne.prototype.free);
  class Ot {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, An.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasminsertbuilder_free(t, 0);
    }
    build() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasminsertbuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    columns(t) {
      const n = Jt(t, i.__wbindgen_export), r = x;
      i.wasminsertbuilder_columns(this.__wbg_ptr, n, r);
    }
    constructor(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasminsertbuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, An.register(this, this.__wbg_ptr, this), this;
    }
    query(t) {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        q(t, de), i.wasminsertbuilder_query(s, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(s + 0, true), r = b().getInt32(s + 4, true);
        if (r) throw O(n);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasminsertbuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    values(t) {
      q(t, ne), i.wasminsertbuilder_values(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (Ot.prototype[Symbol.dispose] = Ot.prototype.free);
  class Dt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Sn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmmergebuilder_free(t, 0);
    }
    build() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmmergebuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    constructor(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasmmergebuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, Sn.register(this, this.__wbg_ptr, this), this;
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmmergebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    using(t, n) {
      const r = v(t, i.__wbindgen_export, i.__wbindgen_export2), s = x;
      q(n, A), i.wasmmergebuilder_using(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    when_matched_delete() {
      i.wasmmergebuilder_when_matched_delete(this.__wbg_ptr);
    }
    when_matched_update(t) {
      q(t, lt), i.wasmmergebuilder_when_matched_update(this.__wbg_ptr, t.__wbg_ptr);
    }
    when_not_matched_insert(t, n) {
      const r = Jt(t, i.__wbindgen_export), s = x;
      q(n, ne), i.wasmmergebuilder_when_not_matched_insert(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
  }
  Symbol.dispose && (Dt.prototype[Symbol.dispose] = Dt.prototype.free);
  class de {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ln.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmselectbuilder_free(t, 0);
    }
    build() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmselectbuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    cross_join(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmselectbuilder_cross_join(this.__wbg_ptr, n, r);
    }
    ctas(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(t, i.__wbindgen_export, i.__wbindgen_export2), c = x;
        i.wasmselectbuilder_ctas(a, this.__wbg_ptr, o, c);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw O(r);
        return O(n);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    ctas_sql(t, n) {
      let r, s;
      try {
        const y = i.__wbindgen_add_to_stack_pointer(-16), w = v(t, i.__wbindgen_export, i.__wbindgen_export2), L = x, $ = v(n, i.__wbindgen_export, i.__wbindgen_export2), S = x;
        i.wasmselectbuilder_ctas_sql(y, this.__wbg_ptr, w, L, $, S);
        var a = b().getInt32(y + 0, true), o = b().getInt32(y + 4, true), c = b().getInt32(y + 8, true), u = b().getInt32(y + 12, true), l = a, m = o;
        if (u) throw l = 0, m = 0, O(c);
        return r = l, s = m, F(l, m);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
      }
    }
    distinct() {
      i.wasmselectbuilder_distinct(this.__wbg_ptr);
    }
    except_(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        q(t, de), i.wasmselectbuilder_except_(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw O(r);
        return xe.__wrap(n);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    for_update() {
      i.wasmselectbuilder_for_update(this.__wbg_ptr);
    }
    from(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmselectbuilder_from(this.__wbg_ptr, n, r);
    }
    from_expr(t) {
      q(t, A), i.wasmselectbuilder_from_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
    group_by_cols(t) {
      q(t, ne), i.wasmselectbuilder_group_by_cols(this.__wbg_ptr, t.__wbg_ptr);
    }
    having(t) {
      q(t, A), i.wasmselectbuilder_having(this.__wbg_ptr, t.__wbg_ptr);
    }
    hint(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmselectbuilder_hint(this.__wbg_ptr, n, r);
    }
    intersect(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        q(t, de), i.wasmselectbuilder_intersect(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw O(r);
        return xe.__wrap(n);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    join(t, n) {
      const r = v(t, i.__wbindgen_export, i.__wbindgen_export2), s = x;
      q(n, A), i.wasmselectbuilder_join(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    lateral_view(t, n, r) {
      q(t, A);
      const s = v(n, i.__wbindgen_export, i.__wbindgen_export2), a = x, o = Jt(r, i.__wbindgen_export), c = x;
      i.wasmselectbuilder_lateral_view(this.__wbg_ptr, t.__wbg_ptr, s, a, o, c);
    }
    left_join(t, n) {
      const r = v(t, i.__wbindgen_export, i.__wbindgen_export2), s = x;
      q(n, A), i.wasmselectbuilder_left_join(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    limit(t) {
      i.wasmselectbuilder_limit(this.__wbg_ptr, t);
    }
    constructor() {
      const t = i.wasmselectbuilder_new();
      return this.__wbg_ptr = t >>> 0, Ln.register(this, this.__wbg_ptr, this), this;
    }
    offset(t) {
      i.wasmselectbuilder_offset(this.__wbg_ptr, t);
    }
    order_by_exprs(t) {
      q(t, ne), i.wasmselectbuilder_order_by_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    qualify(t) {
      q(t, A), i.wasmselectbuilder_qualify(this.__wbg_ptr, t.__wbg_ptr);
    }
    right_join(t, n) {
      const r = v(t, i.__wbindgen_export, i.__wbindgen_export2), s = x;
      q(n, A), i.wasmselectbuilder_right_join(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    select_col(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmselectbuilder_select_col(this.__wbg_ptr, n, r);
    }
    select_expr(t) {
      q(t, A), i.wasmselectbuilder_select_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
    select_exprs(t) {
      q(t, ne), i.wasmselectbuilder_select_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    select_star() {
      i.wasmselectbuilder_select_star(this.__wbg_ptr);
    }
    sort_by_exprs(t) {
      q(t, ne), i.wasmselectbuilder_sort_by_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmselectbuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    union(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        q(t, de), i.wasmselectbuilder_union(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw O(r);
        return xe.__wrap(n);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    union_all(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        q(t, de), i.wasmselectbuilder_union_all(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw O(r);
        return xe.__wrap(n);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    where_expr(t) {
      q(t, A), i.wasmselectbuilder_where_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
    where_sql(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmselectbuilder_where_sql(this.__wbg_ptr, n, r);
    }
    window(t, n) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(t, i.__wbindgen_export, i.__wbindgen_export2), c = x;
        q(n, mt), i.wasmselectbuilder_window(a, this.__wbg_ptr, o, c, n.__wbg_ptr);
        var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
        if (s) throw O(r);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
  }
  Symbol.dispose && (de.prototype[Symbol.dispose] = de.prototype.free);
  class xe {
    static __wrap(t) {
      t = t >>> 0;
      const n = Object.create(xe.prototype);
      return n.__wbg_ptr = t, kn.register(n, n.__wbg_ptr, n), n;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, kn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmsetopbuilder_free(t, 0);
    }
    build() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmsetopbuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    limit(t) {
      i.wasmsetopbuilder_limit(this.__wbg_ptr, t);
    }
    offset(t) {
      i.wasmsetopbuilder_offset(this.__wbg_ptr, t);
    }
    order_by_exprs(t) {
      q(t, ne), i.wasmsetopbuilder_order_by_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmsetopbuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
  }
  Symbol.dispose && (xe.prototype[Symbol.dispose] = xe.prototype.free);
  class zt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Tn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmupdatebuilder_free(t, 0);
    }
    build() {
      try {
        const s = i.__wbindgen_add_to_stack_pointer(-16);
        i.wasmupdatebuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw O(n);
        return O(t);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    from(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x;
      i.wasmupdatebuilder_from(this.__wbg_ptr, n, r);
    }
    constructor(t) {
      const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasmupdatebuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, Tn.register(this, this.__wbg_ptr, this), this;
    }
    set(t, n) {
      const r = v(t, i.__wbindgen_export, i.__wbindgen_export2), s = x;
      q(n, A), i.wasmupdatebuilder_set(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    to_sql(t) {
      let n, r;
      try {
        const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x;
        i.wasmupdatebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), o = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), u = s, l = a;
        if (c) throw u = 0, l = 0, O(o);
        return n = u, r = l, F(u, l);
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
      }
    }
    where_expr(t) {
      q(t, A), i.wasmupdatebuilder_where_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (zt.prototype[Symbol.dispose] = zt.prototype.free);
  class mt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, jn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_wasmwindowdefbuilder_free(t, 0);
    }
    constructor() {
      const t = i.wasmwindowdefbuilder_new();
      return this.__wbg_ptr = t >>> 0, jn.register(this, this.__wbg_ptr, this), this;
    }
    order_by(t) {
      q(t, ne), i.wasmwindowdefbuilder_order_by(this.__wbg_ptr, t.__wbg_ptr);
    }
    partition_by(t) {
      q(t, ne), i.wasmwindowdefbuilder_partition_by(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (mt.prototype[Symbol.dispose] = mt.prototype.free);
  function Xs(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(n, i.__wbindgen_export, i.__wbindgen_export2), L = x;
      i.annotate_types(c, u, l, m, y, w, L);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function ea(e, t, n) {
    const r = v(e, i.__wbindgen_export, i.__wbindgen_export2), s = x, a = v(t, i.__wbindgen_export, i.__wbindgen_export2), o = x, c = v(n, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = i.annotate_types_value(r, s, a, o, c, u);
    return O(l);
  }
  function tr(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x;
      i.ast_add_where(c, u, l, m, y, n);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function nr(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_aggregate_functions(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function rr(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_column_names(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function sr(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_functions(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function ar(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_literals(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function or(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_subqueries(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function ir(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_table_names(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function cr(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_get_window_functions(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function _r(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_node_count(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function ur(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.ast_qualify_columns(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function lr(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.ast_qualify_tables(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function mr(e) {
    let t, n;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16), o = v(e, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.ast_remove_where(a, o, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(t, n, 1);
    }
  }
  function dr(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.ast_rename_columns(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function fr(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.ast_rename_tables(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function pr(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(n, i.__wbindgen_export, i.__wbindgen_export2), L = x;
      i.ast_rename_tables_with_options(c, u, l, m, y, w, L);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function gr(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x;
      i.ast_set_distinct(o, c, u, t);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function br(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x;
      i.ast_set_limit(o, c, u, t);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function ta(e, t, n, r, s, a) {
    let o, c;
    try {
      const m = i.__wbindgen_add_to_stack_pointer(-16), y = v(e, i.__wbindgen_export, i.__wbindgen_export2), w = x, L = v(t, i.__wbindgen_export, i.__wbindgen_export2), $ = x, S = v(n, i.__wbindgen_export, i.__wbindgen_export2), T = x;
      i.diff_sql(m, y, w, L, $, S, T, r, s, a);
      var u = b().getInt32(m + 0, true), l = b().getInt32(m + 4, true);
      return o = u, c = l, F(u, l);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(o, c, 1);
    }
  }
  function na(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.format_sql(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function ra(e, t) {
    const n = v(e, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = v(t, i.__wbindgen_export, i.__wbindgen_export2), a = x, o = i.format_sql_value(n, r, s, a);
    return O(o);
  }
  function sa(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(n, i.__wbindgen_export, i.__wbindgen_export2), L = x;
      i.format_sql_with_options(c, u, l, m, y, w, L);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function aa(e, t, n) {
    const r = v(e, i.__wbindgen_export, i.__wbindgen_export2), s = x, a = v(t, i.__wbindgen_export, i.__wbindgen_export2), o = x, c = i.format_sql_with_options_value(r, s, a, o, P(n));
    return O(c);
  }
  function oa(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.generate(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function ia(e, t) {
    const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.generate_value(P(e), n, r);
    return O(s);
  }
  function ca() {
    let e, t;
    try {
      const s = i.__wbindgen_add_to_stack_pointer(-16);
      i.get_dialects(s);
      var n = b().getInt32(s + 0, true), r = b().getInt32(s + 4, true);
      return e = n, t = r, F(n, r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(e, t, 1);
    }
  }
  function _a() {
    const e = i.get_dialects_value();
    return O(e);
  }
  function ua(e, t, n, r) {
    let s, a;
    try {
      const u = i.__wbindgen_add_to_stack_pointer(-16), l = v(e, i.__wbindgen_export, i.__wbindgen_export2), m = x, y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x, L = v(n, i.__wbindgen_export, i.__wbindgen_export2), $ = x;
      i.lineage_sql(u, l, m, y, w, L, $, r);
      var o = b().getInt32(u + 0, true), c = b().getInt32(u + 4, true);
      return s = o, a = c, F(o, c);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(s, a, 1);
    }
  }
  function la(e, t, n, r, s) {
    let a, o;
    try {
      const l = i.__wbindgen_add_to_stack_pointer(-16), m = v(e, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(t, i.__wbindgen_export, i.__wbindgen_export2), L = x, $ = v(n, i.__wbindgen_export, i.__wbindgen_export2), S = x, T = v(r, i.__wbindgen_export, i.__wbindgen_export2), C = x;
      i.lineage_sql_with_schema(l, m, y, w, L, $, S, T, C, s);
      var c = b().getInt32(l + 0, true), u = b().getInt32(l + 4, true);
      return a = c, o = u, F(c, u);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(a, o, 1);
    }
  }
  function ma(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.openlineage_column_lineage(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function da(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.openlineage_job_event(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function fa(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.openlineage_run_event(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function pa(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.parse(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function ga(e, t) {
    const n = v(e, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = v(t, i.__wbindgen_export, i.__wbindgen_export2), a = x, o = i.parse_value(n, r, s, a);
    return O(o);
  }
  function ba(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.plan(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function ya(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(n, i.__wbindgen_export, i.__wbindgen_export2), L = x;
      i.source_tables(c, u, l, m, y, w, L);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function wa(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.tokenize(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function ha(e, t) {
    const n = v(e, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = v(t, i.__wbindgen_export, i.__wbindgen_export2), a = x, o = i.tokenize_value(n, r, s, a);
    return O(o);
  }
  function xa(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(n, i.__wbindgen_export, i.__wbindgen_export2), L = x;
      i.transpile(c, u, l, m, y, w, L);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function va(e, t, n) {
    const r = v(e, i.__wbindgen_export, i.__wbindgen_export2), s = x, a = v(t, i.__wbindgen_export, i.__wbindgen_export2), o = x, c = v(n, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = i.transpile_value(r, s, a, o, c, u);
    return O(l);
  }
  function Ca(e, t) {
    let n, r;
    try {
      const o = i.__wbindgen_add_to_stack_pointer(-16), c = v(e, i.__wbindgen_export, i.__wbindgen_export2), u = x, l = v(t, i.__wbindgen_export, i.__wbindgen_export2), m = x;
      i.validate(o, c, u, l, m);
      var s = b().getInt32(o + 0, true), a = b().getInt32(o + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(n, r, 1);
    }
  }
  function Aa(e, t, n) {
    let r, s;
    try {
      const c = i.__wbindgen_add_to_stack_pointer(-16), u = v(e, i.__wbindgen_export, i.__wbindgen_export2), l = x, m = v(t, i.__wbindgen_export, i.__wbindgen_export2), y = x, w = v(n, i.__wbindgen_export, i.__wbindgen_export2), L = x;
      i.validate_with_options(c, u, l, m, y, w, L);
      var a = b().getInt32(c + 0, true), o = b().getInt32(c + 4, true);
      return r = a, s = o, F(a, o);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(r, s, 1);
    }
  }
  function yr(e, t, n, r) {
    let s, a;
    try {
      const u = i.__wbindgen_add_to_stack_pointer(-16), l = v(e, i.__wbindgen_export, i.__wbindgen_export2), m = x, y = v(t, i.__wbindgen_export, i.__wbindgen_export2), w = x, L = v(n, i.__wbindgen_export, i.__wbindgen_export2), $ = x, S = v(r, i.__wbindgen_export, i.__wbindgen_export2), T = x;
      i.validate_with_schema(u, l, m, y, w, L, $, S, T);
      var o = b().getInt32(u + 0, true), c = b().getInt32(u + 4, true);
      return s = o, a = c, F(o, c);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(s, a, 1);
    }
  }
  function Sa() {
    let e, t;
    try {
      const s = i.__wbindgen_add_to_stack_pointer(-16);
      i.version(s);
      var n = b().getInt32(s + 0, true), r = b().getInt32(s + 4, true);
      return e = n, t = r, F(n, r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export4(e, t, 1);
    }
  }
  function La(e, t) {
    q(e, A);
    const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasm_alias(e.__wbg_ptr, n, r);
    return A.__wrap(s);
  }
  function ka(e, t) {
    q(e, A), q(t, A);
    const n = i.wasm_and(e.__wbg_ptr, t.__wbg_ptr);
    return A.__wrap(n);
  }
  function Ta(e) {
    const t = i.wasm_boolean(e);
    return A.__wrap(t);
  }
  function ja(e) {
    q(e, A);
    const t = i.wasm_case_of(e.__wbg_ptr);
    return Me.__wrap(t);
  }
  function qa(e, t) {
    q(e, A);
    const n = v(t, i.__wbindgen_export, i.__wbindgen_export2), r = x, s = i.wasm_cast(e.__wbg_ptr, n, r);
    return A.__wrap(s);
  }
  function Ia(e) {
    const t = v(e, i.__wbindgen_export, i.__wbindgen_export2), n = x, r = i.wasm_col(t, n);
    return A.__wrap(r);
  }
  function Na(e) {
    q(e, A);
    const t = i.wasm_count_distinct(e.__wbg_ptr);
    return A.__wrap(t);
  }
  function $a(e, t) {
    const n = v(e, i.__wbindgen_export, i.__wbindgen_export2), r = x;
    q(t, A);
    const s = i.wasm_extract(n, r, t.__wbg_ptr);
    return A.__wrap(s);
  }
  function Ea(e, t) {
    const n = v(e, i.__wbindgen_export, i.__wbindgen_export2), r = x;
    q(t, ne);
    const s = i.wasm_func(n, r, t.__wbg_ptr);
    return A.__wrap(s);
  }
  function Ra(e) {
    const t = i.wasm_lit(P(e));
    return A.__wrap(t);
  }
  function Fa(e) {
    q(e, A);
    const t = i.wasm_not(e.__wbg_ptr);
    return A.__wrap(t);
  }
  function Ma() {
    const e = i.wasm_null();
    return A.__wrap(e);
  }
  function Oa(e, t) {
    q(e, A), q(t, A);
    const n = i.wasm_or(e.__wbg_ptr, t.__wbg_ptr);
    return A.__wrap(n);
  }
  function Da(e) {
    const t = v(e, i.__wbindgen_export, i.__wbindgen_export2), n = x, r = i.wasm_sql_expr(t, n);
    return A.__wrap(r);
  }
  function za() {
    const e = i.wasm_star();
    return A.__wrap(e);
  }
  function Ba(e, t) {
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16);
      q(e, de);
      const o = v(t, i.__wbindgen_export, i.__wbindgen_export2), c = x;
      i.wasm_subquery(a, e.__wbg_ptr, o, c);
      var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
      if (s) throw O(r);
      return A.__wrap(n);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function Pa(e) {
    const t = v(e, i.__wbindgen_export, i.__wbindgen_export2), n = x, r = i.wasm_table(t, n);
    return A.__wrap(r);
  }
  function Ua(e, t) {
    const n = Error(F(e, t));
    return P(n);
  }
  function Ka(e) {
    return Number(R(e));
  }
  function Va(e, t) {
    const n = String(R(t)), r = v(n, i.__wbindgen_export, i.__wbindgen_export2), s = x;
    b().setInt32(e + 4, s, true), b().setInt32(e + 0, r, true);
  }
  function Ja(e, t) {
    const n = R(t), r = typeof n == "bigint" ? n : void 0;
    b().setBigInt64(e + 8, Oe(r) ? BigInt(0) : r, true), b().setInt32(e + 0, !Oe(r), true);
  }
  function Ha(e) {
    const t = R(e), n = typeof t == "boolean" ? t : void 0;
    return Oe(n) ? 16777215 : n ? 1 : 0;
  }
  function Wa(e, t) {
    const n = Bt(R(t)), r = v(n, i.__wbindgen_export, i.__wbindgen_export2), s = x;
    b().setInt32(e + 4, s, true), b().setInt32(e + 0, r, true);
  }
  function Ya(e, t) {
    return R(e) in R(t);
  }
  function Qa(e) {
    return typeof R(e) == "bigint";
  }
  function Ga(e) {
    return typeof R(e) == "function";
  }
  function Za(e) {
    return R(e) === null;
  }
  function Xa(e) {
    const t = R(e);
    return typeof t == "object" && t !== null;
  }
  function eo(e) {
    return typeof R(e) == "string";
  }
  function to(e) {
    return R(e) === void 0;
  }
  function no(e, t) {
    return R(e) === R(t);
  }
  function ro(e, t) {
    return R(e) == R(t);
  }
  function so(e, t) {
    const n = R(t), r = typeof n == "number" ? n : void 0;
    b().setFloat64(e + 8, Oe(r) ? 0 : r, true), b().setInt32(e + 0, !Oe(r), true);
  }
  function ao(e, t) {
    const n = R(t), r = typeof n == "string" ? n : void 0;
    var s = Oe(r) ? 0 : v(r, i.__wbindgen_export, i.__wbindgen_export2), a = x;
    b().setInt32(e + 4, a, true), b().setInt32(e + 0, s, true);
  }
  function oo(e, t) {
    throw new Error(F(e, t));
  }
  function io() {
    return yt(function(e, t) {
      const n = R(e).call(R(t));
      return P(n);
    }, arguments);
  }
  function co(e, t) {
    const n = R(e).codePointAt(t >>> 0);
    return P(n);
  }
  function _o(e) {
    return R(e).done;
  }
  function uo(e) {
    const t = Object.entries(R(e));
    return P(t);
  }
  function lo(e, t) {
    let n, r;
    try {
      n = e, r = t, console.error(F(e, t));
    } finally {
      i.__wbindgen_export4(n, r, 1);
    }
  }
  function mo() {
    return yt(function(e) {
      const t = String.fromCodePoint(e >>> 0);
      return P(t);
    }, arguments);
  }
  function fo(e, t) {
    const n = R(e)[t >>> 0];
    return P(n);
  }
  function po() {
    return yt(function(e, t) {
      const n = Reflect.get(R(e), R(t));
      return P(n);
    }, arguments);
  }
  function go(e, t) {
    const n = R(e)[R(t)];
    return P(n);
  }
  function bo(e) {
    let t;
    try {
      t = R(e) instanceof ArrayBuffer;
    } catch {
      t = false;
    }
    return t;
  }
  function yo(e) {
    let t;
    try {
      t = R(e) instanceof Map;
    } catch {
      t = false;
    }
    return t;
  }
  function wo(e) {
    let t;
    try {
      t = R(e) instanceof Uint8Array;
    } catch {
      t = false;
    }
    return t;
  }
  function ho(e) {
    return Array.isArray(R(e));
  }
  function xo(e) {
    return Number.isSafeInteger(R(e));
  }
  function vo() {
    return P(Symbol.iterator);
  }
  function Co(e) {
    return R(e).length;
  }
  function Ao(e) {
    return R(e).length;
  }
  function So(e) {
    return R(e).length;
  }
  function Lo() {
    const e = new Object();
    return P(e);
  }
  function ko() {
    const e = new Array();
    return P(e);
  }
  function To() {
    const e = new Error();
    return P(e);
  }
  function jo() {
    return P(/* @__PURE__ */ new Map());
  }
  function qo(e) {
    const t = new Uint8Array(R(e));
    return P(t);
  }
  function Io() {
    return yt(function(e) {
      const t = R(e).next();
      return P(t);
    }, arguments);
  }
  function No(e) {
    const t = R(e).next;
    return P(t);
  }
  function $o(e, t, n) {
    Uint8Array.prototype.set.call(Jo(e, t), R(n));
  }
  function Eo(e, t, n) {
    const r = R(e).set(R(t), R(n));
    return P(r);
  }
  function Ro(e, t, n) {
    R(e)[O(t)] = O(n);
  }
  function Fo(e, t, n) {
    R(e)[t >>> 0] = O(n);
  }
  function Mo(e, t) {
    const n = R(t).stack, r = v(n, i.__wbindgen_export, i.__wbindgen_export2), s = x;
    b().setInt32(e + 4, s, true), b().setInt32(e + 0, r, true);
  }
  function Oo(e) {
    const t = R(e).value;
    return P(t);
  }
  function Do(e) {
    return P(e);
  }
  function zo(e) {
    return P(e);
  }
  function Bo(e, t) {
    const n = F(e, t);
    return P(n);
  }
  function Po(e) {
    const t = BigInt.asUintN(64, e);
    return P(t);
  }
  function Uo(e) {
    const t = R(e);
    return P(t);
  }
  function Ko(e) {
    O(e);
  }
  const hn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmassignmentarray_free(e >>> 0, 1)), St = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmcasebuilder_free(e >>> 0, 1)), xn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmdeletebuilder_free(e >>> 0, 1)), vn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmexpr_free(e >>> 0, 1)), Cn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmexprarray_free(e >>> 0, 1)), An = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasminsertbuilder_free(e >>> 0, 1)), Sn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmmergebuilder_free(e >>> 0, 1)), Ln = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmselectbuilder_free(e >>> 0, 1)), kn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmsetopbuilder_free(e >>> 0, 1)), Tn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmupdatebuilder_free(e >>> 0, 1)), jn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => i.__wbg_wasmwindowdefbuilder_free(e >>> 0, 1));
  function P(e) {
    Je === he.length && he.push(he.length + 1);
    const t = Je;
    return Je = he[t], he[t] = e, t;
  }
  function q(e, t) {
    if (!(e instanceof t)) throw new Error(`expected instance of ${t.name}`);
  }
  function Bt(e) {
    const t = typeof e;
    if (t == "number" || t == "boolean" || e == null) return `${e}`;
    if (t == "string") return `"${e}"`;
    if (t == "symbol") {
      const s = e.description;
      return s == null ? "Symbol" : `Symbol(${s})`;
    }
    if (t == "function") {
      const s = e.name;
      return typeof s == "string" && s.length > 0 ? `Function(${s})` : "Function";
    }
    if (Array.isArray(e)) {
      const s = e.length;
      let a = "[";
      s > 0 && (a += Bt(e[0]));
      for (let o = 1; o < s; o++) a += ", " + Bt(e[o]);
      return a += "]", a;
    }
    const n = /\[object ([^\]]+)\]/.exec(toString.call(e));
    let r;
    if (n && n.length > 1) r = n[1];
    else return toString.call(e);
    if (r == "Object") try {
      return "Object(" + JSON.stringify(e) + ")";
    } catch {
      return "Object";
    }
    return e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : r;
  }
  function Vo(e) {
    e < 132 || (he[e] = Je, Je = e);
  }
  function Jo(e, t) {
    return e = e >>> 0, Ve().subarray(e / 1, e / 1 + t);
  }
  let Ee = null;
  function b() {
    return (Ee === null || Ee.buffer.detached === true || Ee.buffer.detached === void 0 && Ee.buffer !== i.memory.buffer) && (Ee = new DataView(i.memory.buffer)), Ee;
  }
  function F(e, t) {
    return e = e >>> 0, Wo(e, t);
  }
  let ot = null;
  function Ve() {
    return (ot === null || ot.byteLength === 0) && (ot = new Uint8Array(i.memory.buffer)), ot;
  }
  function R(e) {
    return he[e];
  }
  function yt(e, t) {
    try {
      return e.apply(this, t);
    } catch (n) {
      i.__wbindgen_export3(P(n));
    }
  }
  let he = new Array(128).fill(void 0);
  he.push(void 0, null, true, false);
  let Je = he.length;
  function Oe(e) {
    return e == null;
  }
  function Jt(e, t) {
    const n = t(e.length * 4, 4) >>> 0, r = b();
    for (let s = 0; s < e.length; s++) r.setUint32(n + 4 * s, P(e[s]), true);
    return x = e.length, n;
  }
  function v(e, t, n) {
    if (n === void 0) {
      const c = He.encode(e), u = t(c.length, 1) >>> 0;
      return Ve().subarray(u, u + c.length).set(c), x = c.length, u;
    }
    let r = e.length, s = t(r, 1) >>> 0;
    const a = Ve();
    let o = 0;
    for (; o < r; o++) {
      const c = e.charCodeAt(o);
      if (c > 127) break;
      a[s + o] = c;
    }
    if (o !== r) {
      o !== 0 && (e = e.slice(o)), s = n(s, r, r = o + e.length * 3, 1) >>> 0;
      const c = Ve().subarray(s + o, s + r), u = He.encodeInto(e, c);
      o += u.written, s = n(s, r, o, 1) >>> 0;
    }
    return x = o, s;
  }
  function O(e) {
    const t = R(e);
    return Vo(e), t;
  }
  let it = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true
  });
  it.decode();
  const Ho = 2146435072;
  let Lt = 0;
  function Wo(e, t) {
    return Lt += t, Lt >= Ho && (it = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true
    }), it.decode(), Lt = t), it.decode(Ve().subarray(e, e + t));
  }
  const He = new TextEncoder();
  "encodeInto" in He || (He.encodeInto = function(e, t) {
    const n = He.encode(e);
    return t.set(n), {
      read: e.length,
      written: n.length
    };
  });
  let x = 0, i;
  function Yo(e) {
    i = e;
  }
  URL = globalThis.URL;
  const f = await Zs({
    "./polyglot_sql_wasm_bg.js": {
      __wbindgen_object_drop_ref: Ko,
      __wbindgen_object_clone_ref: Uo,
      __wbg_new_8a6f238a6ece86ea: To,
      __wbg_stack_0ed75d68575b0f3c: Mo,
      __wbg_error_7534b8e9a36f1ab4: lo,
      __wbg_get_with_ref_key_1dc361bd10053bfe: go,
      __wbg_set_3f1d0b984ed272ed: Ro,
      __wbg_String_8f0eb39a4a4c2f66: Va,
      __wbg_new_dd2b680c8bf6ae29: qo,
      __wbg_length_32ed9a279acd054c: Co,
      __wbg_prototypesetcall_bdcdcc5842e4d77d: $o,
      __wbg_done_57b39ecd9addfe81: _o,
      __wbg_value_0546255b415e96c1: Oo,
      __wbg_instanceof_Map_53af74335dec57f4: yo,
      __wbg_instanceof_Uint8Array_9b9075935c74707c: wo,
      __wbg_instanceof_ArrayBuffer_c367199e2fa2aa04: bo,
      __wbg_new_dca287b076112a51: jo,
      __wbg_set_1eb0999cf5d27fc8: Eo,
      __wbg_get_9b94d73e6221f75c: fo,
      __wbg_new_3eb36ae241fe6f44: ko,
      __wbg_set_f43e577aea94465b: Fo,
      __wbg_length_35a7bace40f36eac: Ao,
      __wbg_isArray_d314bb98fcf08331: ho,
      __wbg_isSafeInteger_bfbc7332a9768d2a: xo,
      __wbg_new_361308b2356cecd0: Lo,
      __wbg_entries_58c7934c745daac7: uo,
      __wbg_iterator_6ff6560ca1568e55: vo,
      __wbg_get_b3ed3ad4be2bc8ac: po,
      __wbg_call_389efe28435a9388: io,
      __wbg_next_418f80d8f5303233: No,
      __wbg_next_3482f54c49e8af19: Io,
      __wbg_codePointAt_bf59dbf74d8db275: co,
      __wbg_fromCodePoint_22365db7b7d6ac39: mo,
      __wbg_length_68dc7c5cf1b6d349: So,
      __wbg___wbindgen_in_47fa6863be6f2f25: Ya,
      __wbg___wbindgen_throw_be289d5034ed271b: oo,
      __wbg___wbindgen_is_null_ac34f5003991759a: Za,
      __wbg___wbindgen_jsval_eq_11888390b0186270: no,
      __wbg_Number_04624de7d0e8332d: Ka,
      __wbg_Error_8c4e43fe74559d73: Ua,
      __wbg___wbindgen_is_bigint_31b12575b56f32fc: Qa,
      __wbg___wbindgen_is_object_5ae8e5880f2c1fbd: Xa,
      __wbg___wbindgen_is_string_cd444516edc5b180: eo,
      __wbg___wbindgen_number_get_8ff4255516ccad3e: so,
      __wbg___wbindgen_string_get_72fb696202c56729: ao,
      __wbg___wbindgen_boolean_get_bbbb1c18aa2f5e25: Ha,
      __wbg___wbindgen_is_function_0095a73b8b156f76: Ga,
      __wbg___wbindgen_is_undefined_9e4d92534c42d778: to,
      __wbg___wbindgen_jsval_loose_eq_9dd77d8cd6671811: ro,
      __wbg___wbindgen_bigint_get_as_i64_8fcf4ce7f1ca72a2: Ja,
      __wbg___wbindgen_debug_string_0bc8482c6e3508ae: Wa,
      __wbindgen_cast_0000000000000001: Do,
      __wbindgen_cast_0000000000000002: zo,
      __wbindgen_cast_0000000000000003: Bo,
      __wbindgen_cast_0000000000000004: Po
    }
  }, Gs), Qo = f.memory, Go = f.__wbg_wasmassignmentarray_free, Zo = f.__wbg_wasmcasebuilder_free, Xo = f.__wbg_wasmdeletebuilder_free, ei = f.__wbg_wasmexpr_free, ti = f.__wbg_wasmexprarray_free, ni = f.__wbg_wasminsertbuilder_free, ri = f.__wbg_wasmmergebuilder_free, si = f.__wbg_wasmselectbuilder_free, ai = f.__wbg_wasmsetopbuilder_free, oi = f.__wbg_wasmupdatebuilder_free, ii = f.__wbg_wasmwindowdefbuilder_free, ci = f.annotate_types, _i = f.annotate_types_value, ui = f.ast_add_where, li = f.ast_get_aggregate_functions, mi = f.ast_get_column_names, di = f.ast_get_functions, fi = f.ast_get_literals, pi = f.ast_get_subqueries, gi = f.ast_get_table_names, bi = f.ast_get_window_functions, yi = f.ast_node_count, wi = f.ast_qualify_columns, hi = f.ast_qualify_tables, xi = f.ast_remove_where, vi = f.ast_rename_columns, Ci = f.ast_rename_tables, Ai = f.ast_rename_tables_with_options, Si = f.ast_set_distinct, Li = f.ast_set_limit, ki = f.diff_sql, Ti = f.format_sql, ji = f.format_sql_value, qi = f.format_sql_with_options, Ii = f.format_sql_with_options_value, Ni = f.generate, $i = f.generate_value, Ei = f.get_dialects, Ri = f.get_dialects_value, Fi = f.lineage_sql, Mi = f.lineage_sql_with_schema, Oi = f.openlineage_column_lineage, Di = f.openlineage_job_event, zi = f.openlineage_run_event, Bi = f.parse, Pi = f.parse_value, Ui = f.plan, Ki = f.source_tables, Vi = f.tokenize, Ji = f.tokenize_value, Hi = f.transpile, Wi = f.transpile_value, Yi = f.validate, Qi = f.validate_with_options, Gi = f.validate_with_schema, Zi = f.version, Xi = f.wasm_alias, ec = f.wasm_and, tc = f.wasm_boolean, nc = f.wasm_case_of, rc = f.wasm_cast, sc = f.wasm_col, ac = f.wasm_count_distinct, oc = f.wasm_extract, ic = f.wasm_func, cc = f.wasm_lit, _c = f.wasm_not, uc = f.wasm_null, lc = f.wasm_or, mc = f.wasm_sql_expr, dc = f.wasm_star, fc = f.wasm_subquery, pc = f.wasm_table, gc = f.wasmassignmentarray_len, bc = f.wasmassignmentarray_new, yc = f.wasmassignmentarray_push, wc = f.wasmcasebuilder_build_expr, hc = f.wasmcasebuilder_else_, xc = f.wasmcasebuilder_new, vc = f.wasmcasebuilder_to_sql, Cc = f.wasmcasebuilder_when, Ac = f.wasmdeletebuilder_build, Sc = f.wasmdeletebuilder_new, Lc = f.wasmdeletebuilder_to_sql, kc = f.wasmdeletebuilder_where_expr, Tc = f.wasmexpr_add, jc = f.wasmexpr_alias, qc = f.wasmexpr_and, Ic = f.wasmexpr_asc, Nc = f.wasmexpr_between, $c = f.wasmexpr_cast, Ec = f.wasmexpr_desc, Rc = f.wasmexpr_div, Fc = f.wasmexpr_eq, Mc = f.wasmexpr_gt, Oc = f.wasmexpr_gte, Dc = f.wasmexpr_ilike, zc = f.wasmexpr_in_list, Bc = f.wasmexpr_is_not_null, Pc = f.wasmexpr_is_null, Uc = f.wasmexpr_like, Kc = f.wasmexpr_lt, Vc = f.wasmexpr_lte, Jc = f.wasmexpr_mul, Hc = f.wasmexpr_neq, Wc = f.wasmexpr_not, Yc = f.wasmexpr_not_in, Qc = f.wasmexpr_or, Gc = f.wasmexpr_rlike, Zc = f.wasmexpr_sub, Xc = f.wasmexpr_to_json, e_ = f.wasmexpr_to_sql, t_ = f.wasmexpr_xor, n_ = f.wasmexprarray_len, r_ = f.wasmexprarray_push, s_ = f.wasmexprarray_push_col, a_ = f.wasmexprarray_push_float, o_ = f.wasmexprarray_push_int, i_ = f.wasmexprarray_push_star, c_ = f.wasmexprarray_push_str, __ = f.wasminsertbuilder_build, u_ = f.wasminsertbuilder_columns, l_ = f.wasminsertbuilder_new, m_ = f.wasminsertbuilder_query, d_ = f.wasminsertbuilder_to_sql, f_ = f.wasminsertbuilder_values, p_ = f.wasmmergebuilder_build, g_ = f.wasmmergebuilder_new, b_ = f.wasmmergebuilder_to_sql, y_ = f.wasmmergebuilder_using, w_ = f.wasmmergebuilder_when_matched_delete, h_ = f.wasmmergebuilder_when_matched_update, x_ = f.wasmmergebuilder_when_not_matched_insert, v_ = f.wasmselectbuilder_build, C_ = f.wasmselectbuilder_cross_join, A_ = f.wasmselectbuilder_ctas, S_ = f.wasmselectbuilder_ctas_sql, L_ = f.wasmselectbuilder_distinct, k_ = f.wasmselectbuilder_except_, T_ = f.wasmselectbuilder_for_update, j_ = f.wasmselectbuilder_from, q_ = f.wasmselectbuilder_from_expr, I_ = f.wasmselectbuilder_group_by_cols, N_ = f.wasmselectbuilder_having, $_ = f.wasmselectbuilder_hint, E_ = f.wasmselectbuilder_intersect, R_ = f.wasmselectbuilder_join, F_ = f.wasmselectbuilder_lateral_view, M_ = f.wasmselectbuilder_left_join, O_ = f.wasmselectbuilder_limit, D_ = f.wasmselectbuilder_new, z_ = f.wasmselectbuilder_offset, B_ = f.wasmselectbuilder_order_by_exprs, P_ = f.wasmselectbuilder_qualify, U_ = f.wasmselectbuilder_right_join, K_ = f.wasmselectbuilder_select_col, V_ = f.wasmselectbuilder_select_expr, J_ = f.wasmselectbuilder_select_exprs, H_ = f.wasmselectbuilder_select_star, W_ = f.wasmselectbuilder_sort_by_exprs, Y_ = f.wasmselectbuilder_to_sql, Q_ = f.wasmselectbuilder_union, G_ = f.wasmselectbuilder_union_all, Z_ = f.wasmselectbuilder_where_expr, X_ = f.wasmselectbuilder_where_sql, eu = f.wasmselectbuilder_window, tu = f.wasmsetopbuilder_build, nu = f.wasmsetopbuilder_limit, ru = f.wasmsetopbuilder_offset, su = f.wasmsetopbuilder_order_by_exprs, au = f.wasmsetopbuilder_to_sql, ou = f.wasmupdatebuilder_build, iu = f.wasmupdatebuilder_from, cu = f.wasmupdatebuilder_new, _u = f.wasmupdatebuilder_set, uu = f.wasmupdatebuilder_to_sql, lu = f.wasmupdatebuilder_where_expr, mu = f.wasmwindowdefbuilder_new, du = f.wasmwindowdefbuilder_order_by, fu = f.wasmwindowdefbuilder_partition_by, pu = f.wasmexprarray_new, gu = f.__wbindgen_export, bu = f.__wbindgen_export2, yu = f.__wbindgen_export3, wu = f.__wbindgen_export4, hu = f.__wbindgen_add_to_stack_pointer, xu = Object.freeze(Object.defineProperty({
    __proto__: null,
    __wbg_wasmassignmentarray_free: Go,
    __wbg_wasmcasebuilder_free: Zo,
    __wbg_wasmdeletebuilder_free: Xo,
    __wbg_wasmexpr_free: ei,
    __wbg_wasmexprarray_free: ti,
    __wbg_wasminsertbuilder_free: ni,
    __wbg_wasmmergebuilder_free: ri,
    __wbg_wasmselectbuilder_free: si,
    __wbg_wasmsetopbuilder_free: ai,
    __wbg_wasmupdatebuilder_free: oi,
    __wbg_wasmwindowdefbuilder_free: ii,
    __wbindgen_add_to_stack_pointer: hu,
    __wbindgen_export: gu,
    __wbindgen_export2: bu,
    __wbindgen_export3: yu,
    __wbindgen_export4: wu,
    annotate_types: ci,
    annotate_types_value: _i,
    ast_add_where: ui,
    ast_get_aggregate_functions: li,
    ast_get_column_names: mi,
    ast_get_functions: di,
    ast_get_literals: fi,
    ast_get_subqueries: pi,
    ast_get_table_names: gi,
    ast_get_window_functions: bi,
    ast_node_count: yi,
    ast_qualify_columns: wi,
    ast_qualify_tables: hi,
    ast_remove_where: xi,
    ast_rename_columns: vi,
    ast_rename_tables: Ci,
    ast_rename_tables_with_options: Ai,
    ast_set_distinct: Si,
    ast_set_limit: Li,
    diff_sql: ki,
    format_sql: Ti,
    format_sql_value: ji,
    format_sql_with_options: qi,
    format_sql_with_options_value: Ii,
    generate: Ni,
    generate_value: $i,
    get_dialects: Ei,
    get_dialects_value: Ri,
    lineage_sql: Fi,
    lineage_sql_with_schema: Mi,
    memory: Qo,
    openlineage_column_lineage: Oi,
    openlineage_job_event: Di,
    openlineage_run_event: zi,
    parse: Bi,
    parse_value: Pi,
    plan: Ui,
    source_tables: Ki,
    tokenize: Vi,
    tokenize_value: Ji,
    transpile: Hi,
    transpile_value: Wi,
    validate: Yi,
    validate_with_options: Qi,
    validate_with_schema: Gi,
    version: Zi,
    wasm_alias: Xi,
    wasm_and: ec,
    wasm_boolean: tc,
    wasm_case_of: nc,
    wasm_cast: rc,
    wasm_col: sc,
    wasm_count_distinct: ac,
    wasm_extract: oc,
    wasm_func: ic,
    wasm_lit: cc,
    wasm_not: _c,
    wasm_null: uc,
    wasm_or: lc,
    wasm_sql_expr: mc,
    wasm_star: dc,
    wasm_subquery: fc,
    wasm_table: pc,
    wasmassignmentarray_len: gc,
    wasmassignmentarray_new: bc,
    wasmassignmentarray_push: yc,
    wasmcasebuilder_build_expr: wc,
    wasmcasebuilder_else_: hc,
    wasmcasebuilder_new: xc,
    wasmcasebuilder_to_sql: vc,
    wasmcasebuilder_when: Cc,
    wasmdeletebuilder_build: Ac,
    wasmdeletebuilder_new: Sc,
    wasmdeletebuilder_to_sql: Lc,
    wasmdeletebuilder_where_expr: kc,
    wasmexpr_add: Tc,
    wasmexpr_alias: jc,
    wasmexpr_and: qc,
    wasmexpr_asc: Ic,
    wasmexpr_between: Nc,
    wasmexpr_cast: $c,
    wasmexpr_desc: Ec,
    wasmexpr_div: Rc,
    wasmexpr_eq: Fc,
    wasmexpr_gt: Mc,
    wasmexpr_gte: Oc,
    wasmexpr_ilike: Dc,
    wasmexpr_in_list: zc,
    wasmexpr_is_not_null: Bc,
    wasmexpr_is_null: Pc,
    wasmexpr_like: Uc,
    wasmexpr_lt: Kc,
    wasmexpr_lte: Vc,
    wasmexpr_mul: Jc,
    wasmexpr_neq: Hc,
    wasmexpr_not: Wc,
    wasmexpr_not_in: Yc,
    wasmexpr_or: Qc,
    wasmexpr_rlike: Gc,
    wasmexpr_sub: Zc,
    wasmexpr_to_json: Xc,
    wasmexpr_to_sql: e_,
    wasmexpr_xor: t_,
    wasmexprarray_len: n_,
    wasmexprarray_new: pu,
    wasmexprarray_push: r_,
    wasmexprarray_push_col: s_,
    wasmexprarray_push_float: a_,
    wasmexprarray_push_int: o_,
    wasmexprarray_push_star: i_,
    wasmexprarray_push_str: c_,
    wasminsertbuilder_build: __,
    wasminsertbuilder_columns: u_,
    wasminsertbuilder_new: l_,
    wasminsertbuilder_query: m_,
    wasminsertbuilder_to_sql: d_,
    wasminsertbuilder_values: f_,
    wasmmergebuilder_build: p_,
    wasmmergebuilder_new: g_,
    wasmmergebuilder_to_sql: b_,
    wasmmergebuilder_using: y_,
    wasmmergebuilder_when_matched_delete: w_,
    wasmmergebuilder_when_matched_update: h_,
    wasmmergebuilder_when_not_matched_insert: x_,
    wasmselectbuilder_build: v_,
    wasmselectbuilder_cross_join: C_,
    wasmselectbuilder_ctas: A_,
    wasmselectbuilder_ctas_sql: S_,
    wasmselectbuilder_distinct: L_,
    wasmselectbuilder_except_: k_,
    wasmselectbuilder_for_update: T_,
    wasmselectbuilder_from: j_,
    wasmselectbuilder_from_expr: q_,
    wasmselectbuilder_group_by_cols: I_,
    wasmselectbuilder_having: N_,
    wasmselectbuilder_hint: $_,
    wasmselectbuilder_intersect: E_,
    wasmselectbuilder_join: R_,
    wasmselectbuilder_lateral_view: F_,
    wasmselectbuilder_left_join: M_,
    wasmselectbuilder_limit: O_,
    wasmselectbuilder_new: D_,
    wasmselectbuilder_offset: z_,
    wasmselectbuilder_order_by_exprs: B_,
    wasmselectbuilder_qualify: P_,
    wasmselectbuilder_right_join: U_,
    wasmselectbuilder_select_col: K_,
    wasmselectbuilder_select_expr: V_,
    wasmselectbuilder_select_exprs: J_,
    wasmselectbuilder_select_star: H_,
    wasmselectbuilder_sort_by_exprs: W_,
    wasmselectbuilder_to_sql: Y_,
    wasmselectbuilder_union: Q_,
    wasmselectbuilder_union_all: G_,
    wasmselectbuilder_where_expr: Z_,
    wasmselectbuilder_where_sql: X_,
    wasmselectbuilder_window: eu,
    wasmsetopbuilder_build: tu,
    wasmsetopbuilder_limit: nu,
    wasmsetopbuilder_offset: ru,
    wasmsetopbuilder_order_by_exprs: su,
    wasmsetopbuilder_to_sql: au,
    wasmupdatebuilder_build: ou,
    wasmupdatebuilder_from: iu,
    wasmupdatebuilder_new: cu,
    wasmupdatebuilder_set: _u,
    wasmupdatebuilder_to_sql: uu,
    wasmupdatebuilder_where_expr: lu,
    wasmwindowdefbuilder_new: mu,
    wasmwindowdefbuilder_order_by: du,
    wasmwindowdefbuilder_partition_by: fu
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  Yo(xu);
  const vu = Object.freeze(Object.defineProperty({
    __proto__: null,
    WasmAssignmentArray: lt,
    WasmCaseBuilder: Me,
    WasmDeleteBuilder: Mt,
    WasmExpr: A,
    WasmExprArray: ne,
    WasmInsertBuilder: Ot,
    WasmMergeBuilder: Dt,
    WasmSelectBuilder: de,
    WasmSetOpBuilder: xe,
    WasmUpdateBuilder: zt,
    WasmWindowDefBuilder: mt,
    annotate_types: Xs,
    annotate_types_value: ea,
    ast_add_where: tr,
    ast_get_aggregate_functions: nr,
    ast_get_column_names: rr,
    ast_get_functions: sr,
    ast_get_literals: ar,
    ast_get_subqueries: or,
    ast_get_table_names: ir,
    ast_get_window_functions: cr,
    ast_node_count: _r,
    ast_qualify_columns: ur,
    ast_qualify_tables: lr,
    ast_remove_where: mr,
    ast_rename_columns: dr,
    ast_rename_tables: fr,
    ast_rename_tables_with_options: pr,
    ast_set_distinct: gr,
    ast_set_limit: br,
    diff_sql: ta,
    format_sql: na,
    format_sql_value: ra,
    format_sql_with_options: sa,
    format_sql_with_options_value: aa,
    generate: oa,
    generate_value: ia,
    get_dialects: ca,
    get_dialects_value: _a,
    lineage_sql: ua,
    lineage_sql_with_schema: la,
    openlineage_column_lineage: ma,
    openlineage_job_event: da,
    openlineage_run_event: fa,
    parse: pa,
    parse_value: ga,
    plan: ba,
    source_tables: ya,
    tokenize: wa,
    tokenize_value: ha,
    transpile: xa,
    transpile_value: va,
    validate: Ca,
    validate_with_options: Aa,
    validate_with_schema: yr,
    version: Sa,
    wasm_alias: La,
    wasm_and: ka,
    wasm_boolean: Ta,
    wasm_case_of: ja,
    wasm_cast: qa,
    wasm_col: Ia,
    wasm_count_distinct: Na,
    wasm_extract: $a,
    wasm_func: Ea,
    wasm_lit: Ra,
    wasm_not: Fa,
    wasm_null: Ma,
    wasm_or: Oa,
    wasm_sql_expr: Da,
    wasm_star: za,
    wasm_subquery: Ba,
    wasm_table: Pa
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  function Z(e) {
    return Object.keys(e)[0];
  }
  function we(e) {
    const t = Object.keys(e)[0];
    return e[t];
  }
  function ve(e) {
    if (typeof e != "object" || e === null || Array.isArray(e)) return false;
    const t = Object.keys(e);
    if (t.length !== 1) return false;
    const n = e[t[0]];
    return n === null || typeof n == "object" && !Array.isArray(n);
  }
  function ge(e, t) {
    return {
      [e]: t
    };
  }
  function Cu(e) {
    const t = we(e);
    if (t && typeof t == "object" && "inferred_type" in t) {
      const n = t.inferred_type;
      if (n != null) return n;
    }
  }
  function j(e) {
    return (t) => e in t;
  }
  const Au = j("select"), Su = j("insert"), Lu = j("update"), ku = j("delete"), Tu = j("union"), ju = j("intersect"), qu = j("except"), Iu = j("subquery"), Nu = j("identifier"), $u = j("column"), Eu = j("table"), Ru = j("star"), Fu = j("literal"), Mu = j("boolean"), Ou = j("null"), Du = j("and"), zu = j("or"), Bu = j("not"), Pu = j("eq"), Uu = j("neq"), Ku = j("lt"), Vu = j("lte"), Ju = j("gt"), Hu = j("gte"), Wu = j("like"), Yu = j("i_like"), Qu = j("add"), Gu = j("sub"), Zu = j("mul"), Xu = j("div"), el = j("mod"), tl = j("concat"), nl = j("in"), rl = j("between"), sl = j("is_null"), al = j("exists"), ol = j("function"), il = j("aggregate_function"), cl = j("window_function"), _l = j("count"), ul = j("sum"), ll = j("avg"), ml = j("min"), dl = j("max"), fl = j("coalesce"), pl = j("null_if"), gl = j("cast"), bl = j("try_cast"), yl = j("safe_cast"), wl = j("case"), hl = j("from"), xl = j("join"), vl = j("where"), Cl = j("group_by"), Al = j("having"), Sl = j("order_by"), Ll = j("limit"), kl = j("offset"), Tl = j("with"), jl = j("cte"), ql = j("alias"), Il = j("paren"), Nl = j("ordered"), $l = j("create_table"), El = j("drop_table"), Rl = j("alter_table"), Fl = j("create_index"), Ml = j("drop_index"), Ol = j("create_view"), Dl = j("drop_view");
  function zl(e) {
    const t = Z(e);
    return t === "select" || t === "insert" || t === "update" || t === "delete";
  }
  function Bl(e) {
    const t = Z(e);
    return t === "union" || t === "intersect" || t === "except";
  }
  function Pl(e) {
    const t = Z(e);
    return t === "eq" || t === "neq" || t === "lt" || t === "lte" || t === "gt" || t === "gte" || t === "like" || t === "i_like";
  }
  function Ul(e) {
    const t = Z(e);
    return t === "add" || t === "sub" || t === "mul" || t === "div" || t === "mod";
  }
  function Kl(e) {
    const t = Z(e);
    return t === "and" || t === "or" || t === "not";
  }
  function Vl(e) {
    const t = Z(e);
    return t === "create_table" || t === "drop_table" || t === "alter_table" || t === "create_index" || t === "drop_index" || t === "create_view" || t === "drop_view" || t === "create_schema" || t === "drop_schema" || t === "create_database" || t === "drop_database" || t === "create_function" || t === "drop_function" || t === "create_procedure" || t === "drop_procedure" || t === "create_sequence" || t === "drop_sequence" || t === "alter_sequence" || t === "create_trigger" || t === "drop_trigger" || t === "create_type" || t === "drop_type";
  }
  function be(e) {
    return JSON.stringify(e);
  }
  function qe(e) {
    const t = JSON.parse(e);
    return t.success ? JSON.parse(t.ast) : null;
  }
  function wr(e, t, n) {
    if (e == null) return e;
    if (Array.isArray(e)) return e.length > 0 && ve(e[0]) ? e.map((r, s) => ct(r, t, n, null, s)) : e.length > 0 && Array.isArray(e[0]) ? e.map((r) => Array.isArray(r) ? r.map((s, a) => ve(s) ? ct(s, t, n, null, a) : s) : r) : e;
    if (ve(e)) return ct(e, t, n, null, null);
    if (typeof e == "object") {
      const s = {
        ...e
      };
      let a = false;
      for (const [o, c] of Object.entries(s)) {
        const u = wr(c, t, n);
        u !== c && (s[o] = u, a = true);
      }
      return a ? s : e;
    }
    return e;
  }
  function ct(e, t, n, r, s) {
    let a = e;
    if (t.enter) {
      const y = t.enter(a, n, r, s);
      if (y === null) return a;
      y !== void 0 && (a = y);
    }
    const o = Z(a), c = t[o];
    if (c) {
      const y = c(a, n, r, s);
      if (y === null) return a;
      y !== void 0 && (a = y);
    }
    const u = Z(a), l = we(a);
    let m;
    if (l == null) m = ge(u, l);
    else {
      const y = {
        ...l
      };
      for (const [w, L] of Object.entries(y)) {
        const $ = wr(L, t, a);
        $ !== L && (y[w] = $);
      }
      m = ge(u, y);
    }
    if (t.leave) {
      const y = t.leave(m, n, r, s);
      if (y != null) return y;
    }
    return m;
  }
  function Ht(e, t) {
    return ct(e, t, null, null, null);
  }
  function hr(e, t, n) {
    return Ht(e, {
      enter: (r, s) => {
        if (t(r, s)) return typeof n == "function" ? n(r) : n;
      }
    });
  }
  function Jl(e, t, n) {
    return hr(e, (r) => Z(r) === t, typeof n == "function" ? (r) => n(r) : n);
  }
  function Hl(e, t) {
    return qe(dr(be(e), JSON.stringify(t))) ?? e;
  }
  function Wl(e, t, n) {
    return qe(n ? pr(be(e), JSON.stringify(t), JSON.stringify(n)) : fr(be(e), JSON.stringify(t))) ?? e;
  }
  function Yl(e, t) {
    return qe(ur(be(e), t)) ?? e;
  }
  function Ql(e, t = {}) {
    return qe(lr(be(e), JSON.stringify(t))) ?? e;
  }
  function Gl(e, t, n = "and") {
    return qe(tr(be(e), be(t), n === "or")) ?? e;
  }
  function Zl(e) {
    return qe(mr(be(e))) ?? e;
  }
  function Xl(e, ...t) {
    if (Z(e) !== "select") return e;
    const n = we(e);
    return ge("select", {
      ...n,
      expressions: [
        ...n.expressions,
        ...t
      ]
    });
  }
  function em(e, t) {
    if (Z(e) !== "select") return e;
    const n = we(e);
    return ge("select", {
      ...n,
      expressions: n.expressions.filter((r) => !t(r))
    });
  }
  function tm(e, t) {
    if (typeof t == "number") return qe(br(be(e), t)) ?? e;
    if (Z(e) !== "select") return e;
    const n = we(e);
    return ge("select", {
      ...n,
      limit: {
        this: t
      }
    });
  }
  function nm(e, t) {
    if (Z(e) !== "select") return e;
    const n = we(e), r = typeof t == "number" ? ge("literal", {
      literal_type: "number",
      value: String(t)
    }) : t;
    return ge("select", {
      ...n,
      offset: {
        this: r
      }
    });
  }
  function rm(e) {
    if (Z(e) !== "select") return e;
    const t = we(e);
    return ge("select", {
      ...t,
      limit: null,
      offset: null
    });
  }
  function sm(e, t = true) {
    return qe(gr(be(e), t)) ?? e;
  }
  function am(e) {
    return Ht(e, {});
  }
  function xr(e, t, n) {
    if (e == null) return e;
    if (Array.isArray(e)) return e.length > 0 && ve(e[0]) ? e.filter((r) => !t(r, n)).map((r) => Pt(r, t)) : e;
    if (ve(e)) return Pt(e, t);
    if (typeof e == "object") {
      const s = {
        ...e
      };
      let a = false;
      for (const [o, c] of Object.entries(s)) {
        const u = xr(c, t, n);
        u !== c && (s[o] = u, a = true);
      }
      return a ? s : e;
    }
    return e;
  }
  function Pt(e, t) {
    const n = Z(e), s = {
      ...we(e)
    };
    for (const [a, o] of Object.entries(s)) {
      const c = xr(o, t, e);
      c !== o && (s[a] = c);
    }
    return ge(n, s);
  }
  function Ie(e) {
    return JSON.stringify(e);
  }
  function vr(e, t, n) {
    if (e != null) {
      if (Array.isArray(e)) {
        if (e.length > 0 && ve(e[0])) n.push({
          key: t,
          value: e
        });
        else if (e.length > 0 && Array.isArray(e[0])) {
          for (const r of e) if (Array.isArray(r)) for (const s of r) ve(s) && n.push({
            key: t,
            value: s
          });
        }
      } else if (ve(e)) n.push({
        key: t,
        value: e
      });
      else if (typeof e == "object") for (const [, r] of Object.entries(e)) vr(r, t, n);
    }
  }
  function Cr(e) {
    const t = [], n = we(e);
    if (!n || typeof n != "object") return t;
    for (const [r, s] of Object.entries(n)) vr(s, r, t);
    return t;
  }
  function ye(e, t, n = null, r = null, s = null) {
    t.enter && t.enter(e, n, r, s);
    const a = Z(e), o = t[a];
    o && o(e, n, r, s);
    const c = Cr(e);
    for (const u of c) Array.isArray(u.value) ? u.value.forEach((l, m) => {
      ye(l, t, e, u.key, m);
    }) : ye(u.value, t, e, u.key, null);
    t.leave && t.leave(e, n, r, s);
  }
  function Wt(e, t) {
    const n = [];
    return ye(e, {
      enter: (r, s) => {
        t(r, s) && n.push(r);
      }
    }), n;
  }
  function wt(e, t) {
    return Wt(e, (n) => Z(n) === t);
  }
  function Ar(e, t) {
    let n, r = false;
    return ye(e, {
      enter: (s, a) => {
        !r && t(s, a) && (n = s, r = true);
      }
    }), n;
  }
  function om(e, t) {
    return Ar(e, t) !== void 0;
  }
  function im(e, t) {
    let n = true;
    return ye(e, {
      enter: (r, s) => {
        t(r, s) || (n = false);
      }
    }), n;
  }
  function cm(e, t) {
    return Wt(e, t).length;
  }
  function _m(e) {
    return wt(e, "column");
  }
  function um(e) {
    return wt(e, "table");
  }
  function lm(e) {
    return wt(e, "identifier");
  }
  function mm(e) {
    const t = JSON.parse(sr(Ie(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function Sr(e) {
    const t = JSON.parse(nr(Ie(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function Lr(e) {
    const t = JSON.parse(cr(Ie(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function kr(e) {
    const t = JSON.parse(or(Ie(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function dm(e) {
    const t = JSON.parse(ar(Ie(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function fm(e) {
    const t = JSON.parse(rr(Ie(e)));
    return t.success ? t.result : [];
  }
  function pm(e) {
    const t = JSON.parse(ir(Ie(e)));
    return t.success ? t.result : [];
  }
  function gm(e) {
    return Sr(e).length > 0;
  }
  function bm(e) {
    return Lr(e).length > 0;
  }
  function ym(e) {
    return kr(e).length > 0;
  }
  function wm(e) {
    let t = 0, n = 0;
    return ye(e, {
      enter: () => {
        n++, t = Math.max(t, n);
      },
      leave: () => {
        n--;
      }
    }), t;
  }
  function hm(e) {
    const t = JSON.parse(_r(Ie(e)));
    return t.success ? t.result : 0;
  }
  function xm(e, t) {
    let n = null;
    return ye(e, {
      enter: (r, s) => {
        r === t && (n = s);
      }
    }), n;
  }
  function vm(e, t, n) {
    const r = [];
    let s = null;
    return ye(e, {
      enter: (a) => {
        if (s === null) {
          if (a === t) for (let o = r.length - 1; o >= 0; o--) {
            const c = o > 0 ? r[o - 1] : null;
            if (n(r[o], c)) {
              s = r[o];
              break;
            }
          }
          r.push(a);
        }
      },
      leave: () => {
        r.pop();
      }
    }), s;
  }
  function Cm(e, t) {
    let n = 0, r = 0;
    return ye(e, {
      enter: (s) => {
        r++, s === t && (n = r);
      },
      leave: () => {
        r--;
      }
    }), n;
  }
  const Yt = Object.freeze(Object.defineProperty({
    __proto__: null,
    addSelectColumns: Xl,
    addWhere: Gl,
    clone: am,
    countNodes: cm,
    every: im,
    findAll: Wt,
    findAncestor: vm,
    findByType: wt,
    findFirst: Ar,
    getAggregateFunctions: Sr,
    getChildren: Cr,
    getColumnNames: fm,
    getColumns: _m,
    getDepth: wm,
    getExprData: we,
    getExprType: Z,
    getFunctions: mm,
    getIdentifiers: lm,
    getInferredType: Cu,
    getLiterals: dm,
    getNodeDepth: Cm,
    getParent: xm,
    getSubqueries: kr,
    getTableNames: pm,
    getTables: um,
    getWindowFunctions: Lr,
    hasAggregates: gm,
    hasSubqueries: ym,
    hasWindowFunctions: bm,
    isAdd: Qu,
    isAggregateFunction: il,
    isAlias: ql,
    isAlterTable: Rl,
    isAnd: Du,
    isArithmetic: Ul,
    isAvg: ll,
    isBetween: rl,
    isBoolean: Mu,
    isCase: wl,
    isCast: gl,
    isCoalesce: fl,
    isColumn: $u,
    isComparison: Pl,
    isConcat: tl,
    isCount: _l,
    isCreateIndex: Fl,
    isCreateTable: $l,
    isCreateView: Ol,
    isCte: jl,
    isDDL: Vl,
    isDelete: ku,
    isDiv: Xu,
    isDropIndex: Ml,
    isDropTable: El,
    isDropView: Dl,
    isEq: Pu,
    isExcept: qu,
    isExists: al,
    isExpressionValue: ve,
    isFrom: hl,
    isFunction: ol,
    isGroupBy: Cl,
    isGt: Ju,
    isGte: Hu,
    isHaving: Al,
    isILike: Yu,
    isIdentifier: Nu,
    isIn: nl,
    isInsert: Su,
    isIntersect: ju,
    isIsNull: sl,
    isJoin: xl,
    isLike: Wu,
    isLimit: Ll,
    isLiteral: Fu,
    isLogical: Kl,
    isLt: Ku,
    isLte: Vu,
    isMax: dl,
    isMin: ml,
    isMod: el,
    isMul: Zu,
    isNeq: Uu,
    isNot: Bu,
    isNullIf: pl,
    isNullLiteral: Ou,
    isOffset: kl,
    isOr: zu,
    isOrderBy: Sl,
    isOrdered: Nl,
    isParen: Il,
    isQuery: zl,
    isSafeCast: yl,
    isSelect: Au,
    isSetOperation: Bl,
    isStar: Ru,
    isSub: Gu,
    isSubquery: Iu,
    isSum: ul,
    isTable: Eu,
    isTryCast: bl,
    isUnion: Tu,
    isUpdate: Lu,
    isWhere: vl,
    isWindowFunction: cl,
    isWith: Tl,
    makeExpr: ge,
    nodeCount: hm,
    qualifyColumns: Yl,
    qualifyTables: Ql,
    remove: Pt,
    removeLimitOffset: rm,
    removeSelectColumns: em,
    removeWhere: Zl,
    renameColumns: Hl,
    renameTables: Wl,
    replaceByType: Jl,
    replaceNodes: hr,
    setDistinct: sm,
    setLimit: tm,
    setOffset: nm,
    some: om,
    transform: Ht,
    walk: ye
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  function Am(e) {
    try {
      return JSON.parse(e);
    } catch {
      return {
        valid: false,
        errors: [
          {
            message: "Failed to parse validation response",
            severity: "error",
            code: "E000"
          }
        ]
      };
    }
  }
  function Sm(e, t, n = "generic", r = {}) {
    const s = r.strict ?? t.strict ?? true, a = {
      check_types: r.checkTypes ?? false,
      check_references: r.checkReferences ?? false,
      strict: s,
      semantic: r.semantic ?? false,
      strict_syntax: r.strictSyntax ?? false
    }, o = yr(e, JSON.stringify(t), n, JSON.stringify(a));
    return Am(o);
  }
  const fe = vu;
  function Tr(e) {
    return e instanceof Error && e.message ? e.message : typeof e == "string" ? e : String(e);
  }
  function Lm(e, t) {
    return {
      success: false,
      ast: void 0,
      error: `WASM ${e} failed: ${Tr(t)}`,
      errorLine: void 0,
      errorColumn: void 0
    };
  }
  function Qt(e) {
    return typeof e == "string" ? JSON.parse(e) : e;
  }
  function Q(e, t = "generic") {
    try {
      if (typeof fe.parse_value == "function") return Qt(fe.parse_value(e, t));
      const n = JSON.parse(fe.parse(e, t));
      return n.success && typeof n.ast == "string" && (n.ast = JSON.parse(n.ast)), n;
    } catch (n) {
      return Lm("parse", n);
    }
  }
  function km() {
    return typeof fe.get_dialects_value == "function" ? Qt(fe.get_dialects_value()) : JSON.parse(fe.get_dialects());
  }
  function jr(e, t = "generic", n) {
    try {
      const r = n ? JSON.stringify(n) : "";
      return typeof fe.annotate_types_value == "function" ? Qt(fe.annotate_types_value(e, t, r)) : typeof fe.annotate_types == "function" ? JSON.parse(fe.annotate_types(e, t, r)) : {
        success: false,
        error: "annotate_types not available in this WASM build"
      };
    } catch (r) {
      return {
        success: false,
        error: `WASM annotate_types failed: ${Tr(r)}`
      };
    }
  }
  const Tm = {
    bq: "bigquery",
    cockroach: "cockroachdb",
    googlebigquery: "bigquery",
    memsql: "singlestore",
    mssql: "tsql",
    pg: "postgresql",
    pgsql: "postgresql",
    postgres: "postgresql",
    postgresql: "postgresql",
    singlestoredb: "singlestore",
    sqlserver: "tsql",
    sqlite3: "sqlite",
    transactsql: "tsql",
    tsql: "tsql"
  };
  function ue(e) {
    const t = e == null ? void 0 : e.trim();
    if (!t) return "generic";
    const n = t.toLowerCase().replace(/[-_\s]+/g, "");
    return Tm[n] ?? t.toLowerCase();
  }
  jm = function() {
    return [
      ...km().map(String)
    ].sort();
  };
  function qm(e) {
    const t = ue(e);
    return jm().includes(t);
  }
  function qr(e) {
    const t = ue(e);
    if (!qm(t)) throw new Error(`Unsupported SQL dialect "${e ?? t}". Run "sqldesc --dialects" to list supported dialects.`);
    return t;
  }
  const Ir = /* @__PURE__ */ new Set([
    "postgresql",
    "cockroachdb",
    "redshift"
  ]), $e = /* @__PURE__ */ new Set([
    "tsql"
  ]), Nr = /* @__PURE__ */ new Set([
    "oracle"
  ]), $r = /* @__PURE__ */ new Set([
    "mysql",
    "mariadb",
    "singlestore"
  ]);
  function Im(e, t) {
    const n = ue(t);
    return Ym(Gt(e, n), n);
  }
  function Nm(e, t) {
    const n = ue(t);
    return e.mode === "none" ? e : e.mode === "positional" ? {
      mode: "positional",
      binds: e.binds.map((r) => ({
        ...r,
        type: qn(r.type, n)
      }))
    } : {
      mode: "named",
      binds: e.binds.map((r) => ({
        ...r,
        type: qn(r.type, n)
      }))
    };
  }
  function qn(e, t) {
    const n = $m(e);
    return n ? Er(n, t) : e;
  }
  function $m(e) {
    const n = e.trim().match(/^jdbc\s*:\s*(?:(?:java\.sql\.)?types\.)?([A-Za-z_][\w]*)$/i);
    return n ? n[1].toUpperCase() : void 0;
  }
  function Er(e, t) {
    return Em(t)[e] ?? ze[e] ?? "unknown";
  }
  function Em(e) {
    return Ir.has(e) ? Dm : $e.has(e) ? Bm : Nr.has(e) ? Pm : $r.has(e) ? zm : ze;
  }
  function Gt(e, t) {
    let n = "";
    for (let r = 0; r < e.length; ) {
      const s = e[r];
      if (s === "'") {
        const a = _e(e, r, "'");
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === '"') {
        const a = _e(e, r, '"');
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "`") {
        const a = _e(e, r, "`");
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "[") {
        const a = _e(e, r, "[");
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "-" && e[r + 1] === "-") {
        const a = dt(e, r);
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "#") {
        const a = dt(e, r);
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "/" && e[r + 1] === "*") {
        const a = Fr(e, r);
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "{") {
        const a = Wm(e, r);
        if (a !== -1) {
          n += Rm(e.slice(r + 1, a), t), r = a + 1;
          continue;
        }
      }
      n += s, r++;
    }
    return n;
  }
  function Rm(e, t) {
    const n = Gt(e.trim(), t);
    if (/^fn\b/i.test(n)) return Fm(n.replace(/^fn\b/i, "").trim(), t);
    const r = n.match(/^d\s+('(?:''|[^'])*')$/i);
    if (r) return kt("date", r[1] ?? "''", t);
    const s = n.match(/^t\s+('(?:''|[^'])*')$/i);
    if (s) return kt("time", s[1] ?? "''", t);
    const a = n.match(/^ts\s+('(?:''|[^'])*')$/i);
    return a ? kt("timestamp", a[1] ?? "''", t) : /^escape\b/i.test(n) ? `ESCAPE ${n.replace(/^escape\b/i, "").trim()}` : /^oj\b/i.test(n) ? n.replace(/^oj\b/i, "").trim() : /^\?\s*=\s*call\b/i.test(n) ? Um(n.replace(/^\?\s*=\s*call\b/i, "").trim(), t) : /^call\b/i.test(n) ? `CALL ${n.replace(/^call\b/i, "").trim()}` : `{${n}}`;
  }
  function Fm(e, t) {
    const n = Rr(e);
    if (!n) return e;
    const r = n.name.toLowerCase(), s = n.args.map((a) => Gt(a.trim(), t));
    return r === "ucase" ? In("upper", s, e) : r === "lcase" ? In("lower", s, e) : r === "ifnull" ? Jm($e.has(t) ? "isnull" : "coalesce", s, e) : r === "now" ? Tt("current_timestamp", s, e) : r === "curdate" ? Tt(Km(t), s, e) : r === "curtime" ? Tt(Vm(t), s, e) : r === "convert" ? Mm(s, t, e) : `${n.name}(${s.join(", ")})`;
  }
  function Mm(e, t, n) {
    if (e.length !== 2) return n;
    const r = Om(e[1] ?? "", t);
    return `CAST(${e[0]} AS ${r})`;
  }
  function Om(e, t) {
    const n = e.trim().replace(/^SQL_/i, "").toUpperCase();
    return Er(n, t) ?? e.trim();
  }
  const ze = {
    ARRAY: "array<variant>",
    BIGINT: "bigint",
    BINARY: "bytes",
    BIT: "boolean",
    BLOB: "bytes",
    BOOLEAN: "boolean",
    CHAR: "text",
    CLOB: "text",
    DATALINK: "text",
    DATE: "date",
    DECIMAL: "decimal",
    DISTINCT: "variant",
    DOUBLE: "decimal",
    FLOAT: "decimal",
    INTEGER: "integer",
    JAVA_OBJECT: "variant",
    LONGNVARCHAR: "text",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    NCHAR: "text",
    NCLOB: "text",
    NULL: "unknown",
    NUMERIC: "decimal",
    NVARCHAR: "text",
    OTHER: "variant",
    REAL: "decimal",
    REF: "variant",
    REF_CURSOR: "variant",
    ROWID: "text",
    SMALLINT: "integer",
    SQLXML: "xml",
    STRUCT: "struct<>",
    TIME: "time",
    TIME_WITH_TIMEZONE: "time",
    TIMESTAMP: "timestamp",
    TIMESTAMP_WITH_TIMEZONE: "timestamp",
    TINYINT: "integer",
    VARBINARY: "bytes",
    VARCHAR: "text"
  }, Dm = {
    ...ze,
    ARRAY: "array<variant>",
    BINARY: "bytes",
    BIT: "boolean",
    BLOB: "bytes",
    BOOLEAN: "boolean",
    CHAR: "text",
    CLOB: "text",
    DISTINCT: "variant",
    DOUBLE: "decimal",
    FLOAT: "decimal",
    JAVA_OBJECT: "json",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    OTHER: "json",
    REAL: "decimal",
    REF: "variant",
    REF_CURSOR: "variant",
    SQLXML: "xml",
    STRUCT: "struct<>",
    VARBINARY: "bytes",
    VARCHAR: "text"
  }, zm = {
    ...ze,
    ARRAY: "json",
    BIGINT: "bigint",
    BINARY: "bytes",
    BIT: "boolean",
    BLOB: "bytes",
    BOOLEAN: "boolean",
    CHAR: "text",
    CLOB: "text",
    DOUBLE: "decimal",
    FLOAT: "decimal",
    JAVA_OBJECT: "json",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    OTHER: "json",
    REAL: "decimal",
    SQLXML: "text",
    STRUCT: "json",
    TIME_WITH_TIMEZONE: "time",
    TIMESTAMP: "datetime",
    TIMESTAMP_WITH_TIMEZONE: "datetime",
    TINYINT: "integer",
    VARBINARY: "bytes",
    VARCHAR: "text"
  }, Bm = {
    ...ze,
    ARRAY: "variant",
    BINARY: "bytes",
    BIT: "boolean",
    BLOB: "bytes",
    BOOLEAN: "boolean",
    CHAR: "text",
    CLOB: "text",
    DATALINK: "text",
    DOUBLE: "decimal",
    FLOAT: "decimal",
    JAVA_OBJECT: "variant",
    LONGNVARCHAR: "text",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    NCHAR: "text",
    NCLOB: "text",
    NVARCHAR: "text",
    OTHER: "variant",
    REAL: "decimal",
    REF: "variant",
    REF_CURSOR: "variant",
    ROWID: "text",
    SQLXML: "xml",
    STRUCT: "variant",
    TIME_WITH_TIMEZONE: "time",
    TIMESTAMP: "datetime",
    TIMESTAMP_WITH_TIMEZONE: "datetime",
    VARBINARY: "bytes",
    VARCHAR: "text"
  }, Pm = {
    ...ze,
    ARRAY: "array<variant>",
    BIGINT: "decimal",
    BINARY: "bytes",
    BIT: "decimal",
    BLOB: "bytes",
    BOOLEAN: "boolean",
    CHAR: "text",
    CLOB: "text",
    DOUBLE: "decimal",
    FLOAT: "decimal",
    INTEGER: "decimal",
    JAVA_OBJECT: "variant",
    LONGNVARCHAR: "text",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    NCHAR: "text",
    NCLOB: "text",
    NUMERIC: "decimal",
    NVARCHAR: "text",
    OTHER: "variant",
    REAL: "decimal",
    REF: "variant",
    REF_CURSOR: "variant",
    ROWID: "text",
    SMALLINT: "decimal",
    SQLXML: "xml",
    STRUCT: "struct<>",
    TIME: "timestamp",
    TIME_WITH_TIMEZONE: "timestamp",
    TIMESTAMP_WITH_TIMEZONE: "timestamp",
    TINYINT: "decimal",
    VARBINARY: "bytes",
    VARCHAR: "text"
  };
  function kt(e, t, n) {
    return $e.has(n) ? `CAST(${t} AS ${e === "timestamp" ? "datetime2" : e})` : $r.has(n) ? t : `${e.toUpperCase()} ${t}`;
  }
  function Um(e, t) {
    const n = Rr(e);
    return n ? $e.has(t) ? `EXEC ${e}` : `SELECT ${n.name}(${n.args.join(", ")})` : `SELECT ${e}`;
  }
  function Km(e) {
    return $e.has(e) ? "CAST(current_timestamp AS date)" : "current_date";
  }
  function Vm(e) {
    return $e.has(e) ? "CAST(current_timestamp AS time)" : "current_time";
  }
  function In(e, t, n) {
    return t.length === 1 ? `${e}(${t[0]})` : n;
  }
  function Jm(e, t, n) {
    return t.length === 2 ? `${e}(${t[0]}, ${t[1]})` : n;
  }
  function Tt(e, t, n) {
    return t.length === 0 ? e : n;
  }
  function Rr(e) {
    const t = e.match(/^([A-Za-z_][\w.$]*)\s*\(([\s\S]*)\)$/);
    if (t) return {
      name: t[1] ?? "",
      args: Hm(t[2] ?? "")
    };
  }
  function Hm(e) {
    const t = [];
    let n = 0, r = 0;
    for (let a = 0; a < e.length; ) {
      const o = e[a];
      if (o === "'") {
        a = _e(e, a, "'");
        continue;
      }
      if (o === '"') {
        a = _e(e, a, '"');
        continue;
      }
      (o === "(" || o === "{") && r++, (o === ")" || o === "}") && (r = Math.max(0, r - 1)), o === "," && r === 0 && (t.push(e.slice(n, a).trim()), n = a + 1), a++;
    }
    const s = e.slice(n).trim();
    return s ? [
      ...t,
      s
    ] : t;
  }
  function Wm(e, t) {
    let n = 0;
    for (let r = t; r < e.length; ) {
      const s = e[r];
      if (s === "'") {
        r = _e(e, r, "'");
        continue;
      }
      if (s === '"') {
        r = _e(e, r, '"');
        continue;
      }
      if (s === "{" && n++, s === "}" && (n--, n === 0)) return r;
      r++;
    }
    return -1;
  }
  function Ym(e, t) {
    let n = "", r = 0;
    for (let s = 0; s < e.length; ) {
      const a = e[s];
      if (a === "'") {
        const o = _e(e, s, "'");
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === '"') {
        const o = _e(e, s, '"');
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === "`") {
        const o = _e(e, s, "`");
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === "[") {
        const o = _e(e, s, "[");
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === "-" && e[s + 1] === "-") {
        const o = dt(e, s);
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === "#") {
        const o = dt(e, s);
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === "/" && e[s + 1] === "*") {
        const o = Fr(e, s);
        n += e.slice(s, o), s = o;
        continue;
      }
      if (a === "?") {
        if (e[s + 1] === "?") {
          n += "?", s += 2;
          continue;
        }
        r++, n += Qm(r, t), s++;
        continue;
      }
      n += a, s++;
    }
    return n;
  }
  function Qm(e, t) {
    return Ir.has(t) ? `$${e}` : Nr.has(t) ? `:${e}` : $e.has(t) ? `@P${e}` : "?";
  }
  function _e(e, t, n) {
    const r = n === "[" ? "]" : n;
    for (let s = t + 1; s < e.length; s++) if (e[s] === r) {
      if (e[s + 1] === r) {
        s++;
        continue;
      }
      return s + 1;
    }
    return e.length;
  }
  function dt(e, t) {
    const n = e.slice(t).search(/[\r\n]/);
    return n === -1 ? e.length : t + n;
  }
  function Fr(e, t) {
    const n = e.indexOf("*/", t + 2);
    return n === -1 ? e.length : n + 2;
  }
  async function Gm() {
    return [];
  }
  async function Zm() {
    throw new Error("File system access is not available in the browser.");
  }
  const De = {
    join(...e) {
      return e.filter(Boolean).join("/").replace(/\/+/g, "/");
    },
    resolve(...e) {
      return De.join(...e);
    },
    dirname(e) {
      const t = e.replace(/\\/g, "/"), n = t.lastIndexOf("/");
      return n <= 0 ? "." : t.slice(0, n);
    }
  }, Xm = /^(?:constraint\s+\S+\s+)?(?:primary\s+key|foreign\s+key|unique|check|period\s+for)\b/i;
  async function ed(e, t = process.cwd()) {
    return (await Promise.all(e.map((n) => nd()))).flat().sort();
  }
  async function td(e, t = {}) {
    const n = t.cwd ?? process.cwd(), r = await ed(e, n);
    return Mr(r, t);
  }
  async function Mr(e, t = {}) {
    const n = qr(t.dialect), r = [], s = [], a = /* @__PURE__ */ new Map();
    for (const m of e) {
      const y = await Or(m, n);
      s.push(y);
      const w = Ur(y, n, a);
      r.push(...w.length > 0 ? w : Jr(y)), r.push(...Rd(y, n));
    }
    const o = Fd(s, n);
    let c = {
      tables: r,
      ...o.length > 0 ? {
        functions: o
      } : {}
    };
    for (const m of s) c = Rn(m, c, n, a);
    for (const m of s) {
      for (const y of $d(m, c, n)) c.tables.some((w) => as(w, y)) || c.tables.push(y);
      c.tables.push(...Ed(m, c, n)), c.tables.push(...Nd(m, c, n));
    }
    for (const m of s) c = Rn(m, c, n, a);
    const u = c.functions ? c : V(c, {
      tables: [],
      functions: o
    }), l = Md(s, u, n);
    return V(c, {
      tables: [],
      procedures: l
    });
  }
  async function nd(e, t) {
    const n = [];
    for await (const r of Gm()) r.isFile() && n.push(De.join(r.parentPath, r.name));
    return n;
  }
  async function Or(e, t, n = /* @__PURE__ */ new Set()) {
    const r = De.resolve(e);
    if (n.has(r)) return "";
    n.add(r);
    const s = await Zm(), a = await rd(s, t, De.dirname(r), n);
    return Be(a, t);
  }
  async function rd(e, t, n, r) {
    const s = ue(t), a = e.replace(/^\uFEFF/, "").split(/\r?\n/), o = [], c = s === "postgresql" ? zr() : void 0;
    for (const u of a) {
      if (c && Br(c, u)) {
        o.push(u);
        continue;
      }
      if (c && !Zt(c)) {
        o.push(u);
        continue;
      }
      const l = sd(u, s);
      if (!l) {
        o.push(u);
        continue;
      }
      o.push(await Or(ad(l, n), s, r));
    }
    return o.join(`
`);
  }
  function sd(e, t) {
    const n = e.trim();
    if (t === "oracle") {
      const r = n.match(/^(?:@{1,2}|start\s+)(.+)$/i);
      return r ? Ke(Ue(r[1])) : void 0;
    }
    if (t === "postgresql") {
      const r = n.match(/^\\(?:i|include|ir|include_relative)\s+(.+)$/i);
      return r ? Ke(Ue(r[1])) : void 0;
    }
    if ([
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(t)) {
      const r = n.match(/^(?:source|\\\.)\s+(.+)$/i);
      return r ? Ke(Ue(r[1])) : void 0;
    }
    if (t === "tsql") {
      const r = n.match(/^:r\s+(.+)$/i);
      return r ? Ke(Ue(r[1])) : void 0;
    }
    if (t === "sqlite" || t === "duckdb") {
      const r = n.match(/^\.read\s+(.+)$/i);
      return r ? Ke(Ue(r[1])) : void 0;
    }
  }
  function Ue(e) {
    if (!e) return "";
    const t = e.trim(), n = t.match(/^(['"])(.*?)\1/);
    return n ? n[2] ?? "" : t.split(/\s+/)[0] ?? "";
  }
  function Ke(e) {
    const t = e.trim();
    if (t) return t.replace(/^['"]|['"]$/g, "");
  }
  function ad(e, t) {
    return De.isAbsolute(e) ? e : De.resolve(t, e);
  }
  function Dr(e, t = "generic") {
    const n = ue(t), r = Be(e, n), s = Ur(r, n);
    return s.length > 0 ? s : Jr(r);
  }
  function Be(e, t) {
    const n = ue(t);
    return n === "postgresql" ? id(e) : n === "oracle" ? dd(e) : [
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(n) ? hd(e) : n === "tsql" ? vd(e) : n === "sqlite" || n === "duckdb" ? od(e) : e;
  }
  function od(e) {
    return e.replace(/^\uFEFF/, "").split(/\r?\n/).filter((t) => !/^\s*\.[A-Za-z]/.test(t)).join(`
`);
  }
  function id(e) {
    const t = zr(), n = /* @__PURE__ */ new Map();
    return e.replace(/^\uFEFF/, "").split(/\r?\n/).flatMap((r) => {
      if (Br(t, r)) return [];
      if (!Zt(t)) return [];
      const s = cd(r);
      if (s) return n.set(s.name.toLowerCase(), s.value), [];
      const a = _d(r);
      return a ? (n.delete(a.toLowerCase()), []) : /^\s*\\/.test(r) ? [] : [
        ld(r, n)
      ];
    }).join(`
`);
  }
  function zr() {
    return [];
  }
  function Br(e, t) {
    var _a2;
    const n = t.trim().match(/^\\(if|elif|else|endif)\b(?:\s+(.*))?$/i);
    if (!n) return false;
    const r = (_a2 = n[1]) == null ? void 0 : _a2.toLowerCase(), s = n[2] ?? "";
    if (r === "if") {
      const o = Zt(e), c = o && Nn(s) !== false;
      return e.push({
        parentActive: o,
        active: c,
        matched: c
      }), true;
    }
    const a = e.at(-1);
    if (!a) return true;
    if (r === "elif") {
      const o = a.parentActive && !a.matched && Nn(s) !== false;
      return a.active = o, a.matched = a.matched || o, true;
    }
    if (r === "else") {
      const o = a.parentActive && !a.matched;
      return a.active = o, a.matched = true, true;
    }
    return r === "endif" && e.pop(), true;
  }
  function Zt(e) {
    return e.every((t) => t.active);
  }
  function Nn(e) {
    const t = e.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
    if ([
      "false",
      "off",
      "no",
      "0"
    ].includes(t)) return false;
    if ([
      "true",
      "on",
      "yes",
      "1"
    ].includes(t)) return true;
  }
  function cd(e) {
    const t = e.trim().match(/^\\set\s+([A-Za-z_][\w]*)\s*(.*)$/i);
    if (t) return {
      name: t[1] ?? "",
      value: ud(t[2] ?? "")
    };
  }
  function _d(e) {
    var _a2;
    return (_a2 = e.trim().match(/^\\unset\s+([A-Za-z_][\w]*)\b/i)) == null ? void 0 : _a2[1];
  }
  function ud(e) {
    const t = e.trim(), n = t.match(/^(['"])([\s\S]*)\1$/);
    return n ? n[2] ?? "" : t;
  }
  function ld(e, t) {
    return e.replace(new RegExp("(?<!:):'([A-Za-z_][\\w]*)'", "g"), (n, r) => t.get(r.toLowerCase()) ?? n).replace(new RegExp('(?<!:):"([A-Za-z_][\\w]*)"', "g"), (n, r) => md(t.get(r.toLowerCase())) ?? n).replace(new RegExp("(?<!:):([A-Za-z_][\\w]*)", "g"), (n, r) => t.get(r.toLowerCase()) ?? n);
  }
  function md(e) {
    if (e !== void 0) return `"${e.replace(/"/g, '""')}"`;
  }
  function dd(e) {
    const t = [];
    let n = [];
    const r = /* @__PURE__ */ new Map();
    let s = true;
    for (const a of e.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const o = a.trim();
      if (o === "/") {
        ft(t, n), n = [];
        continue;
      }
      const c = pd(o);
      if (c !== void 0) {
        s = c;
        continue;
      }
      const u = gd(o);
      if (u) {
        r.set(u.name.toLowerCase(), u.value);
        continue;
      }
      const l = bd(o);
      if (l) {
        r.delete(l.toLowerCase());
        continue;
      }
      fd(o) || n.push(s ? wd(a, r) : a);
    }
    return ft(t, n), t.join(`
`);
  }
  function fd(e) {
    return /^(?:set|prompt|spool|whenever|define|undefine|variable|column|remark|rem)\b/i.test(e);
  }
  function pd(e) {
    var _a2;
    const t = e.match(/^set\s+define\s+(on|off)\b/i);
    if (t) return ((_a2 = t[1]) == null ? void 0 : _a2.toLowerCase()) === "on";
  }
  function gd(e) {
    const t = e.match(/^define\s+([A-Za-z_][\w$#]*)\s*(?:=\s*)?(.+)$/i);
    if (t) return {
      name: t[1] ?? "",
      value: yd(t[2] ?? "")
    };
  }
  function bd(e) {
    var _a2;
    return (_a2 = e.match(/^undefine\s+([A-Za-z_][\w$#]*)\b/i)) == null ? void 0 : _a2[1];
  }
  function yd(e) {
    const t = e.trim(), n = t.match(/^(['"])([\s\S]*)\1$/);
    return n ? n[2] ?? "" : t;
  }
  function wd(e, t) {
    return e.replace(/&&?([A-Za-z_][\w$#]*)(\.)?/g, (n, r, s, a, o) => {
      const c = t.get(r.toLowerCase());
      if (c === void 0) return n;
      const u = o[a + n.length];
      return s && u === "." ? c : `${c}${s ?? ""}`;
    }).replace(new RegExp("(?<=\\w)\\.\\.", "g"), ".");
  }
  function hd(e) {
    const t = [];
    let n = ";", r = "", s;
    for (const a of e.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const o = a.trim().match(/^delimiter\s+(.+)$/i);
      if (o) {
        s = jt(t, r, s), r = "", n = o[1] ?? ";";
        continue;
      }
      r += `${a}
`, r.trimEnd().endsWith(n) && (r = r.trimEnd().slice(0, -n.length), s = jt(t, r, s), r = "");
    }
    return jt(t, r, s), t.join(`
`);
  }
  function jt(e, t, n) {
    const r = t.trim();
    if (!r) return n;
    const s = r.match(/^use\s+(.+?)\s*;?$/i);
    return s ? M(s[1].trim()) : (Pr(e, xd(r, n)), n);
  }
  function xd(e, t) {
    return t ? e.replace(/^(\s*create\s+(?:(?:or\s+replace|temporary)\s+)*(?:table|view|procedure|function)\s+)(?!if\s+not\s+exists\s+)([`"']?[\w$]+[`"']?)(\s|\()/i, (n, r, s, a) => s.includes(".") ? n : `${r}${$n(t, s)}${a}`).replace(/^(\s*create\s+(?:(?:or\s+replace|temporary)\s+)*table\s+if\s+not\s+exists\s+)([`"']?[\w$]+[`"']?)(\s|\()/i, (n, r, s, a) => s.includes(".") ? n : `${r}${$n(t, s)}${a}`) : e;
  }
  function $n(e, t) {
    const n = M(e), r = t.startsWith("`") ? "`" : t.startsWith('"') ? '"' : t.startsWith("'") ? "'" : "";
    return r ? `${r}${n}${r}.${t}` : `${n}.${t}`;
  }
  function vd(e) {
    const t = [];
    let n = [];
    const r = /* @__PURE__ */ new Map();
    for (const s of e.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const a = Cd(s);
      if (a) {
        r.set(a.name.toLowerCase(), a.value);
        continue;
      }
      if (!/^\s*:[A-Za-z]/.test(s)) {
        if (/^\s*go(?:\s+\d+)?\s*$/i.test(s)) {
          ft(t, n), n = [];
          continue;
        }
        n.push(Sd(s, r));
      }
    }
    return ft(t, n), t.join(`
`);
  }
  function Cd(e) {
    const t = e.trim().match(/^:setvar\s+([A-Za-z_][\w]*)\s*(.*)$/i);
    if (t) return {
      name: t[1] ?? "",
      value: Ad(t[2] ?? "")
    };
  }
  function Ad(e) {
    const t = e.trim(), n = t.match(/^(['"])([\s\S]*)\1$/);
    return n ? n[2] ?? "" : t;
  }
  function Sd(e, t) {
    return e.replace(/\$\(([^)]+)\)/g, (n, r) => t.get(r.toLowerCase()) ?? n);
  }
  function ft(e, t) {
    Pr(e, t.join(`
`));
  }
  function Pr(e, t) {
    const n = t.trim();
    n && e.push(n.endsWith(";") ? n : `${n};`);
  }
  function Ur(e, t = "generic", n = /* @__PURE__ */ new Map()) {
    const r = Q(e, t);
    if (!r.success || !Array.isArray(r.ast)) return [];
    const s = [];
    for (const a of r.ast) Kr(a, n), s.push(...Ld(a, n));
    return s;
  }
  function Ld(e, t = /* @__PURE__ */ new Map()) {
    if (!g(e) || !g(e.create_table) || e.create_table.as_select) return [];
    const n = e.create_table, r = te(n.name);
    if (!r) return [];
    const s = re(n.name), a = Array.isArray(n.columns) ? n.columns.map((l) => Xt(l, t)).filter((l) => l !== null) : [], o = kd(n, a), c = Td(n, a), u = jd(n);
    for (const l of a) o.includes(l.name) && (l.primaryKey = true), c.some((m) => m.length === 1 && m[0] === l.name) && (l.unique = true);
    return [
      {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: a,
        ...o.length > 0 ? {
          primaryKey: o
        } : {},
        ...c.length > 0 ? {
          uniqueKeys: c
        } : {
          uniqueKeys: []
        },
        ...u.length > 0 ? {
          foreignKeys: u
        } : {
          foreignKeys: []
        }
      }
    ];
  }
  function Xt(e, t = /* @__PURE__ */ new Map()) {
    var _a2;
    if (!g(e)) return null;
    const n = z(e.name);
    if (!n || n.toLowerCase() === "period" && ((_a2 = ae(e.data_type)) == null ? void 0 : _a2.toLowerCase()) === "for system_time") return null;
    const r = e.primary_key === true, s = g(e.data_type) && e.data_type.data_type === "nullable";
    return {
      name: n,
      type: nn(e.data_type, t) ?? "unknown",
      nullable: r ? false : s ? true : typeof e.nullable == "boolean" ? e.nullable : void 0,
      primaryKey: r,
      unique: e.unique === true
    };
  }
  function kd(e, t) {
    const n = t.filter((s) => s.primaryKey).map((s) => s.name), r = Array.isArray(e.constraints) ? e.constraints.flatMap((s) => {
      const a = g(s) ? s.PrimaryKey : void 0;
      return g(a) && Array.isArray(a.columns) ? a.columns.map(z).filter((o) => !!o) : [];
    }) : [];
    return [
      .../* @__PURE__ */ new Set([
        ...n,
        ...r
      ])
    ];
  }
  function Td(e, t) {
    const n = t.filter((s) => s.unique).map((s) => [
      s.name
    ]), r = Array.isArray(e.constraints) ? e.constraints.flatMap((s) => {
      const a = g(s) ? s.Unique : void 0;
      return g(a) && Array.isArray(a.columns) ? [
        a.columns.map(z).filter((o) => !!o)
      ] : [];
    }) : [];
    return [
      ...n,
      ...r
    ].filter((s) => s.length > 0);
  }
  function jd(e) {
    return Array.isArray(e.constraints) ? e.constraints.flatMap((t) => {
      const n = g(t) ? t.ForeignKey : void 0;
      if (!g(n)) return [];
      const r = g(n.references) ? n.references : {};
      return [
        {
          columns: Array.isArray(n.columns) ? n.columns.map(z).filter(Boolean) : [],
          references: {
            table: te(r.table),
            columns: Array.isArray(r.columns) ? r.columns.map(z).filter(Boolean) : [],
            ...re(r.table) ? {
              schema: re(r.table)
            } : {}
          }
        }
      ];
    }) : [];
  }
  function Kr(e, t) {
    if (!g(e) || !g(e.create_type)) return;
    const n = te(e.create_type.name), r = qd(e.create_type.definition);
    n && r && t.set(n.toLowerCase(), r);
  }
  function qd(e) {
    if (!g(e)) return;
    const t = g(e.Domain) ? e.Domain : void 0;
    if (t) return ae(t.base_type);
    if (Array.isArray(e.Enum)) return "text";
    if (Array.isArray(e.Composite)) return `struct<${e.Composite.flatMap((r) => {
      if (!g(r)) return [];
      const s = z(r.name), a = ae(r.data_type) ?? "unknown";
      return s ? [
        `${s} ${a}`
      ] : [];
    }).join(", ")}>`;
  }
  function Id(e) {
    var _a2;
    if (!g(e) || !g(e.create_function)) return [];
    const t = e.create_function, n = te(t.name);
    if (!n) return [];
    const s = (_a2 = typeof t.returns_table_body == "string" ? t.returns_table_body : void 0) == null ? void 0 : _a2.match(/^table\s*\(([\s\S]*)\)$/i), a = Vr(s == null ? void 0 : s[1]);
    if (a.length === 0) return [];
    const o = re(t.name);
    return [
      {
        name: n,
        ...o ? {
          schema: o
        } : {},
        columns: a,
        uniqueKeys: [],
        foreignKeys: []
      }
    ];
  }
  function Vr(e) {
    return e ? se(e, ",").flatMap((t) => {
      const n = t.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
      if (!n) return [];
      const r = M(n[1]), s = Qr(n[2]) ?? "unknown";
      return r ? [
        {
          name: r,
          type: s
        }
      ] : [];
    }) : [];
  }
  function Jr(e) {
    const t = [];
    for (const n of $f(e)) {
      const r = M(n.name), s = r.split("."), a = s.pop() ?? r, o = s.length > 0 ? s.join(".") : void 0, c = Rf(n.body), u = c.filter((l) => l.primaryKey).map((l) => l.name);
      t.push({
        name: a,
        ...o ? {
          schema: o
        } : {},
        columns: c,
        ...u.length > 0 ? {
          primaryKey: u
        } : {},
        uniqueKeys: [],
        foreignKeys: []
      });
    }
    return t;
  }
  function Nd(e, t = {
    tables: []
  }, n = "generic") {
    const r = ue(n), s = Be(e, r), a = Q(s, r);
    if (!a.success || !Array.isArray(a.ast)) return Mn(s, t, r);
    const o = Gr(s, t, r) ?? a.ast;
    return Zr([
      ...o.flatMap((c) => af(c, t)),
      ...Mn(s, t, r)
    ]);
  }
  function $d(e, t = {
    tables: []
  }, n = "generic") {
    const r = ue(n), s = Be(e, r), a = Q(s, r);
    if (!a.success || !Array.isArray(a.ast)) return On(s, t, r);
    const o = Gr(s, t, r) ?? a.ast;
    return Zr([
      ...o.flatMap((c) => ef(c, t)),
      ...On(s, t, r)
    ]);
  }
  function Ed(e, t = {
    tables: []
  }, n = "generic") {
    const r = ue(n), s = Be(e, r), a = Q(s, r);
    return !a.success || !Array.isArray(a.ast) ? [] : a.ast.flatMap((o) => rf(o, t));
  }
  function Rd(e, t = "generic") {
    const n = ue(t), r = Be(e, n), s = Q(r, n);
    return !s.success || !Array.isArray(s.ast) ? [] : s.ast.flatMap(Id);
  }
  function Fd(e, t) {
    const n = /* @__PURE__ */ new Map();
    for (const r of e) {
      const s = Q(r, t);
      if (!(!s.success || !Array.isArray(s.ast))) for (const a of s.ast) {
        for (const c of Bd(a)) n.set(en(c), c);
        const o = Hr(a, "drop_function");
        o && n.delete(o);
      }
    }
    return [
      ...n.values()
    ];
  }
  function Md(e, t, n) {
    const r = /* @__PURE__ */ new Map();
    for (const s of e) {
      const a = Q(s, n);
      if (!(!a.success || !Array.isArray(a.ast))) for (const o of a.ast) {
        for (const u of Od(o, t, n)) r.set(en(u), u);
        const c = Hr(o, "drop_procedure");
        c && r.delete(c);
      }
    }
    return [
      ...r.values()
    ];
  }
  function Hr(e, t) {
    if (!g(e) || !g(e[t])) return;
    const n = te(e[t].name);
    if (!n) return;
    const r = re(e[t].name);
    return en({
      name: n,
      ...r ? {
        schema: r
      } : {}
    });
  }
  function en(e) {
    return `${e.schema ?? ""}.${e.name}`.toLowerCase();
  }
  function Od(e, t, n) {
    if (!g(e) || !g(e.create_procedure)) return [];
    const r = e.create_procedure, s = te(r.name);
    if (!s) return [];
    const a = Dd(r, t, n);
    if (a.length === 0) return [];
    const o = re(r.name);
    return [
      {
        name: s,
        ...o ? {
          schema: o
        } : {},
        columns: a
      }
    ];
  }
  function Dd(e, t, n) {
    const r = zd(e.return_type);
    if (r.length > 0) return r;
    const s = g(e.body) ? e.body : void 0;
    if (s && g(s.Expression)) {
      const o = Wr(s.Expression);
      return g(o) && o.literal_type === "dollar_string" && typeof o.value == "string" ? En(o.value, t, n) : Ce(s.Expression, t);
    }
    const a = s && typeof s.RawBlock == "string" ? s.RawBlock : void 0;
    return a ? En(a, t, n) : [];
  }
  function zd(e) {
    var _a2;
    if (!g(e)) return [];
    const n = (_a2 = e.data_type === "custom" && typeof e.name == "string" ? e.name : void 0) == null ? void 0 : _a2.match(/^table\s*\(([\s\S]*)\)$/i);
    return Vr(n == null ? void 0 : n[1]);
  }
  function En(e, t, n) {
    const r = e.trim().replace(/^begin\b/i, "").replace(/\bend\s*$/i, "").trim();
    if (!/\bselect\b/i.test(r)) return [];
    const s = Q(r, n);
    if (!s.success || !Array.isArray(s.ast)) return [];
    for (const a of s.ast) {
      const o = Ce(a, t);
      if (o.length > 0) return o;
    }
    return [];
  }
  function Wr(e) {
    if (g(e)) {
      if (g(e.literal)) return e.literal;
      for (const t of Object.values(e)) {
        const n = Wr(t);
        if (n) return n;
      }
    }
  }
  function Bd(e) {
    if (!g(e) || !g(e.create_function)) return [];
    const t = e.create_function, n = te(t.name), r = ae(t.return_type);
    if (!n || !r) return [];
    const s = re(t.name);
    return [
      {
        name: n,
        ...s ? {
          schema: s
        } : {},
        returnType: r
      }
    ];
  }
  function Rn(e, t, n = "generic", r = /* @__PURE__ */ new Map()) {
    const s = ue(n), a = Q(e, s);
    return !a.success || !Array.isArray(a.ast) ? t : a.ast.reduce((o, c) => g(c) ? (Kr(c, r), g(c.alter_table) ? Kd(c.alter_table, o, r) : g(c.drop_table) ? Pd(c.drop_table, o) : g(c.drop_view) ? Yr(o, [
      c.drop_view.name
    ]) : g(c.drop_schema) ? qt(c.drop_schema, o) : g(c.drop_database) ? qt(c.drop_database, o) : g(c.drop_namespace) ? qt(c.drop_namespace, o) : g(c.raw) ? Ud(c.raw, o) : o) : o, t);
  }
  function Pd(e, t) {
    const n = Array.isArray(e.names) ? e.names : [];
    return Yr(t, n);
  }
  function qt(e, t) {
    const n = z(e.name);
    if (!n) return t;
    const r = (s) => (s == null ? void 0 : s.toLowerCase()) === n.toLowerCase();
    return {
      tables: t.tables.filter((s) => !r(s.schema)),
      ...t.functions ? {
        functions: t.functions.filter((s) => !r(s.schema))
      } : {},
      ...t.procedures ? {
        procedures: t.procedures.filter((s) => !r(s.schema))
      } : {}
    };
  }
  function Ud(e, t) {
    const r = (typeof e.sql == "string" ? e.sql : "").match(/^alter\s+(?:schema|database)\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
    if (r) {
      const s = M(r[1].trim()), a = M(r[2].trim());
      return !s || !a ? t : {
        tables: t.tables.map((o) => {
          var _a2;
          return ((_a2 = o.schema) == null ? void 0 : _a2.toLowerCase()) === s.toLowerCase() ? {
            ...o,
            schema: a
          } : o;
        }),
        ...t.functions ? {
          functions: t.functions.map((o) => {
            var _a2;
            return ((_a2 = o.schema) == null ? void 0 : _a2.toLowerCase()) === s.toLowerCase() ? {
              ...o,
              schema: a
            } : o;
          })
        } : {},
        ...t.procedures ? {
          procedures: t.procedures.map((o) => {
            var _a2;
            return ((_a2 = o.schema) == null ? void 0 : _a2.toLowerCase()) === s.toLowerCase() ? {
              ...o,
              schema: a
            } : o;
          })
        } : {}
      };
    }
    return t;
  }
  function Yr(e, t) {
    const n = t.flatMap((r) => {
      const s = te(r), a = g(r) ? re(r) : void 0;
      return s ? [
        {
          name: s.toLowerCase(),
          schema: a == null ? void 0 : a.toLowerCase()
        }
      ] : [];
    });
    return n.length === 0 ? e : {
      tables: e.tables.filter((r) => !n.some((s) => {
        var _a2;
        return !(r.name.toLowerCase() !== s.name || s.schema && ((_a2 = r.schema) == null ? void 0 : _a2.toLowerCase()) !== s.schema);
      }))
    };
  }
  function Kd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = te(e.name);
    if (!r || !Array.isArray(e.actions)) return t;
    const s = re(e.name);
    return {
      tables: t.tables.map((a) => {
        var _a2;
        return a.name.toLowerCase() !== r.toLowerCase() || s && ((_a2 = a.schema) == null ? void 0 : _a2.toLowerCase()) !== s.toLowerCase() ? a : Vd(a, e.actions, n);
      })
    };
  }
  function Vd(e, t, n = /* @__PURE__ */ new Map()) {
    return t.reduce((r, s) => g(s) ? g(s.RenameTable) ? Jd(r, s.RenameTable) : g(s.AddColumn) ? Hd(r, s.AddColumn.column, n) : g(s.DropColumn) ? Wd(r, s.DropColumn.name) : g(s.RenameColumn) ? Yd(r, s.RenameColumn.old_name, s.RenameColumn.new_name) : g(s.ChangeColumn) ? Qd(r, s.ChangeColumn, n) : g(s.AlterColumn) ? Gd(r, s.AlterColumn, n) : g(s.AddConstraint) ? Zd(r, s.AddConstraint) : g(s.Raw) ? Xd(r, s.Raw, n) : r : r, {
      ...e,
      columns: [
        ...e.columns
      ]
    });
  }
  function Jd(e, t) {
    const n = te(t), r = re(t);
    return n ? {
      ...e,
      name: n,
      ...r ? {
        schema: r
      } : {}
    } : e;
  }
  function Hd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = Xt(t, n);
    if (!r) return e;
    const s = e.columns.filter((a) => a.name.toLowerCase() !== r.name.toLowerCase());
    return {
      ...e,
      columns: [
        ...s,
        r
      ]
    };
  }
  function Wd(e, t) {
    const n = z(t);
    return n ? {
      ...e,
      columns: e.columns.filter((r) => r.name.toLowerCase() !== n.toLowerCase())
    } : e;
  }
  function Yd(e, t, n) {
    const r = z(t), s = z(n);
    return !r || !s ? e : {
      ...e,
      columns: e.columns.map((a) => a.name.toLowerCase() === r.toLowerCase() ? {
        ...a,
        name: s
      } : a)
    };
  }
  function Qd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = z(t.old_name), s = z(t.new_name);
    if (!r || !s) return e;
    const a = nn(t.data_type, n);
    return {
      ...e,
      columns: e.columns.map((o) => o.name.toLowerCase() === r.toLowerCase() ? {
        ...o,
        name: s,
        ...a ? {
          type: a
        } : {}
      } : o)
    };
  }
  function Gd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = z(t.name);
    if (!r) return e;
    const s = t.action;
    return {
      ...e,
      columns: e.columns.map((a) => {
        if (a.name.toLowerCase() !== r.toLowerCase()) return a;
        if (s === "SetNotNull") return {
          ...a,
          nullable: false
        };
        if (s === "DropNotNull") return {
          ...a,
          nullable: true
        };
        if (g(s) && g(s.SetDataType)) {
          const o = nn(s.SetDataType.data_type, n);
          return o ? {
            ...a,
            type: o
          } : a;
        }
        return a;
      })
    };
  }
  function Zd(e, t) {
    if (g(t.PrimaryKey)) {
      const n = Fn(t.PrimaryKey);
      return {
        ...e,
        ...n.length > 0 ? {
          primaryKey: n
        } : {},
        columns: e.columns.map((r) => n.some((s) => s.toLowerCase() === r.name.toLowerCase()) ? {
          ...r,
          primaryKey: true,
          nullable: false
        } : r)
      };
    }
    if (g(t.Index) && String(t.Index.kind ?? "").toLowerCase() === "unique") {
      const n = Fn(t.Index);
      return {
        ...e,
        ...n.length > 0 ? {
          uniqueKeys: [
            ...e.uniqueKeys ?? [],
            n
          ]
        } : {},
        columns: e.columns.map((r) => {
          var _a2;
          return n.length === 1 && ((_a2 = n[0]) == null ? void 0 : _a2.toLowerCase()) === r.name.toLowerCase() ? {
            ...r,
            unique: true
          } : r;
        })
      };
    }
    return e;
  }
  function Fn(e) {
    return Array.isArray(e.columns) ? e.columns.map(z).filter((t) => !!t) : [];
  }
  function Xd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = typeof t.sql == "string" ? t.sql : "", s = r.match(/^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i);
    if (s) {
      const o = M(s[1]), c = Qr(s[2], n);
      return {
        ...e,
        columns: e.columns.map((u) => u.name.toLowerCase() === o.toLowerCase() ? {
          ...u,
          ...c ? {
            type: c
          } : {}
        } : u)
      };
    }
    const a = r.match(/^set\s+schema\s+(.+)$/i);
    return a ? {
      ...e,
      schema: M(a[1].trim())
    } : e;
  }
  function Qr(e, t = /* @__PURE__ */ new Map()) {
    const n = e.trim().split(/\s+/)[0];
    if (!n) return;
    const r = pe(M(n));
    return t.get(r.toLowerCase()) ?? r;
  }
  function ef(e, t) {
    if (!g(e) || !g(e.create_table)) return [];
    const n = e.create_table, r = te(n.name);
    if (!r) return [];
    const s = re(n.name);
    if (!n.as_select) {
      const o = tf(n, t), c = Array.isArray(n.columns) ? n.columns.map((u) => Xt(u)).filter((u) => u !== null) : [];
      return o ? [
        {
          name: r,
          ...s ? {
            schema: s
          } : {},
          columns: nf(o, c)
        }
      ] : [];
    }
    const a = Array.isArray(n.columns) ? n.columns : [];
    if (a.length > 0) {
      const o = a.some((c) => g(c) && !!ae(c.data_type));
      return n.as_select && !o ? [
        {
          name: r,
          ...s ? {
            schema: s
          } : {},
          columns: Ce(n.as_select, t, a)
        }
      ] : [
        {
          name: r,
          ...s ? {
            schema: s
          } : {},
          columns: a.map((c) => ({
            name: z(c) ?? "column",
            type: ae(g(c) ? c.data_type : void 0) ?? "unknown",
            nullable: g(c) && typeof c.nullable == "boolean" ? c.nullable : void 0,
            primaryKey: g(c) && c.primary_key === true,
            unique: g(c) && c.unique === true
          }))
        }
      ];
    }
    return [
      {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: Ce(n.as_select, t)
      }
    ];
  }
  function tf(e, t) {
    var _a2, _b2;
    const n = g(e.clone_source) ? e.clone_source : sf(e);
    if (!n) return;
    const r = (_a2 = te(n)) == null ? void 0 : _a2.toLowerCase(), s = (_b2 = re(n)) == null ? void 0 : _b2.toLowerCase();
    if (!r) return;
    const a = t.tables.find((o) => {
      var _a3;
      return !(o.name.toLowerCase() !== r || s && ((_a3 = o.schema) == null ? void 0 : _a3.toLowerCase()) !== s);
    });
    return a ? a.columns.map((o) => ({
      ...o
    })) : void 0;
  }
  function nf(e, t) {
    const n = e.map((r) => ({
      ...r
    }));
    for (const r of t) {
      const s = n.findIndex((a) => a.name.toLowerCase() === r.name.toLowerCase());
      s >= 0 ? n[s] = r : n.push(r);
    }
    return n;
  }
  function rf(e, t) {
    if (!g(e) || !g(e.create_synonym)) return [];
    const n = e.create_synonym, r = te(n.name), s = te(n.target);
    if (!r || !s) return [];
    const a = re(n.name), o = re(n.target), c = t.tables.find((u) => !(u.name.toLowerCase() !== s.toLowerCase() || o && u.schema && u.schema.toLowerCase() !== o.toLowerCase()));
    return c ? [
      {
        name: r,
        ...a ? {
          schema: a
        } : {},
        columns: c.columns.map((u) => ({
          ...u
        })),
        ...c.primaryKey ? {
          primaryKey: [
            ...c.primaryKey
          ]
        } : {},
        ...c.uniqueKeys ? {
          uniqueKeys: c.uniqueKeys.map((u) => [
            ...u
          ])
        } : {},
        ...c.foreignKeys ? {
          foreignKeys: [
            ...c.foreignKeys
          ]
        } : {}
      }
    ] : [];
  }
  function sf(e) {
    if (Array.isArray(e.constraints)) for (const t of e.constraints) {
      const n = g(t) && g(t.Like) ? t.Like : void 0;
      if (n && g(n.source)) return n.source;
    }
  }
  function Gr(e, t, n) {
    try {
      const r = jr(e, n, Nf(t));
      return r.success ? r.ast : void 0;
    } catch {
      return;
    }
  }
  function af(e, t) {
    if (!g(e) || !g(e.create_view)) return [];
    const n = e.create_view, r = te(n.name);
    if (!r) return [];
    const s = re(n.name), a = cf(n), o = Ce(n.query, t, a);
    return [
      {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: o
      }
    ];
  }
  function Mn(e, t, n) {
    return ss(e, "view").flatMap((r) => {
      const s = Q(r.valuesSql, n);
      if (!s.success || !Array.isArray(s.ast)) return [];
      const a = s.ast.find(g);
      if (!a) return [];
      const o = M(r.name), c = o.split("."), u = c.pop() ?? o, l = c.length > 0 ? c.join(".") : void 0;
      return [
        {
          name: u,
          ...l ? {
            schema: l
          } : {},
          columns: Ce(a, t, r.columns)
        }
      ];
    });
  }
  function On(e, t, n) {
    return ss(e, "table").flatMap((r) => {
      const s = Q(r.valuesSql, n);
      if (!s.success || !Array.isArray(s.ast)) return [];
      const a = s.ast.find(g);
      if (!a) return [];
      const o = M(r.name), c = o.split("."), u = c.pop() ?? o, l = c.length > 0 ? c.join(".") : void 0;
      return [
        {
          name: u,
          ...l ? {
            schema: l
          } : {},
          columns: Ce(a, t, r.columns)
        }
      ];
    });
  }
  function Zr(e) {
    return e.filter((t, n) => !e.slice(0, n).some((r) => as(r, t)));
  }
  function Ce(e, t, n = []) {
    const r = {
      tables: yf(e, t)
    }, s = {
      tables: df(e, V(r, t))
    }, a = V(s, r, t), o = _t(e), c = Fe(e), u = ut(e), l = lf(c);
    return o.flatMap((m, y) => {
      const w = g(m) ? m.star : void 0;
      if (g(w)) return of(uf(w, a, u, c, l), n, y);
      const L = M(tn(n[y]) ?? wf(m, y + 1)), $ = hf(m);
      return [
        {
          name: L,
          type: _f($, a) ?? ke($, a, u) ?? "unknown",
          nullable: If($, a, u, l)
        }
      ];
    });
  }
  function of(e, t, n = 0) {
    return t.length === 0 ? e : e.map((r, s) => ({
      ...r,
      name: M(tn(t[n + s]) ?? r.name)
    }));
  }
  function cf(e) {
    return Array.isArray(e.columns) && e.columns.length > 0 ? e.columns : g(e.schema) && Array.isArray(e.schema.expressions) ? e.schema.expressions : [];
  }
  function tn(e) {
    return g(e) && g(e.column_def) ? tn(e.column_def) : g(e) ? z(e.name) ?? z(e) : z(e);
  }
  function _f(e, t) {
    var _a2, _b2;
    const n = Xr(e);
    if (!n) return;
    const r = typeof n.name == "string" ? n.name : z(n.name);
    if (!r) return;
    const s = r.toLowerCase();
    return (_b2 = (_a2 = t.functions) == null ? void 0 : _a2.find((a) => a.name.toLowerCase() === s ? true : a.schema ? `${a.schema}.${a.name}`.toLowerCase() === s : false)) == null ? void 0 : _b2.returnType;
  }
  function Xr(e) {
    if (g(e)) {
      if (g(e.function)) return e.function;
      for (const t of Object.values(e)) {
        const n = Xr(t);
        if (n) return n;
      }
    }
  }
  function uf(e, t, n, r, s = /* @__PURE__ */ new Set()) {
    var _a2;
    const a = (_a2 = z(e.table)) == null ? void 0 : _a2.toLowerCase(), o = a ? /* @__PURE__ */ new Map() : mf(r, t);
    return t.tables.filter((u) => a ? u.name.toLowerCase() === a : n.length === 0 ? true : n.map((l) => l.toLowerCase()).includes(u.name.toLowerCase())).flatMap((u) => u.columns.filter((l) => {
      var _a3;
      return !((_a3 = o.get(u.name.toLowerCase())) == null ? void 0 : _a3.has(l.name.toLowerCase()));
    }).map((l) => ({
      ...l,
      nullable: s.has(u.name.toLowerCase()) ? true : l.nullable
    })));
  }
  function lf(e) {
    const t = /* @__PURE__ */ new Set();
    if (!e || !Array.isArray(e.joins)) return t;
    const n = ht({
      ...e,
      joins: []
    }).map(We).filter((r) => !!r);
    for (const r of e.joins) {
      if (!g(r) || !g(r.this)) continue;
      const s = String(r.kind ?? ""), a = We(r.this);
      if ((s === "Left" || s === "Full") && a && t.add(a.toLowerCase()), s === "Right" || s === "Full") for (const o of n) t.add(o.toLowerCase());
    }
    return t;
  }
  function mf(e, t) {
    var _a2;
    const n = /* @__PURE__ */ new Map();
    if (!e || !Array.isArray(e.joins)) return n;
    const r = ht({
      ...e,
      joins: []
    }).map(We).filter((a) => !!a), s = new Set(t.tables.filter((a) => r.map((o) => o.toLowerCase()).includes(a.name.toLowerCase())).flatMap((a) => a.columns.map((o) => o.name.toLowerCase())));
    for (const a of e.joins) {
      if (!g(a) || !g(a.this)) continue;
      const o = We(a.this);
      if (!o) continue;
      const c = Array.isArray(a.using) ? a.using.map(z).filter((m) => !!m) : [], u = a.kind === "Natural" ? ((_a2 = t.tables.find((m) => m.name.toLowerCase() === o.toLowerCase())) == null ? void 0 : _a2.columns.map((m) => m.name).filter((m) => s.has(m.toLowerCase()))) ?? [] : [], l = [
        ...c,
        ...u
      ].map((m) => m.toLowerCase());
      l.length > 0 && n.set(o.toLowerCase(), new Set(l));
    }
    return n;
  }
  function df(e, t) {
    const n = Fe(e);
    return ht(n).flatMap((s) => ff(s, t));
  }
  function ht(e) {
    if (!e) return [];
    const t = g(e.from) && Array.isArray(e.from.expressions) ? e.from.expressions : [], n = Array.isArray(e.joins) ? e.joins.flatMap((r) => g(r) && g(r.this) ? [
      r.this
    ] : []) : [];
    return [
      ...t,
      ...n
    ].filter(g);
  }
  function ff(e, t) {
    const n = g(e.subquery) ? e.subquery : void 0;
    if (n) {
      const s = z(n.alias);
      if (!s) return [];
      const a = Array.isArray(n.column_aliases) ? n.column_aliases : [];
      return [
        {
          name: s,
          columns: Ce(n.this, t, a)
        }
      ];
    }
    const r = g(e.alias) ? e.alias : void 0;
    if (r && g(r.this) && g(r.this.function)) {
      const s = z(r.alias);
      if (!s) return [];
      const a = pf(r.this, s);
      if (a) return [
        a
      ];
      const o = Array.isArray(r.column_aliases) ? r.column_aliases.map(z).filter((u) => !!u) : [];
      if (o.length === 0) return [];
      const c = gf(r.this, t);
      return [
        {
          name: s,
          columns: o.map((u, l) => ({
            name: u,
            type: c[l] ?? c[0] ?? "unknown"
          }))
        }
      ];
    }
    return [];
  }
  function pf(e, t) {
    const n = g(e) ? e.function : void 0;
    if (!g(n)) return;
    const r = String(n.name ?? "").toLowerCase();
    if (r === "json_each" || r === "json_tree") return {
      name: t,
      columns: [
        {
          name: "key",
          type: "text"
        },
        {
          name: "value",
          type: "json"
        },
        {
          name: "type",
          type: "text"
        },
        {
          name: "atom",
          type: "json"
        },
        {
          name: "id",
          type: "integer"
        },
        {
          name: "parent",
          type: "integer"
        },
        {
          name: "fullkey",
          type: "text"
        },
        {
          name: "path",
          type: "text"
        }
      ]
    };
  }
  function gf(e, t) {
    const n = g(e) ? e.function : void 0;
    if (!g(n)) return [];
    const r = String(n.name ?? "").toLowerCase();
    if (r === "generate_series" || r === "range") {
      const s = bf(es(n), t);
      return s && /date|time|timestamp/i.test(s) ? [
        s
      ] : [
        "integer"
      ];
    }
    return [];
  }
  function es(e) {
    return Array.isArray(e.args) ? e.args : [];
  }
  function bf(e, t) {
    const n = e.map((r) => ke(r, t, [])).filter((r) => !!r);
    if (n.length !== 0) return n.some((r) => /text|char|string/i.test(r)) ? "text" : n.some((r) => /timestamp/i.test(r)) ? "timestamp" : n.some((r) => /^date$/i.test(r)) ? "date" : n.some((r) => /decimal|numeric|double|float|real/i.test(r)) ? "decimal" : n.some((r) => /int|number|bigint|smallint/i.test(r)) ? "integer" : n[0];
  }
  function ke(e, t, n) {
    return vf(e) ?? xf(e) ?? qf(e, t, n) ?? Af(e) ?? ts(e, t, n) ?? Tf(e, t, n) ?? jf(e, t, n) ?? Sf(e, t, n) ?? Lf(e, t, n) ?? kf(e, t, n);
  }
  function yf(e, t) {
    const n = Fe(e), r = g(n == null ? void 0 : n.with) && Array.isArray(n.with.ctes) ? n.with.ctes : [], s = [];
    for (const a of r) {
      if (!g(a)) continue;
      const o = z(a.alias);
      if (!o) continue;
      const c = V({
        tables: s
      }, t);
      s.push({
        name: o,
        columns: Ce(a.this, c, Array.isArray(a.columns) ? a.columns : [])
      });
    }
    return s;
  }
  function Fe(e) {
    return g(e) && g(e.union) ? Fe(e.union.left) : g(e) && g(e.intersect) ? Fe(e.intersect.left) : g(e) && g(e.except) ? Fe(e.except.left) : g(e) && g(e.select) ? e.select : void 0;
  }
  function _t(e) {
    if (g(e) && g(e.union)) return _t(e.union.left);
    if (g(e) && g(e.intersect)) return _t(e.intersect.left);
    if (g(e) && g(e.except)) return _t(e.except.left);
    if (g(e) && g(e.values)) {
      const r = (Array.isArray(e.values.expressions) ? e.values.expressions : []).find(g);
      return g(r) && Array.isArray(r.expressions) ? r.expressions : [];
    }
    const t = g(e) ? e.select : void 0;
    return g(t) && Array.isArray(t.expressions) ? t.expressions : [];
  }
  function ut(e) {
    if (g(e) && g(e.union)) return ut(e.union.left);
    if (g(e) && g(e.intersect)) return ut(e.intersect.left);
    if (g(e) && g(e.except)) return ut(e.except.left);
    const t = g(e) ? e.select : void 0;
    return ht(g(t) ? t : void 0).map(We).filter((n) => !!n);
  }
  function We(e) {
    if (g(e.table)) return te(e.table);
    if (g(e.subquery)) return z(e.subquery.alias);
    if (g(e.alias)) return z(e.alias.alias);
  }
  function wf(e, t) {
    const n = g(e) ? e.alias : void 0;
    if (g(n)) return z(n.alias) ?? `column_${t}`;
    const r = g(e) ? e.column : void 0;
    return g(r) ? z(r.name) ?? `column_${t}` : `column_${t}`;
  }
  function hf(e) {
    const t = g(e) ? e.alias : void 0;
    return g(t) && g(t.this) ? t.this : g(e) && g(e.this) && g(e.alias) ? e.this : e;
  }
  function xf(e) {
    try {
      const t = Yt.getInferredType(e);
      if (!g(t)) return;
      const n = t.data_type ?? t.type ?? t.name;
      return typeof n == "string" ? pe(n) : void 0;
    } catch {
      return;
    }
  }
  function vf(e) {
    const t = g(e) ? e.cast ?? e.try_cast ?? e.safe_cast : void 0;
    return g(t) ? ae(t.to) : void 0;
  }
  function ae(e) {
    if (!g(e)) return;
    if (e.data_type === "nullable" || e.data_type === "low_cardinality") return ae(e.inner) ?? ae(e.value) ?? "unknown";
    if (e.data_type === "struct" && Array.isArray(e.fields)) return `struct<${e.fields.flatMap((r) => {
      if (!g(r)) return [];
      const s = z(r.name), a = ae(r.data_type) ?? "unknown";
      return s ? [
        `${s} ${a}`
      ] : [];
    }).join(", ")}>`;
    if (e.data_type === "array") return `array<${ae(e.element_type) ?? "unknown"}>`;
    if (e.data_type === "map") return `map<${ae(e.key_type) ?? "unknown"}, ${ae(e.value_type) ?? "unknown"}>`;
    const t = e.data_type === "custom" && typeof e.name == "string" ? e.name : e.data_type ?? e.type ?? e.name;
    return typeof t == "string" ? pe(t) : void 0;
  }
  function nn(e, t) {
    const n = ae(e);
    if (n) return t.get(n.toLowerCase()) ?? n;
  }
  function pe(e) {
    const t = e.trim().toLowerCase().replace(/\s+/g, " "), n = Cf(t);
    if (n) return n;
    const r = t.replace(/\s*\([^)]*\)/g, ""), s = r.replace(/\s+/g, "");
    return s === "serial" || s === "serial4" ? "integer" : s === "bigserial" || s === "serial8" ? "bigint" : s === "smallserial" || s === "serial2" || [
      "int",
      "int2",
      "int4",
      "int16",
      "int32",
      "integer",
      "smallint",
      "tinyint",
      "small_int",
      "tiny_int",
      "uint8",
      "uint16",
      "uint32"
    ].includes(s) ? "integer" : [
      "int8",
      "int64",
      "bigint",
      "big_int",
      "uint64"
    ].includes(s) ? "bigint" : [
      "decimal",
      "dec",
      "numeric",
      "number"
    ].includes(s) || [
      "float",
      "float4",
      "float8",
      "double",
      "doubleprecision",
      "real"
    ].includes(s) ? "decimal" : [
      "bool",
      "boolean",
      "bit"
    ].includes(s) ? "boolean" : [
      "char",
      "nchar",
      "varchar",
      "varchar2",
      "var_char",
      "nvarchar",
      "nvarchar2",
      "nvar_char",
      "character",
      "string",
      "text",
      "clob"
    ].includes(s) ? "text" : [
      "binary",
      "varbinary",
      "bytea",
      "bytes",
      "blob"
    ].includes(s) ? "bytes" : s === "json_b" ? "jsonb" : s === "datetime2" ? "datetime" : s === "timestampntz" || s === "timestampltz" || s === "timestamptz" || s.startsWith("timestamp") ? "timestamp" : s === "array" ? "array<variant>" : s === "uniqueidentifier" ? "uuid" : [
      "variant",
      "object",
      "json",
      "jsonb",
      "date",
      "time",
      "datetime",
      "interval",
      "uuid",
      "geography",
      "geometry"
    ].includes(s) ? s : r;
  }
  function Cf(e) {
    const t = /^([a-z_][\w\s]*)\s*\(([\s\S]*)\)$/i.exec(e.trim());
    if (!t) return;
    const n = t[1].replace(/\s+/g, "").toLowerCase(), r = se(t[2], ",");
    if (n === "nullable" || n === "lowcardinality") return r[0] ? pe(r[0]) : "unknown";
    if (n === "array" || n === "list") return `array<${r[0] ? pe(r[0]) : "unknown"}>`;
    if (n === "map" && r.length >= 2) return `map<${pe(r[0])}, ${pe(r[1])}>`;
    if (n === "tuple" || n === "row") return `struct<${r.map((a, o) => {
      const c = Dn(a, o);
      return `${c.name} ${c.type}`;
    }).join(", ")}>`;
    if (n === "nested") return `array<struct<${r.map((a, o) => {
      const c = Dn(a, o);
      return `${c.name} ${c.type}`;
    }).join(", ")}>>`;
  }
  function Dn(e, t) {
    const n = e.trim(), r = /^("[^"]+"|`[^`]+`|\[[^\]]+\]|[a-z_][\w$]*)\s+([\s\S]+)$/i.exec(n);
    return r ? {
      name: M(r[1]),
      type: pe(r[2])
    } : {
      name: `field_${t + 1}`,
      type: pe(n)
    };
  }
  function Af(e) {
    if (g(e) && g(e.boolean)) return "boolean";
    const t = g(e) ? e.literal : void 0;
    if (!g(t)) return;
    const n = String(t.literal_type ?? ""), r = String(t.value ?? "");
    if (n === "string") return "text";
    if (n === "number") return r.includes(".") ? "decimal" : "integer";
    if (n === "boolean") return "boolean";
  }
  function Sf(e, t, n) {
    const r = g(e) ? e.coalesce : void 0;
    if (!(!g(r) || !Array.isArray(r.expressions))) return rn(r.expressions, t, n);
  }
  function Lf(e, t, n) {
    const r = g(e) ? e.case : void 0;
    if (!g(r)) return;
    const s = Array.isArray(r.whens) ? r.whens.flatMap((a) => Array.isArray(a) ? a[1] : []) : [];
    return rn([
      ...s,
      r.else_
    ].filter(Boolean), t, n);
  }
  function kf(e, t, n) {
    if (g(e)) {
      for (const r of [
        "add",
        "sub",
        "mul",
        "div",
        "mod"
      ]) {
        const s = e[r];
        if (!g(s)) continue;
        const a = ke(s.left, t, n), o = ke(s.right, t, n);
        return ns([
          a,
          o
        ].filter((c) => !!c));
      }
      for (const r of [
        "eq",
        "neq",
        "lt",
        "lte",
        "gt",
        "gte",
        "like",
        "is",
        "in",
        "between"
      ]) if (g(e[r])) return "boolean";
    }
  }
  function ts(e, t, n) {
    if (g(e)) {
      if (g(e.count)) return "integer";
      for (const r of [
        "sum",
        "min",
        "max",
        "median"
      ]) {
        const s = e[r];
        if (g(s)) return ke(s.this, t, n);
      }
      if (g(e.avg)) return "decimal";
    }
  }
  function Tf(e, t, n) {
    const r = g(e) ? e.window_function : void 0, s = g(r) ? r.this : void 0;
    if (!g(s)) return;
    if (Object.prototype.hasOwnProperty.call(s, "row_number") || Object.prototype.hasOwnProperty.call(s, "rank") || Object.prototype.hasOwnProperty.call(s, "dense_rank")) return "integer";
    const a = s.first_value ?? s.last_value ?? s.lag ?? s.lead;
    return a ? ke(a, t, n) : ts(s, t, n);
  }
  function jf(e, t, n) {
    if (!g(e)) return;
    for (const [a, o] of [
      [
        "lower",
        "text"
      ],
      [
        "upper",
        "text"
      ],
      [
        "trim",
        "text"
      ],
      [
        "substring",
        "text"
      ],
      [
        "concat",
        "text"
      ],
      [
        "length",
        "integer"
      ],
      [
        "abs",
        void 0
      ],
      [
        "round",
        void 0
      ]
    ]) {
      const c = e[a];
      if (g(c)) return o ?? ke(c.this, t, n);
    }
    const r = e.function;
    if (!g(r)) return;
    const s = String(r.name ?? "").toLowerCase();
    if ([
      "lower",
      "upper",
      "trim",
      "substring",
      "concat",
      "concat_ws",
      "replace",
      "reverse",
      "initcap"
    ].includes(s)) return "text";
    if ([
      "length",
      "char_length",
      "character_length",
      "octet_length",
      "bit_length"
    ].includes(s)) return "integer";
    if ([
      "abs",
      "round",
      "ceil",
      "ceiling",
      "floor"
    ].includes(s)) return rn(es(r), t, n);
  }
  function rn(e, t, n) {
    return ns(e.map((r) => ke(r, t, n)).filter((r) => !!r));
  }
  function ns(e) {
    if (e.length !== 0) return e.some((t) => /text|char|string/i.test(t)) ? "text" : e.some((t) => /timestamp/i.test(t)) ? "timestamp" : e.some((t) => /^date$/i.test(t)) ? "date" : e.some((t) => /decimal|numeric|double|float|real/i.test(t)) ? "decimal" : e.some((t) => /bigint/i.test(t)) ? "bigint" : e.some((t) => /int|number|smallint/i.test(t)) ? "integer" : e.every((t) => t === "boolean") ? "boolean" : e[0];
  }
  function qf(e, t, n) {
    var _a2;
    return (_a2 = rs(e, t, n)) == null ? void 0 : _a2.column.type;
  }
  function If(e, t, n, r = /* @__PURE__ */ new Set()) {
    const s = rs(e, t, n);
    if (s) return r.has(s.table.name.toLowerCase()) ? true : s.column.nullable;
  }
  function rs(e, t, n) {
    var _a2, _b2;
    const r = g(e) ? e.column : void 0;
    if (!g(r)) return;
    const s = (_a2 = z(r.name)) == null ? void 0 : _a2.toLowerCase(), a = (_b2 = z(r.table)) == null ? void 0 : _b2.toLowerCase();
    if (s) for (const o of t.tables) {
      if (a && o.name.toLowerCase() !== a || !a && n.length > 0 && !n.map((u) => u.toLowerCase()).includes(o.name.toLowerCase())) continue;
      const c = o.columns.find((u) => u.name.toLowerCase() === s);
      if (c) return {
        table: o,
        column: c
      };
    }
  }
  function te(e) {
    if (!g(e)) return;
    const t = g(e.name) ? e.name.name : e.name;
    return typeof t == "string" ? M(t) : void 0;
  }
  function re(e) {
    if (g(e)) return z(e.schema);
  }
  function z(e) {
    if (e) {
      if (typeof e == "string") return M(e);
      if (g(e) && typeof e.name == "string") return M(e.name);
      if (g(e) && g(e.name)) return z(e.name);
    }
  }
  function g(e) {
    return typeof e == "object" && e !== null;
  }
  function Nf(e) {
    return {
      tables: e.tables.map((t) => ({
        ...t,
        columns: t.columns.map((n) => ({
          ...n,
          type: n.type
        }))
      }))
    };
  }
  function $f(e) {
    const t = [], n = /create\s+(?:(?:global\s+)?temporary\s+|(?:global\s+)?temp\s+)?table\s+(?:if\s+not\s+exists\s+)?([`"[\]\w.]+)\s*\(/gi;
    for (const r of e.matchAll(n)) {
      const s = (r.index ?? 0) + r[0].length, a = Ef(e, s - 1);
      a > s && t.push({
        name: r[1],
        body: e.slice(s, a)
      });
    }
    return t;
  }
  function ss(e, t) {
    var _a2;
    const n = [], r = new RegExp(`create\\s+(?:(?:or\\s+replace|temporary|temp)\\s+)*${t}\\s+(?:if\\s+not\\s+exists\\s+)?([\`"\\[\\]\\w.]+)\\s*(?:\\(([^)]*)\\))?\\s+as\\s+(values\\s+(?:[^;'"\\\`]|'[^']*'|"[^"]*"|\`[^\`]*\`)+)(?=;|$)`, "gi");
    for (const s of e.matchAll(r)) {
      const a = (_a2 = s[3]) == null ? void 0 : _a2.trim();
      a && n.push({
        name: s[1] ?? "",
        columns: se(s[2] ?? "", ",").map((o) => ({
          name: M(o)
        })).filter((o) => !!o.name),
        valuesSql: a
      });
    }
    return n;
  }
  function Ef(e, t) {
    let n = 0, r = null;
    for (let s = t; s < e.length; s += 1) {
      const a = e[s];
      if (r) {
        a === r && e[s - 1] !== "\\" && (r = null);
        continue;
      }
      if (a === "'" || a === '"' || a === "`") {
        r = a;
        continue;
      }
      if (a === "(" && (n += 1), a === ")" && (n -= 1, n === 0)) return s;
    }
    return -1;
  }
  function Rf(e) {
    return se(e, ",").map((t) => t.trim()).filter(Boolean).filter((t) => !Xm.test(t)).map(Ff).filter((t) => t !== null);
  }
  function Ff(e) {
    const t = e.match(/^\s*("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/s);
    if (!t) return null;
    const n = M(t[1]), r = t[2].trim(), s = Mf(r);
    return s ? {
      name: n,
      type: pe(s),
      nullable: !/\bnot\s+null\b/i.test(r) && !/\bprimary\s+key\b/i.test(r),
      primaryKey: /\bprimary\s+key\b/i.test(r),
      unique: /\bunique\b/i.test(r)
    } : null;
  }
  function Mf(e) {
    const t = e.search(/\s+(?:constraint|not\s+null|null|primary\s+key|unique|references|default|check|collate|generated)\b/i);
    return (t >= 0 ? e.slice(0, t) : e).trim();
  }
  function M(e) {
    return e.trim().replace(/^\[/, "").replace(/\]$/, "").replace(/^["`]/, "").replace(/["`]$/, "");
  }
  function se(e, t) {
    const n = [];
    let r = 0, s = 0, a = null;
    for (let o = 0; o < e.length; o += 1) {
      const c = e[o];
      if (a) {
        c === a && e[o - 1] !== "\\" && (a = null);
        continue;
      }
      if (c === "'" || c === '"' || c === "`") {
        a = c;
        continue;
      }
      c === "(" && (s += 1), c === ")" && (s = Math.max(0, s - 1)), s === 0 && c === t && (n.push(e.slice(r, o)), r = o + 1);
    }
    return n.push(e.slice(r)), n;
  }
  function V(...e) {
    const t = e.flatMap((r) => (r == null ? void 0 : r.functions) ?? []), n = e.flatMap((r) => (r == null ? void 0 : r.procedures) ?? []);
    return {
      tables: e.flatMap((r) => (r == null ? void 0 : r.tables) ?? []),
      ...t.length > 0 ? {
        functions: t
      } : {},
      ...n.length > 0 ? {
        procedures: n
      } : {}
    };
  }
  function as(e, t) {
    return e.name.toLowerCase() !== t.name.toLowerCase() ? false : (e.schema ?? "").toLowerCase() === (t.schema ?? "").toLowerCase();
  }
  async function Of(e) {
    var _a2, _b2, _c2;
    const t = qr(e.dialect), n = e.jdbc ? Im(e.sql, t) : e.sql, r = typeof e.binds == "string" || e.binds === void 0 ? Qs(e.binds) : e.binds, s = e.jdbc ? Nm(r, t) : r, a = ((_a2 = e.schemaFiles) == null ? void 0 : _a2.length) ? await Mr(e.schemaFiles, {
      dialect: t
    }) : ((_b2 = e.schemaPatterns) == null ? void 0 : _b2.length) ? await td(e.schemaPatterns, {
      cwd: e.cwd,
      dialect: t
    }) : {
      tables: []
    }, o = V(e.schema, a), c = V(o, Jf()), u = [], l = [], m = Q(n, t), y = Vf(n), w = !m.success && y !== n ? Q(y, t) : void 0;
    if (!m.success && !(w == null ? void 0 : w.success)) throw new Error(m.error ?? "Failed to parse SQL.");
    const L = m.success ? m.ast : w == null ? void 0 : w.ast, $ = m.success ? n : y, S = m.success ? Kf($, t, c) ?? L : L;
    if (o.tables.length > 0 && m.success) {
      const H = Sm(n, Ys(c), t, {
        checkTypes: true,
        checkReferences: true,
        semantic: true
      });
      H.errors && l.push(...H.errors.map((le) => Xn(le))), H.warnings && l.push(...H.warnings.map((le) => Xn(le, "warning")));
    }
    const T = pp(S, c, t).map((H, le) => ({
      index: le + 1,
      columns: Df(H, c, s, t, u)
    })).filter((H) => H.columns.length > 0), C = gp(S, T), k = bp(C, T.length === 0);
    u.push(...k.map((H) => H.message)), l.push(...k);
    const D = ((_c2 = T[0]) == null ? void 0 : _c2.columns) ?? [], K = T.flatMap((H) => H.columns);
    let I = kp(l, K);
    return I = Ep(I, S, t), I = Rp(I, S), I = $p(I, S, c), I = jp(I, S), I = qp(I, S), I = Ip(I, S, c), I = Np(I, S, t), I = Up(I, K), I = Kp(I, K), I = Yp(I, S, c), I = Qp(I, S), I = Vp(I, T), I = Wp(I, S, c), I = Hp(I, S), I = Jp(I, c), I = sg(I, S, T), I = ig(I, T), I = og(I, C), I = ag(I, S, T), I = cg(I, C), I = Tp(I, T), {
      columns: D,
      resultSets: T,
      statements: C,
      warnings: Oy(u),
      diagnostics: I,
      binds: s,
      schema: o
    };
  }
  function Df(e, t, n, r, s) {
    return e.map((a, o) => {
      const c = a.name === null ? null : a.name ?? je(a.expression, o + 1), u = c ?? `column_${o + 1}`, l = E(a.expression, u, a.schema ?? t, n, r, a.source, a.tableAliases, a.functionReturnTypes);
      return l.type === "unknown" && l.note && s.push(l.note), {
        index: o + 1,
        name: c,
        ...l
      };
    });
  }
  function E(e, t, n, r, s, a, o, c) {
    const u = d(e, "collation");
    if (_(u) && _(u.this)) return E(u.this, t, n, r, s, a, o, c);
    const l = zf(e, s);
    if (l) return {
      type: l,
      confidence: "medium",
      source: "expression"
    };
    const m = _s(e, n, r);
    if (m) return {
      type: m,
      confidence: "medium",
      source: "expression"
    };
    const y = gs(e, n, o);
    if (y) return {
      type: y.type,
      nullable: y.nullable,
      confidence: "medium",
      source: y.source
    };
    const w = is(e);
    if (w) return {
      type: w,
      confidence: "medium",
      source: "expression"
    };
    const L = Qf(e, n, r);
    if (L) return {
      type: L,
      confidence: "medium",
      source: "expression"
    };
    const $ = Gf(e);
    if ($) return {
      type: $,
      confidence: "medium",
      source: "expression"
    };
    const S = Zf(e);
    if (S) return {
      type: S,
      confidence: "medium",
      source: "expression"
    };
    const T = an(e, n, r, o);
    if (T) return {
      type: T,
      confidence: "medium",
      source: "expression"
    };
    const C = fs(e, n, o);
    if (C) return {
      type: C.column.type,
      nullable: C.nullable,
      confidence: "high",
      source: Ct(C.table, C.column.name)
    };
    const k = sp(e, r);
    if (k) return {
      type: k,
      confidence: "medium",
      source: "expression"
    };
    const D = cs(e, n, r);
    if (D) return {
      type: D,
      confidence: "medium",
      source: "expression"
    };
    const K = Bf(e);
    if (K) return {
      type: K,
      confidence: "medium",
      source: "expression"
    };
    const I = Pf(e, c);
    if (I) return {
      type: I,
      confidence: "medium",
      source: "function"
    };
    const H = Y(Yt.getInferredType(e));
    if (H) return {
      type: H,
      confidence: "high",
      source: "polyglot"
    };
    const le = ip(e);
    if (le) return {
      type: le,
      confidence: "high",
      source: "cast"
    };
    const st = cp(e);
    if (st) return {
      type: st,
      confidence: "high",
      source: "literal"
    };
    const bn = ds(e, r);
    if (bn) return {
      type: bn,
      confidence: "medium",
      source: "bind"
    };
    const yn = fp(e, r);
    if (yn) return {
      type: yn,
      confidence: "medium",
      source: "bind"
    };
    const at = _p(e, n, o);
    if (at) return {
      type: at.type,
      nullable: at.nullable,
      confidence: "medium",
      source: at.source
    };
    const At = Hf(e, n, o);
    if (At) return {
      type: At.type,
      confidence: "medium",
      source: At.source
    };
    const wn = sn(e, n, r, o);
    return wn ? {
      type: wn,
      confidence: "medium",
      source: "expression"
    } : a ? {
      type: "unknown",
      confidence: "low",
      source: a,
      note: `Could not infer type for result column "${t}".`
    } : {
      type: "unknown",
      confidence: "low",
      note: `Could not infer type for result column "${t}".`
    };
  }
  function zf(e, t) {
    var _a2, _b2, _c2, _d2;
    const n = d(e, "parameter");
    if (_(n) && String(n.style ?? "").toLowerCase() === "doubleat") {
      const a = String(n.name ?? "").toLowerCase();
      if ([
        "spid",
        "rowcount",
        "fetch_status",
        "nestlevel",
        "trancount"
      ].includes(a) || a === "identity") return "integer";
      if ([
        "servername",
        "servicename",
        "version",
        "language",
        "lock_timeout"
      ].includes(a)) return "text";
    }
    const r = d(e, "column");
    if (_(r) && !h(r.table)) {
      const a = (_a2 = h(r.name)) == null ? void 0 : _a2.toLowerCase();
      if (a === "current_date") return "date";
      if (a === "current_time") return "time";
      if (a === "current_timestamp" || a === "localtimestamp") return "timestamp";
      if (t === "oracle" && [
        "connect_by_iscycle",
        "connect_by_isleaf"
      ].includes(a ?? "")) return "integer";
    }
    if (t === "oracle" && _(r) && !h(r.table) && ((_b2 = h(r.name)) == null ? void 0 : _b2.toLowerCase()) === "user") return "text";
    if (t === "oracle" && _(r) && [
      "nextval",
      "currval"
    ].includes(((_c2 = h(r.name)) == null ? void 0 : _c2.toLowerCase()) ?? "")) return "integer";
    const s = d(e, "pseudocolumn");
    if (t === "oracle" && _(s)) {
      const a = String(s.kind ?? "").toLowerCase();
      if (a === "rowid") return "text";
      if ([
        "level",
        "rownum"
      ].includes(a)) return "integer";
    }
    if (t === "sqlite" && _(r) && [
      "rowid",
      "_rowid_",
      "oid"
    ].includes(((_d2 = h(r.name)) == null ? void 0 : _d2.toLowerCase()) ?? "")) return "integer";
  }
  function Bf(e) {
    const t = d(e, "function");
    if (!_(t)) return;
    const n = String(t.name ?? "").toLowerCase();
    return [
      "nextval",
      "currval",
      "lastval",
      "setval"
    ].includes(n) ? "bigint" : void 0;
  }
  function Pf(e, t) {
    var _a2;
    if (!t || t.size === 0) return;
    const n = d(e, "function");
    if (_(n)) {
      const c = String(n.name ?? "").toLowerCase();
      return t.get(c) ?? t.get(fn(n));
    }
    const r = d(e, "method_call");
    if (!_(r)) return;
    const s = (_a2 = h(r.method)) == null ? void 0 : _a2.toLowerCase();
    if (!s) return;
    const a = _(r.this) ? Uf(r.this) : void 0, o = a ? `${a.toLowerCase()}.${s}` : void 0;
    return (o ? t.get(o) : void 0) ?? t.get(s);
  }
  function Uf(e) {
    const t = d(e, "column");
    return _(t) ? h(t.name) : void 0;
  }
  function Kf(e, t, n) {
    try {
      const r = jr(e, t, Ys(n));
      return r.success ? r.ast : void 0;
    } catch {
      return;
    }
  }
  function Vf(e) {
    return e.replace(/create\s+((?:(?:or\s+replace|temporary|temp)\s+)*(?:table|view)\s+(?:if\s+not\s+exists\s+)?[`"\[\]\w.]+\s*(?:\(([^)]*)\))?\s+as\s+)values\s+((?:[^;'"`]|'[^']*'|"[^"]*"|`[^`]*`)+)(?=;|$)/gi, (t, n, r, s) => {
      const a = se(r ?? "", ",").map(M).filter(Boolean);
      return a.length === 0 ? t : `create ${n}select * from (values ${s}) as sqldesc_values(${a.join(", ")})`;
    });
  }
  function Jf() {
    const e = (a) => ({
      name: a,
      type: "text"
    }), t = (a) => ({
      name: a,
      type: "integer"
    }), n = (a) => ({
      name: a,
      type: "decimal"
    }), r = (a) => ({
      name: a,
      type: "boolean"
    }), s = (a) => ({
      name: a,
      type: "timestamp"
    });
    return {
      tables: [
        {
          schema: "information_schema",
          name: "tables",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("name"),
            e("table_type"),
            e("self_referencing_column_name"),
            e("reference_generation"),
            e("user_defined_type_catalog"),
            e("user_defined_type_schema"),
            e("user_defined_type_name"),
            r("is_insertable_into"),
            r("is_typed"),
            e("commit_action"),
            s("created"),
            s("last_altered"),
            t("row_count"),
            t("bytes"),
            e("owner"),
            e("retention_time"),
            r("is_transient"),
            r("is_temporary")
          ]
        },
        {
          schema: "information_schema",
          name: "columns",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("column_name"),
            t("ordinal_position"),
            e("column_default"),
            r("is_nullable"),
            e("data_type"),
            t("character_maximum_length"),
            t("character_octet_length"),
            t("numeric_precision"),
            t("numeric_precision_radix"),
            t("numeric_scale"),
            t("datetime_precision"),
            e("interval_type"),
            t("interval_precision"),
            e("character_set_catalog"),
            e("character_set_schema"),
            e("character_set_name"),
            e("collation_catalog"),
            e("collation_schema"),
            e("collation_name"),
            e("domain_catalog"),
            e("domain_schema"),
            e("domain_name"),
            e("udt_catalog"),
            e("udt_schema"),
            e("udt_name"),
            e("scope_catalog"),
            e("scope_schema"),
            e("scope_name"),
            t("maximum_cardinality"),
            e("dtd_identifier"),
            r("is_self_referencing"),
            r("is_identity"),
            e("identity_generation"),
            e("identity_start"),
            e("identity_increment"),
            e("identity_maximum"),
            e("identity_minimum"),
            r("identity_cycle"),
            r("is_generated"),
            e("generation_expression"),
            r("is_updatable")
          ]
        },
        {
          schema: "information_schema",
          name: "schemata",
          columns: [
            e("project_id"),
            e("project_number"),
            e("catalog_name"),
            e("schema_name"),
            e("schema_owner"),
            e("default_character_set_catalog"),
            e("default_character_set_schema"),
            e("default_character_set_name"),
            e("sql_path")
          ]
        },
        {
          name: "information_schema.schemata",
          columns: [
            e("project_id"),
            e("project_number"),
            e("catalog_name"),
            e("schema_name"),
            e("schema_owner"),
            e("default_character_set_catalog"),
            e("default_character_set_schema"),
            e("default_character_set_name"),
            e("sql_path")
          ]
        },
        {
          name: "information_schema.tables",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("table_type"),
            s("creation_time"),
            s("ddl")
          ]
        },
        {
          name: "information_schema.columns",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("column_name"),
            t("ordinal_position"),
            r("is_nullable"),
            e("data_type")
          ]
        },
        {
          name: "information_schema.routines",
          columns: [
            e("specific_catalog"),
            e("specific_schema"),
            e("specific_name"),
            e("routine_catalog"),
            e("routine_schema"),
            e("routine_name"),
            e("routine_type"),
            e("data_type")
          ]
        },
        {
          name: "information_schema.datasets",
          columns: [
            e("project_id"),
            e("dataset_id"),
            e("schema_name"),
            e("location"),
            s("creation_time")
          ]
        },
        {
          schema: "information_schema",
          name: "views",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("view_definition"),
            r("check_option"),
            r("is_updatable"),
            r("is_insertable_into"),
            r("is_trigger_updatable"),
            r("is_trigger_deletable"),
            r("is_trigger_insertable_into")
          ]
        },
        {
          schema: "information_schema",
          name: "routines",
          columns: [
            e("specific_catalog"),
            e("specific_schema"),
            e("specific_name"),
            e("routine_catalog"),
            e("routine_schema"),
            e("routine_name"),
            e("routine_type"),
            e("data_type"),
            e("routine_definition"),
            e("external_name"),
            e("external_language"),
            s("created"),
            s("last_altered")
          ]
        },
        {
          schema: "information_schema",
          name: "functions",
          columns: [
            e("function_catalog"),
            e("function_schema"),
            e("function_name"),
            e("function_owner"),
            e("argument_signature"),
            e("data_type"),
            e("function_definition"),
            s("created"),
            s("last_altered")
          ]
        },
        {
          schema: "information_schema",
          name: "table_constraints",
          columns: [
            e("constraint_catalog"),
            e("constraint_schema"),
            e("constraint_name"),
            e("table_schema"),
            e("table_name"),
            e("constraint_type"),
            r("is_deferrable"),
            r("initially_deferred"),
            r("enforced")
          ]
        },
        {
          schema: "information_schema",
          name: "key_column_usage",
          columns: [
            e("constraint_catalog"),
            e("constraint_schema"),
            e("constraint_name"),
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("column_name"),
            t("ordinal_position"),
            t("position_in_unique_constraint")
          ]
        },
        {
          schema: "information_schema",
          name: "referential_constraints",
          columns: [
            e("constraint_catalog"),
            e("constraint_schema"),
            e("constraint_name"),
            e("unique_constraint_catalog"),
            e("unique_constraint_schema"),
            e("unique_constraint_name"),
            e("match_option"),
            e("update_rule"),
            e("delete_rule")
          ]
        },
        {
          schema: "information_schema",
          name: "triggers",
          columns: [
            e("trigger_catalog"),
            e("trigger_schema"),
            e("trigger_name"),
            e("event_manipulation"),
            e("event_object_catalog"),
            e("event_object_schema"),
            e("event_object_table"),
            t("action_order"),
            e("action_condition"),
            e("action_statement"),
            e("action_orientation"),
            e("action_timing"),
            s("created")
          ]
        },
        {
          schema: "information_schema",
          name: "parameters",
          columns: [
            e("specific_catalog"),
            e("specific_schema"),
            e("specific_name"),
            t("ordinal_position"),
            e("parameter_mode"),
            e("is_result"),
            e("as_locator"),
            e("parameter_name"),
            e("data_type"),
            t("character_maximum_length"),
            t("numeric_precision"),
            t("numeric_scale"),
            e("routine_catalog"),
            e("routine_schema"),
            e("routine_name")
          ]
        },
        {
          schema: "information_schema",
          name: "statistics",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            r("non_unique"),
            e("index_schema"),
            e("index_name"),
            t("seq_in_index"),
            e("column_name"),
            e("collation"),
            t("cardinality"),
            t("sub_part"),
            e("packed"),
            e("nullable"),
            e("index_type"),
            e("comment"),
            e("index_comment")
          ]
        },
        {
          schema: "information_schema",
          name: "table_privileges",
          columns: [
            e("grantor"),
            e("grantee"),
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("privilege_type"),
            r("is_grantable"),
            r("with_hierarchy")
          ]
        },
        {
          schema: "information_schema",
          name: "column_privileges",
          columns: [
            e("grantor"),
            e("grantee"),
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("column_name"),
            e("privilege_type"),
            r("is_grantable")
          ]
        },
        {
          schema: "information_schema",
          name: "query_history",
          columns: [
            e("query_id"),
            e("query_text"),
            e("database_name"),
            e("schema_name"),
            e("query_type"),
            e("session_id"),
            e("user_name"),
            e("role_name"),
            e("warehouse_name"),
            s("start_time"),
            s("end_time"),
            t("total_elapsed_time"),
            t("rows_produced"),
            t("bytes_scanned"),
            t("bytes_written"),
            e("execution_status"),
            e("error_code"),
            e("error_message")
          ]
        },
        {
          schema: "information_schema",
          name: "warehouses",
          columns: [
            e("warehouse_name"),
            e("warehouse_type"),
            e("warehouse_size"),
            e("state"),
            t("cluster_count"),
            t("max_cluster_count"),
            t("min_cluster_count"),
            t("auto_suspend"),
            r("auto_resume"),
            e("resource_monitor"),
            e("comment")
          ]
        },
        {
          name: "sqlite_master",
          columns: [
            e("type"),
            e("name"),
            e("tbl_name"),
            t("rootpage"),
            e("sql")
          ]
        },
        {
          name: "sqlite_schema",
          columns: [
            e("type"),
            e("name"),
            e("tbl_name"),
            t("rootpage"),
            e("sql")
          ]
        },
        {
          name: "sqlite_temp_master",
          columns: [
            e("type"),
            e("name"),
            e("tbl_name"),
            t("rootpage"),
            e("sql")
          ]
        },
        {
          name: "sqlite_temp_schema",
          columns: [
            e("type"),
            e("name"),
            e("tbl_name"),
            t("rootpage"),
            e("sql")
          ]
        },
        {
          name: "information_schema.views",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("view_definition"),
            r("check_option"),
            r("use_standard_sql")
          ]
        },
        {
          name: "information_schema.jobs",
          columns: [
            e("project_id"),
            e("project_number"),
            e("user_email"),
            e("job_id"),
            e("job_type"),
            e("statement_type"),
            s("creation_time"),
            s("start_time"),
            s("end_time"),
            e("state"),
            e("reservation_id"),
            t("total_bytes_processed"),
            t("total_slot_ms"),
            e("error_result")
          ]
        },
        {
          name: "information_schema.jobs_by_user",
          columns: [
            e("project_id"),
            e("project_number"),
            e("user_email"),
            e("job_id"),
            e("job_type"),
            e("statement_type"),
            s("creation_time"),
            s("start_time"),
            s("end_time"),
            e("state"),
            e("reservation_id"),
            t("total_bytes_processed"),
            t("total_slot_ms"),
            e("error_result")
          ]
        },
        {
          name: "information_schema.reservations",
          columns: [
            e("project_id"),
            e("project_number"),
            e("reservation_name"),
            e("ignore_idle_slots"),
            t("slot_capacity"),
            s("creation_time"),
            s("update_time")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_tables",
          columns: [
            e("schemaname"),
            e("tablename"),
            e("tableowner"),
            e("tablespace"),
            r("hasindexes"),
            r("hasrules"),
            r("hastriggers"),
            r("rowsecurity")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_roles",
          columns: [
            e("rolname"),
            r("rolsuper"),
            r("rolinherit"),
            r("rolcreaterole"),
            r("rolcreatedb"),
            r("rolcanlogin"),
            r("rolreplication"),
            t("rolconnlimit"),
            e("rolpassword"),
            s("rolvaliduntil"),
            e("rolconfig"),
            t("oid")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_settings",
          columns: [
            e("name"),
            e("setting"),
            e("unit"),
            e("category"),
            e("short_desc"),
            e("extra_desc"),
            e("context"),
            e("vartype"),
            e("source"),
            e("min_val"),
            e("max_val"),
            e("enumvals"),
            e("boot_val"),
            e("reset_val"),
            r("pending_restart")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_stat_database",
          columns: [
            t("datid"),
            e("datname"),
            t("numbackends"),
            t("xact_commit"),
            t("xact_rollback"),
            t("blks_read"),
            t("blks_hit"),
            t("tup_returned"),
            t("tup_fetched"),
            t("tup_inserted"),
            t("tup_updated"),
            t("tup_deleted"),
            s("stats_reset")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_user",
          columns: [
            e("usename"),
            t("usesysid"),
            r("usecreatedb"),
            r("usesuper"),
            r("userepl"),
            r("usebypassrls"),
            s("valuntil"),
            e("useconfig")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_indexes",
          columns: [
            e("schemaname"),
            e("tablename"),
            e("indexname"),
            e("tablespace"),
            e("indexdef")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_locks",
          columns: [
            e("locktype"),
            t("database"),
            t("relation"),
            t("page"),
            t("tuple"),
            e("virtualxid"),
            e("transactionid"),
            t("classid"),
            t("objid"),
            t("objsubid"),
            e("virtualtransaction"),
            t("pid"),
            e("mode"),
            r("granted"),
            r("fastpath"),
            s("waitstart")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_class",
          columns: [
            e("relname"),
            t("relnamespace"),
            e("relkind"),
            t("relowner"),
            t("relam"),
            t("relfilenode"),
            t("reltablespace"),
            t("relpages"),
            t("reltuples"),
            r("relhasindex"),
            r("relisshared"),
            e("relpersistence"),
            r("relrowsecurity")
          ]
        },
        {
          name: "pg_class",
          columns: [
            e("relname"),
            t("relnamespace"),
            e("relkind"),
            t("relowner"),
            t("relam"),
            t("relfilenode"),
            t("reltablespace"),
            t("relpages"),
            t("reltuples"),
            r("relhasindex"),
            r("relisshared"),
            e("relpersistence"),
            r("relrowsecurity")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_namespace",
          columns: [
            t("oid"),
            e("nspname"),
            t("nspowner"),
            e("nspacl")
          ]
        },
        {
          name: "pg_namespace",
          columns: [
            t("oid"),
            e("nspname"),
            t("nspowner"),
            e("nspacl")
          ]
        },
        {
          name: "pg_available_extensions",
          columns: [
            e("name"),
            e("default_version"),
            e("installed_version"),
            e("comment")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_extension",
          columns: [
            t("oid"),
            e("extname"),
            t("extowner"),
            t("extnamespace"),
            r("extrelocatable"),
            e("extversion"),
            e("extconfig"),
            e("extcondition")
          ]
        },
        {
          name: "pg_extension",
          columns: [
            t("oid"),
            e("extname"),
            t("extowner"),
            t("extnamespace"),
            r("extrelocatable"),
            e("extversion"),
            e("extconfig"),
            e("extcondition")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_type",
          columns: [
            t("oid"),
            e("typname"),
            t("typnamespace"),
            t("typowner"),
            t("typlen"),
            r("typbyval"),
            e("typtype"),
            e("typcategory"),
            r("typispreferred"),
            r("typnotnull"),
            t("typbasetype")
          ]
        },
        {
          name: "pg_type",
          columns: [
            t("oid"),
            e("typname"),
            t("typnamespace"),
            t("typowner"),
            t("typlen"),
            r("typbyval"),
            e("typtype"),
            e("typcategory"),
            r("typispreferred"),
            r("typnotnull"),
            t("typbasetype")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_proc",
          columns: [
            t("oid"),
            e("proname"),
            t("pronamespace"),
            t("proowner"),
            e("prolang"),
            n("procost"),
            n("prorows"),
            e("provariadic"),
            e("prokind"),
            r("prosecdef"),
            r("proleakproof"),
            r("proisstrict"),
            r("proretset")
          ]
        },
        {
          name: "pg_proc",
          columns: [
            t("oid"),
            e("proname"),
            t("pronamespace"),
            t("proowner"),
            e("prolang"),
            n("procost"),
            n("prorows"),
            e("provariadic"),
            e("prokind"),
            r("prosecdef"),
            r("proleakproof"),
            r("proisstrict"),
            r("proretset")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_constraint",
          columns: [
            t("oid"),
            e("conname"),
            t("connamespace"),
            e("contype"),
            r("condeferrable"),
            r("condeferred"),
            r("convalidated"),
            t("conrelid"),
            t("confrelid"),
            e("conkey")
          ]
        },
        {
          name: "pg_constraint",
          columns: [
            t("oid"),
            e("conname"),
            t("connamespace"),
            e("contype"),
            r("condeferrable"),
            r("condeferred"),
            r("convalidated"),
            t("conrelid"),
            t("confrelid"),
            e("conkey")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_attribute",
          columns: [
            t("attrelid"),
            e("attname"),
            t("atttypid"),
            t("attlen"),
            t("attnum"),
            t("attndims"),
            r("attnotnull"),
            r("atthasdef"),
            r("attisdropped"),
            r("attislocal")
          ]
        },
        {
          name: "pg_attribute",
          columns: [
            t("attrelid"),
            e("attname"),
            t("atttypid"),
            t("attlen"),
            t("attnum"),
            t("attndims"),
            r("attnotnull"),
            r("atthasdef"),
            r("attisdropped"),
            r("attislocal")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_stat_user_indexes",
          columns: [
            t("relid"),
            t("indexrelid"),
            e("schemaname"),
            e("relname"),
            e("indexrelname"),
            t("idx_scan"),
            t("idx_tup_read"),
            t("idx_tup_fetch")
          ]
        },
        {
          name: "pg_stat_user_indexes",
          columns: [
            t("relid"),
            t("indexrelid"),
            e("schemaname"),
            e("relname"),
            e("indexrelname"),
            t("idx_scan"),
            t("idx_tup_read"),
            t("idx_tup_fetch")
          ]
        },
        {
          name: "pg_settings",
          columns: [
            e("name"),
            e("setting"),
            e("unit"),
            e("category"),
            e("short_desc"),
            e("extra_desc"),
            e("context"),
            e("vartype"),
            e("source"),
            r("pending_restart")
          ]
        },
        {
          name: "pg_stat_activity",
          columns: [
            t("datid"),
            e("datname"),
            t("pid"),
            t("leader_pid"),
            t("usesysid"),
            e("usename"),
            e("application_name"),
            e("client_addr"),
            e("state"),
            e("query"),
            s("query_start")
          ]
        },
        {
          name: "pg_stat_user_tables",
          columns: [
            t("relid"),
            e("schemaname"),
            e("relname"),
            t("seq_scan"),
            t("seq_tup_read"),
            t("idx_scan"),
            t("idx_tup_fetch"),
            t("n_tup_ins"),
            t("n_tup_upd"),
            t("n_tup_del")
          ]
        },
        {
          name: "pg_stat_database",
          columns: [
            t("datid"),
            e("datname"),
            t("numbackends"),
            t("xact_commit"),
            t("xact_rollback"),
            t("blks_read"),
            t("blks_hit"),
            t("tup_returned"),
            t("tup_fetched")
          ]
        },
        {
          name: "pg_roles",
          columns: [
            e("rolname"),
            r("rolsuper"),
            r("rolinherit"),
            r("rolcreaterole"),
            r("rolcreatedb"),
            r("rolcanlogin"),
            t("rolconnlimit")
          ]
        },
        {
          name: "pg_user",
          columns: [
            e("usename"),
            t("usesysid"),
            r("usecreatedb"),
            r("usesuper"),
            r("userepl"),
            r("usebypassrls")
          ]
        },
        {
          name: "pg_database",
          columns: [
            t("oid"),
            e("datname"),
            t("datdba"),
            e("encoding"),
            e("datcollate"),
            e("datctype"),
            r("datistemplate"),
            r("datallowconn")
          ]
        },
        {
          name: "pg_indexes",
          columns: [
            e("schemaname"),
            e("tablename"),
            e("indexname"),
            e("tablespace"),
            e("indexdef")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_views",
          columns: [
            e("schemaname"),
            e("viewname"),
            e("viewowner"),
            e("definition")
          ]
        },
        {
          schema: "pg_catalog",
          name: "pg_matviews",
          columns: [
            e("schemaname"),
            e("matviewname"),
            e("matviewowner"),
            e("tablespace"),
            r("ispopulated"),
            e("definition")
          ]
        },
        {
          name: "pg_views",
          columns: [
            e("schemaname"),
            e("viewname"),
            e("viewowner"),
            e("definition")
          ]
        },
        {
          name: "pg_matviews",
          columns: [
            e("schemaname"),
            e("matviewname"),
            e("matviewowner"),
            e("tablespace"),
            r("ispopulated"),
            e("definition")
          ]
        },
        {
          schema: "information_schema",
          name: "processlist",
          columns: [
            t("ID"),
            e("USER"),
            e("HOST"),
            e("DB"),
            e("COMMAND"),
            t("TIME"),
            e("STATE"),
            e("INFO")
          ]
        },
        {
          schema: "mysql",
          name: "user",
          columns: [
            e("Host"),
            e("User"),
            e("Select_priv"),
            e("Insert_priv"),
            e("Update_priv"),
            e("Delete_priv"),
            e("Create_priv"),
            e("Drop_priv")
          ]
        },
        {
          schema: "performance_schema",
          name: "threads",
          columns: [
            t("THREAD_ID"),
            e("NAME"),
            e("TYPE"),
            t("PROCESSLIST_ID"),
            e("PROCESSLIST_USER"),
            e("PROCESSLIST_HOST"),
            e("PROCESSLIST_DB"),
            e("PROCESSLIST_COMMAND")
          ]
        },
        {
          schema: "performance_schema",
          name: "global_variables",
          columns: [
            e("VARIABLE_NAME"),
            e("VARIABLE_VALUE")
          ]
        },
        {
          schema: "performance_schema",
          name: "global_status",
          columns: [
            e("VARIABLE_NAME"),
            e("VARIABLE_VALUE")
          ]
        },
        {
          schema: "performance_schema",
          name: "events_statements_summary_by_digest",
          columns: [
            e("SCHEMA_NAME"),
            e("DIGEST"),
            e("DIGEST_TEXT"),
            t("COUNT_STAR"),
            t("SUM_TIMER_WAIT"),
            t("MIN_TIMER_WAIT"),
            t("AVG_TIMER_WAIT"),
            t("MAX_TIMER_WAIT"),
            t("SUM_ROWS_AFFECTED"),
            t("SUM_ROWS_SENT"),
            t("SUM_ROWS_EXAMINED"),
            s("FIRST_SEEN"),
            s("LAST_SEEN")
          ]
        },
        {
          schema: "information_schema",
          name: "events",
          columns: [
            e("EVENT_CATALOG"),
            e("EVENT_SCHEMA"),
            e("EVENT_NAME"),
            e("DEFINER"),
            e("TIME_ZONE"),
            e("EVENT_BODY"),
            e("EVENT_DEFINITION"),
            e("EVENT_TYPE"),
            e("STATUS"),
            s("CREATED"),
            s("LAST_ALTERED")
          ]
        },
        {
          schema: "sys",
          name: "schema_table_statistics",
          columns: [
            e("table_schema"),
            e("table_name"),
            t("total_latency"),
            t("rows_fetched"),
            t("rows_inserted"),
            t("rows_updated"),
            t("rows_deleted")
          ]
        },
        {
          schema: "sys",
          name: "tables",
          columns: [
            t("object_id"),
            e("name"),
            t("schema_id"),
            e("type"),
            e("type_desc"),
            s("create_date"),
            s("modify_date"),
            r("is_ms_shipped"),
            r("is_filetable"),
            r("is_memory_optimized"),
            t("max_column_id_used")
          ]
        },
        {
          schema: "sys",
          name: "columns",
          columns: [
            t("object_id"),
            e("name"),
            t("column_id"),
            t("system_type_id"),
            t("user_type_id"),
            t("max_length"),
            t("precision"),
            t("scale"),
            e("collation_name"),
            r("is_nullable"),
            r("is_identity"),
            r("is_computed"),
            r("is_rowguidcol")
          ]
        },
        {
          schema: "sys",
          name: "objects",
          columns: [
            t("object_id"),
            e("name"),
            t("schema_id"),
            t("parent_object_id"),
            e("type"),
            e("type_desc"),
            s("create_date"),
            s("modify_date"),
            r("is_ms_shipped")
          ]
        },
        {
          schema: "sys",
          name: "schemas",
          columns: [
            e("name"),
            t("schema_id"),
            t("principal_id")
          ]
        },
        {
          schema: "sys",
          name: "databases",
          columns: [
            e("name"),
            t("database_id"),
            t("source_database_id"),
            e("owner_sid"),
            s("create_date"),
            t("compatibility_level"),
            e("collation_name"),
            e("user_access_desc"),
            r("is_read_only"),
            r("is_auto_close_on"),
            e("state_desc")
          ]
        },
        {
          schema: "sys",
          name: "types",
          columns: [
            e("name"),
            t("system_type_id"),
            t("user_type_id"),
            t("schema_id"),
            t("principal_id"),
            t("max_length"),
            t("precision"),
            t("scale"),
            e("collation_name"),
            r("is_nullable"),
            r("is_user_defined"),
            r("is_assembly_type"),
            r("is_table_type")
          ]
        },
        {
          schema: "sys",
          name: "dm_exec_sessions",
          columns: [
            t("session_id"),
            s("login_time"),
            e("host_name"),
            e("program_name"),
            e("login_name"),
            e("status"),
            t("cpu_time"),
            t("memory_usage"),
            t("total_scheduled_time"),
            t("total_elapsed_time"),
            t("reads"),
            t("writes"),
            t("logical_reads"),
            s("last_request_start_time"),
            s("last_request_end_time")
          ]
        },
        {
          schema: "sys",
          name: "dm_exec_requests",
          columns: [
            t("session_id"),
            t("request_id"),
            s("start_time"),
            e("status"),
            e("command"),
            t("database_id"),
            t("user_id"),
            t("blocking_session_id"),
            e("wait_type"),
            t("wait_time"),
            t("cpu_time"),
            t("total_elapsed_time"),
            t("reads"),
            t("writes"),
            t("logical_reads")
          ]
        },
        {
          schema: "sys",
          name: "indexes",
          columns: [
            t("object_id"),
            e("name"),
            t("index_id"),
            e("type_desc"),
            r("is_unique"),
            r("is_primary_key"),
            r("is_unique_constraint"),
            r("is_disabled"),
            s("modify_date")
          ]
        },
        {
          schema: "sys",
          name: "foreign_keys",
          columns: [
            t("object_id"),
            e("name"),
            t("parent_object_id"),
            t("referenced_object_id"),
            r("is_disabled"),
            r("is_not_trusted"),
            e("delete_referential_action_desc"),
            e("update_referential_action_desc")
          ]
        },
        {
          schema: "sys",
          name: "dm_exec_connections",
          columns: [
            t("session_id"),
            s("connect_time"),
            e("net_transport"),
            e("protocol_type"),
            e("auth_scheme"),
            t("num_reads"),
            t("num_writes"),
            e("client_net_address")
          ]
        },
        {
          schema: "system",
          name: "tables",
          columns: [
            e("database"),
            e("name"),
            e("engine"),
            r("is_temporary"),
            t("total_rows"),
            t("total_bytes"),
            e("metadata_path")
          ]
        },
        {
          schema: "system",
          name: "columns",
          columns: [
            e("database"),
            e("table"),
            e("name"),
            e("type"),
            e("default_kind"),
            e("default_expression"),
            e("comment")
          ]
        },
        {
          schema: "system",
          name: "functions",
          columns: [
            e("name"),
            r("is_aggregate"),
            e("case_insensitive"),
            e("alias_to"),
            s("create_query"),
            e("origin"),
            e("description"),
            e("syntax")
          ]
        },
        {
          schema: "system",
          name: "databases",
          columns: [
            e("name"),
            e("engine"),
            e("data_path"),
            e("metadata_path"),
            e("uuid")
          ]
        },
        {
          schema: "system",
          name: "parts",
          columns: [
            e("partition"),
            e("name"),
            e("database"),
            e("table"),
            r("active"),
            t("marks"),
            t("rows"),
            t("bytes_on_disk")
          ]
        },
        {
          schema: "system",
          name: "processes",
          columns: [
            r("is_initial_query"),
            e("user"),
            e("query_id"),
            e("address"),
            t("elapsed"),
            t("read_rows"),
            t("read_bytes"),
            e("query")
          ]
        },
        {
          schema: "system",
          name: "merges",
          columns: [
            e("database"),
            e("table"),
            t("elapsed"),
            n("progress"),
            t("num_parts"),
            e("result_part_name"),
            e("partition_id"),
            r("is_mutation")
          ]
        },
        {
          schema: "system",
          name: "mutations",
          columns: [
            e("database"),
            e("table"),
            e("mutation_id"),
            e("command"),
            s("create_time"),
            t("parts_to_do"),
            r("is_done"),
            e("latest_failed_part"),
            e("latest_fail_reason")
          ]
        },
        {
          schema: "system",
          name: "settings",
          columns: [
            e("name"),
            e("value"),
            r("changed"),
            e("description"),
            e("min"),
            e("max"),
            r("readonly"),
            e("type")
          ]
        },
        {
          schema: "system",
          name: "query_log",
          columns: [
            e("hostname"),
            e("type"),
            s("event_time"),
            t("query_duration_ms"),
            t("read_rows"),
            t("read_bytes"),
            t("written_rows"),
            t("written_bytes"),
            e("query"),
            e("query_id"),
            e("user"),
            e("database")
          ]
        },
        {
          schema: "svv",
          name: "tables",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("table_type"),
            e("remarks")
          ]
        },
        {
          name: "svv_tables",
          columns: [
            e("database_name"),
            e("schema_name"),
            e("table_name"),
            e("table_type"),
            e("remarks")
          ]
        },
        {
          schema: "pg_catalog",
          name: "svv_tables",
          columns: [
            e("database_name"),
            e("schema_name"),
            e("table_name"),
            e("tablename"),
            e("table_type"),
            e("remarks")
          ]
        },
        {
          name: "svv_columns",
          columns: [
            e("database_name"),
            e("schema_name"),
            e("table_name"),
            e("column_name"),
            t("ordinal_position"),
            e("data_type"),
            r("is_nullable")
          ]
        },
        {
          name: "svv_redshift_tables",
          columns: [
            e("database_name"),
            e("schema_name"),
            e("table_name"),
            e("table_type"),
            e("remarks")
          ]
        },
        {
          name: "stv_recents",
          columns: [
            t("userid"),
            e("status"),
            s("starttime"),
            e("query"),
            e("user_name"),
            e("db_name")
          ]
        },
        {
          name: "stv_sessions",
          columns: [
            t("userid"),
            t("process"),
            e("user_name"),
            e("db_name"),
            t("timeout_sec"),
            s("starttime")
          ]
        },
        {
          name: "stl_query",
          columns: [
            t("userid"),
            t("query"),
            t("pid"),
            t("xid"),
            e("database"),
            s("starttime"),
            s("endtime"),
            r("aborted"),
            e("label")
          ]
        },
        {
          schema: "all",
          name: "tables",
          columns: [
            e("owner"),
            e("table_name"),
            e("tablespace_name"),
            e("status"),
            t("num_rows")
          ]
        },
        {
          name: "all_tables",
          columns: [
            e("owner"),
            e("table_name"),
            e("tablespace_name"),
            e("status"),
            t("num_rows")
          ]
        },
        {
          name: "all_tab_columns",
          columns: [
            e("owner"),
            e("table_name"),
            e("column_name"),
            e("data_type"),
            t("data_length"),
            t("data_precision"),
            t("data_scale"),
            e("nullable"),
            t("column_id"),
            e("data_default")
          ]
        },
        {
          name: "user_tables",
          columns: [
            e("table_name"),
            e("tablespace_name"),
            e("status"),
            t("num_rows"),
            t("blocks"),
            t("empty_blocks"),
            t("avg_space"),
            s("last_analyzed")
          ]
        },
        {
          name: "all_users",
          columns: [
            e("username"),
            t("user_id"),
            s("created"),
            e("common"),
            e("oracle_maintained"),
            e("inherited"),
            e("default_collation"),
            e("implicit"),
            e("all_shard")
          ]
        },
        {
          name: "all_objects",
          columns: [
            e("owner"),
            e("object_name"),
            e("subobject_name"),
            t("object_id"),
            t("data_object_id"),
            e("object_type"),
            s("created"),
            s("last_ddl_time"),
            e("status"),
            r("temporary"),
            r("generated")
          ]
        },
        {
          name: "all_views",
          columns: [
            e("owner"),
            e("view_name"),
            e("text"),
            t("text_length"),
            e("type_text"),
            t("type_text_length"),
            e("oid_text"),
            t("oid_text_length")
          ]
        },
        {
          name: "all_constraints",
          columns: [
            e("owner"),
            e("constraint_name"),
            e("constraint_type"),
            e("table_name"),
            e("search_condition"),
            e("r_owner"),
            e("r_constraint_name"),
            e("delete_rule"),
            e("status"),
            r("deferrable"),
            r("deferred"),
            r("validated"),
            s("last_change")
          ]
        },
        {
          name: "user_constraints",
          columns: [
            e("constraint_name"),
            e("constraint_type"),
            e("table_name"),
            e("search_condition"),
            e("r_owner"),
            e("r_constraint_name"),
            e("delete_rule"),
            e("status"),
            r("deferrable"),
            r("deferred"),
            r("validated"),
            s("last_change")
          ]
        },
        {
          name: "user_objects",
          columns: [
            e("object_name"),
            e("subobject_name"),
            t("object_id"),
            e("object_type"),
            s("created"),
            s("last_ddl_time"),
            e("status"),
            r("temporary"),
            r("generated")
          ]
        },
        {
          name: "user_tab_columns",
          columns: [
            e("table_name"),
            e("column_name"),
            e("data_type"),
            t("data_length"),
            t("column_id"),
            e("nullable")
          ]
        },
        {
          name: "user_indexes",
          columns: [
            e("index_name"),
            e("index_type"),
            e("table_name"),
            e("table_type"),
            e("uniqueness"),
            e("compression"),
            e("status"),
            t("blevel"),
            t("leaf_blocks"),
            t("distinct_keys"),
            t("num_rows"),
            s("last_analyzed")
          ]
        },
        {
          name: "user_ind_columns",
          columns: [
            e("index_name"),
            e("table_name"),
            e("column_name"),
            t("column_position"),
            t("column_length"),
            e("descend")
          ]
        },
        {
          name: "dba_tables",
          columns: [
            e("owner"),
            e("table_name"),
            e("tablespace_name"),
            e("cluster_name"),
            e("status"),
            t("num_rows"),
            t("blocks"),
            t("empty_blocks"),
            s("last_analyzed")
          ]
        },
        {
          name: "dual",
          columns: [
            e("dummy")
          ]
        },
        {
          name: "v$session",
          columns: [
            t("sid"),
            t("serial#"),
            e("username"),
            e("status"),
            e("machine"),
            e("program")
          ]
        },
        {
          name: "exa_all_tables",
          columns: [
            e("table_schema"),
            e("table_name"),
            e("table_type"),
            e("table_owner"),
            s("created"),
            s("last_commit"),
            r("has_distribution_key"),
            e("delete_percentage")
          ]
        },
        {
          name: "exa_all_columns",
          columns: [
            e("column_schema"),
            e("column_table"),
            e("column_name"),
            t("column_ordinal_position"),
            e("column_default"),
            r("column_is_nullable"),
            e("column_type"),
            t("column_maxsize"),
            t("column_num_prec"),
            t("column_num_scale"),
            e("column_comment")
          ]
        },
        {
          name: "__TABLES__",
          columns: [
            t("project_id"),
            t("dataset_id"),
            t("table_id"),
            s("creation_time"),
            s("last_modified_time"),
            t("row_count"),
            t("size_bytes")
          ]
        },
        {
          name: "__TABLES_SUMMARY__",
          columns: [
            t("project_id"),
            t("dataset_id"),
            t("table_id"),
            s("creation_time"),
            s("last_modified_time"),
            t("row_count"),
            t("size_bytes"),
            t("type")
          ]
        },
        {
          schema: "account_usage",
          name: "query_history",
          columns: [
            e("query_id"),
            e("query_text"),
            e("database_name"),
            e("schema_name"),
            e("user_name"),
            s("start_time"),
            s("end_time"),
            t("total_elapsed_time"),
            e("execution_status")
          ]
        },
        {
          schema: "account_usage",
          name: "users",
          columns: [
            e("id"),
            e("name"),
            s("created_on"),
            e("login_name"),
            e("display_name"),
            e("email"),
            r("deleted")
          ]
        },
        {
          schema: "account_usage",
          name: "roles",
          columns: [
            e("id"),
            e("name"),
            s("created_on"),
            e("owner"),
            e("comment"),
            r("deleted")
          ]
        },
        {
          schema: "account_usage",
          name: "warehouses",
          columns: [
            e("id"),
            e("name"),
            s("created_on"),
            e("type"),
            e("size"),
            r("auto_resume"),
            t("auto_suspend")
          ]
        },
        {
          schema: "account_usage",
          name: "tables",
          columns: [
            e("id"),
            e("table_name"),
            e("table_schema"),
            e("table_catalog"),
            s("created"),
            s("last_altered"),
            t("row_count"),
            t("bytes")
          ]
        },
        {
          schema: "account_usage",
          name: "databases",
          columns: [
            e("database_id"),
            e("database_name"),
            e("database_owner"),
            s("created"),
            s("last_altered"),
            r("deleted"),
            e("comment")
          ]
        },
        {
          schema: "account_usage",
          name: "schemata",
          columns: [
            e("catalog_id"),
            e("catalog_name"),
            e("schema_id"),
            e("schema_name"),
            e("schema_owner"),
            s("created"),
            s("last_altered"),
            r("deleted"),
            e("comment")
          ]
        },
        {
          schema: "account_usage",
          name: "columns",
          columns: [
            e("table_catalog"),
            e("table_schema"),
            e("table_name"),
            e("column_name"),
            t("ordinal_position"),
            e("column_default"),
            r("is_nullable"),
            e("data_type"),
            s("created"),
            s("last_altered")
          ]
        },
        {
          schema: "account_usage",
          name: "grants_to_roles",
          columns: [
            s("created_on"),
            s("modified_on"),
            e("privilege"),
            e("granted_on"),
            e("name"),
            e("table_catalog"),
            e("table_schema"),
            e("granted_to"),
            e("grantee_name"),
            e("grant_option"),
            e("granted_by"),
            r("deleted")
          ]
        },
        {
          schema: "sys",
          name: "segments",
          columns: [
            e("segment_id"),
            e("datasource"),
            s("start"),
            s("end"),
            t("size"),
            t("num_rows"),
            r("is_published")
          ]
        },
        {
          schema: "sys",
          name: "servers",
          columns: [
            e("server"),
            e("host"),
            t("plaintext_port"),
            t("tls_port"),
            e("curr_size"),
            t("max_size")
          ]
        },
        {
          schema: "sys",
          name: "tasks",
          columns: [
            e("task_id"),
            e("type"),
            e("datasource"),
            s("created_time"),
            e("status"),
            e("location")
          ]
        },
        {
          schema: "sys",
          name: "supervisors",
          columns: [
            e("supervisor_id"),
            e("state"),
            e("detailed_state"),
            e("healthy"),
            e("type"),
            e("source")
          ]
        }
      ]
    };
  }
  function Hf(e, t, n) {
    var _a2, _b2;
    const r = d(e, "column");
    if (!_(r) || h(r.table)) return;
    const s = (_a2 = h(r.name)) == null ? void 0 : _a2.toLowerCase();
    if (!s) return;
    const a = n == null ? void 0 : n.get(s), o = (a == null ? void 0 : a.tableName.toLowerCase()) ?? s, c = (_b2 = a == null ? void 0 : a.schemaName) == null ? void 0 : _b2.toLowerCase(), u = t.tables.find((l) => {
      var _a3;
      return !(l.name.toLowerCase() !== o || c && ((_a3 = l.schema) == null ? void 0 : _a3.toLowerCase()) !== c);
    });
    if (u) return {
      type: `struct<${u.columns.map((l) => `${l.name} ${l.type || "unknown"}`).join(", ")}>`,
      source: gn(u)
    };
  }
  function sn(e, t, n, r) {
    if (J(e, "boolean")) return "boolean";
    if (J(e, "pi") || J(e, "match_against")) return "decimal";
    if (d(e, "x_m_l_element") || d(e, "x_m_l_forest")) return "xml";
    const s = d(e, "paren");
    if (_(s) && _(s.this)) return E(s.this, "expression", t, n, "generic").type;
    const a = d(e, "neg");
    if (_(a) && _(a.this)) return E(a.this, "expression", t, n, "generic").type;
    const o = d(e, "array_slice");
    if (_(o) && _(o.this)) return E(o.this, "expression", t, n, "generic").type;
    const c = d(e, "collation");
    if (_(c) && _(c.this)) return E(c.this, "expression", t, n, "generic").type;
    const u = op(e, t, n);
    if (u) return u;
    const l = _s(e, t, n);
    if (l) return l;
    const m = cs(e, t, n);
    if (m) return m;
    const y = os(e);
    if (y) return y;
    const w = is(e);
    if (w) return w;
    const L = Yf(e, t, n);
    if (L) return L;
    const $ = an(e, t, n, r);
    if ($) return $;
    const S = Wf(e, t, n);
    if (S) return S;
    const T = np(e, t, n);
    if (T) return T;
    const C = d(e, "add") ?? d(e, "sub") ?? d(e, "mul") ?? d(e, "div") ?? d(e, "int_div") ?? d(e, "mod") ?? d(e, "mod_func") ?? d(e, "bitwise_and") ?? d(e, "bitwise_or") ?? d(e, "bitwise_xor") ?? d(e, "bitwise_left_shift") ?? d(e, "bitwise_right_shift");
    if (_(C)) {
      const K = [
        C.left,
        C.right,
        C.this,
        C.expression
      ].filter(_).map((I) => E(I, "expression", t, n, "generic").type);
      if (K.some((I) => /decimal|numeric|real|double|float/i.test(I))) return "decimal";
      if (K.some((I) => /int|number|bigint|smallint/i.test(I))) return "integer";
    }
    const k = d(e, "power");
    if (_(k)) return "decimal";
    if (J(e, "concat")) return "text";
    const D = d(e, "function");
    if (_(D) && String(D.name ?? "").toLowerCase() === "row" && Array.isArray(D.args)) {
      const K = D.args.filter(_).map((I, H) => {
        const le = je(I, H + 1), st = E(I, le, t, n, "generic").type;
        return `${le} ${st}`;
      });
      if (K.length > 0) return `record<${K.join(", ")}>`;
    }
  }
  function Wf(e, t, n) {
    var _a2;
    const r = d(e, "method_call");
    if (!_(r)) return;
    const s = (_a2 = h(r.method)) == null ? void 0 : _a2.toLowerCase();
    if (!s) return;
    const a = _(r.this) ? r.this : void 0;
    if ([
      "lower",
      "upper",
      "trim",
      "ltrim",
      "rtrim",
      "substring",
      "substr",
      "replace",
      "regexp_replace"
    ].includes(s)) return "text";
    if ([
      "length",
      "char_length",
      "character_length",
      "array_length",
      "array_size",
      "cardinality",
      "list_position",
      "list_unique"
    ].includes(s)) return "integer";
    if ([
      "contains",
      "list_contains",
      "array_contains",
      "has",
      "list_has",
      "list_has_all",
      "list_has_any"
    ].includes(s)) return "boolean";
    if ([
      "array_join",
      "array_to_string"
    ].includes(s)) return "text";
    if ([
      "array_distinct",
      "array_compact",
      "array_reverse",
      "array_sort",
      "array_remove",
      "list_sort"
    ].includes(s)) return a ? G([
      a
    ], t, n) : void 0;
    if ([
      "list_extract",
      "array_extract"
    ].includes(s)) {
      const o = a ? G([
        a
      ], t, n) : void 0;
      return o ? W(o) ?? o : void 0;
    }
  }
  function an(e, t, n, r) {
    var _a2;
    if (J(e, "count")) return "integer";
    if (J(e, "avg")) return "decimal";
    if (J(e, "count_if") || J(e, "approx_count_distinct") || J(e, "approx_distinct")) return "integer";
    const s = d(e, "first_value") ?? d(e, "last_value");
    if (_(s) && _(s.this)) return ee(s.this, t, n, r);
    const a = d(e, "bool_and") ?? d(e, "bool_or") ?? d(e, "every") ?? d(e, "logical_and") ?? d(e, "logical_or");
    if (_(a)) return "boolean";
    const o = d(e, "stddev") ?? d(e, "variance") ?? d(e, "stddev_pop") ?? d(e, "stddev_samp") ?? d(e, "var_pop") ?? d(e, "var_samp");
    if (_(o)) return "decimal";
    const c = d(e, "bitwise_and_agg") ?? d(e, "bitwise_or_agg") ?? d(e, "bitwise_xor_agg");
    if (_(c)) {
      const k = me(c);
      return k ? ee(k, t, n, r) : "integer";
    }
    const u = d(e, "string_agg") ?? d(e, "group_concat") ?? d(e, "listagg");
    if (_(u)) return "text";
    const l = d(e, "array_agg") ?? d(e, "list") ?? d(e, "collect_list") ?? d(e, "collect_set");
    if (_(l)) {
      const k = me(l);
      return `array<${k ? ee(k, t, n, r) : "unknown"}>`;
    }
    const m = d(e, "array_concat_agg");
    if (_(m)) {
      const k = me(m);
      return k ? ee(k, t, n, r) : "array<unknown>";
    }
    const y = d(e, "json_agg") ?? d(e, "json_object_agg") ?? d(e, "json_arrayagg") ?? d(e, "json_objectagg") ?? d(e, "j_s_o_n_array_agg") ?? d(e, "j_s_o_n_object_agg") ?? d(e, "j_s_o_n_b_object_agg");
    if (_(y)) return "json";
    const w = d(e, "within_group");
    if (_(w)) {
      const k = Array.isArray(w.order_by) ? w.order_by.map((H) => _(H) && _(H.this) ? H.this : void 0).filter(_) : [], D = _(w.this) ? w.this : void 0, K = D ? an(D, t, n, r) : void 0;
      if (K && K !== "unknown") return K;
      const I = B(k, t, n);
      if (I) return I;
    }
    const L = d(e, "any_value") ?? d(e, "first") ?? d(e, "last") ?? d(e, "mode");
    if (_(L)) {
      const k = me(L);
      if (k) return ee(k, t, n, r);
    }
    const $ = d(e, "aggregate_function");
    if (_($)) return zn(String($.name ?? "").toLowerCase(), $, t, n, r);
    const S = d(e, "combined_parameterized_agg");
    if (_(S) && ((_a2 = h(S.this)) == null ? void 0 : _a2.toLowerCase()) === "quantiles") {
      const D = et(Array.isArray(S.expressions) ? S.expressions.filter(_) : []);
      return `array<${D ? ee(D, t, n, r) : "unknown"}>`;
    }
    const T = d(e, "function");
    if (_(T)) {
      const k = String(T.name ?? "").toLowerCase(), D = zn(k, T, t, n, r);
      if (D) return D;
    }
    const C = d(e, "sum") ?? d(e, "min") ?? d(e, "max") ?? d(e, "median");
    if (_(C)) {
      const k = me(C);
      if (k) return ee(k, t, n, r);
    }
  }
  function zn(e, t, n, r, s) {
    if ([
      "count",
      "count_if",
      "approx_count_distinct",
      "approx_distinct",
      "hash_agg",
      "regr_count",
      "uniq",
      "uniqexact"
    ].includes(e)) return "integer";
    if ([
      "avg",
      "corr",
      "covar_pop",
      "covar_samp",
      "entropy",
      "geometric_mean",
      "kurtosis",
      "mad",
      "product",
      "regr_avgx",
      "regr_avgy",
      "regr_intercept",
      "regr_r2",
      "regr_slope",
      "stddev",
      "stddev_pop",
      "stddev_samp",
      "stddevpop",
      "stddevsamp",
      "sem",
      "skewness",
      "stdev",
      "stdevp",
      "variance",
      "var",
      "var_pop",
      "var_samp",
      "varp",
      "varpop",
      "varsamp",
      "percentile_approx",
      "approx_percentile",
      "percentile_cont",
      "quantile",
      "quantile_cont",
      "quantile_disc",
      "total"
    ].includes(e)) return "decimal";
    if ([
      "bool_and",
      "bool_or",
      "every",
      "logical_and",
      "logical_or",
      "booland_agg",
      "boolor_agg"
    ].includes(e)) return "boolean";
    if ([
      "string_agg",
      "group_concat",
      "listagg",
      "ai_agg"
    ].includes(e)) return "text";
    if ([
      "json_group_array",
      "json_group_object",
      "jsonb_group_array",
      "jsonb_group_object"
    ].includes(e)) return "json";
    if ([
      "bit_and",
      "bit_or",
      "bit_xor",
      "checksum"
    ].includes(e)) {
      const a = me(t);
      return a ? ee(a, n, r, s) : "integer";
    }
    if ([
      "array_agg",
      "list",
      "collect_list",
      "collect_set"
    ].includes(e)) {
      const a = me(t);
      return `array<${a ? ee(a, n, r, s) : "unknown"}>`;
    }
    if (e === "array_concat_agg") {
      const a = me(t);
      return a ? ee(a, n, r, s) : "array<unknown>";
    }
    if (e === "approx_quantiles" || e === "quantiles") {
      const a = me(t);
      return `array<${a ? ee(a, n, r, s) : "unknown"}>`;
    }
    if ([
      "histogram"
    ].includes(e)) {
      const a = me(t);
      return `map<${a ? ee(a, n, r, s) : "unknown"}, integer>`;
    }
    if (e === "numeric_histogram") {
      const a = N(t), o = a[1] ?? a[0];
      return `map<${_(o) ? ee(o, n, r, s) : "unknown"}, decimal>`;
    }
    if (e === "approx_set") return "hyperloglog";
    if (e === "set_digest") return "setdigest";
    if (e === "map_agg" || e === "mapagg") {
      const a = N(t), o = _(a[0]) ? ee(a[0], n, r, s) : "unknown", c = _(a[1]) ? ee(a[1], n, r, s) : "unknown";
      return `map<${o}, ${c}>`;
    }
    if ([
      "json_agg",
      "json_object_agg",
      "json_arrayagg",
      "json_objectagg",
      "object_agg"
    ].includes(e)) return "json";
    if ([
      "xmlagg"
    ].includes(e)) return "xml";
    if ([
      "any_value",
      "any",
      "first",
      "last",
      "first_value",
      "last_value",
      "arbitrary",
      "argmax",
      "argmin",
      "mode",
      "percentile_disc"
    ].includes(e)) {
      const a = me(t);
      return a ? ee(a, n, r, s) : void 0;
    }
  }
  function ee(e, t, n, r) {
    return E(e, "aggregate", t, n, "generic", void 0, r).type;
  }
  function me(e) {
    return et([
      e.this,
      ...Array.isArray(e.args) ? e.args : [],
      ...Array.isArray(e.expressions) ? e.expressions : []
    ].filter(_));
  }
  function Yf(e, t, n) {
    const r = d(e, "subquery");
    if (!_(r) || !_(r.this)) return;
    const s = U(r.this, t), a = _(r.this.select) ? r.this.select : void 0;
    if (a && String(a.kind ?? "").toUpperCase() === "STRUCT" && s.length > 0) return `struct<${s.map((u, l) => {
      const m = u.name ?? je(u.expression, l + 1), y = E(u.expression, m, u.schema ?? t, n, "generic", u.source, u.tableAliases).type;
      return `${m} ${y}`;
    }).join(", ")}>`;
    const o = s[0];
    if (o) return E(o.expression, o.name ?? "subquery", o.schema ?? t, n, "generic", o.source, o.tableAliases).type;
  }
  function os(e) {
    return [
      "eq",
      "neq",
      "null_safe_eq",
      "null_safe_neq",
      "gt",
      "gte",
      "lt",
      "lte",
      "and",
      "or",
      "not",
      "is_null",
      "is_not_null",
      "is",
      "in",
      "like",
      "ilike",
      "i_like",
      "similar_to",
      "between",
      "exists",
      "regexp_like",
      "regexp_i_like",
      "match",
      "glob",
      "is_json",
      "starts_with",
      "ends_with",
      "contains",
      "array_contains_all",
      "array_contained_by",
      "array_overlaps"
    ].some((n) => J(e, n)) ? "boolean" : void 0;
  }
  function is(e) {
    if (d(e, "json_object") || d(e, "j_s_o_n_array") || d(e, "json_extract") || d(e, "j_s_o_n_extract") || pt(e, "json_extract_path")) return "json";
    if (pt(e, "json_extract_scalar") || d(e, "json_value")) return "text";
    if (d(e, "to_json") || d(e, "json_keys")) return "json";
    if (d(e, "json_array_length")) return "integer";
    if (d(e, "json_typeof") || d(e, "jsonb_typeof") || d(e, "json_type")) return "text";
    const t = d(e, "function");
    if (!_(t)) return;
    const n = String(t.name ?? "").toLowerCase();
    if ([
      "json_build_object",
      "json_build_array",
      "json_object",
      "json_array",
      "json_keys",
      "to_json"
    ].includes(n)) return "json";
    if ([
      "jsonb_build_object",
      "jsonb_build_array",
      "to_jsonb",
      "jsonb_path_query",
      "jsonb_path_query_first",
      "jsonb_path_query_array"
    ].includes(n)) return "jsonb";
    if ([
      "json_extract",
      "json_query",
      "json_set",
      "json_insert",
      "json_replace",
      "json_remove",
      "json_patch",
      "json_merge_patch",
      "json_array_append",
      "json_array_insert"
    ].includes(n)) return "json";
    if ([
      "json_query_array"
    ].includes(n)) return "array<json>";
    if ([
      "json_value_array"
    ].includes(n)) return "array<text>";
    if ([
      "json_extract_scalar",
      "json_value",
      "json_search",
      "get_json_object",
      "json_tuple",
      "jsonextractstring",
      "jsonb_extract_path_text"
    ].includes(n)) return "text";
    if ([
      "json_array_length",
      "jsonb_array_length",
      "json_length",
      "json_size"
    ].includes(n) || [
      "jsonextractint",
      "jsonextractuint"
    ].includes(n)) return "integer";
    if ([
      "jsonextractfloat"
    ].includes(n)) return "decimal";
    if ([
      "jsonhas",
      "json_valid",
      "jsonb_path_exists",
      "json_array_contains"
    ].includes(n)) return "boolean";
    if ([
      "json_typeof",
      "jsonb_typeof",
      "json_type"
    ].includes(n)) return "text";
  }
  function pt(e, t) {
    return _(e) ? _(e[t]) ? true : Object.values(e).some((n) => Array.isArray(n) ? n.some((r) => pt(r, t)) : pt(n, t)) : false;
  }
  function Qf(e, t, n) {
    if (d(e, "interval")) return "interval";
    const r = d(e, "add") ?? d(e, "sub");
    if (_(r)) {
      const o = _(r.left) ? E(r.left, "temporal_left", t, n, "generic").type : void 0, c = _(r.right) ? E(r.right, "temporal_right", t, n, "generic").type : void 0;
      if (o && c) {
        if (Re(o) && c === "interval") return o;
        if (o === "interval" && Re(c)) return c;
        if (o === "interval" && c === "interval") return "interval";
        if (Re(o) && Re(c) && d(e, "sub")) return "integer";
      }
    }
    if (d(e, "extract")) return "integer";
    if (d(e, "at_time_zone")) return "datetimeoffset";
    if (d(e, "day") || d(e, "month") || d(e, "year") || d(e, "quarter") || d(e, "weekofyear") || d(e, "week_of_year") || d(e, "date_diff")) return "integer";
    if (d(e, "last_day") || d(e, "next_day") || d(e, "add_months")) return "date";
    if (d(e, "months_between")) return "decimal";
    if (d(e, "epoch") || d(e, "epoch_ms") || d(e, "epoch_us") || d(e, "epoch_ns")) return "integer";
    const s = d(e, "function");
    if (!_(s)) return;
    const a = String(s.name ?? "").toLowerCase();
    if ([
      "date_add",
      "date_sub",
      "timestamp_add",
      "timestamp_sub",
      "datetime_add",
      "datetime_sub",
      "add_months",
      "dateadd",
      "timeadd",
      "timestampadd",
      "adddays",
      "addmonths",
      "addyears",
      "subtractdays",
      "subtractmonths",
      "subtractyears"
    ].includes(a)) {
      const o = N(s).map((c) => E(c, "temporal", t, n, "generic").type).find(Re);
      return o || (a.startsWith("timestamp") ? "timestamp" : a.startsWith("datetime") ? "datetime" : a.startsWith("time") ? "time" : "date");
    }
    if ([
      "date_trunc",
      "timestamp_trunc",
      "datetime_trunc",
      "datetrunc",
      "tostartofday",
      "tostartofhour",
      "tostartofminute",
      "tostartofweek",
      "tostartofmonth",
      "tostartofyear",
      "trunc"
    ].includes(a)) {
      const o = N(s), c = o[1] ?? o[0];
      if (c) {
        const u = E(c, "temporal", t, n, "generic").type;
        if (/date/i.test(u) && !/time|timestamp|datetime/i.test(u)) return "date";
        if (/time/i.test(u) && !/timestamp|datetime/i.test(u)) return "time";
      }
      return a === "date_trunc" || a === "timestamp_trunc" ? "timestamp" : "datetime";
    }
    if ([
      "time_floor",
      "time_ceil",
      "time_shift"
    ].includes(a) || a === "time_parse") return "timestamp";
    if (a === "time_format") return "text";
    if (a === "time_extract" || a === "date_part" || a === "datepart" || a === "extract" || /^to(?:year|month|day|hour|minute|second|unixtimestamp)/i.test(a) || [
      "quarter",
      "weekofyear"
    ].includes(a)) return "integer";
    if (a === "datename") return "text";
    if ([
      "datediff",
      "date_diff",
      "timestampdiff",
      "timestamp_diff"
    ].includes(a) || [
      "unix_seconds",
      "unix_millis",
      "unix_micros",
      "unix_timestamp",
      "time_to_sec"
    ].includes(a) || [
      "epoch",
      "epoch_ms",
      "epoch_us",
      "epoch_ns"
    ].includes(a)) return "integer";
    if ([
      "make_interval",
      "justify_interval",
      "justify_days",
      "justify_hours",
      "numtodsinterval",
      "numtoyminterval"
    ].includes(a)) return "interval";
    if (a === "date_bin") {
      const o = N(s), c = o[1] ?? o[0];
      if (c) {
        const u = E(c, "temporal", t, n, "generic").type;
        if (Re(u)) return u;
      }
      return "timestamp";
    }
    if ([
      "make_date",
      "date_from_parts",
      "parse_date",
      "to_date",
      "str_to_date",
      "ts_or_ds_to_date",
      "last_day",
      "last_day_of_month",
      "eomonth",
      "curdate",
      "utc_date",
      "today",
      "yesterday",
      "next_day"
    ].includes(a)) return "date";
    if ([
      "make_time",
      "time_from_parts",
      "parse_time",
      "to_time",
      "curtime",
      "utc_time",
      "sec_to_time"
    ].includes(a)) return "time";
    if ([
      "make_timestamp",
      "timestamp_from_parts",
      "datetime_from_parts",
      "parse_timestamp",
      "to_timestamp",
      "from_unixtime",
      "tumble_start",
      "tumble_end",
      "hop_start",
      "hop_end"
    ].includes(a)) return "timestamp";
    if ([
      "parse_datetime",
      "to_datetime"
    ].includes(a)) return "datetime";
    if ([
      "clock_timestamp",
      "statement_timestamp",
      "transaction_timestamp",
      "current_timestamp",
      "pg_postmaster_start_time",
      "getdate",
      "sysdatetime",
      "sysutcdatetime",
      "sysdate",
      "systimestamp"
    ].includes(a)) return "timestamp";
  }
  function Re(e) {
    return /^(date|time|timestamp|datetime)$/i.test(e);
  }
  function Gf(e) {
    const t = d(e, "function");
    if (!_(t)) return;
    const n = String(t.name ?? "").toLowerCase();
    if ([
      "st_geogpoint",
      "st_geogfromtext",
      "st_geogfromgeojson",
      "st_geogfromwkb",
      "to_geography"
    ].includes(n)) return "geography";
    if ([
      "st_point",
      "st_makepoint",
      "st_makeenvelope",
      "to_geometry",
      "st_geomfromtext",
      "st_geometryfromtext",
      "st_geomfromgeojson",
      "st_geomfromwkb",
      "st_setsrid",
      "st_transform",
      "st_buffer",
      "st_centroid",
      "st_union",
      "st_intersection",
      "st_difference",
      "st_envelope",
      "st_boundary"
    ].includes(n)) return "geometry";
    if ([
      "st_astext",
      "st_aswkt",
      "st_asgeojson",
      "st_geohash"
    ].includes(n)) return "text";
    if ([
      "st_asbinary",
      "st_aswkb"
    ].includes(n)) return "bytes";
    if ([
      "st_area",
      "st_distance",
      "st_length",
      "st_perimeter",
      "st_x",
      "st_y",
      "st_z",
      "st_azimuth"
    ].includes(n)) return "decimal";
    if ([
      "st_srid",
      "st_npoints",
      "st_ndims",
      "st_dimension"
    ].includes(n)) return "integer";
    if ([
      "st_contains",
      "st_coveredby",
      "st_covers",
      "st_crosses",
      "st_disjoint",
      "st_dwithin",
      "st_equals",
      "st_intersects",
      "st_overlaps",
      "st_touches",
      "st_within",
      "st_isclosed",
      "st_isempty",
      "st_isvalid"
    ].includes(n)) return "boolean";
  }
  function Zf(e) {
    if (J(e, "random") || J(e, "rand")) return "decimal";
    const t = d(e, "function");
    if (!_(t)) return;
    const n = String(t.name ?? "").toLowerCase();
    if ([
      "uuid",
      "uuid_string",
      "gen_random_uuid"
    ].includes(n)) return "uuid";
    if ([
      "encode",
      "md5",
      "password",
      "sha",
      "sha1",
      "hex",
      "to_hex"
    ].includes(n)) return "text";
    if ([
      "sha224",
      "sha256",
      "sha384",
      "sha512",
      "digest",
      "gen_random_bytes",
      "hmac"
    ].includes(n)) return "bytes";
    if ([
      "random",
      "rand"
    ].includes(n)) return "decimal";
  }
  function cs(e, t, n) {
    const r = d(e, "case");
    if (_(r)) {
      const c = (Array.isArray(r.whens) ? r.whens : []).flatMap((u) => Array.isArray(u) && _(u[1]) ? [
        u[1]
      ] : []);
      return _(r.else_) && c.push(r.else_), B(c, t, n);
    }
    const s = d(e, "if_func");
    if (_(s)) {
      const c = [
        s.true_value,
        s.false_value
      ].filter(_);
      return B(c, t, n);
    }
    const a = d(e, "nvl2");
    if (_(a)) {
      const c = [
        a.true_value,
        a.false_value
      ].filter(_);
      return B(c, t, n);
    }
    const o = d(e, "function");
    if (_(o) && String(o.name ?? "").toLowerCase() === "choose") return B(N(o).slice(1), t, n);
    if (_(o) && String(o.name ?? "").toLowerCase() === "multiif") {
      const c = N(o), u = c.filter((l, m) => m % 2 === 1 || m === c.length - 1);
      return B(u, t, n);
    }
    if (_(o) && String(o.name ?? "").toLowerCase() === "choose") return B(N(o).slice(1), t, n);
  }
  function _s(e, t, n) {
    const r = d(e, "array_func");
    if (_(r) && Array.isArray(r.expressions)) return `array<${B(r.expressions.filter(_), t, n) ?? "unknown"}>`;
    const s = d(e, "tuple");
    if (_(s) && Array.isArray(s.expressions)) {
      const l = s.expressions.filter(_).map((m, y) => {
        const w = je(m, y + 1), L = E(m, w, t, n, "generic").type;
        return `${w} ${L}`;
      });
      return l.length > 0 ? `record<${l.join(", ")}>` : void 0;
    }
    const a = d(e, "function");
    if (!_(a)) return;
    const o = String(a.name ?? "").toLowerCase(), c = N(a);
    if (o === "array") {
      const l = c.find((y) => _(y.select));
      if (l) {
        const w = U(l, t)[0];
        if (w) return `array<${E(w.expression, w.name ?? "array", w.schema ?? t, n, "generic", w.source, w.tableAliases).type}>`;
      }
      return `array<${B(c, t, n) ?? "unknown"}>`;
    }
    if (o === "generate_array") return `array<${B(c, t, n) ?? "integer"}>`;
    if (o === "generate_date_array") return "array<date>";
    if (o === "generate_timestamp_array") return "array<timestamp>";
    if ([
      "list_value",
      "array_value"
    ].includes(o)) return `array<${B(c, t, n) ?? "unknown"}>`;
    if ([
      "array_construct",
      "array_construct_compact"
    ].includes(o)) return `array<${B(c, t, n) ?? "variant"}>`;
    if ([
      "object_construct",
      "object_construct_keep_null"
    ].includes(o)) return "object";
    const u = tp(o, c, t, n);
    if (u) return u;
    if (o === "map") {
      const l = c.filter((L, $) => $ % 2 === 0), m = c.filter((L, $) => $ % 2 === 1), y = B(l, t, n) ?? "unknown", w = B(m, t, n) ?? "unknown";
      return `map<${y}, ${w}>`;
    }
    if (o === "named_struct") {
      const l = Xf(c, t, n);
      return l.length > 0 ? `struct<${l.join(", ")}>` : void 0;
    }
    if (o === "struct") {
      const l = c.map((m, y) => {
        const w = rt(m), L = w.name ?? je(w.expression, y + 1), $ = E(w.expression, L, t, n, "generic").type;
        return `${L} ${$}`;
      });
      return l.length > 0 ? `struct<${l.join(", ")}>` : void 0;
    }
    if (o === "struct_pack") {
      const l = ls(c, t, n);
      return l.length > 0 ? `struct<${l.join(", ")}>` : void 0;
    }
  }
  function Xf(e, t, n) {
    const r = [];
    for (let s = 0; s + 1 < e.length; s += 2) {
      const a = Te(e[s]) ?? `field_${s / 2 + 1}`, o = e[s + 1], c = E(o, a, t, n, "generic").type;
      r.push(`${M(a)} ${c}`);
    }
    return r;
  }
  function ep(e) {
    return se(e, ",").flatMap((t) => {
      const n = t.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
      if (!n) return [];
      const r = M(n[1]), s = Pe(n[2]) ?? "unknown";
      return r ? [
        `${r} ${s}`
      ] : [];
    });
  }
  function tp(e, t, n, r) {
    var _a2;
    if (![
      "transform",
      "list_transform",
      "list_apply",
      "array_transform",
      "arraymap",
      "filter",
      "array_filter",
      "list_filter",
      "arrayfilter",
      "exists",
      "forall",
      "any_match",
      "all_match",
      "none_match",
      "reduce",
      "aggregate",
      "array_reduce"
    ].includes(e)) return;
    const a = [
      "arraymap",
      "arrayfilter"
    ].includes(e) ? t[1] : t[0], o = a ? E(a, "lambda_array", n, r, "generic").type : void 0, c = o ? W(o) : void 0;
    if ([
      "filter",
      "array_filter",
      "list_filter",
      "arrayfilter"
    ].includes(e)) return o;
    if ([
      "exists",
      "forall",
      "any_match",
      "all_match",
      "none_match"
    ].includes(e)) return "boolean";
    if ([
      "reduce",
      "aggregate",
      "array_reduce"
    ].includes(e)) {
      const w = t[1];
      return w && !_(w.lambda) ? E(w, "lambda_state", n, r, "generic").type : c;
    }
    const u = (_a2 = t.find((w) => _(w.lambda))) == null ? void 0 : _a2.lambda, l = _(u) && _(u.body) ? u.body : void 0, m = _(u) && Array.isArray(u.parameters) ? u.parameters.map(h).filter((w) => !!w) : [];
    return `array<${(l ? us(l, new Map(m.map((w) => [
      w.toLowerCase(),
      c ?? "unknown"
    ])), n, r) : void 0) ?? c ?? "unknown"}>`;
  }
  function us(e, t, n, r) {
    var _a2;
    const s = d(e, "column"), a = _(s) ? (_a2 = h(s.name)) == null ? void 0 : _a2.toLowerCase() : void 0;
    if (a && t.has(a)) return t.get(a);
    if (d(e, "lower") || d(e, "upper") || d(e, "trim") || d(e, "initcap")) return "text";
    if (d(e, "length") || d(e, "char_length") || d(e, "cardinality")) return "integer";
    if (d(e, "array_contains")) return "boolean";
    const o = os(e);
    if (o) return o;
    const c = d(e, "add") ?? d(e, "sub") ?? d(e, "mul") ?? d(e, "div") ?? d(e, "int_div") ?? d(e, "mod");
    if (_(c)) {
      const u = [
        c.left,
        c.right,
        c.this,
        c.expression
      ].filter(_).map((l) => us(l, t, n, r) ?? E(l, "lambda_arg", n, r, "generic").type);
      if (u.some((l) => /decimal|numeric|real|double|float/i.test(l))) return "decimal";
      if (u.some((l) => /int|number|bigint|smallint/i.test(l))) return "integer";
    }
    return E(e, "lambda_body", n, r, "generic").type;
  }
  function ls(e, t, n) {
    return e.flatMap((r, s) => {
      const a = _(r.named_argument) ? r.named_argument : void 0, o = h(a == null ? void 0 : a.name) ?? `field_${s + 1}`, c = _(a == null ? void 0 : a.value) ? a.value : void 0;
      if (!c) return [];
      const u = E(c, o, t, n, "generic").type;
      return [
        `${M(o)} ${u}`
      ];
    });
  }
  function np(e, t, n) {
    if (d(e, "lower") || d(e, "upper") || d(e, "trim") || d(e, "initcap") || d(e, "substring") || d(e, "substr") || d(e, "overlay")) return "text";
    if (d(e, "length") || d(e, "char_length") || d(e, "bit_length") || d(e, "octet_length") || d(e, "str_position")) return "integer";
    if (J(e, "random") || J(e, "rand") || d(e, "degrees") || d(e, "radians")) return "decimal";
    if (d(e, "cardinality") || d(e, "array_length") || d(e, "array_size") || d(e, "array_position")) return "integer";
    if (d(e, "array_contains")) return "boolean";
    if (d(e, "to_number")) return "decimal";
    if (d(e, "json_query") || d(e, "parse_json")) return "json";
    if (d(e, "typeof")) return "text";
    const r = d(e, "nvl");
    if (_(r)) return B([
      r.this,
      r.expression
    ].filter(_), t, n);
    const s = ap(e, t, n);
    if (s) return s;
    const a = d(e, "array_append");
    if (_(a)) return G([
      a.this,
      a.expression
    ].filter(_), t, n);
    const o = d(e, "array_prepend");
    if (_(o)) return G([
      o.this,
      o.expression
    ].filter(_), t, n);
    const c = d(e, "array_distinct");
    if (_(c)) return G([
      c.this
    ].filter(_), t, n);
    const u = d(e, "array_remove");
    if (_(u)) return G([
      u.this,
      u.expression
    ].filter(_), t, n);
    const l = d(e, "array_reverse");
    if (_(l)) return G([
      l.this
    ].filter(_), t, n);
    const m = d(e, "array_compact");
    if (_(m)) return G([
      m.this
    ].filter(_), t, n);
    const y = d(e, "array_intersect");
    if (_(y)) return G(N(y), t, n);
    const w = d(e, "array_union");
    if (_(w)) return G([
      w.this,
      w.expression
    ].filter(_), t, n);
    const L = d(e, "array_except");
    if (_(L)) return G([
      L.this,
      L.expression
    ].filter(_), t, n);
    const $ = d(e, "abs") ?? d(e, "round") ?? d(e, "ceil") ?? d(e, "ceiling") ?? d(e, "floor");
    if (_($)) {
      const k = et([
        $.this,
        ...Array.isArray($.args) ? $.args : []
      ].filter(Boolean));
      return k ? E(k, "scalar", t, n, "generic").type : "decimal";
    }
    const S = d(e, "coalesce") ?? d(e, "nullif");
    if (_(S)) return gt(S, n) ?? B(N(S), t, n);
    const T = d(e, "function");
    if (!_(T)) return;
    const C = String(T.name ?? "").toLowerCase();
    if ([
      "nextval",
      "currval",
      "lastval",
      "setval"
    ].includes(C)) return "bigint";
    if (C === "try") {
      const k = N(T)[0];
      return k ? E(k, "scalar", t, n, "generic").type : void 0;
    }
    if ([
      "lower",
      "upper",
      "lowerutf8",
      "upperutf8",
      "reverse",
      "initcap",
      "trim",
      "ltrim",
      "rtrim",
      "substring",
      "substr",
      "substring_index",
      "stuff",
      "lpad",
      "rpad",
      "chr",
      "code_points_to_string",
      "elt",
      "left",
      "right",
      "repeat",
      "overlay",
      "replace",
      "regexp_replace",
      "regexp_extract",
      "regexp_substr",
      "convert_from",
      "replaceall",
      "replaceregexpall",
      "replaceregexpone",
      "split_part",
      "concat",
      "concat_ws",
      "to_char",
      "time_to_str",
      "date_format",
      "format_date",
      "pg_typeof",
      "quote_ident",
      "quote_literal",
      "quote_nullable",
      "inet_ntoa",
      "to_json_string",
      "json_value",
      "json_extract_string",
      "tidb_version",
      "stringify_json",
      "from_utf8",
      "typeof",
      "system$typeof",
      "sha2",
      "json_unquote",
      "json_pretty",
      "to_base64",
      "check_json",
      "tostring",
      "format",
      "bin",
      "json_type",
      "format_datetime",
      "formatdatetime",
      "soundex",
      "space",
      "to_varchar",
      "inet6_ntoa",
      "make_set",
      "export_set",
      "classifier",
      "base64_encode",
      "base64_decode_string",
      "decompress_string",
      "parse_url",
      "arraystringconcat",
      "current_catalog",
      "current_schema",
      "inet_client_addr",
      "current_query",
      "current_database",
      "current_user",
      "current_warehouse",
      "current_version",
      "current_account",
      "current_region",
      "current_role",
      "database",
      "schema",
      "user",
      "suser_name",
      "system_user",
      "last_query_id",
      "obj_description",
      "col_description",
      "pg_get_expr",
      "currentdatabase",
      "currentuser",
      "version",
      "db_name",
      "host_name",
      "app_name",
      "stats",
      "quote",
      "sqlite_version",
      "sqlite_source_id",
      "fts5_get_locale",
      "fts5_insttoken",
      "printf",
      "highlight",
      "snippet",
      "dump",
      "conv",
      "url_extract_host",
      "url_extract_protocol",
      "url_extract_path",
      "url_extract_query",
      "url_extract_fragment",
      "url_encode",
      "bytearray_substring",
      "json_type",
      "jsontype",
      "to_clob",
      "rawtohex",
      "object_name",
      "schema_name"
    ].includes(C)) return "text";
    if ([
      "length",
      "char_length",
      "character_length",
      "bit_length",
      "byte_length",
      "octet_length",
      "ascii",
      "codepoint",
      "instr",
      "locate",
      "strpos",
      "position",
      "charindex",
      "size",
      "match_number",
      "array_position",
      "array_size",
      "array_ndims",
      "array_upper",
      "array_lower",
      "field",
      "find_in_set",
      "inet_aton",
      "inet_client_port",
      "datalength",
      "width_bucket",
      "num_nonnulls",
      "num_nulls",
      "crc32",
      "farm_fingerprint",
      "cityhash64",
      "siphash64",
      "checksum",
      "levenshtein",
      "editdistance",
      "bit_count",
      "bitcount",
      "bitmap_count",
      "hll_cardinality",
      "jsonlength",
      "connection_id",
      "last_insert_id",
      "changes",
      "total_changes",
      "last_insert_rowid",
      "pg_backend_pid",
      "inet_server_port",
      "txid_current",
      "binary_checksum",
      "patindex",
      "monotonically_increasing_id",
      "ora_hash",
      "json_storage_size",
      "day",
      "dayofmonth",
      "month",
      "year",
      "quarter",
      "week",
      "weekofyear",
      "hour",
      "minute",
      "second",
      "db_id",
      "object_id",
      "isdate",
      "isnumeric"
    ].includes(C)) return "integer";
    if (C === "matchinfo") return "bytes";
    if (C === "offsets") return "text";
    if (C === "bm25") return "decimal";
    if ([
      "regexp_count"
    ].includes(C) || [
      "regexp_instr",
      "regexp_position"
    ].includes(C)) return "integer";
    if ([
      "regexp",
      "regexp_full_match",
      "regexp_contains",
      "regexp_like",
      "rlike",
      "match",
      "prefix",
      "suffix",
      "starts_with",
      "ends_with",
      "startswith",
      "endswith",
      "json_contains",
      "json_valid",
      "json_array_contains",
      "is_null_value",
      "is_inf",
      "is_nan",
      "isfinite",
      "is_ipv4",
      "is_ipv6",
      "contains",
      "has",
      "list_has",
      "list_has_all",
      "list_has_any",
      "array_contains_all",
      "array_contained_by",
      "array_overlaps",
      "empty",
      "notempty"
    ].includes(C)) return "boolean";
    if ([
      "regexp_matches",
      "regexp_match",
      "split",
      "str_split",
      "string_to_array",
      "regexp_split",
      "regexp_extract_all",
      "parse_ident"
    ].includes(C) || [
      "regexp_split_to_array"
    ].includes(C)) return "array<text>";
    if (C === "regexp_split_to_table" || C === "array_dims") return "text";
    if ([
      "to_tsvector",
      "setweight"
    ].includes(C)) return "tsvector";
    if ([
      "to_tsquery",
      "plainto_tsquery",
      "phraseto_tsquery",
      "websearch_to_tsquery"
    ].includes(C)) return "tsquery";
    if (C === "object_keys") return "array<text>";
    if (C === "to_code_points") return "array<integer>";
    if ([
      "uuid",
      "uuid_string",
      "gen_random_uuid",
      "generate_uuid",
      "generateuuidv4",
      "newid",
      "newsequentialid"
    ].includes(C)) return "uuid";
    if ([
      "md5",
      "sha",
      "sha1",
      "hex",
      "to_hex"
    ].includes(C)) return "text";
    if (C === "decode") {
      const k = N(T);
      return k.length > 2 ? B([
        ...k.slice(2).filter((D, K) => K % 2 === 0),
        k.at(-1)
      ].filter(_), t, n) : "bytes";
    }
    if ([
      "sha224",
      "sha256",
      "sha384",
      "sha512",
      "md5_binary",
      "sha2_binary",
      "to_binary",
      "convert_to",
      "uuid_to_bin",
      "to_utf8",
      "from_base64",
      "unhex",
      "hextoraw",
      "inet6_aton",
      "aes_encrypt",
      "aes_decrypt",
      "base64_decode_binary",
      "compress",
      "decompress_binary",
      "zeroblob",
      "sys_guid"
    ].includes(C)) return "bytes";
    if ([
      "random",
      "rand"
    ].includes(C)) return "decimal";
    if ([
      "array_length",
      "array_size",
      "cardinality",
      "array_sum",
      "hash",
      "list_position",
      "list_unique",
      "xxhash64"
    ].includes(C)) return "integer";
    if ([
      "array_contains",
      "list_contains"
    ].includes(C)) return "boolean";
    if (C === "array_join") return "text";
    if (C === "arrayjoin") {
      const k = G(N(T), t, n);
      return k ? W(k) ?? k : void 0;
    }
    if (C === "flatten") {
      const k = G(N(T), t, n);
      return k ? W(k) ?? k : void 0;
    }
    if (C === "array_flatten") {
      const k = G(N(T), t, n), D = k ? W(k) : void 0;
      return D && /^array\s*</i.test(D) ? D : k;
    }
    if ([
      "array_compact",
      "array_intersect",
      "array_union",
      "array_except",
      "arraycompact",
      "arrayintersect",
      "arrayexcept",
      "list_slice",
      "list_reverse",
      "list_concat",
      "list_resize",
      "list_distinct",
      "list_sort",
      "list_select",
      "array_pop_back",
      "array_pop_front",
      "array_push_back",
      "array_push_front"
    ].includes(C)) return G(N(T), t, n);
    if (C === "list_grade_up") return "array<integer>";
    if (C === "array_zip") {
      const k = N(T).map((D, K) => {
        const I = E(D, `array_zip_${K + 1}`, t, n, "generic").type;
        return `field_${K + 1} ${W(I) ?? "unknown"}`;
      });
      return k.length > 0 ? `array<struct<${k.join(", ")}>>` : "array<struct<>>";
    }
    if ([
      "array_all",
      "array_any"
    ].includes(C)) return "boolean";
    if ([
      "array_first",
      "array_last",
      "list_extract",
      "array_extract"
    ].includes(C)) {
      const k = G(N(T), t, n);
      return k ? W(k) ?? k : void 0;
    }
    if ([
      "list_value",
      "array_value"
    ].includes(C)) return `array<${B(N(T), t, n) ?? "unknown"}>`;
    if (C === "from_json") {
      const k = Te(N(T)[1]), D = k ? ep(k) : [];
      return D.length > 0 ? `struct<${D.join(", ")}>` : "json";
    }
    if (C === "struct_pack") {
      const k = ls(N(T), t, n);
      return k.length > 0 ? `struct<${k.join(", ")}>` : void 0;
    }
    if (C === "array_to_string") return "text";
    if ([
      "array_cat",
      "array_concat",
      "array_slice",
      "array_distinct",
      "array_prepend",
      "array_append",
      "array_remove",
      "array_replace",
      "array_reverse",
      "array_sort",
      "arraycat",
      "arrayconcat",
      "arrayslice",
      "arraydistinct",
      "arrayreverse"
    ].includes(C)) return G(N(T), t, n);
    if ([
      "current_date"
    ].includes(C)) return "date";
    if ([
      "current_time"
    ].includes(C)) return "time";
    if ([
      "current_timestamp",
      "now",
      "localtimestamp",
      "utc_timestamp",
      "pg_postmaster_start_time",
      "timestamp_seconds",
      "timestamp_millis",
      "timestamp_micros",
      "date_parse"
    ].includes(C)) return "timestamp";
    if (C === "julianday") return "decimal";
    if (C === "unixepoch") return rp(T);
    if (C === "mz_now") return "mz_timestamp";
    if (C === "current_datetime") return "datetime";
    if (C === "timestamp" || C === "todatetime") return "timestamp";
    if (C === "datetime") return "datetime";
    if (C === "time") return "time";
    if (C === "age") return "interval";
    if ([
      "to_bitmap",
      "hll_hash"
    ].includes(C)) return C === "to_bitmap" ? "bitmap" : "hll";
    if (C === "varbinary_to_uint256") return "decimal";
    if (C === "scope_identity" || C === "isnumeric" || [
      "grouping",
      "grouping_id",
      "groupingid"
    ].includes(C)) return "integer";
    if (C === "convert" || C === "try_convert") {
      const k = Array.isArray(T.args) ? T.args[0] : void 0, D = _(k) ? Y(k.data_type ?? k) : void 0;
      if (D) return D;
    }
    if ([
      "abs",
      "round",
      "ceil",
      "ceiling",
      "floor",
      "degrees",
      "radians",
      "truncate",
      "safe_add",
      "safe_subtract",
      "safe_multiply",
      "pmod",
      "div",
      "mod"
    ].includes(C)) return B(N(T), t, n) ?? "decimal";
    if ([
      "safe_divide",
      "ieee_divide",
      "cbrt"
    ].includes(C)) return "decimal";
    if ([
      "factorial"
    ].includes(C)) return "integer";
    if ([
      "to_number",
      "try_to_number",
      "to_decimal",
      "try_to_decimal",
      "try_to_decfloat",
      "zeroifnull",
      "nullifzero"
    ].includes(C)) return "decimal";
    if (/^to(?:u?int|integer|bigint|smallint)/i.test(C)) return "integer";
    if (/^to(?:float|double|decimal)/i.test(C)) return "decimal";
    if (C === "tobool" || C === "to_boolean" || C === "try_to_boolean") return "boolean";
    if (C === "touuid") return "uuid";
    if (C === "todate") return "date";
    if (C === "try_base64_decode_string") return "text";
    if (C === "try_base64_decode_binary") return "bytes";
    if (C === "check_xml") return "text";
    if ([
      "row_to_json",
      "json_query",
      "parse_json",
      "json_set",
      "json_insert",
      "json_replace",
      "json_remove",
      "json_patch",
      "json_strip_nulls",
      "json_merge_patch",
      "json_merge_preserve",
      "json_array_append",
      "json_array_insert"
    ].includes(C)) return "json";
    if (C === "json_modify") return "text";
    if (C === "json_query_array") return "array<json>";
    if (C === "json_value_array") return "array<text>";
    if (C === "get") return "variant";
    if (C === "to_regclass") return "regclass";
    if (C === "to_variant") return "variant";
    if (C === "to_object") return "object";
    if (C === "to_array" || C === "as_array") return "array<variant>";
    if (C === "as_object") return "object";
    if (C === "as_varchar") return "text";
    if (C === "object_insert") return "object";
    if ([
      "cosine_distance",
      "euclidean_distance",
      "manhattan_distance"
    ].includes(C)) return "decimal";
    if (C === "generate_embedding") return "vector";
    if (C === "ai_classify") return "object";
    if ([
      "ai_agg",
      "ml_translate"
    ].includes(C)) return "text";
    if ([
      "ml_forecast",
      "vector_search"
    ].includes(C)) return "variant";
    if ([
      "sqrt",
      "power",
      "pow",
      "exp",
      "ln",
      "log",
      "log10",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "atan2",
      "radians",
      "degrees",
      "pi",
      "ratio_to_report"
    ].includes(C) || [
      "months_between"
    ].includes(C)) return "decimal";
    if ([
      "sign"
    ].includes(C)) return "integer";
    if ([
      "coalesce",
      "ifnull",
      "isnull",
      "nvl",
      "nullif",
      "greatest",
      "least"
    ].includes(C)) return gt(T, n) ?? B(N(T), t, n);
    if (C === "nvl2") {
      const k = N(T);
      return B(k.slice(1, 3), t, n);
    }
    if (C === "multiif") {
      const k = N(T), D = k.filter((K, I) => I % 2 === 1 || I === k.length - 1);
      return B(D, t, n);
    }
  }
  function gt(e, t) {
    const n = N(e)[0];
    return _(n) ? ds(n, t) : void 0;
  }
  function rp(e) {
    return N(e).map(Te).some((n) => n ? [
      "subsec",
      "subsecond"
    ].includes(n.toLowerCase()) : false) ? "decimal" : "integer";
  }
  function sp(e, t) {
    const n = d(e, "coalesce") ?? d(e, "nullif");
    if (_(n)) return gt(n, t);
    const r = d(e, "function");
    if (!_(r)) return;
    const s = String(r.name ?? "").toLowerCase();
    return [
      "coalesce",
      "ifnull",
      "nvl",
      "nullif",
      "greatest",
      "least"
    ].includes(s) ? gt(r, t) : void 0;
  }
  function ap(e, t, n) {
    const r = d(e, "map_from_arrays");
    if (_(r)) {
      const m = _(r.this) ? E(r.this, "map_keys", t, n, "generic").type : void 0, y = _(r.expression) ? E(r.expression, "map_values", t, n, "generic").type : void 0, w = m ? W(m) : void 0, L = y ? W(y) : void 0;
      return w && L ? `map<${w}, ${L}>` : void 0;
    }
    const s = d(e, "map_keys");
    if (_(s)) {
      const m = Se(s.this, t, n);
      return m ? `array<${m[0]}>` : void 0;
    }
    const a = d(e, "map_values");
    if (_(a)) {
      const m = Se(a.this, t, n);
      return m ? `array<${m[1]}>` : void 0;
    }
    const o = d(e, "element_at");
    if (_(o)) {
      const m = Se(o.this, t, n);
      if (m) return m[1];
      const y = _(o.this) ? E(o.this, "element_at", t, n, "generic").type : void 0;
      return y ? W(y) : void 0;
    }
    const c = d(e, "subscript");
    if (_(c)) {
      const m = Se(c.this, t, n);
      if (m) return m[1];
    }
    const u = d(e, "function");
    if (!_(u)) return;
    const l = String(u.name ?? "").toLowerCase();
    if ([
      "map_keys",
      "mapkeys"
    ].includes(l)) {
      const m = Se(N(u)[0], t, n);
      return m ? `array<${m[0]}>` : void 0;
    }
    if ([
      "map_values",
      "mapvalues"
    ].includes(l)) {
      const m = Se(N(u)[0], t, n);
      return m ? `array<${m[1]}>` : void 0;
    }
    if ([
      "element_at",
      "map_extract"
    ].includes(l)) {
      const m = N(u)[0], y = Se(m, t, n);
      if (y) return y[1];
      if (_(m)) {
        const w = E(m, "element_at", t, n, "generic").type;
        return W(w);
      }
    }
    if (l === "map_contains" || l === "mapcontains") return "boolean";
    if (l === "map_entries") {
      const m = Se(N(u)[0], t, n);
      return m ? `array<struct<key ${m[0]}, value ${m[1]}>>` : void 0;
    }
    if ([
      "map_concat",
      "map_cat",
      "map_delete",
      "map_insert",
      "map_pick",
      "map_filter",
      "transform_values"
    ].includes(l)) return N(u).map((m) => E(m, "map_func_arg", t, n, "generic").type).find((m) => /^map\s*</i.test(m));
    if (l === "map_from_arrays") {
      const m = N(u), y = m[0] ? E(m[0], "map_keys", t, n, "generic").type : void 0, w = m[1] ? E(m[1], "map_values", t, n, "generic").type : void 0, L = y ? W(y) : void 0, $ = w ? W(w) : void 0;
      return L && $ ? `map<${L}, ${$}>` : void 0;
    }
  }
  function Se(e, t, n) {
    if (!_(e)) return;
    const r = E(e, "map_arg", t, n, "generic").type;
    return r === "unknown" ? void 0 : xt(r);
  }
  function G(e, t, n) {
    return e.map((r) => E(r, "array_arg", t, n, "generic").type).find((r) => W(r) || /^array\s*</i.test(r));
  }
  function N(e) {
    return [
      ..._(e.this) ? [
        e.this
      ] : [],
      ...Array.isArray(e.args) ? e.args.filter(_) : [],
      ...Array.isArray(e.expressions) ? e.expressions.filter(_) : []
    ];
  }
  function B(e, t, n) {
    const r = e.map((s, a) => E(s, `arg_${a + 1}`, t, n, "generic").type).filter((s) => s !== "unknown");
    return ms(r);
  }
  function ms(e) {
    if (e.length !== 0) return e.some((t) => /text|char|string|varchar/i.test(t)) ? "text" : e.some((t) => /timestamp|datetime/i.test(t)) ? "timestamp" : e.some((t) => /^date$/i.test(t)) ? "date" : e.some((t) => /decimal|numeric|real|double|float/i.test(t)) ? "decimal" : e.some((t) => /int|number|bigint|smallint/i.test(t)) ? "integer" : e.some((t) => /bool/i.test(t)) ? "boolean" : e[0];
  }
  function op(e, t, n) {
    const r = d(e, "window_function");
    if (!_(r) || !_(r.this)) return;
    const s = r.this;
    if (J(s, "row_number") || J(s, "rank") || J(s, "dense_rank") || J(s, "ntile") || J(s, "n_tile")) return "integer";
    if (J(s, "percent_rank") || J(s, "cume_dist")) return "decimal";
    const a = d(s, "lag") ?? d(s, "lead") ?? d(s, "first_value") ?? d(s, "last_value") ?? d(s, "nth_value");
    if (_(a) && _(a.this)) return E(a.this, "window_value", t, n, "generic").type;
    const o = d(s, "function");
    if (_(o)) {
      const c = String(o.name ?? "").toLowerCase();
      if ([
        "laginframe",
        "leadinframe"
      ].includes(c)) {
        const u = N(o)[0];
        return u ? E(u, "window_value", t, n, "generic").type : void 0;
      }
    }
    return sn(s, t, n);
  }
  function ip(e) {
    const t = d(e, "cast") ?? d(e, "try_cast") ?? d(e, "safe_cast");
    return _(t) ? Y(t.to) : void 0;
  }
  function cp(e) {
    const t = d(e, "literal");
    if (_(t)) {
      const n = String(t.literal_type ?? ""), r = String(t.value ?? "");
      if (n === "string") return "text";
      if (n === "boolean") return "boolean";
      if (n === "number") return r.includes(".") ? "decimal" : "integer";
      if (n === "date") return "date";
      if (n === "time") return "time";
      if (n === "timestamp") return "timestamp";
      if (n === "interval") return "interval";
      if (n === "null") return "null";
    }
    if (J(e, "null")) return "null";
  }
  function ds(e, t) {
    var _a2, _b2;
    if (t.mode === "none") return;
    const n = d(e, "placeholder") ?? d(e, "parameter");
    if (_(n)) {
      if (t.mode === "positional") {
        const r = typeof n.index == "number" ? n.index : 1, s = (_a2 = t.binds.find((a) => a.index === r)) == null ? void 0 : _a2.type;
        return s ? ie(s) : void 0;
      }
      if (t.mode === "named") {
        const r = typeof n.name == "string" ? n.name : void 0, s = r ? (_b2 = t.binds.find((a) => a.name === r)) == null ? void 0 : _b2.type : void 0;
        return s ? ie(s) : void 0;
      }
    }
  }
  function fs(e, t, n) {
    var _a2, _b2, _c2, _d2, _e2;
    const s = ps(e) ?? d(e, "column");
    if (!_(s)) return;
    const a = (_a2 = h(s.name)) == null ? void 0 : _a2.toLowerCase(), o = (_b2 = h(s.table)) == null ? void 0 : _b2.toLowerCase(), c = o ? n == null ? void 0 : n.get(o) : void 0, u = o ? (c == null ? void 0 : c.tableName.toLowerCase()) ?? o : void 0, l = (_c2 = c == null ? void 0 : c.schemaName) == null ? void 0 : _c2.toLowerCase();
    if (!a) return;
    const m = u ? [] : [
      ...new Set([
        ...(n == null ? void 0 : n.values()) ?? []
      ].map((w) => w.tableName))
    ].map((w) => w.toLowerCase()), y = u ? [] : [
      ...new Set([
        ...(n == null ? void 0 : n.values()) ?? []
      ].map((w) => w.schemaName).filter((w) => !!w))
    ].map((w) => w.toLowerCase());
    for (const w of t.tables) {
      if (u && w.name.toLowerCase() !== u || l && ((_d2 = w.schema) == null ? void 0 : _d2.toLowerCase()) !== l || u && !l && w.schema || !u && m.length > 0 && !m.includes(w.name.toLowerCase()) || !u && m.length > 0 && w.schema && y.length === 0 || !u && y.length > 0 && w.schema && !y.includes(w.schema.toLowerCase())) continue;
      const L = (c == null ? void 0 : c.visibleColumnNames.findIndex((T) => T.toLowerCase() === a)) ?? -1, $ = L >= 0 ? (_e2 = w.columns[L]) == null ? void 0 : _e2.name.toLowerCase() : a, S = w.columns.find((T) => T.name.toLowerCase() === $);
      if (S) return {
        table: w,
        column: S,
        nullable: (c == null ? void 0 : c.nullable) ? true : S.nullable
      };
    }
  }
  function ps(e) {
    const t = d(e, "dot");
    if (!_(t)) return;
    const n = _(t.this) ? d(t.this, "column") : void 0, r = h(t.field);
    if (!_(n) || !r) return;
    const s = h(n.table), a = h(n.name);
    if (!(!s || !a)) return {
      name: {
        name: r
      },
      table: {
        name: `${s}.${a}`
      }
    };
  }
  function _p(e, t, n) {
    const r = gs(e, t, n);
    if (r) return r;
    const s = Ut(e, t, n);
    if (!s) return;
    const a = up(s.base.column.type, s.steps);
    if (a) return {
      type: a,
      nullable: s.base.column.nullable,
      source: [
        s.base.source,
        ...s.steps.filter((o) => o.kind === "field").map((o) => o.name)
      ].join(".")
    };
  }
  function gs(e, t, n) {
    const r = d(e, "json_extract_scalar");
    if (!_(r)) return;
    const s = bs(r.this, t, n), a = Te(r.path);
    return {
      type: "text",
      nullable: s == null ? void 0 : s.column.nullable,
      source: s && a ? `${s.source}.${a}` : (s == null ? void 0 : s.source) ?? "json"
    };
  }
  function Ut(e, t, n) {
    const r = d(e, "dot");
    if (_(r)) {
      const c = Ut(r.this, t, n), u = h(r.field);
      return c && u ? {
        base: c.base,
        steps: [
          ...c.steps,
          {
            kind: "field",
            name: u
          }
        ]
      } : void 0;
    }
    const s = d(e, "subscript");
    if (_(s)) {
      const c = Ut(s.this, t, n), u = Te(s.index);
      return c && u && !dp(u) ? {
        base: c.base,
        steps: [
          ...c.steps,
          {
            kind: "field",
            name: u
          }
        ]
      } : c ? {
        base: c.base,
        steps: [
          ...c.steps,
          {
            kind: "element"
          }
        ]
      } : void 0;
    }
    const a = bs(e, t, n);
    if (a) return {
      base: a,
      steps: []
    };
    const o = d(e, "column");
    if (_(o)) {
      const c = h(o.table), u = h(o.name);
      if (c && u) {
        const l = ys(c, t, n);
        if (l && ws(l.column.type, u)) return {
          base: l,
          steps: [
            {
              kind: "field",
              name: u
            }
          ]
        };
      }
    }
  }
  function bs(e, t, n) {
    const r = d(e, "column");
    if (!_(r)) return;
    const s = h(r.name), a = h(r.table);
    if (s) return ys(s, t, n, a);
  }
  function ys(e, t, n, r) {
    const a = fs(r ? {
      column: {
        name: {
          name: e
        },
        table: {
          name: r
        }
      }
    } : {
      column: {
        name: {
          name: e
        }
      }
    }, t, n);
    if (a) return {
      table: a.table,
      column: a.column,
      source: Ct(a.table, a.column.name)
    };
  }
  function up(e, t) {
    return t.reduce((n, r) => {
      var _a2;
      if (n) return r.kind === "element" ? W(n) ?? ((_a2 = xt(n)) == null ? void 0 : _a2[1]) : /^(?:json|jsonb)$/i.test(n) || /^(?:variant|object)$/i.test(n) ? n.toLowerCase() : ws(n, r.name);
    }, e);
  }
  function ws(e, t) {
    var _a2;
    return (_a2 = lp(e).find((r) => r.name.toLowerCase() === t.toLowerCase())) == null ? void 0 : _a2.type;
  }
  function W(e) {
    const t = e.trim(), n = /^array\s*<([\s\S]+)>$/i.exec(t);
    if (n) return n[1].trim();
    const r = /^(.+)\[\]$/.exec(t);
    if (r) return r[1].trim();
  }
  function xt(e) {
    const t = /^map\s*<([\s\S]+)>$/i.exec(e.trim());
    if (!t) return;
    const n = se(t[1], ",").map((r) => r.trim());
    return n.length >= 2 && n[0] && n[1] ? [
      n[0],
      n[1]
    ] : void 0;
  }
  function lp(e) {
    const t = /^(?:struct|record|row)\s*<([\s\S]+)>$/i.exec(e.trim());
    return t ? se(t[1], ",").flatMap((n) => {
      const r = n.trim(), a = Bn(r, ":") ?? Bn(r, " ");
      return a ? [
        {
          name: M(a[0]),
          type: a[1].trim()
        }
      ] : [];
    }) : [];
  }
  function Bn(e, t) {
    let n = 0;
    for (let r = 0; r < e.length; r += 1) {
      const s = e[r];
      if ((s === "<" || s === "(") && (n += 1), (s === ">" || s === ")") && (n -= 1), n === 0 && (t === ":" ? s === ":" : /\s/.test(s))) {
        const a = e.slice(0, r).trim(), o = e.slice(r + 1).trim();
        if (a && o) return [
          a,
          o
        ];
      }
    }
  }
  function Te(e) {
    const t = d(e, "literal");
    if (_(t)) return typeof t.value == "string" ? t.value : void 0;
  }
  function mp(e) {
    const t = d(e, "literal");
    if (!_(t) || t.literal_type !== "number") return;
    const n = Number(t.value);
    return Number.isFinite(n) ? n : void 0;
  }
  function dp(e) {
    return /^\d+$/.test(e);
  }
  function fp(e, t) {
    var _a2, _b2, _c2, _d2, _e2;
    const n = d(e, "column");
    if (!_(n)) return;
    const r = h(n.name);
    if (t.mode === "positional") {
      const s = ((_a2 = r == null ? void 0 : r.match(/^\$(\d+)$/)) == null ? void 0 : _a2[1]) ?? ((_b2 = r == null ? void 0 : r.match(/^@P(\d+)$/i)) == null ? void 0 : _b2[1]), a = s ? (_c2 = t.binds.find((o) => o.index === Number(s))) == null ? void 0 : _c2.type : void 0;
      return a ? ie(a) : void 0;
    }
    if (t.mode === "named") {
      const s = (_d2 = r == null ? void 0 : r.match(/^[@$]([A-Za-z_]\w*)$/)) == null ? void 0 : _d2[1], a = s ? (_e2 = t.binds.find((o) => o.name === s)) == null ? void 0 : _e2.type : void 0;
      return a ? ie(a) : void 0;
    }
  }
  function pp(e, t, n = "generic") {
    const r = Array.isArray(e) ? e : [
      e
    ], s = zy(t);
    let a = t;
    return r.map((o) => {
      const c = U(o, a, s, n);
      return Mg(o, s), Og(o, s), Bg(o, a, s, n), Kg(o, a, s, n), Wg(o, s), Gg(o, s), Zg(o, s), a = ug(o, a, s), c;
    });
  }
  function gp(e, t) {
    return (Array.isArray(e) ? e : [
      e
    ]).map((r, s) => {
      const a = t.find((u) => u.index === s + 1), o = yp(r);
      if (a && a.columns.length > 0) return {
        index: s + 1,
        kind: o,
        resultKind: "static"
      };
      const c = wp(r);
      return {
        index: s + 1,
        kind: o,
        resultKind: c,
        message: ks(o, c)
      };
    });
  }
  function bp(e, t) {
    const n = [], r = t ? e.filter((s) => s.resultKind !== "static") : e.filter((s) => ![
      "static",
      "none"
    ].includes(s.resultKind));
    for (const s of r) {
      const a = s.message ?? ks(s.kind, s.resultKind);
      n.push({
        code: Lp(s.resultKind),
        message: a,
        severity: s.resultKind === "none" ? "info" : "warning"
      });
    }
    return n.length === 0 && t && n.push({
      code: "SQLDESC_UNKNOWN_RESULT_SHAPE",
      message: "SQL parsed successfully but does not expose result-set columns.",
      severity: "warning"
    }), n;
  }
  function yp(e) {
    return _(e) ? Object.keys(e)[0] ?? "unknown" : "unknown";
  }
  function wp(e) {
    return _(e) ? Cs(e) ? "none" : As(e) ? "runtime" : _(e.show) || Ls(e) || _(e.pragma) || _(e.summarize) ? "metadata" : _(e.copy) && vs(e.copy) || xs(e) ? "none" : hs(e) || vp(e) ? "static" : _(e.execute) || _(e.copy) || hp(e) ? "runtime" : _(e.select) || _(e.values) || _(e.union) || _(e.intersect) || _(e.except) || _(e.pivot) || _(e.put) || on(e) ? "unknown" : (Cp(e), "none") : "unknown";
  }
  function hp(e) {
    if (!_(e.command)) return false;
    const t = String(e.command.this ?? "").toLowerCase();
    return /^(call|execute|exec|copy)\b/.test(t);
  }
  function hs(e) {
    if (!_(e.command)) return false;
    const t = String(e.command.this ?? "").toLowerCase();
    return xp(t);
  }
  function xp(e) {
    return Ge(Kt(e)).length > 0 ? true : /^begin\s+select\b/.test(e) || /^(?:optimize|repair|check|checksum)\s+table\b/.test(e) || /^(?:list|ls)\s+@/.test(e) || /^get\s+@/.test(e) || /^(?:remove|rm)\s+@/.test(e) || /^exists\s+(?:table|database|view|dictionary)\b/.test(e) || /^explain\b/.test(e) || /^show\s+(?:clusters|users|roles|grants|settings|dictionaries|functions|databases|schemas|tables|views|materialized\s+views|columns|indexes|variables|catalogs|current\s+namespace|engines|table|create\s+(?:table|database|dictionary|view)|processlist)\b/.test(e) || /^list\s+(?:file|jar|archive)\b/.test(e) || /^(?:describe|desc)\s+table\b/.test(e) || /^help\s+(?:table|database|column)\b/.test(e);
  }
  function vp(e) {
    return _(e.execute) && Ns(e.execute).length > 0;
  }
  function xs(e) {
    if (!_(e.command)) return false;
    const t = String(e.command.this ?? "").toLowerCase();
    return /^(lock|vacuum|msck|repair|refresh|discard|cluster|reindex|reset)\b/.test(t);
  }
  function Cp(e) {
    return [
      "insert",
      "update",
      "delete",
      "merge",
      "create_table",
      "create_view",
      "drop_table",
      "undrop",
      "drop_view",
      "alter_table",
      "alter_view",
      "create_type",
      "drop_type",
      "drop_namespace",
      "create_synonym",
      "create_index",
      "drop_index",
      "alter_index",
      "create_schema",
      "drop_schema",
      "create_database",
      "drop_database",
      "create_sequence",
      "drop_sequence",
      "alter_sequence",
      "create_function",
      "create_procedure",
      "create_trigger",
      "create_task",
      "drop_function",
      "drop_procedure",
      "drop_trigger",
      "comment",
      "grant",
      "revoke",
      "raw",
      "prepare",
      "transaction",
      "commit",
      "rollback",
      "use",
      "set_statement",
      "analyze",
      "refresh",
      "truncate",
      "truncate_table",
      "locking_statement",
      "command",
      "kill",
      "declare",
      "declare_item",
      "attach",
      "detach",
      "install",
      "cache",
      "uncache",
      "load_data",
      "clone",
      "sequence_properties",
      "query_band"
    ].some((t) => _(e[t]));
  }
  function vs(e) {
    return e.kind === true && e.is_into !== true;
  }
  function Cs(e) {
    const t = _(e.function) ? String(e.function.name ?? "").toLowerCase() : void 0;
    if (t && [
      "raiserror"
    ].includes(t) || Ap(e)) return true;
    const n = Ss(e);
    return n ? [
      "checkpoint",
      "listen",
      "notify",
      "unlisten",
      "savepoint",
      "reindex",
      "cluster",
      "flush"
    ].includes(n) : false;
  }
  function As(e) {
    return Ss(e) === "dbcc";
  }
  function Ap(e) {
    var _a2;
    const t = _(e.sub) ? e.sub : void 0, n = t && _(t.left) ? d(t.left, "column") : void 0;
    return _(n) && ((_a2 = h(n.name)) == null ? void 0 : _a2.toLowerCase()) === "dfs";
  }
  function Ss(e) {
    var _a2;
    const t = _(e.column) ? e.column : void 0, n = _(e.alias) ? e.alias : void 0, r = n && _(n.this) && _(n.this.column) ? n.this.column : void 0;
    return (_a2 = h((t == null ? void 0 : t.name) ?? (r == null ? void 0 : r.name))) == null ? void 0 : _a2.toLowerCase();
  }
  function on(e) {
    var _a2;
    const t = _(e.alias) ? e.alias : void 0;
    return !t || !_(t.this) || !_(t.this.column) ? false : ((_a2 = h(t.this.column.name)) == null ? void 0 : _a2.toLowerCase()) === "watch" && !!h(t.alias);
  }
  function Sp(e) {
    return [
      "select",
      "values",
      "union",
      "intersect",
      "except",
      "pivot",
      "show",
      "summarize",
      "pragma",
      "copy",
      "execute",
      "export",
      "prepare",
      "command",
      "describe",
      "insert",
      "update",
      "delete",
      "merge",
      "create_table",
      "create_view",
      "alter_table",
      "alter_view",
      "drop_table",
      "drop_view",
      "drop_index",
      "drop_schema",
      "drop_database",
      "drop_sequence",
      "drop_type",
      "drop_namespace",
      "drop_function",
      "drop_procedure",
      "drop_trigger",
      "raw",
      "analyze",
      "attach",
      "cache",
      "comment",
      "commit",
      "create_database",
      "create_function",
      "create_index",
      "create_procedure",
      "create_schema",
      "create_sequence",
      "create_synonym",
      "create_task",
      "create_trigger",
      "create_type",
      "declare",
      "detach",
      "install",
      "grant",
      "refresh",
      "revoke",
      "rollback",
      "set_statement",
      "transaction",
      "truncate",
      "uncache",
      "use"
    ].some((n) => Pn(e, n)) ? false : [
      "alias",
      "array_func",
      "boolean",
      "case",
      "column",
      "coalesce",
      "add",
      "between",
      "bitwise_and",
      "bitwise_left_shift",
      "bitwise_or",
      "bitwise_right_shift",
      "bitwise_xor",
      "cast",
      "concat",
      "sub",
      "mul",
      "div",
      "eq",
      "exists",
      "extract",
      "function",
      "gt",
      "gte",
      "if_func",
      "i_like",
      "in",
      "is",
      "is_null",
      "is_not_null",
      "like",
      "literal",
      "lt",
      "lte",
      "mod",
      "neg",
      "not",
      "null_safe_eq",
      "null_safe_neq",
      "null",
      "paren",
      "power",
      "try_cast",
      "safe_cast",
      "similar_to",
      "subquery"
    ].some((n) => Pn(e, n));
  }
  function Pn(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }
  function Ls(e) {
    return !!_(e.describe);
  }
  function ks(e, t) {
    return t === "metadata" ? `${e.toUpperCase()} parses successfully, but its result-set shape is dialect-specific metadata and cannot be inferred statically.` : t === "runtime" ? `${e.toUpperCase()} parses successfully, but its result-set shape depends on runtime database behavior.` : t === "none" ? `${e.toUpperCase()} parses successfully and does not expose result-set columns.` : `${e.toUpperCase()} parses successfully, but no statically inferable result-set columns were found.`;
  }
  function Lp(e) {
    return e === "metadata" ? "SQLDESC_METADATA_RESULT_SHAPE" : e === "runtime" ? "SQLDESC_RUNTIME_RESULT_SHAPE" : e === "none" ? "SQLDESC_NO_RESULT_COLUMNS" : "SQLDESC_UNKNOWN_RESULT_SHAPE";
  }
  function kp(e, t) {
    return e.filter((n) => {
      const r = n.message.match(/Unknown table or alias '([^']+)' referenced by column '([^']+)'/);
      if (!r) return true;
      const [, s, a] = r, o = `${s}.${a}`.toLowerCase();
      return !t.some((c) => {
        var _a2;
        const u = (_a2 = c.source) == null ? void 0 : _a2.toLowerCase();
        return u === o || (u == null ? void 0 : u.endsWith(`.${o}`));
      });
    });
  }
  function Tp(e, t) {
    return t.some((n) => n.columns.length > 0) ? e.filter((n) => n.code !== "W001") : e;
  }
  function jp(e, t) {
    const n = Op(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function qp(e, t) {
    const n = zp(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Ip(e, t, n) {
    const r = Bp(t, n);
    return r.size === 0 ? e : e.filter((s) => {
      var _a2;
      const a = s.message.match(/Unknown column '([^']+)'(?: in table '([^']+)')?/);
      if (!a) return true;
      const o = a[1].toLowerCase(), c = (_a2 = a[2]) == null ? void 0 : _a2.toLowerCase();
      return !r.has(o) || !!(c && c !== o);
    });
  }
  function Np(e, t, n) {
    return n !== "sqlite" || !Pp(t) ? e : e.filter((r) => !/Unknown column '(?:rowid|_rowid_|oid)'/i.test(r.message));
  }
  function $p(e, t, n) {
    const r = Dp(t);
    return r.size === 0 ? e : e.filter((s) => {
      const a = s.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
      if (!a) return true;
      const [, o, c] = a, u = o.toLowerCase(), l = c.toLowerCase();
      return r.has(u) ? !n.tables.some((m) => m.name.toLowerCase() === l && m.name.toLowerCase() === u) : true;
    });
  }
  function Ep(e, t, n) {
    return n !== "oracle" || !Fp(t) ? e : e.filter((r) => !/Unknown column 'user'(?: in table 'dual')?/i.test(r.message));
  }
  function Rp(e, t) {
    const n = Mp(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Fp(e) {
    let t = false;
    return ce(e, (n) => {
      var _a2;
      t || !_(n.column) || (t = !h(n.column.table) && ((_a2 = h(n.column.name)) == null ? void 0 : _a2.toLowerCase()) === "user");
    }), t;
  }
  function Mp(e) {
    const t = /* @__PURE__ */ new Set();
    return ce(e, (n) => {
      var _a2;
      if (!_(n.column)) return;
      const r = (_a2 = h(n.column.name)) == null ? void 0 : _a2.toLowerCase();
      !h(n.column.table) && r && [
        "current_date",
        "current_time",
        "current_timestamp",
        "localtimestamp"
      ].includes(r) && t.add(r);
    }), t;
  }
  function Op(e) {
    const t = /* @__PURE__ */ new Set();
    return ce(e, (n) => {
      if (!(!_(n.function) || !Array.isArray(n.function.args))) for (const r of n.function.args) {
        const s = _(r) ? d(r, "eq") : void 0, a = _(s) && _(s.left) ? d(s.left, "column") : void 0, o = _(a) ? h(a.name) : void 0;
        o && t.add(o.toLowerCase());
      }
    }), t;
  }
  function Dp(e) {
    const t = /* @__PURE__ */ new Set();
    return ce(e, (n) => {
      if (!_(n.function)) return;
      const r = String(n.function.name ?? "").toLowerCase();
      if ([
        "row_to_json",
        "to_json",
        "to_jsonb"
      ].includes(r)) for (const s of N(n.function)) {
        const a = _(s) ? d(s, "column") : void 0;
        if (!_(a)) continue;
        const o = h(a.name);
        o && !h(a.table) && t.add(o.toLowerCase());
      }
    }), t;
  }
  function zp(e) {
    const t = /* @__PURE__ */ new Set();
    return ce(e, (n) => {
      if (!_(n.function)) return;
      const r = String(n.function.name ?? "").toLowerCase();
      if (![
        "file",
        "url"
      ].includes(r)) return;
      const s = N(n.function)[1], a = _(s) ? d(s, "column") : void 0, o = _(a) && !h(a.table) ? h(a.name) : void 0;
      o && t.add(o.toLowerCase());
    }), t;
  }
  function Bp(e, t) {
    const n = /* @__PURE__ */ new Set();
    return ce(e, (r) => {
      if (!_(r.function)) return;
      const s = String(r.function.name ?? "").toLowerCase();
      if (![
        "highlight",
        "snippet",
        "bm25",
        "fts5vocab"
      ].includes(s)) return;
      const a = N(r.function)[0], o = _(a) ? d(a, "column") : void 0, c = _(o) && !h(o.table) ? h(o.name) : void 0;
      c && t.tables.some((u) => u.name.toLowerCase() === c.toLowerCase()) && n.add(c.toLowerCase());
    }), n;
  }
  function Pp(e) {
    let t = false;
    return ce(e, (n) => {
      var _a2;
      t || !_(n.column) || (t = [
        "rowid",
        "_rowid_",
        "oid"
      ].includes(((_a2 = h(n.column.name)) == null ? void 0 : _a2.toLowerCase()) ?? ""));
    }), t;
  }
  function ce(e, t) {
    if (Array.isArray(e)) {
      e.forEach((n) => ce(n, t));
      return;
    }
    _(e) && (t(e), Object.values(e).forEach((n) => ce(n, t)));
  }
  function Up(e, t) {
    const n = new Set(t.flatMap((r) => r.source && r.name ? [
      r.name.toLowerCase()
    ] : []));
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Kp(e, t) {
    const n = new Set(t.flatMap((r) => {
      var _a2;
      const s = ((_a2 = r.source) == null ? void 0 : _a2.toLowerCase().split(".")) ?? [];
      if (s.length < 2) return [];
      const a = s.at(-2), o = s.length >= 3 ? `${s.at(-3)}.${s.at(-2)}` : void 0;
      return [
        a,
        o
      ].filter((c) => !!c);
    }));
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown table '([^']+)'/);
      if (!s) return true;
      const a = s[1].toLowerCase(), o = a.split(".").at(-1);
      return !n.has(a) && !(o && n.has(o));
    });
  }
  function Vp(e, t) {
    return t.some((n) => n.columns.length > 0) ? e.filter((n) => n.code !== "W003") : e;
  }
  function Jp(e, t) {
    return e.filter((n) => {
      const r = n.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
      if (r) {
        const [, s, a] = r;
        return !rg(t, a, s);
      }
      return true;
    });
  }
  function Hp(e, t) {
    return (Array.isArray(t) ? t : [
      t
    ]).some(ng) ? e.filter((r) => !/^INSERT row \d+ has \d+ values but target has \d+ columns$/i.test(r.message)) : e;
  }
  function Wp(e, t, n) {
    const r = tg(t, n);
    return r.size === 0 ? e : e.filter((s) => {
      const a = s.message.match(/^(UNION|EXCEPT|INTERSECT) column (\d+) has incompatible types:/i);
      return a ? !r.has(`${a[1].toLowerCase()}:${a[2]}`) : true;
    });
  }
  function Yp(e, t, n) {
    return Zp(t, n) ? e.filter((r) => !/^Incompatible comparison between .+ and .+$/i.test(r.message)) : e;
  }
  function Qp(e, t) {
    const n = Gp(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Gp(e) {
    const t = /* @__PURE__ */ new Set();
    return ce(e, (n) => {
      var _a2;
      if (!_(n.function)) return;
      const r = String(n.function.name ?? "").toLowerCase();
      if ([
        "dateadd",
        "date_add",
        "date_sub",
        "datediff",
        "date_diff",
        "timestampdiff",
        "timestamp_diff",
        "timestampadd"
      ].includes(r)) for (const s of N(n.function)) {
        const a = _(s) ? d(s, "column") : void 0, o = _(a) && !h(a.table) ? (_a2 = h(a.name)) == null ? void 0 : _a2.toLowerCase() : void 0;
        o && [
          "year",
          "quarter",
          "month",
          "week",
          "day",
          "hour",
          "minute",
          "second",
          "millisecond",
          "microsecond"
        ].includes(o) && t.add(o);
      }
    }), t;
  }
  function Zp(e, t) {
    const n = [], r = Xp(e, t);
    return ce(e, (s) => {
      for (const a of [
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "null_safe_eq",
        "null_safe_neq"
      ]) {
        const o = _(s[a]) ? s[a] : void 0;
        o && _(o.left) && _(o.right) && n.push([
          o.left,
          o.right
        ]);
      }
    }), n.length > 0 && n.every(([s, a]) => {
      if (!Un(s) || !Un(a)) return true;
      const o = E(s, "comparison_left", r, {
        mode: "none",
        binds: []
      }, "generic").type, c = E(a, "comparison_right", r, {
        mode: "none",
        binds: []
      }, "generic").type;
      return Ts(o, c);
    });
  }
  function Un(e) {
    return _(d(e, "column")) || _(ps(e));
  }
  function Xp(e, t) {
    const n = [
      ...t.tables
    ], r = new Map(t.tables.map((s) => [
      gn(s).toLowerCase(),
      s
    ]));
    for (const s of eg(e)) {
      const a = h(s.alias);
      if (!a) continue;
      const o = Le({
        table: s
      });
      if (!o) continue;
      const c = h(s.schema), u = c ? `${c}.${o}` : o, l = r.get(u.toLowerCase()) ?? r.get(o.toLowerCase());
      l && !n.some((m) => m.name.toLowerCase() === a.toLowerCase()) && n.push({
        ...l,
        schema: void 0,
        name: a
      });
    }
    return {
      tables: n
    };
  }
  function eg(e) {
    const t = [];
    return ce(e, (n) => {
      _(n.table) && t.push(n.table);
    }), t;
  }
  function tg(e, t) {
    const n = /* @__PURE__ */ new Set();
    return ce(e, (r) => {
      for (const s of [
        "union",
        "except",
        "intersect"
      ]) {
        const a = _(r[s]) ? r[s] : void 0;
        if (!a) continue;
        const o = U(a.left, t, tt()), c = U(a.right, t, tt());
        o.forEach((u, l) => {
          const m = c[l];
          if (!m) return;
          const y = E(u.expression, u.name ?? "set_left", u.schema ?? t, {
            mode: "none",
            binds: []
          }, "generic", u.source, u.tableAliases).type, w = E(m.expression, m.name ?? "set_right", m.schema ?? t, {
            mode: "none",
            binds: []
          }, "generic", m.source, m.tableAliases).type;
          Ts(y, w) && n.add(`${s}:${l + 1}`);
        });
      }
    }), n;
  }
  function Ts(e, t) {
    return e === "unknown" || t === "unknown" ? false : !!(e.toLowerCase() === t.toLowerCase() || Kn(e) && Kn(t));
  }
  function Kn(e) {
    return /(?:decimal|numeric|real|double|float|int|number|bigint|smallint)/i.test(e);
  }
  function ng(e) {
    if (!_(e) || !_(e.insert)) return false;
    const t = Array.isArray(e.insert.columns) ? e.insert.columns : [], n = Array.isArray(e.insert.values) ? e.insert.values : [];
    return t.length > 0 && n.length > 0 && n.every((r) => Array.isArray(r) && r.length === t.length);
  }
  function rg(e, t, n) {
    const r = t.toLowerCase().split("."), s = r.at(-1), a = r.length >= 2 ? r.at(-2) : void 0;
    return e.tables.some((o) => {
      var _a2;
      return o.name.toLowerCase() !== s || a && ((_a2 = o.schema) == null ? void 0 : _a2.toLowerCase()) !== a ? false : o.columns.some((c) => c.name.toLowerCase() === n.toLowerCase());
    });
  }
  function sg(e, t, n) {
    const r = Array.isArray(t) ? t : [
      t
    ], s = new Set(n.filter((m) => m.columns.length > 0).map((m) => m.index)), a = r.some((m, y) => s.has(y + 1) && _(m) && _(m.export)), o = r.some((m, y) => s.has(y + 1) && $s(m, "tsql").length > 0), c = r.some((m, y) => !s.has(y + 1) || !_(m) ? false : Ls(m) || _(m.show) || hs(m)), u = r.some((m, y) => s.has(y + 1) && _(m) && _(m.execute)), l = r.some((m, y) => s.has(y + 1) && _(m) && on(m));
    return !a && !o && !c && !u && !l ? e : e.filter((m) => !((a || o || l) && m.code === "E004" || (c || u) && (m.code === "E004" || m.code === "E200" || m.code === "E201")));
  }
  function ag(e, t, n) {
    const r = Array.isArray(t) ? t : [
      t
    ], s = new Set(r.flatMap((a, o) => {
      if (!_(a) || !_(a.execute)) return [];
      if (!n.some((u) => u.index === o + 1 && u.columns.length > 0)) return [];
      const c = _n(a.execute);
      return c ? [
        c.toLowerCase()
      ] : [];
    }));
    return s.size === 0 ? e : e.filter((a) => {
      const o = a.message.match(/Unknown table '([^']+)'/);
      return !o || !s.has(o[1].toLowerCase());
    });
  }
  function og(e, t) {
    return !t.some((n) => n.resultKind === "runtime") || t.some((n) => n.resultKind === "static" || n.resultKind === "unknown") ? e : e.filter((n) => !(n.code === "E200" || n.code === "E004" || /Invalid expression|Unexpected token/i.test(n.message) || /Unknown table|Unknown column|Unknown table or alias/i.test(n.message)));
  }
  function ig(e, t) {
    return t.length === 0 ? e : e.filter((n) => n.code !== "W004");
  }
  function cg(e, t) {
    return t.some((n) => n.resultKind === "none") ? e.filter((n) => !/Invalid expression|Unexpected token/i.test(n.message)) : e;
  }
  function U(e, t, n = tt(), r = "generic") {
    if (!_(e)) return [];
    if (_(e.select)) {
      const s = Tb(e.select, r);
      if (s.length > 0) return s;
      const a = V({
        tables: [
          ...n.tableFunctions.values()
        ]
      }, t), o = V(Pb(e.select.with, a), a), c = V(Ub(e.select, o, r), o);
      return Xe(e.select.expressions, c, e.select, n);
    }
    if (_(e.values)) return Eb(e.values, t);
    if (_(e.union)) return Et(e.union, t, n, r);
    if (_(e.intersect)) return Et(e.intersect, t, n, r);
    if (_(e.except)) return Et(e.except, t, n, r);
    if (_(e.pivot)) return Mb(e.pivot, t);
    if (_(e.create_view)) return Nb(e.create_view, t, n, r);
    if (_(e.create_table)) return $b(e.create_table, t, n, r);
    if (_(e.execute)) return Xg(e.execute, t, n, r);
    if (_(e.describe)) return tb(e.describe, t, n, r);
    if (_(e.show)) return X(e.show, r);
    if (_(e.summarize)) return cb();
    if (_(e.pragma)) return Fs(e.pragma);
    if (_(e.analyze)) return _b(e.analyze);
    if (_(e.put)) return Ab();
    if (xs(e)) return [];
    if (_(e.command)) return ub(e.command, t, n, r);
    if (_(e.copy)) return jb(e.copy, t, n);
    if (_(e.export)) return qb(e.export, t, n);
    if (_(e.insert)) return Ft(e.insert, t);
    if (_(e.update)) return Ft(e.update, t);
    if (_(e.delete)) return Ft(e.delete, t);
    if (_(e.merge)) return ky(e.merge, t);
    if (Cs(e)) return [];
    if (As(e)) return [];
    if (on(e)) return Ib(e, t);
    {
      const s = $s(e, r);
      if (s.length > 0) return s;
    }
    return Sp(e) ? Xe([
      e
    ], t) : [];
  }
  function _g(e, t, n) {
    if (!_(e)) return {
      tables: []
    };
    if (_(e.create_view)) {
      const r = Ig(e.create_view, t, n);
      return r ? {
        tables: [
          r
        ]
      } : {
        tables: []
      };
    }
    if (_(e.create_table)) {
      const r = Ng(e.create_table, t, n);
      return r ? {
        tables: [
          r
        ]
      } : {
        tables: []
      };
    }
    if (_(e.create_synonym)) {
      const r = Eg(e.create_synonym, t);
      return r ? {
        tables: [
          r
        ]
      } : {
        tables: []
      };
    }
    return {
      tables: []
    };
  }
  function ug(e, t, n) {
    if (_(e) && _(e.alter_table)) return bg(e.alter_table, t);
    if (_(e) && _(e.alter_view)) return pg(e.alter_view, t);
    if (_(e) && _(e.raw)) return fg(e.raw, t, n);
    if (_(e) && _(e.drop_table)) return mg(e.drop_table, t);
    if (_(e) && _(e.drop_view)) return dg(e.drop_view, t);
    if (_(e) && _(e.drop_schema)) return It(e.drop_schema, t);
    if (_(e) && _(e.drop_database)) return It(e.drop_database, t);
    if (_(e) && _(e.drop_namespace)) return It(e.drop_namespace, t);
    if (_(e) && _(e.select)) return lg(e.select, t, n);
    const r = _g(e, t, n);
    return V(r, t);
  }
  function lg(e, t, n) {
    if (!_(e.into) || !_(e.into.this) || !_(e.into.this.table)) return t;
    const r = oe(e.into.this.table);
    if (!r) return t;
    const s = U({
      select: e
    }, t, n), a = {
      name: r,
      columns: Ae(s, [], t)
    };
    return V({
      tables: [
        a
      ]
    }, t);
  }
  function mg(e, t) {
    const n = Array.isArray(e.names) ? e.names : [];
    return js(t, n);
  }
  function dg(e, t) {
    return js(t, [
      e.name
    ]);
  }
  function It(e, t) {
    const n = h(e.name);
    return n ? {
      tables: t.tables.filter((r) => {
        var _a2;
        return ((_a2 = r.schema) == null ? void 0 : _a2.toLowerCase()) !== n.toLowerCase();
      })
    } : t;
  }
  function fg(e, t, n) {
    const r = typeof e.sql == "string" ? e.sql : "", s = yg(r);
    if (s) return V({
      tables: [
        s
      ]
    }, t);
    const a = hg(r, t, n);
    if (a) return V({
      tables: [
        a
      ]
    }, t);
    const o = xg(r, t, n);
    if (o) return V({
      tables: [
        o
      ]
    }, t);
    const c = r.match(/^alter\s+materialized\s+view\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
    if (c) {
      const l = Ye(c[1]), m = Ye(c[2]), y = l.name, w = m.name;
      return !y || !w ? t : {
        tables: t.tables.map((L) => {
          var _a2;
          return L.name.toLowerCase() !== y.toLowerCase() || l.schema && ((_a2 = L.schema) == null ? void 0 : _a2.toLowerCase()) !== l.schema.toLowerCase() ? L : {
            ...L,
            name: w,
            ...m.schema ? {
              schema: m.schema
            } : {}
          };
        })
      };
    }
    const u = r.match(/^alter\s+(?:schema|database)\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
    if (u) {
      const l = M(u[1].trim()), m = M(u[2].trim());
      return !l || !m ? t : {
        tables: t.tables.map((y) => {
          var _a2;
          return ((_a2 = y.schema) == null ? void 0 : _a2.toLowerCase()) === l.toLowerCase() ? {
            ...y,
            schema: m
          } : y;
        })
      };
    }
    return t;
  }
  function Ye(e) {
    const t = e.split(".").map((n) => M(n.trim())).filter(Boolean);
    return t.length === 0 ? {} : t.length === 1 ? {
      name: t[0]
    } : {
      schema: t.at(-2),
      name: t.at(-1)
    };
  }
  function pg(e, t) {
    const n = oe(e.name);
    if (!n || !Array.isArray(e.actions)) return t;
    const r = _(e.name) ? h(e.name.schema) : void 0;
    return {
      tables: t.tables.map((s) => {
        var _a2;
        return s.name.toLowerCase() !== n.toLowerCase() || r && ((_a2 = s.schema) == null ? void 0 : _a2.toLowerCase()) !== r.toLowerCase() ? s : gg(s, e.actions);
      })
    };
  }
  function gg(e, t) {
    return t.reduce((n, r) => _(r) && _(r.Rename) ? qs(n, r.Rename) : n, {
      ...e,
      columns: [
        ...e.columns
      ]
    });
  }
  function js(e, t) {
    const n = t.flatMap((r) => {
      const s = oe(r), a = _(r) ? h(r.schema) : void 0;
      return s ? [
        {
          name: s.toLowerCase(),
          schema: a == null ? void 0 : a.toLowerCase()
        }
      ] : [];
    });
    return n.length === 0 ? e : {
      tables: e.tables.filter((r) => !n.some((s) => {
        var _a2;
        return !(r.name.toLowerCase() !== s.name || s.schema && ((_a2 = r.schema) == null ? void 0 : _a2.toLowerCase()) !== s.schema);
      }))
    };
  }
  function bg(e, t) {
    const n = oe(e.name);
    if (!n || !Array.isArray(e.actions)) return t;
    const r = e.actions, s = _(e.name) ? h(e.name.schema) : void 0;
    let a = false;
    const o = t.tables.map((c) => {
      var _a2;
      return c.name.toLowerCase() !== n.toLowerCase() || s && ((_a2 = c.schema) == null ? void 0 : _a2.toLowerCase()) !== s.toLowerCase() ? c : (a = true, Vn(c, r));
    });
    return a ? {
      tables: o
    } : {
      tables: [
        Vn({
          name: n,
          ...s ? {
            schema: s
          } : {},
          columns: []
        }, r),
        ...t.tables
      ]
    };
  }
  function Vn(e, t) {
    return t.reduce((n, r) => _(r) ? _(r.RenameTable) ? qs(n, r.RenameTable) : _(r.AddColumn) ? Cg(n, r.AddColumn.column) : _(r.AddColumns) ? Ag(n, r.AddColumns.columns) : _(r.DropColumn) ? jg(n, r.DropColumn.name) : _(r.RenameColumn) ? qg(n, r.RenameColumn.old_name, r.RenameColumn.new_name) : _(r.ChangeColumn) ? Sg(n, r.ChangeColumn) : _(r.AlterColumn) ? Lg(n, r.AlterColumn) : _(r.AddConstraint) ? kg(n, r.AddConstraint) : _(r.Raw) ? Tg(n, r.Raw) : n : n, {
      ...e,
      columns: [
        ...e.columns
      ]
    });
  }
  function yg(e) {
    const t = Dr(e, "generic");
    if (t[0]) return t[0];
    const n = wg(e);
    if (n) return n;
    const r = e.match(/^create\s+(?:global\s+temporary\s+|temporary\s+|temp\s+)?table\s+(.+?)\s*\(([\s\S]*)\)(?:\s+[\s\S]*)?$/i);
    if (!r) return;
    const s = Ye(r[1]);
    if (!s.name) return;
    const a = se(r[2], ",").map(vg).filter((o) => !!o);
    return a.length > 0 ? {
      name: s.name,
      ...s.schema ? {
        schema: s.schema
      } : {},
      columns: a
    } : void 0;
  }
  function wg(e) {
    const t = e.match(/^create\s+virtual\s+table\s+(.+?)\s+using\s+(\w+)\s*\(([\s\S]*)\)(?:\s*[\s\S]*)?$/i);
    if (!t) return;
    const n = Ye(t[1]), r = t[2].toLowerCase();
    if (!n.name || ![
      "fts3",
      "fts4",
      "fts5"
    ].includes(r)) return;
    const s = se(t[3], ",").flatMap((a) => {
      const o = a.trim();
      if (!o || /=/.test(o)) return [];
      const c = M(o.split(/\s+/)[0] ?? "");
      return c ? [
        {
          name: c,
          type: "text"
        }
      ] : [];
    });
    return s.length > 0 ? {
      name: n.name,
      ...n.schema ? {
        schema: n.schema
      } : {},
      columns: s
    } : void 0;
  }
  function hg(e, t, n) {
    const r = e.match(/^create\s+(?:or\s+replace\s+)?(?:recursive\s+)?(?:global\s+temporary\s+|temporary\s+|temp\s+)?(?:materialized\s+)?view\s+(.+?)\s+as\s+([\s\S]+)$/i);
    if (!r) return;
    const s = r[1].trim(), a = r[2].trim(), o = s.match(/^(.+?)(?:\s*\(([\s\S]*)\))?$/), c = Ye((o == null ? void 0 : o[1]) ?? s);
    if (!c.name) return;
    const u = (o == null ? void 0 : o[2]) ? se(o[2], ",").map((l) => ({
      name: {
        name: M(l.trim())
      }
    })) : [];
    try {
      const l = Q(a, "postgres");
      if (!l.success) return;
      const y = (Array.isArray(l.ast) ? l.ast : [
        l.ast
      ]).find(_);
      if (!y) return;
      const w = U(y, t, n, "postgres"), L = Ae(w, u, t);
      return L.length > 0 ? {
        name: c.name,
        ...c.schema ? {
          schema: c.schema
        } : {},
        columns: L
      } : void 0;
    } catch {
      return;
    }
  }
  function xg(e, t, n) {
    const r = e.match(/^create\s+(?:or\s+replace\s+)?macro\s+(.+?)\s*\([^)]*\)\s+as\s+table\s+([\s\S]+)$/i);
    if (!r) return;
    const s = M(r[1].trim());
    if (!s) return;
    const a = r[2].trim();
    try {
      const o = Q(a, "duckdb");
      if (!o.success) return;
      const u = (Array.isArray(o.ast) ? o.ast : [
        o.ast
      ]).find(_);
      if (!u) return;
      const l = U(u, t, n, "duckdb"), m = Ae(l, [], t);
      return m.length > 0 ? {
        name: s,
        columns: m
      } : void 0;
    } catch {
      return;
    }
  }
  function vg(e) {
    const t = e.trim();
    if (!t || /^(?:constraint|primary|unique|foreign|check)\b/i.test(t)) return;
    const n = t.match(/^("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/);
    if (!n) return;
    const r = M(n[1]), s = Pe(n[2]) ?? "unknown";
    return {
      name: r,
      type: s,
      nullable: /\bnot\s+null\b/i.test(n[2]) ? false : void 0,
      primaryKey: /\bprimary\s+key\b/i.test(n[2]),
      unique: /\bunique\b/i.test(n[2])
    };
  }
  function qs(e, t) {
    const n = oe(t), r = _(t) ? h(t.schema) : void 0;
    return n ? {
      ...e,
      name: n,
      ...r ? {
        schema: r
      } : {}
    } : e;
  }
  function Cg(e, t) {
    const n = cn(t);
    if (!n) return e;
    const r = e.columns.filter((s) => s.name.toLowerCase() !== n.name.toLowerCase());
    return {
      ...e,
      columns: [
        ...r,
        n
      ]
    };
  }
  function Ag(e, t) {
    return (Array.isArray(t) ? t.map((r) => cn(r)).filter((r) => !!r) : []).reduce((r, s) => {
      const a = r.columns.filter((o) => o.name.toLowerCase() !== s.name.toLowerCase());
      return {
        ...r,
        columns: [
          ...a,
          s
        ]
      };
    }, e);
  }
  function Sg(e, t) {
    const n = h(t.old_name), r = h(t.new_name);
    if (!n || !r) return e;
    const s = Y(t.data_type);
    return {
      ...e,
      columns: e.columns.map((a) => a.name.toLowerCase() === n.toLowerCase() ? {
        ...a,
        name: r,
        ...s ? {
          type: s
        } : {}
      } : a)
    };
  }
  function Lg(e, t) {
    const n = h(t.name);
    if (!n) return e;
    const r = t.action;
    return {
      ...e,
      columns: e.columns.map((s) => {
        if (s.name.toLowerCase() !== n.toLowerCase()) return s;
        if (r === "SetNotNull") return {
          ...s,
          nullable: false
        };
        if (r === "DropNotNull") return {
          ...s,
          nullable: true
        };
        if (_(r) && _(r.SetDataType)) {
          const a = Y(r.SetDataType.data_type);
          return a ? {
            ...s,
            type: a
          } : s;
        }
        return s;
      })
    };
  }
  function kg(e, t) {
    if (_(t.PrimaryKey)) {
      const n = Jn(t.PrimaryKey);
      return {
        ...e,
        ...n.length > 0 ? {
          primaryKey: n
        } : {},
        columns: e.columns.map((r) => n.some((s) => s.toLowerCase() === r.name.toLowerCase()) ? {
          ...r,
          primaryKey: true,
          nullable: false
        } : r)
      };
    }
    if (_(t.Index) && String(t.Index.kind ?? "").toLowerCase() === "unique") {
      const n = Jn(t.Index);
      return {
        ...e,
        ...n.length > 0 ? {
          uniqueKeys: [
            ...e.uniqueKeys ?? [],
            n
          ]
        } : {},
        columns: e.columns.map((r) => {
          var _a2;
          return n.length === 1 && ((_a2 = n[0]) == null ? void 0 : _a2.toLowerCase()) === r.name.toLowerCase() ? {
            ...r,
            unique: true
          } : r;
        })
      };
    }
    return e;
  }
  function Jn(e) {
    return Array.isArray(e.columns) ? e.columns.map(h).filter((t) => !!t) : [];
  }
  function Tg(e, t) {
    const n = typeof t.sql == "string" ? t.sql : "", r = n.match(/^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i);
    if (r) {
      const a = M(r[1]), o = Pe(r[2]);
      return {
        ...e,
        columns: e.columns.map((c) => c.name.toLowerCase() === a.toLowerCase() ? {
          ...c,
          ...o ? {
            type: o
          } : {}
        } : c)
      };
    }
    const s = n.match(/^set\s+schema\s+(.+)$/i);
    return s ? {
      ...e,
      schema: M(s[1].trim())
    } : e;
  }
  function Pe(e) {
    const t = e.trim().split(/\s+/)[0];
    return t ? ie(M(t)) : void 0;
  }
  function jg(e, t) {
    const n = h(t);
    return n ? {
      ...e,
      columns: e.columns.filter((r) => r.name.toLowerCase() !== n.toLowerCase())
    } : e;
  }
  function qg(e, t, n) {
    const r = h(t), s = h(n);
    return !r || !s ? e : {
      ...e,
      columns: e.columns.map((a) => a.name.toLowerCase() === r.toLowerCase() ? {
        ...a,
        name: s
      } : a)
    };
  }
  function Ig(e, t, n) {
    const r = oe(e.name);
    if (!r || !_(e.query)) return;
    const s = Qe(e.name), a = Os(e), o = U(e.query, t, n);
    return {
      name: r,
      ...s ? {
        schema: s
      } : {},
      columns: Ae(o, a, t)
    };
  }
  function Ng(e, t, n) {
    const r = oe(e.name);
    if (!r) return;
    const s = Qe(e.name);
    if (_(e.as_select)) {
      const u = U(e.as_select, t, n), l = Array.isArray(e.columns) ? e.columns : [];
      return {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: Ae(u, l, t)
      };
    }
    const a = Rg(e, t), o = Array.isArray(e.columns) ? e.columns.map((u) => cn(u, n)).filter((u) => u !== void 0) : [];
    if (a) return {
      name: r,
      ...s ? {
        schema: s
      } : {},
      columns: $g(a, o)
    };
    const c = o;
    return c.length > 0 ? {
      name: r,
      ...s ? {
        schema: s
      } : {},
      columns: c
    } : void 0;
  }
  function $g(e, t) {
    const n = e.map((r) => ({
      ...r
    }));
    for (const r of t) {
      const s = n.findIndex((a) => a.name.toLowerCase() === r.name.toLowerCase());
      s >= 0 ? n[s] = r : n.push(r);
    }
    return n;
  }
  function Eg(e, t) {
    const n = oe(e.name), r = oe(e.target);
    if (!n || !r) return;
    const s = Qe(e.name), a = Qe(e.target), o = t.tables.find((c) => !(c.name.toLowerCase() !== r.toLowerCase() || a && c.schema && c.schema.toLowerCase() !== a.toLowerCase()));
    if (o) return {
      name: n,
      ...s ? {
        schema: s
      } : {},
      columns: o.columns.map((c) => ({
        ...c
      })),
      ...o.primaryKey ? {
        primaryKey: [
          ...o.primaryKey
        ]
      } : {},
      ...o.uniqueKeys ? {
        uniqueKeys: o.uniqueKeys.map((c) => [
          ...c
        ])
      } : {},
      ...o.foreignKeys ? {
        foreignKeys: [
          ...o.foreignKeys
        ]
      } : {}
    };
  }
  function Rg(e, t) {
    var _a2, _b2;
    const n = _(e.clone_source) ? e.clone_source : Fg(e);
    if (!n) return;
    const r = (_a2 = oe(n)) == null ? void 0 : _a2.toLowerCase(), s = _(n) ? (_b2 = h(n.schema)) == null ? void 0 : _b2.toLowerCase() : void 0;
    if (!r) return;
    const a = t.tables.find((o) => {
      var _a3;
      return !(o.name.toLowerCase() !== r || s && ((_a3 = o.schema) == null ? void 0 : _a3.toLowerCase()) !== s);
    });
    return a ? a.columns.map((o) => ({
      ...o
    })) : void 0;
  }
  function Fg(e) {
    if (Array.isArray(e.constraints)) for (const t of e.constraints) {
      const n = _(t) && _(t.Like) ? t.Like : void 0;
      if (n && _(n.source)) return n.source;
    }
  }
  function oe(e) {
    return _(e) ? h(e.name) : void 0;
  }
  function Qe(e) {
    return _(e) ? h(e.schema) : void 0;
  }
  function cn(e, t) {
    var _a2;
    if (!_(e)) return;
    const n = h(e.name);
    if (n && !(n.toLowerCase() === "period" && ((_a2 = Y(e.data_type)) == null ? void 0 : _a2.toLowerCase()) === "for system_time")) return {
      name: n,
      type: Qg(e.data_type, t) ?? "unknown",
      nullable: typeof e.nullable == "boolean" ? e.nullable : void 0,
      primaryKey: e.primary_key === true,
      unique: e.unique === true
    };
  }
  function Mg(e, t) {
    if (!_(e) || !_(e.prepare)) return;
    const n = h(e.prepare.name);
    n && _(e.prepare.statement) && t.prepared.set(n.toLowerCase(), e.prepare.statement);
  }
  function Og(e, t) {
    if (!_(e) || !_(e.create_function)) return;
    const n = e.create_function, r = oe(n.name);
    if (!r) return;
    const s = Qe(n.name), a = Y(n.return_type) ?? Dg(n);
    a && (t.functionReturnTypes.set(r.toLowerCase(), a), s && t.functionReturnTypes.set(`${s.toLowerCase()}.${r.toLowerCase()}`, a));
    const o = Hg(r, n);
    o && t.tableFunctions.set(r.toLowerCase(), o);
  }
  function Dg(e) {
    const t = zg(e);
    if (!t) return;
    const n = Array.isArray(e.parameters) ? e.parameters.flatMap((r) => {
      if (!_(r)) return [];
      const s = h(r.name);
      return s ? [
        {
          name: s,
          type: Y(r.data_type) ?? "unknown"
        }
      ] : [];
    }) : [];
    return E(t, "return", {
      tables: [
        {
          name: "__function_parameters",
          columns: n
        }
      ]
    }, {
      mode: "none",
      binds: []
    }, "generic").type;
  }
  function zg(e) {
    const t = _(e.body) ? e.body : void 0;
    if (t) {
      if (_(t.Return)) return t.Return;
      if (_(t.Expression)) return t.Expression;
    }
  }
  function Bg(e, t, n, r = "generic") {
    if (!_(e) || !_(e.raw)) return;
    const s = typeof e.raw.sql == "string" ? e.raw.sql : "", a = Pg(s);
    if (!a) return;
    const o = Ug(a, t, n, r);
    o && n.functionReturnTypes.set(a.name.toLowerCase(), o);
  }
  function Pg(e) {
    var _a2;
    const t = e.match(/^create\s+(?:or\s+replace\s+)?macro\s+([`"[\]\w$]+)\s*\(([^)]*)\)\s+as\s+(?!table\b)([\s\S]+)$/i);
    if (!t) return;
    const n = M(t[1]), r = (_a2 = t[3]) == null ? void 0 : _a2.trim();
    if (!(!n || !r)) return {
      name: n,
      parameters: se(t[2] ?? "", ",").map((s) => M(s.trim().split(/\s+/)[0] ?? "")).filter(Boolean),
      expression: r
    };
  }
  function Ug(e, t, n, r) {
    const s = e.parameters.map((o) => ({
      name: o,
      type: "unknown"
    })), a = V({
      tables: [
        {
          name: "__macro_parameters",
          columns: s
        }
      ]
    }, t);
    try {
      const o = Q(`select ${e.expression} as __sqldesc_macro_return from __macro_parameters`, r);
      if (!o.success) return;
      const u = (Array.isArray(o.ast) ? o.ast : [
        o.ast
      ]).find(_);
      if (!u) return;
      const l = U(u, a, n, r)[0];
      if (!l) return;
      const m = E(l.expression, l.name ?? "return", l.schema ?? a, {
        mode: "none",
        binds: []
      }, r, l.source, l.tableAliases, l.functionReturnTypes);
      return m.type === "unknown" ? void 0 : m.type;
    } catch {
      return;
    }
  }
  function Kg(e, t, n, r = "generic") {
    if (!_(e) || !_(e.create_procedure)) return;
    const s = e.create_procedure, a = oe(s.name);
    if (!a) return;
    const o = Vg(s, t, n, r);
    o.length > 0 && n.procedureResultSets.set(a.toLowerCase(), o);
  }
  function Vg(e, t, n, r = "generic") {
    const s = Jg(e.return_type);
    if (s.length > 0) return p(s.map((c) => [
      c.name,
      c.type
    ]));
    const a = _(e.body) ? e.body : void 0;
    if (a && _(a.Expression)) {
      const c = d(a.Expression, "literal");
      return _(c) && c.literal_type === "dollar_string" && typeof c.value == "string" ? Hn(c.value, t, n, r) : U(a.Expression, t, n, r);
    }
    const o = a && typeof a.RawBlock == "string" ? a.RawBlock : void 0;
    return o ? Hn(o, t, n, r) : [];
  }
  function Hn(e, t, n, r = "generic") {
    const s = e.trim().replace(/^begin\b/i, "").replace(/\bend\s*$/i, "").trim();
    if (!/\bselect\b/i.test(s)) return [];
    try {
      const a = Q(s, r);
      if (!a.success) return [];
      const o = Array.isArray(a.ast) ? a.ast : [
        a.ast
      ];
      for (const c of o) {
        const u = U(c, t, n, r);
        if (u.length > 0) return u;
      }
    } catch {
      return [];
    }
    return [];
  }
  function Jg(e) {
    var _a2;
    if (!_(e)) return [];
    const n = (_a2 = e.data_type === "custom" && typeof e.name == "string" ? e.name : void 0) == null ? void 0 : _a2.match(/^table\s*\(([\s\S]*)\)$/i);
    return dn(n == null ? void 0 : n[1]);
  }
  function Is(e) {
    return e.map((t) => ({
      ...t
    }));
  }
  function Hg(e, t) {
    const n = typeof t.returns_table_body == "string" ? t.returns_table_body : void 0;
    if (!n) return;
    const r = n.match(/^table\s*\(([\s\S]*)\)$/i), s = dn(r == null ? void 0 : r[1]);
    return s.length > 0 ? {
      name: e,
      columns: s
    } : void 0;
  }
  function Wg(e, t) {
    if (!_(e) || !_(e.create_type)) return;
    const n = oe(e.create_type.name), r = Yg(e.create_type.definition);
    n && r && t.typeAliases.set(n.toLowerCase(), r);
  }
  function Yg(e) {
    if (!_(e)) return;
    const t = _(e.Domain) ? e.Domain : void 0;
    if (t) return Y(t.base_type);
    if (Array.isArray(e.Enum)) return "text";
    if (Array.isArray(e.Composite)) return `struct<${e.Composite.flatMap((r) => {
      if (!_(r)) return [];
      const s = h(r.name), a = Y(r.data_type) ?? "unknown";
      return s ? [
        `${s} ${a}`
      ] : [];
    }).join(", ")}>`;
  }
  function Qg(e, t) {
    const n = Y(e);
    return !n || !t ? n : t.typeAliases.get(n.toLowerCase()) ?? n;
  }
  function Gg(e, t) {
    var _a2;
    if (!_(e) || !_(e.command)) return;
    const r = String(e.command.this ?? "").trim().match(/^deallocate(?:\s+prepare)?(?:\s+(.+))?$/i);
    if (!r) return;
    const s = (_a2 = r[1]) == null ? void 0 : _a2.trim();
    if (!s || /^all$/i.test(s)) {
      t.prepared.clear();
      return;
    }
    t.prepared.delete(M(s).toLowerCase());
  }
  function Zg(e, t) {
    _(e) && (_(e.drop_function) && Yn(t.functionReturnTypes, Wn(e.drop_function.name)), _(e.drop_procedure) && Yn(t.procedureResultSets, Wn(e.drop_procedure.name)));
  }
  function Wn(e) {
    var _a2, _b2;
    const t = (_a2 = oe(e)) == null ? void 0 : _a2.toLowerCase();
    if (!t) return [];
    const n = _(e) ? (_b2 = h(e.schema)) == null ? void 0 : _b2.toLowerCase() : void 0;
    return n ? [
      `${n}.${t}`,
      t
    ] : [
      t
    ];
  }
  function Yn(e, t) {
    for (const n of t) if (e.delete(n), !n.includes(".")) for (const r of [
      ...e.keys()
    ]) r.endsWith(`.${n}`) && e.delete(r);
  }
  function Xg(e, t, n, r = "generic") {
    const s = Ns(e);
    if (s.length > 0) return s;
    const a = _n(e), o = a ? n.prepared.get(a.toLowerCase()) : void 0;
    if (o) return U(o, t, n, r);
    const c = a ? n.procedureResultSets.get(a.toLowerCase()) : void 0;
    return c ? Is(c) : [];
  }
  function Ns(e) {
    var _a2;
    const t = eb(e);
    if (t.length > 0) return t;
    const n = (_a2 = _n(e)) == null ? void 0 : _a2.toLowerCase();
    return Ge(n);
  }
  function $s(e, t) {
    var _a2, _b2;
    if (t !== "tsql" || !_(e)) return [];
    const n = d(e, "column");
    if (_(n) && !h(n.table)) {
      const a = (_a2 = h(n.name)) == null ? void 0 : _a2.toLowerCase();
      if (a == null ? void 0 : a.startsWith("sp_")) return Ge(a);
    }
    const r = d(e, "alias");
    if (!_(r)) return [];
    const s = (_b2 = h(r.this)) == null ? void 0 : _b2.toLowerCase();
    return (s == null ? void 0 : s.startsWith("sp_")) ? Ge(s) : [];
  }
  function Ge(e) {
    return e === "sp_help" ? p([
      [
        "Name",
        "text"
      ],
      [
        "Owner",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Created_datetime",
        "timestamp"
      ]
    ]) : e === "sp_who" || e === "sp_who2" ? p([
      [
        "spid",
        "integer"
      ],
      [
        "ecid",
        "integer"
      ],
      [
        "status",
        "text"
      ],
      [
        "loginame",
        "text"
      ],
      [
        "hostname",
        "text"
      ],
      [
        "blk",
        "text"
      ],
      [
        "dbname",
        "text"
      ],
      [
        "cmd",
        "text"
      ],
      [
        "request_id",
        "integer"
      ]
    ]) : e === "sp_spaceused" ? p([
      [
        "name",
        "text"
      ],
      [
        "rows",
        "text"
      ],
      [
        "reserved",
        "text"
      ],
      [
        "data",
        "text"
      ],
      [
        "index_size",
        "text"
      ],
      [
        "unused",
        "text"
      ]
    ]) : e === "sp_tables" ? p([
      [
        "TABLE_QUALIFIER",
        "text"
      ],
      [
        "TABLE_OWNER",
        "text"
      ],
      [
        "TABLE_NAME",
        "text"
      ],
      [
        "TABLE_TYPE",
        "text"
      ],
      [
        "REMARKS",
        "text"
      ]
    ]) : e === "sp_columns" ? p([
      [
        "TABLE_QUALIFIER",
        "text"
      ],
      [
        "TABLE_OWNER",
        "text"
      ],
      [
        "TABLE_NAME",
        "text"
      ],
      [
        "COLUMN_NAME",
        "text"
      ],
      [
        "DATA_TYPE",
        "integer"
      ],
      [
        "TYPE_NAME",
        "text"
      ],
      [
        "PRECISION",
        "integer"
      ],
      [
        "LENGTH",
        "integer"
      ],
      [
        "SCALE",
        "integer"
      ],
      [
        "RADIX",
        "integer"
      ],
      [
        "NULLABLE",
        "integer"
      ],
      [
        "REMARKS",
        "text"
      ]
    ]) : e === "sp_helpindex" ? p([
      [
        "index_name",
        "text"
      ],
      [
        "index_description",
        "text"
      ],
      [
        "index_keys",
        "text"
      ]
    ]) : e === "sp_helpconstraint" ? p([
      [
        "constraint_type",
        "text"
      ],
      [
        "constraint_name",
        "text"
      ],
      [
        "delete_action",
        "text"
      ],
      [
        "update_action",
        "text"
      ],
      [
        "status_enabled",
        "text"
      ],
      [
        "status_for_replication",
        "text"
      ],
      [
        "constraint_keys",
        "text"
      ]
    ]) : e === "sp_databases" ? p([
      [
        "DATABASE_NAME",
        "text"
      ],
      [
        "DATABASE_SIZE",
        "integer"
      ],
      [
        "REMARKS",
        "text"
      ]
    ]) : e === "sp_server_info" ? p([
      [
        "attribute_id",
        "integer"
      ],
      [
        "attribute_name",
        "text"
      ],
      [
        "attribute_value",
        "text"
      ]
    ]) : e === "sp_helpdb" ? p([
      [
        "name",
        "text"
      ],
      [
        "db_size",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "dbid",
        "integer"
      ],
      [
        "created",
        "text"
      ],
      [
        "status",
        "text"
      ],
      [
        "compatibility_level",
        "integer"
      ]
    ]) : e === "sp_helpfile" ? p([
      [
        "name",
        "text"
      ],
      [
        "fileid",
        "integer"
      ],
      [
        "filename",
        "text"
      ],
      [
        "filegroup",
        "text"
      ],
      [
        "size",
        "text"
      ],
      [
        "maxsize",
        "text"
      ],
      [
        "growth",
        "text"
      ],
      [
        "usage",
        "text"
      ]
    ]) : e === "sp_helpfilegroup" ? p([
      [
        "groupname",
        "text"
      ],
      [
        "groupid",
        "integer"
      ],
      [
        "filecount",
        "integer"
      ]
    ]) : e === "sp_stored_procedures" ? p([
      [
        "PROCEDURE_QUALIFIER",
        "text"
      ],
      [
        "PROCEDURE_OWNER",
        "text"
      ],
      [
        "PROCEDURE_NAME",
        "text"
      ],
      [
        "NUM_INPUT_PARAMS",
        "integer"
      ],
      [
        "NUM_OUTPUT_PARAMS",
        "integer"
      ],
      [
        "NUM_RESULT_SETS",
        "integer"
      ],
      [
        "REMARKS",
        "text"
      ],
      [
        "PROCEDURE_TYPE",
        "integer"
      ]
    ]) : e === "sp_pkeys" ? p([
      [
        "TABLE_QUALIFIER",
        "text"
      ],
      [
        "TABLE_OWNER",
        "text"
      ],
      [
        "TABLE_NAME",
        "text"
      ],
      [
        "COLUMN_NAME",
        "text"
      ],
      [
        "KEY_SEQ",
        "integer"
      ],
      [
        "PK_NAME",
        "text"
      ]
    ]) : e === "sp_fkeys" ? p([
      [
        "PKTABLE_QUALIFIER",
        "text"
      ],
      [
        "PKTABLE_OWNER",
        "text"
      ],
      [
        "PKTABLE_NAME",
        "text"
      ],
      [
        "PKCOLUMN_NAME",
        "text"
      ],
      [
        "FKTABLE_QUALIFIER",
        "text"
      ],
      [
        "FKTABLE_OWNER",
        "text"
      ],
      [
        "FKTABLE_NAME",
        "text"
      ],
      [
        "FKCOLUMN_NAME",
        "text"
      ],
      [
        "KEY_SEQ",
        "integer"
      ],
      [
        "FK_NAME",
        "text"
      ],
      [
        "PK_NAME",
        "text"
      ]
    ]) : e === "sp_statistics" ? p([
      [
        "TABLE_QUALIFIER",
        "text"
      ],
      [
        "TABLE_OWNER",
        "text"
      ],
      [
        "TABLE_NAME",
        "text"
      ],
      [
        "NON_UNIQUE",
        "integer"
      ],
      [
        "INDEX_QUALIFIER",
        "text"
      ],
      [
        "INDEX_NAME",
        "text"
      ],
      [
        "TYPE",
        "integer"
      ],
      [
        "SEQ_IN_INDEX",
        "integer"
      ],
      [
        "COLUMN_NAME",
        "text"
      ],
      [
        "COLLATION",
        "text"
      ],
      [
        "CARDINALITY",
        "integer"
      ],
      [
        "PAGES",
        "integer"
      ],
      [
        "FILTER_CONDITION",
        "text"
      ]
    ]) : e === "sp_special_columns" ? p([
      [
        "SCOPE",
        "integer"
      ],
      [
        "COLUMN_NAME",
        "text"
      ],
      [
        "DATA_TYPE",
        "integer"
      ],
      [
        "TYPE_NAME",
        "text"
      ],
      [
        "PRECISION",
        "integer"
      ],
      [
        "LENGTH",
        "integer"
      ],
      [
        "SCALE",
        "integer"
      ],
      [
        "PSEUDO_COLUMN",
        "integer"
      ]
    ]) : [];
  }
  function eb(e) {
    const t = typeof e.suffix == "string" ? e.suffix : void 0;
    if (!t) return [];
    const n = t.match(/\bwith\s+result\s+sets\s*\(\s*\((.*)\)\s*\)\s*$/i);
    return n ? se(n[1], ",").flatMap((r) => {
      const a = r.trim().match(/^([`"[\]\w@$#]+)\s+(.+)$/);
      if (!a) return [];
      const o = M(a[1].replace(/^\[/, "").replace(/\]$/, "")), c = Pe(a[2]) ?? "unknown";
      return o ? p([
        [
          o,
          c
        ]
      ]) : [];
    }) : [];
  }
  function Kt(e) {
    if (!e) return;
    const t = e.trim().match(/^(?:call|exec(?:ute)?)\s+([^\s(;]+)/i);
    return t ? M(t[1]).toLowerCase() : void 0;
  }
  function tb(e, t, n, r = "generic") {
    const s = _(e.target) ? e.target : void 0;
    if (String(e.kind ?? "").toLowerCase() === "function") return ob(r);
    if (!s) return [];
    const a = rb(String(e.style ?? "").toLowerCase());
    if (a.length > 0) return a;
    const o = nb(e, s);
    if (o.length > 0) return o;
    const c = ab(s, r);
    if (c.length > 0) return c;
    const u = sb(s);
    return u.length > 0 ? u : _(s.table) ? bt(s.table, t) : ib(s) ? Es(r) : U(s, t, n, r);
  }
  function nb(e, t) {
    var _a2;
    if (String(e.kind ?? "").toLowerCase() !== "table" || !_(t.table)) return [];
    const n = (_a2 = h(t.table.name)) == null ? void 0 : _a2.toLowerCase();
    return [
      "extended",
      "formatted"
    ].includes(n ?? "") ? p([
      [
        "col_name",
        "text"
      ],
      [
        "data_type",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]) : [];
  }
  function rb(e) {
    return e === "detail" ? p([
      [
        "format",
        "text"
      ],
      [
        "id",
        "text"
      ],
      [
        "name",
        "text"
      ],
      [
        "description",
        "text"
      ],
      [
        "location",
        "text"
      ],
      [
        "createdAt",
        "timestamp"
      ],
      [
        "lastModified",
        "timestamp"
      ],
      [
        "partitionColumns",
        "array<text>"
      ],
      [
        "numFiles",
        "integer"
      ],
      [
        "sizeInBytes",
        "integer"
      ],
      [
        "properties",
        "map<text, text>"
      ]
    ]) : e === "history" ? p([
      [
        "version",
        "integer"
      ],
      [
        "timestamp",
        "timestamp"
      ],
      [
        "userId",
        "text"
      ],
      [
        "userName",
        "text"
      ],
      [
        "operation",
        "text"
      ],
      [
        "operationParameters",
        "map<text, text>"
      ],
      [
        "job",
        "text"
      ],
      [
        "notebook",
        "text"
      ],
      [
        "clusterId",
        "text"
      ],
      [
        "readVersion",
        "integer"
      ],
      [
        "isolationLevel",
        "text"
      ],
      [
        "isBlindAppend",
        "boolean"
      ],
      [
        "operationMetrics",
        "map<text, text>"
      ]
    ]) : [];
  }
  function sb(e) {
    var _a2;
    if (!_(e.table)) return [];
    const t = (_a2 = h(e.table.name)) == null ? void 0 : _a2.toLowerCase();
    return t === "catalog" ? p([
      [
        "info_name",
        "text"
      ],
      [
        "info_value",
        "text"
      ]
    ]) : t === "database" || t === "schema" || t === "namespace" ? p([
      [
        "database_description_item",
        "text"
      ],
      [
        "database_description_value",
        "text"
      ]
    ]) : [];
  }
  function ab(e, t) {
    var _a2;
    if (t.toLowerCase() !== "snowflake" || !_(e.table)) return [];
    const n = (_a2 = h(e.table.name)) == null ? void 0 : _a2.toLowerCase();
    return !n || ![
      "alert",
      "warehouse",
      "integration",
      "stage",
      "pipe",
      "stream",
      "task",
      "role",
      "user",
      "database",
      "share"
    ].includes(n) ? [] : p(n === "warehouse" ? [
      [
        "property",
        "text"
      ],
      [
        "value",
        "text"
      ],
      [
        "default",
        "text"
      ],
      [
        "level",
        "text"
      ],
      [
        "description",
        "text"
      ]
    ] : n === "stage" ? [
      [
        "parent_property",
        "text"
      ],
      [
        "property",
        "text"
      ],
      [
        "property_type",
        "text"
      ],
      [
        "property_value",
        "text"
      ],
      [
        "property_default",
        "text"
      ]
    ] : n === "pipe" || n === "stream" || n === "task" ? [
      [
        "property",
        "text"
      ],
      [
        "value",
        "text"
      ]
    ] : [
      [
        "property",
        "text"
      ],
      [
        "value",
        "text"
      ]
    ]);
  }
  function ob(e) {
    return e.toLowerCase() === "spark" ? p([
      [
        "function_desc",
        "text"
      ]
    ]) : p([
      [
        "Name",
        "text"
      ],
      [
        "Description",
        "text"
      ]
    ]);
  }
  function Es(e) {
    return e.toLowerCase() === "mysql" ? p([
      [
        "id",
        "integer"
      ],
      [
        "select_type",
        "text"
      ],
      [
        "table",
        "text"
      ],
      [
        "partitions",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "possible_keys",
        "text"
      ],
      [
        "key",
        "text"
      ],
      [
        "key_len",
        "text"
      ],
      [
        "ref",
        "text"
      ],
      [
        "rows",
        "integer"
      ],
      [
        "filtered",
        "decimal"
      ],
      [
        "Extra",
        "text"
      ]
    ]) : e.toLowerCase() === "sqlite" ? p([
      [
        "addr",
        "integer"
      ],
      [
        "opcode",
        "text"
      ],
      [
        "p1",
        "integer"
      ],
      [
        "p2",
        "integer"
      ],
      [
        "p3",
        "integer"
      ],
      [
        "p4",
        "text"
      ],
      [
        "p5",
        "integer"
      ],
      [
        "comment",
        "text"
      ]
    ]) : p([
      [
        "QUERY PLAN",
        "text"
      ]
    ]);
  }
  function ib(e) {
    return [
      "select",
      "values",
      "union",
      "intersect",
      "except"
    ].some((t) => _(e[t]));
  }
  function X(e, t = "generic") {
    var _a2, _b2;
    const n = String(e.this ?? "").toLowerCase(), r = n.replace(/^(?:global|session|full)\s+/, "");
    if (n === "tables" || n === "views" || n === "full tables") return n === "tables" && t.toLowerCase() === "snowflake" ? Nt() : p([
      [
        n === "views" ? "View" : "Table",
        "text"
      ],
      ...n === "full tables" ? [
        [
          "Table_type",
          "text"
        ]
      ] : []
    ]);
    if (n === "databases" || n === "schemas") return p([
      [
        n === "schemas" ? "Schema" : "Database",
        "text"
      ]
    ]);
    if (r === "variables" || r === "status") return p([
      [
        "Variable_name",
        "text"
      ],
      [
        "Value",
        "text"
      ]
    ]);
    if (n === "all") return p([
      [
        "name",
        "text"
      ],
      [
        "setting",
        "text"
      ],
      [
        "description",
        "text"
      ]
    ]);
    if (n === "transaction isolation level") return p([
      [
        "transaction_isolation",
        "text"
      ]
    ]);
    if (n === "catalogs") return p([
      [
        "Catalog",
        "text"
      ]
    ]);
    if (n === "current namespace" || n === "namespaces") return p([
      [
        "namespace",
        "text"
      ]
    ]);
    if (n === "authors" || n === "contributors") return p([
      [
        "Name",
        "text"
      ],
      [
        "Location",
        "text"
      ],
      [
        "Comment",
        "text"
      ]
    ]);
    if (n.startsWith("table ") || n === "all tables") return Nt();
    if (n === "warnings" || n === "errors") return p([
      [
        "Level",
        "text"
      ],
      [
        "Code",
        "integer"
      ],
      [
        "Message",
        "text"
      ]
    ]);
    if (n === "grants") return $t(t) ? p([
      [
        "Grants",
        "text"
      ]
    ]) : p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "privilege",
        "text"
      ],
      [
        "granted_on",
        "text"
      ],
      [
        "name",
        "text"
      ],
      [
        "granted_to",
        "text"
      ],
      [
        "grantee_name",
        "text"
      ],
      [
        "grant_option",
        "boolean"
      ],
      [
        "granted_by",
        "text"
      ]
    ]);
    if (n === "future grants") return X({
      this: "grants"
    }, t);
    if (n === "engines") return p([
      [
        "Engine",
        "text"
      ],
      [
        "Support",
        "text"
      ],
      [
        "Comment",
        "text"
      ],
      [
        "Transactions",
        "text"
      ],
      [
        "XA",
        "text"
      ],
      [
        "Savepoints",
        "text"
      ]
    ]);
    if (n === "storage engines") return X({
      this: "engines"
    }, t);
    if (n === "engine" || n.startsWith("engine ")) return p([
      [
        "Type",
        "text"
      ],
      [
        "Name",
        "text"
      ],
      [
        "Status",
        "text"
      ]
    ]);
    if (r === "processlist") return p([
      [
        "Id",
        "integer"
      ],
      [
        "User",
        "text"
      ],
      [
        "Host",
        "text"
      ],
      [
        "db",
        "text"
      ],
      [
        "Command",
        "text"
      ],
      [
        "Time",
        "integer"
      ],
      [
        "State",
        "text"
      ],
      [
        "Info",
        "text"
      ]
    ]);
    if (n === "privileges") return p([
      [
        "Privilege",
        "text"
      ],
      [
        "Context",
        "text"
      ],
      [
        "Comment",
        "text"
      ]
    ]);
    if (n === "character set" || n === "character sets" || n === "charset" || n === "charsets") return p([
      [
        "Charset",
        "text"
      ],
      [
        "Description",
        "text"
      ],
      [
        "Default collation",
        "text"
      ],
      [
        "Maxlen",
        "integer"
      ]
    ]);
    if (n === "collation" || n === "collations") return p([
      [
        "Collation",
        "text"
      ],
      [
        "Charset",
        "text"
      ],
      [
        "Id",
        "integer"
      ],
      [
        "Default",
        "text"
      ],
      [
        "Compiled",
        "text"
      ],
      [
        "Sortlen",
        "integer"
      ]
    ]);
    if (n === "table status") return p([
      [
        "Name",
        "text"
      ],
      [
        "Engine",
        "text"
      ],
      [
        "Version",
        "integer"
      ],
      [
        "Row_format",
        "text"
      ],
      [
        "Rows",
        "integer"
      ],
      [
        "Avg_row_length",
        "integer"
      ],
      [
        "Data_length",
        "integer"
      ],
      [
        "Max_data_length",
        "integer"
      ],
      [
        "Index_length",
        "integer"
      ],
      [
        "Data_free",
        "integer"
      ],
      [
        "Auto_increment",
        "integer"
      ],
      [
        "Create_time",
        "timestamp"
      ],
      [
        "Update_time",
        "timestamp"
      ],
      [
        "Check_time",
        "timestamp"
      ],
      [
        "Collation",
        "text"
      ],
      [
        "Checksum",
        "integer"
      ],
      [
        "Create_options",
        "text"
      ],
      [
        "Comment",
        "text"
      ]
    ]);
    if (n === "open tables") return p([
      [
        "Database",
        "text"
      ],
      [
        "Table",
        "text"
      ],
      [
        "In_use",
        "integer"
      ],
      [
        "Name_locked",
        "integer"
      ]
    ]);
    if (n === "triggers") return p([
      [
        "Trigger",
        "text"
      ],
      [
        "Event",
        "text"
      ],
      [
        "Table",
        "text"
      ],
      [
        "Statement",
        "text"
      ],
      [
        "Timing",
        "text"
      ],
      [
        "Created",
        "timestamp"
      ],
      [
        "sql_mode",
        "text"
      ],
      [
        "Definer",
        "text"
      ],
      [
        "character_set_client",
        "text"
      ],
      [
        "collation_connection",
        "text"
      ],
      [
        "Database Collation",
        "text"
      ]
    ]);
    if (n === "events") return p([
      [
        "Db",
        "text"
      ],
      [
        "Name",
        "text"
      ],
      [
        "Definer",
        "text"
      ],
      [
        "Time zone",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Execute at",
        "timestamp"
      ],
      [
        "Interval value",
        "text"
      ],
      [
        "Interval field",
        "text"
      ],
      [
        "Starts",
        "timestamp"
      ],
      [
        "Ends",
        "timestamp"
      ],
      [
        "Status",
        "text"
      ],
      [
        "Originator",
        "integer"
      ],
      [
        "character_set_client",
        "text"
      ],
      [
        "collation_connection",
        "text"
      ],
      [
        "Database Collation",
        "text"
      ]
    ]);
    if (n.startsWith("procedure code") || n.startsWith("function code")) return p([
      [
        "Pos",
        "integer"
      ],
      [
        "Instruction",
        "text"
      ]
    ]);
    if (n === "plugins") return p([
      [
        "Name",
        "text"
      ],
      [
        "Status",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Library",
        "text"
      ],
      [
        "License",
        "text"
      ]
    ]);
    if (n === "function status" || n === "procedure status") return p([
      [
        "Db",
        "text"
      ],
      [
        "Name",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Definer",
        "text"
      ],
      [
        "Modified",
        "timestamp"
      ],
      [
        "Created",
        "timestamp"
      ],
      [
        "Security_type",
        "text"
      ],
      [
        "Comment",
        "text"
      ],
      [
        "character_set_client",
        "text"
      ],
      [
        "collation_connection",
        "text"
      ],
      [
        "Database Collation",
        "text"
      ]
    ]);
    if (n === "binary logs" || n === "binlogs") return p([
      [
        "Log_name",
        "text"
      ],
      [
        "File_size",
        "integer"
      ],
      [
        "Encrypted",
        "text"
      ]
    ]);
    if (n === "master status" || n === "binary log status") return p([
      [
        "File",
        "text"
      ],
      [
        "Position",
        "integer"
      ],
      [
        "Binlog_Do_DB",
        "text"
      ],
      [
        "Binlog_Ignore_DB",
        "text"
      ],
      [
        "Executed_Gtid_Set",
        "text"
      ]
    ]);
    if (n === "master logs") return X({
      this: "binary logs"
    }, t);
    if (n === "relaylog events" || n === "binlog events") return p([
      [
        "Log_name",
        "text"
      ],
      [
        "Pos",
        "integer"
      ],
      [
        "Event_type",
        "text"
      ],
      [
        "Server_id",
        "integer"
      ],
      [
        "End_log_pos",
        "integer"
      ],
      [
        "Info",
        "text"
      ]
    ]);
    if (n === "slave status" || n === "replica status") return p([
      [
        "Slave_IO_State",
        "text"
      ],
      [
        "Master_Host",
        "text"
      ],
      [
        "Master_User",
        "text"
      ],
      [
        "Master_Port",
        "integer"
      ],
      [
        "Connect_Retry",
        "integer"
      ],
      [
        "Master_Log_File",
        "text"
      ],
      [
        "Read_Master_Log_Pos",
        "integer"
      ],
      [
        "Relay_Log_File",
        "text"
      ],
      [
        "Relay_Log_Pos",
        "integer"
      ],
      [
        "Relay_Master_Log_File",
        "text"
      ],
      [
        "Slave_IO_Running",
        "text"
      ],
      [
        "Slave_SQL_Running",
        "text"
      ],
      [
        "Last_Errno",
        "integer"
      ],
      [
        "Last_Error",
        "text"
      ],
      [
        "Seconds_Behind_Master",
        "integer"
      ]
    ]);
    if (n === "replicas") return p([
      [
        "Server_Id",
        "integer"
      ],
      [
        "Host",
        "text"
      ],
      [
        "Port",
        "integer"
      ],
      [
        "Source_Id",
        "integer"
      ],
      [
        "Replica_UUID",
        "text"
      ]
    ]);
    if (n === "slave hosts" || n === "replica hosts") return p([
      [
        "Server_id",
        "integer"
      ],
      [
        "Host",
        "text"
      ],
      [
        "Port",
        "integer"
      ],
      [
        "Master_id",
        "integer"
      ],
      [
        "Slave_UUID",
        "text"
      ]
    ]);
    if (n === "profiles") return p([
      [
        "Query_ID",
        "integer"
      ],
      [
        "Duration",
        "decimal"
      ],
      [
        "Query",
        "text"
      ]
    ]);
    if (n === "profile") return p([
      [
        "Status",
        "text"
      ],
      [
        "Duration",
        "decimal"
      ]
    ]);
    if (n.startsWith("profile ")) return X({
      this: "profile"
    }, t);
    if (n === "parameters") return p([
      [
        "key",
        "text"
      ],
      [
        "value",
        "text"
      ],
      [
        "default",
        "text"
      ],
      [
        "level",
        "text"
      ],
      [
        "description",
        "text"
      ],
      [
        "type",
        "text"
      ]
    ]);
    if (n === "warehouses") return p([
      [
        "name",
        "text"
      ],
      [
        "state",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "size",
        "text"
      ],
      [
        "min_cluster_count",
        "integer"
      ],
      [
        "max_cluster_count",
        "integer"
      ],
      [
        "started_clusters",
        "integer"
      ],
      [
        "running",
        "integer"
      ],
      [
        "queued",
        "integer"
      ],
      [
        "is_default",
        "boolean"
      ],
      [
        "is_current",
        "boolean"
      ],
      [
        "auto_suspend",
        "integer"
      ],
      [
        "auto_resume",
        "boolean"
      ]
    ]);
    if (n === "compute pools") return p([
      [
        "name",
        "text"
      ],
      [
        "state",
        "text"
      ],
      [
        "min_nodes",
        "integer"
      ],
      [
        "max_nodes",
        "integer"
      ],
      [
        "instance_family",
        "text"
      ],
      [
        "num_services",
        "integer"
      ],
      [
        "num_jobs",
        "integer"
      ],
      [
        "auto_resume",
        "boolean"
      ],
      [
        "auto_suspend_secs",
        "integer"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "stages") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "url",
        "text"
      ],
      [
        "has_credentials",
        "boolean"
      ],
      [
        "has_encryption_key",
        "boolean"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ],
      [
        "region",
        "text"
      ],
      [
        "type",
        "text"
      ]
    ]);
    if (n === "external tables") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ],
      [
        "location",
        "text"
      ],
      [
        "file_format_name",
        "text"
      ]
    ]);
    if (n === "sequences") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "next_value",
        "integer"
      ],
      [
        "interval",
        "integer"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "materialized views") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "cluster_by",
        "text"
      ],
      [
        "rows",
        "integer"
      ],
      [
        "bytes",
        "integer"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if ([
      "masking policies",
      "row access policies",
      "network policies"
    ].includes(n)) return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "resource monitors") return p([
      [
        "name",
        "text"
      ],
      [
        "credit_quota",
        "decimal"
      ],
      [
        "used_credits",
        "decimal"
      ],
      [
        "remaining_credits",
        "decimal"
      ],
      [
        "level",
        "text"
      ],
      [
        "frequency",
        "text"
      ]
    ]);
    if (n === "transactions") return p([
      [
        "id",
        "integer"
      ],
      [
        "user",
        "text"
      ],
      [
        "session",
        "integer"
      ],
      [
        "started_on",
        "timestamp"
      ],
      [
        "state",
        "text"
      ]
    ]);
    if (n === "locks") return p([
      [
        "resource",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "transaction",
        "integer"
      ],
      [
        "status",
        "text"
      ],
      [
        "acquired_on",
        "timestamp"
      ]
    ]);
    if (n === "constraints") return p([
      [
        "table_name",
        "text"
      ],
      [
        "constraint_name",
        "text"
      ],
      [
        "constraint_type",
        "text"
      ],
      [
        "details",
        "text"
      ],
      [
        "validated",
        "boolean"
      ]
    ]);
    if (n === "jobs") return p([
      [
        "job_id",
        "integer"
      ],
      [
        "job_type",
        "text"
      ],
      [
        "description",
        "text"
      ],
      [
        "statement",
        "text"
      ],
      [
        "user_name",
        "text"
      ],
      [
        "status",
        "text"
      ],
      [
        "created",
        "timestamp"
      ],
      [
        "finished",
        "timestamp"
      ],
      [
        "fraction_completed",
        "decimal"
      ]
    ]);
    if (n === "clusters") return p([
      [
        "name",
        "text"
      ],
      [
        "replicas",
        "integer"
      ],
      [
        "size",
        "text"
      ],
      [
        "availability_zones",
        "text"
      ],
      [
        "managed",
        "boolean"
      ]
    ]);
    if (n === "sources" || n === "sinks") return p([
      [
        "name",
        "text"
      ],
      [
        "schema",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "cluster",
        "text"
      ]
    ]);
    if (n === "pipelines") return p([
      [
        "Database",
        "text"
      ],
      [
        "Pipeline",
        "text"
      ],
      [
        "State",
        "text"
      ],
      [
        "Source_Type",
        "text"
      ],
      [
        "Config_JSON",
        "text"
      ]
    ]);
    if (n === "files") return p([
      [
        "name",
        "text"
      ],
      [
        "isDirectory",
        "boolean"
      ],
      [
        "isFile",
        "boolean"
      ],
      [
        "length",
        "integer"
      ],
      [
        "owner",
        "text"
      ],
      [
        "group",
        "text"
      ],
      [
        "permissions",
        "text"
      ],
      [
        "accessTime",
        "timestamp"
      ],
      [
        "modificationTime",
        "timestamp"
      ]
    ]);
    if (n === "primary keys" || n === "imported keys" || n === "unique keys") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "table_name",
        "text"
      ],
      [
        "column_name",
        "text"
      ],
      [
        "key_sequence",
        "integer"
      ],
      [
        "constraint_name",
        "text"
      ]
    ]);
    if (n === "stats") return p([
      [
        "column_name",
        "text"
      ],
      [
        "data_size",
        "integer"
      ],
      [
        "distinct_values_count",
        "integer"
      ],
      [
        "nulls_fraction",
        "decimal"
      ],
      [
        "row_count",
        "integer"
      ],
      [
        "low_value",
        "text"
      ],
      [
        "high_value",
        "text"
      ]
    ]);
    if (n === "file formats") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "pipes") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "definition",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "notification_channel",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "image repositories") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "repository_url",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "network rules") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "mode",
        "text"
      ],
      [
        "value_list",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "secrets") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "secret_type",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "roles") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "is_default",
        "boolean"
      ],
      [
        "is_current",
        "boolean"
      ],
      [
        "is_inherited",
        "boolean"
      ],
      [
        "assigned_to_users",
        "integer"
      ],
      [
        "granted_to_roles",
        "integer"
      ],
      [
        "granted_roles",
        "integer"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "users") return p([
      [
        "name",
        "text"
      ],
      [
        "created_on",
        "timestamp"
      ],
      [
        "login_name",
        "text"
      ],
      [
        "display_name",
        "text"
      ],
      [
        "first_name",
        "text"
      ],
      [
        "last_name",
        "text"
      ],
      [
        "email",
        "text"
      ],
      [
        "mins_to_unlock",
        "integer"
      ],
      [
        "days_to_expiry",
        "integer"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "shares") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "kind",
        "text"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "to",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "integrations") return p([
      [
        "name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "category",
        "text"
      ],
      [
        "enabled",
        "boolean"
      ],
      [
        "comment",
        "text"
      ],
      [
        "created_on",
        "timestamp"
      ]
    ]);
    if (n === "streams") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "table_name",
        "text"
      ],
      [
        "source_type",
        "text"
      ],
      [
        "base_tables",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "stale",
        "boolean"
      ],
      [
        "mode",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "dynamic tables") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "cluster_by",
        "text"
      ],
      [
        "rows",
        "integer"
      ],
      [
        "bytes",
        "integer"
      ],
      [
        "owner",
        "text"
      ],
      [
        "target_lag",
        "text"
      ],
      [
        "warehouse",
        "text"
      ],
      [
        "scheduling_state",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "notebooks" || n === "alerts") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]);
    if (n === "tasks") return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "id",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "owner",
        "text"
      ],
      [
        "comment",
        "text"
      ],
      [
        "warehouse",
        "text"
      ],
      [
        "schedule",
        "text"
      ],
      [
        "state",
        "text"
      ],
      [
        "definition",
        "text"
      ],
      [
        "condition",
        "text"
      ]
    ]);
    if (n === "functions" || n === "procedures") return p([
      [
        n === "functions" ? "Function" : "Procedure",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Definer",
        "text"
      ],
      [
        "Modified",
        "timestamp"
      ],
      [
        "Created",
        "timestamp"
      ],
      [
        "Security_type",
        "text"
      ],
      [
        "Comment",
        "text"
      ]
    ]);
    if (n === "columns" || n === "full columns") return p([
      [
        "Field",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Null",
        "text"
      ],
      [
        "Key",
        "text"
      ],
      [
        "Default",
        "text"
      ],
      [
        "Extra",
        "text"
      ],
      ...n === "full columns" ? [
        [
          "Collation",
          "text"
        ],
        [
          "Privileges",
          "text"
        ],
        [
          "Comment",
          "text"
        ]
      ] : []
    ]);
    if (n === "index" || n === "indexes" || n === "keys") return p([
      [
        "Table",
        "text"
      ],
      [
        "Non_unique",
        "integer"
      ],
      [
        "Key_name",
        "text"
      ],
      [
        "Seq_in_index",
        "integer"
      ],
      [
        "Column_name",
        "text"
      ],
      [
        "Collation",
        "text"
      ],
      [
        "Cardinality",
        "integer"
      ],
      [
        "Sub_part",
        "integer"
      ],
      [
        "Packed",
        "text"
      ],
      [
        "Null",
        "text"
      ],
      [
        "Index_type",
        "text"
      ],
      [
        "Comment",
        "text"
      ],
      [
        "Index_comment",
        "text"
      ]
    ]);
    if (n.startsWith("create schema")) return $t(t) ? p([
      [
        "Database",
        "text"
      ],
      [
        "Create Database",
        "text"
      ]
    ]) : p([
      [
        "Create Schema",
        "text"
      ]
    ]);
    if (n.startsWith("create database") && $t(t)) return p([
      [
        "Database",
        "text"
      ],
      [
        "Create Database",
        "text"
      ]
    ]);
    if (n.startsWith("create table") || n.startsWith("create view")) return p([
      [
        "Table",
        "text"
      ],
      [
        Qn(((_a2 = n.match(/^create\s+(table|view|schema)/)) == null ? void 0 : _a2[0]) ?? n),
        "text"
      ]
    ]);
    if (/^create\s+(?:database|event|function|procedure|trigger|user)\b/.test(n)) {
      const s = ((_b2 = n.match(/^create\s+(database|event|function|procedure|trigger|user)\b/)) == null ? void 0 : _b2[0]) ?? n;
      return p([
        [
          "Object",
          "text"
        ],
        [
          Qn(s),
          "text"
        ]
      ]);
    }
    return n === "partitions" || n.startsWith("partitions ") ? p([
      [
        "partition",
        "text"
      ]
    ]) : n === "tblproperties" || n.startsWith("tblproperties ") ? p([
      [
        "key",
        "text"
      ],
      [
        "value",
        "text"
      ]
    ]) : /^[a-z_][a-z0-9_]*$/i.test(n) ? p([
      [
        n,
        "text"
      ]
    ]) : [];
  }
  function cb() {
    return p([
      [
        "column_name",
        "text"
      ],
      [
        "column_type",
        "text"
      ],
      [
        "min",
        "text"
      ],
      [
        "max",
        "text"
      ],
      [
        "approx_unique",
        "integer"
      ],
      [
        "avg",
        "text"
      ],
      [
        "std",
        "text"
      ],
      [
        "q25",
        "text"
      ],
      [
        "q50",
        "text"
      ],
      [
        "q75",
        "text"
      ],
      [
        "count",
        "integer"
      ],
      [
        "null_percentage",
        "decimal"
      ]
    ]);
  }
  function Nt() {
    return p([
      [
        "created_on",
        "timestamp"
      ],
      [
        "name",
        "text"
      ],
      [
        "database_name",
        "text"
      ],
      [
        "schema_name",
        "text"
      ],
      [
        "kind",
        "text"
      ],
      [
        "comment",
        "text"
      ],
      [
        "cluster_by",
        "text"
      ],
      [
        "rows",
        "integer"
      ],
      [
        "bytes",
        "integer"
      ],
      [
        "owner",
        "text"
      ],
      [
        "retention_time",
        "integer"
      ],
      [
        "automatic_clustering",
        "text"
      ],
      [
        "change_tracking",
        "boolean"
      ],
      [
        "search_optimization",
        "boolean"
      ]
    ]);
  }
  function _b(e) {
    return String(e.kind ?? "").toLowerCase() === "table" || _(e.this) ? Rs() : [];
  }
  function ub(e, t, n, r) {
    const s = String(e.this ?? "").toLowerCase(), a = lb(e, t, n, r);
    if (a.length > 0) return a;
    const o = mb(e, t, n, r);
    if (o.length > 0) return o;
    const c = n.procedureResultSets.get(Kt(s) ?? "");
    if (c) return Is(c);
    const u = Ge(Kt(s));
    return u.length > 0 ? u : /^(optimize|repair|check|checksum)\s+table\b/.test(s) ? Rs() : /^(?:list|ls)\s+@/.test(s) ? Sb() : /^get\s+@/.test(s) ? Lb() : /^(?:remove|rm)\s+@/.test(s) ? kb() : /^exists\s+(?:table|database|view|dictionary)\b/.test(s) ? p([
      [
        "result",
        "boolean"
      ]
    ]) : /^explain\b/.test(s) ? Es(r) : /^show\s+clusters\b/.test(s) ? pb() : /^show\s+users\b/.test(s) ? gb() : /^show\s+roles\b/.test(s) ? bb() : /^show\s+grants\b/.test(s) ? yb() : /^show\s+settings\b/.test(s) ? fb() : /^show\s+dictionaries\b/.test(s) ? wb() : /^show\s+engines\b/.test(s) ? p([
      [
        "name",
        "text"
      ],
      [
        "value",
        "text"
      ],
      [
        "comment",
        "text"
      ]
    ]) : /^show\s+functions\b/.test(s) ? p([
      [
        "name",
        "text"
      ]
    ]) : /^list\s+(?:file|jar|archive)\b/.test(s) ? Cb() : /^show\s+databases\b/.test(s) ? X({
      this: "databases"
    }) : /^show\s+schemas\b/.test(s) ? X({
      this: "schemas"
    }) : /^show\s+tables\b/.test(s) ? X({
      this: "tables"
    }) : /^show\s+views\b/.test(s) ? X({
      this: "views"
    }) : /^show\s+materialized\s+views\b/.test(s) ? X({
      this: "materialized views"
    }) : /^show\s+table\b/.test(s) ? X({
      this: "tables"
    }) : /^show\s+columns\b/.test(s) ? X({
      this: "columns"
    }) : /^show\s+indexes\b/.test(s) ? X({
      this: "indexes"
    }) : /^show\s+variables\b/.test(s) ? X({
      this: "variables"
    }) : /^show\s+catalogs\b/.test(s) ? X({
      this: "catalogs"
    }) : /^show\s+current\s+namespace\b/.test(s) ? X({
      this: "current namespace"
    }) : /^show\s+create\s+(?:table|database|dictionary|view)\b/.test(s) ? p([
      [
        "statement",
        "text"
      ]
    ]) : /^show\s+named\s+collections\b/.test(s) ? p([
      [
        "name",
        "text"
      ],
      [
        "collection",
        "text"
      ]
    ]) : /^show\s+row\s+polic(?:y|ies)\b/.test(s) ? p([
      [
        "name",
        "text"
      ],
      [
        "short_name",
        "text"
      ],
      [
        "database",
        "text"
      ],
      [
        "table",
        "text"
      ],
      [
        "condition",
        "text"
      ]
    ]) : /^show\s+quotas\b/.test(s) ? p([
      [
        "name",
        "text"
      ],
      [
        "id",
        "uuid"
      ],
      [
        "storage",
        "text"
      ],
      [
        "keys",
        "text"
      ]
    ]) : /^show\s+quota\s+usage\b/.test(s) ? p([
      [
        "quota_name",
        "text"
      ],
      [
        "duration",
        "text"
      ],
      [
        "queries",
        "integer"
      ],
      [
        "errors",
        "integer"
      ],
      [
        "result_rows",
        "integer"
      ],
      [
        "read_rows",
        "integer"
      ]
    ]) : /^show\s+access\b/.test(s) ? p([
      [
        "ACCESS",
        "text"
      ]
    ]) : /^show\s+privileges\b/.test(s) ? p([
      [
        "privilege",
        "text"
      ],
      [
        "parent_group",
        "text"
      ],
      [
        "description",
        "text"
      ]
    ]) : /^show\s+processlist\b/.test(s) ? p([
      [
        "user",
        "text"
      ],
      [
        "address",
        "text"
      ],
      [
        "elapsed",
        "integer"
      ],
      [
        "read_rows",
        "integer"
      ],
      [
        "read_bytes",
        "integer"
      ],
      [
        "total_rows_approx",
        "integer"
      ],
      [
        "memory_usage",
        "integer"
      ],
      [
        "query",
        "text"
      ],
      [
        "query_id",
        "text"
      ]
    ]) : /^show\s+processes\b/.test(s) ? hb() : /^show\s+merges\b/.test(s) ? xb() : /^show\s+mutations\b/.test(s) ? vb() : /^(?:describe|desc)(?:\s+table)?\s+\S+/.test(s) ? p([
      [
        "name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "default_type",
        "text"
      ],
      [
        "default_expression",
        "text"
      ],
      [
        "comment",
        "text"
      ],
      [
        "codec_expression",
        "text"
      ],
      [
        "ttl_expression",
        "text"
      ]
    ]) : /^help\s+table\b/.test(s) ? p([
      [
        "Column Name",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Nullable",
        "text"
      ],
      [
        "Format",
        "text"
      ],
      [
        "Title",
        "text"
      ],
      [
        "Max Length",
        "integer"
      ],
      [
        "Decimal Total Digits",
        "integer"
      ],
      [
        "Decimal Fractional Digits",
        "integer"
      ]
    ]) : /^help\s+database\b/.test(s) ? p([
      [
        "Database Name",
        "text"
      ],
      [
        "Owner Name",
        "text"
      ],
      [
        "Account Name",
        "text"
      ],
      [
        "Protection Type",
        "text"
      ],
      [
        "Journal Flag",
        "text"
      ],
      [
        "Perm Space",
        "integer"
      ],
      [
        "Spool Space",
        "integer"
      ],
      [
        "Temp Space",
        "integer"
      ]
    ]) : /^help\s+column\b/.test(s) ? p([
      [
        "Column Name",
        "text"
      ],
      [
        "Type",
        "text"
      ],
      [
        "Nullable",
        "text"
      ],
      [
        "Format",
        "text"
      ],
      [
        "Title",
        "text"
      ],
      [
        "Max Length",
        "integer"
      ],
      [
        "Decimal Total Digits",
        "integer"
      ],
      [
        "Decimal Fractional Digits",
        "integer"
      ]
    ]) : [];
  }
  function lb(e, t, n, r) {
    const s = db(String(e.this ?? ""));
    if (!s) return [];
    try {
      const a = Q(s, r);
      if (!a.success) return [];
      const c = (Array.isArray(a.ast) ? a.ast : [
        a.ast
      ]).find(_);
      return c ? U(c, t, n, r) : [];
    } catch {
      return [];
    }
  }
  function mb(e, t, n, r) {
    const s = String(e.this ?? "").trim().replace(/^begin\s+/i, "");
    if (!/^select\b/i.test(s)) return [];
    try {
      const a = Q(s, r);
      if (!a.success) return [];
      const c = (Array.isArray(a.ast) ? a.ast : [
        a.ast
      ]).find(_);
      return c ? U(c, t, n, r) : [];
    } catch {
      return [];
    }
  }
  function db(e) {
    const t = e.match(/^execute\s+immediate\s+'((?:''|[^'])*)'/i);
    return t ? t[1].replace(/''/g, "'") : void 0;
  }
  function fb() {
    return p([
      [
        "name",
        "text"
      ],
      [
        "value",
        "text"
      ],
      [
        "changed",
        "boolean"
      ],
      [
        "description",
        "text"
      ],
      [
        "min",
        "text"
      ],
      [
        "max",
        "text"
      ],
      [
        "readonly",
        "boolean"
      ],
      [
        "type",
        "text"
      ]
    ]);
  }
  function pb() {
    return p([
      [
        "cluster",
        "text"
      ],
      [
        "shard_num",
        "integer"
      ],
      [
        "shard_weight",
        "integer"
      ],
      [
        "replica_num",
        "integer"
      ],
      [
        "host_name",
        "text"
      ],
      [
        "host_address",
        "text"
      ],
      [
        "port",
        "integer"
      ],
      [
        "is_local",
        "boolean"
      ],
      [
        "user",
        "text"
      ]
    ]);
  }
  function gb() {
    return p([
      [
        "name",
        "text"
      ]
    ]);
  }
  function bb() {
    return p([
      [
        "name",
        "text"
      ]
    ]);
  }
  function yb() {
    return p([
      [
        "GRANTS",
        "text"
      ]
    ]);
  }
  function wb() {
    return p([
      [
        "database",
        "text"
      ],
      [
        "name",
        "text"
      ],
      [
        "uuid",
        "uuid"
      ],
      [
        "status",
        "text"
      ],
      [
        "origin",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "key",
        "text"
      ],
      [
        "attribute.names",
        "array<text>"
      ]
    ]);
  }
  function hb() {
    return p([
      [
        "user",
        "text"
      ],
      [
        "address",
        "text"
      ],
      [
        "elapsed",
        "integer"
      ],
      [
        "read_rows",
        "integer"
      ],
      [
        "read_bytes",
        "integer"
      ],
      [
        "total_rows_approx",
        "integer"
      ],
      [
        "memory_usage",
        "integer"
      ],
      [
        "query",
        "text"
      ],
      [
        "query_id",
        "text"
      ]
    ]);
  }
  function xb() {
    return p([
      [
        "database",
        "text"
      ],
      [
        "table",
        "text"
      ],
      [
        "elapsed",
        "integer"
      ],
      [
        "progress",
        "decimal"
      ],
      [
        "num_parts",
        "integer"
      ],
      [
        "source_part_names",
        "array<text>"
      ],
      [
        "result_part_name",
        "text"
      ],
      [
        "partition_id",
        "text"
      ],
      [
        "is_mutation",
        "boolean"
      ]
    ]);
  }
  function vb() {
    return p([
      [
        "database",
        "text"
      ],
      [
        "table",
        "text"
      ],
      [
        "mutation_id",
        "text"
      ],
      [
        "command",
        "text"
      ],
      [
        "create_time",
        "timestamp"
      ],
      [
        "block_numbers.partition_id",
        "array<text>"
      ],
      [
        "parts_to_do",
        "integer"
      ],
      [
        "is_done",
        "boolean"
      ],
      [
        "latest_failed_part",
        "text"
      ],
      [
        "latest_fail_reason",
        "text"
      ]
    ]);
  }
  function Cb() {
    return p([
      [
        "resource",
        "text"
      ]
    ]);
  }
  function Ab() {
    return p([
      [
        "source",
        "text"
      ],
      [
        "target",
        "text"
      ],
      [
        "source_size",
        "integer"
      ],
      [
        "target_size",
        "integer"
      ],
      [
        "source_compression",
        "text"
      ],
      [
        "target_compression",
        "text"
      ],
      [
        "status",
        "text"
      ],
      [
        "message",
        "text"
      ]
    ]);
  }
  function Sb() {
    return p([
      [
        "name",
        "text"
      ],
      [
        "size",
        "integer"
      ],
      [
        "md5",
        "text"
      ],
      [
        "last_modified",
        "timestamp"
      ]
    ]);
  }
  function Lb() {
    return p([
      [
        "file",
        "text"
      ],
      [
        "size",
        "integer"
      ],
      [
        "status",
        "text"
      ],
      [
        "message",
        "text"
      ]
    ]);
  }
  function kb() {
    return p([
      [
        "name",
        "text"
      ],
      [
        "result",
        "text"
      ]
    ]);
  }
  function Rs() {
    return p([
      [
        "Table",
        "text"
      ],
      [
        "Op",
        "text"
      ],
      [
        "Msg_type",
        "text"
      ],
      [
        "Msg_text",
        "text"
      ]
    ]);
  }
  function Qn(e) {
    return e === "create database" ? "Create Database" : e === "create event" ? "Create Event" : e === "create function" ? "Create Function" : e === "create procedure" ? "Create Procedure" : e === "create schema" ? "Create Schema" : e === "create trigger" ? "Create Trigger" : e === "create user" ? "Create User" : e === "create view" ? "Create View" : "Create Table";
  }
  function Fs(e) {
    var _a2;
    const t = (_a2 = h(e.name)) == null ? void 0 : _a2.toLowerCase();
    return t === "table_info" ? p([
      [
        "cid",
        "integer"
      ],
      [
        "name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "notnull",
        "integer"
      ],
      [
        "dflt_value",
        "text"
      ],
      [
        "pk",
        "integer"
      ]
    ]) : t === "table_xinfo" ? p([
      [
        "cid",
        "integer"
      ],
      [
        "name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "notnull",
        "integer"
      ],
      [
        "dflt_value",
        "text"
      ],
      [
        "pk",
        "integer"
      ],
      [
        "hidden",
        "integer"
      ]
    ]) : t === "index_list" ? p([
      [
        "seq",
        "integer"
      ],
      [
        "name",
        "text"
      ],
      [
        "unique",
        "integer"
      ],
      [
        "origin",
        "text"
      ],
      [
        "partial",
        "integer"
      ]
    ]) : t === "index_info" ? p([
      [
        "seqno",
        "integer"
      ],
      [
        "cid",
        "integer"
      ],
      [
        "name",
        "text"
      ]
    ]) : t === "index_xinfo" ? p([
      [
        "seqno",
        "integer"
      ],
      [
        "cid",
        "integer"
      ],
      [
        "name",
        "text"
      ],
      [
        "desc",
        "integer"
      ],
      [
        "coll",
        "text"
      ],
      [
        "key",
        "integer"
      ]
    ]) : t === "database_list" ? p([
      [
        "seq",
        "integer"
      ],
      [
        "name",
        "text"
      ],
      [
        "file",
        "text"
      ]
    ]) : t === "show_tables" ? p([
      [
        "name",
        "text"
      ]
    ]) : t === "version" ? p([
      [
        "library_version",
        "text"
      ],
      [
        "source_id",
        "text"
      ],
      [
        "codename",
        "text"
      ]
    ]) : t === "database_size" ? p([
      [
        "database_name",
        "text"
      ],
      [
        "database_size",
        "text"
      ],
      [
        "block_size",
        "integer"
      ],
      [
        "total_blocks",
        "integer"
      ],
      [
        "used_blocks",
        "integer"
      ],
      [
        "free_blocks",
        "integer"
      ],
      [
        "wal_size",
        "text"
      ],
      [
        "memory_usage",
        "text"
      ],
      [
        "memory_limit",
        "text"
      ]
    ]) : t === "storage_info" ? p([
      [
        "row_group_id",
        "integer"
      ],
      [
        "column_name",
        "text"
      ],
      [
        "column_id",
        "integer"
      ],
      [
        "column_path",
        "text"
      ],
      [
        "segment_id",
        "integer"
      ],
      [
        "segment_type",
        "text"
      ],
      [
        "start",
        "integer"
      ],
      [
        "count",
        "integer"
      ],
      [
        "compression",
        "text"
      ],
      [
        "stats",
        "text"
      ],
      [
        "has_updates",
        "boolean"
      ],
      [
        "persistent",
        "boolean"
      ],
      [
        "block_id",
        "integer"
      ],
      [
        "block_offset",
        "integer"
      ]
    ]) : t === "platform" ? p([
      [
        "platform",
        "text"
      ]
    ]) : t === "user_agent" ? p([
      [
        "user_agent",
        "text"
      ]
    ]) : t === "show" ? p([
      [
        "name",
        "text"
      ],
      [
        "value",
        "text"
      ]
    ]) : t === "enable_profile" || t === "enable_profiling" ? p([
      [
        "enable_profile",
        "text"
      ]
    ]) : t === "foreign_key_list" ? p([
      [
        "id",
        "integer"
      ],
      [
        "seq",
        "integer"
      ],
      [
        "table",
        "text"
      ],
      [
        "from",
        "text"
      ],
      [
        "to",
        "text"
      ],
      [
        "on_update",
        "text"
      ],
      [
        "on_delete",
        "text"
      ],
      [
        "match",
        "text"
      ]
    ]) : t === "foreign_key_check" ? p([
      [
        "table",
        "text"
      ],
      [
        "rowid",
        "integer"
      ],
      [
        "parent",
        "text"
      ],
      [
        "fkid",
        "integer"
      ]
    ]) : t === "table_list" ? p([
      [
        "schema",
        "text"
      ],
      [
        "name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "ncol",
        "integer"
      ],
      [
        "wr",
        "integer"
      ],
      [
        "strict",
        "integer"
      ]
    ]) : t === "function_list" ? p([
      [
        "name",
        "text"
      ],
      [
        "builtin",
        "integer"
      ],
      [
        "type",
        "text"
      ],
      [
        "enc",
        "text"
      ],
      [
        "narg",
        "integer"
      ],
      [
        "flags",
        "integer"
      ]
    ]) : t === "functions" ? p([
      [
        "name",
        "text"
      ],
      [
        "type",
        "text"
      ],
      [
        "parameters",
        "array<text>"
      ],
      [
        "varargs",
        "text"
      ],
      [
        "return_type",
        "text"
      ],
      [
        "side_effects",
        "boolean"
      ]
    ]) : t === "module_list" ? p([
      [
        "name",
        "text"
      ]
    ]) : t === "collations" ? p([
      [
        "collname",
        "text"
      ]
    ]) : t === "compile_options" ? p([
      [
        "compile_options",
        "text"
      ]
    ]) : t === "collation_list" ? p([
      [
        "seq",
        "integer"
      ],
      [
        "name",
        "text"
      ]
    ]) : t === "pragma_list" ? p([
      [
        "name",
        "text"
      ]
    ]) : t === "quick_check" || t === "integrity_check" ? p([
      [
        t,
        "text"
      ]
    ]) : t === "wal_checkpoint" ? p([
      [
        "busy",
        "integer"
      ],
      [
        "log",
        "integer"
      ],
      [
        "checkpointed",
        "integer"
      ]
    ]) : t === "stats" ? p([
      [
        "table",
        "text"
      ],
      [
        "index",
        "text"
      ],
      [
        "width",
        "integer"
      ],
      [
        "height",
        "integer"
      ]
    ]) : t === "optimize" ? p([
      [
        "optimize",
        "text"
      ]
    ]) : [
      "journal_mode",
      "locking_mode",
      "synchronous",
      "encoding",
      "auto_vacuum",
      "temp_store"
    ].includes(t ?? "") ? p([
      [
        t ?? "value",
        "text"
      ]
    ]) : [
      "cache_size",
      "page_size",
      "page_count",
      "freelist_count",
      "schema_version",
      "user_version",
      "application_id",
      "busy_timeout",
      "wal_autocheckpoint",
      "threads"
    ].includes(t ?? "") ? p([
      [
        t ?? "value",
        "integer"
      ]
    ]) : [
      "foreign_keys",
      "defer_foreign_keys",
      "ignore_check_constraints",
      "recursive_triggers",
      "reverse_unordered_selects",
      "read_uncommitted",
      "query_only"
    ].includes(t ?? "") ? p([
      [
        t ?? "value",
        "boolean"
      ]
    ]) : [];
  }
  function $t(e) {
    return [
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(e.toLowerCase());
  }
  function Tb(e, t) {
    return t !== "tsql" ? [] : Array.isArray(e.for_json) && e.for_json.length > 0 ? p([
      [
        null,
        "text"
      ]
    ]) : Array.isArray(e.for_xml) && e.for_xml.length > 0 ? p([
      [
        null,
        "xml"
      ]
    ]) : [];
  }
  function p(e) {
    return e.map(([t, n]) => ({
      expression: {
        cast: {
          this: {
            null: null
          },
          to: {
            data_type: n
          }
        }
      },
      name: t,
      source: "metadata"
    }));
  }
  function jb(e, t, n) {
    if (vs(e)) return [];
    const r = Gn(e.this, t, n);
    if (r.length > 0) return r;
    const s = Array.isArray(e.files) ? e.files : [];
    for (const a of s) {
      const o = Gn(a, t, n);
      if (o.length > 0) return o;
    }
    return [];
  }
  function qb(e, t, n) {
    return _(e.this) ? U(e.this, t, n) : [];
  }
  function Gn(e, t, n) {
    if (!_(e)) return [];
    if (_(e.subquery) && _(e.subquery.this)) return U(e.subquery.this, t, n);
    if (_(e.select) || _(e.values) || _(e.union) || _(e.intersect) || _(e.except)) return U(e, t, n);
    if (_(e.table)) return bt(e.table, t);
    if (_(e.column)) {
      const r = h(e.column.name);
      if (r) return bt({
        name: {
          name: r
        }
      }, t);
    }
    return [];
  }
  function bt(e, t) {
    var _a2, _b2;
    const n = (_a2 = h(e.name)) == null ? void 0 : _a2.toLowerCase(), r = (_b2 = h(e.schema)) == null ? void 0 : _b2.toLowerCase();
    if (!n) return [];
    const s = t.tables.find((a) => {
      var _a3;
      return !(a.name.toLowerCase() !== n || r && ((_a3 = a.schema) == null ? void 0 : _a3.toLowerCase()) !== r);
    });
    return s ? s.columns.map((a) => ({
      expression: {
        column: {
          name: {
            name: a.name
          },
          table: {
            name: s.name
          }
        }
      },
      name: a.name,
      source: Ct(s, a.name),
      schema: t,
      tableAliases: /* @__PURE__ */ new Map([
        [
          s.name.toLowerCase(),
          {
            tableName: s.name,
            ...s.schema ? {
              schemaName: s.schema
            } : {},
            visibleColumnNames: []
          }
        ]
      ])
    })) : [];
  }
  function Ib(e, t) {
    const n = _(e.alias) ? e.alias : void 0, r = n ? h(n.alias) : void 0;
    return r ? bt({
      name: {
        name: r
      }
    }, t) : [];
  }
  function _n(e) {
    const t = _(e.this) ? d(e.this, "table") : void 0;
    return _(t) ? h(t.name) : h(e.this);
  }
  function Nb(e, t, n, r = "generic") {
    return _(e.query) ? Ms(U(e.query, t, n, r), Os(e)) : [];
  }
  function $b(e, t, n, r = "generic") {
    return _(e.as_select) ? Ms(U(e.as_select, t, n, r), e.columns) : [];
  }
  function Ms(e, t) {
    const n = Array.isArray(t) ? t : [];
    return n.length === 0 ? e : e.map((r, s) => ({
      ...r,
      name: un(n[s]) ?? r.name
    }));
  }
  function un(e) {
    return _(e) && _(e.column_def) ? un(e.column_def) : _(e) ? h(e.name) ?? h(e) : h(e);
  }
  function Os(e) {
    return Array.isArray(e.columns) && e.columns.length > 0 ? e.columns : _(e.schema) && Array.isArray(e.schema.expressions) ? e.schema.expressions : [];
  }
  function Eb(e, t) {
    const n = Array.isArray(e.expressions) ? e.expressions : [], r = n.find(_), s = _(r) && Array.isArray(r.expressions) ? r.expressions : [], a = Array.isArray(e.column_aliases) ? e.column_aliases : [];
    return s.filter(_).map((o, c) => ({
      expression: Rb(n, c, o, t),
      name: h(a[c]) ?? `column_${c + 1}`
    }));
  }
  function Rb(e, t, n, r) {
    const s = e.flatMap((o) => _(o) && Array.isArray(o.expressions) && _(o.expressions[t]) ? [
      o.expressions[t]
    ] : []), a = B(s, r, {
      mode: "none",
      binds: []
    });
    return a ? {
      cast: {
        this: {
          null: null
        },
        to: {
          data_type: a
        }
      }
    } : n;
  }
  function Et(e, t, n, r) {
    const s = U(e.left, t, n, r), a = U(e.right, t, n, r);
    return s.map((o, c) => {
      const u = a[c], l = Fb([
        o,
        u
      ].filter((m) => !!m), t);
      return {
        ...o,
        expression: l ? Bb(l) : o.expression
      };
    });
  }
  function Fb(e, t) {
    const n = e.map((r) => E(r.expression, r.name ?? "set_column", r.schema ?? t, {
      mode: "none",
      binds: []
    }, "generic", r.source, r.tableAliases).type).filter((r) => r !== "unknown");
    return ms(n);
  }
  function Mb(e, t) {
    const n = e.unpivot ? Bs(Db(e), t) : zs(Ob(e), t);
    return n ? n.columns.map((r) => ({
      name: r.name,
      source: `${n.name}.${r.name}`,
      expression: {
        column: {
          name: {
            name: r.name
          },
          table: {
            name: n.name
          }
        }
      },
      schema: {
        tables: [
          n
        ]
      }
    })) : [];
  }
  function Ob(e) {
    return {
      ...e,
      this: Ds(e.this),
      expressions: Array.isArray(e.using) ? e.using : e.expressions,
      fields: Array.isArray(e.fields) && e.fields.length > 0 ? e.fields : [
        {
          in: {
            this: zb(e.expressions),
            expressions: []
          }
        }
      ]
    };
  }
  function Db(e) {
    const t = _(e.into) && _(e.into.unpivot_columns) ? e.into.unpivot_columns : void 0;
    return {
      ...e,
      this: Ds(e.this),
      columns: e.expressions,
      name_column: t == null ? void 0 : t.this,
      value_column: Array.isArray(t == null ? void 0 : t.expressions) ? t.expressions[0] : void 0
    };
  }
  function Ds(e) {
    if (_(e) && _(e.column)) {
      const t = h(e.column.name);
      return t ? {
        table: {
          name: {
            name: t
          }
        }
      } : e;
    }
    return e;
  }
  function zb(e) {
    return Array.isArray(e) ? e.find(_) : void 0;
  }
  function Bb(e) {
    return {
      cast: {
        this: {
          null: null
        },
        to: {
          data_type: e
        }
      }
    };
  }
  function Pb(e, t) {
    if (!_(e) || !Array.isArray(e.ctes)) return {
      tables: []
    };
    const n = [];
    for (const r of e.ctes) {
      if (!_(r)) continue;
      const s = h(r.alias);
      if (!s) continue;
      const a = Array.isArray(r.columns) ? r.columns : [], o = U(r.this, V(t, {
        tables: n
      }));
      n.push({
        name: s,
        columns: Ae(o, a, V(t, {
          tables: n
        }))
      });
    }
    return {
      tables: n
    };
  }
  function Ub(e, t, n = "generic") {
    const r = [];
    Array.isArray(e.lateral_views) && r.push(...e.lateral_views.filter(_).flatMap((s) => Yb(s, V({
      tables: r
    }, t))));
    for (const s of pn(e)) {
      const a = Kb(s, V({
        tables: r
      }, t));
      if (a) {
        r.push(a);
        continue;
      }
      const o = _(s.subquery) ? s.subquery : void 0;
      if (o) {
        const w = h(o.alias);
        if (!w) continue;
        const L = Array.isArray(o.column_aliases) ? o.column_aliases : [], $ = U(o.this, V(t, {
          tables: r
        }));
        r.push({
          name: w,
          columns: Ae($, L, V(t, {
            tables: r
          }))
        });
        continue;
      }
      const c = Gb(s, V({
        tables: r
      }, t), n);
      if (c && !r.some((w) => w.name.toLowerCase() === c.name.toLowerCase())) {
        r.push(c);
        continue;
      }
      const u = fy(s);
      if (u && !r.some((w) => w.name.toLowerCase() === u.name.toLowerCase())) {
        r.push(u);
        continue;
      }
      const l = by(s);
      if (l && !r.some((w) => w.name.toLowerCase() === l.name.toLowerCase())) {
        r.push(l);
        continue;
      }
      const m = yy(s);
      if (m && !r.some((w) => w.name.toLowerCase() === m.name.toLowerCase())) {
        r.push(m);
        continue;
      }
      const y = xy(s, V({
        tables: r
      }, t));
      y && !r.some((w) => w.name.toLowerCase() === y.name.toLowerCase()) && r.push(y);
    }
    return {
      tables: r
    };
  }
  function Kb(e, t) {
    const n = _(e.pivot) ? e.pivot : void 0, r = _(e.unpivot) ? e.unpivot : void 0;
    if (n) return zs(n, t);
    if (r) return Bs(r, t);
  }
  function zs(e, t) {
    const n = ln(e, t), r = h(e.alias) ?? (n == null ? void 0 : n.name);
    if (!n || !r) return;
    const s = Vb(e), a = Array.isArray(e.expressions) ? e.expressions.flatMap(Ze) : [], o = new Set([
      ...s,
      ...a
    ].map((m) => m.toLowerCase())), c = n.columns.filter((m) => !o.has(m.name.toLowerCase())), u = Jb(e), l = Wb(e, t) ?? "unknown";
    return {
      name: r,
      columns: [
        ...c,
        ...u.map((m) => ({
          name: m,
          type: l
        }))
      ]
    };
  }
  function Bs(e, t) {
    const n = ln(e, t), r = h(e.alias) ?? (n == null ? void 0 : n.name), s = h(e.value_column), a = h(e.name_column);
    if (!n || !r || !s || !a) return;
    const o = Array.isArray(e.columns) ? e.columns.flatMap(Ze) : [], c = new Set(o.map((l) => l.toLowerCase())), u = o.map((l) => {
      var _a2;
      return (_a2 = n.columns.find((m) => m.name.toLowerCase() === l.toLowerCase())) == null ? void 0 : _a2.type;
    }).find((l) => !!l) ?? "unknown";
    return {
      name: r,
      columns: [
        ...n.columns.filter((l) => !c.has(l.name.toLowerCase())),
        {
          name: a,
          type: "text"
        },
        {
          name: s,
          type: u
        }
      ]
    };
  }
  function ln(e, t) {
    const n = _(e.this) ? e.this : void 0, r = Le(n ?? {});
    if (r) return t.tables.find((s) => s.name.toLowerCase() === r.toLowerCase());
  }
  function Vb(e) {
    return Array.isArray(e.fields) ? e.fields.flatMap((t) => _(t) && _(t.in) ? Ze(t.in.this) : []) : [];
  }
  function Jb(e) {
    return Array.isArray(e.fields) ? e.fields.flatMap((t) => (_(t) && _(t.in) && Array.isArray(t.in.expressions) ? t.in.expressions : []).map(Hb).filter((r) => !!r)) : [];
  }
  function Hb(e) {
    const t = _(e) ? e.literal : void 0;
    if (_(t)) return M(String(t.value ?? ""));
    const n = _(e) ? e.column : void 0;
    if (_(n)) return h(n.name);
  }
  function Wb(e, t) {
    const n = Array.isArray(e.expressions) ? e.expressions.find(_) : void 0;
    return n ? sn(n, t, {
      mode: "none",
      binds: []
    }) : void 0;
  }
  function Ze(e) {
    if (!_(e)) return [];
    const t = d(e, "column");
    if (_(t)) {
      const n = h(t.name);
      return n ? [
        n
      ] : [];
    }
    return Object.values(e).flatMap((n) => Array.isArray(n) ? n.flatMap(Ze) : Ze(n));
  }
  function Yb(e, t) {
    const n = h(e.table_alias), r = Array.isArray(e.column_aliases) ? e.column_aliases.map(h).filter((a) => !!a) : [];
    if (!n || r.length === 0) return [];
    const s = Qb(e.this, t);
    return [
      {
        name: n,
        columns: r.map((a, o) => ({
          name: a,
          type: s[o] ?? s[0] ?? "unknown"
        }))
      }
    ];
  }
  function Qb(e, t) {
    if (!_(e)) return [];
    const n = d(e, "explode");
    if (_(n)) return Rt(n.this, t);
    const r = d(e, "function");
    if (!_(r)) return [];
    const s = String(r.name ?? "").toLowerCase();
    return s === "explode" || s === "explode_outer" ? Rt(et(N(r)), t) : s === "posexplode" || s === "posexplode_outer" ? [
      "integer",
      ...Rt(et(N(r)), t)
    ] : [];
  }
  function Rt(e, t) {
    if (!_(e)) return [
      "unknown"
    ];
    const n = Vs(e, t);
    if (n) return [
      n
    ];
    const r = E(e, "explode", t, {
      mode: "none",
      binds: []
    }, "generic");
    if (r.type === "unknown") return [
      "unknown"
    ];
    const s = xt(r.type);
    return s || [
      W(r.type) ?? r.type
    ];
  }
  function Gb(e, t, n = "generic") {
    const r = _(e.alias) ? e.alias : void 0, s = _(e.lateral) ? e.lateral : void 0;
    if (s) return Cy(s, t);
    const a = Xb(e, t);
    if (a) return a;
    const o = ey(e, t, n);
    if (o) return o;
    if (!r || !(_(r.this) && (_(r.this.function) || _(r.this.unnest)))) return;
    const c = h(r.alias), u = Array.isArray(r.column_aliases) ? r.column_aliases.map(h).filter((y) => !!y) : [];
    if (c) {
      const y = Zb(r.this), w = y ? t.tables.find(($) => $.name.toLowerCase() === y.toLowerCase()) : void 0;
      if (w) {
        const $ = {
          ...w,
          name: c
        };
        return u.length > 0 ? Zn($, u) : $;
      }
      const L = mn(r.this, c, t, n);
      if (L) return u.length > 0 ? Zn(L, u) : L;
    }
    const l = u.length > 0 ? u : c ? [
      c
    ] : [];
    if (!c || l.length === 0) return;
    const m = vt(r.this, t);
    return {
      name: c,
      columns: l.map((y, w) => ({
        name: y,
        type: m[w] ?? m[0] ?? "unknown"
      }))
    };
  }
  function Zb(e) {
    const t = d(e, "function");
    return _(t) ? fn(t) : void 0;
  }
  function Zn(e, t) {
    return {
      ...e,
      columns: e.columns.map((n, r) => ({
        ...n,
        name: t[r] ?? n.name
      }))
    };
  }
  function Xb(e, t) {
    const n = _(e.tuple) && Array.isArray(e.tuple.expressions) ? e.tuple.expressions : [], r = n.find((l) => _(l) && _(l.function)), s = n.find((l) => _(l) && _(l.table_alias));
    if (!_(r) || !_(s) || !_(s.table_alias)) return;
    const a = h(s.table_alias.this);
    if (!a) return;
    const c = (Array.isArray(s.table_alias.columns) ? s.table_alias.columns : []).flatMap((l) => {
      const m = _(l) && _(l.column_def) ? l.column_def : void 0, y = m ? h(m.name) : void 0;
      return !m || !y ? [] : [
        {
          name: y,
          type: Y(m.data_type) ?? "unknown"
        }
      ];
    });
    if (c.length > 0) return {
      name: a,
      columns: c
    };
    const u = _(r.function) ? String(r.function.name ?? "").toLowerCase() : "";
    return {
      name: a,
      columns: [
        {
          name: a,
          type: Ps(u, r, t)
        }
      ]
    };
  }
  function ey(e, t, n = "generic") {
    if (_(e.function)) {
      const r = String(e.function.name ?? "").toLowerCase(), s = t.tables.find((o) => o.name.toLowerCase() === r);
      if (s) return s;
      const a = mn(e, r, t, n);
      return a || {
        name: r,
        columns: [
          {
            name: r,
            type: Ps(r, e, t)
          }
        ]
      };
    }
    if (_(e.unnest)) {
      const r = e.unnest, s = h(r.alias), a = h(r.offset_alias), o = s ?? "unnest", c = Ly(r, t);
      if (c.length > 0) return {
        name: o,
        columns: ny(c, a, r)
      };
      const u = vt(e, t);
      return {
        name: o,
        columns: u.length > 0 ? u.map((l, m) => ({
          name: ty(m, s, a, r),
          type: l
        })) : [
          {
            name: s ?? "unnest",
            type: "unknown"
          }
        ]
      };
    }
  }
  function ty(e, t, n, r) {
    const s = vt({
      unnest: r
    }, {
      tables: []
    }).length;
    return n && r.with_ordinality === true && e === s - 1 ? n : e === 0 ? t ?? "unnest" : `unnest_${e + 1}`;
  }
  function ny(e, t, n) {
    return n.with_ordinality === true ? [
      ...e,
      {
        name: t ?? "ordinality",
        type: "integer"
      }
    ] : e;
  }
  function mn(e, t, n, r = "generic") {
    const s = d(e, "function");
    if (!_(s)) return;
    const a = fn(s);
    if (a === "table") {
      const o = N(s).find(_), c = dy(o, t);
      if (c) return c;
      const u = my(o);
      if (u) return {
        name: t,
        columns: [
          {
            name: t,
            type: u
          }
        ]
      };
      const l = _(o) ? mn(o, t, n, r) : void 0;
      if (l) return l;
    }
    if (a === "flatten") return Ks(t);
    if (a === "generator") return {
      name: t,
      columns: []
    };
    if (a === "split_to_table") return {
      name: t,
      columns: [
        {
          name: "seq",
          type: "integer"
        },
        {
          name: "index",
          type: "integer"
        },
        {
          name: "value",
          type: "text"
        }
      ]
    };
    if (a === "stack") return sy(s, t, n);
    if (a === "infer_schema") return {
      name: t,
      columns: [
        {
          name: "expression",
          type: "text"
        },
        {
          name: "column_name",
          type: "text"
        },
        {
          name: "type",
          type: "text"
        },
        {
          name: "nullable",
          type: "boolean"
        },
        {
          name: "filenames",
          type: "array<text>"
        },
        {
          name: "order_id",
          type: "integer"
        }
      ]
    };
    if (a === "json_populate_record" || a === "jsonb_populate_record") {
      const o = N(s)[0], c = _(o) ? d(o, "cast") : void 0, u = _(c) && _(c.to) ? M(String(c.to.name ?? c.to.data_type ?? "")) : void 0, l = u ? n.tables.find((m) => m.name.toLowerCase() === u.toLowerCase()) : void 0;
      if (l) return {
        ...l,
        name: t
      };
    }
    if (a === "generate_series" || a === "range") {
      const o = B(N(s), {
        tables: []
      }, {
        mode: "none",
        binds: []
      });
      return {
        name: t,
        columns: [
          {
            name: r === "sqlite" && a === "generate_series" ? "value" : t,
            type: o && /date|time|timestamp/i.test(o) ? o : "integer"
          }
        ]
      };
    }
    if (a === "fts5vocab") return uy(s, t);
    if (a.startsWith("pragma_")) return ly(a, t);
    if (a === "numbers" || a === "numbers_mt") return {
      name: t,
      columns: [
        {
          name: t,
          type: "integer"
        }
      ]
    };
    if ([
      "remote",
      "remotesecure",
      "cluster",
      "clusterallreplicas"
    ].includes(a)) {
      const o = ry(N(s)), c = o ? n.tables.find((u) => u.name.toLowerCase() === o.toLowerCase()) : void 0;
      if (c) return {
        ...c,
        name: t
      };
    }
    if (a === "sequence") {
      const o = B(N(s), {
        tables: []
      }, {
        mode: "none",
        binds: []
      }) ?? "integer";
      return {
        name: t,
        columns: [
          {
            name: t,
            type: o
          }
        ]
      };
    }
    if (a === "generate_subscripts") return {
      name: t,
      columns: [
        {
          name: t,
          type: "integer"
        }
      ]
    };
    if (a === "generate_array") {
      const o = B(N(s), {
        tables: []
      }, {
        mode: "none",
        binds: []
      }) ?? "integer";
      return {
        name: t,
        columns: [
          {
            name: t,
            type: o
          }
        ]
      };
    }
    if (a === "generate_date_array") return {
      name: t,
      columns: [
        {
          name: t,
          type: "date"
        }
      ]
    };
    if (a === "generate_timestamp_array") return {
      name: t,
      columns: [
        {
          name: t,
          type: "timestamp"
        }
      ]
    };
    if (a === "string_split") return {
      name: t,
      columns: [
        {
          name: "value",
          type: "text"
        }
      ]
    };
    if (a === "current_setting") return {
      name: t,
      columns: [
        {
          name: t,
          type: "text"
        }
      ]
    };
    if ([
      "regexp_matches",
      "regexp_split_to_array"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: t,
          type: "array<text>"
        }
      ]
    };
    if (a === "regexp_split_to_table") return {
      name: t,
      columns: [
        {
          name: t,
          type: "text"
        }
      ]
    };
    if ([
      "json_array_elements",
      "jsonb_array_elements"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: t,
          type: "json"
        }
      ]
    };
    if ([
      "json_array_elements_text",
      "jsonb_array_elements_text"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: t,
          type: "text"
        }
      ]
    };
    if (a === "json_object_keys" || a === "jsonb_object_keys") return {
      name: t,
      columns: [
        {
          name: t,
          type: "text"
        }
      ]
    };
    if ([
      "json_each_text",
      "jsonb_each_text"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: "key",
          type: "text"
        },
        {
          name: "value",
          type: "text"
        }
      ]
    };
    if (a === "jsonb_each") return {
      name: t,
      columns: [
        {
          name: "key",
          type: "text"
        },
        {
          name: "value",
          type: "json"
        }
      ]
    };
    if (a === "pg_get_keywords") return {
      name: t,
      columns: [
        {
          name: "word",
          type: "text"
        },
        {
          name: "catcode",
          type: "text"
        },
        {
          name: "catdesc",
          type: "text"
        },
        {
          name: "baredesc",
          type: "text"
        }
      ]
    };
    if (a === "ts_debug") return {
      name: t,
      columns: [
        {
          name: "alias",
          type: "text"
        },
        {
          name: "description",
          type: "text"
        },
        {
          name: "token",
          type: "text"
        },
        {
          name: "dictionaries",
          type: "text[]"
        },
        {
          name: "dictionary",
          type: "text"
        },
        {
          name: "lexemes",
          type: "text[]"
        }
      ]
    };
    if (a === "aclexplode") return {
      name: t,
      columns: [
        {
          name: "grantor",
          type: "oid"
        },
        {
          name: "grantee",
          type: "oid"
        },
        {
          name: "privilege_type",
          type: "text"
        },
        {
          name: "is_grantable",
          type: "boolean"
        }
      ]
    };
    if (a === "pg_options_to_table") return {
      name: t,
      columns: [
        {
          name: "option_name",
          type: "text"
        },
        {
          name: "option_value",
          type: "text"
        }
      ]
    };
    if (a === "pg_stat_get_activity") return {
      name: t,
      columns: [
        {
          name: "datid",
          type: "oid"
        },
        {
          name: "pid",
          type: "integer"
        },
        {
          name: "usesysid",
          type: "oid"
        },
        {
          name: "application_name",
          type: "text"
        },
        {
          name: "state",
          type: "text"
        },
        {
          name: "query",
          type: "text"
        },
        {
          name: "query_start",
          type: "timestamp"
        },
        {
          name: "backend_start",
          type: "timestamp"
        },
        {
          name: "xact_start",
          type: "timestamp"
        },
        {
          name: "waiting",
          type: "boolean"
        }
      ]
    };
    if (a === "pg_get_object_address") return {
      name: t,
      columns: [
        {
          name: "classid",
          type: "oid"
        },
        {
          name: "objid",
          type: "oid"
        },
        {
          name: "objsubid",
          type: "integer"
        }
      ]
    };
    if (a === "pg_ls_dir") return {
      name: t,
      columns: [
        {
          name: t,
          type: "text"
        }
      ]
    };
    if (a === "pg_read_file" || a === "pg_read_binary_file") return {
      name: t,
      columns: [
        {
          name: t,
          type: a === "pg_read_binary_file" ? "bytes" : "text"
        }
      ]
    };
    if ([
      "pg_ls_waldir",
      "pg_ls_logdir",
      "pg_ls_archive_statusdir",
      "pg_ls_tmpdir"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: "name",
          type: "text"
        },
        {
          name: "size",
          type: "bigint"
        },
        {
          name: "modification",
          type: "timestamp"
        }
      ]
    };
    if (a === "pg_stat_get_snapshot_timestamp") return {
      name: t,
      columns: [
        {
          name: t,
          type: "timestamp"
        }
      ]
    };
    if (a === "pg_stat_file") return {
      name: t,
      columns: [
        {
          name: "size",
          type: "bigint"
        },
        {
          name: "access",
          type: "timestamp"
        },
        {
          name: "modification",
          type: "timestamp"
        },
        {
          name: "change",
          type: "timestamp"
        },
        {
          name: "creation",
          type: "timestamp"
        },
        {
          name: "isdir",
          type: "boolean"
        }
      ]
    };
    if (a === "pg_timezone_names") return {
      name: t,
      columns: [
        {
          name: "name",
          type: "text"
        },
        {
          name: "abbrev",
          type: "text"
        },
        {
          name: "utc_offset",
          type: "interval"
        },
        {
          name: "is_dst",
          type: "boolean"
        }
      ]
    };
    if (a === "pg_timezone_abbrevs") return {
      name: t,
      columns: [
        {
          name: "abbrev",
          type: "text"
        },
        {
          name: "utc_offset",
          type: "interval"
        },
        {
          name: "is_dst",
          type: "boolean"
        }
      ]
    };
    if (a === "pg_available_extension_versions") return {
      name: t,
      columns: [
        {
          name: "name",
          type: "text"
        },
        {
          name: "version",
          type: "text"
        },
        {
          name: "installed",
          type: "boolean"
        },
        {
          name: "superuser",
          type: "boolean"
        },
        {
          name: "trusted",
          type: "boolean"
        },
        {
          name: "relocatable",
          type: "boolean"
        },
        {
          name: "schema",
          type: "text"
        },
        {
          name: "requires",
          type: "array<text>"
        },
        {
          name: "comment",
          type: "text"
        }
      ]
    };
    if ([
      "pg_logical_slot_get_changes",
      "pg_logical_slot_peek_changes"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: "lsn",
          type: "pg_lsn"
        },
        {
          name: "xid",
          type: "xid"
        },
        {
          name: "data",
          type: "text"
        }
      ]
    };
    if (a === "glob") return {
      name: t,
      columns: [
        {
          name: "file",
          type: "text"
        }
      ]
    };
    if (a === "read_blob") return {
      name: t,
      columns: [
        {
          name: "filename",
          type: "text"
        },
        {
          name: "content",
          type: "blob"
        }
      ]
    };
    if (a === "read_text") return {
      name: t,
      columns: [
        {
          name: "filename",
          type: "text"
        },
        {
          name: "content",
          type: "text"
        }
      ]
    };
    if (a === "parquet_schema") return {
      name: t,
      columns: [
        {
          name: "file_name",
          type: "text"
        },
        {
          name: "name",
          type: "text"
        },
        {
          name: "type",
          type: "text"
        },
        {
          name: "type_length",
          type: "text"
        },
        {
          name: "repetition_type",
          type: "text"
        },
        {
          name: "num_children",
          type: "integer"
        },
        {
          name: "converted_type",
          type: "text"
        },
        {
          name: "scale",
          type: "integer"
        },
        {
          name: "precision",
          type: "integer"
        },
        {
          name: "field_id",
          type: "integer"
        },
        {
          name: "logical_type",
          type: "text"
        }
      ]
    };
    if (a === "parquet_metadata") return {
      name: t,
      columns: [
        {
          name: "file_name",
          type: "text"
        },
        {
          name: "row_group_id",
          type: "integer"
        },
        {
          name: "row_group_num_rows",
          type: "integer"
        },
        {
          name: "row_group_num_columns",
          type: "integer"
        },
        {
          name: "row_group_bytes",
          type: "integer"
        },
        {
          name: "column_id",
          type: "integer"
        },
        {
          name: "file_offset",
          type: "integer"
        },
        {
          name: "num_values",
          type: "integer"
        },
        {
          name: "path_in_schema",
          type: "text"
        },
        {
          name: "type",
          type: "text"
        },
        {
          name: "stats_min",
          type: "text"
        },
        {
          name: "stats_max",
          type: "text"
        },
        {
          name: "stats_null_count",
          type: "integer"
        },
        {
          name: "total_compressed_size",
          type: "integer"
        },
        {
          name: "total_uncompressed_size",
          type: "integer"
        }
      ]
    };
    if ([
      "read_csv",
      "read_csv_auto",
      "read_json",
      "read_json_auto",
      "read_ndjson",
      "read_ndjson_auto",
      "read_parquet",
      "read_xlsx"
    ].includes(a)) {
      const o = ay(s);
      if (o.length > 0) return {
        name: t,
        columns: o
      };
    }
    if ([
      "read_json_objects",
      "read_ndjson_objects"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: "json",
          type: "json"
        }
      ]
    };
    if (a === "parquet_file_metadata") return {
      name: t,
      columns: [
        {
          name: "file_name",
          type: "text"
        },
        {
          name: "created_by",
          type: "text"
        },
        {
          name: "num_rows",
          type: "integer"
        },
        {
          name: "num_row_groups",
          type: "integer"
        },
        {
          name: "format_version",
          type: "text"
        },
        {
          name: "encryption_algorithm",
          type: "text"
        },
        {
          name: "footer_signing_key_metadata",
          type: "text"
        }
      ]
    };
    if (a === "parquet_kv_metadata") return {
      name: t,
      columns: [
        {
          name: "file_name",
          type: "text"
        },
        {
          name: "key",
          type: "text"
        },
        {
          name: "value",
          type: "bytes"
        }
      ]
    };
    if ([
      "file",
      "url",
      "s3",
      "s3cluster",
      "hdfs",
      "azureblobstorage",
      "generaterandom"
    ].includes(a)) {
      const o = dn(iy(N(s)));
      if (o.length > 0) return {
        name: t,
        columns: o
      };
    }
    if ([
      "mysql",
      "postgresql",
      "odbc",
      "jdbc"
    ].includes(a)) {
      const o = N(s), c = a === "mysql" || a === "postgresql" ? nt(o[2]) : _y(o), u = c ? n.tables.find((l) => l.name.toLowerCase() === c.toLowerCase()) : void 0;
      if (u) return {
        ...u,
        name: t
      };
    }
    if (a === "pragma_table_info") return {
      name: t,
      columns: [
        {
          name: "cid",
          type: "integer"
        },
        {
          name: "name",
          type: "text"
        },
        {
          name: "type",
          type: "text"
        },
        {
          name: "notnull",
          type: "integer"
        },
        {
          name: "dflt_value",
          type: "text"
        },
        {
          name: "pk",
          type: "integer"
        }
      ]
    };
    if (a === "duckdb_tables") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "table_name",
          type: "text"
        },
        {
          name: "table_type",
          type: "text"
        },
        {
          name: "temporary",
          type: "boolean"
        }
      ]
    };
    if (a === "duckdb_columns") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "table_name",
          type: "text"
        },
        {
          name: "column_name",
          type: "text"
        },
        {
          name: "column_index",
          type: "integer"
        },
        {
          name: "data_type",
          type: "text"
        },
        {
          name: "is_nullable",
          type: "boolean"
        }
      ]
    };
    if (a === "duckdb_keywords") return {
      name: t,
      columns: [
        {
          name: "keyword_name",
          type: "text"
        },
        {
          name: "keyword_category",
          type: "text"
        }
      ]
    };
    if (a === "duckdb_types") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "type_name",
          type: "text"
        },
        {
          name: "type_size",
          type: "integer"
        },
        {
          name: "logical_type",
          type: "text"
        },
        {
          name: "labels",
          type: "array<text>"
        }
      ]
    };
    if (a === "duckdb_memory") return {
      name: t,
      columns: [
        {
          name: "tag",
          type: "text"
        },
        {
          name: "memory_usage_bytes",
          type: "integer"
        },
        {
          name: "temporary_storage_bytes",
          type: "integer"
        }
      ]
    };
    if (a === "duckdb_constraints") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "database_oid",
          type: "integer"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "schema_oid",
          type: "integer"
        },
        {
          name: "table_name",
          type: "text"
        },
        {
          name: "table_oid",
          type: "integer"
        },
        {
          name: "constraint_index",
          type: "integer"
        },
        {
          name: "constraint_type",
          type: "text"
        },
        {
          name: "constraint_text",
          type: "text"
        },
        {
          name: "expression",
          type: "text"
        },
        {
          name: "constraint_column_indexes",
          type: "array<integer>"
        },
        {
          name: "constraint_column_names",
          type: "array<text>"
        }
      ]
    };
    if (a === "duckdb_schemas") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "internal",
          type: "boolean"
        }
      ]
    };
    if (a === "duckdb_views") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "view_name",
          type: "text"
        },
        {
          name: "temporary",
          type: "boolean"
        },
        {
          name: "sql",
          type: "text"
        }
      ]
    };
    if (a === "duckdb_functions") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "function_name",
          type: "text"
        },
        {
          name: "function_type",
          type: "text"
        },
        {
          name: "return_type",
          type: "text"
        }
      ]
    };
    if (a === "duckdb_sequences") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "sequence_name",
          type: "text"
        },
        {
          name: "start_value",
          type: "integer"
        },
        {
          name: "min_value",
          type: "integer"
        },
        {
          name: "max_value",
          type: "integer"
        },
        {
          name: "increment_by",
          type: "integer"
        },
        {
          name: "cycle",
          type: "boolean"
        }
      ]
    };
    if (a === "duckdb_indexes") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "schema_name",
          type: "text"
        },
        {
          name: "index_name",
          type: "text"
        },
        {
          name: "table_name",
          type: "text"
        },
        {
          name: "is_unique",
          type: "boolean"
        },
        {
          name: "sql",
          type: "text"
        }
      ]
    };
    if (a === "duckdb_settings") return {
      name: t,
      columns: [
        {
          name: "name",
          type: "text"
        },
        {
          name: "value",
          type: "text"
        },
        {
          name: "description",
          type: "text"
        },
        {
          name: "input_type",
          type: "text"
        },
        {
          name: "scope",
          type: "text"
        },
        {
          name: "aliases",
          type: "array<text>"
        }
      ]
    };
    if (a === "duckdb_extensions") return {
      name: t,
      columns: [
        {
          name: "extension_name",
          type: "text"
        },
        {
          name: "loaded",
          type: "boolean"
        },
        {
          name: "installed",
          type: "boolean"
        },
        {
          name: "install_path",
          type: "text"
        },
        {
          name: "description",
          type: "text"
        },
        {
          name: "aliases",
          type: "array<text>"
        }
      ]
    };
    if (a === "duckdb_databases") return {
      name: t,
      columns: [
        {
          name: "database_name",
          type: "text"
        },
        {
          name: "database_oid",
          type: "integer"
        },
        {
          name: "path",
          type: "text"
        },
        {
          name: "internal",
          type: "boolean"
        }
      ]
    };
    if (a === "openquery" || a === "openrowset") {
      const o = cy(s, t, n);
      if (o) return o;
    }
    if ([
      "openquery",
      "opendatasource",
      "openrowset"
    ].includes(a)) return {
      name: t,
      columns: [
        {
          name: t,
          type: "unknown"
        }
      ]
    };
    if (a === "json_each" || a === "json_tree") return {
      name: t,
      columns: [
        {
          name: "key",
          type: "text"
        },
        {
          name: "value",
          type: "json"
        },
        {
          name: "type",
          type: "text"
        },
        {
          name: "atom",
          type: "json"
        },
        {
          name: "id",
          type: "integer"
        },
        {
          name: "parent",
          type: "integer"
        },
        {
          name: "fullkey",
          type: "text"
        },
        {
          name: "path",
          type: "text"
        }
      ]
    };
  }
  function ry(e) {
    const t = e[2] ?? e.at(-1);
    if (!t) return;
    const n = _(t) ? d(t, "column") : void 0;
    return nt(t) ?? (_(n) ? h(n.name) : void 0);
  }
  function sy(e, t, n) {
    const r = N(e), s = mp(r[0]) ?? 1, a = r.slice(1), o = Math.max(1, Math.ceil(a.length / Math.max(1, s)));
    return {
      name: t,
      columns: Array.from({
        length: o
      }, (c, u) => {
        const l = a.filter((m, y) => y % o === u);
        return {
          name: `col${u}`,
          type: B(l, n, {
            mode: "none",
            binds: []
          }) ?? "unknown"
        };
      })
    };
  }
  function ay(e) {
    var _a2;
    for (const t of N(e)) {
      const n = d(t, "eq");
      if (!_(n) || ((_a2 = _(n.left) ? h(d(n.left, "column") && d(n.left, "column").name) : void 0) == null ? void 0 : _a2.toLowerCase()) !== "columns") continue;
      const s = oy(n.right);
      if (s.length > 0) return s;
    }
    return [];
  }
  function oy(e) {
    const t = _(e) ? d(e, "map_func") : void 0;
    if (!_(t) || !Array.isArray(t.keys) || !Array.isArray(t.values)) return [];
    const n = t.keys, r = t.values;
    return n.flatMap((s, a) => {
      const o = Te(s), c = Te(r[a]);
      return !o || !c ? [] : [
        {
          name: o,
          type: Pe(c) ?? "unknown"
        }
      ];
    });
  }
  function dn(e) {
    return e ? se(e, ",").flatMap((t) => {
      const n = t.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
      if (!n) return [];
      const r = M(n[1]), s = Pe(n[2]) ?? "unknown";
      return r ? [
        {
          name: r,
          type: s
        }
      ] : [];
    }) : [];
  }
  function iy(e) {
    for (let t = e.length - 1; t >= 0; t -= 1) {
      const n = Te(e[t]);
      if (n && /\w+\s+\w+/.test(n)) return n;
    }
  }
  function cy(e, t, n) {
    const r = N(e).map(nt);
    let s;
    for (let a = r.length - 1; a >= 0; a -= 1) {
      const o = r[a];
      if (o !== void 0 && /^(?:with|select|values)\b/i.test(o.trim())) {
        s = o;
        break;
      }
    }
    if (s) try {
      const a = Q(s, "tsql");
      if (!a.success) return;
      const c = (Array.isArray(a.ast) ? a.ast : [
        a.ast
      ]).find(_);
      if (!c) return;
      const u = U(c, n, tt(), "tsql"), l = Ae(u, [], n);
      return l.length > 0 ? {
        name: t,
        columns: l
      } : void 0;
    } catch {
      return;
    }
  }
  function nt(e) {
    const t = _(e) ? e.literal : void 0;
    return _(t) && t.literal_type === "string" ? String(t.value ?? "") : void 0;
  }
  function _y(e) {
    for (let t = e.length - 1; t >= 0; t -= 1) {
      const n = nt(e[t]);
      if (n) return n;
    }
  }
  function fn(e) {
    return String(e.name ?? "").toLowerCase().split(".").at(-1) ?? "";
  }
  function Ps(e, t, n) {
    if (e === "regexp_matches") return "array<text>";
    if (e === "string_split") return "text";
    if (e === "generate_series" || e === "range") {
      const r = d(t, "function"), s = _(r) ? B(N(r), n, {
        mode: "none",
        binds: []
      }) : void 0;
      return s && /date|time|timestamp/i.test(s) ? s : "integer";
    }
    return "unknown";
  }
  function uy(e, t) {
    var _a2;
    const n = (_a2 = nt(N(e)[1])) == null ? void 0 : _a2.toLowerCase(), r = [
      {
        name: "term",
        type: "text"
      },
      {
        name: "doc",
        type: "integer"
      },
      {
        name: "cnt",
        type: "integer"
      }
    ];
    return n === "col" ? {
      name: t,
      columns: [
        {
          name: "term",
          type: "text"
        },
        {
          name: "col",
          type: "text"
        },
        {
          name: "doc",
          type: "integer"
        },
        {
          name: "cnt",
          type: "integer"
        }
      ]
    } : n === "instance" ? {
      name: t,
      columns: [
        {
          name: "term",
          type: "text"
        },
        {
          name: "doc",
          type: "integer"
        },
        {
          name: "col",
          type: "text"
        },
        {
          name: "offset",
          type: "integer"
        }
      ]
    } : {
      name: t,
      columns: r
    };
  }
  function ly(e, t) {
    const n = e.replace(/^pragma_/, ""), r = Fs({
      name: {
        name: n
      }
    });
    if (r.length !== 0) return {
      name: t,
      columns: Ae(r, [], {
        tables: []
      })
    };
  }
  function my(e) {
    var _a2;
    const t = _(e) && _(e.method_call) ? e.method_call : void 0;
    if (!t) return;
    const n = (_a2 = h(t.method)) == null ? void 0 : _a2.toLowerCase();
    if (n) {
      if (/numberlist$/.test(n)) return "number";
      if (/varchar2list$/.test(n) || /varcharlist$/.test(n)) return "text";
      if (/datelist$/.test(n)) return "date";
    }
  }
  function dy(e, t) {
    var _a2, _b2;
    const n = _(e) ? d(e, "column") : void 0;
    if (!_(n)) return;
    const r = (_a2 = h(n.table)) == null ? void 0 : _a2.toLowerCase(), s = (_b2 = h(n.name)) == null ? void 0 : _b2.toLowerCase();
    if (!(r !== "dbms_xplan" || !(s == null ? void 0 : s.startsWith("display")))) return {
      name: t,
      columns: [
        {
          name: "plan_table_output",
          type: "text"
        }
      ]
    };
  }
  function fy(e) {
    const t = _(e.open_j_s_o_n) ? e.open_j_s_o_n : _(e.alias) && _(e.alias.this) && _(e.alias.this.open_j_s_o_n) ? e.alias.this.open_j_s_o_n : void 0;
    if (!t) return;
    const n = _(e.alias) ? h(e.alias.alias) ?? "openjson" : "openjson", r = py(t);
    return {
      name: n,
      columns: r.length > 0 ? r : gy()
    };
  }
  function py(e) {
    return (Array.isArray(e.expressions) ? e.expressions : []).flatMap((n) => {
      const r = _(n) && _(n.open_j_s_o_n_column_def) ? n.open_j_s_o_n_column_def : void 0, s = r ? h(r.this) : void 0;
      return !r || !s ? [] : [
        {
          name: s,
          type: Y(r.data_type) ?? (r.as_json ? "json" : "unknown")
        }
      ];
    });
  }
  function gy() {
    return [
      {
        name: "key",
        type: "text"
      },
      {
        name: "value",
        type: "text"
      },
      {
        name: "type",
        type: "integer"
      }
    ];
  }
  function by(e) {
    const t = _(e.alias) ? e.alias : void 0, n = _(e.j_s_o_n_table) ? e.j_s_o_n_table : t && _(t.this) && _(t.this.j_s_o_n_table) ? t.this.j_s_o_n_table : void 0, r = t ? h(t.alias) : "json_table";
    if (!n || !r) return;
    const s = Us(n);
    return s.length > 0 ? {
      name: r,
      columns: s
    } : void 0;
  }
  function yy(e) {
    const t = _(e.alias) ? e.alias : void 0, n = _(e.x_m_l_table) ? e.x_m_l_table : t && _(t.this) && _(t.this.x_m_l_table) ? t.this.x_m_l_table : void 0, r = t ? h(t.alias) : "xmltable";
    if (!n || !r) return;
    const s = Array.isArray(n.columns) ? n.columns.flatMap((a) => {
      const o = _(a) && _(a.column_def) ? a.column_def : void 0, c = o ? h(o.name) : void 0;
      return !o || !c ? [] : [
        {
          name: c,
          type: Y(o.data_type) ?? "unknown",
          nullable: typeof o.nullable == "boolean" ? o.nullable : void 0
        }
      ];
    }) : [];
    return s.length > 0 ? {
      name: r,
      columns: s
    } : void 0;
  }
  function Us(e) {
    const t = _(e.schema) && _(e.schema.j_s_o_n_schema) ? e.schema.j_s_o_n_schema : _(e.j_s_o_n_schema) ? e.j_s_o_n_schema : void 0;
    return (t && Array.isArray(t.expressions) ? t.expressions : []).flatMap(wy);
  }
  function wy(e) {
    if (!_(e) || !_(e.j_s_o_n_column_def)) return [];
    const t = e.j_s_o_n_column_def;
    if (_(t.nested_schema)) return Us(t.nested_schema);
    const n = h(t.this);
    return n ? [
      {
        name: n,
        type: t.ordinality ? "integer" : hy(t.kind)
      }
    ] : [];
  }
  function hy(e) {
    return typeof e != "string" || e.length === 0 ? "unknown" : ie(e);
  }
  function xy(e, t) {
    const n = _(e.match_recognize) ? e.match_recognize : void 0;
    if (!n) return;
    const r = ln(n, t), s = h(n.alias) ?? (r == null ? void 0 : r.name);
    if (!(!r || !s)) return {
      name: s,
      columns: [
        ...r.columns,
        ...vy(n, t)
      ]
    };
  }
  function vy(e, t) {
    return (Array.isArray(e.measures) ? e.measures : []).flatMap((r) => {
      const s = _(r) ? r.this : void 0;
      if (!_(s)) return [];
      const a = rt(s), o = a.name ?? je(a.expression, 1), c = E(a.expression, o, t, {
        mode: "none",
        binds: []
      }, "generic");
      return [
        {
          name: o,
          type: c.type,
          nullable: c.nullable
        }
      ];
    });
  }
  function Cy(e, t) {
    const n = h(e.alias), r = Array.isArray(e.column_aliases) ? e.column_aliases.map(h).filter((o) => !!o) : [];
    if (!n) return;
    const s = Ay(e.this, n);
    if (s) return s;
    if (r.length === 0) return;
    const a = vt(e.this, t);
    return {
      name: n,
      columns: r.map((o, c) => ({
        name: o,
        type: a[c] ?? a[0] ?? "unknown"
      }))
    };
  }
  function Ay(e, t) {
    const n = d(e, "function");
    if (!(!_(n) || String(n.name ?? "").toLowerCase() !== "flatten")) return Ks(t);
  }
  function Ks(e) {
    return {
      name: e,
      columns: [
        {
          name: "seq",
          type: "integer"
        },
        {
          name: "key",
          type: "text"
        },
        {
          name: "path",
          type: "text"
        },
        {
          name: "index",
          type: "integer"
        },
        {
          name: "value",
          type: "variant"
        },
        {
          name: "this",
          type: "variant"
        }
      ]
    };
  }
  function vt(e, t) {
    if (!_(e)) return [];
    const n = d(e, "unnest");
    if (_(n)) {
      const a = Sy(n, t);
      if (a) return n.with_ordinality === true ? [
        ...a,
        "integer"
      ] : a;
      const c = [
        ..._(n.this) ? [
          n.this
        ] : [],
        ...Array.isArray(n.expressions) ? n.expressions.filter(_) : []
      ].map((u) => Vs(u, t) ?? "unknown");
      return n.with_ordinality === true ? [
        ...c,
        "integer"
      ] : c;
    }
    const r = d(e, "function");
    if (!_(r)) return [];
    const s = String(r.name ?? "").toLowerCase();
    if (s === "generate_series" || s === "range") {
      const a = B(N(r), t, {
        mode: "none",
        binds: []
      });
      return a && /date|time|timestamp/i.test(a) ? [
        a
      ] : [
        "integer"
      ];
    }
    if (s === "explode" || s === "explode_outer" || s === "inline" || s === "inline_outer") {
      const a = G(N(r), t, {
        mode: "none",
        binds: []
      });
      return [
        a ? W(a) ?? a : "unknown"
      ];
    }
    if (s === "posexplode" || s === "posexplode_outer") {
      const a = G(N(r), t, {
        mode: "none",
        binds: []
      });
      return [
        "integer",
        a ? W(a) ?? a : "unknown"
      ];
    }
    return [];
  }
  function Sy(e, t) {
    const r = [
      ..._(e.this) ? [
        e.this
      ] : [],
      ...Array.isArray(e.expressions) ? e.expressions.filter(_) : []
    ].find(_);
    if (!r) return;
    const s = d(r, "function");
    if (_(s) && String(s.name ?? "").toLowerCase() === "map") {
      const c = N(s), u = W(E(c[0], "map_keys", t, {
        mode: "none",
        binds: []
      }, "generic").type) ?? "unknown", l = W(E(c[1], "map_values", t, {
        mode: "none",
        binds: []
      }, "generic").type) ?? "unknown";
      return [
        u,
        l
      ];
    }
    const a = E(r, "unnest_map", t, {
      mode: "none",
      binds: []
    }, "generic").type, o = xt(a);
    return o ? [
      ...o
    ] : void 0;
  }
  function Ly(e, t) {
    const n = [
      ..._(e.this) ? [
        e.this
      ] : [],
      ...Array.isArray(e.expressions) ? e.expressions.filter(_) : []
    ];
    for (const r of n) {
      const s = d(r, "array_func"), o = (_(s) && Array.isArray(s.expressions) ? s.expressions.filter(_) : []).find(_);
      if (!o) continue;
      const c = d(o, "function");
      if (!_(c) || String(c.name ?? "").toLowerCase() !== "struct") continue;
      const u = N(c).flatMap((l, m) => {
        const y = rt(l), w = y.name ?? je(y.expression, m + 1), L = E(y.expression, w, t, {
          mode: "none",
          binds: []
        }, "generic");
        return [
          {
            name: w,
            type: L.type,
            nullable: L.nullable
          }
        ];
      });
      if (u.length > 0) return u;
    }
    return [];
  }
  function Vs(e, t) {
    if (!_(e)) return;
    const n = d(e, "array_func");
    if (_(n) && Array.isArray(n.expressions)) return B(n.expressions.filter(_), t, {
      mode: "none",
      binds: []
    });
    const r = d(e, "function");
    if (_(r) && String(r.name ?? "").toLowerCase() === "array") return B(N(r), t, {
      mode: "none",
      binds: []
    });
    if (_(r) && String(r.name ?? "").toLowerCase() === "sequence") return B(N(r), t, {
      mode: "none",
      binds: []
    }) ?? "integer";
    const s = E(e, "unnest", t, {
      mode: "none",
      binds: []
    }, "generic");
    if (s.type !== "unknown") return W(s.type);
  }
  function Ae(e, t, n) {
    return e.map((r, s) => {
      const a = E(r.expression, r.name ?? `column_${s + 1}`, r.schema ?? n, {
        mode: "none",
        binds: []
      }, "generic", r.source, r.tableAliases, r.functionReturnTypes);
      return {
        name: un(t[s]) ?? r.name ?? `column_${s + 1}`,
        type: a.type,
        nullable: a.nullable
      };
    });
  }
  function Ft(e, t) {
    const n = Array.isArray(e.returning) ? e.returning : [], r = qy(e.output, t, e);
    return [
      ...Xe(n, t, e),
      ...r
    ];
  }
  function ky(e, t) {
    const n = _(e.returning) && _(e.returning.returning) && Array.isArray(e.returning.returning.expressions) ? e.returning.returning.expressions : [];
    return n.length === 0 ? [] : Xe(n, t, Ty(e));
  }
  function Ty(e) {
    const t = jy(e.this), n = _(e.using) ? [
      e.using
    ] : [];
    return {
      ...t.table ? {
        table: t.table
      } : {},
      ...t.alias ? {
        alias: t.alias
      } : {},
      ...n.length > 0 ? {
        using: n
      } : {}
    };
  }
  function jy(e) {
    if (_(e) && _(e.table)) return {
      table: e.table
    };
    const t = _(e) && _(e.alias) ? e.alias : void 0;
    return t && _(t.this) && _(t.this.table) ? {
      table: t.this.table,
      alias: t
    } : {};
  }
  function qy(e, t, n) {
    if (!_(e)) return [];
    const r = Array.isArray(e.expressions) ? e.expressions : Array.isArray(e.columns) ? e.columns : [];
    return Xe(r, t, n);
  }
  function Xe(e, t, n, r) {
    if (!Array.isArray(e)) return [];
    const s = [], a = Js(n);
    for (const o of e) {
      if (!_(o)) continue;
      const c = rt(o), u = d(c.expression, "star");
      if (_(u)) {
        s.push(...Iy(u, t, n, a));
        continue;
      }
      s.push({
        ...c,
        schema: t,
        tableAliases: a,
        functionReturnTypes: r == null ? void 0 : r.functionReturnTypes
      });
    }
    return s;
  }
  function rt(e) {
    const t = d(e, "alias");
    return _(t) && _(t.this) ? {
      expression: t.this,
      name: h(t.alias)
    } : _(e.this) && _(e.alias) ? {
      expression: e.this,
      name: h(e.alias)
    } : {
      expression: e,
      name: je(e, 0)
    };
  }
  function Iy(e, t, n, r = Js(n)) {
    var _a2, _b2;
    const s = (_a2 = h(e.table)) == null ? void 0 : _a2.toLowerCase(), a = s ? r.get(s) : void 0, o = s ? (a == null ? void 0 : a.tableName.toLowerCase()) ?? s : void 0, c = (_b2 = a == null ? void 0 : a.schemaName) == null ? void 0 : _b2.toLowerCase(), u = [
      ...new Set([
        ...r.values()
      ].map((S) => S.tableName))
    ].map((S) => S.toLowerCase()), l = [
      ...new Set([
        ...r.values()
      ].map((S) => S.schemaName).filter((S) => !!S))
    ].map((S) => S.toLowerCase()), m = Ny(t.tables.filter((S) => {
      var _a3, _b3;
      return o ? S.name.toLowerCase() !== o ? false : c ? ((_a3 = S.schema) == null ? void 0 : _a3.toLowerCase()) === c : !S.schema : !(c && ((_b3 = S.schema) == null ? void 0 : _b3.toLowerCase()) !== c || u.length > 0 && !u.includes(S.name.toLowerCase()) || u.length > 0 && S.schema && l.length === 0 || l.length > 0 && (!S.schema || !l.includes(S.schema.toLowerCase())));
    })), y = new Set((Array.isArray(e.except) ? e.except : []).map(h).filter((S) => !!S).map((S) => S.toLowerCase())), w = new Map((Array.isArray(e.rename) ? e.rename : []).filter(Array.isArray).map((S) => {
      var _a3;
      return [
        (_a3 = h(S[0])) == null ? void 0 : _a3.toLowerCase(),
        h(S[1])
      ];
    }).filter((S) => !!(S[0] && S[1]))), L = new Map((Array.isArray(e.replace) ? e.replace : []).filter(_).map((S) => {
      var _a3;
      const T = rt(S);
      return [
        (_a3 = T.name) == null ? void 0 : _a3.toLowerCase(),
        T.expression
      ];
    }).filter((S) => !!S[0])), $ = s ? /* @__PURE__ */ new Map() : Ey(n, t);
    return m.flatMap((S) => S.columns.filter((T) => !$y(y, T.name, S, r)).filter((T) => {
      var _a3;
      return !((_a3 = $.get(S.name.toLowerCase())) == null ? void 0 : _a3.has(T.name.toLowerCase()));
    }).map((T, C) => {
      const k = (a == null ? void 0 : a.visibleColumnNames[C]) ?? T.name, D = L.get(k.toLowerCase()) ?? L.get(T.name.toLowerCase());
      return {
        expression: D ?? {
          column: {
            name: {
              name: T.name
            },
            table: {
              name: S.name
            }
          }
        },
        name: w.get(k.toLowerCase()) ?? w.get(T.name.toLowerCase()) ?? k,
        source: D ? "replace" : Ct(S, T.name),
        schema: t,
        tableAliases: r
      };
    }));
  }
  function Ny(e) {
    const t = /* @__PURE__ */ new Set();
    return e.filter((n) => {
      var _a2;
      const r = `${((_a2 = n.schema) == null ? void 0 : _a2.toLowerCase()) ?? ""}.${n.name.toLowerCase()}`;
      return t.has(r) ? false : (t.add(r), true);
    });
  }
  function $y(e, t, n, r) {
    var _a2;
    const s = t.toLowerCase();
    if (e.has(s)) return true;
    const a = n.name.toLowerCase(), o = (_a2 = n.schema) == null ? void 0 : _a2.toLowerCase();
    if (e.has(`${a}.${s}`) || o && e.has(`${o}.${a}.${s}`)) return true;
    for (const [c, u] of r) if (u.tableName.toLowerCase() === a && !(o && u.schemaName && u.schemaName.toLowerCase() !== o) && e.has(`${c}.${s}`)) return true;
    return false;
  }
  function Ey(e, t) {
    const n = /* @__PURE__ */ new Map();
    if (!e || !Array.isArray(e.joins)) return n;
    for (const r of e.joins) {
      if (!_(r) || !_(r.this)) continue;
      const s = Le(r.this);
      if (!s) continue;
      const a = Array.isArray(r.using) ? r.using.map(h).filter((u) => !!u) : [], o = r.kind === "Natural" ? Ry(e, r.this, t) : [], c = [
        ...a,
        ...o
      ].map((u) => u.toLowerCase());
      c.length !== 0 && n.set(s.toLowerCase(), new Set(c));
    }
    return n;
  }
  function Ry(e, t, n) {
    var _a2;
    const r = pn({
      ...e,
      joins: []
    }).map(Le).filter((o) => !!o), s = Le(t);
    if (!s) return [];
    const a = new Set(n.tables.filter((o) => r.map((c) => c.toLowerCase()).includes(o.name.toLowerCase())).flatMap((o) => o.columns.map((c) => c.name.toLowerCase())));
    return ((_a2 = n.tables.find((o) => o.name.toLowerCase() === s.toLowerCase())) == null ? void 0 : _a2.columns.map((o) => o.name).filter((o) => a.has(o.toLowerCase()))) ?? [];
  }
  function Le(e) {
    return Hs(e);
  }
  function Js(e) {
    const t = /* @__PURE__ */ new Map();
    for (const n of pn(e)) Fy(t, n);
    return t;
  }
  function pn(e) {
    const t = _(e == null ? void 0 : e.from) && Array.isArray(e.from.expressions) ? e.from.expressions : [], n = _(e == null ? void 0 : e.from_clause) && Array.isArray(e.from_clause.expressions) ? e.from_clause.expressions : [], r = Array.isArray(e == null ? void 0 : e.joins) ? e.joins : [], s = Array.isArray(e == null ? void 0 : e.from_joins) ? e.from_joins : [], a = Array.isArray(e == null ? void 0 : e.using) ? e.using : [], o = Array.isArray(e == null ? void 0 : e.lateral_views) ? e.lateral_views : [], c = r.some((l) => _(l) && [
      "Right",
      "Full"
    ].includes(String(l.kind ?? ""))), u = [
      ...t,
      ...n
    ].filter(_).map((l) => c ? {
      ...l,
      nullableRelation: true
    } : l);
    _(e == null ? void 0 : e.table) && (u.unshift({
      table: e.table,
      ..._(e.alias) ? {
        alias: e.alias
      } : {}
    }), u.unshift({
      table: e.table,
      alias: {
        name: "inserted"
      }
    }), u.unshift({
      table: e.table,
      alias: {
        name: "deleted"
      }
    }), u.unshift({
      table: e.table,
      alias: {
        name: "excluded"
      }
    }), u.unshift({
      table: e.table,
      alias: {
        name: "old"
      }
    }), u.unshift({
      table: e.table,
      alias: {
        name: "new"
      }
    }));
    for (const l of r) if (_(l) && _(l.this)) {
      const m = [
        "Left",
        "Full"
      ].includes(String(l.kind ?? ""));
      u.push(m ? {
        ...l.this,
        nullableRelation: true
      } : l.this);
    }
    for (const l of s) _(l) && _(l.this) && u.push(l.this);
    for (const l of a) _(l) && u.push({
      table: l
    });
    for (const l of o) _(l) && u.push({
      lateral: {
        alias: l.table_alias,
        column_aliases: l.column_aliases
      }
    });
    return u;
  }
  function Fy(e, t) {
    if (!t) return;
    const n = _(t.table) ? t.table : void 0, r = _(t.subquery) ? t.subquery : void 0, s = _(t.lateral) ? t.lateral : void 0, a = _(t.pivot) ? t.pivot : void 0, o = _(t.unpivot) ? t.unpivot : void 0, c = _(t.match_recognize) ? t.match_recognize : void 0, u = _(t.open_j_s_o_n) ? t.open_j_s_o_n : void 0, l = _(t.j_s_o_n_table) ? t.j_s_o_n_table : void 0, m = _(t.x_m_l_table) ? t.x_m_l_table : void 0, y = _(t.function) ? t.function : void 0, w = _(t.unnest) ? t.unnest : void 0, L = Ws(t), $ = _(t == null ? void 0 : t.alias) && _(t.alias.this) ? t.alias : void 0, S = Hs(t);
    if (!S) return;
    const T = n ? h(n.schema) : void 0, C = n ? Ne(n) : r ? Ne(r) : s ? Ne(s) : a ? Ne(a) : o ? Ne(o) : c ? Ne(c) : u || l || m || L || y || w ? Vt() : $ ? Ne($) : Vt(), k = {
      tableName: S,
      ...T ? {
        schemaName: T
      } : {},
      ...(t == null ? void 0 : t.nullableRelation) === true ? {
        nullable: true
      } : {},
      ...C
    };
    e.set(S.toLowerCase(), k), T && e.set(`${T}.${S}`.toLowerCase(), k);
    const K = h($ ? $.alias : t == null ? void 0 : t.alias) ?? (n ? h(n.alias) : r ? h(r.alias) : s ? h(s.alias) : a ? h(a.alias) : o ? h(o.alias) : c ? h(c.alias) : void 0);
    K && e.set(K.toLowerCase(), k);
  }
  function Hs(e) {
    const t = _(e.table) ? e.table : void 0;
    if (t) return h(t.name);
    const n = _(e.subquery) ? e.subquery : void 0;
    if (n) return h(n.alias);
    const r = _(e.lateral) ? e.lateral : void 0;
    if (r) return h(r.alias);
    const s = _(e.pivot) ? e.pivot : void 0;
    if (s) return h(s.alias) ?? Le(_(s.this) ? s.this : {});
    const a = _(e.unpivot) ? e.unpivot : void 0;
    if (a) return h(a.alias) ?? Le(_(a.this) ? a.this : {});
    const o = _(e.match_recognize) ? e.match_recognize : void 0;
    if (o) return h(o.alias) ?? Le(_(o.this) ? o.this : {});
    if (_(e.open_j_s_o_n)) return "openjson";
    if (_(e.j_s_o_n_table)) return "json_table";
    if (_(e.x_m_l_table)) return "xmltable";
    const c = Ws(e);
    if (c) return c;
    const u = _(e.function) ? e.function : void 0;
    if (u) return String(u.name ?? "").toLowerCase();
    if (_(e.unnest)) return h(e.unnest.alias) ?? "unnest";
    const l = _(e.alias) && _(e.alias.this) ? e.alias : void 0;
    return l ? h(l.alias) : void 0;
  }
  function Ws(e) {
    const n = (_(e.tuple) && Array.isArray(e.tuple.expressions) ? e.tuple.expressions : []).find((r) => _(r) && _(r.table_alias));
    return _(n) && _(n.table_alias) ? h(n.table_alias.this) : void 0;
  }
  function Ne(e) {
    const t = Array.isArray(e.column_aliases) ? e.column_aliases.map(h).filter((r) => !!r) : [];
    if (t.length === 0) return Vt();
    const n = [];
    for (const [r, s] of t.entries()) n[r] = s;
    return {
      visibleColumnNames: n
    };
  }
  function Vt() {
    return {
      visibleColumnNames: []
    };
  }
  function gn(e) {
    return e.schema ? `${e.schema}.${e.name}` : e.name;
  }
  function Ct(e, t) {
    return `${gn(e)}.${t}`;
  }
  function je(e, t) {
    const n = d(e, "alias");
    if (_(n)) return h(n.alias) ?? `column_${t || 1}`;
    const r = d(e, "dot");
    if (_(r)) return h(r.field) ?? `column_${t || 1}`;
    const s = d(e, "column");
    if (_(s)) return h(s.name) ?? `column_${t || 1}`;
    const a = My(e);
    return a.length === 1 ? M(a[0]) : J(e, "star") ? "*" : `column_${t || 1}`;
  }
  function et(e) {
    return e.find(_);
  }
  function d(e, t) {
    return _(e) ? e[t] : void 0;
  }
  function J(e, t) {
    return _(e) && t in e;
  }
  function h(e) {
    if (e) {
      if (typeof e == "string") return M(e);
      if (_(e) && typeof e.name == "string") return M(e.name);
      if (_(e) && _(e.column)) return h(e.column.name);
      if (_(e) && _(e.var) && typeof e.var.this == "string") return M(e.var.this);
      if (_(e) && _(e.identifier)) return h(e.identifier);
    }
  }
  function My(e) {
    try {
      return Yt.getColumnNames(e).map(String);
    } catch {
      return [];
    }
  }
  function _(e) {
    return typeof e == "object" && e !== null;
  }
  function Ys(e) {
    return {
      tables: e.tables.map((t) => ({
        ...t,
        columns: t.columns.map((n) => ({
          ...n,
          type: n.type
        }))
      }))
    };
  }
  function Xn(e, t) {
    return {
      code: e.code,
      message: e.message ?? String(e),
      severity: t ?? e.severity,
      line: e.line,
      column: e.column
    };
  }
  function Oy(e) {
    return [
      ...new Set(e)
    ];
  }
  function Y(e) {
    if (!e || typeof e != "object") return;
    const t = e;
    if (t.data_type === "nullable" || t.data_type === "low_cardinality") return Y(t.inner) ?? Y(t.value) ?? "unknown";
    if (t.data_type === "struct" && Array.isArray(t.fields)) return `struct<${t.fields.flatMap((s) => {
      if (!s || typeof s != "object") return [];
      const a = s, o = h(a.name), c = Y(a.data_type) ?? "unknown";
      return o ? [
        `${o} ${c}`
      ] : [];
    }).join(", ")}>`;
    if (t.data_type === "array") return `array<${Y(t.element_type) ?? "unknown"}>`;
    if (t.data_type === "map") return `map<${Y(t.key_type) ?? "unknown"}, ${Y(t.value_type) ?? "unknown"}>`;
    const n = t.data_type === "custom" && typeof t.name == "string" ? t.name : t.data_type ?? t.type ?? t.name;
    return typeof n == "string" ? ie(n) : void 0;
  }
  function ie(e) {
    const t = e.trim().toLowerCase().replace(/\s+/g, " "), n = Dy(t);
    if (n) return n;
    const r = t.replace(/\s*\([^)]*\)/g, ""), s = r.replace(/\s+/g, "");
    return s === "serial" || s === "serial4" ? "integer" : s === "bigserial" || s === "serial8" ? "bigint" : s === "smallserial" || s === "serial2" || [
      "int",
      "int2",
      "int4",
      "int16",
      "int32",
      "integer",
      "smallint",
      "tinyint",
      "small_int",
      "tiny_int",
      "uint8",
      "uint16",
      "uint32"
    ].includes(s) ? "integer" : [
      "int8",
      "int64",
      "bigint",
      "big_int",
      "uint64"
    ].includes(s) ? "bigint" : [
      "decimal",
      "dec",
      "numeric",
      "number"
    ].includes(s) || [
      "float",
      "float4",
      "float8",
      "double",
      "doubleprecision",
      "real"
    ].includes(s) ? "decimal" : [
      "bool",
      "boolean",
      "bit"
    ].includes(s) ? "boolean" : [
      "char",
      "nchar",
      "varchar",
      "varchar2",
      "var_char",
      "nvarchar",
      "nvarchar2",
      "nvar_char",
      "character",
      "string",
      "text",
      "clob"
    ].includes(s) ? "text" : [
      "binary",
      "varbinary",
      "bytea",
      "bytes",
      "blob"
    ].includes(s) ? "bytes" : s === "json_b" ? "jsonb" : s === "datetime2" ? "datetime" : s === "timestampntz" || s === "timestampltz" || s === "timestamptz" || s.startsWith("timestamp") ? "timestamp" : s === "array" ? "array<variant>" : s === "uniqueidentifier" ? "uuid" : [
      "variant",
      "object",
      "json",
      "jsonb",
      "date",
      "time",
      "datetime",
      "interval",
      "uuid",
      "geography",
      "geometry"
    ].includes(s) ? s : r;
  }
  function Dy(e) {
    const t = /^([a-z_][\w\s]*)\s*\(([\s\S]*)\)$/i.exec(e.trim());
    if (!t) return;
    const n = t[1].replace(/\s+/g, "").toLowerCase(), r = se(t[2], ",");
    if (n === "nullable" || n === "lowcardinality") return r[0] ? ie(r[0]) : "unknown";
    if (n === "array" || n === "list") return `array<${r[0] ? ie(r[0]) : "unknown"}>`;
    if (n === "map" && r.length >= 2) return `map<${ie(r[0])}, ${ie(r[1])}>`;
    if (n === "tuple" || n === "row") return `struct<${r.map((a, o) => {
      const c = er(a, o);
      return `${c.name} ${c.type}`;
    }).join(", ")}>`;
    if (n === "nested") return `array<struct<${r.map((a, o) => {
      const c = er(a, o);
      return `${c.name} ${c.type}`;
    }).join(", ")}>>`;
  }
  function er(e, t) {
    const n = e.trim(), r = /^("[^"]+"|`[^`]+`|\[[^\]]+\]|[a-z_][\w$]*)\s+([\s\S]+)$/i.exec(n);
    return r ? {
      name: M(r[1]),
      type: ie(r[2])
    } : {
      name: `field_${t + 1}`,
      type: ie(n)
    };
  }
  function tt() {
    return {
      prepared: /* @__PURE__ */ new Map(),
      functionReturnTypes: /* @__PURE__ */ new Map(),
      tableFunctions: /* @__PURE__ */ new Map(),
      procedureResultSets: /* @__PURE__ */ new Map(),
      typeAliases: /* @__PURE__ */ new Map()
    };
  }
  function zy(e) {
    const t = tt();
    for (const n of e.functions ?? []) for (const r of By(n)) t.functionReturnTypes.set(r, n.returnType);
    for (const n of e.procedures ?? []) for (const r of Py(n)) t.procedureResultSets.set(r, p(n.columns.map((s) => [
      s.name,
      s.type
    ])));
    return t;
  }
  function By(e) {
    var _a2;
    const t = e.name.toLowerCase(), n = (_a2 = e.schema) == null ? void 0 : _a2.toLowerCase();
    return n ? [
      `${n}.${t}`,
      t
    ] : [
      t
    ];
  }
  function Py(e) {
    var _a2;
    const t = e.name.toLowerCase(), n = (_a2 = e.schema) == null ? void 0 : _a2.toLowerCase();
    return n ? [
      `${n}.${t}`,
      t
    ] : [
      t
    ];
  }
  Uy = async function(e) {
    const t = e.schemaSql.trim() ? {
      tables: Dr(e.schemaSql, e.dialect)
    } : void 0;
    return Of({
      sql: e.sql,
      dialect: e.dialect,
      binds: e.binds.trim() || void 0,
      jdbc: e.jdbc || void 0,
      schema: t
    });
  };
})();
export {
  __tla,
  Uy as analyzeSql,
  jm as getSupportedDialects
};
