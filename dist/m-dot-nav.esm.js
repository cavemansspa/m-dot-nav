import y from "mithril";
/*! m-dot-nav v2.0.11 | MIT */
function k(t, n, o = () => {
}) {
  let e = n, r = {};
  function s(i, c) {
    e = i, r = { ...r, ...c }, o(e, r);
    const a = t[e];
    a != null && a.invoke && a.invoke(r).then(() => s(a.onDone ?? e, {})).catch(() => s(a.onError ?? e, {}));
  }
  return {
    get current() {
      return e;
    },
    get context() {
      return r;
    },
    send(i, c = {}) {
      var u, l;
      const a = (l = (u = t[e]) == null ? void 0 : u.on) == null ? void 0 : l[i];
      a && s(a, c);
    }
  };
}
const m = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  SAME_ROUTE_CHANGE: "SAME_ROUTE_CHANGE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW"
};
y.cls = (t, n = " ") => {
  let o;
  for (const e in t)
    t[e] && (o = o == null ? e : o + n + e);
  return o || "";
};
function w() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function b(t) {
  return t == null || typeof t != "object" ? JSON.stringify(t) : Array.isArray(t) ? "[" + t.map(b).join(",") + "]" : "{" + Object.keys(t).sort().map((o) => JSON.stringify(o) + ":" + b(t[o])).join(",") + "}";
}
function C(t, n) {
  if (t === n) return !0;
  if (t == null || n == null || typeof t != typeof n || typeof t != "object") return !1;
  const o = Object.keys(t), e = Object.keys(n);
  return o.length !== e.length ? !1 : o.every((r) => C(t[r], n[r]));
}
function I(t, n = "") {
  return Object.keys(t).reduce((o, e) => {
    const r = t[e];
    return typeof r == "function" || r.view || r.onmatch || r.render ? { ...o, [n + e]: r } : { ...o, ...I(r, n + e) };
  }, {});
}
function F(t) {
  const { route: n, params: o, args: e } = t;
  return b({ route: n, params: o, args: e });
}
function D(t, n) {
  if (typeof (t == null ? void 0 : t.getIdentity) == "function") {
    const o = t.getIdentity(n);
    return typeof o == "string" ? o : b(o);
  }
  return F(n);
}
function U(t, n) {
  return I(t)[n];
}
function L(t, n) {
  const o = JSON.parse(JSON.stringify(t)), e = w();
  return Object.freeze({
    get onmatchParams() {
      return o;
    },
    get identity() {
      return n;
    },
    key() {
      return e;
    }
  });
}
function W() {
  let t = [], n = -1;
  return {
    get current() {
      return t[n] ?? null;
    },
    get length() {
      return t.length;
    },
    get index() {
      return n;
    },
    findExisting(o) {
      const e = t.findIndex((r) => r.identity === o);
      return e >= 0 ? { entry: t[e], index: e } : null;
    },
    push(o) {
      t = t.slice(0, n + 1), t.push(o), n = t.length - 1;
    },
    moveTo(o) {
      n = o;
    },
    replaceCurrent(o) {
      t[n] = o;
    }
  };
}
function j(t, n, o) {
  const e = L(n, o);
  if (t.length === 0)
    return t.push(e), { directionType: m.INITIAL, rcState: e };
  const r = t.findExisting(o);
  if (r) {
    const i = r.index - t.index, c = t.current;
    return t.moveTo(r.index), i === 0 ? {
      directionType: !C(r.entry.onmatchParams, n) ? m.SAME_ROUTE_CHANGE : m.SAME_ROUTE,
      rcState: r.entry
    } : i === -1 ? { directionType: m.BACK, rcState: r.entry, prevRcState: c } : i === 1 ? { directionType: m.FORWARD, rcState: r.entry, prevRcState: c } : { directionType: m.EXISTING_ROUTE, rcState: r.entry, prevRcState: c, delta: i };
  }
  const s = t.current;
  return t.push(e), { directionType: m.FORWARD, rcState: e, prevRcState: s };
}
function P(t) {
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
function G(t) {
  const n = I(t.routes);
  return t.resolvers = Object.keys(n).reduce((o, e) => {
    const r = n[e], s = t.router, i = {
      onmatch(c, a, u) {
        s.current === "matching" && t.history.moveTo(t.history.index - 1);
        const d = t.history.current;
        let f;
        const { path: E, params: v } = y.parsePathname(a), g = { args: c, params: v, path: E, requestedPath: a, route: u }, A = D(r, g);
        let R = j(t.history, g, A);
        R.context = {};
        const T = { onmatchParams: g }, S = d && t.resolvers[d.onmatchParams.route];
        S != null && S.onbeforeroutechange && S.onbeforeroutechange({ inbound: T, outbound: d, requestedPath: a });
        const { directionType: h } = R, _ = {
          directionType: h,
          isForward: h === m.FORWARD || h === m.INITIAL,
          isBack: h === m.BACK || h === m.EXISTING_ROUTE,
          isSameRoute: h === m.SAME_ROUTE,
          isSameRouteChange: h === m.SAME_ROUTE_CHANGE
        };
        if (r.onmatch && (f = r.onmatch(c, a, u, _)), f || (f = r), t.replacingState) {
          t.replacingState = !1;
          const x = t.history;
          x.moveTo(x.index - 1), x.push(L(g, A));
        }
        t.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: R, inbound: T, outbound: d }
        }));
        const M = t.pendingAnim;
        return t.pendingAnim = void 0, s.send("ONMATCH", {
          transitionState: R,
          resolvedComponent: f,
          anim: M
        }), f;
      },
      render(c) {
        const { layoutComponent: a } = t, { transitionState: u, anim: l } = s.context, d = s.current === "idle" ? { ...u, directionType: m.REDRAW } : u;
        if (l && (d.anim = l), s.send("RENDER"), c.attrs.transitionState = d, !r.render)
          return y(
            a,
            { transitionState: d },
            y(s.context.resolvedComponent ?? r, c.attrs)
          );
        const f = r.render(c);
        return f.tag === a ? (f.attrs.transitionState = d, f) : f.items ? y(a, {
          cls: f.cls,
          layout: f.layout,
          items: f.items,
          transitionState: d
        }) : y(a, { transitionState: d }, f);
      }
    };
    return r.onbeforeroutechange && (i.onbeforeroutechange = r.onbeforeroutechange), o[e] = i, o;
  }, {}), t.resolvers;
}
const p = {
  routes: void 0,
  layoutComponent: void 0,
  resolvers: void 0,
  history: W(),
  router: null,
  // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: void 0,
  replacingState: !1
  // setRoute→onmatch handoff flag
}, N = y.route.set;
y.route.set = (t, n, o) => y.nav.setRoute(t, n, o);
y.nav = function(n, o, e, r) {
  if (!e) throw new Error("m.nav() — routes is required.");
  if (!(r != null && r.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  p.routes = e, p.layoutComponent = r.layoutComponent, p.router = P(), G(p), y.route(n ?? document.body, o, p.resolvers);
};
Object.assign(y.nav, {
  setRoute(t, n, o = {}, e) {
    const r = y.buildPathname(t, n), { path: s, params: i } = y.parsePathname(r), c = {
      args: i ?? {},
      params: i ?? {},
      path: s,
      requestedPath: r,
      route: t
    }, a = U(p.routes, t), u = D(a, c), l = p.history.findExisting(u);
    if (p.pendingAnim = e, l && l.index === p.history.index) {
      N(t, n, { ...o, replace: !0 });
      return;
    }
    if (l) {
      const d = l.index - p.history.index;
      if (d < 0) {
        window.history.go(d);
        return;
      }
    }
    o.replace === !0 && (p.replacingState = !0), N(t, n, o);
  },
  addEventListener: p.events.addEventListener.bind(p.events),
  removeEventListener: p.events.removeEventListener.bind(p.events),
  debug() {
    var t;
    return { ...p, routerState: (t = p.router) == null ? void 0 : t.current };
  }
});
const $ = y.nav;
function O(t = {}) {
  const { animate: n } = t;
  return function() {
    let e = {
      inbound: {},
      outbound: {}
    };
    function r() {
      return {
        view({ attrs: s, children: i }) {
          return y("div", {
            "data-page-key": s.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, i);
        },
        oncreate({ dom: s }) {
          e.inbound.page = { dom: s };
        },
        onbeforeremove({ dom: s }) {
          return new Promise((i) => {
            e.outbound.page = { dom: s, resolver: i };
          });
        }
      };
    }
    return {
      view({ attrs: s, children: i }) {
        const { transitionState: c } = s, a = c == null ? void 0 : c.directionType;
        return a !== m.REDRAW && a !== m.SAME_ROUTE && (this._key = c.rcState.key()), y("div", {
          style: "display:grid; overflow:hidden; height:100%; width:100%;"
        }, [y(r, { key: this._key }, i)]);
      },
      oncreate({ attrs: s }) {
        s.transitionState.context = e;
      },
      onupdate({ attrs: s }) {
        const { transitionState: i } = s, c = i == null ? void 0 : i.directionType;
        c === m.REDRAW || c === m.SAME_ROUTE || c === m.SAME_ROUTE_CHANGE || (i.context = e, Promise.resolve().then(() => {
          var d;
          const { outbound: a, inbound: u } = e;
          if (!((d = a.page) != null && d.dom)) return;
          const l = i.anim ?? n;
          l ? l(i) : a.page.resolver(), e.outbound = {}, e.inbound = {};
        }));
      }
    };
  };
}
function H(t = {}) {
  const n = t.duration ?? 200;
  return O({
    animate(o) {
      const { outbound: e } = o.context, r = e.page.dom, s = e.page.resolver;
      r.style.transition = `opacity ${n}ms ease`, r.style.opacity = "0", r.addEventListener("transitionend", function i(c) {
        c.propertyName === "opacity" && (r.removeEventListener("transitionend", i), s());
      }), setTimeout(s, n + 100);
    }
  });
}
function B(t = {}) {
  const n = t.duration ?? 300;
  return O({
    animate(o) {
      const { outbound: e, inbound: r } = o.context, s = e.page.dom, i = r.page.dom, c = e.page.resolver, a = o.directionType, u = a === m.FORWARD || a === m.INITIAL, l = u ? "100%" : "-100%", d = u ? "-100%" : "100%";
      let f = !1;
      const E = () => {
        f || (f = !0, c());
      };
      i.style.transform = `translateX(${l})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.transition = `transform ${n}ms ease`, s.style.transform = `translateX(${d})`, i.style.transition = `transform ${n}ms ease`, i.style.transform = "translateX(0)", i.addEventListener("transitionend", function v(g) {
          g.propertyName === "transform" && (i.removeEventListener("transitionend", v), i.style.transition = "", i.style.transform = "", E());
        }), setTimeout(E, n + 100);
      }));
    }
  });
}
function q(t = {}) {
  const n = t.tabRoots ?? [], o = t.duration ?? 300, e = t.fadeDuration ?? 180;
  function r(s) {
    var a, u, l, d;
    const i = (u = (a = s.rcState) == null ? void 0 : a.onmatchParams) == null ? void 0 : u.route, c = (d = (l = s.prevRcState) == null ? void 0 : l.onmatchParams) == null ? void 0 : d.route;
    return n.includes(i) && n.includes(c);
  }
  return O({
    animate(s) {
      const { outbound: i, inbound: c } = s.context, a = i.page.dom, u = c.page.dom, l = i.page.resolver, d = s.directionType;
      let f = !1;
      const E = () => {
        f || (f = !0, l());
      };
      if (r(s))
        a.style.transition = `opacity ${e}ms ease`, a.style.opacity = "0", a.addEventListener("transitionend", function v(g) {
          g.propertyName === "opacity" && (a.removeEventListener("transitionend", v), E());
        }), setTimeout(E, e + 100);
      else {
        const v = d === m.FORWARD || d === m.INITIAL, g = v ? "100%" : "-100%", A = v ? "-100%" : "100%";
        u.style.transform = `translateX(${g})`, requestAnimationFrame(() => requestAnimationFrame(() => {
          a.style.transition = `transform ${o}ms ease`, a.style.transform = `translateX(${A})`, u.style.transition = `transform ${o}ms ease`, u.style.transform = "translateX(0)", u.addEventListener("transitionend", function R(T) {
            T.propertyName === "transform" && (u.removeEventListener("transitionend", R), u.style.transition = "", u.style.transform = "", E());
          }), setTimeout(E, o + 100);
        }));
      }
    }
  });
}
function J() {
  return O({
    animate(t) {
      const { outbound: n, inbound: o } = t.context, e = n.page.dom, r = o.page.dom, s = n.page.resolver, i = t.directionType;
      e.setAttribute("data-nav-anim", "out"), e.setAttribute("data-direction", i), r.setAttribute("data-nav-anim", "in"), r.setAttribute("data-direction", i), e.addEventListener("animationend", function c() {
        e.removeEventListener("animationend", c), s();
      }), setTimeout(s, 600);
    }
  });
}
export {
  m as DirectionTypes,
  L as RouteChangeState,
  J as createCssNavLayout,
  H as createFadeLayout,
  q as createMobileLayout,
  O as createNavLayout,
  B as createSlideLayout,
  $ as default
};
