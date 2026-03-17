import d from "mithril";
/*! m-dot-nav v2.0.2 | MIT */
function L(t, o, r = () => {
}) {
  let e = o, n = {};
  function s(i, c) {
    e = i, n = { ...n, ...c }, r(e, n);
    const a = t[e];
    a != null && a.invoke && a.invoke(n).then(() => s(a.onDone ?? e, {})).catch(() => s(a.onError ?? e, {}));
  }
  return {
    get current() {
      return e;
    },
    get context() {
      return n;
    },
    send(i, c = {}) {
      var u, p;
      const a = (p = (u = t[e]) == null ? void 0 : u.on) == null ? void 0 : p[i];
      a && s(a, c);
    }
  };
}
const f = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW"
};
d.cls = (t, o = " ") => {
  let r;
  for (const e in t)
    t[e] && (r = r == null ? e : r + o + e);
  return r || "";
};
function w() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function E(t) {
  return t == null || typeof t != "object" ? JSON.stringify(t) : Array.isArray(t) ? "[" + t.map(E).join(",") + "]" : "{" + Object.keys(t).sort().map((r) => JSON.stringify(r) + ":" + E(t[r])).join(",") + "}";
}
function T(t, o = "") {
  return Object.keys(t).reduce((r, e) => {
    const n = t[e];
    return typeof n == "function" || n.view || n.onmatch || n.render ? { ...r, [o + e]: n } : { ...r, ...T(n, o + e) };
  }, {});
}
function k(t) {
  const { route: o, params: r, args: e } = t;
  return E({ route: o, params: r, args: e });
}
function I(t, o) {
  if (typeof (t == null ? void 0 : t.getIdentity) == "function") {
    const r = t.getIdentity(o);
    return typeof r == "string" ? r : E(r);
  }
  return k(o);
}
function M(t, o) {
  return T(t)[o];
}
function O(t, o) {
  const r = JSON.parse(JSON.stringify(t)), e = w();
  return Object.freeze({
    get onmatchParams() {
      return r;
    },
    get identity() {
      return o;
    },
    key() {
      return e;
    }
  });
}
function F() {
  let t = [], o = -1;
  return {
    get current() {
      return t[o] ?? null;
    },
    get length() {
      return t.length;
    },
    get index() {
      return o;
    },
    findExisting(r) {
      const e = t.findIndex((n) => n.identity === r);
      return e >= 0 ? { entry: t[e], index: e } : null;
    },
    push(r) {
      t = t.slice(0, o + 1), t.push(r), o = t.length - 1;
    },
    moveTo(r) {
      o = r;
    },
    replaceCurrent(r) {
      t[o] = r;
    }
  };
}
function _(t, o, r) {
  const e = O(o, r);
  if (t.length === 0)
    return t.push(e), { directionType: f.INITIAL, rcState: e };
  const n = t.findExisting(r);
  if (n) {
    const i = n.index - t.index, c = t.current;
    return t.moveTo(n.index), i === 0 ? { directionType: f.SAME_ROUTE, rcState: n.entry } : i === -1 ? { directionType: f.BACK, rcState: n.entry, prevRcState: c } : i === 1 ? { directionType: f.FORWARD, rcState: n.entry, prevRcState: c } : { directionType: f.EXISTING_ROUTE, rcState: n.entry, prevRcState: c, delta: i };
  }
  const s = t.current;
  return t.push(e), { directionType: f.FORWARD, rcState: e, prevRcState: s };
}
function W(t) {
  return L(
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
function P(t) {
  const o = T(t.routes);
  return t.resolvers = Object.keys(o).reduce((r, e) => {
    const n = o[e], s = t.router, i = {
      onmatch(c, a, u) {
        s.current === "matching" && t.history.moveTo(t.history.index - 1);
        const m = t.history.current, y = m && t.resolvers[m.onmatchParams.route];
        y != null && y.onbeforeroutechange && y.onbeforeroutechange({ outbound: m, requestedPath: a });
        let g;
        const { path: N, params: C } = d.parsePathname(a), R = { args: c, params: C, path: N, requestedPath: a, route: u }, x = I(n, R);
        let v = _(t.history, R, x);
        v.context = {};
        const { directionType: h } = v, D = {
          directionType: h,
          isForward: h === f.FORWARD || h === f.INITIAL,
          isBack: h === f.BACK || h === f.EXISTING_ROUTE,
          isSameRoute: h === f.SAME_ROUTE
        };
        if (n.onmatch && (g = n.onmatch(c, a, u, D)), g || (g = n), g || (g = n), v.context = {}, t.replacingState) {
          t.replacingState = !1;
          const S = t.history;
          S.moveTo(S.index - 1), S.push(O(R, x));
        }
        return t.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: v, outbound: m }
        })), s.send("ONMATCH", {
          transitionState: v,
          resolvedComponent: g,
          anim: t.pendingAnim
        }), g;
      },
      render(c) {
        const { layoutComponent: a } = t, { transitionState: u, anim: p } = s.context, m = s.current === "idle" ? { ...u, directionType: f.REDRAW } : u;
        if (p && (m.anim = p), s.send("RENDER"), t.pendingAnim = void 0, c.attrs.transitionState = m, !n.render)
          return d(
            a,
            { transitionState: m },
            d(s.context.resolvedComponent ?? n, c.attrs)
          );
        const y = n.render(c);
        return y.tag === a ? (y.attrs.transitionState = m, y) : y.items ? d(a, {
          cls: y.cls,
          layout: y.layout,
          items: y.items,
          transitionState: m
        }) : d(a, { transitionState: m }, y);
      }
    };
    return n.onbeforeroutechange && (i.onbeforeroutechange = n.onbeforeroutechange), r[e] = i, r;
  }, {}), t.resolvers;
}
const l = {
  routes: void 0,
  layoutComponent: void 0,
  resolvers: void 0,
  history: F(),
  router: null,
  // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: void 0,
  replacingState: !1
  // setRoute→onmatch handoff flag
}, b = d.route.set;
d.route.set = (t, o, r) => d.nav.setRoute(t, o, r);
d.nav = function(o, r, e, n) {
  if (!e) throw new Error("m.nav() — routes is required.");
  if (!(n != null && n.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  l.routes = e, l.layoutComponent = n.layoutComponent, l.router = W(), P(l), d.route(o ?? document.body, r, l.resolvers);
};
Object.assign(d.nav, {
  setRoute(t, o, r = {}, e) {
    const n = d.buildPathname(t, o), { path: s, params: i } = d.parsePathname(n), c = {
      args: i ?? {},
      params: i ?? {},
      path: s,
      requestedPath: n,
      route: t
    }, a = M(l.routes, t), u = I(a, c), p = l.history.findExisting(u);
    if (p && p.index === l.history.index) {
      b(t, o, { ...r, replace: !0 });
      return;
    }
    if (p) {
      const m = p.index - l.history.index;
      if (m < 0) {
        window.history.go(m);
        return;
      }
    }
    r.replace === !0 && (l.replacingState = !0), l.pendingAnim = e, b(t, o, r);
  },
  addEventListener: l.events.addEventListener.bind(l.events),
  removeEventListener: l.events.removeEventListener.bind(l.events),
  debug() {
    var t;
    return { ...l, routerState: (t = l.router) == null ? void 0 : t.current };
  }
});
const j = d.nav;
function A(t = {}) {
  const { animate: o } = t;
  return function() {
    let e = {
      inbound: {},
      outbound: {}
    };
    function n() {
      return {
        view({ attrs: s, children: i }) {
          return d("div", {
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
        var a, u;
        const c = ((u = (a = s.transitionState) == null ? void 0 : a.rcState) == null ? void 0 : u.key()) ?? "initial";
        return d("div", {
          style: "display:grid; overflow:hidden; height:100%; width:100%;"
        }, d(n, { key: c }, i));
      },
      oncreate({ attrs: s }) {
        s.transitionState.context = e;
      },
      onupdate({ attrs: s }) {
        const { transitionState: i } = s, c = i == null ? void 0 : i.directionType;
        c === f.REDRAW || c === f.SAME_ROUTE || (i.context = e, Promise.resolve().then(() => {
          var u;
          const { outbound: a } = e;
          (u = a.page) != null && u.dom && (o ? o(i) : a.page.resolver(), e.outbound = {}, e.inbound = {});
        }));
      }
    };
  };
}
function X(t = {}) {
  const o = t.duration ?? 200;
  return A({
    animate(r) {
      const { outbound: e } = r.context, n = e.page.dom, s = e.page.resolver;
      n.style.transition = `opacity ${o}ms ease`, n.style.opacity = "0", n.addEventListener("transitionend", function i(c) {
        c.propertyName === "opacity" && (n.removeEventListener("transitionend", i), s());
      }), setTimeout(s, o + 100);
    }
  });
}
function B(t = {}) {
  const o = t.duration ?? 300;
  return A({
    animate(r) {
      const { outbound: e, inbound: n } = r.context, s = e.page.dom, i = n.page.dom, c = e.page.resolver, a = r.directionType, u = a === f.FORWARD || a === f.INITIAL, p = u ? "100%" : "-100%", m = u ? "-100%" : "100%";
      i.style.transform = `translateX(${p})`, requestAnimationFrame(() => {
        s.style.transition = `transform ${o}ms ease`, s.style.transform = `translateX(${m})`, i.style.transition = `transform ${o}ms ease`, i.style.transform = "translateX(0)", i.addEventListener("transitionend", function y(g) {
          g.propertyName === "transform" && (i.removeEventListener("transitionend", y), i.style.transition = "", i.style.transform = "", c());
        }), setTimeout(c, o + 100);
      });
    }
  });
}
function G() {
  return A({
    animate(t) {
      const { outbound: o } = t.context, r = o.page.dom, e = o.page.resolver;
      r.addEventListener("animationend", function n() {
        r.removeEventListener("animationend", n), e();
      }), setTimeout(e, 600);
    }
  });
}
export {
  f as DirectionTypes,
  O as RouteChangeState,
  G as createCssNavLayout,
  X as createFadeLayout,
  A as createNavLayout,
  B as createSlideLayout,
  j as default
};
