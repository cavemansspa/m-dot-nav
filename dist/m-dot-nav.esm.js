import m from "mithril";
/*! m-dot-nav v2.0.4 | MIT */
function k(e, o, n = () => {
}) {
  let t = o, r = {};
  function s(i, c) {
    t = i, r = { ...r, ...c }, n(t, r);
    const a = e[t];
    a != null && a.invoke && a.invoke(r).then(() => s(a.onDone ?? t, {})).catch(() => s(a.onError ?? t, {}));
  }
  return {
    get current() {
      return t;
    },
    get context() {
      return r;
    },
    send(i, c = {}) {
      var p, y;
      const a = (y = (p = e[t]) == null ? void 0 : p.on) == null ? void 0 : y[i];
      a && s(a, c);
    }
  };
}
const d = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW"
};
m.cls = (e, o = " ") => {
  let n;
  for (const t in e)
    e[t] && (n = n == null ? t : n + o + t);
  return n || "";
};
function F() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function T(e) {
  return e == null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(T).join(",") + "]" : "{" + Object.keys(e).sort().map((n) => JSON.stringify(n) + ":" + T(e[n])).join(",") + "}";
}
function b(e, o = "") {
  return Object.keys(e).reduce((n, t) => {
    const r = e[t];
    return typeof r == "function" || r.view || r.onmatch || r.render ? { ...n, [o + t]: r } : { ...n, ...b(r, o + t) };
  }, {});
}
function M(e) {
  const { route: o, params: n, args: t } = e;
  return T({ route: o, params: n, args: t });
}
function D(e, o) {
  if (typeof (e == null ? void 0 : e.getIdentity) == "function") {
    const n = e.getIdentity(o);
    return typeof n == "string" ? n : T(n);
  }
  return M(o);
}
function _(e, o) {
  return b(e)[o];
}
function C(e, o) {
  const n = JSON.parse(JSON.stringify(e)), t = F();
  return Object.freeze({
    get onmatchParams() {
      return n;
    },
    get identity() {
      return o;
    },
    key() {
      return t;
    }
  });
}
function W() {
  let e = [], o = -1;
  return {
    get current() {
      return e[o] ?? null;
    },
    get length() {
      return e.length;
    },
    get index() {
      return o;
    },
    findExisting(n) {
      const t = e.findIndex((r) => r.identity === n);
      return t >= 0 ? { entry: e[t], index: t } : null;
    },
    push(n) {
      e = e.slice(0, o + 1), e.push(n), o = e.length - 1;
    },
    moveTo(n) {
      o = n;
    },
    replaceCurrent(n) {
      e[o] = n;
    }
  };
}
function U(e, o, n) {
  const t = C(o, n);
  if (e.length === 0)
    return e.push(t), { directionType: d.INITIAL, rcState: t };
  const r = e.findExisting(n);
  if (r) {
    const i = r.index - e.index, c = e.current;
    return e.moveTo(r.index), i === 0 ? { directionType: d.SAME_ROUTE, rcState: r.entry } : i === -1 ? { directionType: d.BACK, rcState: r.entry, prevRcState: c } : i === 1 ? { directionType: d.FORWARD, rcState: r.entry, prevRcState: c } : { directionType: d.EXISTING_ROUTE, rcState: r.entry, prevRcState: c, delta: i };
  }
  const s = e.current;
  return e.push(t), { directionType: d.FORWARD, rcState: t, prevRcState: s };
}
function P(e) {
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
function j(e) {
  const o = b(e.routes);
  return e.resolvers = Object.keys(o).reduce((n, t) => {
    const r = o[t], s = e.router, i = {
      onmatch(c, a, p) {
        s.current === "matching" && e.history.moveTo(e.history.index - 1);
        const u = e.history.current;
        let l;
        const { path: v, params: S } = m.parsePathname(a), g = { args: c, params: S, path: v, requestedPath: a, route: p }, I = D(r, g);
        let E = U(e.history, g, I);
        E.context = {};
        const O = { onmatchParams: g }, R = u && e.resolvers[u.onmatchParams.route];
        R != null && R.onbeforeroutechange && R.onbeforeroutechange({ inbound: O, outbound: u, requestedPath: a });
        const { directionType: h } = E, L = {
          directionType: h,
          isForward: h === d.FORWARD || h === d.INITIAL,
          isBack: h === d.BACK || h === d.EXISTING_ROUTE,
          isSameRoute: h === d.SAME_ROUTE
        };
        if (r.onmatch && (l = r.onmatch(c, a, p, L)), l || (l = r), e.replacingState) {
          e.replacingState = !1;
          const A = e.history;
          A.moveTo(A.index - 1), A.push(C(g, I));
        }
        e.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: E, inbound: O, outbound: u }
        }));
        const w = e.pendingAnim;
        return e.pendingAnim = void 0, s.send("ONMATCH", {
          transitionState: E,
          resolvedComponent: l,
          anim: w
        }), l;
      },
      render(c) {
        const { layoutComponent: a } = e, { transitionState: p, anim: y } = s.context, u = s.current === "idle" ? { ...p, directionType: d.REDRAW } : p;
        if (y && (u.anim = y), s.send("RENDER"), c.attrs.transitionState = u, !r.render)
          return m(
            a,
            { transitionState: u },
            m(s.context.resolvedComponent ?? r, c.attrs)
          );
        const l = r.render(c);
        return l.tag === a ? (l.attrs.transitionState = u, l) : l.items ? m(a, {
          cls: l.cls,
          layout: l.layout,
          items: l.items,
          transitionState: u
        }) : m(a, { transitionState: u }, l);
      }
    };
    return r.onbeforeroutechange && (i.onbeforeroutechange = r.onbeforeroutechange), n[t] = i, n;
  }, {}), e.resolvers;
}
const f = {
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
}, N = m.route.set;
m.route.set = (e, o, n) => m.nav.setRoute(e, o, n);
m.nav = function(o, n, t, r) {
  if (!t) throw new Error("m.nav() — routes is required.");
  if (!(r != null && r.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  f.routes = t, f.layoutComponent = r.layoutComponent, f.router = P(), j(f), m.route(o ?? document.body, n, f.resolvers);
};
Object.assign(m.nav, {
  setRoute(e, o, n = {}, t) {
    const r = m.buildPathname(e, o), { path: s, params: i } = m.parsePathname(r), c = {
      args: i ?? {},
      params: i ?? {},
      path: s,
      requestedPath: r,
      route: e
    }, a = _(f.routes, e), p = D(a, c), y = f.history.findExisting(p);
    if (f.pendingAnim = t, y && y.index === f.history.index) {
      N(e, o, { ...n, replace: !0 });
      return;
    }
    if (y) {
      const u = y.index - f.history.index;
      if (u < 0) {
        window.history.go(u);
        return;
      }
    }
    n.replace === !0 && (f.replacingState = !0), N(e, o, n);
  },
  addEventListener: f.events.addEventListener.bind(f.events),
  removeEventListener: f.events.removeEventListener.bind(f.events),
  debug() {
    var e;
    return { ...f, routerState: (e = f.router) == null ? void 0 : e.current };
  }
});
const B = m.nav;
function x(e = {}) {
  const { animate: o } = e;
  return function() {
    let t = {
      inbound: {},
      outbound: {}
    };
    function r() {
      return {
        view({ attrs: s, children: i }) {
          return m("div", {
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
        const { transitionState: c } = s, a = c == null ? void 0 : c.directionType;
        return a !== d.REDRAW && a !== d.SAME_ROUTE && (this._key = c.rcState.key()), m("div", {
          style: "display:grid; overflow:hidden; height:100%; width:100%;"
        }, [m(r, { key: this._key }, i)]);
      },
      oncreate({ attrs: s }) {
        s.transitionState.context = t;
      },
      onupdate({ attrs: s }) {
        const { transitionState: i } = s, c = i == null ? void 0 : i.directionType;
        c === d.REDRAW || c === d.SAME_ROUTE || (i.context = t, Promise.resolve().then(() => {
          var u;
          const { outbound: a, inbound: p } = t;
          if (!((u = a.page) != null && u.dom)) return;
          const y = i.anim ?? o;
          y ? y(i) : a.page.resolver(), t.outbound = {}, t.inbound = {};
        }));
      }
    };
  };
}
function G(e = {}) {
  const o = e.duration ?? 200;
  return x({
    animate(n) {
      const { outbound: t } = n.context, r = t.page.dom, s = t.page.resolver;
      r.style.transition = `opacity ${o}ms ease`, r.style.opacity = "0", r.addEventListener("transitionend", function i(c) {
        c.propertyName === "opacity" && (r.removeEventListener("transitionend", i), s());
      }), setTimeout(s, o + 100);
    }
  });
}
function $(e = {}) {
  const o = e.duration ?? 300;
  return x({
    animate(n) {
      const { outbound: t, inbound: r } = n.context, s = t.page.dom, i = r.page.dom, c = t.page.resolver, a = n.directionType, p = a === d.FORWARD || a === d.INITIAL, y = p ? "100%" : "-100%", u = p ? "-100%" : "100%";
      let l = !1;
      const v = () => {
        l || (l = !0, c());
      };
      i.style.transform = `translateX(${y})`, requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.transition = `transform ${o}ms ease`, s.style.transform = `translateX(${u})`, i.style.transition = `transform ${o}ms ease`, i.style.transform = "translateX(0)", i.addEventListener("transitionend", function S(g) {
          g.propertyName === "transform" && (i.removeEventListener("transitionend", S), i.style.transition = "", i.style.transform = "", v());
        }), setTimeout(v, o + 100);
      }));
    }
  });
}
function H() {
  return x({
    animate(e) {
      const { outbound: o } = e.context, n = o.page.dom, t = o.page.resolver;
      n.addEventListener("animationend", function r() {
        n.removeEventListener("animationend", r), t();
      }), setTimeout(t, 600);
    }
  });
}
export {
  d as DirectionTypes,
  C as RouteChangeState,
  H as createCssNavLayout,
  G as createFadeLayout,
  x as createNavLayout,
  $ as createSlideLayout,
  B as default
};
