import h from "mithril";
/*! m-dot-nav v2.0.18 | MIT */
function P(e, t, r = () => {
}) {
  let i = t, n = {};
  function c(a, s) {
    i = a, n = { ...n, ...s }, r(i, n);
    const o = e[i];
    o != null && o.invoke && o.invoke(n).then(() => c(o.onDone ?? i, {})).catch(() => c(o.onError ?? i, {}));
  }
  return {
    get current() {
      return i;
    },
    get context() {
      return n;
    },
    send(a, s = {}) {
      var u, l;
      const o = (l = (u = e[i]) == null ? void 0 : u.on) == null ? void 0 : l[a];
      o && c(o, s);
    }
  };
}
const f = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  SAME_ROUTE_CHANGE: "SAME_ROUTE_CHANGE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW"
};
h.cls = (e, t = " ") => {
  let r;
  for (const i in e)
    e[i] && (r = r == null ? i : r + t + i);
  return r || "";
};
function U() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function S(e) {
  return e == null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(S).join(",") + "]" : "{" + Object.keys(e).sort().map((r) => JSON.stringify(r) + ":" + S(e[r])).join(",") + "}";
}
function L(e, t) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != typeof t || typeof e != "object") return !1;
  const r = Object.keys(e), i = Object.keys(t);
  return r.length !== i.length ? !1 : r.every((n) => L(e[n], t[n]));
}
function b(e, t = "") {
  return Object.keys(e).reduce((r, i) => {
    const n = e[i];
    return typeof n == "function" || n.view || n.onmatch || n.render ? { ...r, [t + i]: n } : { ...r, ...b(n, t + i) };
  }, {});
}
function M(e) {
  const { route: t, params: r, args: i } = e;
  return S({ route: t, params: r, args: i });
}
function _(e, t) {
  if (typeof (e == null ? void 0 : e.getIdentity) == "function") {
    const r = e.getIdentity(t);
    return typeof r == "string" ? r : S(r);
  }
  return M(t);
}
function W(e, t) {
  return b(e)[t];
}
function j(e, t) {
  const r = b(e), i = t.split("/").filter((n) => n !== "");
  for (const n of Object.keys(r)) {
    const c = n.split("/").filter((o) => o !== "");
    if (c.length !== i.length) continue;
    const a = {};
    let s = !0;
    for (let o = 0; o < c.length; o++)
      if (c[o].startsWith(":")) a[c[o].slice(1)] = decodeURIComponent(i[o]);
      else if (c[o] !== i[o]) {
        s = !1;
        break;
      }
    if (s) return { pattern: n, def: r[n], args: a };
  }
  return null;
}
function G(e, t) {
  const r = JSON.parse(JSON.stringify(e)), i = U();
  return Object.freeze({
    get onmatchParams() {
      return r;
    },
    get identity() {
      return t;
    },
    key() {
      return i;
    }
  });
}
function X() {
  let e = [], t = -1;
  return {
    get current() {
      return e[t] ?? null;
    },
    get length() {
      return e.length;
    },
    get index() {
      return t;
    },
    get stack() {
      return e;
    },
    findExisting(r) {
      const i = e.findIndex((n) => n.identity === r);
      return i >= 0 ? { entry: e[i], index: i } : null;
    },
    push(r) {
      e = e.slice(0, t + 1), e.push(r), t = e.length - 1;
    },
    truncateForward() {
      e = e.slice(0, t + 1);
    },
    moveTo(r) {
      t = r;
    },
    replaceCurrent(r) {
      e[t] = r;
    }
  };
}
function $(e, t, r, i = !1, n = !1) {
  const c = G(t, r);
  if (e.length === 0)
    return e.push(c), { directionType: f.INITIAL, rcState: c, pushed: !0 };
  const a = e.findExisting(r);
  if (a) {
    const o = a.index - e.index, u = e.current;
    if (e.moveTo(a.index), o === 0) {
      const l = !L(a.entry.onmatchParams, t);
      return l && e.replaceCurrent(c), {
        directionType: l ? f.SAME_ROUTE_CHANGE : f.SAME_ROUTE,
        rcState: l ? c : a.entry,
        pushed: !1
      };
    }
    return o === -1 ? { directionType: f.BACK, rcState: a.entry, prevRcState: u, pushed: !1 } : o === 1 ? { directionType: f.FORWARD, rcState: a.entry, prevRcState: u, pushed: !1 } : { directionType: f.EXISTING_ROUTE, rcState: a.entry, prevRcState: u, delta: o, pushed: !1 };
  }
  const s = e.current;
  return i ? n || e.index < 0 ? (e.push(c), { directionType: f.FORWARD, rcState: c, prevRcState: s, pushed: !0 }) : (e.replaceCurrent(c), { directionType: f.FORWARD, rcState: c, prevRcState: s, pushed: !1 }) : (e.push(c), { directionType: f.FORWARD, rcState: c, prevRcState: s, pushed: !0 });
}
function H(e) {
  return P(
    {
      idle: {
        on: { ONMATCH: "matching" }
      },
      matching: {
        on: {
          // Second ONMATCH before render = redirect inside user's onmatch.
          // Roll back the speculative history push before re-entering.
          ONMATCH: "matching",
          RENDER: "idle"
        }
      }
    },
    "idle"
  );
}
function K(e) {
  const t = b(e.routes);
  return e.resolvers = Object.keys(t).reduce((r, i) => {
    const n = t[i], c = e.router, a = {
      onmatch(s, o, u) {
        var D;
        const l = e.chainInProgress;
        e.chainInProgress = !1, l || (e.notifiedOutboundKeys = /* @__PURE__ */ new Set());
        const y = l && e.lastCyclePushed;
        y && e.history.moveTo(e.history.index - 1);
        const d = e.history.current;
        let p;
        const { path: g, params: E } = h.parsePathname(o), R = { args: s, params: E, path: g, requestedPath: o, route: u }, I = _(n, R), x = e.replacingState;
        e.replacingState = !1;
        let v = $(e.history, R, I, x, y);
        v.context = {}, e.lastCyclePushed = v.pushed;
        const C = { onmatchParams: R }, N = ((D = d == null ? void 0 : d.key) == null ? void 0 : D.call(d)) ?? null, T = d && e.resolvers[d.onmatchParams.route];
        T != null && T.onbeforeroutechange && !e.notifiedOutboundKeys.has(N) && T.onbeforeroutechange({ inbound: C, outbound: d, requestedPath: o }), e.notifiedOutboundKeys.add(N);
        const { directionType: A } = v, F = {
          directionType: A,
          isForward: A === f.FORWARD || A === f.INITIAL,
          isBack: A === f.BACK || A === f.EXISTING_ROUTE,
          isSameRoute: A === f.SAME_ROUTE,
          isSameRouteChange: A === f.SAME_ROUTE_CHANGE
        };
        n.onmatch && (e.insideUserOnmatch = !0, p = n.onmatch(s, o, u, F), e.insideUserOnmatch = !1), p || (p = n), e.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: v, inbound: C, outbound: d }
        }));
        const w = e.pendingAnim;
        return e.pendingAnim = void 0, c.send("ONMATCH", {
          transitionState: v,
          resolvedComponent: p,
          anim: w
        }), p;
      },
      render(s) {
        const { layoutComponent: o } = e, { transitionState: u, anim: l } = c.context, y = c.current === "idle" ? { ...u, directionType: f.REDRAW } : u;
        if (l && (y.anim = l), c.send("RENDER"), s.attrs.transitionState = y, !n.render)
          return h(
            o,
            { transitionState: y },
            h(c.context.resolvedComponent ?? n, s.attrs)
          );
        const d = n.render(s);
        return d.tag === o ? (d.attrs.transitionState = y, d) : d.items ? h(o, {
          cls: d.cls,
          layout: d.layout,
          items: d.items,
          transitionState: y
        }) : h(o, { transitionState: y }, d);
      }
    };
    return n.onbeforeroutechange && (a.onbeforeroutechange = n.onbeforeroutechange), r[i] = a, r;
  }, {}), e.resolvers;
}
const m = {
  routes: void 0,
  layoutComponent: void 0,
  resolvers: void 0,
  history: X(),
  router: null,
  // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: void 0,
  replacingState: !1,
  // setRoute→onmatch handoff flag
  notifiedOutboundKeys: /* @__PURE__ */ new Set(),
  // dedupes onbeforeroutechange across a redirect chain
  insideUserOnmatch: !1,
  // true while a route's onmatch() is executing
  chainInProgress: !1,
  // set when setRoute() is called from inside onmatch (a redirect)
  lastCyclePushed: !1
  // whether the previous cycle's resolveTransition call pushed a new entry
}, k = h.route.set;
h.route.set = (e, t, r) => h.nav.setRoute(e, t, r);
h.nav = function(t, r, i, n) {
  if (!i) throw new Error("m.nav() — routes is required.");
  if (!(n != null && n.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  m.routes = i, m.layoutComponent = n.layoutComponent, m.router = H(m.history), K(m), h.route(t ?? document.body, r, m.resolvers);
};
Object.assign(h.nav, {
  setRoute(e, t, r = {}, i) {
    m.insideUserOnmatch && (m.chainInProgress = !0);
    const n = h.buildPathname(e, t), { path: c, params: a } = h.parsePathname(n);
    let s = W(m.routes, e), o = e, u = t ?? a ?? {};
    if (!s) {
      const p = j(m.routes, c);
      p && (s = p.def, o = p.pattern, u = { ...p.args, ...a });
    }
    const y = _(s, {
      args: u,
      params: a ?? {},
      path: c,
      requestedPath: n,
      route: o
    }), d = m.history.findExisting(y);
    if (m.pendingAnim = i, d && d.index === m.history.index) {
      k(e, t, { ...r, replace: !0 });
      return;
    }
    if (d) {
      const p = d.index - m.history.index;
      if (p < 0) {
        window.history.go(p);
        return;
      }
      p > 0 && m.history.truncateForward();
    }
    r.replace === !0 && (m.replacingState = !0), k(e, t, r);
  },
  addEventListener: m.events.addEventListener.bind(m.events),
  removeEventListener: m.events.removeEventListener.bind(m.events),
  debug() {
    var e;
    return { ...m, routerState: (e = m.router) == null ? void 0 : e.current };
  }
});
const q = h.nav;
function O(e = {}) {
  const { animate: t, overlay: r } = e;
  return function() {
    let n = {
      inbound: {},
      outbound: {}
    };
    function c() {
      return {
        view({ attrs: a, children: s }) {
          return h("div", {
            "data-page-key": a.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, s);
        },
        oncreate({ dom: a }) {
          n.inbound.page = { dom: a };
        },
        onbeforeremove({ dom: a }) {
          return new Promise((s) => {
            n.outbound.page = { dom: a, resolver: s };
          });
        }
      };
    }
    return {
      view({ attrs: a, children: s }) {
        const { transitionState: o } = a, u = o == null ? void 0 : o.directionType;
        return u !== f.REDRAW && u !== f.SAME_ROUTE && (this._key = o.rcState.key()), h(
          "div",
          {
            style: "display:grid; overflow:hidden; height:100%; width:100%;"
          },
          [
            h(c, { key: this._key }, s),
            r && r()
          ].filter(Boolean)
        );
      },
      oncreate({ attrs: a }) {
        a.transitionState.context = n;
      },
      onupdate({ attrs: a }) {
        const { transitionState: s } = a, o = s == null ? void 0 : s.directionType;
        o === f.REDRAW || o === f.SAME_ROUTE || o === f.SAME_ROUTE_CHANGE || (s.context = n, Promise.resolve().then(() => {
          var d;
          const { outbound: u, inbound: l } = n;
          if (!((d = u.page) != null && d.dom)) return;
          const y = s.anim ?? t;
          y ? y(s) : u.page.resolver(), n.outbound = {}, n.inbound = {};
        }));
      }
    };
  };
}
function J(e = {}) {
  const t = e.duration ?? 200, r = e.overlay;
  return O({
    overlay: r,
    animate(i) {
      const { outbound: n } = i.context, c = n.page.dom, a = n.page.resolver;
      c.style.transition = `opacity ${t}ms ease`, c.style.opacity = "0", c.addEventListener("transitionend", function s(o) {
        o.propertyName === "opacity" && (c.removeEventListener("transitionend", s), a());
      }), setTimeout(a, t + 100);
    }
  });
}
function z(e = {}) {
  const t = e.duration ?? 300, r = e.overlay;
  return O({
    overlay: r,
    animate(i) {
      const { outbound: n, inbound: c } = i.context, a = n.page.dom, s = c.page.dom, o = n.page.resolver, u = i.directionType, l = u === f.FORWARD || u === f.INITIAL, y = l ? "100%" : "-100%", d = l ? "-100%" : "100%";
      let p = !1;
      const g = () => {
        p || (p = !0, o());
      };
      s.style.transform = `translateX(${y})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        a.style.transition = `transform ${t}ms ease`, a.style.transform = `translateX(${d})`, s.style.transition = `transform ${t}ms ease`, s.style.transform = "translateX(0)", s.addEventListener("transitionend", function E(R) {
          R.propertyName === "transform" && (s.removeEventListener("transitionend", E), s.style.transition = "", s.style.transform = "", g());
        }), setTimeout(g, t + 100);
      }));
    }
  });
}
function Q(e = {}) {
  const t = e.tabRoots ?? [], r = e.duration ?? 300, i = e.fadeDuration ?? 180, n = e.overlay;
  function c(a) {
    var u, l, y, d;
    const s = (l = (u = a.rcState) == null ? void 0 : u.onmatchParams) == null ? void 0 : l.route, o = (d = (y = a.prevRcState) == null ? void 0 : y.onmatchParams) == null ? void 0 : d.route;
    return t.includes(s) && t.includes(o);
  }
  return O({
    overlay: n,
    animate(a) {
      const { outbound: s, inbound: o } = a.context, u = s.page.dom, l = o.page.dom, y = s.page.resolver, d = a.directionType;
      let p = !1;
      const g = () => {
        p || (p = !0, y());
      };
      if (c(a))
        u.style.transition = `opacity ${i}ms ease`, u.style.opacity = "0", u.addEventListener("transitionend", function E(R) {
          R.propertyName === "opacity" && (u.removeEventListener("transitionend", E), g());
        }), setTimeout(g, i + 100);
      else {
        const E = d === f.FORWARD || d === f.INITIAL, R = E ? "100%" : "-100%", I = E ? "-100%" : "100%";
        l.style.transform = `translateX(${R})`, requestAnimationFrame(() => requestAnimationFrame(() => {
          u.style.transition = `transform ${r}ms ease`, u.style.transform = `translateX(${I})`, l.style.transition = `transform ${r}ms ease`, l.style.transform = "translateX(0)", l.addEventListener("transitionend", function x(v) {
            v.propertyName === "transform" && (l.removeEventListener("transitionend", x), l.style.transition = "", l.style.transform = "", g());
          }), setTimeout(g, r + 100);
        }));
      }
    }
  });
}
function V() {
  return O({
    animate(e) {
      const { outbound: t, inbound: r } = e.context, i = t.page.dom, n = r.page.dom, c = t.page.resolver, a = e.directionType;
      i.setAttribute("data-nav-anim", "out"), i.setAttribute("data-direction", a), n.setAttribute("data-nav-anim", "in"), n.setAttribute("data-direction", a), i.addEventListener("animationend", function s() {
        i.removeEventListener("animationend", s), c();
      }), setTimeout(c, 600);
    }
  });
}
export {
  f as DirectionTypes,
  G as RouteChangeState,
  V as createCssNavLayout,
  J as createFadeLayout,
  Q as createMobileLayout,
  O as createNavLayout,
  z as createSlideLayout,
  q as default
};
