import l from "mithril";
/*! m-dot-nav v2.0.5 | MIT */
function M(e, r, o = () => {
}) {
  let t = r, n = {};
  function s(i, a) {
    t = i, n = { ...n, ...a }, o(t, n);
    const c = e[t];
    c != null && c.invoke && c.invoke(n).then(() => s(c.onDone ?? t, {})).catch(() => s(c.onError ?? t, {}));
  }
  return {
    get current() {
      return t;
    },
    get context() {
      return n;
    },
    send(i, a = {}) {
      var p, y;
      const c = (y = (p = e[t]) == null ? void 0 : p.on) == null ? void 0 : y[i];
      c && s(c, a);
    }
  };
}
const u = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  SAME_ROUTE_CHANGE: "SAME_ROUTE_CHANGE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW"
};
l.cls = (e, r = " ") => {
  let o;
  for (const t in e)
    e[t] && (o = o == null ? t : o + r + t);
  return o || "";
};
function w() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function A(e) {
  return e == null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(A).join(",") + "]" : "{" + Object.keys(e).sort().map((o) => JSON.stringify(o) + ":" + A(e[o])).join(",") + "}";
}
function C(e, r) {
  if (e === r) return !0;
  if (e == null || r == null || typeof e != typeof r || typeof e != "object") return !1;
  const o = Object.keys(e), t = Object.keys(r);
  return o.length !== t.length ? !1 : o.every((n) => C(e[n], r[n]));
}
function b(e, r = "") {
  return Object.keys(e).reduce((o, t) => {
    const n = e[t];
    return typeof n == "function" || n.view || n.onmatch || n.render ? { ...o, [r + t]: n } : { ...o, ...b(n, r + t) };
  }, {});
}
function F(e) {
  const { route: r, params: o, args: t } = e;
  return A({ route: r, params: o, args: t });
}
function _(e, r) {
  if (typeof (e == null ? void 0 : e.getIdentity) == "function") {
    const o = e.getIdentity(r);
    return typeof o == "string" ? o : A(o);
  }
  return F(r);
}
function U(e, r) {
  return b(e)[r];
}
function D(e, r) {
  const o = JSON.parse(JSON.stringify(e)), t = w();
  return Object.freeze({
    get onmatchParams() {
      return o;
    },
    get identity() {
      return r;
    },
    key() {
      return t;
    }
  });
}
function j() {
  let e = [], r = -1;
  return {
    get current() {
      return e[r] ?? null;
    },
    get length() {
      return e.length;
    },
    get index() {
      return r;
    },
    findExisting(o) {
      const t = e.findIndex((n) => n.identity === o);
      return t >= 0 ? { entry: e[t], index: t } : null;
    },
    push(o) {
      e = e.slice(0, r + 1), e.push(o), r = e.length - 1;
    },
    moveTo(o) {
      r = o;
    },
    replaceCurrent(o) {
      e[r] = o;
    }
  };
}
function W(e, r, o) {
  const t = D(r, o);
  if (e.length === 0)
    return e.push(t), { directionType: u.INITIAL, rcState: t };
  const n = e.findExisting(o);
  if (n) {
    const i = n.index - e.index, a = e.current;
    return e.moveTo(n.index), i === 0 ? {
      directionType: !C(n.entry.onmatchParams, r) ? u.SAME_ROUTE_CHANGE : u.SAME_ROUTE,
      rcState: n.entry
    } : i === -1 ? { directionType: u.BACK, rcState: n.entry, prevRcState: a } : i === 1 ? { directionType: u.FORWARD, rcState: n.entry, prevRcState: a } : { directionType: u.EXISTING_ROUTE, rcState: n.entry, prevRcState: a, delta: i };
  }
  const s = e.current;
  return e.push(t), { directionType: u.FORWARD, rcState: t, prevRcState: s };
}
function G(e) {
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
function H(e) {
  const r = b(e.routes);
  return e.resolvers = Object.keys(r).reduce((o, t) => {
    const n = r[t], s = e.router, i = {
      onmatch(a, c, p) {
        s.current === "matching" && e.history.moveTo(e.history.index - 1);
        const d = e.history.current;
        let m;
        const { path: h, params: T } = l.parsePathname(c), E = { args: a, params: T, path: h, requestedPath: c, route: p }, x = _(n, E);
        let v = W(e.history, E, x);
        v.context = {};
        const I = { onmatchParams: E }, R = d && e.resolvers[d.onmatchParams.route];
        R != null && R.onbeforeroutechange && R.onbeforeroutechange({ inbound: I, outbound: d, requestedPath: c });
        const { directionType: g } = v, k = {
          directionType: g,
          isForward: g === u.FORWARD || g === u.INITIAL,
          isBack: g === u.BACK || g === u.EXISTING_ROUTE,
          isSameRoute: g === u.SAME_ROUTE,
          isSameRouteChange: g === u.SAME_ROUTE_CHANGE
        };
        if (n.onmatch && (m = n.onmatch(a, c, p, k)), m || (m = n), e.replacingState) {
          e.replacingState = !1;
          const S = e.history;
          S.moveTo(S.index - 1), S.push(D(E, x));
        }
        e.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: v, inbound: I, outbound: d }
        }));
        const L = e.pendingAnim;
        return e.pendingAnim = void 0, s.send("ONMATCH", {
          transitionState: v,
          resolvedComponent: m,
          anim: L
        }), m;
      },
      render(a) {
        const { layoutComponent: c } = e, { transitionState: p, anim: y } = s.context, d = s.current === "idle" ? { ...p, directionType: u.REDRAW } : p;
        if (y && (d.anim = y), s.send("RENDER"), a.attrs.transitionState = d, !n.render)
          return l(
            c,
            { transitionState: d },
            l(s.context.resolvedComponent ?? n, a.attrs)
          );
        const m = n.render(a);
        return m.tag === c ? (m.attrs.transitionState = d, m) : m.items ? l(c, {
          cls: m.cls,
          layout: m.layout,
          items: m.items,
          transitionState: d
        }) : l(c, { transitionState: d }, m);
      }
    };
    return n.onbeforeroutechange && (i.onbeforeroutechange = n.onbeforeroutechange), o[t] = i, o;
  }, {}), e.resolvers;
}
const f = {
  routes: void 0,
  layoutComponent: void 0,
  resolvers: void 0,
  history: j(),
  router: null,
  // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: void 0,
  replacingState: !1
  // setRoute→onmatch handoff flag
}, N = l.route.set;
l.route.set = (e, r, o) => l.nav.setRoute(e, r, o);
l.nav = function(r, o, t, n) {
  if (!t) throw new Error("m.nav() — routes is required.");
  if (!(n != null && n.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  f.routes = t, f.layoutComponent = n.layoutComponent, f.router = G(), H(f), l.route(r ?? document.body, o, f.resolvers);
};
Object.assign(l.nav, {
  setRoute(e, r, o = {}, t) {
    const n = l.buildPathname(e, r), { path: s, params: i } = l.parsePathname(n), a = {
      args: i ?? {},
      params: i ?? {},
      path: s,
      requestedPath: n,
      route: e
    }, c = U(f.routes, e), p = _(c, a), y = f.history.findExisting(p);
    if (f.pendingAnim = t, y && y.index === f.history.index) {
      N(e, r, { ...o, replace: !0 });
      return;
    }
    if (y) {
      const d = y.index - f.history.index;
      if (d < 0) {
        window.history.go(d);
        return;
      }
    }
    o.replace === !0 && (f.replacingState = !0), N(e, r, o);
  },
  addEventListener: f.events.addEventListener.bind(f.events),
  removeEventListener: f.events.removeEventListener.bind(f.events),
  debug() {
    var e;
    return { ...f, routerState: (e = f.router) == null ? void 0 : e.current };
  }
});
const X = l.nav;
function O(e = {}) {
  const { animate: r } = e;
  return function() {
    let t = {
      inbound: {},
      outbound: {}
    };
    function n() {
      return {
        view({ attrs: s, children: i }) {
          return l("div", {
            "data-page-key": s.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, i);
        },
        oncreate({ dom: s }) {
          t.inbound.page = { dom: s };
        },
        onbeforeremove({ dom: s }) {
          return new Promise((i) => {
            t.outbound.page = { dom: s, resolver: i };
          });
        }
      };
    }
    return {
      view({ attrs: s, children: i }) {
        const { transitionState: a } = s, c = a == null ? void 0 : a.directionType;
        return c !== u.REDRAW && c !== u.SAME_ROUTE && (this._key = a.rcState.key()), l("div", {
          style: "display:grid; overflow:hidden; height:100%; width:100%;"
        }, [l(n, { key: this._key }, i)]);
      },
      oncreate({ attrs: s }) {
        s.transitionState.context = t;
      },
      onupdate({ attrs: s }) {
        const { transitionState: i } = s, a = i == null ? void 0 : i.directionType;
        a === u.REDRAW || a === u.SAME_ROUTE || a === u.SAME_ROUTE_CHANGE || (i.context = t, Promise.resolve().then(() => {
          var d;
          const { outbound: c, inbound: p } = t;
          if (!((d = c.page) != null && d.dom)) return;
          const y = i.anim ?? r;
          y ? y(i) : c.page.resolver(), t.outbound = {}, t.inbound = {};
        }));
      }
    };
  };
}
function B(e = {}) {
  const r = e.duration ?? 200;
  return O({
    animate(o) {
      const { outbound: t } = o.context, n = t.page.dom, s = t.page.resolver;
      n.style.transition = `opacity ${r}ms ease`, n.style.opacity = "0", n.addEventListener("transitionend", function i(a) {
        a.propertyName === "opacity" && (n.removeEventListener("transitionend", i), s());
      }), setTimeout(s, r + 100);
    }
  });
}
function $(e = {}) {
  const r = e.duration ?? 300;
  return O({
    animate(o) {
      const { outbound: t, inbound: n } = o.context, s = t.page.dom, i = n.page.dom, a = t.page.resolver, c = o.directionType, p = c === u.FORWARD || c === u.INITIAL, y = p ? "100%" : "-100%", d = p ? "-100%" : "100%";
      let m = !1;
      const h = () => {
        m || (m = !0, a());
      };
      i.style.transform = `translateX(${y})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.transition = `transform ${r}ms ease`, s.style.transform = `translateX(${d})`, i.style.transition = `transform ${r}ms ease`, i.style.transform = "translateX(0)", i.addEventListener("transitionend", function T(E) {
          E.propertyName === "transform" && (i.removeEventListener("transitionend", T), i.style.transition = "", i.style.transform = "", h());
        }), setTimeout(h, r + 100);
      }));
    }
  });
}
function J() {
  return O({
    animate(e) {
      const { outbound: r, inbound: o } = e.context, t = r.page.dom, n = o.page.dom, s = r.page.resolver, i = e.directionType;
      t.setAttribute("data-nav-anim", "out"), t.setAttribute("data-direction", i), n.setAttribute("data-nav-anim", "in"), n.setAttribute("data-direction", i), t.addEventListener("animationend", function a() {
        t.removeEventListener("animationend", a), s();
      }), setTimeout(s, 600);
    }
  });
}
export {
  u as DirectionTypes,
  D as RouteChangeState,
  J as createCssNavLayout,
  B as createFadeLayout,
  O as createNavLayout,
  $ as createSlideLayout,
  X as default
};
