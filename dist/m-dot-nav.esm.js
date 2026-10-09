import h from "mithril";
/*! m-dot-nav v2.0.19 | MIT */
function M(e, t, n = () => {
}) {
  let i = t, r = {};
  function c(s, a) {
    i = s, r = { ...r, ...a }, n(i, r);
    const o = e[i];
    o != null && o.invoke && o.invoke(r).then(() => c(o.onDone ?? i, {})).catch(() => c(o.onError ?? i, {}));
  }
  return {
    get current() {
      return i;
    },
    get context() {
      return r;
    },
    send(s, a = {}) {
      var u, l;
      const o = (l = (u = e[i]) == null ? void 0 : u.on) == null ? void 0 : l[s];
      o && c(o, a);
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
  let n;
  for (const i in e)
    e[i] && (n = n == null ? i : n + t + i);
  return n || "";
};
function P() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function S(e) {
  return e == null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(S).join(",") + "]" : "{" + Object.keys(e).sort().map((n) => JSON.stringify(n) + ":" + S(e[n])).join(",") + "}";
}
function _(e, t) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != typeof t || typeof e != "object") return !1;
  const n = Object.keys(e), i = Object.keys(t);
  return n.length !== i.length ? !1 : n.every((r) => _(e[r], t[r]));
}
function b(e, t = "") {
  return Object.keys(e).reduce((n, i) => {
    const r = e[i];
    return typeof r == "function" || r.view || r.onmatch || r.render ? { ...n, [t + i]: r } : { ...n, ...b(r, t + i) };
  }, {});
}
function W(e) {
  const { route: t, params: n, args: i } = e;
  return S({ route: t, params: n, args: i });
}
function F(e, t) {
  if (typeof (e == null ? void 0 : e.getIdentity) == "function") {
    const n = e.getIdentity(t);
    return typeof n == "string" ? n : S(n);
  }
  return W(t);
}
function j(e, t) {
  return b(e)[t];
}
function G(e, t) {
  const n = b(e), i = t.split("/").filter((r) => r !== "");
  for (const r of Object.keys(n)) {
    const c = r.split("/").filter((o) => o !== "");
    if (c.length !== i.length) continue;
    const s = {};
    let a = !0;
    for (let o = 0; o < c.length; o++)
      if (c[o].startsWith(":")) s[c[o].slice(1)] = decodeURIComponent(i[o]);
      else if (c[o] !== i[o]) {
        a = !1;
        break;
      }
    if (a) return { pattern: r, def: n[r], args: s };
  }
  return null;
}
function k(e, t, n = P()) {
  const i = JSON.parse(JSON.stringify(e));
  return Object.freeze({
    get onmatchParams() {
      return i;
    },
    get identity() {
      return t;
    },
    key() {
      return n;
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
    findExisting(n) {
      const i = e.findIndex((r) => r.identity === n);
      return i >= 0 ? { entry: e[i], index: i } : null;
    },
    push(n) {
      e = e.slice(0, t + 1), e.push(n), t = e.length - 1;
    },
    truncateForward() {
      e = e.slice(0, t + 1);
    },
    moveTo(n) {
      t = n;
    },
    replaceCurrent(n) {
      e[t] = n;
    }
  };
}
function $(e, t, n, i = !1, r = !1) {
  const c = k(t, n);
  if (e.length === 0)
    return e.push(c), { directionType: f.INITIAL, rcState: c, pushed: !0 };
  const s = e.findExisting(n);
  if (s) {
    const o = s.index - e.index, u = e.current;
    if (e.moveTo(s.index), o === 0) {
      if (!_(s.entry.onmatchParams, t)) {
        const m = k(t, n, s.entry.key());
        return e.replaceCurrent(m), { directionType: f.SAME_ROUTE_CHANGE, rcState: m, pushed: !1 };
      }
      return { directionType: f.SAME_ROUTE, rcState: s.entry, pushed: !1 };
    }
    return o === -1 ? { directionType: f.BACK, rcState: s.entry, prevRcState: u, pushed: !1 } : o === 1 ? { directionType: f.FORWARD, rcState: s.entry, prevRcState: u, pushed: !1 } : { directionType: f.EXISTING_ROUTE, rcState: s.entry, prevRcState: u, delta: o, pushed: !1 };
  }
  const a = e.current;
  return i ? r || e.index < 0 ? (e.push(c), { directionType: f.FORWARD, rcState: c, prevRcState: a, pushed: !0 }) : (e.replaceCurrent(c), { directionType: f.FORWARD, rcState: c, prevRcState: a, pushed: !1 }) : (e.push(c), { directionType: f.FORWARD, rcState: c, prevRcState: a, pushed: !0 });
}
function H(e) {
  return M(
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
  return e.resolvers = Object.keys(t).reduce((n, i) => {
    const r = t[i], c = e.router, s = {
      onmatch(a, o, u) {
        var D;
        const l = e.chainInProgress;
        e.chainInProgress = !1, l || (e.notifiedOutboundKeys = /* @__PURE__ */ new Set());
        const m = l && e.lastCyclePushed;
        m && e.history.moveTo(e.history.index - 1);
        const d = e.history.current;
        let p;
        const { path: g, params: E } = h.parsePathname(o), R = { args: a, params: E, path: g, requestedPath: o, route: u }, I = F(r, R), C = e.replacingState;
        e.replacingState = !1;
        let v = $(e.history, R, I, C, m);
        v.context = {}, e.lastCyclePushed = v.pushed;
        const x = { onmatchParams: R }, N = ((D = d == null ? void 0 : d.key) == null ? void 0 : D.call(d)) ?? null, T = d && e.resolvers[d.onmatchParams.route];
        T != null && T.onbeforeroutechange && !e.notifiedOutboundKeys.has(N) && T.onbeforeroutechange({ inbound: x, outbound: d, requestedPath: o }), e.notifiedOutboundKeys.add(N);
        const { directionType: A } = v, w = {
          directionType: A,
          isForward: A === f.FORWARD || A === f.INITIAL,
          isBack: A === f.BACK || A === f.EXISTING_ROUTE,
          isSameRoute: A === f.SAME_ROUTE,
          isSameRouteChange: A === f.SAME_ROUTE_CHANGE
        };
        r.onmatch && (e.insideUserOnmatch = !0, p = r.onmatch(a, o, u, w), e.insideUserOnmatch = !1), p || (p = r), e.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: v, inbound: x, outbound: d }
        }));
        const U = e.pendingAnim;
        return e.pendingAnim = void 0, c.send("ONMATCH", {
          transitionState: v,
          resolvedComponent: p,
          anim: U
        }), p;
      },
      render(a) {
        const { layoutComponent: o } = e, { transitionState: u, anim: l } = c.context, m = c.current === "idle" ? { ...u, directionType: f.REDRAW } : u;
        if (l && (m.anim = l), c.send("RENDER"), a.attrs.transitionState = m, !r.render)
          return h(
            o,
            { transitionState: m },
            h(c.context.resolvedComponent ?? r, a.attrs)
          );
        const d = r.render(a);
        return d.tag === o ? (d.attrs.transitionState = m, d) : d.items ? h(o, {
          cls: d.cls,
          layout: d.layout,
          items: d.items,
          transitionState: m
        }) : h(o, { transitionState: m }, d);
      }
    };
    return r.onbeforeroutechange && (s.onbeforeroutechange = r.onbeforeroutechange), n[i] = s, n;
  }, {}), e.resolvers;
}
const y = {
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
}, L = h.route.set;
h.route.set = (e, t, n) => h.nav.setRoute(e, t, n);
h.nav = function(t, n, i, r) {
  if (!i) throw new Error("m.nav() — routes is required.");
  if (!(r != null && r.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  y.routes = i, y.layoutComponent = r.layoutComponent, y.router = H(y.history), K(y), h.route(t ?? document.body, n, y.resolvers);
};
Object.assign(h.nav, {
  setRoute(e, t, n = {}, i) {
    y.insideUserOnmatch && (y.chainInProgress = !0);
    const r = h.buildPathname(e, t), { path: c, params: s } = h.parsePathname(r);
    let a = j(y.routes, e), o = e, u = t ?? s ?? {};
    if (!a) {
      const p = G(y.routes, c);
      p && (a = p.def, o = p.pattern, u = { ...p.args, ...s });
    }
    const m = F(a, {
      args: u,
      params: s ?? {},
      path: c,
      requestedPath: r,
      route: o
    }), d = y.history.findExisting(m);
    if (y.pendingAnim = i, d && d.index === y.history.index) {
      L(e, t, { ...n, replace: !0 });
      return;
    }
    if (d) {
      const p = d.index - y.history.index;
      if (p < 0) {
        window.history.go(p);
        return;
      }
      p > 0 && y.history.truncateForward();
    }
    n.replace === !0 && (y.replacingState = !0), L(e, t, n);
  },
  addEventListener: y.events.addEventListener.bind(y.events),
  removeEventListener: y.events.removeEventListener.bind(y.events),
  debug() {
    var e;
    return { ...y, routerState: (e = y.router) == null ? void 0 : e.current };
  }
});
const q = h.nav;
function O(e = {}) {
  const { animate: t, overlay: n } = e;
  return function() {
    let r = {
      inbound: {},
      outbound: {}
    };
    function c() {
      return {
        view({ attrs: s, children: a }) {
          return h("div", {
            "data-page-key": s.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, a);
        },
        oncreate({ dom: s }) {
          r.inbound.page = { dom: s };
        },
        onbeforeremove({ dom: s }) {
          return new Promise((a) => {
            r.outbound.page = { dom: s, resolver: a };
          });
        }
      };
    }
    return {
      view({ attrs: s, children: a }) {
        const { transitionState: o } = s, u = o == null ? void 0 : o.directionType;
        return u !== f.REDRAW && u !== f.SAME_ROUTE && (this._key = o.rcState.key()), h(
          "div",
          {
            style: "display:grid; overflow:hidden; height:100%; width:100%;"
          },
          [
            h(c, { key: this._key }, a),
            n && n()
          ].filter(Boolean)
        );
      },
      oncreate({ attrs: s }) {
        s.transitionState.context = r;
      },
      onupdate({ attrs: s }) {
        const { transitionState: a } = s, o = a == null ? void 0 : a.directionType;
        o === f.REDRAW || o === f.SAME_ROUTE || o === f.SAME_ROUTE_CHANGE || (a.context = r, Promise.resolve().then(() => {
          var d;
          const { outbound: u, inbound: l } = r;
          if (!((d = u.page) != null && d.dom)) return;
          const m = a.anim ?? t;
          m ? m(a) : u.page.resolver(), r.outbound = {}, r.inbound = {};
        }));
      }
    };
  };
}
function J(e = {}) {
  const t = e.duration ?? 200, n = e.overlay;
  return O({
    overlay: n,
    animate(i) {
      const { outbound: r } = i.context, c = r.page.dom, s = r.page.resolver;
      c.style.transition = `opacity ${t}ms ease`, c.style.opacity = "0", c.addEventListener("transitionend", function a(o) {
        o.propertyName === "opacity" && (c.removeEventListener("transitionend", a), s());
      }), setTimeout(s, t + 100);
    }
  });
}
function z(e = {}) {
  const t = e.duration ?? 300, n = e.overlay;
  return O({
    overlay: n,
    animate(i) {
      const { outbound: r, inbound: c } = i.context, s = r.page.dom, a = c.page.dom, o = r.page.resolver, u = i.directionType, l = u === f.FORWARD || u === f.INITIAL, m = l ? "100%" : "-100%", d = l ? "-100%" : "100%";
      let p = !1;
      const g = () => {
        p || (p = !0, o());
      };
      a.style.transform = `translateX(${m})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.transition = `transform ${t}ms ease`, s.style.transform = `translateX(${d})`, a.style.transition = `transform ${t}ms ease`, a.style.transform = "translateX(0)", a.addEventListener("transitionend", function E(R) {
          R.propertyName === "transform" && (a.removeEventListener("transitionend", E), a.style.transition = "", a.style.transform = "", g());
        }), setTimeout(g, t + 100);
      }));
    }
  });
}
function Q(e = {}) {
  const t = e.tabRoots ?? [], n = e.duration ?? 300, i = e.fadeDuration ?? 180, r = e.overlay;
  function c(s) {
    var u, l, m, d;
    const a = (l = (u = s.rcState) == null ? void 0 : u.onmatchParams) == null ? void 0 : l.route, o = (d = (m = s.prevRcState) == null ? void 0 : m.onmatchParams) == null ? void 0 : d.route;
    return t.includes(a) && t.includes(o);
  }
  return O({
    overlay: r,
    animate(s) {
      const { outbound: a, inbound: o } = s.context, u = a.page.dom, l = o.page.dom, m = a.page.resolver, d = s.directionType;
      let p = !1;
      const g = () => {
        p || (p = !0, m());
      };
      if (c(s))
        u.style.transition = `opacity ${i}ms ease`, u.style.opacity = "0", u.addEventListener("transitionend", function E(R) {
          R.propertyName === "opacity" && (u.removeEventListener("transitionend", E), g());
        }), setTimeout(g, i + 100);
      else {
        const E = d === f.FORWARD || d === f.INITIAL, R = E ? "100%" : "-100%", I = E ? "-100%" : "100%";
        l.style.transform = `translateX(${R})`, requestAnimationFrame(() => requestAnimationFrame(() => {
          u.style.transition = `transform ${n}ms ease`, u.style.transform = `translateX(${I})`, l.style.transition = `transform ${n}ms ease`, l.style.transform = "translateX(0)", l.addEventListener("transitionend", function C(v) {
            v.propertyName === "transform" && (l.removeEventListener("transitionend", C), l.style.transition = "", l.style.transform = "", g());
          }), setTimeout(g, n + 100);
        }));
      }
    }
  });
}
function V() {
  return O({
    animate(e) {
      const { outbound: t, inbound: n } = e.context, i = t.page.dom, r = n.page.dom, c = t.page.resolver, s = e.directionType;
      i.setAttribute("data-nav-anim", "out"), i.setAttribute("data-direction", s), r.setAttribute("data-nav-anim", "in"), r.setAttribute("data-direction", s), i.addEventListener("animationend", function a() {
        i.removeEventListener("animationend", a), c();
      }), setTimeout(c, 600);
    }
  });
}
export {
  f as DirectionTypes,
  k as RouteChangeState,
  V as createCssNavLayout,
  J as createFadeLayout,
  Q as createMobileLayout,
  O as createNavLayout,
  z as createSlideLayout,
  q as default
};
