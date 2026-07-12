import p from "mithril";
/*! m-dot-nav v2.0.17 | MIT */
function k(e, t, r = () => {
}) {
  let i = t, n = {};
  function c(s, a) {
    i = s, n = { ...n, ...a }, r(i, n);
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
p.cls = (e, t = " ") => {
  let r;
  for (const i in e)
    e[i] && (r = r == null ? i : r + t + i);
  return r || "";
};
function F() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function b(e) {
  return e == null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(b).join(",") + "]" : "{" + Object.keys(e).sort().map((r) => JSON.stringify(r) + ":" + b(e[r])).join(",") + "}";
}
function C(e, t) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != typeof t || typeof e != "object") return !1;
  const r = Object.keys(e), i = Object.keys(t);
  return r.length !== i.length ? !1 : r.every((n) => C(e[n], t[n]));
}
function O(e, t = "") {
  return Object.keys(e).reduce((r, i) => {
    const n = e[i];
    return typeof n == "function" || n.view || n.onmatch || n.render ? { ...r, [t + i]: n } : { ...r, ...O(n, t + i) };
  }, {});
}
function w(e) {
  const { route: t, params: r, args: i } = e;
  return b({ route: t, params: r, args: i });
}
function D(e, t) {
  if (typeof (e == null ? void 0 : e.getIdentity) == "function") {
    const r = e.getIdentity(t);
    return typeof r == "string" ? r : b(r);
  }
  return w(t);
}
function M(e, t) {
  return O(e)[t];
}
function U(e, t) {
  const r = O(e), i = t.split("/").filter((n) => n !== "");
  for (const n of Object.keys(r)) {
    const c = n.split("/").filter((o) => o !== "");
    if (c.length !== i.length) continue;
    const s = {};
    let a = !0;
    for (let o = 0; o < c.length; o++)
      if (c[o].startsWith(":")) s[c[o].slice(1)] = decodeURIComponent(i[o]);
      else if (c[o] !== i[o]) {
        a = !1;
        break;
      }
    if (a) return { pattern: n, def: r[n], args: s };
  }
  return null;
}
function W(e, t) {
  const r = JSON.parse(JSON.stringify(e)), i = F();
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
function P() {
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
function j(e, t, r, i = !1, n = !1) {
  const c = W(t, r);
  if (e.length === 0)
    return e.push(c), { directionType: f.INITIAL, rcState: c };
  const s = e.findExisting(r);
  if (s) {
    const o = s.index - e.index, u = e.current;
    return e.moveTo(s.index), o === 0 ? {
      directionType: !C(s.entry.onmatchParams, t) ? f.SAME_ROUTE_CHANGE : f.SAME_ROUTE,
      rcState: s.entry
    } : o === -1 ? { directionType: f.BACK, rcState: s.entry, prevRcState: u } : o === 1 ? { directionType: f.FORWARD, rcState: s.entry, prevRcState: u } : { directionType: f.EXISTING_ROUTE, rcState: s.entry, prevRcState: u, delta: o };
  }
  const a = e.current;
  return i ? (n || e.index < 0 ? e.push(c) : e.replaceCurrent(c), { directionType: f.FORWARD, rcState: c, prevRcState: a }) : (e.push(c), { directionType: f.FORWARD, rcState: c, prevRcState: a });
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
  const t = O(e.routes);
  return e.resolvers = Object.keys(t).reduce((r, i) => {
    const n = t[i], c = e.router, s = {
      onmatch(a, o, u) {
        const l = c.current === "matching";
        l && e.history.moveTo(e.history.index - 1);
        const m = e.history.current;
        let d;
        const { path: g, params: h } = p.parsePathname(o), v = { args: a, params: h, path: g, requestedPath: o, route: u }, E = D(n, v), I = e.replacingState;
        e.replacingState = !1;
        let A = j(e.history, v, E, I, l);
        A.context = {};
        const T = { onmatchParams: v }, S = m && e.resolvers[m.onmatchParams.route];
        S != null && S.onbeforeroutechange && S.onbeforeroutechange({ inbound: T, outbound: m, requestedPath: o });
        const { directionType: R } = A, L = {
          directionType: R,
          isForward: R === f.FORWARD || R === f.INITIAL,
          isBack: R === f.BACK || R === f.EXISTING_ROUTE,
          isSameRoute: R === f.SAME_ROUTE,
          isSameRouteChange: R === f.SAME_ROUTE_CHANGE
        };
        n.onmatch && (d = n.onmatch(a, o, u, L)), d || (d = n), e.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: A, inbound: T, outbound: m }
        }));
        const _ = e.pendingAnim;
        return e.pendingAnim = void 0, c.send("ONMATCH", {
          transitionState: A,
          resolvedComponent: d,
          anim: _
        }), d;
      },
      render(a) {
        const { layoutComponent: o } = e, { transitionState: u, anim: l } = c.context, m = c.current === "idle" ? { ...u, directionType: f.REDRAW } : u;
        if (l && (m.anim = l), c.send("RENDER"), a.attrs.transitionState = m, !n.render)
          return p(
            o,
            { transitionState: m },
            p(c.context.resolvedComponent ?? n, a.attrs)
          );
        const d = n.render(a);
        return d.tag === o ? (d.attrs.transitionState = m, d) : d.items ? p(o, {
          cls: d.cls,
          layout: d.layout,
          items: d.items,
          transitionState: m
        }) : p(o, { transitionState: m }, d);
      }
    };
    return n.onbeforeroutechange && (s.onbeforeroutechange = n.onbeforeroutechange), r[i] = s, r;
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
p.route.set = (e, t, r) => p.nav.setRoute(e, t, r);
p.nav = function(t, r, i, n) {
  if (!i) throw new Error("m.nav() — routes is required.");
  if (!(n != null && n.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  y.routes = i, y.layoutComponent = n.layoutComponent, y.router = G(), X(y), p.route(t ?? document.body, r, y.resolvers);
};
Object.assign(p.nav, {
  setRoute(e, t, r = {}, i) {
    const n = p.buildPathname(e, t), { path: c, params: s } = p.parsePathname(n);
    let a = M(y.routes, e), o = e, u = t ?? s ?? {};
    if (!a) {
      const g = U(y.routes, c);
      g && (a = g.def, o = g.pattern, u = { ...g.args, ...s });
    }
    const m = D(a, {
      args: u,
      params: s ?? {},
      path: c,
      requestedPath: n,
      route: o
    }), d = y.history.findExisting(m);
    if (y.pendingAnim = i, d && d.index === y.history.index) {
      N(e, t, { ...r, replace: !0 });
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
    r.replace === !0 && (y.replacingState = !0), N(e, t, r);
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
  const { animate: t, overlay: r } = e;
  return function() {
    let n = {
      inbound: {},
      outbound: {}
    };
    function c() {
      return {
        view({ attrs: s, children: a }) {
          return p("div", {
            "data-page-key": s.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, a);
        },
        oncreate({ dom: s }) {
          n.inbound.page = { dom: s };
        },
        onbeforeremove({ dom: s }) {
          return new Promise((a) => {
            n.outbound.page = { dom: s, resolver: a };
          });
        }
      };
    }
    return {
      view({ attrs: s, children: a }) {
        const { transitionState: o } = s, u = o == null ? void 0 : o.directionType;
        return u !== f.REDRAW && u !== f.SAME_ROUTE && (this._key = o.rcState.key()), p(
          "div",
          {
            style: "display:grid; overflow:hidden; height:100%; width:100%;"
          },
          [
            p(c, { key: this._key }, a),
            r && r()
          ].filter(Boolean)
        );
      },
      oncreate({ attrs: s }) {
        s.transitionState.context = n;
      },
      onupdate({ attrs: s }) {
        const { transitionState: a } = s, o = a == null ? void 0 : a.directionType;
        o === f.REDRAW || o === f.SAME_ROUTE || o === f.SAME_ROUTE_CHANGE || (a.context = n, Promise.resolve().then(() => {
          var d;
          const { outbound: u, inbound: l } = n;
          if (!((d = u.page) != null && d.dom)) return;
          const m = a.anim ?? t;
          m ? m(a) : u.page.resolver(), n.outbound = {}, n.inbound = {};
        }));
      }
    };
  };
}
function B(e = {}) {
  const t = e.duration ?? 200, r = e.overlay;
  return x({
    overlay: r,
    animate(i) {
      const { outbound: n } = i.context, c = n.page.dom, s = n.page.resolver;
      c.style.transition = `opacity ${t}ms ease`, c.style.opacity = "0", c.addEventListener("transitionend", function a(o) {
        o.propertyName === "opacity" && (c.removeEventListener("transitionend", a), s());
      }), setTimeout(s, t + 100);
    }
  });
}
function q(e = {}) {
  const t = e.duration ?? 300, r = e.overlay;
  return x({
    overlay: r,
    animate(i) {
      const { outbound: n, inbound: c } = i.context, s = n.page.dom, a = c.page.dom, o = n.page.resolver, u = i.directionType, l = u === f.FORWARD || u === f.INITIAL, m = l ? "100%" : "-100%", d = l ? "-100%" : "100%";
      let g = !1;
      const h = () => {
        g || (g = !0, o());
      };
      a.style.transform = `translateX(${m})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.transition = `transform ${t}ms ease`, s.style.transform = `translateX(${d})`, a.style.transition = `transform ${t}ms ease`, a.style.transform = "translateX(0)", a.addEventListener("transitionend", function v(E) {
          E.propertyName === "transform" && (a.removeEventListener("transitionend", v), a.style.transition = "", a.style.transform = "", h());
        }), setTimeout(h, t + 100);
      }));
    }
  });
}
function J(e = {}) {
  const t = e.tabRoots ?? [], r = e.duration ?? 300, i = e.fadeDuration ?? 180, n = e.overlay;
  function c(s) {
    var u, l, m, d;
    const a = (l = (u = s.rcState) == null ? void 0 : u.onmatchParams) == null ? void 0 : l.route, o = (d = (m = s.prevRcState) == null ? void 0 : m.onmatchParams) == null ? void 0 : d.route;
    return t.includes(a) && t.includes(o);
  }
  return x({
    overlay: n,
    animate(s) {
      const { outbound: a, inbound: o } = s.context, u = a.page.dom, l = o.page.dom, m = a.page.resolver, d = s.directionType;
      let g = !1;
      const h = () => {
        g || (g = !0, m());
      };
      if (c(s))
        u.style.transition = `opacity ${i}ms ease`, u.style.opacity = "0", u.addEventListener("transitionend", function v(E) {
          E.propertyName === "opacity" && (u.removeEventListener("transitionend", v), h());
        }), setTimeout(h, i + 100);
      else {
        const v = d === f.FORWARD || d === f.INITIAL, E = v ? "100%" : "-100%", I = v ? "-100%" : "100%";
        l.style.transform = `translateX(${E})`, requestAnimationFrame(() => requestAnimationFrame(() => {
          u.style.transition = `transform ${r}ms ease`, u.style.transform = `translateX(${I})`, l.style.transition = `transform ${r}ms ease`, l.style.transform = "translateX(0)", l.addEventListener("transitionend", function A(T) {
            T.propertyName === "transform" && (l.removeEventListener("transitionend", A), l.style.transition = "", l.style.transform = "", h());
          }), setTimeout(h, r + 100);
        }));
      }
    }
  });
}
function K() {
  return x({
    animate(e) {
      const { outbound: t, inbound: r } = e.context, i = t.page.dom, n = r.page.dom, c = t.page.resolver, s = e.directionType;
      i.setAttribute("data-nav-anim", "out"), i.setAttribute("data-direction", s), n.setAttribute("data-nav-anim", "in"), n.setAttribute("data-direction", s), i.addEventListener("animationend", function a() {
        i.removeEventListener("animationend", a), c();
      }), setTimeout(c, 600);
    }
  });
}
export {
  f as DirectionTypes,
  W as RouteChangeState,
  K as createCssNavLayout,
  B as createFadeLayout,
  J as createMobileLayout,
  x as createNavLayout,
  q as createSlideLayout,
  H as default
};
