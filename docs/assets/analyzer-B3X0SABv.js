let Qy, Nm;
let __tla = (async () => {
  function ea(e) {
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
          const [i, ...c] = a.split("="), _ = i.trim(), l = c.join("=").trim();
          if (!_ || !l) throw new Error(`Invalid named bind "${a}". Expected name=type.`);
          if (s.has(_)) throw new Error(`Duplicate bind name "${_}".`);
          return s.add(_), {
            name: _,
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
  const ta = new URL("" + new URL("polyglot_sql-C3wwNi5b.wasm", import.meta.url).href, import.meta.url).href, na = async (e = {}, t) => {
    let n;
    if (t.startsWith("data:")) {
      const r = t.replace(/^data:.*?base64,/, "");
      let s;
      if (typeof Buffer == "function" && typeof Buffer.from == "function") s = Buffer.from(r, "base64");
      else if (typeof atob == "function") {
        const a = atob(r);
        s = new Uint8Array(a.length);
        for (let i = 0; i < a.length; i++) s[i] = a.charCodeAt(i);
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
      return this.__wbg_ptr = 0, Cn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmassignmentarray_free(t, 0);
    }
    len() {
      return o.wasmassignmentarray_len(this.__wbg_ptr) >>> 0;
    }
    constructor() {
      const t = o.wasmassignmentarray_new();
      return this.__wbg_ptr = t >>> 0, Cn.register(this, this.__wbg_ptr, this), this;
    }
    push(t, n) {
      const r = v(t, o.__wbindgen_export, o.__wbindgen_export2), s = x;
      j(n, A), o.wasmassignmentarray_push(this.__wbg_ptr, r, s, n.__wbg_ptr);
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
      o.__wbg_wasmcasebuilder_free(t, 0);
    }
    build_expr() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmcasebuilder_build_expr(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return A.__wrap(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    else_(t) {
      j(t, A), o.wasmcasebuilder_else_(this.__wbg_ptr, t.__wbg_ptr);
    }
    constructor() {
      const t = o.wasmcasebuilder_new();
      return this.__wbg_ptr = t >>> 0, St.register(this, this.__wbg_ptr, this), this;
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmcasebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    when(t, n) {
      j(t, A), j(n, A), o.wasmcasebuilder_when(this.__wbg_ptr, t.__wbg_ptr, n.__wbg_ptr);
    }
  }
  Symbol.dispose && (Me.prototype[Symbol.dispose] = Me.prototype.free);
  class Dt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, An.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmdeletebuilder_free(t, 0);
    }
    build() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmdeletebuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    constructor(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasmdeletebuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, An.register(this, this.__wbg_ptr, this), this;
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmdeletebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    where_expr(t) {
      j(t, A), o.wasmdeletebuilder_where_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (Dt.prototype[Symbol.dispose] = Dt.prototype.free);
  class A {
    static __wrap(t) {
      t = t >>> 0;
      const n = Object.create(A.prototype);
      return n.__wbg_ptr = t, Sn.register(n, n.__wbg_ptr, n), n;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Sn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmexpr_free(t, 0);
    }
    add(t) {
      j(t, A);
      const n = o.wasmexpr_add(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    alias(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasmexpr_alias(this.__wbg_ptr, n, r);
      return A.__wrap(s);
    }
    and(t) {
      j(t, A);
      const n = o.wasmexpr_and(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    asc() {
      const t = o.wasmexpr_asc(this.__wbg_ptr);
      return A.__wrap(t);
    }
    between(t, n) {
      j(t, A), j(n, A);
      const r = o.wasmexpr_between(this.__wbg_ptr, t.__wbg_ptr, n.__wbg_ptr);
      return A.__wrap(r);
    }
    cast(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasmexpr_cast(this.__wbg_ptr, n, r);
      return A.__wrap(s);
    }
    desc() {
      const t = o.wasmexpr_desc(this.__wbg_ptr);
      return A.__wrap(t);
    }
    div(t) {
      j(t, A);
      const n = o.wasmexpr_div(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    eq(t) {
      j(t, A);
      const n = o.wasmexpr_eq(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    gt(t) {
      j(t, A);
      const n = o.wasmexpr_gt(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    gte(t) {
      j(t, A);
      const n = o.wasmexpr_gte(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    ilike(t) {
      j(t, A);
      const n = o.wasmexpr_ilike(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    in_list(t) {
      j(t, re);
      const n = o.wasmexpr_in_list(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    is_not_null() {
      const t = o.wasmexpr_is_not_null(this.__wbg_ptr);
      return A.__wrap(t);
    }
    is_null() {
      const t = o.wasmexpr_is_null(this.__wbg_ptr);
      return A.__wrap(t);
    }
    like(t) {
      j(t, A);
      const n = o.wasmexpr_like(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    lt(t) {
      j(t, A);
      const n = o.wasmexpr_lt(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    lte(t) {
      j(t, A);
      const n = o.wasmexpr_lte(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    mul(t) {
      j(t, A);
      const n = o.wasmexpr_mul(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    neq(t) {
      j(t, A);
      const n = o.wasmexpr_neq(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    not() {
      const t = o.wasmexpr_not(this.__wbg_ptr);
      return A.__wrap(t);
    }
    not_in(t) {
      j(t, re);
      const n = o.wasmexpr_not_in(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    or(t) {
      j(t, A);
      const n = o.wasmexpr_or(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    rlike(t) {
      j(t, A);
      const n = o.wasmexpr_rlike(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    sub(t) {
      j(t, A);
      const n = o.wasmexpr_sub(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
    to_json() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmexpr_to_json(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmexpr_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    xor(t) {
      j(t, A);
      const n = o.wasmexpr_xor(this.__wbg_ptr, t.__wbg_ptr);
      return A.__wrap(n);
    }
  }
  Symbol.dispose && (A.prototype[Symbol.dispose] = A.prototype.free);
  class re {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, kn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmexprarray_free(t, 0);
    }
    len() {
      return o.wasmexprarray_len(this.__wbg_ptr) >>> 0;
    }
    constructor() {
      const t = o.wasmassignmentarray_new();
      return this.__wbg_ptr = t >>> 0, kn.register(this, this.__wbg_ptr, this), this;
    }
    push(t) {
      j(t, A), o.wasmexprarray_push(this.__wbg_ptr, t.__wbg_ptr);
    }
    push_col(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmexprarray_push_col(this.__wbg_ptr, n, r);
    }
    push_float(t) {
      o.wasmexprarray_push_float(this.__wbg_ptr, t);
    }
    push_int(t) {
      o.wasmexprarray_push_int(this.__wbg_ptr, t);
    }
    push_star() {
      o.wasmexprarray_push_star(this.__wbg_ptr);
    }
    push_str(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmexprarray_push_str(this.__wbg_ptr, n, r);
    }
  }
  Symbol.dispose && (re.prototype[Symbol.dispose] = re.prototype.free);
  class Bt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ln.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasminsertbuilder_free(t, 0);
    }
    build() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasminsertbuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    columns(t) {
      const n = Yt(t, o.__wbindgen_export), r = x;
      o.wasminsertbuilder_columns(this.__wbg_ptr, n, r);
    }
    constructor(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasminsertbuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, Ln.register(this, this.__wbg_ptr, this), this;
    }
    query(t) {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        j(t, de), o.wasminsertbuilder_query(s, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(s + 0, true), r = b().getInt32(s + 4, true);
        if (r) throw z(n);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasminsertbuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    values(t) {
      j(t, re), o.wasminsertbuilder_values(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (Bt.prototype[Symbol.dispose] = Bt.prototype.free);
  class Pt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Tn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmmergebuilder_free(t, 0);
    }
    build() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmmergebuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    constructor(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasmmergebuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, Tn.register(this, this.__wbg_ptr, this), this;
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmmergebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    using(t, n) {
      const r = v(t, o.__wbindgen_export, o.__wbindgen_export2), s = x;
      j(n, A), o.wasmmergebuilder_using(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    when_matched_delete() {
      o.wasmmergebuilder_when_matched_delete(this.__wbg_ptr);
    }
    when_matched_update(t) {
      j(t, lt), o.wasmmergebuilder_when_matched_update(this.__wbg_ptr, t.__wbg_ptr);
    }
    when_not_matched_insert(t, n) {
      const r = Yt(t, o.__wbindgen_export), s = x;
      j(n, re), o.wasmmergebuilder_when_not_matched_insert(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
  }
  Symbol.dispose && (Pt.prototype[Symbol.dispose] = Pt.prototype.free);
  class de {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, jn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmselectbuilder_free(t, 0);
    }
    build() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmselectbuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    cross_join(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmselectbuilder_cross_join(this.__wbg_ptr, n, r);
    }
    ctas(t) {
      try {
        const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(t, o.__wbindgen_export, o.__wbindgen_export2), c = x;
        o.wasmselectbuilder_ctas(a, this.__wbg_ptr, i, c);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw z(r);
        return z(n);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    ctas_sql(t, n) {
      let r, s;
      try {
        const y = o.__wbindgen_add_to_stack_pointer(-16), w = v(t, o.__wbindgen_export, o.__wbindgen_export2), S = x, N = v(n, o.__wbindgen_export, o.__wbindgen_export2), k = x;
        o.wasmselectbuilder_ctas_sql(y, this.__wbg_ptr, w, S, N, k);
        var a = b().getInt32(y + 0, true), i = b().getInt32(y + 4, true), c = b().getInt32(y + 8, true), _ = b().getInt32(y + 12, true), l = a, m = i;
        if (_) throw l = 0, m = 0, z(c);
        return r = l, s = m, F(l, m);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
      }
    }
    distinct() {
      o.wasmselectbuilder_distinct(this.__wbg_ptr);
    }
    except_(t) {
      try {
        const a = o.__wbindgen_add_to_stack_pointer(-16);
        j(t, de), o.wasmselectbuilder_except_(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw z(r);
        return ve.__wrap(n);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    for_update() {
      o.wasmselectbuilder_for_update(this.__wbg_ptr);
    }
    from(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmselectbuilder_from(this.__wbg_ptr, n, r);
    }
    from_expr(t) {
      j(t, A), o.wasmselectbuilder_from_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
    group_by_cols(t) {
      j(t, re), o.wasmselectbuilder_group_by_cols(this.__wbg_ptr, t.__wbg_ptr);
    }
    having(t) {
      j(t, A), o.wasmselectbuilder_having(this.__wbg_ptr, t.__wbg_ptr);
    }
    hint(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmselectbuilder_hint(this.__wbg_ptr, n, r);
    }
    intersect(t) {
      try {
        const a = o.__wbindgen_add_to_stack_pointer(-16);
        j(t, de), o.wasmselectbuilder_intersect(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw z(r);
        return ve.__wrap(n);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    join(t, n) {
      const r = v(t, o.__wbindgen_export, o.__wbindgen_export2), s = x;
      j(n, A), o.wasmselectbuilder_join(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    lateral_view(t, n, r) {
      j(t, A);
      const s = v(n, o.__wbindgen_export, o.__wbindgen_export2), a = x, i = Yt(r, o.__wbindgen_export), c = x;
      o.wasmselectbuilder_lateral_view(this.__wbg_ptr, t.__wbg_ptr, s, a, i, c);
    }
    left_join(t, n) {
      const r = v(t, o.__wbindgen_export, o.__wbindgen_export2), s = x;
      j(n, A), o.wasmselectbuilder_left_join(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    limit(t) {
      o.wasmselectbuilder_limit(this.__wbg_ptr, t);
    }
    constructor() {
      const t = o.wasmselectbuilder_new();
      return this.__wbg_ptr = t >>> 0, jn.register(this, this.__wbg_ptr, this), this;
    }
    offset(t) {
      o.wasmselectbuilder_offset(this.__wbg_ptr, t);
    }
    order_by_exprs(t) {
      j(t, re), o.wasmselectbuilder_order_by_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    qualify(t) {
      j(t, A), o.wasmselectbuilder_qualify(this.__wbg_ptr, t.__wbg_ptr);
    }
    right_join(t, n) {
      const r = v(t, o.__wbindgen_export, o.__wbindgen_export2), s = x;
      j(n, A), o.wasmselectbuilder_right_join(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    select_col(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmselectbuilder_select_col(this.__wbg_ptr, n, r);
    }
    select_expr(t) {
      j(t, A), o.wasmselectbuilder_select_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
    select_exprs(t) {
      j(t, re), o.wasmselectbuilder_select_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    select_star() {
      o.wasmselectbuilder_select_star(this.__wbg_ptr);
    }
    sort_by_exprs(t) {
      j(t, re), o.wasmselectbuilder_sort_by_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmselectbuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    union(t) {
      try {
        const a = o.__wbindgen_add_to_stack_pointer(-16);
        j(t, de), o.wasmselectbuilder_union(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw z(r);
        return ve.__wrap(n);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    union_all(t) {
      try {
        const a = o.__wbindgen_add_to_stack_pointer(-16);
        j(t, de), o.wasmselectbuilder_union_all(a, this.__wbg_ptr, t.__wbg_ptr);
        var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
        if (s) throw z(r);
        return ve.__wrap(n);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    where_expr(t) {
      j(t, A), o.wasmselectbuilder_where_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
    where_sql(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmselectbuilder_where_sql(this.__wbg_ptr, n, r);
    }
    window(t, n) {
      try {
        const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(t, o.__wbindgen_export, o.__wbindgen_export2), c = x;
        j(n, mt), o.wasmselectbuilder_window(a, this.__wbg_ptr, i, c, n.__wbg_ptr);
        var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
        if (s) throw z(r);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
  }
  Symbol.dispose && (de.prototype[Symbol.dispose] = de.prototype.free);
  class ve {
    static __wrap(t) {
      t = t >>> 0;
      const n = Object.create(ve.prototype);
      return n.__wbg_ptr = t, qn.register(n, n.__wbg_ptr, n), n;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, qn.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmsetopbuilder_free(t, 0);
    }
    build() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmsetopbuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    limit(t) {
      o.wasmsetopbuilder_limit(this.__wbg_ptr, t);
    }
    offset(t) {
      o.wasmsetopbuilder_offset(this.__wbg_ptr, t);
    }
    order_by_exprs(t) {
      j(t, re), o.wasmsetopbuilder_order_by_exprs(this.__wbg_ptr, t.__wbg_ptr);
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmsetopbuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
  }
  Symbol.dispose && (ve.prototype[Symbol.dispose] = ve.prototype.free);
  class Ut {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, $n.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmupdatebuilder_free(t, 0);
    }
    build() {
      try {
        const s = o.__wbindgen_add_to_stack_pointer(-16);
        o.wasmupdatebuilder_build(s, this.__wbg_ptr);
        var t = b().getInt32(s + 0, true), n = b().getInt32(s + 4, true), r = b().getInt32(s + 8, true);
        if (r) throw z(n);
        return z(t);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16);
      }
    }
    from(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x;
      o.wasmupdatebuilder_from(this.__wbg_ptr, n, r);
    }
    constructor(t) {
      const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasmupdatebuilder_new(n, r);
      return this.__wbg_ptr = s >>> 0, $n.register(this, this.__wbg_ptr, this), this;
    }
    set(t, n) {
      const r = v(t, o.__wbindgen_export, o.__wbindgen_export2), s = x;
      j(n, A), o.wasmupdatebuilder_set(this.__wbg_ptr, r, s, n.__wbg_ptr);
    }
    to_sql(t) {
      let n, r;
      try {
        const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x;
        o.wasmupdatebuilder_to_sql(m, this.__wbg_ptr, y, w);
        var s = b().getInt32(m + 0, true), a = b().getInt32(m + 4, true), i = b().getInt32(m + 8, true), c = b().getInt32(m + 12, true), _ = s, l = a;
        if (c) throw _ = 0, l = 0, z(i);
        return n = _, r = l, F(_, l);
      } finally {
        o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
      }
    }
    where_expr(t) {
      j(t, A), o.wasmupdatebuilder_where_expr(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (Ut.prototype[Symbol.dispose] = Ut.prototype.free);
  class mt {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, In.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      o.__wbg_wasmwindowdefbuilder_free(t, 0);
    }
    constructor() {
      const t = o.wasmwindowdefbuilder_new();
      return this.__wbg_ptr = t >>> 0, In.register(this, this.__wbg_ptr, this), this;
    }
    order_by(t) {
      j(t, re), o.wasmwindowdefbuilder_order_by(this.__wbg_ptr, t.__wbg_ptr);
    }
    partition_by(t) {
      j(t, re), o.wasmwindowdefbuilder_partition_by(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  Symbol.dispose && (mt.prototype[Symbol.dispose] = mt.prototype.free);
  function ra(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(n, o.__wbindgen_export, o.__wbindgen_export2), S = x;
      o.annotate_types(c, _, l, m, y, w, S);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function sa(e, t, n) {
    const r = v(e, o.__wbindgen_export, o.__wbindgen_export2), s = x, a = v(t, o.__wbindgen_export, o.__wbindgen_export2), i = x, c = v(n, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = o.annotate_types_value(r, s, a, i, c, _);
    return z(l);
  }
  function sr(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x;
      o.ast_add_where(c, _, l, m, y, n);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function ar(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_aggregate_functions(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function ir(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_column_names(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function or(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_functions(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function cr(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_literals(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function ur(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_subqueries(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function _r(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_table_names(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function lr(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_get_window_functions(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function mr(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_node_count(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function dr(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.ast_qualify_columns(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function fr(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.ast_qualify_tables(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function pr(e) {
    let t, n;
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16), i = v(e, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.ast_remove_where(a, i, c);
      var r = b().getInt32(a + 0, true), s = b().getInt32(a + 4, true);
      return t = r, n = s, F(r, s);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(t, n, 1);
    }
  }
  function gr(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.ast_rename_columns(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function br(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.ast_rename_tables(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function yr(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(n, o.__wbindgen_export, o.__wbindgen_export2), S = x;
      o.ast_rename_tables_with_options(c, _, l, m, y, w, S);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function wr(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x;
      o.ast_set_distinct(i, c, _, t);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function hr(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x;
      o.ast_set_limit(i, c, _, t);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function aa(e, t, n, r, s, a) {
    let i, c;
    try {
      const m = o.__wbindgen_add_to_stack_pointer(-16), y = v(e, o.__wbindgen_export, o.__wbindgen_export2), w = x, S = v(t, o.__wbindgen_export, o.__wbindgen_export2), N = x, k = v(n, o.__wbindgen_export, o.__wbindgen_export2), L = x;
      o.diff_sql(m, y, w, S, N, k, L, r, s, a);
      var _ = b().getInt32(m + 0, true), l = b().getInt32(m + 4, true);
      return i = _, c = l, F(_, l);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(i, c, 1);
    }
  }
  function ia(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.format_sql(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function oa(e, t) {
    const n = v(e, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = v(t, o.__wbindgen_export, o.__wbindgen_export2), a = x, i = o.format_sql_value(n, r, s, a);
    return z(i);
  }
  function ca(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(n, o.__wbindgen_export, o.__wbindgen_export2), S = x;
      o.format_sql_with_options(c, _, l, m, y, w, S);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function ua(e, t, n) {
    const r = v(e, o.__wbindgen_export, o.__wbindgen_export2), s = x, a = v(t, o.__wbindgen_export, o.__wbindgen_export2), i = x, c = o.format_sql_with_options_value(r, s, a, i, U(n));
    return z(c);
  }
  function _a(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.generate(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function la(e, t) {
    const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.generate_value(U(e), n, r);
    return z(s);
  }
  function ma() {
    let e, t;
    try {
      const s = o.__wbindgen_add_to_stack_pointer(-16);
      o.get_dialects(s);
      var n = b().getInt32(s + 0, true), r = b().getInt32(s + 4, true);
      return e = n, t = r, F(n, r);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(e, t, 1);
    }
  }
  function da() {
    const e = o.get_dialects_value();
    return z(e);
  }
  function fa(e, t, n, r) {
    let s, a;
    try {
      const _ = o.__wbindgen_add_to_stack_pointer(-16), l = v(e, o.__wbindgen_export, o.__wbindgen_export2), m = x, y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x, S = v(n, o.__wbindgen_export, o.__wbindgen_export2), N = x;
      o.lineage_sql(_, l, m, y, w, S, N, r);
      var i = b().getInt32(_ + 0, true), c = b().getInt32(_ + 4, true);
      return s = i, a = c, F(i, c);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(s, a, 1);
    }
  }
  function pa(e, t, n, r, s) {
    let a, i;
    try {
      const l = o.__wbindgen_add_to_stack_pointer(-16), m = v(e, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(t, o.__wbindgen_export, o.__wbindgen_export2), S = x, N = v(n, o.__wbindgen_export, o.__wbindgen_export2), k = x, L = v(r, o.__wbindgen_export, o.__wbindgen_export2), C = x;
      o.lineage_sql_with_schema(l, m, y, w, S, N, k, L, C, s);
      var c = b().getInt32(l + 0, true), _ = b().getInt32(l + 4, true);
      return a = c, i = _, F(c, _);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(a, i, 1);
    }
  }
  function ga(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.openlineage_column_lineage(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function ba(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.openlineage_job_event(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function ya(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.openlineage_run_event(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function wa(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.parse(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function ha(e, t) {
    const n = v(e, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = v(t, o.__wbindgen_export, o.__wbindgen_export2), a = x, i = o.parse_value(n, r, s, a);
    return z(i);
  }
  function xa(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.plan(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function va(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(n, o.__wbindgen_export, o.__wbindgen_export2), S = x;
      o.source_tables(c, _, l, m, y, w, S);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function Ca(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.tokenize(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function Aa(e, t) {
    const n = v(e, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = v(t, o.__wbindgen_export, o.__wbindgen_export2), a = x, i = o.tokenize_value(n, r, s, a);
    return z(i);
  }
  function Sa(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(n, o.__wbindgen_export, o.__wbindgen_export2), S = x;
      o.transpile(c, _, l, m, y, w, S);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function ka(e, t, n) {
    const r = v(e, o.__wbindgen_export, o.__wbindgen_export2), s = x, a = v(t, o.__wbindgen_export, o.__wbindgen_export2), i = x, c = v(n, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = o.transpile_value(r, s, a, i, c, _);
    return z(l);
  }
  function La(e, t) {
    let n, r;
    try {
      const i = o.__wbindgen_add_to_stack_pointer(-16), c = v(e, o.__wbindgen_export, o.__wbindgen_export2), _ = x, l = v(t, o.__wbindgen_export, o.__wbindgen_export2), m = x;
      o.validate(i, c, _, l, m);
      var s = b().getInt32(i + 0, true), a = b().getInt32(i + 4, true);
      return n = s, r = a, F(s, a);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(n, r, 1);
    }
  }
  function Ta(e, t, n) {
    let r, s;
    try {
      const c = o.__wbindgen_add_to_stack_pointer(-16), _ = v(e, o.__wbindgen_export, o.__wbindgen_export2), l = x, m = v(t, o.__wbindgen_export, o.__wbindgen_export2), y = x, w = v(n, o.__wbindgen_export, o.__wbindgen_export2), S = x;
      o.validate_with_options(c, _, l, m, y, w, S);
      var a = b().getInt32(c + 0, true), i = b().getInt32(c + 4, true);
      return r = a, s = i, F(a, i);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(r, s, 1);
    }
  }
  function xr(e, t, n, r) {
    let s, a;
    try {
      const _ = o.__wbindgen_add_to_stack_pointer(-16), l = v(e, o.__wbindgen_export, o.__wbindgen_export2), m = x, y = v(t, o.__wbindgen_export, o.__wbindgen_export2), w = x, S = v(n, o.__wbindgen_export, o.__wbindgen_export2), N = x, k = v(r, o.__wbindgen_export, o.__wbindgen_export2), L = x;
      o.validate_with_schema(_, l, m, y, w, S, N, k, L);
      var i = b().getInt32(_ + 0, true), c = b().getInt32(_ + 4, true);
      return s = i, a = c, F(i, c);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(s, a, 1);
    }
  }
  function ja() {
    let e, t;
    try {
      const s = o.__wbindgen_add_to_stack_pointer(-16);
      o.version(s);
      var n = b().getInt32(s + 0, true), r = b().getInt32(s + 4, true);
      return e = n, t = r, F(n, r);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16), o.__wbindgen_export4(e, t, 1);
    }
  }
  function qa(e, t) {
    j(e, A);
    const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasm_alias(e.__wbg_ptr, n, r);
    return A.__wrap(s);
  }
  function $a(e, t) {
    j(e, A), j(t, A);
    const n = o.wasm_and(e.__wbg_ptr, t.__wbg_ptr);
    return A.__wrap(n);
  }
  function Ia(e) {
    const t = o.wasm_boolean(e);
    return A.__wrap(t);
  }
  function Na(e) {
    j(e, A);
    const t = o.wasm_case_of(e.__wbg_ptr);
    return Me.__wrap(t);
  }
  function Ea(e, t) {
    j(e, A);
    const n = v(t, o.__wbindgen_export, o.__wbindgen_export2), r = x, s = o.wasm_cast(e.__wbg_ptr, n, r);
    return A.__wrap(s);
  }
  function Ra(e) {
    const t = v(e, o.__wbindgen_export, o.__wbindgen_export2), n = x, r = o.wasm_col(t, n);
    return A.__wrap(r);
  }
  function Fa(e) {
    j(e, A);
    const t = o.wasm_count_distinct(e.__wbg_ptr);
    return A.__wrap(t);
  }
  function Ma(e, t) {
    const n = v(e, o.__wbindgen_export, o.__wbindgen_export2), r = x;
    j(t, A);
    const s = o.wasm_extract(n, r, t.__wbg_ptr);
    return A.__wrap(s);
  }
  function Oa(e, t) {
    const n = v(e, o.__wbindgen_export, o.__wbindgen_export2), r = x;
    j(t, re);
    const s = o.wasm_func(n, r, t.__wbg_ptr);
    return A.__wrap(s);
  }
  function za(e) {
    const t = o.wasm_lit(U(e));
    return A.__wrap(t);
  }
  function Da(e) {
    j(e, A);
    const t = o.wasm_not(e.__wbg_ptr);
    return A.__wrap(t);
  }
  function Ba() {
    const e = o.wasm_null();
    return A.__wrap(e);
  }
  function Pa(e, t) {
    j(e, A), j(t, A);
    const n = o.wasm_or(e.__wbg_ptr, t.__wbg_ptr);
    return A.__wrap(n);
  }
  function Ua(e) {
    const t = v(e, o.__wbindgen_export, o.__wbindgen_export2), n = x, r = o.wasm_sql_expr(t, n);
    return A.__wrap(r);
  }
  function Va() {
    const e = o.wasm_star();
    return A.__wrap(e);
  }
  function Ka(e, t) {
    try {
      const a = o.__wbindgen_add_to_stack_pointer(-16);
      j(e, de);
      const i = v(t, o.__wbindgen_export, o.__wbindgen_export2), c = x;
      o.wasm_subquery(a, e.__wbg_ptr, i, c);
      var n = b().getInt32(a + 0, true), r = b().getInt32(a + 4, true), s = b().getInt32(a + 8, true);
      if (s) throw z(r);
      return A.__wrap(n);
    } finally {
      o.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function Ha(e) {
    const t = v(e, o.__wbindgen_export, o.__wbindgen_export2), n = x, r = o.wasm_table(t, n);
    return A.__wrap(r);
  }
  function Ja(e, t) {
    const n = Error(F(e, t));
    return U(n);
  }
  function Wa(e) {
    return Number(R(e));
  }
  function Ya(e, t) {
    const n = String(R(t)), r = v(n, o.__wbindgen_export, o.__wbindgen_export2), s = x;
    b().setInt32(e + 4, s, true), b().setInt32(e + 0, r, true);
  }
  function Qa(e, t) {
    const n = R(t), r = typeof n == "bigint" ? n : void 0;
    b().setBigInt64(e + 8, Oe(r) ? BigInt(0) : r, true), b().setInt32(e + 0, !Oe(r), true);
  }
  function Ga(e) {
    const t = R(e), n = typeof t == "boolean" ? t : void 0;
    return Oe(n) ? 16777215 : n ? 1 : 0;
  }
  function Za(e, t) {
    const n = Vt(R(t)), r = v(n, o.__wbindgen_export, o.__wbindgen_export2), s = x;
    b().setInt32(e + 4, s, true), b().setInt32(e + 0, r, true);
  }
  function Xa(e, t) {
    return R(e) in R(t);
  }
  function ei(e) {
    return typeof R(e) == "bigint";
  }
  function ti(e) {
    return typeof R(e) == "function";
  }
  function ni(e) {
    return R(e) === null;
  }
  function ri(e) {
    const t = R(e);
    return typeof t == "object" && t !== null;
  }
  function si(e) {
    return typeof R(e) == "string";
  }
  function ai(e) {
    return R(e) === void 0;
  }
  function ii(e, t) {
    return R(e) === R(t);
  }
  function oi(e, t) {
    return R(e) == R(t);
  }
  function ci(e, t) {
    const n = R(t), r = typeof n == "number" ? n : void 0;
    b().setFloat64(e + 8, Oe(r) ? 0 : r, true), b().setInt32(e + 0, !Oe(r), true);
  }
  function ui(e, t) {
    const n = R(t), r = typeof n == "string" ? n : void 0;
    var s = Oe(r) ? 0 : v(r, o.__wbindgen_export, o.__wbindgen_export2), a = x;
    b().setInt32(e + 4, a, true), b().setInt32(e + 0, s, true);
  }
  function _i(e, t) {
    throw new Error(F(e, t));
  }
  function li() {
    return yt(function(e, t) {
      const n = R(e).call(R(t));
      return U(n);
    }, arguments);
  }
  function mi(e, t) {
    const n = R(e).codePointAt(t >>> 0);
    return U(n);
  }
  function di(e) {
    return R(e).done;
  }
  function fi(e) {
    const t = Object.entries(R(e));
    return U(t);
  }
  function pi(e, t) {
    let n, r;
    try {
      n = e, r = t, console.error(F(e, t));
    } finally {
      o.__wbindgen_export4(n, r, 1);
    }
  }
  function gi() {
    return yt(function(e) {
      const t = String.fromCodePoint(e >>> 0);
      return U(t);
    }, arguments);
  }
  function bi(e, t) {
    const n = R(e)[t >>> 0];
    return U(n);
  }
  function yi() {
    return yt(function(e, t) {
      const n = Reflect.get(R(e), R(t));
      return U(n);
    }, arguments);
  }
  function wi(e, t) {
    const n = R(e)[R(t)];
    return U(n);
  }
  function hi(e) {
    let t;
    try {
      t = R(e) instanceof ArrayBuffer;
    } catch {
      t = false;
    }
    return t;
  }
  function xi(e) {
    let t;
    try {
      t = R(e) instanceof Map;
    } catch {
      t = false;
    }
    return t;
  }
  function vi(e) {
    let t;
    try {
      t = R(e) instanceof Uint8Array;
    } catch {
      t = false;
    }
    return t;
  }
  function Ci(e) {
    return Array.isArray(R(e));
  }
  function Ai(e) {
    return Number.isSafeInteger(R(e));
  }
  function Si() {
    return U(Symbol.iterator);
  }
  function ki(e) {
    return R(e).length;
  }
  function Li(e) {
    return R(e).length;
  }
  function Ti(e) {
    return R(e).length;
  }
  function ji() {
    const e = new Object();
    return U(e);
  }
  function qi() {
    const e = new Array();
    return U(e);
  }
  function $i() {
    const e = new Error();
    return U(e);
  }
  function Ii() {
    return U(/* @__PURE__ */ new Map());
  }
  function Ni(e) {
    const t = new Uint8Array(R(e));
    return U(t);
  }
  function Ei() {
    return yt(function(e) {
      const t = R(e).next();
      return U(t);
    }, arguments);
  }
  function Ri(e) {
    const t = R(e).next;
    return U(t);
  }
  function Fi(e, t, n) {
    Uint8Array.prototype.set.call(Yi(e, t), R(n));
  }
  function Mi(e, t, n) {
    const r = R(e).set(R(t), R(n));
    return U(r);
  }
  function Oi(e, t, n) {
    R(e)[z(t)] = z(n);
  }
  function zi(e, t, n) {
    R(e)[t >>> 0] = z(n);
  }
  function Di(e, t) {
    const n = R(t).stack, r = v(n, o.__wbindgen_export, o.__wbindgen_export2), s = x;
    b().setInt32(e + 4, s, true), b().setInt32(e + 0, r, true);
  }
  function Bi(e) {
    const t = R(e).value;
    return U(t);
  }
  function Pi(e) {
    return U(e);
  }
  function Ui(e) {
    return U(e);
  }
  function Vi(e, t) {
    const n = F(e, t);
    return U(n);
  }
  function Ki(e) {
    const t = BigInt.asUintN(64, e);
    return U(t);
  }
  function Hi(e) {
    const t = R(e);
    return U(t);
  }
  function Ji(e) {
    z(e);
  }
  const Cn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmassignmentarray_free(e >>> 0, 1)), St = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmcasebuilder_free(e >>> 0, 1)), An = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmdeletebuilder_free(e >>> 0, 1)), Sn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmexpr_free(e >>> 0, 1)), kn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmexprarray_free(e >>> 0, 1)), Ln = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasminsertbuilder_free(e >>> 0, 1)), Tn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmmergebuilder_free(e >>> 0, 1)), jn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmselectbuilder_free(e >>> 0, 1)), qn = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmsetopbuilder_free(e >>> 0, 1)), $n = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmupdatebuilder_free(e >>> 0, 1)), In = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((e) => o.__wbg_wasmwindowdefbuilder_free(e >>> 0, 1));
  function U(e) {
    He === xe.length && xe.push(xe.length + 1);
    const t = He;
    return He = xe[t], xe[t] = e, t;
  }
  function j(e, t) {
    if (!(e instanceof t)) throw new Error(`expected instance of ${t.name}`);
  }
  function Vt(e) {
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
      s > 0 && (a += Vt(e[0]));
      for (let i = 1; i < s; i++) a += ", " + Vt(e[i]);
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
  function Wi(e) {
    e < 132 || (xe[e] = He, He = e);
  }
  function Yi(e, t) {
    return e = e >>> 0, Ke().subarray(e / 1, e / 1 + t);
  }
  let Ee = null;
  function b() {
    return (Ee === null || Ee.buffer.detached === true || Ee.buffer.detached === void 0 && Ee.buffer !== o.memory.buffer) && (Ee = new DataView(o.memory.buffer)), Ee;
  }
  function F(e, t) {
    return e = e >>> 0, Gi(e, t);
  }
  let it = null;
  function Ke() {
    return (it === null || it.byteLength === 0) && (it = new Uint8Array(o.memory.buffer)), it;
  }
  function R(e) {
    return xe[e];
  }
  function yt(e, t) {
    try {
      return e.apply(this, t);
    } catch (n) {
      o.__wbindgen_export3(U(n));
    }
  }
  let xe = new Array(128).fill(void 0);
  xe.push(void 0, null, true, false);
  let He = xe.length;
  function Oe(e) {
    return e == null;
  }
  function Yt(e, t) {
    const n = t(e.length * 4, 4) >>> 0, r = b();
    for (let s = 0; s < e.length; s++) r.setUint32(n + 4 * s, U(e[s]), true);
    return x = e.length, n;
  }
  function v(e, t, n) {
    if (n === void 0) {
      const c = Je.encode(e), _ = t(c.length, 1) >>> 0;
      return Ke().subarray(_, _ + c.length).set(c), x = c.length, _;
    }
    let r = e.length, s = t(r, 1) >>> 0;
    const a = Ke();
    let i = 0;
    for (; i < r; i++) {
      const c = e.charCodeAt(i);
      if (c > 127) break;
      a[s + i] = c;
    }
    if (i !== r) {
      i !== 0 && (e = e.slice(i)), s = n(s, r, r = i + e.length * 3, 1) >>> 0;
      const c = Ke().subarray(s + i, s + r), _ = Je.encodeInto(e, c);
      i += _.written, s = n(s, r, i, 1) >>> 0;
    }
    return x = i, s;
  }
  function z(e) {
    const t = R(e);
    return Wi(e), t;
  }
  let ot = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true
  });
  ot.decode();
  const Qi = 2146435072;
  let kt = 0;
  function Gi(e, t) {
    return kt += t, kt >= Qi && (ot = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true
    }), ot.decode(), kt = t), ot.decode(Ke().subarray(e, e + t));
  }
  const Je = new TextEncoder();
  "encodeInto" in Je || (Je.encodeInto = function(e, t) {
    const n = Je.encode(e);
    return t.set(n), {
      read: e.length,
      written: n.length
    };
  });
  let x = 0, o;
  function Zi(e) {
    o = e;
  }
  URL = globalThis.URL;
  const f = await na({
    "./polyglot_sql_wasm_bg.js": {
      __wbindgen_object_drop_ref: Ji,
      __wbindgen_object_clone_ref: Hi,
      __wbg_new_8a6f238a6ece86ea: $i,
      __wbg_stack_0ed75d68575b0f3c: Di,
      __wbg_error_7534b8e9a36f1ab4: pi,
      __wbg_get_with_ref_key_1dc361bd10053bfe: wi,
      __wbg_set_3f1d0b984ed272ed: Oi,
      __wbg_String_8f0eb39a4a4c2f66: Ya,
      __wbg_new_dd2b680c8bf6ae29: Ni,
      __wbg_length_32ed9a279acd054c: ki,
      __wbg_prototypesetcall_bdcdcc5842e4d77d: Fi,
      __wbg_done_57b39ecd9addfe81: di,
      __wbg_value_0546255b415e96c1: Bi,
      __wbg_instanceof_Map_53af74335dec57f4: xi,
      __wbg_instanceof_Uint8Array_9b9075935c74707c: vi,
      __wbg_instanceof_ArrayBuffer_c367199e2fa2aa04: hi,
      __wbg_new_dca287b076112a51: Ii,
      __wbg_set_1eb0999cf5d27fc8: Mi,
      __wbg_get_9b94d73e6221f75c: bi,
      __wbg_new_3eb36ae241fe6f44: qi,
      __wbg_set_f43e577aea94465b: zi,
      __wbg_length_35a7bace40f36eac: Li,
      __wbg_isArray_d314bb98fcf08331: Ci,
      __wbg_isSafeInteger_bfbc7332a9768d2a: Ai,
      __wbg_new_361308b2356cecd0: ji,
      __wbg_entries_58c7934c745daac7: fi,
      __wbg_iterator_6ff6560ca1568e55: Si,
      __wbg_get_b3ed3ad4be2bc8ac: yi,
      __wbg_call_389efe28435a9388: li,
      __wbg_next_418f80d8f5303233: Ri,
      __wbg_next_3482f54c49e8af19: Ei,
      __wbg_codePointAt_bf59dbf74d8db275: mi,
      __wbg_fromCodePoint_22365db7b7d6ac39: gi,
      __wbg_length_68dc7c5cf1b6d349: Ti,
      __wbg___wbindgen_in_47fa6863be6f2f25: Xa,
      __wbg___wbindgen_throw_be289d5034ed271b: _i,
      __wbg___wbindgen_is_null_ac34f5003991759a: ni,
      __wbg___wbindgen_jsval_eq_11888390b0186270: ii,
      __wbg_Number_04624de7d0e8332d: Wa,
      __wbg_Error_8c4e43fe74559d73: Ja,
      __wbg___wbindgen_is_bigint_31b12575b56f32fc: ei,
      __wbg___wbindgen_is_object_5ae8e5880f2c1fbd: ri,
      __wbg___wbindgen_is_string_cd444516edc5b180: si,
      __wbg___wbindgen_number_get_8ff4255516ccad3e: ci,
      __wbg___wbindgen_string_get_72fb696202c56729: ui,
      __wbg___wbindgen_boolean_get_bbbb1c18aa2f5e25: Ga,
      __wbg___wbindgen_is_function_0095a73b8b156f76: ti,
      __wbg___wbindgen_is_undefined_9e4d92534c42d778: ai,
      __wbg___wbindgen_jsval_loose_eq_9dd77d8cd6671811: oi,
      __wbg___wbindgen_bigint_get_as_i64_8fcf4ce7f1ca72a2: Qa,
      __wbg___wbindgen_debug_string_0bc8482c6e3508ae: Za,
      __wbindgen_cast_0000000000000001: Pi,
      __wbindgen_cast_0000000000000002: Ui,
      __wbindgen_cast_0000000000000003: Vi,
      __wbindgen_cast_0000000000000004: Ki
    }
  }, ta), Xi = f.memory, eo = f.__wbg_wasmassignmentarray_free, to = f.__wbg_wasmcasebuilder_free, no = f.__wbg_wasmdeletebuilder_free, ro = f.__wbg_wasmexpr_free, so = f.__wbg_wasmexprarray_free, ao = f.__wbg_wasminsertbuilder_free, io = f.__wbg_wasmmergebuilder_free, oo = f.__wbg_wasmselectbuilder_free, co = f.__wbg_wasmsetopbuilder_free, uo = f.__wbg_wasmupdatebuilder_free, _o = f.__wbg_wasmwindowdefbuilder_free, lo = f.annotate_types, mo = f.annotate_types_value, fo = f.ast_add_where, po = f.ast_get_aggregate_functions, go = f.ast_get_column_names, bo = f.ast_get_functions, yo = f.ast_get_literals, wo = f.ast_get_subqueries, ho = f.ast_get_table_names, xo = f.ast_get_window_functions, vo = f.ast_node_count, Co = f.ast_qualify_columns, Ao = f.ast_qualify_tables, So = f.ast_remove_where, ko = f.ast_rename_columns, Lo = f.ast_rename_tables, To = f.ast_rename_tables_with_options, jo = f.ast_set_distinct, qo = f.ast_set_limit, $o = f.diff_sql, Io = f.format_sql, No = f.format_sql_value, Eo = f.format_sql_with_options, Ro = f.format_sql_with_options_value, Fo = f.generate, Mo = f.generate_value, Oo = f.get_dialects, zo = f.get_dialects_value, Do = f.lineage_sql, Bo = f.lineage_sql_with_schema, Po = f.openlineage_column_lineage, Uo = f.openlineage_job_event, Vo = f.openlineage_run_event, Ko = f.parse, Ho = f.parse_value, Jo = f.plan, Wo = f.source_tables, Yo = f.tokenize, Qo = f.tokenize_value, Go = f.transpile, Zo = f.transpile_value, Xo = f.validate, ec = f.validate_with_options, tc = f.validate_with_schema, nc = f.version, rc = f.wasm_alias, sc = f.wasm_and, ac = f.wasm_boolean, ic = f.wasm_case_of, oc = f.wasm_cast, cc = f.wasm_col, uc = f.wasm_count_distinct, _c = f.wasm_extract, lc = f.wasm_func, mc = f.wasm_lit, dc = f.wasm_not, fc = f.wasm_null, pc = f.wasm_or, gc = f.wasm_sql_expr, bc = f.wasm_star, yc = f.wasm_subquery, wc = f.wasm_table, hc = f.wasmassignmentarray_len, xc = f.wasmassignmentarray_new, vc = f.wasmassignmentarray_push, Cc = f.wasmcasebuilder_build_expr, Ac = f.wasmcasebuilder_else_, Sc = f.wasmcasebuilder_new, kc = f.wasmcasebuilder_to_sql, Lc = f.wasmcasebuilder_when, Tc = f.wasmdeletebuilder_build, jc = f.wasmdeletebuilder_new, qc = f.wasmdeletebuilder_to_sql, $c = f.wasmdeletebuilder_where_expr, Ic = f.wasmexpr_add, Nc = f.wasmexpr_alias, Ec = f.wasmexpr_and, Rc = f.wasmexpr_asc, Fc = f.wasmexpr_between, Mc = f.wasmexpr_cast, Oc = f.wasmexpr_desc, zc = f.wasmexpr_div, Dc = f.wasmexpr_eq, Bc = f.wasmexpr_gt, Pc = f.wasmexpr_gte, Uc = f.wasmexpr_ilike, Vc = f.wasmexpr_in_list, Kc = f.wasmexpr_is_not_null, Hc = f.wasmexpr_is_null, Jc = f.wasmexpr_like, Wc = f.wasmexpr_lt, Yc = f.wasmexpr_lte, Qc = f.wasmexpr_mul, Gc = f.wasmexpr_neq, Zc = f.wasmexpr_not, Xc = f.wasmexpr_not_in, eu = f.wasmexpr_or, tu = f.wasmexpr_rlike, nu = f.wasmexpr_sub, ru = f.wasmexpr_to_json, su = f.wasmexpr_to_sql, au = f.wasmexpr_xor, iu = f.wasmexprarray_len, ou = f.wasmexprarray_push, cu = f.wasmexprarray_push_col, uu = f.wasmexprarray_push_float, _u = f.wasmexprarray_push_int, lu = f.wasmexprarray_push_star, mu = f.wasmexprarray_push_str, du = f.wasminsertbuilder_build, fu = f.wasminsertbuilder_columns, pu = f.wasminsertbuilder_new, gu = f.wasminsertbuilder_query, bu = f.wasminsertbuilder_to_sql, yu = f.wasminsertbuilder_values, wu = f.wasmmergebuilder_build, hu = f.wasmmergebuilder_new, xu = f.wasmmergebuilder_to_sql, vu = f.wasmmergebuilder_using, Cu = f.wasmmergebuilder_when_matched_delete, Au = f.wasmmergebuilder_when_matched_update, Su = f.wasmmergebuilder_when_not_matched_insert, ku = f.wasmselectbuilder_build, Lu = f.wasmselectbuilder_cross_join, Tu = f.wasmselectbuilder_ctas, ju = f.wasmselectbuilder_ctas_sql, qu = f.wasmselectbuilder_distinct, $u = f.wasmselectbuilder_except_, Iu = f.wasmselectbuilder_for_update, Nu = f.wasmselectbuilder_from, Eu = f.wasmselectbuilder_from_expr, Ru = f.wasmselectbuilder_group_by_cols, Fu = f.wasmselectbuilder_having, Mu = f.wasmselectbuilder_hint, Ou = f.wasmselectbuilder_intersect, zu = f.wasmselectbuilder_join, Du = f.wasmselectbuilder_lateral_view, Bu = f.wasmselectbuilder_left_join, Pu = f.wasmselectbuilder_limit, Uu = f.wasmselectbuilder_new, Vu = f.wasmselectbuilder_offset, Ku = f.wasmselectbuilder_order_by_exprs, Hu = f.wasmselectbuilder_qualify, Ju = f.wasmselectbuilder_right_join, Wu = f.wasmselectbuilder_select_col, Yu = f.wasmselectbuilder_select_expr, Qu = f.wasmselectbuilder_select_exprs, Gu = f.wasmselectbuilder_select_star, Zu = f.wasmselectbuilder_sort_by_exprs, Xu = f.wasmselectbuilder_to_sql, e_ = f.wasmselectbuilder_union, t_ = f.wasmselectbuilder_union_all, n_ = f.wasmselectbuilder_where_expr, r_ = f.wasmselectbuilder_where_sql, s_ = f.wasmselectbuilder_window, a_ = f.wasmsetopbuilder_build, i_ = f.wasmsetopbuilder_limit, o_ = f.wasmsetopbuilder_offset, c_ = f.wasmsetopbuilder_order_by_exprs, u_ = f.wasmsetopbuilder_to_sql, __ = f.wasmupdatebuilder_build, l_ = f.wasmupdatebuilder_from, m_ = f.wasmupdatebuilder_new, d_ = f.wasmupdatebuilder_set, f_ = f.wasmupdatebuilder_to_sql, p_ = f.wasmupdatebuilder_where_expr, g_ = f.wasmwindowdefbuilder_new, b_ = f.wasmwindowdefbuilder_order_by, y_ = f.wasmwindowdefbuilder_partition_by, w_ = f.wasmexprarray_new, h_ = f.__wbindgen_export, x_ = f.__wbindgen_export2, v_ = f.__wbindgen_export3, C_ = f.__wbindgen_export4, A_ = f.__wbindgen_add_to_stack_pointer, S_ = Object.freeze(Object.defineProperty({
    __proto__: null,
    __wbg_wasmassignmentarray_free: eo,
    __wbg_wasmcasebuilder_free: to,
    __wbg_wasmdeletebuilder_free: no,
    __wbg_wasmexpr_free: ro,
    __wbg_wasmexprarray_free: so,
    __wbg_wasminsertbuilder_free: ao,
    __wbg_wasmmergebuilder_free: io,
    __wbg_wasmselectbuilder_free: oo,
    __wbg_wasmsetopbuilder_free: co,
    __wbg_wasmupdatebuilder_free: uo,
    __wbg_wasmwindowdefbuilder_free: _o,
    __wbindgen_add_to_stack_pointer: A_,
    __wbindgen_export: h_,
    __wbindgen_export2: x_,
    __wbindgen_export3: v_,
    __wbindgen_export4: C_,
    annotate_types: lo,
    annotate_types_value: mo,
    ast_add_where: fo,
    ast_get_aggregate_functions: po,
    ast_get_column_names: go,
    ast_get_functions: bo,
    ast_get_literals: yo,
    ast_get_subqueries: wo,
    ast_get_table_names: ho,
    ast_get_window_functions: xo,
    ast_node_count: vo,
    ast_qualify_columns: Co,
    ast_qualify_tables: Ao,
    ast_remove_where: So,
    ast_rename_columns: ko,
    ast_rename_tables: Lo,
    ast_rename_tables_with_options: To,
    ast_set_distinct: jo,
    ast_set_limit: qo,
    diff_sql: $o,
    format_sql: Io,
    format_sql_value: No,
    format_sql_with_options: Eo,
    format_sql_with_options_value: Ro,
    generate: Fo,
    generate_value: Mo,
    get_dialects: Oo,
    get_dialects_value: zo,
    lineage_sql: Do,
    lineage_sql_with_schema: Bo,
    memory: Xi,
    openlineage_column_lineage: Po,
    openlineage_job_event: Uo,
    openlineage_run_event: Vo,
    parse: Ko,
    parse_value: Ho,
    plan: Jo,
    source_tables: Wo,
    tokenize: Yo,
    tokenize_value: Qo,
    transpile: Go,
    transpile_value: Zo,
    validate: Xo,
    validate_with_options: ec,
    validate_with_schema: tc,
    version: nc,
    wasm_alias: rc,
    wasm_and: sc,
    wasm_boolean: ac,
    wasm_case_of: ic,
    wasm_cast: oc,
    wasm_col: cc,
    wasm_count_distinct: uc,
    wasm_extract: _c,
    wasm_func: lc,
    wasm_lit: mc,
    wasm_not: dc,
    wasm_null: fc,
    wasm_or: pc,
    wasm_sql_expr: gc,
    wasm_star: bc,
    wasm_subquery: yc,
    wasm_table: wc,
    wasmassignmentarray_len: hc,
    wasmassignmentarray_new: xc,
    wasmassignmentarray_push: vc,
    wasmcasebuilder_build_expr: Cc,
    wasmcasebuilder_else_: Ac,
    wasmcasebuilder_new: Sc,
    wasmcasebuilder_to_sql: kc,
    wasmcasebuilder_when: Lc,
    wasmdeletebuilder_build: Tc,
    wasmdeletebuilder_new: jc,
    wasmdeletebuilder_to_sql: qc,
    wasmdeletebuilder_where_expr: $c,
    wasmexpr_add: Ic,
    wasmexpr_alias: Nc,
    wasmexpr_and: Ec,
    wasmexpr_asc: Rc,
    wasmexpr_between: Fc,
    wasmexpr_cast: Mc,
    wasmexpr_desc: Oc,
    wasmexpr_div: zc,
    wasmexpr_eq: Dc,
    wasmexpr_gt: Bc,
    wasmexpr_gte: Pc,
    wasmexpr_ilike: Uc,
    wasmexpr_in_list: Vc,
    wasmexpr_is_not_null: Kc,
    wasmexpr_is_null: Hc,
    wasmexpr_like: Jc,
    wasmexpr_lt: Wc,
    wasmexpr_lte: Yc,
    wasmexpr_mul: Qc,
    wasmexpr_neq: Gc,
    wasmexpr_not: Zc,
    wasmexpr_not_in: Xc,
    wasmexpr_or: eu,
    wasmexpr_rlike: tu,
    wasmexpr_sub: nu,
    wasmexpr_to_json: ru,
    wasmexpr_to_sql: su,
    wasmexpr_xor: au,
    wasmexprarray_len: iu,
    wasmexprarray_new: w_,
    wasmexprarray_push: ou,
    wasmexprarray_push_col: cu,
    wasmexprarray_push_float: uu,
    wasmexprarray_push_int: _u,
    wasmexprarray_push_star: lu,
    wasmexprarray_push_str: mu,
    wasminsertbuilder_build: du,
    wasminsertbuilder_columns: fu,
    wasminsertbuilder_new: pu,
    wasminsertbuilder_query: gu,
    wasminsertbuilder_to_sql: bu,
    wasminsertbuilder_values: yu,
    wasmmergebuilder_build: wu,
    wasmmergebuilder_new: hu,
    wasmmergebuilder_to_sql: xu,
    wasmmergebuilder_using: vu,
    wasmmergebuilder_when_matched_delete: Cu,
    wasmmergebuilder_when_matched_update: Au,
    wasmmergebuilder_when_not_matched_insert: Su,
    wasmselectbuilder_build: ku,
    wasmselectbuilder_cross_join: Lu,
    wasmselectbuilder_ctas: Tu,
    wasmselectbuilder_ctas_sql: ju,
    wasmselectbuilder_distinct: qu,
    wasmselectbuilder_except_: $u,
    wasmselectbuilder_for_update: Iu,
    wasmselectbuilder_from: Nu,
    wasmselectbuilder_from_expr: Eu,
    wasmselectbuilder_group_by_cols: Ru,
    wasmselectbuilder_having: Fu,
    wasmselectbuilder_hint: Mu,
    wasmselectbuilder_intersect: Ou,
    wasmselectbuilder_join: zu,
    wasmselectbuilder_lateral_view: Du,
    wasmselectbuilder_left_join: Bu,
    wasmselectbuilder_limit: Pu,
    wasmselectbuilder_new: Uu,
    wasmselectbuilder_offset: Vu,
    wasmselectbuilder_order_by_exprs: Ku,
    wasmselectbuilder_qualify: Hu,
    wasmselectbuilder_right_join: Ju,
    wasmselectbuilder_select_col: Wu,
    wasmselectbuilder_select_expr: Yu,
    wasmselectbuilder_select_exprs: Qu,
    wasmselectbuilder_select_star: Gu,
    wasmselectbuilder_sort_by_exprs: Zu,
    wasmselectbuilder_to_sql: Xu,
    wasmselectbuilder_union: e_,
    wasmselectbuilder_union_all: t_,
    wasmselectbuilder_where_expr: n_,
    wasmselectbuilder_where_sql: r_,
    wasmselectbuilder_window: s_,
    wasmsetopbuilder_build: a_,
    wasmsetopbuilder_limit: i_,
    wasmsetopbuilder_offset: o_,
    wasmsetopbuilder_order_by_exprs: c_,
    wasmsetopbuilder_to_sql: u_,
    wasmupdatebuilder_build: __,
    wasmupdatebuilder_from: l_,
    wasmupdatebuilder_new: m_,
    wasmupdatebuilder_set: d_,
    wasmupdatebuilder_to_sql: f_,
    wasmupdatebuilder_where_expr: p_,
    wasmwindowdefbuilder_new: g_,
    wasmwindowdefbuilder_order_by: b_,
    wasmwindowdefbuilder_partition_by: y_
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  Zi(S_);
  const k_ = Object.freeze(Object.defineProperty({
    __proto__: null,
    WasmAssignmentArray: lt,
    WasmCaseBuilder: Me,
    WasmDeleteBuilder: Dt,
    WasmExpr: A,
    WasmExprArray: re,
    WasmInsertBuilder: Bt,
    WasmMergeBuilder: Pt,
    WasmSelectBuilder: de,
    WasmSetOpBuilder: ve,
    WasmUpdateBuilder: Ut,
    WasmWindowDefBuilder: mt,
    annotate_types: ra,
    annotate_types_value: sa,
    ast_add_where: sr,
    ast_get_aggregate_functions: ar,
    ast_get_column_names: ir,
    ast_get_functions: or,
    ast_get_literals: cr,
    ast_get_subqueries: ur,
    ast_get_table_names: _r,
    ast_get_window_functions: lr,
    ast_node_count: mr,
    ast_qualify_columns: dr,
    ast_qualify_tables: fr,
    ast_remove_where: pr,
    ast_rename_columns: gr,
    ast_rename_tables: br,
    ast_rename_tables_with_options: yr,
    ast_set_distinct: wr,
    ast_set_limit: hr,
    diff_sql: aa,
    format_sql: ia,
    format_sql_value: oa,
    format_sql_with_options: ca,
    format_sql_with_options_value: ua,
    generate: _a,
    generate_value: la,
    get_dialects: ma,
    get_dialects_value: da,
    lineage_sql: fa,
    lineage_sql_with_schema: pa,
    openlineage_column_lineage: ga,
    openlineage_job_event: ba,
    openlineage_run_event: ya,
    parse: wa,
    parse_value: ha,
    plan: xa,
    source_tables: va,
    tokenize: Ca,
    tokenize_value: Aa,
    transpile: Sa,
    transpile_value: ka,
    validate: La,
    validate_with_options: Ta,
    validate_with_schema: xr,
    version: ja,
    wasm_alias: qa,
    wasm_and: $a,
    wasm_boolean: Ia,
    wasm_case_of: Na,
    wasm_cast: Ea,
    wasm_col: Ra,
    wasm_count_distinct: Fa,
    wasm_extract: Ma,
    wasm_func: Oa,
    wasm_lit: za,
    wasm_not: Da,
    wasm_null: Ba,
    wasm_or: Pa,
    wasm_sql_expr: Ua,
    wasm_star: Va,
    wasm_subquery: Ka,
    wasm_table: Ha
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  function Z(e) {
    return Object.keys(e)[0];
  }
  function he(e) {
    const t = Object.keys(e)[0];
    return e[t];
  }
  function Ce(e) {
    if (typeof e != "object" || e === null || Array.isArray(e)) return false;
    const t = Object.keys(e);
    if (t.length !== 1) return false;
    const n = e[t[0]];
    return n === null || typeof n == "object" && !Array.isArray(n);
  }
  function be(e, t) {
    return {
      [e]: t
    };
  }
  function L_(e) {
    const t = he(e);
    if (t && typeof t == "object" && "inferred_type" in t) {
      const n = t.inferred_type;
      if (n != null) return n;
    }
  }
  function T(e) {
    return (t) => e in t;
  }
  const T_ = T("select"), j_ = T("insert"), q_ = T("update"), $_ = T("delete"), I_ = T("union"), N_ = T("intersect"), E_ = T("except"), R_ = T("subquery"), F_ = T("identifier"), M_ = T("column"), O_ = T("table"), z_ = T("star"), D_ = T("literal"), B_ = T("boolean"), P_ = T("null"), U_ = T("and"), V_ = T("or"), K_ = T("not"), H_ = T("eq"), J_ = T("neq"), W_ = T("lt"), Y_ = T("lte"), Q_ = T("gt"), G_ = T("gte"), Z_ = T("like"), X_ = T("i_like"), el = T("add"), tl = T("sub"), nl = T("mul"), rl = T("div"), sl = T("mod"), al = T("concat"), il = T("in"), ol = T("between"), cl = T("is_null"), ul = T("exists"), _l = T("function"), ll = T("aggregate_function"), ml = T("window_function"), dl = T("count"), fl = T("sum"), pl = T("avg"), gl = T("min"), bl = T("max"), yl = T("coalesce"), wl = T("null_if"), hl = T("cast"), xl = T("try_cast"), vl = T("safe_cast"), Cl = T("case"), Al = T("from"), Sl = T("join"), kl = T("where"), Ll = T("group_by"), Tl = T("having"), jl = T("order_by"), ql = T("limit"), $l = T("offset"), Il = T("with"), Nl = T("cte"), El = T("alias"), Rl = T("paren"), Fl = T("ordered"), Ml = T("create_table"), Ol = T("drop_table"), zl = T("alter_table"), Dl = T("create_index"), Bl = T("drop_index"), Pl = T("create_view"), Ul = T("drop_view");
  function Vl(e) {
    const t = Z(e);
    return t === "select" || t === "insert" || t === "update" || t === "delete";
  }
  function Kl(e) {
    const t = Z(e);
    return t === "union" || t === "intersect" || t === "except";
  }
  function Hl(e) {
    const t = Z(e);
    return t === "eq" || t === "neq" || t === "lt" || t === "lte" || t === "gt" || t === "gte" || t === "like" || t === "i_like";
  }
  function Jl(e) {
    const t = Z(e);
    return t === "add" || t === "sub" || t === "mul" || t === "div" || t === "mod";
  }
  function Wl(e) {
    const t = Z(e);
    return t === "and" || t === "or" || t === "not";
  }
  function Yl(e) {
    const t = Z(e);
    return t === "create_table" || t === "drop_table" || t === "alter_table" || t === "create_index" || t === "drop_index" || t === "create_view" || t === "drop_view" || t === "create_schema" || t === "drop_schema" || t === "create_database" || t === "drop_database" || t === "create_function" || t === "drop_function" || t === "create_procedure" || t === "drop_procedure" || t === "create_sequence" || t === "drop_sequence" || t === "alter_sequence" || t === "create_trigger" || t === "drop_trigger" || t === "create_type" || t === "drop_type";
  }
  function ye(e) {
    return JSON.stringify(e);
  }
  function qe(e) {
    const t = JSON.parse(e);
    return t.success ? JSON.parse(t.ast) : null;
  }
  function vr(e, t, n) {
    if (e == null) return e;
    if (Array.isArray(e)) return e.length > 0 && Ce(e[0]) ? e.map((r, s) => ct(r, t, n, null, s)) : e.length > 0 && Array.isArray(e[0]) ? e.map((r) => Array.isArray(r) ? r.map((s, a) => Ce(s) ? ct(s, t, n, null, a) : s) : r) : e;
    if (Ce(e)) return ct(e, t, n, null, null);
    if (typeof e == "object") {
      const s = {
        ...e
      };
      let a = false;
      for (const [i, c] of Object.entries(s)) {
        const _ = vr(c, t, n);
        _ !== c && (s[i] = _, a = true);
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
    const i = Z(a), c = t[i];
    if (c) {
      const y = c(a, n, r, s);
      if (y === null) return a;
      y !== void 0 && (a = y);
    }
    const _ = Z(a), l = he(a);
    let m;
    if (l == null) m = be(_, l);
    else {
      const y = {
        ...l
      };
      for (const [w, S] of Object.entries(y)) {
        const N = vr(S, t, a);
        N !== S && (y[w] = N);
      }
      m = be(_, y);
    }
    if (t.leave) {
      const y = t.leave(m, n, r, s);
      if (y != null) return y;
    }
    return m;
  }
  function Qt(e, t) {
    return ct(e, t, null, null, null);
  }
  function Cr(e, t, n) {
    return Qt(e, {
      enter: (r, s) => {
        if (t(r, s)) return typeof n == "function" ? n(r) : n;
      }
    });
  }
  function Ql(e, t, n) {
    return Cr(e, (r) => Z(r) === t, typeof n == "function" ? (r) => n(r) : n);
  }
  function Gl(e, t) {
    return qe(gr(ye(e), JSON.stringify(t))) ?? e;
  }
  function Zl(e, t, n) {
    return qe(n ? yr(ye(e), JSON.stringify(t), JSON.stringify(n)) : br(ye(e), JSON.stringify(t))) ?? e;
  }
  function Xl(e, t) {
    return qe(dr(ye(e), t)) ?? e;
  }
  function em(e, t = {}) {
    return qe(fr(ye(e), JSON.stringify(t))) ?? e;
  }
  function tm(e, t, n = "and") {
    return qe(sr(ye(e), ye(t), n === "or")) ?? e;
  }
  function nm(e) {
    return qe(pr(ye(e))) ?? e;
  }
  function rm(e, ...t) {
    if (Z(e) !== "select") return e;
    const n = he(e);
    return be("select", {
      ...n,
      expressions: [
        ...n.expressions,
        ...t
      ]
    });
  }
  function sm(e, t) {
    if (Z(e) !== "select") return e;
    const n = he(e);
    return be("select", {
      ...n,
      expressions: n.expressions.filter((r) => !t(r))
    });
  }
  function am(e, t) {
    if (typeof t == "number") return qe(hr(ye(e), t)) ?? e;
    if (Z(e) !== "select") return e;
    const n = he(e);
    return be("select", {
      ...n,
      limit: {
        this: t
      }
    });
  }
  function im(e, t) {
    if (Z(e) !== "select") return e;
    const n = he(e), r = typeof t == "number" ? be("literal", {
      literal_type: "number",
      value: String(t)
    }) : t;
    return be("select", {
      ...n,
      offset: {
        this: r
      }
    });
  }
  function om(e) {
    if (Z(e) !== "select") return e;
    const t = he(e);
    return be("select", {
      ...t,
      limit: null,
      offset: null
    });
  }
  function cm(e, t = true) {
    return qe(wr(ye(e), t)) ?? e;
  }
  function um(e) {
    return Qt(e, {});
  }
  function Ar(e, t, n) {
    if (e == null) return e;
    if (Array.isArray(e)) return e.length > 0 && Ce(e[0]) ? e.filter((r) => !t(r, n)).map((r) => Kt(r, t)) : e;
    if (Ce(e)) return Kt(e, t);
    if (typeof e == "object") {
      const s = {
        ...e
      };
      let a = false;
      for (const [i, c] of Object.entries(s)) {
        const _ = Ar(c, t, n);
        _ !== c && (s[i] = _, a = true);
      }
      return a ? s : e;
    }
    return e;
  }
  function Kt(e, t) {
    const n = Z(e), s = {
      ...he(e)
    };
    for (const [a, i] of Object.entries(s)) {
      const c = Ar(i, t, e);
      c !== i && (s[a] = c);
    }
    return be(n, s);
  }
  function $e(e) {
    return JSON.stringify(e);
  }
  function Sr(e, t, n) {
    if (e != null) {
      if (Array.isArray(e)) {
        if (e.length > 0 && Ce(e[0])) n.push({
          key: t,
          value: e
        });
        else if (e.length > 0 && Array.isArray(e[0])) {
          for (const r of e) if (Array.isArray(r)) for (const s of r) Ce(s) && n.push({
            key: t,
            value: s
          });
        }
      } else if (Ce(e)) n.push({
        key: t,
        value: e
      });
      else if (typeof e == "object") for (const [, r] of Object.entries(e)) Sr(r, t, n);
    }
  }
  function kr(e) {
    const t = [], n = he(e);
    if (!n || typeof n != "object") return t;
    for (const [r, s] of Object.entries(n)) Sr(s, r, t);
    return t;
  }
  function we(e, t, n = null, r = null, s = null) {
    t.enter && t.enter(e, n, r, s);
    const a = Z(e), i = t[a];
    i && i(e, n, r, s);
    const c = kr(e);
    for (const _ of c) Array.isArray(_.value) ? _.value.forEach((l, m) => {
      we(l, t, e, _.key, m);
    }) : we(_.value, t, e, _.key, null);
    t.leave && t.leave(e, n, r, s);
  }
  function Gt(e, t) {
    const n = [];
    return we(e, {
      enter: (r, s) => {
        t(r, s) && n.push(r);
      }
    }), n;
  }
  function wt(e, t) {
    return Gt(e, (n) => Z(n) === t);
  }
  function Lr(e, t) {
    let n, r = false;
    return we(e, {
      enter: (s, a) => {
        !r && t(s, a) && (n = s, r = true);
      }
    }), n;
  }
  function _m(e, t) {
    return Lr(e, t) !== void 0;
  }
  function lm(e, t) {
    let n = true;
    return we(e, {
      enter: (r, s) => {
        t(r, s) || (n = false);
      }
    }), n;
  }
  function mm(e, t) {
    return Gt(e, t).length;
  }
  function dm(e) {
    return wt(e, "column");
  }
  function fm(e) {
    return wt(e, "table");
  }
  function pm(e) {
    return wt(e, "identifier");
  }
  function gm(e) {
    const t = JSON.parse(or($e(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function Tr(e) {
    const t = JSON.parse(ar($e(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function jr(e) {
    const t = JSON.parse(lr($e(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function qr(e) {
    const t = JSON.parse(ur($e(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function bm(e) {
    const t = JSON.parse(cr($e(e)));
    return t.success ? JSON.parse(t.ast) : [];
  }
  function ym(e) {
    const t = JSON.parse(ir($e(e)));
    return t.success ? t.result : [];
  }
  function wm(e) {
    const t = JSON.parse(_r($e(e)));
    return t.success ? t.result : [];
  }
  function hm(e) {
    return Tr(e).length > 0;
  }
  function xm(e) {
    return jr(e).length > 0;
  }
  function vm(e) {
    return qr(e).length > 0;
  }
  function Cm(e) {
    let t = 0, n = 0;
    return we(e, {
      enter: () => {
        n++, t = Math.max(t, n);
      },
      leave: () => {
        n--;
      }
    }), t;
  }
  function Am(e) {
    const t = JSON.parse(mr($e(e)));
    return t.success ? t.result : 0;
  }
  function Sm(e, t) {
    let n = null;
    return we(e, {
      enter: (r, s) => {
        r === t && (n = s);
      }
    }), n;
  }
  function km(e, t, n) {
    const r = [];
    let s = null;
    return we(e, {
      enter: (a) => {
        if (s === null) {
          if (a === t) for (let i = r.length - 1; i >= 0; i--) {
            const c = i > 0 ? r[i - 1] : null;
            if (n(r[i], c)) {
              s = r[i];
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
  function Lm(e, t) {
    let n = 0, r = 0;
    return we(e, {
      enter: (s) => {
        r++, s === t && (n = r);
      },
      leave: () => {
        r--;
      }
    }), n;
  }
  const Zt = Object.freeze(Object.defineProperty({
    __proto__: null,
    addSelectColumns: rm,
    addWhere: tm,
    clone: um,
    countNodes: mm,
    every: lm,
    findAll: Gt,
    findAncestor: km,
    findByType: wt,
    findFirst: Lr,
    getAggregateFunctions: Tr,
    getChildren: kr,
    getColumnNames: ym,
    getColumns: dm,
    getDepth: Cm,
    getExprData: he,
    getExprType: Z,
    getFunctions: gm,
    getIdentifiers: pm,
    getInferredType: L_,
    getLiterals: bm,
    getNodeDepth: Lm,
    getParent: Sm,
    getSubqueries: qr,
    getTableNames: wm,
    getTables: fm,
    getWindowFunctions: jr,
    hasAggregates: hm,
    hasSubqueries: vm,
    hasWindowFunctions: xm,
    isAdd: el,
    isAggregateFunction: ll,
    isAlias: El,
    isAlterTable: zl,
    isAnd: U_,
    isArithmetic: Jl,
    isAvg: pl,
    isBetween: ol,
    isBoolean: B_,
    isCase: Cl,
    isCast: hl,
    isCoalesce: yl,
    isColumn: M_,
    isComparison: Hl,
    isConcat: al,
    isCount: dl,
    isCreateIndex: Dl,
    isCreateTable: Ml,
    isCreateView: Pl,
    isCte: Nl,
    isDDL: Yl,
    isDelete: $_,
    isDiv: rl,
    isDropIndex: Bl,
    isDropTable: Ol,
    isDropView: Ul,
    isEq: H_,
    isExcept: E_,
    isExists: ul,
    isExpressionValue: Ce,
    isFrom: Al,
    isFunction: _l,
    isGroupBy: Ll,
    isGt: Q_,
    isGte: G_,
    isHaving: Tl,
    isILike: X_,
    isIdentifier: F_,
    isIn: il,
    isInsert: j_,
    isIntersect: N_,
    isIsNull: cl,
    isJoin: Sl,
    isLike: Z_,
    isLimit: ql,
    isLiteral: D_,
    isLogical: Wl,
    isLt: W_,
    isLte: Y_,
    isMax: bl,
    isMin: gl,
    isMod: sl,
    isMul: nl,
    isNeq: J_,
    isNot: K_,
    isNullIf: wl,
    isNullLiteral: P_,
    isOffset: $l,
    isOr: V_,
    isOrderBy: jl,
    isOrdered: Fl,
    isParen: Rl,
    isQuery: Vl,
    isSafeCast: vl,
    isSelect: T_,
    isSetOperation: Kl,
    isStar: z_,
    isSub: tl,
    isSubquery: R_,
    isSum: fl,
    isTable: O_,
    isTryCast: xl,
    isUnion: I_,
    isUpdate: q_,
    isWhere: kl,
    isWindowFunction: ml,
    isWith: Il,
    makeExpr: be,
    nodeCount: Am,
    qualifyColumns: Xl,
    qualifyTables: em,
    remove: Kt,
    removeLimitOffset: om,
    removeSelectColumns: sm,
    removeWhere: nm,
    renameColumns: Gl,
    renameTables: Zl,
    replaceByType: Ql,
    replaceNodes: Cr,
    setDistinct: cm,
    setLimit: am,
    setOffset: im,
    some: _m,
    transform: Qt,
    walk: we
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  function Tm(e) {
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
  function jm(e, t, n = "generic", r = {}) {
    const s = r.strict ?? t.strict ?? true, a = {
      check_types: r.checkTypes ?? false,
      check_references: r.checkReferences ?? false,
      strict: s,
      semantic: r.semantic ?? false,
      strict_syntax: r.strictSyntax ?? false
    }, i = xr(e, JSON.stringify(t), n, JSON.stringify(a));
    return Tm(i);
  }
  const fe = k_;
  function $r(e) {
    return e instanceof Error && e.message ? e.message : typeof e == "string" ? e : String(e);
  }
  function qm(e, t) {
    return {
      success: false,
      ast: void 0,
      error: `WASM ${e} failed: ${$r(t)}`,
      errorLine: void 0,
      errorColumn: void 0
    };
  }
  function Xt(e) {
    return typeof e == "string" ? JSON.parse(e) : e;
  }
  function Q(e, t = "generic") {
    try {
      if (typeof fe.parse_value == "function") return Xt(fe.parse_value(e, t));
      const n = JSON.parse(fe.parse(e, t));
      return n.success && typeof n.ast == "string" && (n.ast = JSON.parse(n.ast)), n;
    } catch (n) {
      return qm("parse", n);
    }
  }
  function $m() {
    return typeof fe.get_dialects_value == "function" ? Xt(fe.get_dialects_value()) : JSON.parse(fe.get_dialects());
  }
  function Ir(e, t = "generic", n) {
    try {
      const r = n ? JSON.stringify(n) : "";
      return typeof fe.annotate_types_value == "function" ? Xt(fe.annotate_types_value(e, t, r)) : typeof fe.annotate_types == "function" ? JSON.parse(fe.annotate_types(e, t, r)) : {
        success: false,
        error: "annotate_types not available in this WASM build"
      };
    } catch (r) {
      return {
        success: false,
        error: `WASM annotate_types failed: ${$r(r)}`
      };
    }
  }
  const Im = {
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
  function me(e) {
    const t = e == null ? void 0 : e.trim();
    if (!t) return "generic";
    const n = t.toLowerCase().replace(/[-_\s]+/g, "");
    return Im[n] ?? t.toLowerCase();
  }
  Nm = function() {
    return [
      ...$m().map(String)
    ].sort();
  };
  function Em(e) {
    const t = me(e);
    return Nm().includes(t);
  }
  function Nr(e) {
    const t = me(e);
    if (!Em(t)) throw new Error(`Unsupported SQL dialect "${e ?? t}". Run "sqldesc --dialects" to list supported dialects.`);
    return t;
  }
  const Er = /* @__PURE__ */ new Set([
    "postgresql",
    "cockroachdb",
    "redshift"
  ]), Ne = /* @__PURE__ */ new Set([
    "tsql"
  ]), Rr = /* @__PURE__ */ new Set([
    "oracle"
  ]), Fr = /* @__PURE__ */ new Set([
    "mysql",
    "mariadb",
    "singlestore"
  ]);
  function Rm(e, t) {
    const n = me(t);
    return Xm(en(e, n), n);
  }
  function Fm(e, t) {
    const n = me(t);
    return e.mode === "none" ? e : e.mode === "positional" ? {
      mode: "positional",
      binds: e.binds.map((r) => ({
        ...r,
        type: Nn(r.type, n)
      }))
    } : {
      mode: "named",
      binds: e.binds.map((r) => ({
        ...r,
        type: Nn(r.type, n)
      }))
    };
  }
  function Nn(e, t) {
    const n = Mm(e);
    return n ? Mr(n, t) : e;
  }
  function Mm(e) {
    const n = e.trim().match(/^jdbc\s*:\s*(?:(?:java\.sql\.)?types\.)?([A-Za-z_][\w]*)$/i);
    return n ? n[1].toUpperCase() : void 0;
  }
  function Mr(e, t) {
    return Om(t)[e] ?? De[e] ?? "unknown";
  }
  function Om(e) {
    return Er.has(e) ? Um : Ne.has(e) ? Km : Rr.has(e) ? Hm : Fr.has(e) ? Vm : De;
  }
  function en(e, t) {
    let n = "";
    for (let r = 0; r < e.length; ) {
      const s = e[r];
      if (s === "'") {
        const a = le(e, r, "'");
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === '"') {
        const a = le(e, r, '"');
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "`") {
        const a = le(e, r, "`");
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "[") {
        const a = le(e, r, "[");
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
        const a = zr(e, r);
        n += e.slice(r, a), r = a;
        continue;
      }
      if (s === "{") {
        const a = Zm(e, r);
        if (a !== -1) {
          n += zm(e.slice(r + 1, a), t), r = a + 1;
          continue;
        }
      }
      n += s, r++;
    }
    return n;
  }
  function zm(e, t) {
    const n = en(e.trim(), t);
    if (/^fn\b/i.test(n)) return Dm(n.replace(/^fn\b/i, "").trim(), t);
    const r = n.match(/^d\s+('(?:''|[^'])*')$/i);
    if (r) return Lt("date", r[1] ?? "''", t);
    const s = n.match(/^t\s+('(?:''|[^'])*')$/i);
    if (s) return Lt("time", s[1] ?? "''", t);
    const a = n.match(/^ts\s+('(?:''|[^'])*')$/i);
    return a ? Lt("timestamp", a[1] ?? "''", t) : /^escape\b/i.test(n) ? `ESCAPE ${n.replace(/^escape\b/i, "").trim()}` : /^oj\b/i.test(n) ? n.replace(/^oj\b/i, "").trim() : /^\?\s*=\s*call\b/i.test(n) ? Jm(n.replace(/^\?\s*=\s*call\b/i, "").trim(), t) : /^call\b/i.test(n) ? `CALL ${n.replace(/^call\b/i, "").trim()}` : `{${n}}`;
  }
  function Dm(e, t) {
    const n = Or(e);
    if (!n) return e;
    const r = n.name.toLowerCase(), s = n.args.map((a) => en(a.trim(), t));
    return r === "ucase" ? En("upper", s, e) : r === "lcase" ? En("lower", s, e) : r === "ifnull" ? Qm(Ne.has(t) ? "isnull" : "coalesce", s, e) : r === "now" ? Tt("current_timestamp", s, e) : r === "curdate" ? Tt(Wm(t), s, e) : r === "curtime" ? Tt(Ym(t), s, e) : r === "convert" ? Bm(s, t, e) : `${n.name}(${s.join(", ")})`;
  }
  function Bm(e, t, n) {
    if (e.length !== 2) return n;
    const r = Pm(e[1] ?? "", t);
    return `CAST(${e[0]} AS ${r})`;
  }
  function Pm(e, t) {
    const n = e.trim().replace(/^SQL_/i, "").toUpperCase();
    return Mr(n, t) ?? e.trim();
  }
  const De = {
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
  }, Um = {
    ...De,
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
  }, Vm = {
    ...De,
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
  }, Km = {
    ...De,
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
  }, Hm = {
    ...De,
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
  function Lt(e, t, n) {
    return Ne.has(n) ? `CAST(${t} AS ${e === "timestamp" ? "datetime2" : e})` : Fr.has(n) ? t : `${e.toUpperCase()} ${t}`;
  }
  function Jm(e, t) {
    const n = Or(e);
    return n ? Ne.has(t) ? `EXEC ${e}` : `SELECT ${n.name}(${n.args.join(", ")})` : `SELECT ${e}`;
  }
  function Wm(e) {
    return Ne.has(e) ? "CAST(current_timestamp AS date)" : "current_date";
  }
  function Ym(e) {
    return Ne.has(e) ? "CAST(current_timestamp AS time)" : "current_time";
  }
  function En(e, t, n) {
    return t.length === 1 ? `${e}(${t[0]})` : n;
  }
  function Qm(e, t, n) {
    return t.length === 2 ? `${e}(${t[0]}, ${t[1]})` : n;
  }
  function Tt(e, t, n) {
    return t.length === 0 ? e : n;
  }
  function Or(e) {
    const t = e.match(/^([A-Za-z_][\w.$]*)\s*\(([\s\S]*)\)$/);
    if (t) return {
      name: t[1] ?? "",
      args: Gm(t[2] ?? "")
    };
  }
  function Gm(e) {
    const t = [];
    let n = 0, r = 0;
    for (let a = 0; a < e.length; ) {
      const i = e[a];
      if (i === "'") {
        a = le(e, a, "'");
        continue;
      }
      if (i === '"') {
        a = le(e, a, '"');
        continue;
      }
      (i === "(" || i === "{") && r++, (i === ")" || i === "}") && (r = Math.max(0, r - 1)), i === "," && r === 0 && (t.push(e.slice(n, a).trim()), n = a + 1), a++;
    }
    const s = e.slice(n).trim();
    return s ? [
      ...t,
      s
    ] : t;
  }
  function Zm(e, t) {
    let n = 0;
    for (let r = t; r < e.length; ) {
      const s = e[r];
      if (s === "'") {
        r = le(e, r, "'");
        continue;
      }
      if (s === '"') {
        r = le(e, r, '"');
        continue;
      }
      if (s === "{" && n++, s === "}" && (n--, n === 0)) return r;
      r++;
    }
    return -1;
  }
  function Xm(e, t) {
    let n = "", r = 0;
    for (let s = 0; s < e.length; ) {
      const a = e[s];
      if (a === "'") {
        const i = le(e, s, "'");
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === '"') {
        const i = le(e, s, '"');
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === "`") {
        const i = le(e, s, "`");
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === "[") {
        const i = le(e, s, "[");
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === "-" && e[s + 1] === "-") {
        const i = dt(e, s);
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === "#") {
        const i = dt(e, s);
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === "/" && e[s + 1] === "*") {
        const i = zr(e, s);
        n += e.slice(s, i), s = i;
        continue;
      }
      if (a === "?") {
        if (e[s + 1] === "?") {
          n += "?", s += 2;
          continue;
        }
        r++, n += ed(r, t), s++;
        continue;
      }
      n += a, s++;
    }
    return n;
  }
  function ed(e, t) {
    return Er.has(t) ? `$${e}` : Rr.has(t) ? `:${e}` : Ne.has(t) ? `@P${e}` : "?";
  }
  function le(e, t, n) {
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
  function zr(e, t) {
    const n = e.indexOf("*/", t + 2);
    return n === -1 ? e.length : n + 2;
  }
  async function td() {
    return [];
  }
  async function nd() {
    throw new Error("File system access is not available in the browser.");
  }
  const ze = {
    join(...e) {
      return e.filter(Boolean).join("/").replace(/\/+/g, "/");
    },
    resolve(...e) {
      return ze.join(...e);
    },
    dirname(e) {
      const t = e.replace(/\\/g, "/"), n = t.lastIndexOf("/");
      return n <= 0 ? "." : t.slice(0, n);
    }
  }, rd = /^(?:constraint\s+\S+\s+)?(?:primary\s+key|foreign\s+key|unique|check|period\s+for)\b/i;
  async function sd(e, t = process.cwd()) {
    return (await Promise.all(e.map((n) => id()))).flat().sort();
  }
  async function ad(e, t = {}) {
    const n = t.cwd ?? process.cwd(), r = await sd(e, n);
    return Dr(r, t);
  }
  async function Dr(e, t = {}) {
    const n = Nr(t.dialect), r = [], s = [], a = /* @__PURE__ */ new Map();
    for (const m of e) {
      const y = await Br(m, n);
      s.push(y);
      const w = Hr(y, n, a);
      r.push(...w.length > 0 ? w : Yr(y)), r.push(...zd(y, n));
    }
    const i = Dd(s, n);
    let c = {
      tables: r,
      ...i.length > 0 ? {
        functions: i
      } : {}
    };
    for (const m of s) c = On(m, c, n, a);
    for (const m of s) {
      for (const y of Md(m, c, n)) c.tables.some((w) => cs(w, y)) || c.tables.push(y);
      c.tables.push(...Od(m, c, n)), c.tables.push(...Fd(m, c, n));
    }
    for (const m of s) c = On(m, c, n, a);
    const _ = c.functions ? c : K(c, {
      tables: [],
      functions: i
    }), l = Bd(s, _, n);
    return K(c, {
      tables: [],
      procedures: l
    });
  }
  async function id(e, t) {
    const n = [];
    for await (const r of td()) r.isFile() && n.push(ze.join(r.parentPath, r.name));
    return n;
  }
  async function Br(e, t, n = /* @__PURE__ */ new Set()) {
    const r = ze.resolve(e);
    if (n.has(r)) return "";
    n.add(r);
    const s = await nd(), a = await od(s, t, ze.dirname(r), n);
    return Be(a, t);
  }
  async function od(e, t, n, r) {
    const s = me(t), a = e.replace(/^\uFEFF/, "").split(/\r?\n/), i = [], c = s === "postgresql" ? Ur() : void 0;
    for (const _ of a) {
      if (c && Vr(c, _)) {
        i.push(_);
        continue;
      }
      if (c && !tn(c)) {
        i.push(_);
        continue;
      }
      const l = cd(_, s);
      if (!l) {
        i.push(_);
        continue;
      }
      i.push(await Br(ud(l, n), s, r));
    }
    return i.join(`
`);
  }
  function cd(e, t) {
    const n = e.trim();
    if (t === "oracle") {
      const r = n.match(/^(?:@{1,2}|start\s+)(.+)$/i);
      return r ? Ve(Ue(r[1])) : void 0;
    }
    if (t === "postgresql") {
      const r = n.match(/^\\(?:i|include|ir|include_relative)\s+(.+)$/i);
      return r ? Ve(Ue(r[1])) : void 0;
    }
    if ([
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(t)) {
      const r = n.match(/^(?:source|\\\.)\s+(.+)$/i);
      return r ? Ve(Ue(r[1])) : void 0;
    }
    if (t === "tsql") {
      const r = n.match(/^:r\s+(.+)$/i);
      return r ? Ve(Ue(r[1])) : void 0;
    }
    if (t === "sqlite" || t === "duckdb") {
      const r = n.match(/^\.read\s+(.+)$/i);
      return r ? Ve(Ue(r[1])) : void 0;
    }
  }
  function Ue(e) {
    if (!e) return "";
    const t = e.trim(), n = t.match(/^(['"])(.*?)\1/);
    return n ? n[2] ?? "" : t.split(/\s+/)[0] ?? "";
  }
  function Ve(e) {
    const t = e.trim();
    if (t) return t.replace(/^['"]|['"]$/g, "");
  }
  function ud(e, t) {
    return ze.isAbsolute(e) ? e : ze.resolve(t, e);
  }
  function Pr(e, t = "generic") {
    const n = me(t), r = Be(e, n), s = Hr(r, n);
    return s.length > 0 ? s : Yr(r);
  }
  function Be(e, t) {
    const n = me(t);
    return n === "postgresql" ? ld(e) : n === "oracle" ? bd(e) : [
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(n) ? Ad(e) : n === "tsql" ? kd(e) : n === "sqlite" || n === "duckdb" ? _d(e) : e;
  }
  function _d(e) {
    return e.replace(/^\uFEFF/, "").split(/\r?\n/).filter((t) => !/^\s*\.[A-Za-z]/.test(t)).join(`
`);
  }
  function ld(e) {
    const t = Ur(), n = /* @__PURE__ */ new Map();
    return e.replace(/^\uFEFF/, "").split(/\r?\n/).flatMap((r) => {
      if (Vr(t, r)) return [];
      if (!tn(t)) return [];
      const s = md(r);
      if (s) return n.set(s.name.toLowerCase(), s.value), [];
      const a = dd(r);
      return a ? (n.delete(a.toLowerCase()), []) : /^\s*\\/.test(r) ? [] : [
        pd(r, n)
      ];
    }).join(`
`);
  }
  function Ur() {
    return [];
  }
  function Vr(e, t) {
    var _a2;
    const n = t.trim().match(/^\\(if|elif|else|endif)\b(?:\s+(.*))?$/i);
    if (!n) return false;
    const r = (_a2 = n[1]) == null ? void 0 : _a2.toLowerCase(), s = n[2] ?? "";
    if (r === "if") {
      const i = tn(e), c = i && Rn(s) !== false;
      return e.push({
        parentActive: i,
        active: c,
        matched: c
      }), true;
    }
    const a = e.at(-1);
    if (!a) return true;
    if (r === "elif") {
      const i = a.parentActive && !a.matched && Rn(s) !== false;
      return a.active = i, a.matched = a.matched || i, true;
    }
    if (r === "else") {
      const i = a.parentActive && !a.matched;
      return a.active = i, a.matched = true, true;
    }
    return r === "endif" && e.pop(), true;
  }
  function tn(e) {
    return e.every((t) => t.active);
  }
  function Rn(e) {
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
  function md(e) {
    const t = e.trim().match(/^\\set\s+([A-Za-z_][\w]*)\s*(.*)$/i);
    if (t) return {
      name: t[1] ?? "",
      value: fd(t[2] ?? "")
    };
  }
  function dd(e) {
    var _a2;
    return (_a2 = e.trim().match(/^\\unset\s+([A-Za-z_][\w]*)\b/i)) == null ? void 0 : _a2[1];
  }
  function fd(e) {
    const t = e.trim(), n = t.match(/^(['"])([\s\S]*)\1$/);
    return n ? n[2] ?? "" : t;
  }
  function pd(e, t) {
    return e.replace(new RegExp("(?<!:):'([A-Za-z_][\\w]*)'", "g"), (n, r) => t.get(r.toLowerCase()) ?? n).replace(new RegExp('(?<!:):"([A-Za-z_][\\w]*)"', "g"), (n, r) => gd(t.get(r.toLowerCase())) ?? n).replace(new RegExp("(?<!:):([A-Za-z_][\\w]*)", "g"), (n, r) => t.get(r.toLowerCase()) ?? n);
  }
  function gd(e) {
    if (e !== void 0) return `"${e.replace(/"/g, '""')}"`;
  }
  function bd(e) {
    const t = [];
    let n = [];
    const r = /* @__PURE__ */ new Map();
    let s = true;
    for (const a of e.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const i = a.trim();
      if (i === "/") {
        ft(t, n), n = [];
        continue;
      }
      const c = wd(i);
      if (c !== void 0) {
        s = c;
        continue;
      }
      const _ = hd(i);
      if (_) {
        r.set(_.name.toLowerCase(), _.value);
        continue;
      }
      const l = xd(i);
      if (l) {
        r.delete(l.toLowerCase());
        continue;
      }
      yd(i) || n.push(s ? Cd(a, r) : a);
    }
    return ft(t, n), t.join(`
`);
  }
  function yd(e) {
    return /^(?:set|prompt|spool|whenever|define|undefine|variable|column|remark|rem)\b/i.test(e);
  }
  function wd(e) {
    var _a2;
    const t = e.match(/^set\s+define\s+(on|off)\b/i);
    if (t) return ((_a2 = t[1]) == null ? void 0 : _a2.toLowerCase()) === "on";
  }
  function hd(e) {
    const t = e.match(/^define\s+([A-Za-z_][\w$#]*)\s*(?:=\s*)?(.+)$/i);
    if (t) return {
      name: t[1] ?? "",
      value: vd(t[2] ?? "")
    };
  }
  function xd(e) {
    var _a2;
    return (_a2 = e.match(/^undefine\s+([A-Za-z_][\w$#]*)\b/i)) == null ? void 0 : _a2[1];
  }
  function vd(e) {
    const t = e.trim(), n = t.match(/^(['"])([\s\S]*)\1$/);
    return n ? n[2] ?? "" : t;
  }
  function Cd(e, t) {
    return e.replace(/&&?([A-Za-z_][\w$#]*)(\.)?/g, (n, r, s, a, i) => {
      const c = t.get(r.toLowerCase());
      if (c === void 0) return n;
      const _ = i[a + n.length];
      return s && _ === "." ? c : `${c}${s ?? ""}`;
    }).replace(new RegExp("(?<=\\w)\\.\\.", "g"), ".");
  }
  function Ad(e) {
    const t = [];
    let n = ";", r = "", s;
    for (const a of e.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const i = a.trim().match(/^delimiter\s+(.+)$/i);
      if (i) {
        s = jt(t, r, s), r = "", n = i[1] ?? ";";
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
    return s ? O(s[1].trim()) : (Kr(e, Sd(r, n)), n);
  }
  function Sd(e, t) {
    return t ? e.replace(/^(\s*create\s+(?:(?:or\s+replace|temporary)\s+)*(?:table|view|procedure|function)\s+)(?!if\s+not\s+exists\s+)([`"']?[\w$]+[`"']?)(\s|\()/i, (n, r, s, a) => s.includes(".") ? n : `${r}${Fn(t, s)}${a}`).replace(/^(\s*create\s+(?:(?:or\s+replace|temporary)\s+)*table\s+if\s+not\s+exists\s+)([`"']?[\w$]+[`"']?)(\s|\()/i, (n, r, s, a) => s.includes(".") ? n : `${r}${Fn(t, s)}${a}`) : e;
  }
  function Fn(e, t) {
    const n = O(e), r = t.startsWith("`") ? "`" : t.startsWith('"') ? '"' : t.startsWith("'") ? "'" : "";
    return r ? `${r}${n}${r}.${t}` : `${n}.${t}`;
  }
  function kd(e) {
    const t = [];
    let n = [];
    const r = /* @__PURE__ */ new Map();
    for (const s of e.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const a = Ld(s);
      if (a) {
        r.set(a.name.toLowerCase(), a.value);
        continue;
      }
      if (!/^\s*:[A-Za-z]/.test(s)) {
        if (/^\s*go(?:\s+\d+)?\s*$/i.test(s)) {
          ft(t, n), n = [];
          continue;
        }
        n.push(jd(s, r));
      }
    }
    return ft(t, n), t.join(`
`);
  }
  function Ld(e) {
    const t = e.trim().match(/^:setvar\s+([A-Za-z_][\w]*)\s*(.*)$/i);
    if (t) return {
      name: t[1] ?? "",
      value: Td(t[2] ?? "")
    };
  }
  function Td(e) {
    const t = e.trim(), n = t.match(/^(['"])([\s\S]*)\1$/);
    return n ? n[2] ?? "" : t;
  }
  function jd(e, t) {
    return e.replace(/\$\(([^)]+)\)/g, (n, r) => t.get(r.toLowerCase()) ?? n);
  }
  function ft(e, t) {
    Kr(e, t.join(`
`));
  }
  function Kr(e, t) {
    const n = t.trim();
    n && e.push(n.endsWith(";") ? n : `${n};`);
  }
  function Hr(e, t = "generic", n = /* @__PURE__ */ new Map()) {
    const r = Q(e, t);
    if (!r.success || !Array.isArray(r.ast)) return [];
    const s = [];
    for (const a of r.ast) Jr(a, n), s.push(...qd(a, n));
    return s;
  }
  function qd(e, t = /* @__PURE__ */ new Map()) {
    if (!g(e) || !g(e.create_table) || e.create_table.as_select) return [];
    const n = e.create_table, r = te(n.name);
    if (!r) return [];
    const s = ae(n.name), a = Array.isArray(n.columns) ? n.columns.map((l) => nn(l, t)).filter((l) => l !== null) : [], i = $d(n, a), c = Id(n, a), _ = Nd(n);
    for (const l of a) i.includes(l.name) && (l.primaryKey = true), c.some((m) => m.length === 1 && m[0] === l.name) && (l.unique = true);
    return [
      {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: a,
        ...i.length > 0 ? {
          primaryKey: i
        } : {},
        ...c.length > 0 ? {
          uniqueKeys: c
        } : {
          uniqueKeys: []
        },
        ..._.length > 0 ? {
          foreignKeys: _
        } : {
          foreignKeys: []
        }
      }
    ];
  }
  function nn(e, t = /* @__PURE__ */ new Map()) {
    var _a2;
    if (!g(e)) return null;
    const n = D(e.name);
    if (!n || n.toLowerCase() === "period" && ((_a2 = oe(e.data_type)) == null ? void 0 : _a2.toLowerCase()) === "for system_time") return null;
    const r = e.primary_key === true, s = g(e.data_type) && e.data_type.data_type === "nullable";
    return {
      name: n,
      type: an(e.data_type, t) ?? "unknown",
      nullable: r ? false : s ? true : typeof e.nullable == "boolean" ? e.nullable : void 0,
      primaryKey: r,
      unique: e.unique === true
    };
  }
  function $d(e, t) {
    const n = t.filter((s) => s.primaryKey).map((s) => s.name), r = Array.isArray(e.constraints) ? e.constraints.flatMap((s) => {
      const a = g(s) ? s.PrimaryKey : void 0;
      return g(a) && Array.isArray(a.columns) ? a.columns.map(D).filter((i) => !!i) : [];
    }) : [];
    return [
      .../* @__PURE__ */ new Set([
        ...n,
        ...r
      ])
    ];
  }
  function Id(e, t) {
    const n = t.filter((s) => s.unique).map((s) => [
      s.name
    ]), r = Array.isArray(e.constraints) ? e.constraints.flatMap((s) => {
      const a = g(s) ? s.Unique : void 0;
      return g(a) && Array.isArray(a.columns) ? [
        a.columns.map(D).filter((i) => !!i)
      ] : [];
    }) : [];
    return [
      ...n,
      ...r
    ].filter((s) => s.length > 0);
  }
  function Nd(e) {
    return Array.isArray(e.constraints) ? e.constraints.flatMap((t) => {
      const n = g(t) ? t.ForeignKey : void 0;
      if (!g(n)) return [];
      const r = g(n.references) ? n.references : {};
      return [
        {
          columns: Array.isArray(n.columns) ? n.columns.map(D).filter(Boolean) : [],
          references: {
            table: te(r.table),
            columns: Array.isArray(r.columns) ? r.columns.map(D).filter(Boolean) : [],
            ...ae(r.table) ? {
              schema: ae(r.table)
            } : {}
          }
        }
      ];
    }) : [];
  }
  function Jr(e, t) {
    if (!g(e) || !g(e.create_type)) return;
    const n = te(e.create_type.name), r = Ed(e.create_type.definition);
    n && r && t.set(n.toLowerCase(), r);
  }
  function Ed(e) {
    if (!g(e)) return;
    const t = g(e.Domain) ? e.Domain : void 0;
    if (t) return oe(t.base_type);
    if (Array.isArray(e.Enum)) return "text";
    if (Array.isArray(e.Composite)) return `struct<${e.Composite.flatMap((r) => {
      if (!g(r)) return [];
      const s = D(r.name), a = oe(r.data_type) ?? "unknown";
      return s ? [
        `${s} ${a}`
      ] : [];
    }).join(", ")}>`;
  }
  function Rd(e) {
    var _a2;
    if (!g(e) || !g(e.create_function)) return [];
    const t = e.create_function, n = te(t.name);
    if (!n) return [];
    const s = (_a2 = typeof t.returns_table_body == "string" ? t.returns_table_body : void 0) == null ? void 0 : _a2.match(/^table\s*\(([\s\S]*)\)$/i), a = Wr(s == null ? void 0 : s[1]);
    if (a.length === 0) return [];
    const i = ae(t.name);
    return [
      {
        name: n,
        ...i ? {
          schema: i
        } : {},
        columns: a,
        uniqueKeys: [],
        foreignKeys: []
      }
    ];
  }
  function Wr(e) {
    return e ? ie(e, ",").flatMap((t) => {
      const n = t.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
      if (!n) return [];
      const r = O(n[1]), s = Xr(n[2]) ?? "unknown";
      return r ? [
        {
          name: r,
          type: s
        }
      ] : [];
    }) : [];
  }
  function Yr(e) {
    const t = [];
    for (const n of Mf(e)) {
      const r = O(n.name), s = r.split("."), a = s.pop() ?? r, i = s.length > 0 ? s.join(".") : void 0, c = zf(n.body), _ = c.filter((l) => l.primaryKey).map((l) => l.name);
      t.push({
        name: a,
        ...i ? {
          schema: i
        } : {},
        columns: c,
        ..._.length > 0 ? {
          primaryKey: _
        } : {},
        uniqueKeys: [],
        foreignKeys: []
      });
    }
    return t;
  }
  function Fd(e, t = {
    tables: []
  }, n = "generic") {
    const r = me(n), s = Be(e, r), a = Q(s, r);
    if (!a.success || !Array.isArray(a.ast)) return Dn(s, t, r);
    const i = es(s, t, r) ?? a.ast;
    return ts([
      ...i.flatMap((c) => _f(c, t)),
      ...Dn(s, t, r)
    ]);
  }
  function Md(e, t = {
    tables: []
  }, n = "generic") {
    const r = me(n), s = Be(e, r), a = Q(s, r);
    if (!a.success || !Array.isArray(a.ast)) return Bn(s, t, r);
    const i = es(s, t, r) ?? a.ast;
    return ts([
      ...i.flatMap((c) => sf(c, t)),
      ...Bn(s, t, r)
    ]);
  }
  function Od(e, t = {
    tables: []
  }, n = "generic") {
    const r = me(n), s = Be(e, r), a = Q(s, r);
    return !a.success || !Array.isArray(a.ast) ? [] : a.ast.flatMap((i) => cf(i, t));
  }
  function zd(e, t = "generic") {
    const n = me(t), r = Be(e, n), s = Q(r, n);
    return !s.success || !Array.isArray(s.ast) ? [] : s.ast.flatMap(Rd);
  }
  function Dd(e, t) {
    const n = /* @__PURE__ */ new Map();
    for (const r of e) {
      const s = Q(r, t);
      if (!(!s.success || !Array.isArray(s.ast))) for (const a of s.ast) {
        for (const c of Kd(a)) n.set(rn(c), c);
        const i = Qr(a, "drop_function");
        i && n.delete(i);
      }
    }
    return [
      ...n.values()
    ];
  }
  function Bd(e, t, n) {
    const r = /* @__PURE__ */ new Map();
    for (const s of e) {
      const a = Q(s, n);
      if (!(!a.success || !Array.isArray(a.ast))) for (const i of a.ast) {
        for (const _ of Pd(i, t, n)) r.set(rn(_), _);
        const c = Qr(i, "drop_procedure");
        c && r.delete(c);
      }
    }
    return [
      ...r.values()
    ];
  }
  function Qr(e, t) {
    if (!g(e) || !g(e[t])) return;
    const n = te(e[t].name);
    if (!n) return;
    const r = ae(e[t].name);
    return rn({
      name: n,
      ...r ? {
        schema: r
      } : {}
    });
  }
  function rn(e) {
    return `${e.schema ?? ""}.${e.name}`.toLowerCase();
  }
  function Pd(e, t, n) {
    if (!g(e) || !g(e.create_procedure)) return [];
    const r = e.create_procedure, s = te(r.name);
    if (!s) return [];
    const a = Ud(r, t, n);
    if (a.length === 0) return [];
    const i = ae(r.name);
    return [
      {
        name: s,
        ...i ? {
          schema: i
        } : {},
        columns: a
      }
    ];
  }
  function Ud(e, t, n) {
    const r = Vd(e.return_type);
    if (r.length > 0) return r;
    const s = g(e.body) ? e.body : void 0;
    if (s && g(s.Expression)) {
      const i = Gr(s.Expression);
      return g(i) && i.literal_type === "dollar_string" && typeof i.value == "string" ? Mn(i.value, t, n) : Ae(s.Expression, t);
    }
    const a = s && typeof s.RawBlock == "string" ? s.RawBlock : void 0;
    return a ? Mn(a, t, n) : [];
  }
  function Vd(e) {
    var _a2;
    if (!g(e)) return [];
    const n = (_a2 = e.data_type === "custom" && typeof e.name == "string" ? e.name : void 0) == null ? void 0 : _a2.match(/^table\s*\(([\s\S]*)\)$/i);
    return Wr(n == null ? void 0 : n[1]);
  }
  function Mn(e, t, n) {
    const r = e.trim().replace(/^begin\b/i, "").replace(/\bend\s*$/i, "").trim();
    if (!/\bselect\b/i.test(r)) return [];
    const s = Q(r, n);
    if (!s.success || !Array.isArray(s.ast)) return [];
    for (const a of s.ast) {
      const i = Ae(a, t);
      if (i.length > 0) return i;
    }
    return [];
  }
  function Gr(e) {
    if (g(e)) {
      if (g(e.literal)) return e.literal;
      for (const t of Object.values(e)) {
        const n = Gr(t);
        if (n) return n;
      }
    }
  }
  function Kd(e) {
    if (!g(e) || !g(e.create_function)) return [];
    const t = e.create_function, n = te(t.name), r = oe(t.return_type);
    if (!n || !r) return [];
    const s = ae(t.name);
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
  function On(e, t, n = "generic", r = /* @__PURE__ */ new Map()) {
    const s = me(n), a = Q(e, s);
    return !a.success || !Array.isArray(a.ast) ? t : a.ast.reduce((i, c) => g(c) ? (Jr(c, r), g(c.alter_table) ? Wd(c.alter_table, i, r) : g(c.drop_table) ? Hd(c.drop_table, i) : g(c.drop_view) ? Zr(i, [
      c.drop_view.name
    ]) : g(c.drop_schema) ? qt(c.drop_schema, i) : g(c.drop_database) ? qt(c.drop_database, i) : g(c.drop_namespace) ? qt(c.drop_namespace, i) : g(c.raw) ? Jd(c.raw, i) : i) : i, t);
  }
  function Hd(e, t) {
    const n = Array.isArray(e.names) ? e.names : [];
    return Zr(t, n);
  }
  function qt(e, t) {
    const n = D(e.name);
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
  function Jd(e, t) {
    const r = (typeof e.sql == "string" ? e.sql : "").match(/^alter\s+(?:schema|database)\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
    if (r) {
      const s = O(r[1].trim()), a = O(r[2].trim());
      return !s || !a ? t : {
        tables: t.tables.map((i) => {
          var _a2;
          return ((_a2 = i.schema) == null ? void 0 : _a2.toLowerCase()) === s.toLowerCase() ? {
            ...i,
            schema: a
          } : i;
        }),
        ...t.functions ? {
          functions: t.functions.map((i) => {
            var _a2;
            return ((_a2 = i.schema) == null ? void 0 : _a2.toLowerCase()) === s.toLowerCase() ? {
              ...i,
              schema: a
            } : i;
          })
        } : {},
        ...t.procedures ? {
          procedures: t.procedures.map((i) => {
            var _a2;
            return ((_a2 = i.schema) == null ? void 0 : _a2.toLowerCase()) === s.toLowerCase() ? {
              ...i,
              schema: a
            } : i;
          })
        } : {}
      };
    }
    return t;
  }
  function Zr(e, t) {
    const n = t.flatMap((r) => {
      const s = te(r), a = g(r) ? ae(r) : void 0;
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
  function Wd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = te(e.name);
    if (!r || !Array.isArray(e.actions)) return t;
    const s = ae(e.name);
    return {
      tables: t.tables.map((a) => {
        var _a2;
        return a.name.toLowerCase() !== r.toLowerCase() || s && ((_a2 = a.schema) == null ? void 0 : _a2.toLowerCase()) !== s.toLowerCase() ? a : Yd(a, e.actions, n);
      })
    };
  }
  function Yd(e, t, n = /* @__PURE__ */ new Map()) {
    return t.reduce((r, s) => g(s) ? g(s.RenameTable) ? Qd(r, s.RenameTable) : g(s.AddColumn) ? Gd(r, s.AddColumn.column, n) : g(s.DropColumn) ? Zd(r, s.DropColumn.name) : g(s.RenameColumn) ? Xd(r, s.RenameColumn.old_name, s.RenameColumn.new_name) : g(s.ChangeColumn) ? ef(r, s.ChangeColumn, n) : g(s.AlterColumn) ? tf(r, s.AlterColumn, n) : g(s.AddConstraint) ? nf(r, s.AddConstraint) : g(s.Raw) ? rf(r, s.Raw, n) : r : r, {
      ...e,
      columns: [
        ...e.columns
      ]
    });
  }
  function Qd(e, t) {
    const n = te(t), r = ae(t);
    return n ? {
      ...e,
      name: n,
      ...r ? {
        schema: r
      } : {}
    } : e;
  }
  function Gd(e, t, n = /* @__PURE__ */ new Map()) {
    const r = nn(t, n);
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
  function Zd(e, t) {
    const n = D(t);
    return n ? {
      ...e,
      columns: e.columns.filter((r) => r.name.toLowerCase() !== n.toLowerCase())
    } : e;
  }
  function Xd(e, t, n) {
    const r = D(t), s = D(n);
    return !r || !s ? e : {
      ...e,
      columns: e.columns.map((a) => a.name.toLowerCase() === r.toLowerCase() ? {
        ...a,
        name: s
      } : a)
    };
  }
  function ef(e, t, n = /* @__PURE__ */ new Map()) {
    const r = D(t.old_name), s = D(t.new_name);
    if (!r || !s) return e;
    const a = an(t.data_type, n);
    return {
      ...e,
      columns: e.columns.map((i) => i.name.toLowerCase() === r.toLowerCase() ? {
        ...i,
        name: s,
        ...a ? {
          type: a
        } : {}
      } : i)
    };
  }
  function tf(e, t, n = /* @__PURE__ */ new Map()) {
    const r = D(t.name);
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
          const i = an(s.SetDataType.data_type, n);
          return i ? {
            ...a,
            type: i
          } : a;
        }
        return a;
      })
    };
  }
  function nf(e, t) {
    if (g(t.PrimaryKey)) {
      const n = zn(t.PrimaryKey);
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
      const n = zn(t.Index);
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
  function zn(e) {
    return Array.isArray(e.columns) ? e.columns.map(D).filter((t) => !!t) : [];
  }
  function rf(e, t, n = /* @__PURE__ */ new Map()) {
    const r = typeof t.sql == "string" ? t.sql : "", s = r.match(/^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i);
    if (s) {
      const i = O(s[1]), c = Xr(s[2], n);
      return {
        ...e,
        columns: e.columns.map((_) => _.name.toLowerCase() === i.toLowerCase() ? {
          ..._,
          ...c ? {
            type: c
          } : {}
        } : _)
      };
    }
    const a = r.match(/^set\s+schema\s+(.+)$/i);
    return a ? {
      ...e,
      schema: O(a[1].trim())
    } : e;
  }
  function Xr(e, t = /* @__PURE__ */ new Map()) {
    const n = e.trim().split(/\s+/)[0];
    if (!n) return;
    const r = pe(O(n));
    return t.get(r.toLowerCase()) ?? r;
  }
  function sf(e, t) {
    if (!g(e) || !g(e.create_table)) return [];
    const n = e.create_table, r = te(n.name);
    if (!r) return [];
    const s = ae(n.name);
    if (!n.as_select) {
      const i = af(n, t), c = Array.isArray(n.columns) ? n.columns.map((_) => nn(_)).filter((_) => _ !== null) : [];
      return i ? [
        {
          name: r,
          ...s ? {
            schema: s
          } : {},
          columns: of(i, c)
        }
      ] : [];
    }
    const a = Array.isArray(n.columns) ? n.columns : [];
    if (a.length > 0) {
      const i = a.some((c) => g(c) && !!oe(c.data_type));
      return n.as_select && !i ? [
        {
          name: r,
          ...s ? {
            schema: s
          } : {},
          columns: Ae(n.as_select, t, a)
        }
      ] : [
        {
          name: r,
          ...s ? {
            schema: s
          } : {},
          columns: a.map((c) => ({
            name: D(c) ?? "column",
            type: oe(g(c) ? c.data_type : void 0) ?? "unknown",
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
        columns: Ae(n.as_select, t)
      }
    ];
  }
  function af(e, t) {
    var _a2, _b2;
    const n = g(e.clone_source) ? e.clone_source : uf(e);
    if (!n) return;
    const r = (_a2 = te(n)) == null ? void 0 : _a2.toLowerCase(), s = (_b2 = ae(n)) == null ? void 0 : _b2.toLowerCase();
    if (!r) return;
    const a = t.tables.find((i) => {
      var _a3;
      return !(i.name.toLowerCase() !== r || s && ((_a3 = i.schema) == null ? void 0 : _a3.toLowerCase()) !== s);
    });
    return a ? a.columns.map((i) => ({
      ...i
    })) : void 0;
  }
  function of(e, t) {
    const n = e.map((r) => ({
      ...r
    }));
    for (const r of t) {
      const s = n.findIndex((a) => a.name.toLowerCase() === r.name.toLowerCase());
      s >= 0 ? n[s] = r : n.push(r);
    }
    return n;
  }
  function cf(e, t) {
    if (!g(e) || !g(e.create_synonym)) return [];
    const n = e.create_synonym, r = te(n.name), s = te(n.target);
    if (!r || !s) return [];
    const a = ae(n.name), i = ae(n.target), c = t.tables.find((_) => !(_.name.toLowerCase() !== s.toLowerCase() || i && _.schema && _.schema.toLowerCase() !== i.toLowerCase()));
    return c ? [
      {
        name: r,
        ...a ? {
          schema: a
        } : {},
        columns: c.columns.map((_) => ({
          ..._
        })),
        ...c.primaryKey ? {
          primaryKey: [
            ...c.primaryKey
          ]
        } : {},
        ...c.uniqueKeys ? {
          uniqueKeys: c.uniqueKeys.map((_) => [
            ..._
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
  function uf(e) {
    if (Array.isArray(e.constraints)) for (const t of e.constraints) {
      const n = g(t) && g(t.Like) ? t.Like : void 0;
      if (n && g(n.source)) return n.source;
    }
  }
  function es(e, t, n) {
    try {
      const r = Ir(e, n, Ff(t));
      return r.success ? r.ast : void 0;
    } catch {
      return;
    }
  }
  function _f(e, t) {
    if (!g(e) || !g(e.create_view)) return [];
    const n = e.create_view, r = te(n.name);
    if (!r) return [];
    const s = ae(n.name), a = mf(n), i = Ae(n.query, t, a);
    return [
      {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: i
      }
    ];
  }
  function Dn(e, t, n) {
    return os(e, "view").flatMap((r) => {
      const s = Q(r.valuesSql, n);
      if (!s.success || !Array.isArray(s.ast)) return [];
      const a = s.ast.find(g);
      if (!a) return [];
      const i = O(r.name), c = i.split("."), _ = c.pop() ?? i, l = c.length > 0 ? c.join(".") : void 0;
      return [
        {
          name: _,
          ...l ? {
            schema: l
          } : {},
          columns: Ae(a, t, r.columns)
        }
      ];
    });
  }
  function Bn(e, t, n) {
    return os(e, "table").flatMap((r) => {
      const s = Q(r.valuesSql, n);
      if (!s.success || !Array.isArray(s.ast)) return [];
      const a = s.ast.find(g);
      if (!a) return [];
      const i = O(r.name), c = i.split("."), _ = c.pop() ?? i, l = c.length > 0 ? c.join(".") : void 0;
      return [
        {
          name: _,
          ...l ? {
            schema: l
          } : {},
          columns: Ae(a, t, r.columns)
        }
      ];
    });
  }
  function ts(e) {
    return e.filter((t, n) => !e.slice(0, n).some((r) => cs(r, t)));
  }
  function Ae(e, t, n = []) {
    const r = {
      tables: vf(e, t)
    }, s = {
      tables: bf(e, K(r, t))
    }, a = K(s, r, t), i = ut(e), c = Fe(e), _ = _t(e), l = pf(c);
    return i.flatMap((m, y) => {
      const w = g(m) ? m.star : void 0;
      if (g(w)) return lf(ff(w, a, _, c, l), n, y);
      const S = O(sn(n[y]) ?? Cf(m, y + 1)), N = Af(m);
      return [
        {
          name: S,
          type: df(N, a) ?? Te(N, a, _) ?? "unknown",
          nullable: Rf(N, a, _, l)
        }
      ];
    });
  }
  function lf(e, t, n = 0) {
    return t.length === 0 ? e : e.map((r, s) => ({
      ...r,
      name: O(sn(t[n + s]) ?? r.name)
    }));
  }
  function mf(e) {
    return Array.isArray(e.columns) && e.columns.length > 0 ? e.columns : g(e.schema) && Array.isArray(e.schema.expressions) ? e.schema.expressions : [];
  }
  function sn(e) {
    return g(e) && g(e.column_def) ? sn(e.column_def) : g(e) ? D(e.name) ?? D(e) : D(e);
  }
  function df(e, t) {
    var _a2, _b2;
    const n = ns(e);
    if (!n) return;
    const r = typeof n.name == "string" ? n.name : D(n.name);
    if (!r) return;
    const s = r.toLowerCase();
    return (_b2 = (_a2 = t.functions) == null ? void 0 : _a2.find((a) => a.name.toLowerCase() === s ? true : a.schema ? `${a.schema}.${a.name}`.toLowerCase() === s : false)) == null ? void 0 : _b2.returnType;
  }
  function ns(e) {
    if (g(e)) {
      if (g(e.function)) return e.function;
      for (const t of Object.values(e)) {
        const n = ns(t);
        if (n) return n;
      }
    }
  }
  function ff(e, t, n, r, s = /* @__PURE__ */ new Set()) {
    var _a2;
    const a = (_a2 = D(e.table)) == null ? void 0 : _a2.toLowerCase(), i = a ? /* @__PURE__ */ new Map() : gf(r, t);
    return t.tables.filter((_) => a ? _.name.toLowerCase() === a : n.length === 0 ? true : n.map((l) => l.toLowerCase()).includes(_.name.toLowerCase())).flatMap((_) => _.columns.filter((l) => {
      var _a3;
      return !((_a3 = i.get(_.name.toLowerCase())) == null ? void 0 : _a3.has(l.name.toLowerCase()));
    }).map((l) => ({
      ...l,
      nullable: s.has(_.name.toLowerCase()) ? true : l.nullable
    })));
  }
  function pf(e) {
    const t = /* @__PURE__ */ new Set();
    if (!e || !Array.isArray(e.joins)) return t;
    const n = ht({
      ...e,
      joins: []
    }).map(We).filter((r) => !!r);
    for (const r of e.joins) {
      if (!g(r) || !g(r.this)) continue;
      const s = String(r.kind ?? ""), a = We(r.this);
      if ((s === "Left" || s === "Full") && a && t.add(a.toLowerCase()), s === "Right" || s === "Full") for (const i of n) t.add(i.toLowerCase());
    }
    return t;
  }
  function gf(e, t) {
    var _a2;
    const n = /* @__PURE__ */ new Map();
    if (!e || !Array.isArray(e.joins)) return n;
    const r = ht({
      ...e,
      joins: []
    }).map(We).filter((a) => !!a), s = new Set(t.tables.filter((a) => r.map((i) => i.toLowerCase()).includes(a.name.toLowerCase())).flatMap((a) => a.columns.map((i) => i.name.toLowerCase())));
    for (const a of e.joins) {
      if (!g(a) || !g(a.this)) continue;
      const i = We(a.this);
      if (!i) continue;
      const c = Array.isArray(a.using) ? a.using.map(D).filter((m) => !!m) : [], _ = a.kind === "Natural" ? ((_a2 = t.tables.find((m) => m.name.toLowerCase() === i.toLowerCase())) == null ? void 0 : _a2.columns.map((m) => m.name).filter((m) => s.has(m.toLowerCase()))) ?? [] : [], l = [
        ...c,
        ..._
      ].map((m) => m.toLowerCase());
      l.length > 0 && n.set(i.toLowerCase(), new Set(l));
    }
    return n;
  }
  function bf(e, t) {
    const n = Fe(e);
    return ht(n).flatMap((s) => yf(s, t));
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
  function yf(e, t) {
    const n = g(e.subquery) ? e.subquery : void 0;
    if (n) {
      const s = D(n.alias);
      if (!s) return [];
      const a = Array.isArray(n.column_aliases) ? n.column_aliases : [];
      return [
        {
          name: s,
          columns: Ae(n.this, t, a)
        }
      ];
    }
    const r = g(e.alias) ? e.alias : void 0;
    if (r && g(r.this) && g(r.this.function)) {
      const s = D(r.alias);
      if (!s) return [];
      const a = wf(r.this, s);
      if (a) return [
        a
      ];
      const i = Array.isArray(r.column_aliases) ? r.column_aliases.map(D).filter((_) => !!_) : [];
      if (i.length === 0) return [];
      const c = hf(r.this, t);
      return [
        {
          name: s,
          columns: i.map((_, l) => ({
            name: _,
            type: c[l] ?? c[0] ?? "unknown"
          }))
        }
      ];
    }
    return [];
  }
  function wf(e, t) {
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
  function hf(e, t) {
    const n = g(e) ? e.function : void 0;
    if (!g(n)) return [];
    const r = String(n.name ?? "").toLowerCase();
    if (r === "generate_series" || r === "range") {
      const s = xf(rs(n), t);
      return s && /date|time|timestamp/i.test(s) ? [
        s
      ] : [
        "integer"
      ];
    }
    return [];
  }
  function rs(e) {
    return Array.isArray(e.args) ? e.args : [];
  }
  function xf(e, t) {
    const n = e.map((r) => Te(r, t, [])).filter((r) => !!r);
    if (n.length !== 0) return n.some((r) => /text|char|string/i.test(r)) ? "text" : n.some((r) => /timestamp/i.test(r)) ? "timestamp" : n.some((r) => /^date$/i.test(r)) ? "date" : n.some((r) => /decimal|numeric|double|float|real/i.test(r)) ? "decimal" : n.some((r) => /int|number|bigint|smallint/i.test(r)) ? "integer" : n[0];
  }
  function Te(e, t, n) {
    return kf(e) ?? Sf(e) ?? Ef(e, t, n) ?? Tf(e) ?? ss(e, t, n) ?? If(e, t, n) ?? Nf(e, t, n) ?? jf(e, t, n) ?? qf(e, t, n) ?? $f(e, t, n);
  }
  function vf(e, t) {
    const n = Fe(e), r = g(n == null ? void 0 : n.with) && Array.isArray(n.with.ctes) ? n.with.ctes : [], s = [];
    for (const a of r) {
      if (!g(a)) continue;
      const i = D(a.alias);
      if (!i) continue;
      const c = K({
        tables: s
      }, t);
      s.push({
        name: i,
        columns: Ae(a.this, c, Array.isArray(a.columns) ? a.columns : [])
      });
    }
    return s;
  }
  function Fe(e) {
    return g(e) && g(e.union) ? Fe(e.union.left) : g(e) && g(e.intersect) ? Fe(e.intersect.left) : g(e) && g(e.except) ? Fe(e.except.left) : g(e) && g(e.select) ? e.select : void 0;
  }
  function ut(e) {
    if (g(e) && g(e.union)) return ut(e.union.left);
    if (g(e) && g(e.intersect)) return ut(e.intersect.left);
    if (g(e) && g(e.except)) return ut(e.except.left);
    if (g(e) && g(e.values)) {
      const r = (Array.isArray(e.values.expressions) ? e.values.expressions : []).find(g);
      return g(r) && Array.isArray(r.expressions) ? r.expressions : [];
    }
    const t = g(e) ? e.select : void 0;
    return g(t) && Array.isArray(t.expressions) ? t.expressions : [];
  }
  function _t(e) {
    if (g(e) && g(e.union)) return _t(e.union.left);
    if (g(e) && g(e.intersect)) return _t(e.intersect.left);
    if (g(e) && g(e.except)) return _t(e.except.left);
    const t = g(e) ? e.select : void 0;
    return ht(g(t) ? t : void 0).map(We).filter((n) => !!n);
  }
  function We(e) {
    if (g(e.table)) return te(e.table);
    if (g(e.subquery)) return D(e.subquery.alias);
    if (g(e.alias)) return D(e.alias.alias);
  }
  function Cf(e, t) {
    const n = g(e) ? e.alias : void 0;
    if (g(n)) return D(n.alias) ?? `column_${t}`;
    const r = g(e) ? e.column : void 0;
    return g(r) ? D(r.name) ?? `column_${t}` : `column_${t}`;
  }
  function Af(e) {
    const t = g(e) ? e.alias : void 0;
    return g(t) && g(t.this) ? t.this : g(e) && g(e.this) && g(e.alias) ? e.this : e;
  }
  function Sf(e) {
    try {
      const t = Zt.getInferredType(e);
      if (!g(t)) return;
      const n = t.data_type ?? t.type ?? t.name;
      return typeof n == "string" ? pe(n) : void 0;
    } catch {
      return;
    }
  }
  function kf(e) {
    const t = g(e) ? e.cast ?? e.try_cast ?? e.safe_cast : void 0;
    return g(t) ? oe(t.to) : void 0;
  }
  function oe(e) {
    if (!g(e)) return;
    if (e.data_type === "nullable" || e.data_type === "low_cardinality") return oe(e.inner) ?? oe(e.value) ?? "unknown";
    if (e.data_type === "struct" && Array.isArray(e.fields)) return `struct<${e.fields.flatMap((r) => {
      if (!g(r)) return [];
      const s = D(r.name), a = oe(r.data_type) ?? "unknown";
      return s ? [
        `${s} ${a}`
      ] : [];
    }).join(", ")}>`;
    if (e.data_type === "array") return `array<${oe(e.element_type) ?? "unknown"}>`;
    if (e.data_type === "map") return `map<${oe(e.key_type) ?? "unknown"}, ${oe(e.value_type) ?? "unknown"}>`;
    const t = e.data_type === "custom" && typeof e.name == "string" ? e.name : e.data_type ?? e.type ?? e.name;
    if (t === "timestamp" && e.timezone === true) return "timestamptz";
    if (typeof t == "string") {
      const n = t.toLowerCase().replace(/\s+/g, "");
      if (typeof e.length == "number" && [
        "char",
        "character",
        "varchar",
        "var_char",
        "varchar2",
        "nvarchar",
        "nvarchar2",
        "nchar",
        "raw",
        "binary",
        "varbinary"
      ].includes(n)) return `${n === "var_char" ? "varchar" : n}(${e.length})`;
      if (typeof e.precision == "number" && [
        "decimal",
        "dec",
        "numeric",
        "number",
        "timestamp",
        "time",
        "datetime2"
      ].includes(n)) return `${n}(${e.precision}${typeof e.scale == "number" ? `,${e.scale}` : ""})`;
    }
    return typeof t == "string" ? pe(t) : void 0;
  }
  function an(e, t) {
    const n = oe(e);
    if (n) return t.get(n.toLowerCase()) ?? n;
  }
  function pe(e) {
    const t = e.trim().toLowerCase().replace(/\s+/g, " "), n = Lf(t);
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
    ].includes(s) ? "bytes" : s === "json_b" ? "jsonb" : s === "datetime2" ? "datetime2" : s === "timestamptz" || s === "timestampwithtimezone" ? "timestamptz" : s === "timestampntz" || s === "timestampltz" || s.startsWith("timestamp") ? "timestamp" : s === "array" ? "array<variant>" : s === "uniqueidentifier" ? "uuid" : [
      "variant",
      "object",
      "json",
      "jsonb",
      "date",
      "time",
      "datetime",
      "datetime2",
      "interval",
      "uuid",
      "geography",
      "geometry"
    ].includes(s) ? s : r;
  }
  function Lf(e) {
    const t = /^([a-z_][\w\s]*)\s*\(([\s\S]*)\)$/i.exec(e.trim());
    if (!t) return;
    const n = t[1].replace(/\s+/g, "").toLowerCase(), r = ie(t[2], ",");
    if (n === "nullable" || n === "lowcardinality") return r[0] ? pe(r[0]) : "unknown";
    if ([
      "char",
      "character",
      "varchar",
      "varchar2",
      "nvarchar",
      "nvarchar2",
      "nchar",
      "raw",
      "binary",
      "varbinary",
      "decimal",
      "dec",
      "numeric",
      "number",
      "datetime2",
      "datetimeoffset",
      "time",
      "timestamp"
    ].includes(n)) return `${n}(${r.map((s) => s.trim()).join(",")})`;
    if (n === "array" || n === "list") return `array<${r[0] ? pe(r[0]) : "unknown"}>`;
    if (n === "map" && r.length >= 2) return `map<${pe(r[0])}, ${pe(r[1])}>`;
    if (n === "tuple" || n === "row") return `struct<${r.map((a, i) => {
      const c = Pn(a, i);
      return `${c.name} ${c.type}`;
    }).join(", ")}>`;
    if (n === "nested") return `array<struct<${r.map((a, i) => {
      const c = Pn(a, i);
      return `${c.name} ${c.type}`;
    }).join(", ")}>>`;
  }
  function Pn(e, t) {
    const n = e.trim(), r = /^("[^"]+"|`[^`]+`|\[[^\]]+\]|[a-z_][\w$]*)\s+([\s\S]+)$/i.exec(n);
    return r ? {
      name: O(r[1]),
      type: pe(r[2])
    } : {
      name: `field_${t + 1}`,
      type: pe(n)
    };
  }
  function Tf(e) {
    if (g(e) && g(e.boolean)) return "boolean";
    const t = g(e) ? e.literal : void 0;
    if (!g(t)) return;
    const n = String(t.literal_type ?? ""), r = String(t.value ?? "");
    if (n === "string") return "text";
    if (n === "number") return r.includes(".") ? "decimal" : "integer";
    if (n === "boolean") return "boolean";
  }
  function jf(e, t, n) {
    const r = g(e) ? e.coalesce : void 0;
    if (!(!g(r) || !Array.isArray(r.expressions))) return on(r.expressions, t, n);
  }
  function qf(e, t, n) {
    const r = g(e) ? e.case : void 0;
    if (!g(r)) return;
    const s = Array.isArray(r.whens) ? r.whens.flatMap((a) => Array.isArray(a) ? a[1] : []) : [];
    return on([
      ...s,
      r.else_
    ].filter(Boolean), t, n);
  }
  function $f(e, t, n) {
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
        const a = Te(s.left, t, n), i = Te(s.right, t, n);
        return as([
          a,
          i
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
  function ss(e, t, n) {
    if (g(e)) {
      if (g(e.count)) return "integer";
      for (const r of [
        "sum",
        "min",
        "max",
        "median"
      ]) {
        const s = e[r];
        if (g(s)) return Te(s.this, t, n);
      }
      if (g(e.avg)) return "decimal";
    }
  }
  function If(e, t, n) {
    const r = g(e) ? e.window_function : void 0, s = g(r) ? r.this : void 0;
    if (!g(s)) return;
    if (Object.prototype.hasOwnProperty.call(s, "row_number") || Object.prototype.hasOwnProperty.call(s, "rank") || Object.prototype.hasOwnProperty.call(s, "dense_rank")) return "integer";
    const a = s.first_value ?? s.last_value ?? s.lag ?? s.lead;
    return a ? Te(a, t, n) : ss(s, t, n);
  }
  function Nf(e, t, n) {
    if (!g(e)) return;
    for (const [a, i] of [
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
      if (g(c)) return i ?? Te(c.this, t, n);
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
    ].includes(s)) return on(rs(r), t, n);
  }
  function on(e, t, n) {
    return as(e.map((r) => Te(r, t, n)).filter((r) => !!r));
  }
  function as(e) {
    if (e.length !== 0) return e.some((t) => /text|char|string/i.test(t)) ? "text" : e.some((t) => /timestamp/i.test(t)) ? "timestamp" : e.some((t) => /^date$/i.test(t)) ? "date" : e.some((t) => /decimal|numeric|double|float|real/i.test(t)) ? "decimal" : e.some((t) => /bigint/i.test(t)) ? "bigint" : e.some((t) => /int|number|smallint/i.test(t)) ? "integer" : e.every((t) => t === "boolean") ? "boolean" : e[0];
  }
  function Ef(e, t, n) {
    var _a2;
    return (_a2 = is(e, t, n)) == null ? void 0 : _a2.column.type;
  }
  function Rf(e, t, n, r = /* @__PURE__ */ new Set()) {
    const s = is(e, t, n);
    if (s) return r.has(s.table.name.toLowerCase()) ? true : s.column.nullable;
  }
  function is(e, t, n) {
    var _a2, _b2;
    const r = g(e) ? e.column : void 0;
    if (!g(r)) return;
    const s = (_a2 = D(r.name)) == null ? void 0 : _a2.toLowerCase(), a = (_b2 = D(r.table)) == null ? void 0 : _b2.toLowerCase();
    if (s) for (const i of t.tables) {
      if (a && i.name.toLowerCase() !== a || !a && n.length > 0 && !n.map((_) => _.toLowerCase()).includes(i.name.toLowerCase())) continue;
      const c = i.columns.find((_) => _.name.toLowerCase() === s);
      if (c) return {
        table: i,
        column: c
      };
    }
  }
  function te(e) {
    if (!g(e)) return;
    const t = g(e.name) ? e.name.name : e.name;
    return typeof t == "string" ? O(t) : void 0;
  }
  function ae(e) {
    if (g(e)) return D(e.schema);
  }
  function D(e) {
    if (e) {
      if (typeof e == "string") return O(e);
      if (g(e) && typeof e.name == "string") return O(e.name);
      if (g(e) && g(e.name)) return D(e.name);
    }
  }
  function g(e) {
    return typeof e == "object" && e !== null;
  }
  function Ff(e) {
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
  function Mf(e) {
    const t = [], n = /create\s+(?:(?:global\s+)?temporary\s+|(?:global\s+)?temp\s+)?table\s+(?:if\s+not\s+exists\s+)?([`"[\]\w.]+)\s*\(/gi;
    for (const r of e.matchAll(n)) {
      const s = (r.index ?? 0) + r[0].length, a = Of(e, s - 1);
      a > s && t.push({
        name: r[1],
        body: e.slice(s, a)
      });
    }
    return t;
  }
  function os(e, t) {
    var _a2;
    const n = [], r = new RegExp(`create\\s+(?:(?:or\\s+replace|temporary|temp)\\s+)*${t}\\s+(?:if\\s+not\\s+exists\\s+)?([\`"\\[\\]\\w.]+)\\s*(?:\\(([^)]*)\\))?\\s+as\\s+(values\\s+(?:[^;'"\\\`]|'[^']*'|"[^"]*"|\`[^\`]*\`)+)(?=;|$)`, "gi");
    for (const s of e.matchAll(r)) {
      const a = (_a2 = s[3]) == null ? void 0 : _a2.trim();
      a && n.push({
        name: s[1] ?? "",
        columns: ie(s[2] ?? "", ",").map((i) => ({
          name: O(i)
        })).filter((i) => !!i.name),
        valuesSql: a
      });
    }
    return n;
  }
  function Of(e, t) {
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
  function zf(e) {
    return ie(e, ",").map((t) => t.trim()).filter(Boolean).filter((t) => !rd.test(t)).map(Df).filter((t) => t !== null);
  }
  function Df(e) {
    const t = e.match(/^\s*("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/s);
    if (!t) return null;
    const n = O(t[1]), r = t[2].trim(), s = Bf(r);
    return s ? {
      name: n,
      type: pe(s),
      nullable: !/\bnot\s+null\b/i.test(r) && !/\bprimary\s+key\b/i.test(r),
      primaryKey: /\bprimary\s+key\b/i.test(r),
      unique: /\bunique\b/i.test(r)
    } : null;
  }
  function Bf(e) {
    const t = e.search(/\s+(?:constraint|not\s+null|null|primary\s+key|unique|references|default|check|collate|generated)\b/i);
    return (t >= 0 ? e.slice(0, t) : e).trim();
  }
  function O(e) {
    return e.trim().replace(/^\[/, "").replace(/\]$/, "").replace(/^["`]/, "").replace(/["`]$/, "");
  }
  function ie(e, t) {
    const n = [];
    let r = 0, s = 0, a = null;
    for (let i = 0; i < e.length; i += 1) {
      const c = e[i];
      if (a) {
        c === a && e[i - 1] !== "\\" && (a = null);
        continue;
      }
      if (c === "'" || c === '"' || c === "`") {
        a = c;
        continue;
      }
      c === "(" && (s += 1), c === ")" && (s = Math.max(0, s - 1)), s === 0 && c === t && (n.push(e.slice(r, i)), r = i + 1);
    }
    return n.push(e.slice(r)), n;
  }
  function K(...e) {
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
  function cs(e, t) {
    return e.name.toLowerCase() !== t.name.toLowerCase() ? false : (e.schema ?? "").toLowerCase() === (t.schema ?? "").toLowerCase();
  }
  async function Pf(e) {
    var _a2, _b2, _c2;
    const t = Nr(e.dialect), n = e.jdbc ? Rm(e.sql, t) : e.sql, r = typeof e.binds == "string" || e.binds === void 0 ? ea(e.binds) : e.binds, s = e.jdbc ? Fm(r, t) : r, a = ((_a2 = e.schemaFiles) == null ? void 0 : _a2.length) ? await Dr(e.schemaFiles, {
      dialect: t
    }) : ((_b2 = e.schemaPatterns) == null ? void 0 : _b2.length) ? await ad(e.schemaPatterns, {
      cwd: e.cwd,
      dialect: t
    }) : {
      tables: []
    }, i = K(e.schema, a), c = K(i, Qf()), _ = [], l = [], m = Q(n, t), y = Yf(n), w = !m.success && y !== n ? Q(y, t) : void 0;
    if (!m.success && !(w == null ? void 0 : w.success)) throw new Error(m.error ?? "Failed to parse SQL.");
    const S = m.success ? m.ast : w == null ? void 0 : w.ast, N = m.success ? n : y, k = m.success ? Wf(N, t, c) ?? S : S;
    if (i.tables.length > 0 && m.success) {
      const W = jm(n, Zs(c), t, {
        checkTypes: true,
        checkReferences: true,
        semantic: true
      });
      W.errors && l.push(...W.errors.map((ne) => nr(ne))), W.warnings && l.push(...W.warnings.map((ne) => nr(ne, "warning")));
    }
    const L = hp(k, c, t).map((W, ne) => ({
      index: ne + 1,
      columns: Uf(W, c, s, t, _)
    })).filter((W) => W.columns.length > 0), C = xp(k, L), $ = vp(C, L.length === 0);
    _.push(...$.map((W) => W.message)), l.push(...$);
    const M = ((_c2 = L[0]) == null ? void 0 : _c2.columns) ?? [], P = L.flatMap((W) => W.columns);
    let q = Ip(l, P);
    return q = zp(q, k, t), q = Dp(q, k), q = Op(q, k, c), q = Ep(q, k), q = Rp(q, k), q = Fp(q, k, c), q = Mp(q, k, t), q = Wp(q, P), q = Yp(q, P), q = eg(q, k, c), q = tg(q, k), q = Qp(q, L), q = Xp(q, k, c), q = Zp(q, k), q = Gp(q, c), q = ug(q, k, L), q = mg(q, L), q = lg(q, C), q = _g(q, k, L), q = dg(q, C), q = Np(q, L), {
      columns: M,
      resultSets: L,
      statements: C,
      warnings: Vy(_),
      diagnostics: q,
      binds: s,
      schema: i
    };
  }
  function Uf(e, t, n, r, s) {
    return e.map((a, i) => {
      const c = a.name ?? ge(a.expression, i + 1), _ = c || `column_${i + 1}`, l = E(a.expression, _, a.schema ?? t, n, r, a.source, a.tableAliases, a.functionReturnTypes);
      l.type === "unknown" && l.note && s.push(l.note);
      const { confidence: m, ...y } = l;
      return {
        index: i + 1,
        name: c,
        ...y,
        type: Ky(y.type, r)
      };
    });
  }
  function E(e, t, n, r, s, a, i, c) {
    const _ = d(e, "collation");
    if (u(_) && u(_.this)) return E(_.this, t, n, r, s, a, i, c);
    const l = Vf(e, s);
    if (l) return {
      type: l,
      confidence: "medium",
      source: "expression"
    };
    const m = ms(e, n, r);
    if (m) return {
      type: m,
      confidence: "medium",
      source: "expression"
    };
    const y = ws(e, n, i);
    if (y) return {
      type: y.type,
      nullable: y.nullable,
      confidence: "medium",
      source: y.source
    };
    const w = _s(e);
    if (w) return {
      type: w,
      confidence: "medium",
      source: "expression"
    };
    const S = tp(e, n, r);
    if (S) return {
      type: S,
      confidence: "medium",
      source: "expression"
    };
    const N = np(e);
    if (N) return {
      type: N,
      confidence: "medium",
      source: "expression"
    };
    const k = rp(e);
    if (k) return {
      type: k,
      confidence: "medium",
      source: "expression"
    };
    const L = un(e, n, r, i, s);
    if (L) return {
      type: L,
      confidence: "medium",
      source: "expression"
    };
    const C = bs(e, n, i);
    if (C) return {
      type: C.column.type,
      nullable: C.nullable,
      confidence: "high",
      source: Ct(C.table, C.column.name)
    };
    const $ = up(e, r);
    if ($) return {
      type: $,
      confidence: "medium",
      source: "expression"
    };
    const M = ls(e, n, r);
    if (M) return {
      type: M,
      confidence: "medium",
      source: "expression"
    };
    const P = Kf(e);
    if (P) return {
      type: P,
      confidence: "medium",
      source: "expression"
    };
    const q = Hf(e, c);
    if (q) return {
      type: q,
      confidence: "medium",
      source: "function"
    };
    const W = Y(Zt.getInferredType(e));
    if (W) return {
      type: W,
      confidence: "high",
      source: "polyglot"
    };
    const ne = mp(e);
    if (ne) return {
      type: ne,
      confidence: "high",
      source: "cast"
    };
    const st = dp(e);
    if (st) return {
      type: st,
      confidence: "high",
      source: "literal"
    };
    const hn = gs(e, r);
    if (hn) return {
      type: hn,
      confidence: "medium",
      source: "bind"
    };
    const xn = wp(e, r);
    if (xn) return {
      type: xn,
      confidence: "medium",
      source: "bind"
    };
    const at = fp(e, n, i);
    if (at) return {
      type: at.type,
      nullable: at.nullable,
      confidence: "medium",
      source: at.source
    };
    const At = Gf(e, n, i);
    if (At) return {
      type: At.type,
      confidence: "medium",
      source: At.source
    };
    const vn = cn(e, n, r, i);
    return vn ? {
      type: vn,
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
  function Vf(e, t) {
    var _a2, _b2, _c2, _d2;
    const n = d(e, "parameter");
    if (u(n) && String(n.style ?? "").toLowerCase() === "doubleat") {
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
    if (u(r) && !h(r.table)) {
      const a = (_a2 = h(r.name)) == null ? void 0 : _a2.toLowerCase();
      if (a === "current_date") return "date";
      if (a === "current_time") return "time";
      if (a === "current_timestamp" || a === "localtimestamp") return "timestamp";
      if (t === "oracle" && [
        "connect_by_iscycle",
        "connect_by_isleaf"
      ].includes(a ?? "")) return "integer";
    }
    if (t === "oracle" && u(r) && !h(r.table) && ((_b2 = h(r.name)) == null ? void 0 : _b2.toLowerCase()) === "user") return "text";
    if (t === "oracle" && u(r) && [
      "nextval",
      "currval"
    ].includes(((_c2 = h(r.name)) == null ? void 0 : _c2.toLowerCase()) ?? "")) return "integer";
    const s = d(e, "pseudocolumn");
    if (t === "oracle" && u(s)) {
      const a = String(s.kind ?? "").toLowerCase();
      if (a === "rowid") return "text";
      if ([
        "level",
        "rownum"
      ].includes(a)) return "integer";
    }
    if (t === "sqlite" && u(r) && [
      "rowid",
      "_rowid_",
      "oid"
    ].includes(((_d2 = h(r.name)) == null ? void 0 : _d2.toLowerCase()) ?? "")) return "integer";
  }
  function Kf(e) {
    const t = d(e, "function");
    if (!u(t)) return;
    const n = String(t.name ?? "").toLowerCase();
    return [
      "nextval",
      "currval",
      "lastval",
      "setval"
    ].includes(n) ? "bigint" : void 0;
  }
  function Hf(e, t) {
    var _a2;
    if (!t || t.size === 0) return;
    const n = d(e, "function");
    if (u(n)) {
      const c = String(n.name ?? "").toLowerCase();
      return t.get(c) ?? t.get(bn(n));
    }
    const r = d(e, "method_call");
    if (!u(r)) return;
    const s = (_a2 = h(r.method)) == null ? void 0 : _a2.toLowerCase();
    if (!s) return;
    const a = u(r.this) ? Jf(r.this) : void 0, i = a ? `${a.toLowerCase()}.${s}` : void 0;
    return (i ? t.get(i) : void 0) ?? t.get(s);
  }
  function Jf(e) {
    const t = d(e, "column");
    return u(t) ? h(t.name) : void 0;
  }
  function Wf(e, t, n) {
    try {
      const r = Ir(e, t, Zs(n));
      return r.success ? r.ast : void 0;
    } catch {
      return;
    }
  }
  function Yf(e) {
    return e.replace(/create\s+((?:(?:or\s+replace|temporary|temp)\s+)*(?:table|view)\s+(?:if\s+not\s+exists\s+)?[`"\[\]\w.]+\s*(?:\(([^)]*)\))?\s+as\s+)values\s+((?:[^;'"`]|'[^']*'|"[^"]*"|`[^`]*`)+)(?=;|$)/gi, (t, n, r, s) => {
      const a = ie(r ?? "", ",").map(O).filter(Boolean);
      return a.length === 0 ? t : `create ${n}select * from (values ${s}) as sqldesc_values(${a.join(", ")})`;
    });
  }
  function Qf() {
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
  function Gf(e, t, n) {
    var _a2, _b2;
    const r = d(e, "column");
    if (!u(r) || h(r.table)) return;
    const s = (_a2 = h(r.name)) == null ? void 0 : _a2.toLowerCase();
    if (!s) return;
    const a = n == null ? void 0 : n.get(s), i = (a == null ? void 0 : a.tableName.toLowerCase()) ?? s, c = (_b2 = a == null ? void 0 : a.schemaName) == null ? void 0 : _b2.toLowerCase(), _ = t.tables.find((l) => {
      var _a3;
      return !(l.name.toLowerCase() !== i || c && ((_a3 = l.schema) == null ? void 0 : _a3.toLowerCase()) !== c);
    });
    if (_) return {
      type: `struct<${_.columns.map((l) => `${l.name} ${l.type || "unknown"}`).join(", ")}>`,
      source: wn(_)
    };
  }
  function cn(e, t, n, r) {
    if (H(e, "boolean")) return "boolean";
    if (H(e, "pi") || H(e, "match_against")) return "decimal";
    if (d(e, "x_m_l_element") || d(e, "x_m_l_forest")) return "xml";
    const s = d(e, "paren");
    if (u(s) && u(s.this)) return E(s.this, "expression", t, n, "generic").type;
    const a = d(e, "neg");
    if (u(a) && u(a.this)) return E(a.this, "expression", t, n, "generic").type;
    const i = d(e, "array_slice");
    if (u(i) && u(i.this)) return E(i.this, "expression", t, n, "generic").type;
    const c = d(e, "collation");
    if (u(c) && u(c.this)) return E(c.this, "expression", t, n, "generic").type;
    const _ = lp(e, t, n);
    if (_) return _;
    const l = ms(e, t, n);
    if (l) return l;
    const m = ls(e, t, n);
    if (m) return m;
    const y = us(e);
    if (y) return y;
    const w = _s(e);
    if (w) return w;
    const S = ep(e, t, n);
    if (S) return S;
    const N = un(e, t, n, r);
    if (N) return N;
    const k = Zf(e, t, n);
    if (k) return k;
    const L = op(e, t, n);
    if (L) return L;
    const C = d(e, "add") ?? d(e, "sub") ?? d(e, "mul") ?? d(e, "div") ?? d(e, "int_div") ?? d(e, "mod") ?? d(e, "mod_func") ?? d(e, "bitwise_and") ?? d(e, "bitwise_or") ?? d(e, "bitwise_xor") ?? d(e, "bitwise_left_shift") ?? d(e, "bitwise_right_shift");
    if (u(C)) {
      const P = [
        C.left,
        C.right,
        C.this,
        C.expression
      ].filter(u).map((q) => E(q, "expression", t, n, "generic").type);
      if (P.some((q) => /decimal|numeric|real|double|float/i.test(q))) return "decimal";
      if (P.some((q) => /int|number|bigint|smallint/i.test(q))) return "integer";
    }
    const $ = d(e, "power");
    if (u($)) return "decimal";
    if (H(e, "concat")) return "text";
    const M = d(e, "function");
    if (u(M) && String(M.name ?? "").toLowerCase() === "row" && Array.isArray(M.args)) {
      const P = M.args.filter(u).map((q, W) => {
        const ne = ge(q, W + 1), st = E(q, ne, t, n, "generic").type;
        return `${ne} ${st}`;
      });
      if (P.length > 0) return `record<${P.join(", ")}>`;
    }
  }
  function Zf(e, t, n) {
    var _a2;
    const r = d(e, "method_call");
    if (!u(r)) return;
    const s = (_a2 = h(r.method)) == null ? void 0 : _a2.toLowerCase();
    if (!s) return;
    const a = u(r.this) ? r.this : void 0;
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
      const i = a ? G([
        a
      ], t, n) : void 0;
      return i ? J(i) ?? i : void 0;
    }
  }
  function un(e, t, n, r, s = "generic") {
    var _a2;
    if (H(e, "count")) return $t(s);
    if (H(e, "avg")) return Xf(e, t, n, r, s);
    if (H(e, "count_if") || H(e, "approx_count_distinct") || H(e, "approx_distinct")) return $t(s);
    const a = d(e, "first_value") ?? d(e, "last_value");
    if (u(a) && u(a.this)) return X(a.this, t, n, r);
    const i = d(e, "bool_and") ?? d(e, "bool_or") ?? d(e, "every") ?? d(e, "logical_and") ?? d(e, "logical_or");
    if (u(i)) return "boolean";
    const c = d(e, "stddev") ?? d(e, "variance") ?? d(e, "stddev_pop") ?? d(e, "stddev_samp") ?? d(e, "var_pop") ?? d(e, "var_samp");
    if (u(c)) return "decimal";
    const _ = d(e, "bitwise_and_agg") ?? d(e, "bitwise_or_agg") ?? d(e, "bitwise_xor_agg");
    if (u(_)) {
      const M = _e(_);
      return M ? X(M, t, n, r) : "integer";
    }
    const l = d(e, "string_agg") ?? d(e, "group_concat") ?? d(e, "listagg");
    if (u(l)) return "text";
    const m = d(e, "array_agg") ?? d(e, "list") ?? d(e, "collect_list") ?? d(e, "collect_set");
    if (u(m)) {
      const M = _e(m);
      return `array<${M ? X(M, t, n, r) : "unknown"}>`;
    }
    const y = d(e, "array_concat_agg");
    if (u(y)) {
      const M = _e(y);
      return M ? X(M, t, n, r) : "array<unknown>";
    }
    const w = d(e, "json_agg") ?? d(e, "json_object_agg") ?? d(e, "json_arrayagg") ?? d(e, "json_objectagg") ?? d(e, "j_s_o_n_array_agg") ?? d(e, "j_s_o_n_object_agg") ?? d(e, "j_s_o_n_b_object_agg");
    if (u(w)) return "json";
    const S = d(e, "within_group");
    if (u(S)) {
      const M = Array.isArray(S.order_by) ? S.order_by.map((ne) => u(ne) && u(ne.this) ? ne.this : void 0).filter(u) : [], P = u(S.this) ? S.this : void 0, q = P ? un(P, t, n, r, s) : void 0;
      if (q && q !== "unknown") return q;
      const W = B(M, t, n);
      if (W) return W;
    }
    const N = d(e, "any_value") ?? d(e, "first") ?? d(e, "last") ?? d(e, "mode");
    if (u(N)) {
      const M = _e(N);
      if (M) return X(M, t, n, r);
    }
    const k = d(e, "aggregate_function");
    if (u(k)) return Un(String(k.name ?? "").toLowerCase(), k, t, n, r);
    const L = d(e, "combined_parameterized_agg");
    if (u(L) && ((_a2 = h(L.this)) == null ? void 0 : _a2.toLowerCase()) === "quantiles") {
      const P = et(Array.isArray(L.expressions) ? L.expressions.filter(u) : []);
      return `array<${P ? X(P, t, n, r) : "unknown"}>`;
    }
    const C = d(e, "function");
    if (u(C)) {
      const M = String(C.name ?? "").toLowerCase(), P = Un(M, C, t, n, r);
      if (P) return P;
    }
    const $ = d(e, "sum") ?? d(e, "min") ?? d(e, "max") ?? d(e, "median");
    if (u($)) {
      const M = _e($);
      if (M) return X(M, t, n, r);
    }
  }
  function $t(e) {
    return [
      "postgresql",
      "mysql",
      "mariadb",
      "singlestore",
      "tidb",
      "duckdb"
    ].includes(e) ? "bigint" : e === "oracle" ? "number" : "integer";
  }
  function Xf(e, t, n, r, s) {
    if (s === "tsql") {
      const a = d(e, "avg"), i = _e(u(a) ? a : e), c = i ? X(i, t, n, r) : void 0;
      return c && [
        "integer",
        "bigint"
      ].includes(se(c)) ? c : "decimal";
    }
    return [
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(s) ? "decimal(14,4)" : s === "duckdb" ? "double" : s === "oracle" ? "number" : s === "postgresql" ? "numeric" : "decimal";
  }
  function Un(e, t, n, r, s) {
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
      const a = _e(t);
      return a ? X(a, n, r, s) : "integer";
    }
    if ([
      "array_agg",
      "list",
      "collect_list",
      "collect_set"
    ].includes(e)) {
      const a = _e(t);
      return `array<${a ? X(a, n, r, s) : "unknown"}>`;
    }
    if (e === "array_concat_agg") {
      const a = _e(t);
      return a ? X(a, n, r, s) : "array<unknown>";
    }
    if (e === "approx_quantiles" || e === "quantiles") {
      const a = _e(t);
      return `array<${a ? X(a, n, r, s) : "unknown"}>`;
    }
    if ([
      "histogram"
    ].includes(e)) {
      const a = _e(t);
      return `map<${a ? X(a, n, r, s) : "unknown"}, integer>`;
    }
    if (e === "numeric_histogram") {
      const a = I(t), i = a[1] ?? a[0];
      return `map<${u(i) ? X(i, n, r, s) : "unknown"}, decimal>`;
    }
    if (e === "approx_set") return "hyperloglog";
    if (e === "set_digest") return "setdigest";
    if (e === "map_agg" || e === "mapagg") {
      const a = I(t), i = u(a[0]) ? X(a[0], n, r, s) : "unknown", c = u(a[1]) ? X(a[1], n, r, s) : "unknown";
      return `map<${i}, ${c}>`;
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
      const a = _e(t);
      return a ? X(a, n, r, s) : void 0;
    }
  }
  function X(e, t, n, r) {
    return E(e, "aggregate", t, n, "generic", void 0, r).type;
  }
  function _e(e) {
    return et([
      e.this,
      ...Array.isArray(e.args) ? e.args : [],
      ...Array.isArray(e.expressions) ? e.expressions : []
    ].filter(u));
  }
  function ep(e, t, n) {
    const r = d(e, "subquery");
    if (!u(r) || !u(r.this)) return;
    const s = V(r.this, t), a = u(r.this.select) ? r.this.select : void 0;
    if (a && String(a.kind ?? "").toUpperCase() === "STRUCT" && s.length > 0) return `struct<${s.map((_, l) => {
      const m = _.name ?? ge(_.expression, l + 1), y = E(_.expression, m, _.schema ?? t, n, "generic", _.source, _.tableAliases).type;
      return `${m} ${y}`;
    }).join(", ")}>`;
    const i = s[0];
    if (i) return E(i.expression, i.name ?? "subquery", i.schema ?? t, n, "generic", i.source, i.tableAliases).type;
  }
  function us(e) {
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
    ].some((n) => H(e, n)) ? "boolean" : void 0;
  }
  function _s(e) {
    if (d(e, "json_object") || d(e, "j_s_o_n_array") || d(e, "json_extract") || d(e, "j_s_o_n_extract") || pt(e, "json_extract_path")) return "json";
    if (pt(e, "json_extract_scalar") || d(e, "json_value")) return "text";
    if (d(e, "to_json") || d(e, "json_keys")) return "json";
    if (d(e, "json_array_length")) return "integer";
    if (d(e, "json_typeof") || d(e, "jsonb_typeof") || d(e, "json_type")) return "text";
    const t = d(e, "function");
    if (!u(t)) return;
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
    return u(e) ? u(e[t]) ? true : Object.values(e).some((n) => Array.isArray(n) ? n.some((r) => pt(r, t)) : pt(n, t)) : false;
  }
  function tp(e, t, n) {
    if (d(e, "interval")) return "interval";
    const r = d(e, "add") ?? d(e, "sub");
    if (u(r)) {
      const i = u(r.left) ? E(r.left, "temporal_left", t, n, "generic").type : void 0, c = u(r.right) ? E(r.right, "temporal_right", t, n, "generic").type : void 0;
      if (i && c) {
        if (Re(i) && c === "interval") return i;
        if (i === "interval" && Re(c)) return c;
        if (i === "interval" && c === "interval") return "interval";
        if (Re(i) && Re(c) && d(e, "sub")) return "integer";
      }
    }
    if (d(e, "extract")) return "integer";
    if (d(e, "at_time_zone")) return "datetimeoffset";
    if (d(e, "day") || d(e, "month") || d(e, "year") || d(e, "quarter") || d(e, "weekofyear") || d(e, "week_of_year") || d(e, "date_diff")) return "integer";
    if (d(e, "last_day") || d(e, "next_day") || d(e, "add_months")) return "date";
    if (d(e, "months_between")) return "decimal";
    if (d(e, "epoch") || d(e, "epoch_ms") || d(e, "epoch_us") || d(e, "epoch_ns")) return "integer";
    const s = d(e, "function");
    if (!u(s)) return;
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
      const i = I(s).map((c) => E(c, "temporal", t, n, "generic").type).find(Re);
      return i || (a.startsWith("timestamp") ? "timestamp" : a.startsWith("datetime") ? "datetime" : a.startsWith("time") ? "time" : "date");
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
      const i = I(s), c = i[1] ?? i[0];
      if (c) {
        const _ = E(c, "temporal", t, n, "generic").type;
        if (/date/i.test(_) && !/time|timestamp|datetime/i.test(_)) return "date";
        if (/time/i.test(_) && !/timestamp|datetime/i.test(_)) return "time";
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
      const i = I(s), c = i[1] ?? i[0];
      if (c) {
        const _ = E(c, "temporal", t, n, "generic").type;
        if (Re(_)) return _;
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
  function np(e) {
    const t = d(e, "function");
    if (!u(t)) return;
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
  function rp(e) {
    if (H(e, "random") || H(e, "rand")) return "decimal";
    const t = d(e, "function");
    if (!u(t)) return;
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
  function ls(e, t, n) {
    const r = d(e, "case");
    if (u(r)) {
      const c = (Array.isArray(r.whens) ? r.whens : []).flatMap((_) => Array.isArray(_) && u(_[1]) ? [
        _[1]
      ] : []);
      return u(r.else_) && c.push(r.else_), B(c, t, n);
    }
    const s = d(e, "if_func");
    if (u(s)) {
      const c = [
        s.true_value,
        s.false_value
      ].filter(u);
      return B(c, t, n);
    }
    const a = d(e, "nvl2");
    if (u(a)) {
      const c = [
        a.true_value,
        a.false_value
      ].filter(u);
      return B(c, t, n);
    }
    const i = d(e, "function");
    if (u(i) && String(i.name ?? "").toLowerCase() === "choose") return B(I(i).slice(1), t, n);
    if (u(i) && String(i.name ?? "").toLowerCase() === "multiif") {
      const c = I(i), _ = c.filter((l, m) => m % 2 === 1 || m === c.length - 1);
      return B(_, t, n);
    }
    if (u(i) && String(i.name ?? "").toLowerCase() === "choose") return B(I(i).slice(1), t, n);
  }
  function ms(e, t, n) {
    const r = d(e, "array_func");
    if (u(r) && Array.isArray(r.expressions)) return `array<${B(r.expressions.filter(u), t, n) ?? "unknown"}>`;
    const s = d(e, "tuple");
    if (u(s) && Array.isArray(s.expressions)) {
      const l = s.expressions.filter(u).map((m, y) => {
        const w = ge(m, y + 1), S = E(m, w, t, n, "generic").type;
        return `${w} ${S}`;
      });
      return l.length > 0 ? `record<${l.join(", ")}>` : void 0;
    }
    const a = d(e, "function");
    if (!u(a)) return;
    const i = String(a.name ?? "").toLowerCase(), c = I(a);
    if (i === "array") {
      const l = c.find((y) => u(y.select));
      if (l) {
        const w = V(l, t)[0];
        if (w) return `array<${E(w.expression, w.name ?? "array", w.schema ?? t, n, "generic", w.source, w.tableAliases).type}>`;
      }
      return `array<${B(c, t, n) ?? "unknown"}>`;
    }
    if (i === "generate_array") return `array<${B(c, t, n) ?? "integer"}>`;
    if (i === "generate_date_array") return "array<date>";
    if (i === "generate_timestamp_array") return "array<timestamp>";
    if ([
      "list_value",
      "array_value"
    ].includes(i)) return `array<${B(c, t, n) ?? "unknown"}>`;
    if ([
      "array_construct",
      "array_construct_compact"
    ].includes(i)) return `array<${B(c, t, n) ?? "variant"}>`;
    if ([
      "object_construct",
      "object_construct_keep_null"
    ].includes(i)) return "object";
    const _ = ip(i, c, t, n);
    if (_) return _;
    if (i === "map") {
      const l = c.filter((S, N) => N % 2 === 0), m = c.filter((S, N) => N % 2 === 1), y = B(l, t, n) ?? "unknown", w = B(m, t, n) ?? "unknown";
      return `map<${y}, ${w}>`;
    }
    if (i === "named_struct") {
      const l = sp(c, t, n);
      return l.length > 0 ? `struct<${l.join(", ")}>` : void 0;
    }
    if (i === "struct") {
      const l = c.map((m, y) => {
        const w = rt(m), S = w.name ?? ge(w.expression, y + 1), N = E(w.expression, S, t, n, "generic").type;
        return `${S} ${N}`;
      });
      return l.length > 0 ? `struct<${l.join(", ")}>` : void 0;
    }
    if (i === "struct_pack") {
      const l = fs(c, t, n);
      return l.length > 0 ? `struct<${l.join(", ")}>` : void 0;
    }
  }
  function sp(e, t, n) {
    const r = [];
    for (let s = 0; s + 1 < e.length; s += 2) {
      const a = je(e[s]) ?? `field_${s / 2 + 1}`, i = e[s + 1], c = E(i, a, t, n, "generic").type;
      r.push(`${O(a)} ${c}`);
    }
    return r;
  }
  function ap(e) {
    return ie(e, ",").flatMap((t) => {
      const n = t.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
      if (!n) return [];
      const r = O(n[1]), s = Pe(n[2]) ?? "unknown";
      return r ? [
        `${r} ${s}`
      ] : [];
    });
  }
  function ip(e, t, n, r) {
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
    ].includes(e) ? t[1] : t[0], i = a ? E(a, "lambda_array", n, r, "generic").type : void 0, c = i ? J(i) : void 0;
    if ([
      "filter",
      "array_filter",
      "list_filter",
      "arrayfilter"
    ].includes(e)) return i;
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
      return w && !u(w.lambda) ? E(w, "lambda_state", n, r, "generic").type : c;
    }
    const _ = (_a2 = t.find((w) => u(w.lambda))) == null ? void 0 : _a2.lambda, l = u(_) && u(_.body) ? _.body : void 0, m = u(_) && Array.isArray(_.parameters) ? _.parameters.map(h).filter((w) => !!w) : [];
    return `array<${(l ? ds(l, new Map(m.map((w) => [
      w.toLowerCase(),
      c ?? "unknown"
    ])), n, r) : void 0) ?? c ?? "unknown"}>`;
  }
  function ds(e, t, n, r) {
    var _a2;
    const s = d(e, "column"), a = u(s) ? (_a2 = h(s.name)) == null ? void 0 : _a2.toLowerCase() : void 0;
    if (a && t.has(a)) return t.get(a);
    if (d(e, "lower") || d(e, "upper") || d(e, "trim") || d(e, "initcap")) return "text";
    if (d(e, "length") || d(e, "char_length") || d(e, "cardinality")) return "integer";
    if (d(e, "array_contains")) return "boolean";
    const i = us(e);
    if (i) return i;
    const c = d(e, "add") ?? d(e, "sub") ?? d(e, "mul") ?? d(e, "div") ?? d(e, "int_div") ?? d(e, "mod");
    if (u(c)) {
      const _ = [
        c.left,
        c.right,
        c.this,
        c.expression
      ].filter(u).map((l) => ds(l, t, n, r) ?? E(l, "lambda_arg", n, r, "generic").type);
      if (_.some((l) => /decimal|numeric|real|double|float/i.test(l))) return "decimal";
      if (_.some((l) => /int|number|bigint|smallint/i.test(l))) return "integer";
    }
    return E(e, "lambda_body", n, r, "generic").type;
  }
  function fs(e, t, n) {
    return e.flatMap((r, s) => {
      const a = u(r.named_argument) ? r.named_argument : void 0, i = h(a == null ? void 0 : a.name) ?? `field_${s + 1}`, c = u(a == null ? void 0 : a.value) ? a.value : void 0;
      if (!c) return [];
      const _ = E(c, i, t, n, "generic").type;
      return [
        `${O(i)} ${_}`
      ];
    });
  }
  function op(e, t, n) {
    if (d(e, "lower") || d(e, "upper") || d(e, "trim") || d(e, "initcap") || d(e, "substring") || d(e, "substr") || d(e, "overlay")) return "text";
    if (d(e, "length") || d(e, "char_length") || d(e, "bit_length") || d(e, "octet_length") || d(e, "str_position")) return "integer";
    if (H(e, "random") || H(e, "rand") || d(e, "degrees") || d(e, "radians")) return "decimal";
    if (d(e, "cardinality") || d(e, "array_length") || d(e, "array_size") || d(e, "array_position")) return "integer";
    if (d(e, "array_contains")) return "boolean";
    if (d(e, "to_number")) return "decimal";
    if (d(e, "json_query") || d(e, "parse_json")) return "json";
    if (d(e, "typeof")) return "text";
    const r = d(e, "nvl");
    if (u(r)) return B([
      r.this,
      r.expression
    ].filter(u), t, n);
    const s = _p(e, t, n);
    if (s) return s;
    const a = d(e, "array_append");
    if (u(a)) return G([
      a.this,
      a.expression
    ].filter(u), t, n);
    const i = d(e, "array_prepend");
    if (u(i)) return G([
      i.this,
      i.expression
    ].filter(u), t, n);
    const c = d(e, "array_distinct");
    if (u(c)) return G([
      c.this
    ].filter(u), t, n);
    const _ = d(e, "array_remove");
    if (u(_)) return G([
      _.this,
      _.expression
    ].filter(u), t, n);
    const l = d(e, "array_reverse");
    if (u(l)) return G([
      l.this
    ].filter(u), t, n);
    const m = d(e, "array_compact");
    if (u(m)) return G([
      m.this
    ].filter(u), t, n);
    const y = d(e, "array_intersect");
    if (u(y)) return G(I(y), t, n);
    const w = d(e, "array_union");
    if (u(w)) return G([
      w.this,
      w.expression
    ].filter(u), t, n);
    const S = d(e, "array_except");
    if (u(S)) return G([
      S.this,
      S.expression
    ].filter(u), t, n);
    const N = d(e, "abs") ?? d(e, "round") ?? d(e, "ceil") ?? d(e, "ceiling") ?? d(e, "floor");
    if (u(N)) {
      const $ = et([
        N.this,
        ...Array.isArray(N.args) ? N.args : []
      ].filter(Boolean));
      return $ ? E($, "scalar", t, n, "generic").type : "decimal";
    }
    const k = d(e, "coalesce") ?? d(e, "nullif");
    if (u(k)) return gt(k, n) ?? B(I(k), t, n);
    const L = d(e, "function");
    if (!u(L)) return;
    const C = String(L.name ?? "").toLowerCase();
    if ([
      "nextval",
      "currval",
      "lastval",
      "setval"
    ].includes(C)) return "bigint";
    if (C === "try") {
      const $ = I(L)[0];
      return $ ? E($, "scalar", t, n, "generic").type : void 0;
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
      const $ = I(L);
      return $.length > 2 ? B([
        ...$.slice(2).filter((M, P) => P % 2 === 0),
        $.at(-1)
      ].filter(u), t, n) : "bytes";
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
      const $ = G(I(L), t, n);
      return $ ? J($) ?? $ : void 0;
    }
    if (C === "flatten") {
      const $ = G(I(L), t, n);
      return $ ? J($) ?? $ : void 0;
    }
    if (C === "array_flatten") {
      const $ = G(I(L), t, n), M = $ ? J($) : void 0;
      return M && /^array\s*</i.test(M) ? M : $;
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
    ].includes(C)) return G(I(L), t, n);
    if (C === "list_grade_up") return "array<integer>";
    if (C === "array_zip") {
      const $ = I(L).map((M, P) => {
        const q = E(M, `array_zip_${P + 1}`, t, n, "generic").type;
        return `field_${P + 1} ${J(q) ?? "unknown"}`;
      });
      return $.length > 0 ? `array<struct<${$.join(", ")}>>` : "array<struct<>>";
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
      const $ = G(I(L), t, n);
      return $ ? J($) ?? $ : void 0;
    }
    if ([
      "list_value",
      "array_value"
    ].includes(C)) return `array<${B(I(L), t, n) ?? "unknown"}>`;
    if (C === "from_json") {
      const $ = je(I(L)[1]), M = $ ? ap($) : [];
      return M.length > 0 ? `struct<${M.join(", ")}>` : "json";
    }
    if (C === "struct_pack") {
      const $ = fs(I(L), t, n);
      return $.length > 0 ? `struct<${$.join(", ")}>` : void 0;
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
    ].includes(C)) return G(I(L), t, n);
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
    if (C === "unixepoch") return cp(L);
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
      const $ = Array.isArray(L.args) ? L.args[0] : void 0, M = u($) ? Y($.data_type ?? $) : void 0;
      if (M) return M;
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
    ].includes(C)) return B(I(L), t, n) ?? "decimal";
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
    ].includes(C)) return gt(L, n) ?? B(I(L), t, n);
    if (C === "nvl2") {
      const $ = I(L);
      return B($.slice(1, 3), t, n);
    }
    if (C === "multiif") {
      const $ = I(L), M = $.filter((P, q) => q % 2 === 1 || q === $.length - 1);
      return B(M, t, n);
    }
  }
  function gt(e, t) {
    const n = I(e)[0];
    return u(n) ? gs(n, t) : void 0;
  }
  function cp(e) {
    return I(e).map(je).some((n) => n ? [
      "subsec",
      "subsecond"
    ].includes(n.toLowerCase()) : false) ? "decimal" : "integer";
  }
  function up(e, t) {
    const n = d(e, "coalesce") ?? d(e, "nullif");
    if (u(n)) return gt(n, t);
    const r = d(e, "function");
    if (!u(r)) return;
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
  function _p(e, t, n) {
    const r = d(e, "map_from_arrays");
    if (u(r)) {
      const m = u(r.this) ? E(r.this, "map_keys", t, n, "generic").type : void 0, y = u(r.expression) ? E(r.expression, "map_values", t, n, "generic").type : void 0, w = m ? J(m) : void 0, S = y ? J(y) : void 0;
      return w && S ? `map<${w}, ${S}>` : void 0;
    }
    const s = d(e, "map_keys");
    if (u(s)) {
      const m = ke(s.this, t, n);
      return m ? `array<${m[0]}>` : void 0;
    }
    const a = d(e, "map_values");
    if (u(a)) {
      const m = ke(a.this, t, n);
      return m ? `array<${m[1]}>` : void 0;
    }
    const i = d(e, "element_at");
    if (u(i)) {
      const m = ke(i.this, t, n);
      if (m) return m[1];
      const y = u(i.this) ? E(i.this, "element_at", t, n, "generic").type : void 0;
      return y ? J(y) : void 0;
    }
    const c = d(e, "subscript");
    if (u(c)) {
      const m = ke(c.this, t, n);
      if (m) return m[1];
    }
    const _ = d(e, "function");
    if (!u(_)) return;
    const l = String(_.name ?? "").toLowerCase();
    if ([
      "map_keys",
      "mapkeys"
    ].includes(l)) {
      const m = ke(I(_)[0], t, n);
      return m ? `array<${m[0]}>` : void 0;
    }
    if ([
      "map_values",
      "mapvalues"
    ].includes(l)) {
      const m = ke(I(_)[0], t, n);
      return m ? `array<${m[1]}>` : void 0;
    }
    if ([
      "element_at",
      "map_extract"
    ].includes(l)) {
      const m = I(_)[0], y = ke(m, t, n);
      if (y) return y[1];
      if (u(m)) {
        const w = E(m, "element_at", t, n, "generic").type;
        return J(w);
      }
    }
    if (l === "map_contains" || l === "mapcontains") return "boolean";
    if (l === "map_entries") {
      const m = ke(I(_)[0], t, n);
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
    ].includes(l)) return I(_).map((m) => E(m, "map_func_arg", t, n, "generic").type).find((m) => /^map\s*</i.test(m));
    if (l === "map_from_arrays") {
      const m = I(_), y = m[0] ? E(m[0], "map_keys", t, n, "generic").type : void 0, w = m[1] ? E(m[1], "map_values", t, n, "generic").type : void 0, S = y ? J(y) : void 0, N = w ? J(w) : void 0;
      return S && N ? `map<${S}, ${N}>` : void 0;
    }
  }
  function ke(e, t, n) {
    if (!u(e)) return;
    const r = E(e, "map_arg", t, n, "generic").type;
    return r === "unknown" ? void 0 : xt(r);
  }
  function G(e, t, n) {
    return e.map((r) => E(r, "array_arg", t, n, "generic").type).find((r) => J(r) || /^array\s*</i.test(r));
  }
  function I(e) {
    return [
      ...u(e.this) ? [
        e.this
      ] : [],
      ...Array.isArray(e.args) ? e.args.filter(u) : [],
      ...Array.isArray(e.expressions) ? e.expressions.filter(u) : []
    ];
  }
  function B(e, t, n) {
    const r = e.map((s, a) => E(s, `arg_${a + 1}`, t, n, "generic").type).filter((s) => s !== "unknown");
    return ps(r);
  }
  function ps(e) {
    if (e.length !== 0) return e.some((t) => /text|char|string|varchar/i.test(t)) ? "text" : e.some((t) => /timestamp|datetime/i.test(t)) ? "timestamp" : e.some((t) => /^date$/i.test(t)) ? "date" : e.some((t) => /decimal|numeric|real|double|float/i.test(t)) ? "decimal" : e.some((t) => /int|number|bigint|smallint/i.test(t)) ? "integer" : e.some((t) => /bool/i.test(t)) ? "boolean" : e[0];
  }
  function lp(e, t, n) {
    const r = d(e, "window_function");
    if (!u(r) || !u(r.this)) return;
    const s = r.this;
    if (H(s, "row_number") || H(s, "rank") || H(s, "dense_rank") || H(s, "ntile") || H(s, "n_tile")) return "integer";
    if (H(s, "percent_rank") || H(s, "cume_dist")) return "decimal";
    const a = d(s, "lag") ?? d(s, "lead") ?? d(s, "first_value") ?? d(s, "last_value") ?? d(s, "nth_value");
    if (u(a) && u(a.this)) return E(a.this, "window_value", t, n, "generic").type;
    const i = d(s, "function");
    if (u(i)) {
      const c = String(i.name ?? "").toLowerCase();
      if ([
        "laginframe",
        "leadinframe"
      ].includes(c)) {
        const _ = I(i)[0];
        return _ ? E(_, "window_value", t, n, "generic").type : void 0;
      }
    }
    return cn(s, t, n);
  }
  function mp(e) {
    const t = d(e, "cast") ?? d(e, "try_cast") ?? d(e, "safe_cast");
    return u(t) ? Y(t.to) : void 0;
  }
  function dp(e) {
    const t = d(e, "literal");
    if (u(t)) {
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
    if (H(e, "null")) return "null";
  }
  function gs(e, t) {
    var _a2, _b2;
    if (t.mode === "none") return;
    const n = d(e, "placeholder") ?? d(e, "parameter");
    if (u(n)) {
      if (t.mode === "positional") {
        const r = typeof n.index == "number" ? n.index : 1, s = (_a2 = t.binds.find((a) => a.index === r)) == null ? void 0 : _a2.type;
        return s ? se(s) : void 0;
      }
      if (t.mode === "named") {
        const r = typeof n.name == "string" ? n.name : void 0, s = r ? (_b2 = t.binds.find((a) => a.name === r)) == null ? void 0 : _b2.type : void 0;
        return s ? se(s) : void 0;
      }
    }
  }
  function bs(e, t, n) {
    var _a2, _b2, _c2, _d2, _e2;
    const s = ys(e) ?? d(e, "column");
    if (!u(s)) return;
    const a = (_a2 = h(s.name)) == null ? void 0 : _a2.toLowerCase(), i = (_b2 = h(s.table)) == null ? void 0 : _b2.toLowerCase(), c = i ? n == null ? void 0 : n.get(i) : void 0, _ = i ? (c == null ? void 0 : c.tableName.toLowerCase()) ?? i : void 0, l = (_c2 = c == null ? void 0 : c.schemaName) == null ? void 0 : _c2.toLowerCase();
    if (!a) return;
    const m = _ ? [] : [
      ...new Set([
        ...(n == null ? void 0 : n.values()) ?? []
      ].map((w) => w.tableName))
    ].map((w) => w.toLowerCase()), y = _ ? [] : [
      ...new Set([
        ...(n == null ? void 0 : n.values()) ?? []
      ].map((w) => w.schemaName).filter((w) => !!w))
    ].map((w) => w.toLowerCase());
    for (const w of t.tables) {
      if (_ && w.name.toLowerCase() !== _ || l && ((_d2 = w.schema) == null ? void 0 : _d2.toLowerCase()) !== l || _ && !l && w.schema || !_ && m.length > 0 && !m.includes(w.name.toLowerCase()) || !_ && m.length > 0 && w.schema && y.length === 0 || !_ && y.length > 0 && w.schema && !y.includes(w.schema.toLowerCase())) continue;
      const S = (c == null ? void 0 : c.visibleColumnNames.findIndex((L) => L.toLowerCase() === a)) ?? -1, N = S >= 0 ? (_e2 = w.columns[S]) == null ? void 0 : _e2.name.toLowerCase() : a, k = w.columns.find((L) => L.name.toLowerCase() === N);
      if (k) return {
        table: w,
        column: k,
        nullable: (c == null ? void 0 : c.nullable) ? true : k.nullable
      };
    }
  }
  function ys(e) {
    const t = d(e, "dot");
    if (!u(t)) return;
    const n = u(t.this) ? d(t.this, "column") : void 0, r = h(t.field);
    if (!u(n) || !r) return;
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
  function fp(e, t, n) {
    const r = ws(e, t, n);
    if (r) return r;
    const s = Ht(e, t, n);
    if (!s) return;
    const a = pp(s.base.column.type, s.steps);
    if (a) return {
      type: a,
      nullable: s.base.column.nullable,
      source: [
        s.base.source,
        ...s.steps.filter((i) => i.kind === "field").map((i) => i.name)
      ].join(".")
    };
  }
  function ws(e, t, n) {
    const r = d(e, "json_extract_scalar");
    if (!u(r)) return;
    const s = hs(r.this, t, n), a = je(r.path);
    return {
      type: "text",
      nullable: s == null ? void 0 : s.column.nullable,
      source: s && a ? `${s.source}.${a}` : (s == null ? void 0 : s.source) ?? "json"
    };
  }
  function Ht(e, t, n) {
    const r = d(e, "dot");
    if (u(r)) {
      const c = Ht(r.this, t, n), _ = h(r.field);
      return c && _ ? {
        base: c.base,
        steps: [
          ...c.steps,
          {
            kind: "field",
            name: _
          }
        ]
      } : void 0;
    }
    const s = d(e, "subscript");
    if (u(s)) {
      const c = Ht(s.this, t, n), _ = je(s.index);
      return c && _ && !yp(_) ? {
        base: c.base,
        steps: [
          ...c.steps,
          {
            kind: "field",
            name: _
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
    const a = hs(e, t, n);
    if (a) return {
      base: a,
      steps: []
    };
    const i = d(e, "column");
    if (u(i)) {
      const c = h(i.table), _ = h(i.name);
      if (c && _) {
        const l = xs(c, t, n);
        if (l && vs(l.column.type, _)) return {
          base: l,
          steps: [
            {
              kind: "field",
              name: _
            }
          ]
        };
      }
    }
  }
  function hs(e, t, n) {
    const r = d(e, "column");
    if (!u(r)) return;
    const s = h(r.name), a = h(r.table);
    if (s) return xs(s, t, n, a);
  }
  function xs(e, t, n, r) {
    const a = bs(r ? {
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
  function pp(e, t) {
    return t.reduce((n, r) => {
      var _a2;
      if (n) return r.kind === "element" ? J(n) ?? ((_a2 = xt(n)) == null ? void 0 : _a2[1]) : /^(?:json|jsonb)$/i.test(n) || /^(?:variant|object)$/i.test(n) ? n.toLowerCase() : vs(n, r.name);
    }, e);
  }
  function vs(e, t) {
    var _a2;
    return (_a2 = gp(e).find((r) => r.name.toLowerCase() === t.toLowerCase())) == null ? void 0 : _a2.type;
  }
  function J(e) {
    const t = e.trim(), n = /^array\s*<([\s\S]+)>$/i.exec(t);
    if (n) return n[1].trim();
    const r = /^(.+)\[\]$/.exec(t);
    if (r) return r[1].trim();
  }
  function xt(e) {
    const t = /^map\s*<([\s\S]+)>$/i.exec(e.trim());
    if (!t) return;
    const n = ie(t[1], ",").map((r) => r.trim());
    return n.length >= 2 && n[0] && n[1] ? [
      n[0],
      n[1]
    ] : void 0;
  }
  function gp(e) {
    const t = /^(?:struct|record|row)\s*<([\s\S]+)>$/i.exec(e.trim());
    return t ? ie(t[1], ",").flatMap((n) => {
      const r = n.trim(), a = Vn(r, ":") ?? Vn(r, " ");
      return a ? [
        {
          name: O(a[0]),
          type: a[1].trim()
        }
      ] : [];
    }) : [];
  }
  function Vn(e, t) {
    let n = 0;
    for (let r = 0; r < e.length; r += 1) {
      const s = e[r];
      if ((s === "<" || s === "(") && (n += 1), (s === ">" || s === ")") && (n -= 1), n === 0 && (t === ":" ? s === ":" : /\s/.test(s))) {
        const a = e.slice(0, r).trim(), i = e.slice(r + 1).trim();
        if (a && i) return [
          a,
          i
        ];
      }
    }
  }
  function je(e) {
    const t = d(e, "literal");
    if (u(t)) return typeof t.value == "string" ? t.value : void 0;
  }
  function bp(e) {
    const t = d(e, "literal");
    if (!u(t) || t.literal_type !== "number") return;
    const n = Number(t.value);
    return Number.isFinite(n) ? n : void 0;
  }
  function yp(e) {
    return /^\d+$/.test(e);
  }
  function wp(e, t) {
    var _a2, _b2, _c2, _d2, _e2;
    const n = d(e, "column");
    if (!u(n)) return;
    const r = h(n.name);
    if (t.mode === "positional") {
      const s = ((_a2 = r == null ? void 0 : r.match(/^\$(\d+)$/)) == null ? void 0 : _a2[1]) ?? ((_b2 = r == null ? void 0 : r.match(/^@P(\d+)$/i)) == null ? void 0 : _b2[1]), a = s ? (_c2 = t.binds.find((i) => i.index === Number(s))) == null ? void 0 : _c2.type : void 0;
      return a ? se(a) : void 0;
    }
    if (t.mode === "named") {
      const s = (_d2 = r == null ? void 0 : r.match(/^[@$]([A-Za-z_]\w*)$/)) == null ? void 0 : _d2[1], a = s ? (_e2 = t.binds.find((i) => i.name === s)) == null ? void 0 : _e2.type : void 0;
      return a ? se(a) : void 0;
    }
  }
  function hp(e, t, n = "generic") {
    const r = Array.isArray(e) ? e : [
      e
    ], s = Jy(t);
    let a = t;
    return r.map((i) => {
      const c = V(i, a, s, n);
      return Pg(i, s), Ug(i, s), Hg(i, a, s, n), Yg(i, a, s, n), Xg(i, s), nb(i, s), rb(i, s), a = pg(i, a, s), c;
    });
  }
  function xp(e, t) {
    return (Array.isArray(e) ? e : [
      e
    ]).map((r, s) => {
      const a = t.find((_) => _.index === s + 1), i = Cp(r);
      if (a && a.columns.length > 0) return {
        index: s + 1,
        kind: i,
        resultKind: "static"
      };
      const c = Ap(r);
      return {
        index: s + 1,
        kind: i,
        resultKind: c,
        message: qs(i, c)
      };
    });
  }
  function vp(e, t) {
    const n = [], r = t ? e.filter((s) => s.resultKind !== "static") : e.filter((s) => ![
      "static",
      "none"
    ].includes(s.resultKind));
    for (const s of r) {
      const a = s.message ?? qs(s.kind, s.resultKind);
      n.push({
        code: $p(s.resultKind),
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
  function Cp(e) {
    return u(e) ? Object.keys(e)[0] ?? "unknown" : "unknown";
  }
  function Ap(e) {
    return u(e) ? ks(e) ? "none" : Ls(e) ? "runtime" : u(e.show) || js(e) || u(e.pragma) || u(e.summarize) ? "metadata" : u(e.copy) && Ss(e.copy) || As(e) ? "none" : Cs(e) || Lp(e) ? "static" : u(e.execute) || u(e.copy) || Sp(e) ? "runtime" : u(e.select) || u(e.values) || u(e.union) || u(e.intersect) || u(e.except) || u(e.pivot) || u(e.put) || _n(e) ? "unknown" : (Tp(e), "none") : "unknown";
  }
  function Sp(e) {
    if (!u(e.command)) return false;
    const t = String(e.command.this ?? "").toLowerCase();
    return /^(call|execute|exec|copy)\b/.test(t);
  }
  function Cs(e) {
    if (!u(e.command)) return false;
    const t = String(e.command.this ?? "").toLowerCase();
    return kp(t);
  }
  function kp(e) {
    return Ge(Jt(e)).length > 0 ? true : /^begin\s+select\b/.test(e) || /^(?:optimize|repair|check|checksum)\s+table\b/.test(e) || /^(?:list|ls)\s+@/.test(e) || /^get\s+@/.test(e) || /^(?:remove|rm)\s+@/.test(e) || /^exists\s+(?:table|database|view|dictionary)\b/.test(e) || /^explain\b/.test(e) || /^show\s+(?:clusters|users|roles|grants|settings|dictionaries|functions|databases|schemas|tables|views|materialized\s+views|columns|indexes|variables|catalogs|current\s+namespace|engines|table|create\s+(?:table|database|dictionary|view)|processlist)\b/.test(e) || /^list\s+(?:file|jar|archive)\b/.test(e) || /^(?:describe|desc)\s+table\b/.test(e) || /^help\s+(?:table|database|column)\b/.test(e);
  }
  function Lp(e) {
    return u(e.execute) && Rs(e.execute).length > 0;
  }
  function As(e) {
    if (!u(e.command)) return false;
    const t = String(e.command.this ?? "").toLowerCase();
    return /^(lock|vacuum|msck|repair|refresh|discard|cluster|reindex|reset)\b/.test(t);
  }
  function Tp(e) {
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
    ].some((t) => u(e[t]));
  }
  function Ss(e) {
    return e.kind === true && e.is_into !== true;
  }
  function ks(e) {
    const t = u(e.function) ? String(e.function.name ?? "").toLowerCase() : void 0;
    if (t && [
      "raiserror"
    ].includes(t) || jp(e)) return true;
    const n = Ts(e);
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
  function Ls(e) {
    return Ts(e) === "dbcc";
  }
  function jp(e) {
    var _a2;
    const t = u(e.sub) ? e.sub : void 0, n = t && u(t.left) ? d(t.left, "column") : void 0;
    return u(n) && ((_a2 = h(n.name)) == null ? void 0 : _a2.toLowerCase()) === "dfs";
  }
  function Ts(e) {
    var _a2;
    const t = u(e.column) ? e.column : void 0, n = u(e.alias) ? e.alias : void 0, r = n && u(n.this) && u(n.this.column) ? n.this.column : void 0;
    return (_a2 = h((t == null ? void 0 : t.name) ?? (r == null ? void 0 : r.name))) == null ? void 0 : _a2.toLowerCase();
  }
  function _n(e) {
    var _a2;
    const t = u(e.alias) ? e.alias : void 0;
    return !t || !u(t.this) || !u(t.this.column) ? false : ((_a2 = h(t.this.column.name)) == null ? void 0 : _a2.toLowerCase()) === "watch" && !!h(t.alias);
  }
  function qp(e) {
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
    ].some((n) => Kn(e, n)) ? false : [
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
    ].some((n) => Kn(e, n));
  }
  function Kn(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }
  function js(e) {
    return !!u(e.describe);
  }
  function qs(e, t) {
    return t === "metadata" ? `${e.toUpperCase()} parses successfully, but its result-set shape is dialect-specific metadata and cannot be inferred statically.` : t === "runtime" ? `${e.toUpperCase()} parses successfully, but its result-set shape depends on runtime database behavior.` : t === "none" ? `${e.toUpperCase()} parses successfully and does not expose result-set columns.` : `${e.toUpperCase()} parses successfully, but no statically inferable result-set columns were found.`;
  }
  function $p(e) {
    return e === "metadata" ? "SQLDESC_METADATA_RESULT_SHAPE" : e === "runtime" ? "SQLDESC_RUNTIME_RESULT_SHAPE" : e === "none" ? "SQLDESC_NO_RESULT_COLUMNS" : "SQLDESC_UNKNOWN_RESULT_SHAPE";
  }
  function Ip(e, t) {
    return e.filter((n) => {
      const r = n.message.match(/Unknown table or alias '([^']+)' referenced by column '([^']+)'/);
      if (!r) return true;
      const [, s, a] = r, i = `${s}.${a}`.toLowerCase();
      return !t.some((c) => {
        var _a2;
        const _ = (_a2 = c.source) == null ? void 0 : _a2.toLowerCase();
        return _ === i || (_ == null ? void 0 : _.endsWith(`.${i}`));
      });
    });
  }
  function Np(e, t) {
    return t.some((n) => n.columns.length > 0) ? e.filter((n) => n.code !== "W001") : e;
  }
  function Ep(e, t) {
    const n = Up(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Rp(e, t) {
    const n = Kp(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Fp(e, t, n) {
    const r = Hp(t, n);
    return r.size === 0 ? e : e.filter((s) => {
      var _a2;
      const a = s.message.match(/Unknown column '([^']+)'(?: in table '([^']+)')?/);
      if (!a) return true;
      const i = a[1].toLowerCase(), c = (_a2 = a[2]) == null ? void 0 : _a2.toLowerCase();
      return !r.has(i) || !!(c && c !== i);
    });
  }
  function Mp(e, t, n) {
    return n !== "sqlite" || !Jp(t) ? e : e.filter((r) => !/Unknown column '(?:rowid|_rowid_|oid)'/i.test(r.message));
  }
  function Op(e, t, n) {
    const r = Vp(t);
    return r.size === 0 ? e : e.filter((s) => {
      const a = s.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
      if (!a) return true;
      const [, i, c] = a, _ = i.toLowerCase(), l = c.toLowerCase();
      return r.has(_) ? !n.tables.some((m) => m.name.toLowerCase() === l && m.name.toLowerCase() === _) : true;
    });
  }
  function zp(e, t, n) {
    return n !== "oracle" || !Bp(t) ? e : e.filter((r) => !/Unknown column 'user'(?: in table 'dual')?/i.test(r.message));
  }
  function Dp(e, t) {
    const n = Pp(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Bp(e) {
    let t = false;
    return ue(e, (n) => {
      var _a2;
      t || !u(n.column) || (t = !h(n.column.table) && ((_a2 = h(n.column.name)) == null ? void 0 : _a2.toLowerCase()) === "user");
    }), t;
  }
  function Pp(e) {
    const t = /* @__PURE__ */ new Set();
    return ue(e, (n) => {
      var _a2;
      if (!u(n.column)) return;
      const r = (_a2 = h(n.column.name)) == null ? void 0 : _a2.toLowerCase();
      !h(n.column.table) && r && [
        "current_date",
        "current_time",
        "current_timestamp",
        "localtimestamp"
      ].includes(r) && t.add(r);
    }), t;
  }
  function Up(e) {
    const t = /* @__PURE__ */ new Set();
    return ue(e, (n) => {
      if (!(!u(n.function) || !Array.isArray(n.function.args))) for (const r of n.function.args) {
        const s = u(r) ? d(r, "eq") : void 0, a = u(s) && u(s.left) ? d(s.left, "column") : void 0, i = u(a) ? h(a.name) : void 0;
        i && t.add(i.toLowerCase());
      }
    }), t;
  }
  function Vp(e) {
    const t = /* @__PURE__ */ new Set();
    return ue(e, (n) => {
      if (!u(n.function)) return;
      const r = String(n.function.name ?? "").toLowerCase();
      if ([
        "row_to_json",
        "to_json",
        "to_jsonb"
      ].includes(r)) for (const s of I(n.function)) {
        const a = u(s) ? d(s, "column") : void 0;
        if (!u(a)) continue;
        const i = h(a.name);
        i && !h(a.table) && t.add(i.toLowerCase());
      }
    }), t;
  }
  function Kp(e) {
    const t = /* @__PURE__ */ new Set();
    return ue(e, (n) => {
      if (!u(n.function)) return;
      const r = String(n.function.name ?? "").toLowerCase();
      if (![
        "file",
        "url"
      ].includes(r)) return;
      const s = I(n.function)[1], a = u(s) ? d(s, "column") : void 0, i = u(a) && !h(a.table) ? h(a.name) : void 0;
      i && t.add(i.toLowerCase());
    }), t;
  }
  function Hp(e, t) {
    const n = /* @__PURE__ */ new Set();
    return ue(e, (r) => {
      if (!u(r.function)) return;
      const s = String(r.function.name ?? "").toLowerCase();
      if (![
        "highlight",
        "snippet",
        "bm25",
        "fts5vocab"
      ].includes(s)) return;
      const a = I(r.function)[0], i = u(a) ? d(a, "column") : void 0, c = u(i) && !h(i.table) ? h(i.name) : void 0;
      c && t.tables.some((_) => _.name.toLowerCase() === c.toLowerCase()) && n.add(c.toLowerCase());
    }), n;
  }
  function Jp(e) {
    let t = false;
    return ue(e, (n) => {
      var _a2;
      t || !u(n.column) || (t = [
        "rowid",
        "_rowid_",
        "oid"
      ].includes(((_a2 = h(n.column.name)) == null ? void 0 : _a2.toLowerCase()) ?? ""));
    }), t;
  }
  function ue(e, t) {
    if (Array.isArray(e)) {
      e.forEach((n) => ue(n, t));
      return;
    }
    u(e) && (t(e), Object.values(e).forEach((n) => ue(n, t)));
  }
  function Wp(e, t) {
    const n = new Set(t.flatMap((r) => r.source && r.name ? [
      r.name.toLowerCase()
    ] : []));
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function Yp(e, t) {
    const n = new Set(t.flatMap((r) => {
      var _a2;
      const s = ((_a2 = r.source) == null ? void 0 : _a2.toLowerCase().split(".")) ?? [];
      if (s.length < 2) return [];
      const a = s.at(-2), i = s.length >= 3 ? `${s.at(-3)}.${s.at(-2)}` : void 0;
      return [
        a,
        i
      ].filter((c) => !!c);
    }));
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown table '([^']+)'/);
      if (!s) return true;
      const a = s[1].toLowerCase(), i = a.split(".").at(-1);
      return !n.has(a) && !(i && n.has(i));
    });
  }
  function Qp(e, t) {
    return t.some((n) => n.columns.length > 0) ? e.filter((n) => n.code !== "W003") : e;
  }
  function Gp(e, t) {
    return e.filter((n) => {
      const r = n.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
      if (r) {
        const [, s, a] = r;
        return !cg(t, a, s);
      }
      return true;
    });
  }
  function Zp(e, t) {
    return (Array.isArray(t) ? t : [
      t
    ]).some(og) ? e.filter((r) => !/^INSERT row \d+ has \d+ values but target has \d+ columns$/i.test(r.message)) : e;
  }
  function Xp(e, t, n) {
    const r = ig(t, n);
    return r.size === 0 ? e : e.filter((s) => {
      const a = s.message.match(/^(UNION|EXCEPT|INTERSECT) column (\d+) has incompatible types:/i);
      return a ? !r.has(`${a[1].toLowerCase()}:${a[2]}`) : true;
    });
  }
  function eg(e, t, n) {
    return rg(t, n) ? e.filter((r) => !/^Incompatible comparison between .+ and .+$/i.test(r.message)) : e;
  }
  function tg(e, t) {
    const n = ng(t);
    return n.size === 0 ? e : e.filter((r) => {
      const s = r.message.match(/Unknown column '([^']+)'/);
      return !s || !n.has(s[1].toLowerCase());
    });
  }
  function ng(e) {
    const t = /* @__PURE__ */ new Set();
    return ue(e, (n) => {
      var _a2;
      if (!u(n.function)) return;
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
      ].includes(r)) for (const s of I(n.function)) {
        const a = u(s) ? d(s, "column") : void 0, i = u(a) && !h(a.table) ? (_a2 = h(a.name)) == null ? void 0 : _a2.toLowerCase() : void 0;
        i && [
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
        ].includes(i) && t.add(i);
      }
    }), t;
  }
  function rg(e, t) {
    const n = [], r = sg(e, t);
    return ue(e, (s) => {
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
        const i = u(s[a]) ? s[a] : void 0;
        i && u(i.left) && u(i.right) && n.push([
          i.left,
          i.right
        ]);
      }
    }), n.length > 0 && n.every(([s, a]) => {
      if (!Hn(s) || !Hn(a)) return true;
      const i = E(s, "comparison_left", r, {
        mode: "none",
        binds: []
      }, "generic").type, c = E(a, "comparison_right", r, {
        mode: "none",
        binds: []
      }, "generic").type;
      return $s(i, c);
    });
  }
  function Hn(e) {
    return u(d(e, "column")) || u(ys(e));
  }
  function sg(e, t) {
    const n = [
      ...t.tables
    ], r = new Map(t.tables.map((s) => [
      wn(s).toLowerCase(),
      s
    ]));
    for (const s of ag(e)) {
      const a = h(s.alias);
      if (!a) continue;
      const i = Le({
        table: s
      });
      if (!i) continue;
      const c = h(s.schema), _ = c ? `${c}.${i}` : i, l = r.get(_.toLowerCase()) ?? r.get(i.toLowerCase());
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
  function ag(e) {
    const t = [];
    return ue(e, (n) => {
      u(n.table) && t.push(n.table);
    }), t;
  }
  function ig(e, t) {
    const n = /* @__PURE__ */ new Set();
    return ue(e, (r) => {
      for (const s of [
        "union",
        "except",
        "intersect"
      ]) {
        const a = u(r[s]) ? r[s] : void 0;
        if (!a) continue;
        const i = V(a.left, t, tt()), c = V(a.right, t, tt());
        i.forEach((_, l) => {
          const m = c[l];
          if (!m) return;
          const y = E(_.expression, _.name ?? "set_left", _.schema ?? t, {
            mode: "none",
            binds: []
          }, "generic", _.source, _.tableAliases).type, w = E(m.expression, m.name ?? "set_right", m.schema ?? t, {
            mode: "none",
            binds: []
          }, "generic", m.source, m.tableAliases).type;
          $s(y, w) && n.add(`${s}:${l + 1}`);
        });
      }
    }), n;
  }
  function $s(e, t) {
    return e === "unknown" || t === "unknown" ? false : !!(e.toLowerCase() === t.toLowerCase() || Jn(e) && Jn(t));
  }
  function Jn(e) {
    return /(?:decimal|numeric|real|double|float|int|number|bigint|smallint)/i.test(e);
  }
  function og(e) {
    if (!u(e) || !u(e.insert)) return false;
    const t = Array.isArray(e.insert.columns) ? e.insert.columns : [], n = Array.isArray(e.insert.values) ? e.insert.values : [];
    return t.length > 0 && n.length > 0 && n.every((r) => Array.isArray(r) && r.length === t.length);
  }
  function cg(e, t, n) {
    const r = t.toLowerCase().split("."), s = r.at(-1), a = r.length >= 2 ? r.at(-2) : void 0;
    return e.tables.some((i) => {
      var _a2;
      return i.name.toLowerCase() !== s || a && ((_a2 = i.schema) == null ? void 0 : _a2.toLowerCase()) !== a ? false : i.columns.some((c) => c.name.toLowerCase() === n.toLowerCase());
    });
  }
  function ug(e, t, n) {
    const r = Array.isArray(t) ? t : [
      t
    ], s = new Set(n.filter((m) => m.columns.length > 0).map((m) => m.index)), a = r.some((m, y) => s.has(y + 1) && u(m) && u(m.export)), i = r.some((m, y) => s.has(y + 1) && Fs(m, "tsql").length > 0), c = r.some((m, y) => !s.has(y + 1) || !u(m) ? false : js(m) || u(m.show) || Cs(m)), _ = r.some((m, y) => s.has(y + 1) && u(m) && u(m.execute)), l = r.some((m, y) => s.has(y + 1) && u(m) && _n(m));
    return !a && !i && !c && !_ && !l ? e : e.filter((m) => !((a || i || l) && m.code === "E004" || (c || _) && (m.code === "E004" || m.code === "E200" || m.code === "E201")));
  }
  function _g(e, t, n) {
    const r = Array.isArray(t) ? t : [
      t
    ], s = new Set(r.flatMap((a, i) => {
      if (!u(a) || !u(a.execute)) return [];
      if (!n.some((_) => _.index === i + 1 && _.columns.length > 0)) return [];
      const c = mn(a.execute);
      return c ? [
        c.toLowerCase()
      ] : [];
    }));
    return s.size === 0 ? e : e.filter((a) => {
      const i = a.message.match(/Unknown table '([^']+)'/);
      return !i || !s.has(i[1].toLowerCase());
    });
  }
  function lg(e, t) {
    return !t.some((n) => n.resultKind === "runtime") || t.some((n) => n.resultKind === "static" || n.resultKind === "unknown") ? e : e.filter((n) => !(n.code === "E200" || n.code === "E004" || /Invalid expression|Unexpected token/i.test(n.message) || /Unknown table|Unknown column|Unknown table or alias/i.test(n.message)));
  }
  function mg(e, t) {
    return t.length === 0 ? e : e.filter((n) => n.code !== "W004");
  }
  function dg(e, t) {
    return t.some((n) => n.resultKind === "none") ? e.filter((n) => !/Invalid expression|Unexpected token/i.test(n.message)) : e;
  }
  function V(e, t, n = tt(), r = "generic") {
    if (!u(e)) return [];
    if (u(e.select)) {
      const s = Nb(e.select, r);
      if (s.length > 0) return s;
      const a = K({
        tables: [
          ...n.tableFunctions.values()
        ]
      }, t), i = K(Jb(e.select.with, a), a), c = K(Wb(e.select, i, r), i);
      return Xe(e.select.expressions, c, e.select, n, r);
    }
    if (u(e.values)) return zb(e.values, t);
    if (u(e.union)) return Rt(e.union, t, n, r);
    if (u(e.intersect)) return Rt(e.intersect, t, n, r);
    if (u(e.except)) return Rt(e.except, t, n, r);
    if (u(e.pivot)) return Pb(e.pivot, t);
    if (u(e.create_view)) return Mb(e.create_view, t, n, r);
    if (u(e.create_table)) return Ob(e.create_table, t, n, r);
    if (u(e.execute)) return sb(e.execute, t, n, r);
    if (u(e.describe)) return ib(e.describe, t, n, r);
    if (u(e.show)) return ee(e.show, r);
    if (u(e.summarize)) return db();
    if (u(e.pragma)) return zs(e.pragma);
    if (u(e.analyze)) return fb(e.analyze);
    if (u(e.put)) return jb();
    if (As(e)) return [];
    if (u(e.command)) return pb(e.command, t, n, r);
    if (u(e.copy)) return Eb(e.copy, t, n);
    if (u(e.export)) return Rb(e.export, t, n);
    if (u(e.insert)) return Mt(e.insert, t);
    if (u(e.update)) return Mt(e.update, t);
    if (u(e.delete)) return Mt(e.delete, t);
    if (u(e.merge)) return Iy(e.merge, t);
    if (ks(e)) return [];
    if (Ls(e)) return [];
    if (_n(e)) return Fb(e, t);
    {
      const s = Fs(e, r);
      if (s.length > 0) return s;
    }
    return qp(e) ? Xe([
      e
    ], t) : [];
  }
  function fg(e, t, n) {
    if (!u(e)) return {
      tables: []
    };
    if (u(e.create_view)) {
      const r = Fg(e.create_view, t, n);
      return r ? {
        tables: [
          r
        ]
      } : {
        tables: []
      };
    }
    if (u(e.create_table)) {
      const r = Mg(e.create_table, t, n);
      return r ? {
        tables: [
          r
        ]
      } : {
        tables: []
      };
    }
    if (u(e.create_synonym)) {
      const r = zg(e.create_synonym, t);
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
  function pg(e, t, n) {
    if (u(e) && u(e.alter_table)) return vg(e.alter_table, t);
    if (u(e) && u(e.alter_view)) return hg(e.alter_view, t);
    if (u(e) && u(e.raw)) return wg(e.raw, t, n);
    if (u(e) && u(e.drop_table)) return bg(e.drop_table, t);
    if (u(e) && u(e.drop_view)) return yg(e.drop_view, t);
    if (u(e) && u(e.drop_schema)) return It(e.drop_schema, t);
    if (u(e) && u(e.drop_database)) return It(e.drop_database, t);
    if (u(e) && u(e.drop_namespace)) return It(e.drop_namespace, t);
    if (u(e) && u(e.select)) return gg(e.select, t, n);
    const r = fg(e, t, n);
    return K(r, t);
  }
  function gg(e, t, n) {
    if (!u(e.into) || !u(e.into.this) || !u(e.into.this.table)) return t;
    const r = ce(e.into.this.table);
    if (!r) return t;
    const s = V({
      select: e
    }, t, n), a = {
      name: r,
      columns: Se(s, [], t)
    };
    return K({
      tables: [
        a
      ]
    }, t);
  }
  function bg(e, t) {
    const n = Array.isArray(e.names) ? e.names : [];
    return Is(t, n);
  }
  function yg(e, t) {
    return Is(t, [
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
  function wg(e, t, n) {
    const r = typeof e.sql == "string" ? e.sql : "", s = Cg(r);
    if (s) return K({
      tables: [
        s
      ]
    }, t);
    const a = Sg(r, t, n);
    if (a) return K({
      tables: [
        a
      ]
    }, t);
    const i = kg(r, t, n);
    if (i) return K({
      tables: [
        i
      ]
    }, t);
    const c = r.match(/^alter\s+materialized\s+view\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
    if (c) {
      const l = Ye(c[1]), m = Ye(c[2]), y = l.name, w = m.name;
      return !y || !w ? t : {
        tables: t.tables.map((S) => {
          var _a2;
          return S.name.toLowerCase() !== y.toLowerCase() || l.schema && ((_a2 = S.schema) == null ? void 0 : _a2.toLowerCase()) !== l.schema.toLowerCase() ? S : {
            ...S,
            name: w,
            ...m.schema ? {
              schema: m.schema
            } : {}
          };
        })
      };
    }
    const _ = r.match(/^alter\s+(?:schema|database)\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
    if (_) {
      const l = O(_[1].trim()), m = O(_[2].trim());
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
    const t = e.split(".").map((n) => O(n.trim())).filter(Boolean);
    return t.length === 0 ? {} : t.length === 1 ? {
      name: t[0]
    } : {
      schema: t.at(-2),
      name: t.at(-1)
    };
  }
  function hg(e, t) {
    const n = ce(e.name);
    if (!n || !Array.isArray(e.actions)) return t;
    const r = u(e.name) ? h(e.name.schema) : void 0;
    return {
      tables: t.tables.map((s) => {
        var _a2;
        return s.name.toLowerCase() !== n.toLowerCase() || r && ((_a2 = s.schema) == null ? void 0 : _a2.toLowerCase()) !== r.toLowerCase() ? s : xg(s, e.actions);
      })
    };
  }
  function xg(e, t) {
    return t.reduce((n, r) => u(r) && u(r.Rename) ? Ns(n, r.Rename) : n, {
      ...e,
      columns: [
        ...e.columns
      ]
    });
  }
  function Is(e, t) {
    const n = t.flatMap((r) => {
      const s = ce(r), a = u(r) ? h(r.schema) : void 0;
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
  function vg(e, t) {
    const n = ce(e.name);
    if (!n || !Array.isArray(e.actions)) return t;
    const r = e.actions, s = u(e.name) ? h(e.name.schema) : void 0;
    let a = false;
    const i = t.tables.map((c) => {
      var _a2;
      return c.name.toLowerCase() !== n.toLowerCase() || s && ((_a2 = c.schema) == null ? void 0 : _a2.toLowerCase()) !== s.toLowerCase() ? c : (a = true, Wn(c, r));
    });
    return a ? {
      tables: i
    } : {
      tables: [
        Wn({
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
  function Wn(e, t) {
    return t.reduce((n, r) => u(r) ? u(r.RenameTable) ? Ns(n, r.RenameTable) : u(r.AddColumn) ? Tg(n, r.AddColumn.column) : u(r.AddColumns) ? jg(n, r.AddColumns.columns) : u(r.DropColumn) ? Eg(n, r.DropColumn.name) : u(r.RenameColumn) ? Rg(n, r.RenameColumn.old_name, r.RenameColumn.new_name) : u(r.ChangeColumn) ? qg(n, r.ChangeColumn) : u(r.AlterColumn) ? $g(n, r.AlterColumn) : u(r.AddConstraint) ? Ig(n, r.AddConstraint) : u(r.Raw) ? Ng(n, r.Raw) : n : n, {
      ...e,
      columns: [
        ...e.columns
      ]
    });
  }
  function Cg(e) {
    const t = Pr(e, "generic");
    if (t[0]) return t[0];
    const n = Ag(e);
    if (n) return n;
    const r = e.match(/^create\s+(?:global\s+temporary\s+|temporary\s+|temp\s+)?table\s+(.+?)\s*\(([\s\S]*)\)(?:\s+[\s\S]*)?$/i);
    if (!r) return;
    const s = Ye(r[1]);
    if (!s.name) return;
    const a = ie(r[2], ",").map(Lg).filter((i) => !!i);
    return a.length > 0 ? {
      name: s.name,
      ...s.schema ? {
        schema: s.schema
      } : {},
      columns: a
    } : void 0;
  }
  function Ag(e) {
    const t = e.match(/^create\s+virtual\s+table\s+(.+?)\s+using\s+(\w+)\s*\(([\s\S]*)\)(?:\s*[\s\S]*)?$/i);
    if (!t) return;
    const n = Ye(t[1]), r = t[2].toLowerCase();
    if (!n.name || ![
      "fts3",
      "fts4",
      "fts5"
    ].includes(r)) return;
    const s = ie(t[3], ",").flatMap((a) => {
      const i = a.trim();
      if (!i || /=/.test(i)) return [];
      const c = O(i.split(/\s+/)[0] ?? "");
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
  function Sg(e, t, n) {
    const r = e.match(/^create\s+(?:or\s+replace\s+)?(?:recursive\s+)?(?:global\s+temporary\s+|temporary\s+|temp\s+)?(?:materialized\s+)?view\s+(.+?)\s+as\s+([\s\S]+)$/i);
    if (!r) return;
    const s = r[1].trim(), a = r[2].trim(), i = s.match(/^(.+?)(?:\s*\(([\s\S]*)\))?$/), c = Ye((i == null ? void 0 : i[1]) ?? s);
    if (!c.name) return;
    const _ = (i == null ? void 0 : i[2]) ? ie(i[2], ",").map((l) => ({
      name: {
        name: O(l.trim())
      }
    })) : [];
    try {
      const l = Q(a, "postgres");
      if (!l.success) return;
      const y = (Array.isArray(l.ast) ? l.ast : [
        l.ast
      ]).find(u);
      if (!y) return;
      const w = V(y, t, n, "postgres"), S = Se(w, _, t);
      return S.length > 0 ? {
        name: c.name,
        ...c.schema ? {
          schema: c.schema
        } : {},
        columns: S
      } : void 0;
    } catch {
      return;
    }
  }
  function kg(e, t, n) {
    const r = e.match(/^create\s+(?:or\s+replace\s+)?macro\s+(.+?)\s*\([^)]*\)\s+as\s+table\s+([\s\S]+)$/i);
    if (!r) return;
    const s = O(r[1].trim());
    if (!s) return;
    const a = r[2].trim();
    try {
      const i = Q(a, "duckdb");
      if (!i.success) return;
      const _ = (Array.isArray(i.ast) ? i.ast : [
        i.ast
      ]).find(u);
      if (!_) return;
      const l = V(_, t, n, "duckdb"), m = Se(l, [], t);
      return m.length > 0 ? {
        name: s,
        columns: m
      } : void 0;
    } catch {
      return;
    }
  }
  function Lg(e) {
    const t = e.trim();
    if (!t || /^(?:constraint|primary|unique|foreign|check)\b/i.test(t)) return;
    const n = t.match(/^("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/);
    if (!n) return;
    const r = O(n[1]), s = Pe(n[2]) ?? "unknown";
    return {
      name: r,
      type: s,
      nullable: /\bnot\s+null\b/i.test(n[2]) ? false : void 0,
      primaryKey: /\bprimary\s+key\b/i.test(n[2]),
      unique: /\bunique\b/i.test(n[2])
    };
  }
  function Ns(e, t) {
    const n = ce(t), r = u(t) ? h(t.schema) : void 0;
    return n ? {
      ...e,
      name: n,
      ...r ? {
        schema: r
      } : {}
    } : e;
  }
  function Tg(e, t) {
    const n = ln(t);
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
  function jg(e, t) {
    return (Array.isArray(t) ? t.map((r) => ln(r)).filter((r) => !!r) : []).reduce((r, s) => {
      const a = r.columns.filter((i) => i.name.toLowerCase() !== s.name.toLowerCase());
      return {
        ...r,
        columns: [
          ...a,
          s
        ]
      };
    }, e);
  }
  function qg(e, t) {
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
  function $g(e, t) {
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
        if (u(r) && u(r.SetDataType)) {
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
  function Ig(e, t) {
    if (u(t.PrimaryKey)) {
      const n = Yn(t.PrimaryKey);
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
    if (u(t.Index) && String(t.Index.kind ?? "").toLowerCase() === "unique") {
      const n = Yn(t.Index);
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
  function Yn(e) {
    return Array.isArray(e.columns) ? e.columns.map(h).filter((t) => !!t) : [];
  }
  function Ng(e, t) {
    const n = typeof t.sql == "string" ? t.sql : "", r = n.match(/^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i);
    if (r) {
      const a = O(r[1]), i = Pe(r[2]);
      return {
        ...e,
        columns: e.columns.map((c) => c.name.toLowerCase() === a.toLowerCase() ? {
          ...c,
          ...i ? {
            type: i
          } : {}
        } : c)
      };
    }
    const s = n.match(/^set\s+schema\s+(.+)$/i);
    return s ? {
      ...e,
      schema: O(s[1].trim())
    } : e;
  }
  function Pe(e) {
    const t = e.trim().split(/\s+/)[0];
    return t ? se(O(t)) : void 0;
  }
  function Eg(e, t) {
    const n = h(t);
    return n ? {
      ...e,
      columns: e.columns.filter((r) => r.name.toLowerCase() !== n.toLowerCase())
    } : e;
  }
  function Rg(e, t, n) {
    const r = h(t), s = h(n);
    return !r || !s ? e : {
      ...e,
      columns: e.columns.map((a) => a.name.toLowerCase() === r.toLowerCase() ? {
        ...a,
        name: s
      } : a)
    };
  }
  function Fg(e, t, n) {
    const r = ce(e.name);
    if (!r || !u(e.query)) return;
    const s = Qe(e.name), a = Bs(e), i = V(e.query, t, n);
    return {
      name: r,
      ...s ? {
        schema: s
      } : {},
      columns: Se(i, a, t)
    };
  }
  function Mg(e, t, n) {
    const r = ce(e.name);
    if (!r) return;
    const s = Qe(e.name);
    if (u(e.as_select)) {
      const _ = V(e.as_select, t, n), l = Array.isArray(e.columns) ? e.columns : [];
      return {
        name: r,
        ...s ? {
          schema: s
        } : {},
        columns: Se(_, l, t)
      };
    }
    const a = Dg(e, t), i = Array.isArray(e.columns) ? e.columns.map((_) => ln(_, n)).filter((_) => _ !== void 0) : [];
    if (a) return {
      name: r,
      ...s ? {
        schema: s
      } : {},
      columns: Og(a, i)
    };
    const c = i;
    return c.length > 0 ? {
      name: r,
      ...s ? {
        schema: s
      } : {},
      columns: c
    } : void 0;
  }
  function Og(e, t) {
    const n = e.map((r) => ({
      ...r
    }));
    for (const r of t) {
      const s = n.findIndex((a) => a.name.toLowerCase() === r.name.toLowerCase());
      s >= 0 ? n[s] = r : n.push(r);
    }
    return n;
  }
  function zg(e, t) {
    const n = ce(e.name), r = ce(e.target);
    if (!n || !r) return;
    const s = Qe(e.name), a = Qe(e.target), i = t.tables.find((c) => !(c.name.toLowerCase() !== r.toLowerCase() || a && c.schema && c.schema.toLowerCase() !== a.toLowerCase()));
    if (i) return {
      name: n,
      ...s ? {
        schema: s
      } : {},
      columns: i.columns.map((c) => ({
        ...c
      })),
      ...i.primaryKey ? {
        primaryKey: [
          ...i.primaryKey
        ]
      } : {},
      ...i.uniqueKeys ? {
        uniqueKeys: i.uniqueKeys.map((c) => [
          ...c
        ])
      } : {},
      ...i.foreignKeys ? {
        foreignKeys: [
          ...i.foreignKeys
        ]
      } : {}
    };
  }
  function Dg(e, t) {
    var _a2, _b2;
    const n = u(e.clone_source) ? e.clone_source : Bg(e);
    if (!n) return;
    const r = (_a2 = ce(n)) == null ? void 0 : _a2.toLowerCase(), s = u(n) ? (_b2 = h(n.schema)) == null ? void 0 : _b2.toLowerCase() : void 0;
    if (!r) return;
    const a = t.tables.find((i) => {
      var _a3;
      return !(i.name.toLowerCase() !== r || s && ((_a3 = i.schema) == null ? void 0 : _a3.toLowerCase()) !== s);
    });
    return a ? a.columns.map((i) => ({
      ...i
    })) : void 0;
  }
  function Bg(e) {
    if (Array.isArray(e.constraints)) for (const t of e.constraints) {
      const n = u(t) && u(t.Like) ? t.Like : void 0;
      if (n && u(n.source)) return n.source;
    }
  }
  function ce(e) {
    return u(e) ? h(e.name) : void 0;
  }
  function Qe(e) {
    return u(e) ? h(e.schema) : void 0;
  }
  function ln(e, t) {
    var _a2;
    if (!u(e)) return;
    const n = h(e.name);
    if (n && !(n.toLowerCase() === "period" && ((_a2 = Y(e.data_type)) == null ? void 0 : _a2.toLowerCase()) === "for system_time")) return {
      name: n,
      type: tb(e.data_type, t) ?? "unknown",
      nullable: typeof e.nullable == "boolean" ? e.nullable : void 0,
      primaryKey: e.primary_key === true,
      unique: e.unique === true
    };
  }
  function Pg(e, t) {
    if (!u(e) || !u(e.prepare)) return;
    const n = h(e.prepare.name);
    n && u(e.prepare.statement) && t.prepared.set(n.toLowerCase(), e.prepare.statement);
  }
  function Ug(e, t) {
    if (!u(e) || !u(e.create_function)) return;
    const n = e.create_function, r = ce(n.name);
    if (!r) return;
    const s = Qe(n.name), a = Y(n.return_type) ?? Vg(n);
    a && (t.functionReturnTypes.set(r.toLowerCase(), a), s && t.functionReturnTypes.set(`${s.toLowerCase()}.${r.toLowerCase()}`, a));
    const i = Zg(r, n);
    i && t.tableFunctions.set(r.toLowerCase(), i);
  }
  function Vg(e) {
    const t = Kg(e);
    if (!t) return;
    const n = Array.isArray(e.parameters) ? e.parameters.flatMap((r) => {
      if (!u(r)) return [];
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
  function Kg(e) {
    const t = u(e.body) ? e.body : void 0;
    if (t) {
      if (u(t.Return)) return t.Return;
      if (u(t.Expression)) return t.Expression;
    }
  }
  function Hg(e, t, n, r = "generic") {
    if (!u(e) || !u(e.raw)) return;
    const s = typeof e.raw.sql == "string" ? e.raw.sql : "", a = Jg(s);
    if (!a) return;
    const i = Wg(a, t, n, r);
    i && n.functionReturnTypes.set(a.name.toLowerCase(), i);
  }
  function Jg(e) {
    var _a2;
    const t = e.match(/^create\s+(?:or\s+replace\s+)?macro\s+([`"[\]\w$]+)\s*\(([^)]*)\)\s+as\s+(?!table\b)([\s\S]+)$/i);
    if (!t) return;
    const n = O(t[1]), r = (_a2 = t[3]) == null ? void 0 : _a2.trim();
    if (!(!n || !r)) return {
      name: n,
      parameters: ie(t[2] ?? "", ",").map((s) => O(s.trim().split(/\s+/)[0] ?? "")).filter(Boolean),
      expression: r
    };
  }
  function Wg(e, t, n, r) {
    const s = e.parameters.map((i) => ({
      name: i,
      type: "unknown"
    })), a = K({
      tables: [
        {
          name: "__macro_parameters",
          columns: s
        }
      ]
    }, t);
    try {
      const i = Q(`select ${e.expression} as __sqldesc_macro_return from __macro_parameters`, r);
      if (!i.success) return;
      const _ = (Array.isArray(i.ast) ? i.ast : [
        i.ast
      ]).find(u);
      if (!_) return;
      const l = V(_, a, n, r)[0];
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
  function Yg(e, t, n, r = "generic") {
    if (!u(e) || !u(e.create_procedure)) return;
    const s = e.create_procedure, a = ce(s.name);
    if (!a) return;
    const i = Qg(s, t, n, r);
    i.length > 0 && n.procedureResultSets.set(a.toLowerCase(), i);
  }
  function Qg(e, t, n, r = "generic") {
    const s = Gg(e.return_type);
    if (s.length > 0) return p(s.map((c) => [
      c.name,
      c.type
    ]));
    const a = u(e.body) ? e.body : void 0;
    if (a && u(a.Expression)) {
      const c = d(a.Expression, "literal");
      return u(c) && c.literal_type === "dollar_string" && typeof c.value == "string" ? Qn(c.value, t, n, r) : V(a.Expression, t, n, r);
    }
    const i = a && typeof a.RawBlock == "string" ? a.RawBlock : void 0;
    return i ? Qn(i, t, n, r) : [];
  }
  function Qn(e, t, n, r = "generic") {
    const s = e.trim().replace(/^begin\b/i, "").replace(/\bend\s*$/i, "").trim();
    if (!/\bselect\b/i.test(s)) return [];
    try {
      const a = Q(s, r);
      if (!a.success) return [];
      const i = Array.isArray(a.ast) ? a.ast : [
        a.ast
      ];
      for (const c of i) {
        const _ = V(c, t, n, r);
        if (_.length > 0) return _;
      }
    } catch {
      return [];
    }
    return [];
  }
  function Gg(e) {
    var _a2;
    if (!u(e)) return [];
    const n = (_a2 = e.data_type === "custom" && typeof e.name == "string" ? e.name : void 0) == null ? void 0 : _a2.match(/^table\s*\(([\s\S]*)\)$/i);
    return gn(n == null ? void 0 : n[1]);
  }
  function Es(e) {
    return e.map((t) => ({
      ...t
    }));
  }
  function Zg(e, t) {
    const n = typeof t.returns_table_body == "string" ? t.returns_table_body : void 0;
    if (!n) return;
    const r = n.match(/^table\s*\(([\s\S]*)\)$/i), s = gn(r == null ? void 0 : r[1]);
    return s.length > 0 ? {
      name: e,
      columns: s
    } : void 0;
  }
  function Xg(e, t) {
    if (!u(e) || !u(e.create_type)) return;
    const n = ce(e.create_type.name), r = eb(e.create_type.definition);
    n && r && t.typeAliases.set(n.toLowerCase(), r);
  }
  function eb(e) {
    if (!u(e)) return;
    const t = u(e.Domain) ? e.Domain : void 0;
    if (t) return Y(t.base_type);
    if (Array.isArray(e.Enum)) return "text";
    if (Array.isArray(e.Composite)) return `struct<${e.Composite.flatMap((r) => {
      if (!u(r)) return [];
      const s = h(r.name), a = Y(r.data_type) ?? "unknown";
      return s ? [
        `${s} ${a}`
      ] : [];
    }).join(", ")}>`;
  }
  function tb(e, t) {
    const n = Y(e);
    return !n || !t ? n : t.typeAliases.get(n.toLowerCase()) ?? n;
  }
  function nb(e, t) {
    var _a2;
    if (!u(e) || !u(e.command)) return;
    const r = String(e.command.this ?? "").trim().match(/^deallocate(?:\s+prepare)?(?:\s+(.+))?$/i);
    if (!r) return;
    const s = (_a2 = r[1]) == null ? void 0 : _a2.trim();
    if (!s || /^all$/i.test(s)) {
      t.prepared.clear();
      return;
    }
    t.prepared.delete(O(s).toLowerCase());
  }
  function rb(e, t) {
    u(e) && (u(e.drop_function) && Zn(t.functionReturnTypes, Gn(e.drop_function.name)), u(e.drop_procedure) && Zn(t.procedureResultSets, Gn(e.drop_procedure.name)));
  }
  function Gn(e) {
    var _a2, _b2;
    const t = (_a2 = ce(e)) == null ? void 0 : _a2.toLowerCase();
    if (!t) return [];
    const n = u(e) ? (_b2 = h(e.schema)) == null ? void 0 : _b2.toLowerCase() : void 0;
    return n ? [
      `${n}.${t}`,
      t
    ] : [
      t
    ];
  }
  function Zn(e, t) {
    for (const n of t) if (e.delete(n), !n.includes(".")) for (const r of [
      ...e.keys()
    ]) r.endsWith(`.${n}`) && e.delete(r);
  }
  function sb(e, t, n, r = "generic") {
    const s = Rs(e);
    if (s.length > 0) return s;
    const a = mn(e), i = a ? n.prepared.get(a.toLowerCase()) : void 0;
    if (i) return V(i, t, n, r);
    const c = a ? n.procedureResultSets.get(a.toLowerCase()) : void 0;
    return c ? Es(c) : [];
  }
  function Rs(e) {
    var _a2;
    const t = ab(e);
    if (t.length > 0) return t;
    const n = (_a2 = mn(e)) == null ? void 0 : _a2.toLowerCase();
    return Ge(n);
  }
  function Fs(e, t) {
    var _a2, _b2;
    if (t !== "tsql" || !u(e)) return [];
    const n = d(e, "column");
    if (u(n) && !h(n.table)) {
      const a = (_a2 = h(n.name)) == null ? void 0 : _a2.toLowerCase();
      if (a == null ? void 0 : a.startsWith("sp_")) return Ge(a);
    }
    const r = d(e, "alias");
    if (!u(r)) return [];
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
  function ab(e) {
    const t = typeof e.suffix == "string" ? e.suffix : void 0;
    if (!t) return [];
    const n = t.match(/\bwith\s+result\s+sets\s*\(\s*\((.*)\)\s*\)\s*$/i);
    return n ? ie(n[1], ",").flatMap((r) => {
      const a = r.trim().match(/^([`"[\]\w@$#]+)\s+(.+)$/);
      if (!a) return [];
      const i = O(a[1].replace(/^\[/, "").replace(/\]$/, "")), c = Pe(a[2]) ?? "unknown";
      return i ? p([
        [
          i,
          c
        ]
      ]) : [];
    }) : [];
  }
  function Jt(e) {
    if (!e) return;
    const t = e.trim().match(/^(?:call|exec(?:ute)?)\s+([^\s(;]+)/i);
    return t ? O(t[1]).toLowerCase() : void 0;
  }
  function ib(e, t, n, r = "generic") {
    const s = u(e.target) ? e.target : void 0;
    if (String(e.kind ?? "").toLowerCase() === "function") return lb(r);
    if (!s) return [];
    const a = cb(String(e.style ?? "").toLowerCase());
    if (a.length > 0) return a;
    const i = ob(e, s);
    if (i.length > 0) return i;
    const c = _b(s, r);
    if (c.length > 0) return c;
    const _ = ub(s);
    return _.length > 0 ? _ : u(s.table) ? bt(s.table, t) : mb(s) ? Ms(r) : V(s, t, n, r);
  }
  function ob(e, t) {
    var _a2;
    if (String(e.kind ?? "").toLowerCase() !== "table" || !u(t.table)) return [];
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
  function cb(e) {
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
  function ub(e) {
    var _a2;
    if (!u(e.table)) return [];
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
  function _b(e, t) {
    var _a2;
    if (t.toLowerCase() !== "snowflake" || !u(e.table)) return [];
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
  function lb(e) {
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
  function Ms(e) {
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
  function mb(e) {
    return [
      "select",
      "values",
      "union",
      "intersect",
      "except"
    ].some((t) => u(e[t]));
  }
  function ee(e, t = "generic") {
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
    if (n === "grants") return Et(t) ? p([
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
    if (n === "future grants") return ee({
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
    if (n === "storage engines") return ee({
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
    if (n === "master logs") return ee({
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
    if (n.startsWith("profile ")) return ee({
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
    if (n.startsWith("create schema")) return Et(t) ? p([
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
    if (n.startsWith("create database") && Et(t)) return p([
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
        Xn(((_a2 = n.match(/^create\s+(table|view|schema)/)) == null ? void 0 : _a2[0]) ?? n),
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
          Xn(s),
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
  function db() {
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
  function fb(e) {
    return String(e.kind ?? "").toLowerCase() === "table" || u(e.this) ? Os() : [];
  }
  function pb(e, t, n, r) {
    const s = String(e.this ?? "").toLowerCase(), a = gb(e, t, n, r);
    if (a.length > 0) return a;
    const i = bb(e, t, n, r);
    if (i.length > 0) return i;
    const c = n.procedureResultSets.get(Jt(s) ?? "");
    if (c) return Es(c);
    const _ = Ge(Jt(s));
    return _.length > 0 ? _ : /^(optimize|repair|check|checksum)\s+table\b/.test(s) ? Os() : /^(?:list|ls)\s+@/.test(s) ? qb() : /^get\s+@/.test(s) ? $b() : /^(?:remove|rm)\s+@/.test(s) ? Ib() : /^exists\s+(?:table|database|view|dictionary)\b/.test(s) ? p([
      [
        "result",
        "boolean"
      ]
    ]) : /^explain\b/.test(s) ? Ms(r) : /^show\s+clusters\b/.test(s) ? hb() : /^show\s+users\b/.test(s) ? xb() : /^show\s+roles\b/.test(s) ? vb() : /^show\s+grants\b/.test(s) ? Cb() : /^show\s+settings\b/.test(s) ? wb() : /^show\s+dictionaries\b/.test(s) ? Ab() : /^show\s+engines\b/.test(s) ? p([
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
    ]) : /^list\s+(?:file|jar|archive)\b/.test(s) ? Tb() : /^show\s+databases\b/.test(s) ? ee({
      this: "databases"
    }) : /^show\s+schemas\b/.test(s) ? ee({
      this: "schemas"
    }) : /^show\s+tables\b/.test(s) ? ee({
      this: "tables"
    }) : /^show\s+views\b/.test(s) ? ee({
      this: "views"
    }) : /^show\s+materialized\s+views\b/.test(s) ? ee({
      this: "materialized views"
    }) : /^show\s+table\b/.test(s) ? ee({
      this: "tables"
    }) : /^show\s+columns\b/.test(s) ? ee({
      this: "columns"
    }) : /^show\s+indexes\b/.test(s) ? ee({
      this: "indexes"
    }) : /^show\s+variables\b/.test(s) ? ee({
      this: "variables"
    }) : /^show\s+catalogs\b/.test(s) ? ee({
      this: "catalogs"
    }) : /^show\s+current\s+namespace\b/.test(s) ? ee({
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
    ]) : /^show\s+processes\b/.test(s) ? Sb() : /^show\s+merges\b/.test(s) ? kb() : /^show\s+mutations\b/.test(s) ? Lb() : /^(?:describe|desc)(?:\s+table)?\s+\S+/.test(s) ? p([
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
  function gb(e, t, n, r) {
    const s = yb(String(e.this ?? ""));
    if (!s) return [];
    try {
      const a = Q(s, r);
      if (!a.success) return [];
      const c = (Array.isArray(a.ast) ? a.ast : [
        a.ast
      ]).find(u);
      return c ? V(c, t, n, r) : [];
    } catch {
      return [];
    }
  }
  function bb(e, t, n, r) {
    const s = String(e.this ?? "").trim().replace(/^begin\s+/i, "");
    if (!/^select\b/i.test(s)) return [];
    try {
      const a = Q(s, r);
      if (!a.success) return [];
      const c = (Array.isArray(a.ast) ? a.ast : [
        a.ast
      ]).find(u);
      return c ? V(c, t, n, r) : [];
    } catch {
      return [];
    }
  }
  function yb(e) {
    const t = e.match(/^execute\s+immediate\s+'((?:''|[^'])*)'/i);
    return t ? t[1].replace(/''/g, "'") : void 0;
  }
  function wb() {
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
  function hb() {
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
  function xb() {
    return p([
      [
        "name",
        "text"
      ]
    ]);
  }
  function vb() {
    return p([
      [
        "name",
        "text"
      ]
    ]);
  }
  function Cb() {
    return p([
      [
        "GRANTS",
        "text"
      ]
    ]);
  }
  function Ab() {
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
  function Sb() {
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
  function kb() {
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
  function Lb() {
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
  function Tb() {
    return p([
      [
        "resource",
        "text"
      ]
    ]);
  }
  function jb() {
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
  function qb() {
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
  function $b() {
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
  function Ib() {
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
  function Os() {
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
  function Xn(e) {
    return e === "create database" ? "Create Database" : e === "create event" ? "Create Event" : e === "create function" ? "Create Function" : e === "create procedure" ? "Create Procedure" : e === "create schema" ? "Create Schema" : e === "create trigger" ? "Create Trigger" : e === "create user" ? "Create User" : e === "create view" ? "Create View" : "Create Table";
  }
  function zs(e) {
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
  function Et(e) {
    return [
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(e.toLowerCase());
  }
  function Nb(e, t) {
    return t !== "tsql" ? [] : Array.isArray(e.for_json) && e.for_json.length > 0 ? p([
      [
        "",
        "json"
      ]
    ]) : Array.isArray(e.for_xml) && e.for_xml.length > 0 ? p([
      [
        "",
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
  function Eb(e, t, n) {
    if (Ss(e)) return [];
    const r = er(e.this, t, n);
    if (r.length > 0) return r;
    const s = Array.isArray(e.files) ? e.files : [];
    for (const a of s) {
      const i = er(a, t, n);
      if (i.length > 0) return i;
    }
    return [];
  }
  function Rb(e, t, n) {
    return u(e.this) ? V(e.this, t, n) : [];
  }
  function er(e, t, n) {
    if (!u(e)) return [];
    if (u(e.subquery) && u(e.subquery.this)) return V(e.subquery.this, t, n);
    if (u(e.select) || u(e.values) || u(e.union) || u(e.intersect) || u(e.except)) return V(e, t, n);
    if (u(e.table)) return bt(e.table, t);
    if (u(e.column)) {
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
  function Fb(e, t) {
    const n = u(e.alias) ? e.alias : void 0, r = n ? h(n.alias) : void 0;
    return r ? bt({
      name: {
        name: r
      }
    }, t) : [];
  }
  function mn(e) {
    const t = u(e.this) ? d(e.this, "table") : void 0;
    return u(t) ? h(t.name) : h(e.this);
  }
  function Mb(e, t, n, r = "generic") {
    return u(e.query) ? Ds(V(e.query, t, n, r), Bs(e)) : [];
  }
  function Ob(e, t, n, r = "generic") {
    return u(e.as_select) ? Ds(V(e.as_select, t, n, r), e.columns) : [];
  }
  function Ds(e, t) {
    const n = Array.isArray(t) ? t : [];
    return n.length === 0 ? e : e.map((r, s) => ({
      ...r,
      name: dn(n[s]) ?? r.name
    }));
  }
  function dn(e) {
    return u(e) && u(e.column_def) ? dn(e.column_def) : u(e) ? h(e.name) ?? h(e) : h(e);
  }
  function Bs(e) {
    return Array.isArray(e.columns) && e.columns.length > 0 ? e.columns : u(e.schema) && Array.isArray(e.schema.expressions) ? e.schema.expressions : [];
  }
  function zb(e, t) {
    const n = Array.isArray(e.expressions) ? e.expressions : [], r = n.find(u), s = u(r) && Array.isArray(r.expressions) ? r.expressions : [], a = Array.isArray(e.column_aliases) ? e.column_aliases : [];
    return s.filter(u).map((i, c) => ({
      expression: Db(n, c, i, t),
      name: h(a[c]) ?? `column_${c + 1}`
    }));
  }
  function Db(e, t, n, r) {
    const s = e.flatMap((i) => u(i) && Array.isArray(i.expressions) && u(i.expressions[t]) ? [
      i.expressions[t]
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
  function Rt(e, t, n, r) {
    const s = V(e.left, t, n, r), a = V(e.right, t, n, r);
    return s.map((i, c) => {
      const _ = a[c], l = Bb([
        i,
        _
      ].filter((m) => !!m), t);
      return {
        ...i,
        expression: l ? Hb(l) : i.expression
      };
    });
  }
  function Bb(e, t) {
    const n = e.map((r) => E(r.expression, r.name ?? "set_column", r.schema ?? t, {
      mode: "none",
      binds: []
    }, "generic", r.source, r.tableAliases).type).filter((r) => r !== "unknown");
    return ps(n);
  }
  function Pb(e, t) {
    const n = e.unpivot ? Vs(Vb(e), t) : Us(Ub(e), t);
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
  function Ub(e) {
    return {
      ...e,
      this: Ps(e.this),
      expressions: Array.isArray(e.using) ? e.using : e.expressions,
      fields: Array.isArray(e.fields) && e.fields.length > 0 ? e.fields : [
        {
          in: {
            this: Kb(e.expressions),
            expressions: []
          }
        }
      ]
    };
  }
  function Vb(e) {
    const t = u(e.into) && u(e.into.unpivot_columns) ? e.into.unpivot_columns : void 0;
    return {
      ...e,
      this: Ps(e.this),
      columns: e.expressions,
      name_column: t == null ? void 0 : t.this,
      value_column: Array.isArray(t == null ? void 0 : t.expressions) ? t.expressions[0] : void 0
    };
  }
  function Ps(e) {
    if (u(e) && u(e.column)) {
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
  function Kb(e) {
    return Array.isArray(e) ? e.find(u) : void 0;
  }
  function Hb(e) {
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
  function Jb(e, t) {
    if (!u(e) || !Array.isArray(e.ctes)) return {
      tables: []
    };
    const n = [];
    for (const r of e.ctes) {
      if (!u(r)) continue;
      const s = h(r.alias);
      if (!s) continue;
      const a = Array.isArray(r.columns) ? r.columns : [], i = V(r.this, K(t, {
        tables: n
      }));
      n.push({
        name: s,
        columns: Se(i, a, K(t, {
          tables: n
        }))
      });
    }
    return {
      tables: n
    };
  }
  function Wb(e, t, n = "generic") {
    const r = [];
    Array.isArray(e.lateral_views) && r.push(...e.lateral_views.filter(u).flatMap((s) => ey(s, K({
      tables: r
    }, t))));
    for (const s of yn(e)) {
      const a = Yb(s, K({
        tables: r
      }, t));
      if (a) {
        r.push(a);
        continue;
      }
      const i = u(s.subquery) ? s.subquery : void 0;
      if (i) {
        const w = h(i.alias);
        if (!w) continue;
        const S = Array.isArray(i.column_aliases) ? i.column_aliases : [], N = V(i.this, K(t, {
          tables: r
        }));
        r.push({
          name: w,
          columns: Se(N, S, K(t, {
            tables: r
          }))
        });
        continue;
      }
      const c = ny(s, K({
        tables: r
      }, t), n);
      if (c && !r.some((w) => w.name.toLowerCase() === c.name.toLowerCase())) {
        r.push(c);
        continue;
      }
      const _ = wy(s);
      if (_ && !r.some((w) => w.name.toLowerCase() === _.name.toLowerCase())) {
        r.push(_);
        continue;
      }
      const l = vy(s);
      if (l && !r.some((w) => w.name.toLowerCase() === l.name.toLowerCase())) {
        r.push(l);
        continue;
      }
      const m = Cy(s);
      if (m && !r.some((w) => w.name.toLowerCase() === m.name.toLowerCase())) {
        r.push(m);
        continue;
      }
      const y = ky(s, K({
        tables: r
      }, t));
      y && !r.some((w) => w.name.toLowerCase() === y.name.toLowerCase()) && r.push(y);
    }
    return {
      tables: r
    };
  }
  function Yb(e, t) {
    const n = u(e.pivot) ? e.pivot : void 0, r = u(e.unpivot) ? e.unpivot : void 0;
    if (n) return Us(n, t);
    if (r) return Vs(r, t);
  }
  function Us(e, t) {
    const n = fn(e, t), r = h(e.alias) ?? (n == null ? void 0 : n.name);
    if (!n || !r) return;
    const s = Qb(e), a = Array.isArray(e.expressions) ? e.expressions.flatMap(Ze) : [], i = new Set([
      ...s,
      ...a
    ].map((m) => m.toLowerCase())), c = n.columns.filter((m) => !i.has(m.name.toLowerCase())), _ = Gb(e), l = Xb(e, t) ?? "unknown";
    return {
      name: r,
      columns: [
        ...c,
        ..._.map((m) => ({
          name: m,
          type: l
        }))
      ]
    };
  }
  function Vs(e, t) {
    const n = fn(e, t), r = h(e.alias) ?? (n == null ? void 0 : n.name), s = h(e.value_column), a = h(e.name_column);
    if (!n || !r || !s || !a) return;
    const i = Array.isArray(e.columns) ? e.columns.flatMap(Ze) : [], c = new Set(i.map((l) => l.toLowerCase())), _ = i.map((l) => {
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
          type: _
        }
      ]
    };
  }
  function fn(e, t) {
    const n = u(e.this) ? e.this : void 0, r = Le(n ?? {});
    if (r) return t.tables.find((s) => s.name.toLowerCase() === r.toLowerCase());
  }
  function Qb(e) {
    return Array.isArray(e.fields) ? e.fields.flatMap((t) => u(t) && u(t.in) ? Ze(t.in.this) : []) : [];
  }
  function Gb(e) {
    return Array.isArray(e.fields) ? e.fields.flatMap((t) => (u(t) && u(t.in) && Array.isArray(t.in.expressions) ? t.in.expressions : []).map(Zb).filter((r) => !!r)) : [];
  }
  function Zb(e) {
    const t = u(e) ? e.literal : void 0;
    if (u(t)) return O(String(t.value ?? ""));
    const n = u(e) ? e.column : void 0;
    if (u(n)) return h(n.name);
  }
  function Xb(e, t) {
    const n = Array.isArray(e.expressions) ? e.expressions.find(u) : void 0;
    return n ? cn(n, t, {
      mode: "none",
      binds: []
    }) : void 0;
  }
  function Ze(e) {
    if (!u(e)) return [];
    const t = d(e, "column");
    if (u(t)) {
      const n = h(t.name);
      return n ? [
        n
      ] : [];
    }
    return Object.values(e).flatMap((n) => Array.isArray(n) ? n.flatMap(Ze) : Ze(n));
  }
  function ey(e, t) {
    const n = h(e.table_alias), r = Array.isArray(e.column_aliases) ? e.column_aliases.map(h).filter((a) => !!a) : [];
    if (!n || r.length === 0) return [];
    const s = ty(e.this, t);
    return [
      {
        name: n,
        columns: r.map((a, i) => ({
          name: a,
          type: s[i] ?? s[0] ?? "unknown"
        }))
      }
    ];
  }
  function ty(e, t) {
    if (!u(e)) return [];
    const n = d(e, "explode");
    if (u(n)) return Ft(n.this, t);
    const r = d(e, "function");
    if (!u(r)) return [];
    const s = String(r.name ?? "").toLowerCase();
    return s === "explode" || s === "explode_outer" ? Ft(et(I(r)), t) : s === "posexplode" || s === "posexplode_outer" ? [
      "integer",
      ...Ft(et(I(r)), t)
    ] : [];
  }
  function Ft(e, t) {
    if (!u(e)) return [
      "unknown"
    ];
    const n = Ws(e, t);
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
      J(r.type) ?? r.type
    ];
  }
  function ny(e, t, n = "generic") {
    const r = u(e.alias) ? e.alias : void 0, s = u(e.lateral) ? e.lateral : void 0;
    if (s) return Ty(s, t);
    const a = sy(e, t);
    if (a) return a;
    const i = ay(e, t, n);
    if (i) return i;
    if (!r || !(u(r.this) && (u(r.this.function) || u(r.this.unnest)))) return;
    const c = h(r.alias), _ = Array.isArray(r.column_aliases) ? r.column_aliases.map(h).filter((y) => !!y) : [];
    if (c) {
      const y = ry(r.this), w = y ? t.tables.find((N) => N.name.toLowerCase() === y.toLowerCase()) : void 0;
      if (w) {
        const N = {
          ...w,
          name: c
        };
        return _.length > 0 ? tr(N, _) : N;
      }
      const S = pn(r.this, c, t, n);
      if (S) return _.length > 0 ? tr(S, _) : S;
    }
    const l = _.length > 0 ? _ : c ? [
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
  function ry(e) {
    const t = d(e, "function");
    return u(t) ? bn(t) : void 0;
  }
  function tr(e, t) {
    return {
      ...e,
      columns: e.columns.map((n, r) => ({
        ...n,
        name: t[r] ?? n.name
      }))
    };
  }
  function sy(e, t) {
    const n = u(e.tuple) && Array.isArray(e.tuple.expressions) ? e.tuple.expressions : [], r = n.find((l) => u(l) && u(l.function)), s = n.find((l) => u(l) && u(l.table_alias));
    if (!u(r) || !u(s) || !u(s.table_alias)) return;
    const a = h(s.table_alias.this);
    if (!a) return;
    const c = (Array.isArray(s.table_alias.columns) ? s.table_alias.columns : []).flatMap((l) => {
      const m = u(l) && u(l.column_def) ? l.column_def : void 0, y = m ? h(m.name) : void 0;
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
    const _ = u(r.function) ? String(r.function.name ?? "").toLowerCase() : "";
    return {
      name: a,
      columns: [
        {
          name: a,
          type: Ks(_, r, t)
        }
      ]
    };
  }
  function ay(e, t, n = "generic") {
    if (u(e.function)) {
      const r = String(e.function.name ?? "").toLowerCase(), s = t.tables.find((i) => i.name.toLowerCase() === r);
      if (s) return s;
      const a = pn(e, r, t, n);
      return a || {
        name: r,
        columns: [
          {
            name: r,
            type: Ks(r, e, t)
          }
        ]
      };
    }
    if (u(e.unnest)) {
      const r = e.unnest, s = h(r.alias), a = h(r.offset_alias), i = s ?? "unnest", c = $y(r, t);
      if (c.length > 0) return {
        name: i,
        columns: oy(c, a, r)
      };
      const _ = vt(e, t);
      return {
        name: i,
        columns: _.length > 0 ? _.map((l, m) => ({
          name: iy(m, s, a, r),
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
  function iy(e, t, n, r) {
    const s = vt({
      unnest: r
    }, {
      tables: []
    }).length;
    return n && r.with_ordinality === true && e === s - 1 ? n : e === 0 ? t ?? "unnest" : `unnest_${e + 1}`;
  }
  function oy(e, t, n) {
    return n.with_ordinality === true ? [
      ...e,
      {
        name: t ?? "ordinality",
        type: "integer"
      }
    ] : e;
  }
  function pn(e, t, n, r = "generic") {
    const s = d(e, "function");
    if (!u(s)) return;
    const a = bn(s);
    if (a === "table") {
      const i = I(s).find(u), c = yy(i, t);
      if (c) return c;
      const _ = by(i);
      if (_) return {
        name: t,
        columns: [
          {
            name: t,
            type: _
          }
        ]
      };
      const l = u(i) ? pn(i, t, n, r) : void 0;
      if (l) return l;
    }
    if (a === "flatten") return Js(t);
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
    if (a === "stack") return uy(s, t, n);
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
      const i = I(s)[0], c = u(i) ? d(i, "cast") : void 0, _ = u(c) && u(c.to) ? O(String(c.to.name ?? c.to.data_type ?? "")) : void 0, l = _ ? n.tables.find((m) => m.name.toLowerCase() === _.toLowerCase()) : void 0;
      if (l) return {
        ...l,
        name: t
      };
    }
    if (a === "generate_series" || a === "range") {
      const i = B(I(s), {
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
            type: i && /date|time|timestamp/i.test(i) ? i : "integer"
          }
        ]
      };
    }
    if (a === "fts5vocab") return py(s, t);
    if (a.startsWith("pragma_")) return gy(a, t);
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
      const i = cy(I(s)), c = i ? n.tables.find((_) => _.name.toLowerCase() === i.toLowerCase()) : void 0;
      if (c) return {
        ...c,
        name: t
      };
    }
    if (a === "sequence") {
      const i = B(I(s), {
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
            type: i
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
      const i = B(I(s), {
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
            type: i
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
      const i = _y(s);
      if (i.length > 0) return {
        name: t,
        columns: i
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
      const i = gn(my(I(s)));
      if (i.length > 0) return {
        name: t,
        columns: i
      };
    }
    if ([
      "mysql",
      "postgresql",
      "odbc",
      "jdbc"
    ].includes(a)) {
      const i = I(s), c = a === "mysql" || a === "postgresql" ? nt(i[2]) : fy(i), _ = c ? n.tables.find((l) => l.name.toLowerCase() === c.toLowerCase()) : void 0;
      if (_) return {
        ..._,
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
      const i = dy(s, t, n);
      if (i) return i;
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
  function cy(e) {
    const t = e[2] ?? e.at(-1);
    if (!t) return;
    const n = u(t) ? d(t, "column") : void 0;
    return nt(t) ?? (u(n) ? h(n.name) : void 0);
  }
  function uy(e, t, n) {
    const r = I(e), s = bp(r[0]) ?? 1, a = r.slice(1), i = Math.max(1, Math.ceil(a.length / Math.max(1, s)));
    return {
      name: t,
      columns: Array.from({
        length: i
      }, (c, _) => {
        const l = a.filter((m, y) => y % i === _);
        return {
          name: `col${_}`,
          type: B(l, n, {
            mode: "none",
            binds: []
          }) ?? "unknown"
        };
      })
    };
  }
  function _y(e) {
    var _a2;
    for (const t of I(e)) {
      const n = d(t, "eq");
      if (!u(n) || ((_a2 = u(n.left) ? h(d(n.left, "column") && d(n.left, "column").name) : void 0) == null ? void 0 : _a2.toLowerCase()) !== "columns") continue;
      const s = ly(n.right);
      if (s.length > 0) return s;
    }
    return [];
  }
  function ly(e) {
    const t = u(e) ? d(e, "map_func") : void 0;
    if (!u(t) || !Array.isArray(t.keys) || !Array.isArray(t.values)) return [];
    const n = t.keys, r = t.values;
    return n.flatMap((s, a) => {
      const i = je(s), c = je(r[a]);
      return !i || !c ? [] : [
        {
          name: i,
          type: Pe(c) ?? "unknown"
        }
      ];
    });
  }
  function gn(e) {
    return e ? ie(e, ",").flatMap((t) => {
      const n = t.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
      if (!n) return [];
      const r = O(n[1]), s = Pe(n[2]) ?? "unknown";
      return r ? [
        {
          name: r,
          type: s
        }
      ] : [];
    }) : [];
  }
  function my(e) {
    for (let t = e.length - 1; t >= 0; t -= 1) {
      const n = je(e[t]);
      if (n && /\w+\s+\w+/.test(n)) return n;
    }
  }
  function dy(e, t, n) {
    const r = I(e).map(nt);
    let s;
    for (let a = r.length - 1; a >= 0; a -= 1) {
      const i = r[a];
      if (i !== void 0 && /^(?:with|select|values)\b/i.test(i.trim())) {
        s = i;
        break;
      }
    }
    if (s) try {
      const a = Q(s, "tsql");
      if (!a.success) return;
      const c = (Array.isArray(a.ast) ? a.ast : [
        a.ast
      ]).find(u);
      if (!c) return;
      const _ = V(c, n, tt(), "tsql"), l = Se(_, [], n);
      return l.length > 0 ? {
        name: t,
        columns: l
      } : void 0;
    } catch {
      return;
    }
  }
  function nt(e) {
    const t = u(e) ? e.literal : void 0;
    return u(t) && t.literal_type === "string" ? String(t.value ?? "") : void 0;
  }
  function fy(e) {
    for (let t = e.length - 1; t >= 0; t -= 1) {
      const n = nt(e[t]);
      if (n) return n;
    }
  }
  function bn(e) {
    return String(e.name ?? "").toLowerCase().split(".").at(-1) ?? "";
  }
  function Ks(e, t, n) {
    if (e === "regexp_matches") return "array<text>";
    if (e === "string_split") return "text";
    if (e === "generate_series" || e === "range") {
      const r = d(t, "function"), s = u(r) ? B(I(r), n, {
        mode: "none",
        binds: []
      }) : void 0;
      return s && /date|time|timestamp/i.test(s) ? s : "integer";
    }
    return "unknown";
  }
  function py(e, t) {
    var _a2;
    const n = (_a2 = nt(I(e)[1])) == null ? void 0 : _a2.toLowerCase(), r = [
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
  function gy(e, t) {
    const n = e.replace(/^pragma_/, ""), r = zs({
      name: {
        name: n
      }
    });
    if (r.length !== 0) return {
      name: t,
      columns: Se(r, [], {
        tables: []
      })
    };
  }
  function by(e) {
    var _a2;
    const t = u(e) && u(e.method_call) ? e.method_call : void 0;
    if (!t) return;
    const n = (_a2 = h(t.method)) == null ? void 0 : _a2.toLowerCase();
    if (n) {
      if (/numberlist$/.test(n)) return "number";
      if (/varchar2list$/.test(n) || /varcharlist$/.test(n)) return "text";
      if (/datelist$/.test(n)) return "date";
    }
  }
  function yy(e, t) {
    var _a2, _b2;
    const n = u(e) ? d(e, "column") : void 0;
    if (!u(n)) return;
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
  function wy(e) {
    const t = u(e.open_j_s_o_n) ? e.open_j_s_o_n : u(e.alias) && u(e.alias.this) && u(e.alias.this.open_j_s_o_n) ? e.alias.this.open_j_s_o_n : void 0;
    if (!t) return;
    const n = u(e.alias) ? h(e.alias.alias) ?? "openjson" : "openjson", r = hy(t);
    return {
      name: n,
      columns: r.length > 0 ? r : xy()
    };
  }
  function hy(e) {
    return (Array.isArray(e.expressions) ? e.expressions : []).flatMap((n) => {
      const r = u(n) && u(n.open_j_s_o_n_column_def) ? n.open_j_s_o_n_column_def : void 0, s = r ? h(r.this) : void 0;
      return !r || !s ? [] : [
        {
          name: s,
          type: Y(r.data_type) ?? (r.as_json ? "json" : "unknown")
        }
      ];
    });
  }
  function xy() {
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
  function vy(e) {
    const t = u(e.alias) ? e.alias : void 0, n = u(e.j_s_o_n_table) ? e.j_s_o_n_table : t && u(t.this) && u(t.this.j_s_o_n_table) ? t.this.j_s_o_n_table : void 0, r = t ? h(t.alias) : "json_table";
    if (!n || !r) return;
    const s = Hs(n);
    return s.length > 0 ? {
      name: r,
      columns: s
    } : void 0;
  }
  function Cy(e) {
    const t = u(e.alias) ? e.alias : void 0, n = u(e.x_m_l_table) ? e.x_m_l_table : t && u(t.this) && u(t.this.x_m_l_table) ? t.this.x_m_l_table : void 0, r = t ? h(t.alias) : "xmltable";
    if (!n || !r) return;
    const s = Array.isArray(n.columns) ? n.columns.flatMap((a) => {
      const i = u(a) && u(a.column_def) ? a.column_def : void 0, c = i ? h(i.name) : void 0;
      return !i || !c ? [] : [
        {
          name: c,
          type: Y(i.data_type) ?? "unknown",
          nullable: typeof i.nullable == "boolean" ? i.nullable : void 0
        }
      ];
    }) : [];
    return s.length > 0 ? {
      name: r,
      columns: s
    } : void 0;
  }
  function Hs(e) {
    const t = u(e.schema) && u(e.schema.j_s_o_n_schema) ? e.schema.j_s_o_n_schema : u(e.j_s_o_n_schema) ? e.j_s_o_n_schema : void 0;
    return (t && Array.isArray(t.expressions) ? t.expressions : []).flatMap(Ay);
  }
  function Ay(e) {
    if (!u(e) || !u(e.j_s_o_n_column_def)) return [];
    const t = e.j_s_o_n_column_def;
    if (u(t.nested_schema)) return Hs(t.nested_schema);
    const n = h(t.this);
    return n ? [
      {
        name: n,
        type: t.ordinality ? "integer" : Sy(t.kind)
      }
    ] : [];
  }
  function Sy(e) {
    return typeof e != "string" || e.length === 0 ? "unknown" : se(e);
  }
  function ky(e, t) {
    const n = u(e.match_recognize) ? e.match_recognize : void 0;
    if (!n) return;
    const r = fn(n, t), s = h(n.alias) ?? (r == null ? void 0 : r.name);
    if (!(!r || !s)) return {
      name: s,
      columns: [
        ...r.columns,
        ...Ly(n, t)
      ]
    };
  }
  function Ly(e, t) {
    return (Array.isArray(e.measures) ? e.measures : []).flatMap((r) => {
      const s = u(r) ? r.this : void 0;
      if (!u(s)) return [];
      const a = rt(s), i = a.name ?? ge(a.expression, 1), c = E(a.expression, i, t, {
        mode: "none",
        binds: []
      }, "generic");
      return [
        {
          name: i,
          type: c.type,
          nullable: c.nullable
        }
      ];
    });
  }
  function Ty(e, t) {
    const n = h(e.alias), r = Array.isArray(e.column_aliases) ? e.column_aliases.map(h).filter((i) => !!i) : [];
    if (!n) return;
    const s = jy(e.this, n);
    if (s) return s;
    if (r.length === 0) return;
    const a = vt(e.this, t);
    return {
      name: n,
      columns: r.map((i, c) => ({
        name: i,
        type: a[c] ?? a[0] ?? "unknown"
      }))
    };
  }
  function jy(e, t) {
    const n = d(e, "function");
    if (!(!u(n) || String(n.name ?? "").toLowerCase() !== "flatten")) return Js(t);
  }
  function Js(e) {
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
    if (!u(e)) return [];
    const n = d(e, "unnest");
    if (u(n)) {
      const a = qy(n, t);
      if (a) return n.with_ordinality === true ? [
        ...a,
        "integer"
      ] : a;
      const c = [
        ...u(n.this) ? [
          n.this
        ] : [],
        ...Array.isArray(n.expressions) ? n.expressions.filter(u) : []
      ].map((_) => Ws(_, t) ?? "unknown");
      return n.with_ordinality === true ? [
        ...c,
        "integer"
      ] : c;
    }
    const r = d(e, "function");
    if (!u(r)) return [];
    const s = String(r.name ?? "").toLowerCase();
    if (s === "generate_series" || s === "range") {
      const a = B(I(r), t, {
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
      const a = G(I(r), t, {
        mode: "none",
        binds: []
      });
      return [
        a ? J(a) ?? a : "unknown"
      ];
    }
    if (s === "posexplode" || s === "posexplode_outer") {
      const a = G(I(r), t, {
        mode: "none",
        binds: []
      });
      return [
        "integer",
        a ? J(a) ?? a : "unknown"
      ];
    }
    return [];
  }
  function qy(e, t) {
    const r = [
      ...u(e.this) ? [
        e.this
      ] : [],
      ...Array.isArray(e.expressions) ? e.expressions.filter(u) : []
    ].find(u);
    if (!r) return;
    const s = d(r, "function");
    if (u(s) && String(s.name ?? "").toLowerCase() === "map") {
      const c = I(s), _ = J(E(c[0], "map_keys", t, {
        mode: "none",
        binds: []
      }, "generic").type) ?? "unknown", l = J(E(c[1], "map_values", t, {
        mode: "none",
        binds: []
      }, "generic").type) ?? "unknown";
      return [
        _,
        l
      ];
    }
    const a = E(r, "unnest_map", t, {
      mode: "none",
      binds: []
    }, "generic").type, i = xt(a);
    return i ? [
      ...i
    ] : void 0;
  }
  function $y(e, t) {
    const n = [
      ...u(e.this) ? [
        e.this
      ] : [],
      ...Array.isArray(e.expressions) ? e.expressions.filter(u) : []
    ];
    for (const r of n) {
      const s = d(r, "array_func"), i = (u(s) && Array.isArray(s.expressions) ? s.expressions.filter(u) : []).find(u);
      if (!i) continue;
      const c = d(i, "function");
      if (!u(c) || String(c.name ?? "").toLowerCase() !== "struct") continue;
      const _ = I(c).flatMap((l, m) => {
        const y = rt(l), w = y.name ?? ge(y.expression, m + 1), S = E(y.expression, w, t, {
          mode: "none",
          binds: []
        }, "generic");
        return [
          {
            name: w,
            type: S.type,
            nullable: S.nullable
          }
        ];
      });
      if (_.length > 0) return _;
    }
    return [];
  }
  function Ws(e, t) {
    if (!u(e)) return;
    const n = d(e, "array_func");
    if (u(n) && Array.isArray(n.expressions)) return B(n.expressions.filter(u), t, {
      mode: "none",
      binds: []
    });
    const r = d(e, "function");
    if (u(r) && String(r.name ?? "").toLowerCase() === "array") return B(I(r), t, {
      mode: "none",
      binds: []
    });
    if (u(r) && String(r.name ?? "").toLowerCase() === "sequence") return B(I(r), t, {
      mode: "none",
      binds: []
    }) ?? "integer";
    const s = E(e, "unnest", t, {
      mode: "none",
      binds: []
    }, "generic");
    if (s.type !== "unknown") return J(s.type);
  }
  function Se(e, t, n) {
    return e.map((r, s) => {
      const a = E(r.expression, r.name ?? `column_${s + 1}`, r.schema ?? n, {
        mode: "none",
        binds: []
      }, "generic", r.source, r.tableAliases, r.functionReturnTypes);
      return {
        name: dn(t[s]) ?? r.name ?? `column_${s + 1}`,
        type: a.type,
        nullable: a.nullable
      };
    });
  }
  function Mt(e, t) {
    const n = Array.isArray(e.returning) ? e.returning : [], r = Ry(e.output, t, e);
    return [
      ...Xe(n, t, e),
      ...r
    ];
  }
  function Iy(e, t) {
    const n = u(e.returning) && u(e.returning.returning) && Array.isArray(e.returning.returning.expressions) ? e.returning.returning.expressions : [];
    return n.length === 0 ? [] : Xe(n, t, Ny(e));
  }
  function Ny(e) {
    const t = Ey(e.this), n = u(e.using) ? [
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
  function Ey(e) {
    if (u(e) && u(e.table)) return {
      table: e.table
    };
    const t = u(e) && u(e.alias) ? e.alias : void 0;
    return t && u(t.this) && u(t.this.table) ? {
      table: t.this.table,
      alias: t
    } : {};
  }
  function Ry(e, t, n) {
    if (!u(e)) return [];
    const r = Array.isArray(e.expressions) ? e.expressions : Array.isArray(e.columns) ? e.columns : [];
    return Xe(r, t, n);
  }
  function Xe(e, t, n, r, s) {
    if (!Array.isArray(e)) return [];
    const a = [], i = Ys(n);
    for (const c of e) {
      if (!u(c)) continue;
      const _ = rt(c, s), l = d(_.expression, "star");
      if (u(l)) {
        a.push(...Fy(l, t, n, i));
        continue;
      }
      a.push({
        ..._,
        schema: t,
        tableAliases: i,
        functionReturnTypes: r == null ? void 0 : r.functionReturnTypes
      });
    }
    return a;
  }
  function rt(e, t) {
    const n = d(e, "alias");
    if (u(n) && u(n.this)) return {
      expression: n.this,
      name: h(n.alias)
    };
    if (u(e.this) && u(e.alias)) return {
      expression: e.this,
      name: h(e.alias)
    };
    if (d(e, "column") || d(e, "dot") || d(e, "star")) return {
      expression: e,
      name: ge(e, 0)
    };
    if (!t) return {
      expression: e,
      name: ge(e, 0)
    };
    const r = Py(e, t);
    return {
      expression: e,
      name: r === void 0 ? ge(e, 0) : r
    };
  }
  function Fy(e, t, n, r = Ys(n)) {
    var _a2, _b2;
    const s = (_a2 = h(e.table)) == null ? void 0 : _a2.toLowerCase(), a = s ? r.get(s) : void 0, i = s ? (a == null ? void 0 : a.tableName.toLowerCase()) ?? s : void 0, c = (_b2 = a == null ? void 0 : a.schemaName) == null ? void 0 : _b2.toLowerCase(), _ = [
      ...new Set([
        ...r.values()
      ].map((k) => k.tableName))
    ].map((k) => k.toLowerCase()), l = [
      ...new Set([
        ...r.values()
      ].map((k) => k.schemaName).filter((k) => !!k))
    ].map((k) => k.toLowerCase()), m = My(t.tables.filter((k) => {
      var _a3, _b3;
      return i ? k.name.toLowerCase() !== i ? false : c ? ((_a3 = k.schema) == null ? void 0 : _a3.toLowerCase()) === c : !k.schema : !(c && ((_b3 = k.schema) == null ? void 0 : _b3.toLowerCase()) !== c || _.length > 0 && !_.includes(k.name.toLowerCase()) || _.length > 0 && k.schema && l.length === 0 || l.length > 0 && (!k.schema || !l.includes(k.schema.toLowerCase())));
    })), y = new Set((Array.isArray(e.except) ? e.except : []).map(h).filter((k) => !!k).map((k) => k.toLowerCase())), w = new Map((Array.isArray(e.rename) ? e.rename : []).filter(Array.isArray).map((k) => {
      var _a3;
      return [
        (_a3 = h(k[0])) == null ? void 0 : _a3.toLowerCase(),
        h(k[1])
      ];
    }).filter((k) => !!(k[0] && k[1]))), S = new Map((Array.isArray(e.replace) ? e.replace : []).filter(u).map((k) => {
      var _a3;
      const L = rt(k);
      return [
        (_a3 = L.name) == null ? void 0 : _a3.toLowerCase(),
        L.expression
      ];
    }).filter((k) => !!k[0])), N = s ? /* @__PURE__ */ new Map() : zy(n, t);
    return m.flatMap((k) => k.columns.filter((L) => !Oy(y, L.name, k, r)).filter((L) => {
      var _a3;
      return !((_a3 = N.get(k.name.toLowerCase())) == null ? void 0 : _a3.has(L.name.toLowerCase()));
    }).map((L, C) => {
      const $ = (a == null ? void 0 : a.visibleColumnNames[C]) ?? L.name, M = S.get($.toLowerCase()) ?? S.get(L.name.toLowerCase());
      return {
        expression: M ?? {
          column: {
            name: {
              name: L.name
            },
            table: {
              name: k.name
            }
          }
        },
        name: w.get($.toLowerCase()) ?? w.get(L.name.toLowerCase()) ?? $,
        source: M ? "replace" : Ct(k, L.name),
        schema: t,
        tableAliases: r
      };
    }));
  }
  function My(e) {
    const t = /* @__PURE__ */ new Set();
    return e.filter((n) => {
      var _a2;
      const r = `${((_a2 = n.schema) == null ? void 0 : _a2.toLowerCase()) ?? ""}.${n.name.toLowerCase()}`;
      return t.has(r) ? false : (t.add(r), true);
    });
  }
  function Oy(e, t, n, r) {
    var _a2;
    const s = t.toLowerCase();
    if (e.has(s)) return true;
    const a = n.name.toLowerCase(), i = (_a2 = n.schema) == null ? void 0 : _a2.toLowerCase();
    if (e.has(`${a}.${s}`) || i && e.has(`${i}.${a}.${s}`)) return true;
    for (const [c, _] of r) if (_.tableName.toLowerCase() === a && !(i && _.schemaName && _.schemaName.toLowerCase() !== i) && e.has(`${c}.${s}`)) return true;
    return false;
  }
  function zy(e, t) {
    const n = /* @__PURE__ */ new Map();
    if (!e || !Array.isArray(e.joins)) return n;
    for (const r of e.joins) {
      if (!u(r) || !u(r.this)) continue;
      const s = Le(r.this);
      if (!s) continue;
      const a = Array.isArray(r.using) ? r.using.map(h).filter((_) => !!_) : [], i = r.kind === "Natural" ? Dy(e, r.this, t) : [], c = [
        ...a,
        ...i
      ].map((_) => _.toLowerCase());
      c.length !== 0 && n.set(s.toLowerCase(), new Set(c));
    }
    return n;
  }
  function Dy(e, t, n) {
    var _a2;
    const r = yn({
      ...e,
      joins: []
    }).map(Le).filter((i) => !!i), s = Le(t);
    if (!s) return [];
    const a = new Set(n.tables.filter((i) => r.map((c) => c.toLowerCase()).includes(i.name.toLowerCase())).flatMap((i) => i.columns.map((c) => c.name.toLowerCase())));
    return ((_a2 = n.tables.find((i) => i.name.toLowerCase() === s.toLowerCase())) == null ? void 0 : _a2.columns.map((i) => i.name).filter((i) => a.has(i.toLowerCase()))) ?? [];
  }
  function Le(e) {
    return Qs(e);
  }
  function Ys(e) {
    const t = /* @__PURE__ */ new Map();
    for (const n of yn(e)) By(t, n);
    return t;
  }
  function yn(e) {
    const t = u(e == null ? void 0 : e.from) && Array.isArray(e.from.expressions) ? e.from.expressions : [], n = u(e == null ? void 0 : e.from_clause) && Array.isArray(e.from_clause.expressions) ? e.from_clause.expressions : [], r = Array.isArray(e == null ? void 0 : e.joins) ? e.joins : [], s = Array.isArray(e == null ? void 0 : e.from_joins) ? e.from_joins : [], a = Array.isArray(e == null ? void 0 : e.using) ? e.using : [], i = Array.isArray(e == null ? void 0 : e.lateral_views) ? e.lateral_views : [], c = r.some((l) => u(l) && [
      "Right",
      "Full"
    ].includes(String(l.kind ?? ""))), _ = [
      ...t,
      ...n
    ].filter(u).map((l) => c ? {
      ...l,
      nullableRelation: true
    } : l);
    u(e == null ? void 0 : e.table) && (_.unshift({
      table: e.table,
      ...u(e.alias) ? {
        alias: e.alias
      } : {}
    }), _.unshift({
      table: e.table,
      alias: {
        name: "inserted"
      }
    }), _.unshift({
      table: e.table,
      alias: {
        name: "deleted"
      }
    }), _.unshift({
      table: e.table,
      alias: {
        name: "excluded"
      }
    }), _.unshift({
      table: e.table,
      alias: {
        name: "old"
      }
    }), _.unshift({
      table: e.table,
      alias: {
        name: "new"
      }
    }));
    for (const l of r) if (u(l) && u(l.this)) {
      const m = [
        "Left",
        "Full"
      ].includes(String(l.kind ?? ""));
      _.push(m ? {
        ...l.this,
        nullableRelation: true
      } : l.this);
    }
    for (const l of s) u(l) && u(l.this) && _.push(l.this);
    for (const l of a) u(l) && _.push({
      table: l
    });
    for (const l of i) u(l) && _.push({
      lateral: {
        alias: l.table_alias,
        column_aliases: l.column_aliases
      }
    });
    return _;
  }
  function By(e, t) {
    if (!t) return;
    const n = u(t.table) ? t.table : void 0, r = u(t.subquery) ? t.subquery : void 0, s = u(t.lateral) ? t.lateral : void 0, a = u(t.pivot) ? t.pivot : void 0, i = u(t.unpivot) ? t.unpivot : void 0, c = u(t.match_recognize) ? t.match_recognize : void 0, _ = u(t.open_j_s_o_n) ? t.open_j_s_o_n : void 0, l = u(t.j_s_o_n_table) ? t.j_s_o_n_table : void 0, m = u(t.x_m_l_table) ? t.x_m_l_table : void 0, y = u(t.function) ? t.function : void 0, w = u(t.unnest) ? t.unnest : void 0, S = Gs(t), N = u(t == null ? void 0 : t.alias) && u(t.alias.this) ? t.alias : void 0, k = Qs(t);
    if (!k) return;
    const L = n ? h(n.schema) : void 0, C = n ? Ie(n) : r ? Ie(r) : s ? Ie(s) : a ? Ie(a) : i ? Ie(i) : c ? Ie(c) : _ || l || m || S || y || w ? Wt() : N ? Ie(N) : Wt(), $ = {
      tableName: k,
      ...L ? {
        schemaName: L
      } : {},
      ...(t == null ? void 0 : t.nullableRelation) === true ? {
        nullable: true
      } : {},
      ...C
    };
    e.set(k.toLowerCase(), $), L && e.set(`${L}.${k}`.toLowerCase(), $);
    const P = h(N ? N.alias : t == null ? void 0 : t.alias) ?? (n ? h(n.alias) : r ? h(r.alias) : s ? h(s.alias) : a ? h(a.alias) : i ? h(i.alias) : c ? h(c.alias) : void 0);
    P && e.set(P.toLowerCase(), $);
  }
  function Qs(e) {
    const t = u(e.table) ? e.table : void 0;
    if (t) return h(t.name);
    const n = u(e.subquery) ? e.subquery : void 0;
    if (n) return h(n.alias);
    const r = u(e.lateral) ? e.lateral : void 0;
    if (r) return h(r.alias);
    const s = u(e.pivot) ? e.pivot : void 0;
    if (s) return h(s.alias) ?? Le(u(s.this) ? s.this : {});
    const a = u(e.unpivot) ? e.unpivot : void 0;
    if (a) return h(a.alias) ?? Le(u(a.this) ? a.this : {});
    const i = u(e.match_recognize) ? e.match_recognize : void 0;
    if (i) return h(i.alias) ?? Le(u(i.this) ? i.this : {});
    if (u(e.open_j_s_o_n)) return "openjson";
    if (u(e.j_s_o_n_table)) return "json_table";
    if (u(e.x_m_l_table)) return "xmltable";
    const c = Gs(e);
    if (c) return c;
    const _ = u(e.function) ? e.function : void 0;
    if (_) return String(_.name ?? "").toLowerCase();
    if (u(e.unnest)) return h(e.unnest.alias) ?? "unnest";
    const l = u(e.alias) && u(e.alias.this) ? e.alias : void 0;
    return l ? h(l.alias) : void 0;
  }
  function Gs(e) {
    const n = (u(e.tuple) && Array.isArray(e.tuple.expressions) ? e.tuple.expressions : []).find((r) => u(r) && u(r.table_alias));
    return u(n) && u(n.table_alias) ? h(n.table_alias.this) : void 0;
  }
  function Ie(e) {
    const t = Array.isArray(e.column_aliases) ? e.column_aliases.map(h).filter((r) => !!r) : [];
    if (t.length === 0) return Wt();
    const n = [];
    for (const [r, s] of t.entries()) n[r] = s;
    return {
      visibleColumnNames: n
    };
  }
  function Wt() {
    return {
      visibleColumnNames: []
    };
  }
  function wn(e) {
    return e.schema ? `${e.schema}.${e.name}` : e.name;
  }
  function Ct(e, t) {
    return `${wn(e)}.${t}`;
  }
  function ge(e, t) {
    const n = d(e, "alias");
    if (u(n)) return h(n.alias) ?? `column_${t || 1}`;
    const r = d(e, "dot");
    if (u(r)) return h(r.field) ?? `column_${t || 1}`;
    const s = d(e, "column");
    if (u(s)) return h(s.name) ?? `column_${t || 1}`;
    const a = Uy(e);
    return a.length === 1 ? O(a[0]) : H(e, "star") ? "*" : `column_${t || 1}`;
  }
  function Py(e, t) {
    const n = d(e, "count");
    if (u(n) && n.star === true) return t === "tsql" ? "" : t === "postgresql" ? "count" : t === "duckdb" ? "count_star()" : t === "oracle" ? "COUNT(*)" : "count(*)";
    const r = d(e, "add");
    if (u(r)) {
      const a = Ot(r.left), i = Ot(r.right);
      if (a && i) return t === "tsql" ? "" : t === "postgresql" ? "?column?" : t === "duckdb" ? `(${a} + ${i})` : t === "oracle" ? `${a.toUpperCase()}+${i.toUpperCase()}` : `${a}+${i}`;
    }
    const s = d(e, "upper");
    if (u(s) && u(s.this)) {
      const a = Ot(s.this);
      if (a) return t === "tsql" ? "" : t === "postgresql" ? "upper" : t === "oracle" ? `UPPER(${a.toUpperCase()})` : t === "duckdb" ? `upper("${a}")` : `upper(${a})`;
    }
    return t === "tsql" ? "" : void 0;
  }
  function Ot(e, t) {
    const n = d(e, "column");
    if (u(n)) return h(n.name);
    const r = d(e, "literal");
    if (u(r) && typeof r.value == "string") return r.value;
  }
  function et(e) {
    return e.find(u);
  }
  function d(e, t) {
    return u(e) ? e[t] : void 0;
  }
  function H(e, t) {
    return u(e) && t in e;
  }
  function h(e) {
    if (e) {
      if (typeof e == "string") return O(e);
      if (u(e) && typeof e.name == "string") return O(e.name);
      if (u(e) && u(e.column)) return h(e.column.name);
      if (u(e) && u(e.var) && typeof e.var.this == "string") return O(e.var.this);
      if (u(e) && u(e.identifier)) return h(e.identifier);
    }
  }
  function Uy(e) {
    try {
      return Zt.getColumnNames(e).map(String);
    } catch {
      return [];
    }
  }
  function u(e) {
    return typeof e == "object" && e !== null;
  }
  function Zs(e) {
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
  function nr(e, t) {
    return {
      code: e.code,
      message: e.message ?? String(e),
      severity: t ?? e.severity,
      line: e.line,
      column: e.column
    };
  }
  function Vy(e) {
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
      const a = s, i = h(a.name), c = Y(a.data_type) ?? "unknown";
      return i ? [
        `${i} ${c}`
      ] : [];
    }).join(", ")}>`;
    if (t.data_type === "array") return `array<${Y(t.element_type) ?? "unknown"}>`;
    if (t.data_type === "map") return `map<${Y(t.key_type) ?? "unknown"}, ${Y(t.value_type) ?? "unknown"}>`;
    const n = t.data_type === "custom" && typeof t.name == "string" ? t.name : t.data_type ?? t.type ?? t.name;
    if (n === "timestamp" && t.timezone === true) return "timestamptz";
    if (typeof n == "string") {
      const r = n.toLowerCase().replace(/\s+/g, "");
      if (typeof t.length == "number" && [
        "char",
        "character",
        "varchar",
        "var_char",
        "varchar2",
        "nvarchar",
        "nvarchar2",
        "nchar",
        "raw",
        "binary",
        "varbinary"
      ].includes(r)) return `${r === "var_char" ? "varchar" : r}(${t.length})`;
      if (typeof t.precision == "number" && [
        "decimal",
        "dec",
        "numeric",
        "number",
        "timestamp",
        "time",
        "datetime2"
      ].includes(r)) return `${r}(${t.precision}${typeof t.scale == "number" ? `,${t.scale}` : ""})`;
    }
    return typeof n == "string" ? se(n) : void 0;
  }
  function se(e) {
    const t = e.trim().toLowerCase().replace(/\s+/g, " "), n = Hy(t);
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
    ].includes(s) ? "bytes" : s === "json_b" ? "jsonb" : s === "datetime2" ? "datetime2" : s === "timestamptz" || s === "timestampwithtimezone" ? "timestamptz" : s === "timestampntz" || s === "timestampltz" || s.startsWith("timestamp") ? "timestamp" : s === "array" ? "array<variant>" : s === "uniqueidentifier" ? "uuid" : [
      "variant",
      "object",
      "json",
      "jsonb",
      "date",
      "time",
      "datetime",
      "datetime2",
      "interval",
      "uuid",
      "geography",
      "geometry"
    ].includes(s) ? s : r;
  }
  function Ky(e, t) {
    var _a2;
    const n = se(e);
    if (n === "unknown") return "unknown";
    if (n.startsWith("array<") || n.startsWith("map<") || n.startsWith("struct<")) return zt(n, t);
    const r = Xs(t), s = /^([a-z_][\w]*)\(([^)]*)\)$/.exec(n);
    if (s) {
      const [, i, c] = s;
      return [
        "decimal",
        "dec",
        "numeric",
        "number"
      ].includes(i) ? r === "postgresql" ? `numeric(${c})` : r === "oracle" ? `number(${c})` : `decimal(${c})` : i === "datetime2" && r === "tsql" ? `datetime2(${c})` : n;
    }
    return ((_a2 = {
      postgresql: {
        integer: "integer",
        bigint: "bigint",
        decimal: "numeric",
        boolean: "boolean",
        text: "text",
        bytes: "bytea",
        json: "json",
        jsonb: "jsonb",
        date: "date",
        time: "time",
        timestamp: "timestamp without time zone",
        timestamptz: "timestamp with time zone",
        datetime: "timestamp",
        uuid: "uuid"
      },
      mysql: {
        integer: "int",
        bigint: "bigint",
        decimal: "decimal",
        boolean: "tinyint(1)",
        text: "varchar(255)",
        bytes: "varbinary(255)",
        json: "json",
        jsonb: "json",
        date: "date",
        time: "time",
        timestamp: "timestamp",
        timestamptz: "timestamp",
        datetime: "datetime",
        uuid: "char(36)"
      },
      sqlite: {
        integer: "integer",
        bigint: "integer",
        decimal: "real",
        boolean: "integer",
        text: "text",
        bytes: "blob",
        json: "text",
        jsonb: "blob",
        date: "text",
        time: "text",
        timestamp: "text",
        timestamptz: "text",
        datetime: "text",
        uuid: "text"
      },
      tsql: {
        integer: "int",
        bigint: "bigint",
        decimal: "decimal(38, 10)",
        boolean: "bit",
        text: "nvarchar(max)",
        bytes: "varbinary(255)",
        json: "nvarchar(max)",
        jsonb: "nvarchar(max)",
        xml: "xml",
        date: "date",
        time: "time",
        timestamp: "datetime2(7)",
        timestamptz: "datetimeoffset",
        datetime2: "datetime2(7)",
        datetime: "datetime2",
        uuid: "uniqueidentifier"
      },
      oracle: {
        integer: "number(10)",
        bigint: "number(19)",
        decimal: "number",
        boolean: "number(1)",
        text: "varchar2(255)",
        bytes: "raw(255)",
        json: "json",
        jsonb: "json",
        xml: "xmltype",
        date: "date",
        time: "timestamp",
        timestamp: "timestamp(6)",
        timestamptz: "timestamp(6) with time zone",
        datetime: "timestamp",
        uuid: "raw(16)"
      },
      duckdb: {
        integer: "integer",
        bigint: "bigint",
        decimal: "decimal(18, 3)",
        boolean: "boolean",
        text: "varchar",
        bytes: "blob",
        json: "json",
        jsonb: "json",
        date: "date",
        time: "time",
        timestamp: "timestamp",
        timestamptz: "timestamp with time zone",
        datetime: "timestamp",
        uuid: "uuid"
      },
      bigquery: {
        integer: "int64",
        bigint: "int64",
        decimal: "numeric",
        boolean: "bool",
        text: "string",
        bytes: "bytes",
        json: "json",
        jsonb: "json",
        date: "date",
        time: "time",
        timestamp: "timestamp",
        timestamptz: "timestamp",
        datetime: "datetime",
        uuid: "string"
      },
      generic: {
        integer: "INTEGER",
        bigint: "BIGINT",
        decimal: "DECIMAL",
        boolean: "BOOLEAN",
        text: "VARCHAR(255)",
        bytes: "VARBINARY(255)",
        json: "VARCHAR(4000)",
        jsonb: "VARCHAR(4000)",
        xml: "SQLXML",
        date: "DATE",
        time: "TIME",
        timestamp: "TIMESTAMP",
        timestamptz: "TIMESTAMP_WITH_TIMEZONE",
        datetime: "TIMESTAMP",
        uuid: "VARCHAR(36)"
      }
    }[r]) == null ? void 0 : _a2[n]) ?? n;
  }
  function Xs(e) {
    return e === "postgresql" || e === "redshift" || e === "cockroachdb" ? "postgresql" : [
      "mysql",
      "mariadb",
      "singlestore",
      "tidb"
    ].includes(e) ? "mysql" : e === "sqlite" ? "sqlite" : e === "tsql" ? "tsql" : e === "oracle" ? "oracle" : e === "duckdb" ? "duckdb" : e === "bigquery" ? "bigquery" : "generic";
  }
  function zt(e, t) {
    return Xs(t) === "bigquery" ? e.replace(/^array</, "array<").replace(/^struct</, "struct<") : e;
  }
  function Hy(e) {
    const t = /^([a-z_][\w\s]*)\s*\(([\s\S]*)\)$/i.exec(e.trim());
    if (!t) return;
    const n = t[1].replace(/\s+/g, "").toLowerCase(), r = ie(t[2], ",");
    if (n === "nullable" || n === "lowcardinality") return r[0] ? se(r[0]) : "unknown";
    if ([
      "char",
      "character",
      "varchar",
      "varchar2",
      "nvarchar",
      "nvarchar2",
      "nchar",
      "raw",
      "binary",
      "varbinary",
      "decimal",
      "dec",
      "numeric",
      "number",
      "datetime2",
      "datetimeoffset",
      "time",
      "timestamp"
    ].includes(n)) return `${n}(${r.map((s) => s.trim()).join(",")})`;
    if (n === "array" || n === "list") return `array<${r[0] ? se(r[0]) : "unknown"}>`;
    if (n === "map" && r.length >= 2) return `map<${se(r[0])}, ${se(r[1])}>`;
    if (n === "tuple" || n === "row") return `struct<${r.map((a, i) => {
      const c = rr(a, i);
      return `${c.name} ${c.type}`;
    }).join(", ")}>`;
    if (n === "nested") return `array<struct<${r.map((a, i) => {
      const c = rr(a, i);
      return `${c.name} ${c.type}`;
    }).join(", ")}>>`;
  }
  function rr(e, t) {
    const n = e.trim(), r = /^("[^"]+"|`[^`]+`|\[[^\]]+\]|[a-z_][\w$]*)\s+([\s\S]+)$/i.exec(n);
    return r ? {
      name: O(r[1]),
      type: se(r[2])
    } : {
      name: `field_${t + 1}`,
      type: se(n)
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
  function Jy(e) {
    const t = tt();
    for (const n of e.functions ?? []) for (const r of Wy(n)) t.functionReturnTypes.set(r, n.returnType);
    for (const n of e.procedures ?? []) for (const r of Yy(n)) t.procedureResultSets.set(r, p(n.columns.map((s) => [
      s.name,
      s.type
    ])));
    return t;
  }
  function Wy(e) {
    var _a2;
    const t = e.name.toLowerCase(), n = (_a2 = e.schema) == null ? void 0 : _a2.toLowerCase();
    return n ? [
      `${n}.${t}`,
      t
    ] : [
      t
    ];
  }
  function Yy(e) {
    var _a2;
    const t = e.name.toLowerCase(), n = (_a2 = e.schema) == null ? void 0 : _a2.toLowerCase();
    return n ? [
      `${n}.${t}`,
      t
    ] : [
      t
    ];
  }
  Qy = async function(e) {
    const t = e.schemaSql.trim() ? {
      tables: Pr(e.schemaSql, e.dialect)
    } : void 0;
    return Pf({
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
  Qy as analyzeSql,
  Nm as getSupportedDialects
};
