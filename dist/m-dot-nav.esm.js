import v from "mithril";
var Oe = typeof global == "object" && global && global.Object === Object && global, De = typeof self == "object" && self && self.Object === Object && self, b = Oe || De || Function("return this")(), j = b.Symbol, Se = Object.prototype, Ue = Se.hasOwnProperty, Me = Se.toString, $ = j ? j.toStringTag : void 0;
function Ge(e) {
  var t = Ue.call(e, $), r = e[$];
  try {
    e[$] = void 0;
    var n = !0;
  } catch {
  }
  var o = Me.call(e);
  return n && (t ? e[$] = r : delete e[$]), o;
}
var Fe = Object.prototype, Be = Fe.toString;
function ze(e) {
  return Be.call(e);
}
var qe = "[object Null]", He = "[object Undefined]", re = j ? j.toStringTag : void 0;
function M(e) {
  return e == null ? e === void 0 ? He : qe : re && re in Object(e) ? Ge(e) : ze(e);
}
function N(e) {
  return e != null && typeof e == "object";
}
var z = Array.isArray;
function Ae(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
var Ke = "[object AsyncFunction]", We = "[object Function]", Xe = "[object GeneratorFunction]", Ye = "[object Proxy]";
function Pe(e) {
  if (!Ae(e))
    return !1;
  var t = M(e);
  return t == We || t == Xe || t == Ke || t == Ye;
}
var X = b["__core-js_shared__"], ne = function() {
  var e = /[^.]+$/.exec(X && X.keys && X.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function Je(e) {
  return !!ne && ne in e;
}
var Ve = Function.prototype, Ze = Ve.toString;
function R(e) {
  if (e != null) {
    try {
      return Ze.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var Qe = /[\\^$.*+?()[\]{}|]/g, ke = /^\[object .+?Constructor\]$/, et = Function.prototype, tt = Object.prototype, rt = et.toString, nt = tt.hasOwnProperty, at = RegExp(
  "^" + rt.call(nt).replace(Qe, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function ot(e) {
  if (!Ae(e) || Je(e))
    return !1;
  var t = Pe(e) ? at : ke;
  return t.test(R(e));
}
function it(e, t) {
  return e == null ? void 0 : e[t];
}
function x(e, t) {
  var r = it(e, t);
  return ot(r) ? r : void 0;
}
var V = x(b, "WeakMap"), st = 9007199254740991, ut = /^(?:0|[1-9]\d*)$/;
function lt(e, t) {
  var r = typeof e;
  return t = t ?? st, !!t && (r == "number" || r != "symbol" && ut.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
function Ee(e, t) {
  return e === t || e !== e && t !== t;
}
var ct = 9007199254740991;
function we(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= ct;
}
function ft(e) {
  return e != null && we(e.length) && !Pe(e);
}
var pt = Object.prototype;
function dt(e) {
  var t = e && e.constructor, r = typeof t == "function" && t.prototype || pt;
  return e === r;
}
function gt(e, t) {
  for (var r = -1, n = Array(e); ++r < e; )
    n[r] = t(r);
  return n;
}
var ht = "[object Arguments]";
function ae(e) {
  return N(e) && M(e) == ht;
}
var Re = Object.prototype, yt = Re.hasOwnProperty, vt = Re.propertyIsEnumerable, _t = ae(/* @__PURE__ */ function() {
  return arguments;
}()) ? ae : function(e) {
  return N(e) && yt.call(e, "callee") && !vt.call(e, "callee");
};
function bt() {
  return !1;
}
var Ie = typeof exports == "object" && exports && !exports.nodeType && exports, oe = Ie && typeof module == "object" && module && !module.nodeType && module, mt = oe && oe.exports === Ie, ie = mt ? b.Buffer : void 0, Tt = ie ? ie.isBuffer : void 0, Z = Tt || bt, Ot = "[object Arguments]", St = "[object Array]", At = "[object Boolean]", Pt = "[object Date]", Et = "[object Error]", wt = "[object Function]", Rt = "[object Map]", It = "[object Number]", jt = "[object Object]", xt = "[object RegExp]", $t = "[object Set]", Ct = "[object String]", Lt = "[object WeakMap]", Nt = "[object ArrayBuffer]", Dt = "[object DataView]", Ut = "[object Float32Array]", Mt = "[object Float64Array]", Gt = "[object Int8Array]", Ft = "[object Int16Array]", Bt = "[object Int32Array]", zt = "[object Uint8Array]", qt = "[object Uint8ClampedArray]", Ht = "[object Uint16Array]", Kt = "[object Uint32Array]", d = {};
d[Ut] = d[Mt] = d[Gt] = d[Ft] = d[Bt] = d[zt] = d[qt] = d[Ht] = d[Kt] = !0;
d[Ot] = d[St] = d[Nt] = d[At] = d[Dt] = d[Pt] = d[Et] = d[wt] = d[Rt] = d[It] = d[jt] = d[xt] = d[$t] = d[Ct] = d[Lt] = !1;
function Wt(e) {
  return N(e) && we(e.length) && !!d[M(e)];
}
function Xt(e) {
  return function(t) {
    return e(t);
  };
}
var je = typeof exports == "object" && exports && !exports.nodeType && exports, L = je && typeof module == "object" && module && !module.nodeType && module, Yt = L && L.exports === je, Y = Yt && Oe.process, se = function() {
  try {
    var e = L && L.require && L.require("util").types;
    return e || Y && Y.binding && Y.binding("util");
  } catch {
  }
}(), ue = se && se.isTypedArray, xe = ue ? Xt(ue) : Wt, Jt = Object.prototype, Vt = Jt.hasOwnProperty;
function Zt(e, t) {
  var r = z(e), n = !r && _t(e), o = !r && !n && Z(e), a = !r && !n && !o && xe(e), c = r || n || o || a, f = c ? gt(e.length, String) : [], u = f.length;
  for (var s in e)
    Vt.call(e, s) && !(c && // Safari 9 has enumerable `arguments.length` in strict mode.
    (s == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    o && (s == "offset" || s == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    a && (s == "buffer" || s == "byteLength" || s == "byteOffset") || // Skip index properties.
    lt(s, u))) && f.push(s);
  return f;
}
function Qt(e, t) {
  return function(r) {
    return e(t(r));
  };
}
var kt = Qt(Object.keys, Object), er = Object.prototype, tr = er.hasOwnProperty;
function rr(e) {
  if (!dt(e))
    return kt(e);
  var t = [];
  for (var r in Object(e))
    tr.call(e, r) && r != "constructor" && t.push(r);
  return t;
}
function nr(e) {
  return ft(e) ? Zt(e) : rr(e);
}
var D = x(Object, "create");
function ar() {
  this.__data__ = D ? D(null) : {}, this.size = 0;
}
function or(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var ir = "__lodash_hash_undefined__", sr = Object.prototype, ur = sr.hasOwnProperty;
function lr(e) {
  var t = this.__data__;
  if (D) {
    var r = t[e];
    return r === ir ? void 0 : r;
  }
  return ur.call(t, e) ? t[e] : void 0;
}
var cr = Object.prototype, fr = cr.hasOwnProperty;
function pr(e) {
  var t = this.__data__;
  return D ? t[e] !== void 0 : fr.call(t, e);
}
var dr = "__lodash_hash_undefined__";
function gr(e, t) {
  var r = this.__data__;
  return this.size += this.has(e) ? 0 : 1, r[e] = D && t === void 0 ? dr : t, this;
}
function w(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
w.prototype.clear = ar;
w.prototype.delete = or;
w.prototype.get = lr;
w.prototype.has = pr;
w.prototype.set = gr;
function hr() {
  this.__data__ = [], this.size = 0;
}
function K(e, t) {
  for (var r = e.length; r--; )
    if (Ee(e[r][0], t))
      return r;
  return -1;
}
var yr = Array.prototype, vr = yr.splice;
function _r(e) {
  var t = this.__data__, r = K(t, e);
  if (r < 0)
    return !1;
  var n = t.length - 1;
  return r == n ? t.pop() : vr.call(t, r, 1), --this.size, !0;
}
function br(e) {
  var t = this.__data__, r = K(t, e);
  return r < 0 ? void 0 : t[r][1];
}
function mr(e) {
  return K(this.__data__, e) > -1;
}
function Tr(e, t) {
  var r = this.__data__, n = K(r, e);
  return n < 0 ? (++this.size, r.push([e, t])) : r[n][1] = t, this;
}
function m(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
m.prototype.clear = hr;
m.prototype.delete = _r;
m.prototype.get = br;
m.prototype.has = mr;
m.prototype.set = Tr;
var U = x(b, "Map");
function Or() {
  this.size = 0, this.__data__ = {
    hash: new w(),
    map: new (U || m)(),
    string: new w()
  };
}
function Sr(e) {
  var t = typeof e;
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
function W(e, t) {
  var r = e.__data__;
  return Sr(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
function Ar(e) {
  var t = W(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
function Pr(e) {
  return W(this, e).get(e);
}
function Er(e) {
  return W(this, e).has(e);
}
function wr(e, t) {
  var r = W(this, e), n = r.size;
  return r.set(e, t), this.size += r.size == n ? 0 : 1, this;
}
function I(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
I.prototype.clear = Or;
I.prototype.delete = Ar;
I.prototype.get = Pr;
I.prototype.has = Er;
I.prototype.set = wr;
function Rr(e, t) {
  for (var r = -1, n = t.length, o = e.length; ++r < n; )
    e[o + r] = t[r];
  return e;
}
function Ir() {
  this.__data__ = new m(), this.size = 0;
}
function jr(e) {
  var t = this.__data__, r = t.delete(e);
  return this.size = t.size, r;
}
function xr(e) {
  return this.__data__.get(e);
}
function $r(e) {
  return this.__data__.has(e);
}
var Cr = 200;
function Lr(e, t) {
  var r = this.__data__;
  if (r instanceof m) {
    var n = r.__data__;
    if (!U || n.length < Cr - 1)
      return n.push([e, t]), this.size = ++r.size, this;
    r = this.__data__ = new I(n);
  }
  return r.set(e, t), this.size = r.size, this;
}
function S(e) {
  var t = this.__data__ = new m(e);
  this.size = t.size;
}
S.prototype.clear = Ir;
S.prototype.delete = jr;
S.prototype.get = xr;
S.prototype.has = $r;
S.prototype.set = Lr;
function Nr(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, o = 0, a = []; ++r < n; ) {
    var c = e[r];
    t(c, r, e) && (a[o++] = c);
  }
  return a;
}
function Dr() {
  return [];
}
var Ur = Object.prototype, Mr = Ur.propertyIsEnumerable, le = Object.getOwnPropertySymbols, Gr = le ? function(e) {
  return e == null ? [] : (e = Object(e), Nr(le(e), function(t) {
    return Mr.call(e, t);
  }));
} : Dr;
function Fr(e, t, r) {
  var n = t(e);
  return z(e) ? n : Rr(n, r(e));
}
function ce(e) {
  return Fr(e, nr, Gr);
}
var Q = x(b, "DataView"), k = x(b, "Promise"), ee = x(b, "Set"), fe = "[object Map]", Br = "[object Object]", pe = "[object Promise]", de = "[object Set]", ge = "[object WeakMap]", he = "[object DataView]", zr = R(Q), qr = R(U), Hr = R(k), Kr = R(ee), Wr = R(V), O = M;
(Q && O(new Q(new ArrayBuffer(1))) != he || U && O(new U()) != fe || k && O(k.resolve()) != pe || ee && O(new ee()) != de || V && O(new V()) != ge) && (O = function(e) {
  var t = M(e), r = t == Br ? e.constructor : void 0, n = r ? R(r) : "";
  if (n)
    switch (n) {
      case zr:
        return he;
      case qr:
        return fe;
      case Hr:
        return pe;
      case Kr:
        return de;
      case Wr:
        return ge;
    }
  return t;
});
var ye = b.Uint8Array, Xr = "__lodash_hash_undefined__";
function Yr(e) {
  return this.__data__.set(e, Xr), this;
}
function Jr(e) {
  return this.__data__.has(e);
}
function q(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.__data__ = new I(); ++t < r; )
    this.add(e[t]);
}
q.prototype.add = q.prototype.push = Yr;
q.prototype.has = Jr;
function Vr(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length; ++r < n; )
    if (t(e[r], r, e))
      return !0;
  return !1;
}
function Zr(e, t) {
  return e.has(t);
}
var Qr = 1, kr = 2;
function $e(e, t, r, n, o, a) {
  var c = r & Qr, f = e.length, u = t.length;
  if (f != u && !(c && u > f))
    return !1;
  var s = a.get(e), l = a.get(t);
  if (s && l)
    return s == t && l == e;
  var g = -1, p = !0, h = r & kr ? new q() : void 0;
  for (a.set(e, t), a.set(t, e); ++g < f; ) {
    var y = e[g], _ = t[g];
    if (n)
      var T = c ? n(_, y, g, t, e, a) : n(y, _, g, e, t, a);
    if (T !== void 0) {
      if (T)
        continue;
      p = !1;
      break;
    }
    if (h) {
      if (!Vr(t, function(A, P) {
        if (!Zr(h, P) && (y === A || o(y, A, r, n, a)))
          return h.push(P);
      })) {
        p = !1;
        break;
      }
    } else if (!(y === _ || o(y, _, r, n, a))) {
      p = !1;
      break;
    }
  }
  return a.delete(e), a.delete(t), p;
}
function en(e) {
  var t = -1, r = Array(e.size);
  return e.forEach(function(n, o) {
    r[++t] = [o, n];
  }), r;
}
function tn(e) {
  var t = -1, r = Array(e.size);
  return e.forEach(function(n) {
    r[++t] = n;
  }), r;
}
var rn = 1, nn = 2, an = "[object Boolean]", on = "[object Date]", sn = "[object Error]", un = "[object Map]", ln = "[object Number]", cn = "[object RegExp]", fn = "[object Set]", pn = "[object String]", dn = "[object Symbol]", gn = "[object ArrayBuffer]", hn = "[object DataView]", ve = j ? j.prototype : void 0, J = ve ? ve.valueOf : void 0;
function yn(e, t, r, n, o, a, c) {
  switch (r) {
    case hn:
      if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
        return !1;
      e = e.buffer, t = t.buffer;
    case gn:
      return !(e.byteLength != t.byteLength || !a(new ye(e), new ye(t)));
    case an:
    case on:
    case ln:
      return Ee(+e, +t);
    case sn:
      return e.name == t.name && e.message == t.message;
    case cn:
    case pn:
      return e == t + "";
    case un:
      var f = en;
    case fn:
      var u = n & rn;
      if (f || (f = tn), e.size != t.size && !u)
        return !1;
      var s = c.get(e);
      if (s)
        return s == t;
      n |= nn, c.set(e, t);
      var l = $e(f(e), f(t), n, o, a, c);
      return c.delete(e), l;
    case dn:
      if (J)
        return J.call(e) == J.call(t);
  }
  return !1;
}
var vn = 1, _n = Object.prototype, bn = _n.hasOwnProperty;
function mn(e, t, r, n, o, a) {
  var c = r & vn, f = ce(e), u = f.length, s = ce(t), l = s.length;
  if (u != l && !c)
    return !1;
  for (var g = u; g--; ) {
    var p = f[g];
    if (!(c ? p in t : bn.call(t, p)))
      return !1;
  }
  var h = a.get(e), y = a.get(t);
  if (h && y)
    return h == t && y == e;
  var _ = !0;
  a.set(e, t), a.set(t, e);
  for (var T = c; ++g < u; ) {
    p = f[g];
    var A = e[p], P = t[p];
    if (n)
      var te = c ? n(P, A, p, t, e, a) : n(A, P, p, e, t, a);
    if (!(te === void 0 ? A === P || o(A, P, r, n, a) : te)) {
      _ = !1;
      break;
    }
    T || (T = p == "constructor");
  }
  if (_ && !T) {
    var G = e.constructor, F = t.constructor;
    G != F && "constructor" in e && "constructor" in t && !(typeof G == "function" && G instanceof G && typeof F == "function" && F instanceof F) && (_ = !1);
  }
  return a.delete(e), a.delete(t), _;
}
var Tn = 1, _e = "[object Arguments]", be = "[object Array]", B = "[object Object]", On = Object.prototype, me = On.hasOwnProperty;
function Sn(e, t, r, n, o, a) {
  var c = z(e), f = z(t), u = c ? be : O(e), s = f ? be : O(t);
  u = u == _e ? B : u, s = s == _e ? B : s;
  var l = u == B, g = s == B, p = u == s;
  if (p && Z(e)) {
    if (!Z(t))
      return !1;
    c = !0, l = !1;
  }
  if (p && !l)
    return a || (a = new S()), c || xe(e) ? $e(e, t, r, n, o, a) : yn(e, t, u, r, n, o, a);
  if (!(r & Tn)) {
    var h = l && me.call(e, "__wrapped__"), y = g && me.call(t, "__wrapped__");
    if (h || y) {
      var _ = h ? e.value() : e, T = y ? t.value() : t;
      return a || (a = new S()), o(_, T, r, n, a);
    }
  }
  return p ? (a || (a = new S()), mn(e, t, r, n, o, a)) : !1;
}
function Ce(e, t, r, n, o) {
  return e === t ? !0 : e == null || t == null || !N(e) && !N(t) ? e !== e && t !== t : Sn(e, t, r, n, Ce, o);
}
function An(e, t) {
  return Ce(e, t);
}
window.m = v;
v.cls = (e, t = " ") => {
  let r;
  for (const n in e)
    e[n] && (r = r == null ? n : r + t + n);
  return r || "";
};
const E = {
  INITIAL: "INITIAL",
  FIRST_NAV: "FIRST NAV",
  SAME_ROUTE: "SAME ROUTE",
  REDRAW: "REDRAW",
  BACK: "BACK",
  FORWARD: "FORWARD",
  EXISTING_ROUTE: "EXISTING_ROUTE"
};
let Te = v.route.set;
v.route.set = (e, t, r) => {
  v.nav.setRoute(e, t, r);
};
let i = {
  flows: {},
  routes: {},
  isMounted: !1,
  historyStack: [],
  flattenRoutes: void 0,
  layoutComponent: void 0,
  replacingState: !1,
  isSkipping: !1,
  isRouteChange: !1,
  onmatchCalledCount: 0,
  currentIndex: 0,
  // TODO -- need to implement
  fullStack: [],
  flowStack: [],
  currentFlow: void 0,
  currentFlowName: void 0
};
function H(e = 1) {
  let { historyStack: t } = i, { length: r } = t;
  return !r || e > r ? null : t[r - Math.abs(e)];
}
function Pn(e, t, r) {
  let { historyStack: n } = i, { length: o } = n, a = H(), c = H(-2) || {}, { path: f, params: u } = v.parsePathname(t), l = Le({
    onmatchParams: { args: u, path: f, requestedPath: t, route: r }
  });
  if (!o)
    return n.push(l), { directionType: E.INITIAL, rcState: l };
  let g = i.historyStack.find((p) => p.isEqualByPathAndArgs({ args: e || {}, path: f }));
  if (g != null && g.isEqualByPathAndArgs({ path: f, args: u })) {
    let p = n.indexOf(g), h = (o - (1 + p)) * -1;
    if (h = p - i.currentIndex, h === 0)
      return i.currentIndex = p, { directionType: E.SAME_ROUTE, rcState: a };
    if (h === -1)
      return i.currentIndex = p, n.pop(), { directionType: E.BACK, rcState: c, prevRcState: a };
    if (h === 1)
      return i.currentIndex = p, { directionType: E.FORWARD, rcState: c, prevRcState: a };
    if (h < 0)
      for (let y = h; y < 0; y++)
        n.pop();
    return i.currentIndex = p, { directionType: E.EXISTING_ROUTE, back: h, rcState: l };
  }
  return i.currentIndex++, n.push(l), { directionType: E.FORWARD, rcState: l, prevRcState: a };
}
const Le = (e) => {
  if (!(e != null && e.onmatchParams))
    throw new Error("RouteChangeState() -- onmatchParams required");
  let t = {
    onmatchParams: JSON.parse(JSON.stringify(e.onmatchParams)),
    anim: void 0,
    key: En()
  };
  return {
    debug() {
      return t;
    },
    get onmatchParams() {
      return t.onmatchParams;
    },
    key() {
      return t.key;
    },
    isEqualByPathAndArgs(r) {
      let { args: n, route: o } = t.onmatchParams;
      return An({ args: n || {}, path: o }, r);
    }
  };
};
window.addEventListener("popstate", function(e) {
});
window.addEventListener("hashchange", function(e) {
});
const C = new EventTarget();
v.nav = function() {
  let e = function(t, r, n, o) {
    if (!n)
      throw new Error("m.nav() -- a routes object is required.");
    if (!(o != null && o.layoutComponent))
      throw new Error("m.nav() -- a layout component is required.");
    i.flows = Object.keys(o.flows || {}).reduce((a, c) => (a[c] = Object.assign({}, o.flows[c], { name: c }), a), {}), i.routes = n, i.layoutComponent = o.layoutComponent, wn(), v.route(t || document.body, r, i.flattenedRouteResolvers), i.isMounted = !0;
  };
  return Object.assign(e, {
    debug() {
      return i;
    },
    addEventListener: C.addEventListener.bind(C),
    removeEventListener: C.removeEventListener.bind(C),
    setRoute(t, r, n = {}, o) {
      let { historyStack: a } = i, { params: c } = v.parsePathname(v.buildPathname("/fake", r)), f = { args: c || {}, path: t }, u = a.find((l) => l.isEqualByPathAndArgs(f)), s = a.indexOf(u);
      if (i.currentIndex === s) {
        Object.assign(n, { replace: !0 }), Te(t, r, n);
        return;
      }
      if (u != null && u.isEqualByPathAndArgs(f)) {
        let l = (a.length - (1 + a.indexOf(u))) * -1;
        if (l = s - i.currentIndex, l < 0) {
          history.go(l);
          return;
        }
      }
      (n == null ? void 0 : n.replace) === !0 && (i.replacingState = !0), i.anim = o, Te(t, r, n);
    }
  }), e;
}();
function En() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function Ne(e, t = "") {
  return Object.keys(e).reduce((r, n) => typeof e[n] == "function" || e[n].view || e[n].onmatch || e[n].render ? { ...r, [t + n]: e[n] } : { ...r, ...Ne(e[n], t + n) }, {});
}
function wn() {
  i.flattenedRoutes = Ne(i.routes);
  let { flattenedRoutes: e } = i;
  return i.flattenedRouteResolvers = Object.keys(e).reduce(
    (t, r) => (t[r] = function() {
      let n = e[r], o, a, c = {
        //
        // ONMATCH
        //
        onmatch: (f, u, s) => {
          i.onmatchCalledCount > 0 && (i.historyStack.pop(), i.currentIndex--), i.onmatchCalledCount++;
          let l = H(), g = l && i.flattenedRouteResolvers[l.onmatchParams.route];
          if (g != null && g.hasOwnProperty("onbeforeroutechange")) {
            let { path: h, params: y } = v.parsePathname(u), _ = { args: y, path: h, requestedPath: u, route: s };
            g.onbeforeroutechange({
              lastTransitionState: o,
              inbound: Le({
                onmatchParams: _
              }),
              outbound: l
            });
          }
          if (n.hasOwnProperty("onmatch") && (a = n.onmatch(f, u, s)), a || (a = n), o = Pn(f, u, s), o.isRouteChange = () => i.onmatchCalledCount > 0, o.context = {}, i.replacingState) {
            i.currentIndex--;
            let h = i.historyStack.indexOf(H(-2));
            i.historyStack.splice(h, 1);
          }
          const p = new CustomEvent("onbeforeroutechange", {
            cancelable: !0,
            detail: { transitionState: o, outbound: l }
          });
          return C.dispatchEvent(p), a;
        },
        //
        // RENDER
        //
        render: (f) => {
          let { layoutComponent: u } = i;
          i.onmatchCalledCount ? Promise.resolve().then(() => {
            i.replacingState = !1, i.isSkipping = !1, i.anim = void 0;
          }) : o.directionType = E.REDRAW, i.onmatchCalledCount = 0, i.anim && (o.anim = i.anim);
          let s = o;
          if (!n.hasOwnProperty("render"))
            return f.attrs.transitionState = s, v(
              u,
              { transitionState: s },
              v(a, f.attrs)
            );
          f.attrs.transitionState = s;
          let l = n.render(f);
          return l.tag === u ? (l.attrs.transitionState = s, l) : l.hasOwnProperty("items") ? v(u, {
            cls: l.cls,
            layout: l.layout,
            items: l.items,
            transitionState: s
          }) : v(
            u,
            { transitionState: s },
            l
          );
        }
      };
      return n.hasOwnProperty("onbeforeroutechange") && (c.onbeforeroutechange = n.onbeforeroutechange), c;
    }(), t),
    {}
  ), i.flattenedRouteResolvers;
}
export {
  E as DirectionTypes,
  Le as RouteChangeState
};
