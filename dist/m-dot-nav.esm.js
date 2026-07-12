import p from "mithril";
/*! m-dot-nav v2.0.16 | MIT */
function k(e, n, r = () => {
}) {
  let o = n, t = {};
  function c(a, s) {
    o = a, t = { ...t, ...s }, r(o, t);
    const i = e[o];
    i != null && i.invoke && i.invoke(t).then(() => c(i.onDone ?? o, {})).catch(() => c(i.onError ?? o, {}));
  }
  return {
    get current() {
      return o;
    },
    get context() {
      return t;
    },
    send(a, s = {}) {
      var u, m;
      const i = (m = (u = e[o]) == null ? void 0 : u.on) == null ? void 0 : m[a];
      i && c(i, s);
    }
  };
}
const l = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  SAME_ROUTE_CHANGE: "SAME_ROUTE_CHANGE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW"
};
p.cls = (e, n = " ") => {
  let r;
  for (const o in e)
    e[o] && (r = r == null ? o : r + n + o);
  return r || "";
};
function w() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function b(e) {
  return e == null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(b).join(",") + "]" : "{" + Object.keys(e).sort().map((r) => JSON.stringify(r) + ":" + b(e[r])).join(",") + "}";
}
function C(e, n) {
  if (e === n) return !0;
  if (e == null || n == null || typeof e != typeof n || typeof e != "object") return !1;
  const r = Object.keys(e), o = Object.keys(n);
  return r.length !== o.length ? !1 : r.every((t) => C(e[t], n[t]));
}
function O(e, n = "") {
  return Object.keys(e).reduce((r, o) => {
    const t = e[o];
    return typeof t == "function" || t.view || t.onmatch || t.render ? { ...r, [n + o]: t } : { ...r, ...O(t, n + o) };
  }, {});
}
function F(e) {
  const { route: n, params: r, args: o } = e;
  return b({ route: n, params: r, args: o });
}
function D(e, n) {
  if (typeof (e == null ? void 0 : e.getIdentity) == "function") {
    const r = e.getIdentity(n);
    return typeof r == "string" ? r : b(r);
  }
  return F(n);
}
function M(e, n) {
  return O(e)[n];
}
function U(e, n) {
  const r = O(e), o = n.split("/").filter((t) => t !== "");
  for (const t of Object.keys(r)) {
    const c = t.split("/").filter((i) => i !== "");
    if (c.length !== o.length) continue;
    const a = {};
    let s = !0;
    for (let i = 0; i < c.length; i++)
      if (c[i].startsWith(":")) a[c[i].slice(1)] = decodeURIComponent(o[i]);
      else if (c[i] !== o[i]) {
        s = !1;
        break;
      }
    if (s) return { pattern: t, def: r[t], args: a };
  }
  return null;
}
function W(e, n) {
  const r = JSON.parse(JSON.stringify(e)), o = w();
  return Object.freeze({
    get onmatchParams() {
      return r;
    },
    get identity() {
      return n;
    },
    key() {
      return o;
    }
  });
}
function P() {
  let e = [], n = -1;
  return {
    get current() {
      return e[n] ?? null;
    },
    get length() {
      return e.length;
    },
    get index() {
      return n;
    },
    get stack() {
      return e;
    },
    findExisting(r) {
      const o = e.findIndex((t) => t.identity === r);
      return o >= 0 ? { entry: e[o], index: o } : null;
    },
    push(r) {
      e = e.slice(0, n + 1), e.push(r), n = e.length - 1;
    },
    truncateForward() {
      e = e.slice(0, n + 1);
    },
    moveTo(r) {
      n = r;
    },
    replaceCurrent(r) {
      e[n] = r;
    }
  };
}
function j(e, n, r, o = !1) {
  const t = W(n, r);
  if (e.length === 0)
    return e.push(t), { directionType: l.INITIAL, rcState: t };
  const c = e.findExisting(r);
  if (c) {
    const s = c.index - e.index, i = e.current;
    return e.moveTo(c.index), s === 0 ? {
      directionType: !C(c.entry.onmatchParams, n) ? l.SAME_ROUTE_CHANGE : l.SAME_ROUTE,
      rcState: c.entry
    } : s === -1 ? { directionType: l.BACK, rcState: c.entry, prevRcState: i } : s === 1 ? { directionType: l.FORWARD, rcState: c.entry, prevRcState: i } : { directionType: l.EXISTING_ROUTE, rcState: c.entry, prevRcState: i, delta: s };
  }
  const a = e.current;
  return o ? (e.index < 0 ? e.push(t) : e.replaceCurrent(t), { directionType: l.FORWARD, rcState: t, prevRcState: a }) : (e.push(t), { directionType: l.FORWARD, rcState: t, prevRcState: a });
}
function G(e) {
  return k(
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
function X(e) {
  const n = O(e.routes);
  return e.resolvers = Object.keys(n).reduce((r, o) => {
    const t = n[o], c = e.router, a = {
      onmatch(s, i, u) {
        c.current === "matching" && e.history.moveTo(e.history.index - 1);
        const f = e.history.current;
        let d;
        const { path: g, params: h } = p.parsePathname(i), v = { args: s, params: h, path: g, requestedPath: i, route: u }, E = D(t, v), I = e.replacingState;
        e.replacingState = !1;
        let A = j(e.history, v, E, I);
        A.context = {};
        const T = { onmatchParams: v }, S = f && e.resolvers[f.onmatchParams.route];
        S != null && S.onbeforeroutechange && S.onbeforeroutechange({ inbound: T, outbound: f, requestedPath: i });
        const { directionType: R } = A, L = {
          directionType: R,
          isForward: R === l.FORWARD || R === l.INITIAL,
          isBack: R === l.BACK || R === l.EXISTING_ROUTE,
          isSameRoute: R === l.SAME_ROUTE,
          isSameRouteChange: R === l.SAME_ROUTE_CHANGE
        };
        t.onmatch && (d = t.onmatch(s, i, u, L)), d || (d = t), e.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: A, inbound: T, outbound: f }
        }));
        const _ = e.pendingAnim;
        return e.pendingAnim = void 0, c.send("ONMATCH", {
          transitionState: A,
          resolvedComponent: d,
          anim: _
        }), d;
      },
      render(s) {
        const { layoutComponent: i } = e, { transitionState: u, anim: m } = c.context, f = c.current === "idle" ? { ...u, directionType: l.REDRAW } : u;
        if (m && (f.anim = m), c.send("RENDER"), s.attrs.transitionState = f, !t.render)
          return p(
            i,
            { transitionState: f },
            p(c.context.resolvedComponent ?? t, s.attrs)
          );
        const d = t.render(s);
        return d.tag === i ? (d.attrs.transitionState = f, d) : d.items ? p(i, {
          cls: d.cls,
          layout: d.layout,
          items: d.items,
          transitionState: f
        }) : p(i, { transitionState: f }, d);
      }
    };
    return t.onbeforeroutechange && (a.onbeforeroutechange = t.onbeforeroutechange), r[o] = a, r;
  }, {}), e.resolvers;
}
const y = {
  routes: void 0,
  layoutComponent: void 0,
  resolvers: void 0,
  history: P(),
  router: null,
  // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: void 0,
  replacingState: !1
  // setRoute→onmatch handoff flag
}, N = p.route.set;
p.route.set = (e, n, r) => p.nav.setRoute(e, n, r);
p.nav = function(n, r, o, t) {
  if (!o) throw new Error("m.nav() — routes is required.");
  if (!(t != null && t.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  y.routes = o, y.layoutComponent = t.layoutComponent, y.router = G(), X(y), p.route(n ?? document.body, r, y.resolvers);
};
Object.assign(p.nav, {
  setRoute(e, n, r = {}, o) {
    const t = p.buildPathname(e, n), { path: c, params: a } = p.parsePathname(t);
    let s = M(y.routes, e), i = e, u = n ?? a ?? {};
    if (!s) {
      const g = U(y.routes, c);
      g && (s = g.def, i = g.pattern, u = { ...g.args, ...a });
    }
    const f = D(s, {
      args: u,
      params: a ?? {},
      path: c,
      requestedPath: t,
      route: i
    }), d = y.history.findExisting(f);
    if (y.pendingAnim = o, d && d.index === y.history.index) {
      N(e, n, { ...r, replace: !0 });
      return;
    }
    if (d) {
      const g = d.index - y.history.index;
      if (g < 0) {
        window.history.go(g);
        return;
      }
      g > 0 && y.history.truncateForward();
    }
    r.replace === !0 && (y.replacingState = !0), N(e, n, r);
  },
  addEventListener: y.events.addEventListener.bind(y.events),
  removeEventListener: y.events.removeEventListener.bind(y.events),
  debug() {
    var e;
    return { ...y, routerState: (e = y.router) == null ? void 0 : e.current };
  }
});
const H = p.nav;
function x(e = {}) {
  const { animate: n, overlay: r } = e;
  return function() {
    let t = {
      inbound: {},
      outbound: {}
    };
    function c() {
      return {
        view({ attrs: a, children: s }) {
          return p("div", {
            "data-page-key": a.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, s);
        },
        oncreate({ dom: a }) {
          t.inbound.page = { dom: a };
        },
        onbeforeremove({ dom: a }) {
          return new Promise((s) => {
            t.outbound.page = { dom: a, resolver: s };
          });
        }
      };
    }
    return {
      view({ attrs: a, children: s }) {
        const { transitionState: i } = a, u = i == null ? void 0 : i.directionType;
        return u !== l.REDRAW && u !== l.SAME_ROUTE && (this._key = i.rcState.key()), p(
          "div",
          {
            style: "display:grid; overflow:hidden; height:100%; width:100%;"
          },
          [
            p(c, { key: this._key }, s),
            r && r()
          ].filter(Boolean)
        );
      },
      oncreate({ attrs: a }) {
        a.transitionState.context = t;
      },
      onupdate({ attrs: a }) {
        const { transitionState: s } = a, i = s == null ? void 0 : s.directionType;
        i === l.REDRAW || i === l.SAME_ROUTE || i === l.SAME_ROUTE_CHANGE || (s.context = t, Promise.resolve().then(() => {
          var d;
          const { outbound: u, inbound: m } = t;
          if (!((d = u.page) != null && d.dom)) return;
          const f = s.anim ?? n;
          f ? f(s) : u.page.resolver(), t.outbound = {}, t.inbound = {};
        }));
      }
    };
  };
}
function B(e = {}) {
  const n = e.duration ?? 200, r = e.overlay;
  return x({
    overlay: r,
    animate(o) {
      const { outbound: t } = o.context, c = t.page.dom, a = t.page.resolver;
      c.style.transition = `opacity ${n}ms ease`, c.style.opacity = "0", c.addEventListener("transitionend", function s(i) {
        i.propertyName === "opacity" && (c.removeEventListener("transitionend", s), a());
      }), setTimeout(a, n + 100);
    }
  });
}
function q(e = {}) {
  const n = e.duration ?? 300, r = e.overlay;
  return x({
    overlay: r,
    animate(o) {
      const { outbound: t, inbound: c } = o.context, a = t.page.dom, s = c.page.dom, i = t.page.resolver, u = o.directionType, m = u === l.FORWARD || u === l.INITIAL, f = m ? "100%" : "-100%", d = m ? "-100%" : "100%";
      let g = !1;
      const h = () => {
        g || (g = !0, i());
      };
      s.style.transform = `translateX(${f})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        a.style.transition = `transform ${n}ms ease`, a.style.transform = `translateX(${d})`, s.style.transition = `transform ${n}ms ease`, s.style.transform = "translateX(0)", s.addEventListener("transitionend", function v(E) {
          E.propertyName === "transform" && (s.removeEventListener("transitionend", v), s.style.transition = "", s.style.transform = "", h());
        }), setTimeout(h, n + 100);
      }));
    }
  });
}
function J(e = {}) {
  const n = e.tabRoots ?? [], r = e.duration ?? 300, o = e.fadeDuration ?? 180, t = e.overlay;
  function c(a) {
    var u, m, f, d;
    const s = (m = (u = a.rcState) == null ? void 0 : u.onmatchParams) == null ? void 0 : m.route, i = (d = (f = a.prevRcState) == null ? void 0 : f.onmatchParams) == null ? void 0 : d.route;
    return n.includes(s) && n.includes(i);
  }
  return x({
    overlay: t,
    animate(a) {
      const { outbound: s, inbound: i } = a.context, u = s.page.dom, m = i.page.dom, f = s.page.resolver, d = a.directionType;
      let g = !1;
      const h = () => {
        g || (g = !0, f());
      };
      if (c(a))
        u.style.transition = `opacity ${o}ms ease`, u.style.opacity = "0", u.addEventListener("transitionend", function v(E) {
          E.propertyName === "opacity" && (u.removeEventListener("transitionend", v), h());
        }), setTimeout(h, o + 100);
      else {
        const v = d === l.FORWARD || d === l.INITIAL, E = v ? "100%" : "-100%", I = v ? "-100%" : "100%";
        m.style.transform = `translateX(${E})`, requestAnimationFrame(() => requestAnimationFrame(() => {
          u.style.transition = `transform ${r}ms ease`, u.style.transform = `translateX(${I})`, m.style.transition = `transform ${r}ms ease`, m.style.transform = "translateX(0)", m.addEventListener("transitionend", function A(T) {
            T.propertyName === "transform" && (m.removeEventListener("transitionend", A), m.style.transition = "", m.style.transform = "", h());
          }), setTimeout(h, r + 100);
        }));
      }
    }
  });
}
function K() {
  return x({
    animate(e) {
      const { outbound: n, inbound: r } = e.context, o = n.page.dom, t = r.page.dom, c = n.page.resolver, a = e.directionType;
      o.setAttribute("data-nav-anim", "out"), o.setAttribute("data-direction", a), t.setAttribute("data-nav-anim", "in"), t.setAttribute("data-direction", a), o.addEventListener("animationend", function s() {
        o.removeEventListener("animationend", s), c();
      }), setTimeout(c, 600);
    }
  });
}
export {
  l as DirectionTypes,
  W as RouteChangeState,
  K as createCssNavLayout,
  B as createFadeLayout,
  J as createMobileLayout,
  x as createNavLayout,
  q as createSlideLayout,
  H as default
};
