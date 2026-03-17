import d from "mithril";
function D(t, o, r = () => {
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
      var u, y;
      const a = (y = (u = t[e]) == null ? void 0 : u.on) == null ? void 0 : y[i];
      a && s(a, c);
    }
  };
}
const p = {
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
function L() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}
function h(t) {
  return t == null || typeof t != "object" ? JSON.stringify(t) : Array.isArray(t) ? "[" + t.map(h).join(",") + "]" : "{" + Object.keys(t).sort().map((r) => JSON.stringify(r) + ":" + h(t[r])).join(",") + "}";
}
function S(t, o = "") {
  return Object.keys(t).reduce((r, e) => {
    const n = t[e];
    return typeof n == "function" || n.view || n.onmatch || n.render ? { ...r, [o + e]: n } : { ...r, ...S(n, o + e) };
  }, {});
}
function w(t) {
  const { route: o, params: r, args: e } = t;
  return h({ route: o, params: r, args: e });
}
function A(t, o) {
  if (typeof (t == null ? void 0 : t.getIdentity) == "function") {
    const r = t.getIdentity(o);
    return typeof r == "string" ? r : h(r);
  }
  return w(o);
}
function C(t, o) {
  return S(t)[o];
}
function I(t, o) {
  const r = JSON.parse(JSON.stringify(t)), e = L();
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
function k() {
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
function M(t, o, r) {
  const e = I(o, r);
  if (t.length === 0)
    return t.push(e), { directionType: p.INITIAL, rcState: e };
  const n = t.findExisting(r);
  if (n) {
    const i = n.index - t.index, c = t.current;
    return t.moveTo(n.index), i === 0 ? { directionType: p.SAME_ROUTE, rcState: n.entry } : i === -1 ? { directionType: p.BACK, rcState: n.entry, prevRcState: c } : i === 1 ? { directionType: p.FORWARD, rcState: n.entry, prevRcState: c } : { directionType: p.EXISTING_ROUTE, rcState: n.entry, prevRcState: c, delta: i };
  }
  const s = t.current;
  return t.push(e), { directionType: p.FORWARD, rcState: e, prevRcState: s };
}
function F(t) {
  return D(
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
function _(t) {
  const o = S(t.routes);
  return t.resolvers = Object.keys(o).reduce((r, e) => {
    const n = o[e], s = t.router, i = {
      onmatch(c, a, u) {
        s.current === "matching" && t.history.moveTo(t.history.index - 1);
        const m = t.history.current, f = m && t.resolvers[m.onmatchParams.route];
        f != null && f.onbeforeroutechange && f.onbeforeroutechange({ outbound: m, requestedPath: a });
        let g = n.onmatch ? n.onmatch(c, a, u) : n;
        g || (g = n);
        const { path: O, params: N } = d.parsePathname(a), v = { args: c, params: N, path: O, requestedPath: a, route: u }, b = A(n, v);
        let E = M(t.history, v, b);
        if (E.context = {}, t.replacingState) {
          t.replacingState = !1;
          const R = t.history;
          R.moveTo(R.index - 1), R.push(I(v, b));
        }
        return t.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: !0,
          detail: { transitionState: E, outbound: m }
        })), s.send("ONMATCH", {
          transitionState: E,
          resolvedComponent: g,
          anim: t.pendingAnim
        }), g;
      },
      render(c) {
        const { layoutComponent: a } = t, { transitionState: u, anim: y } = s.context, m = s.current === "idle" ? { ...u, directionType: p.REDRAW } : u;
        if (y && (m.anim = y), s.send("RENDER"), t.pendingAnim = void 0, c.attrs.transitionState = m, !n.render)
          return d(
            a,
            { transitionState: m },
            d(s.context.resolvedComponent ?? n, c.attrs)
          );
        const f = n.render(c);
        return f.tag === a ? (f.attrs.transitionState = m, f) : f.items ? d(a, {
          cls: f.cls,
          layout: f.layout,
          items: f.items,
          transitionState: m
        }) : d(a, { transitionState: m }, f);
      }
    };
    return n.onbeforeroutechange && (i.onbeforeroutechange = n.onbeforeroutechange), r[e] = i, r;
  }, {}), t.resolvers;
}
const l = {
  routes: void 0,
  layoutComponent: void 0,
  resolvers: void 0,
  history: k(),
  router: null,
  // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: void 0,
  replacingState: !1
  // setRoute→onmatch handoff flag
}, x = d.route.set;
d.route.set = (t, o, r) => d.nav.setRoute(t, o, r);
d.nav = function(o, r, e, n) {
  if (!e) throw new Error("m.nav() — routes is required.");
  if (!(n != null && n.layoutComponent)) throw new Error("m.nav() — layoutComponent is required.");
  l.routes = e, l.layoutComponent = n.layoutComponent, l.router = F(), _(l), d.route(o ?? document.body, r, l.resolvers);
};
Object.assign(d.nav, {
  setRoute(t, o, r = {}, e) {
    const n = d.buildPathname(t, o), { path: s, params: i } = d.parsePathname(n), c = {
      args: i ?? {},
      params: i ?? {},
      path: s,
      requestedPath: n,
      route: t
    }, a = C(l.routes, t), u = A(a, c), y = l.history.findExisting(u);
    if (y && y.index === l.history.index) {
      x(t, o, { ...r, replace: !0 });
      return;
    }
    if (y) {
      const m = y.index - l.history.index;
      if (m < 0) {
        window.history.go(m);
        return;
      }
    }
    r.replace === !0 && (l.replacingState = !0), l.pendingAnim = e, x(t, o, r);
  },
  addEventListener: l.events.addEventListener.bind(l.events),
  removeEventListener: l.events.removeEventListener.bind(l.events),
  debug() {
    var t;
    return { ...l, routerState: (t = l.router) == null ? void 0 : t.current };
  }
});
const W = d.nav;
function T(t = {}) {
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
        c === p.REDRAW || c === p.SAME_ROUTE || (i.context = e, Promise.resolve().then(() => {
          var u;
          const { outbound: a } = e;
          (u = a.page) != null && u.dom && (o ? o(i) : a.page.resolver(), e.outbound = {}, e.inbound = {});
        }));
      }
    };
  };
}
function j(t = {}) {
  const o = t.duration ?? 200;
  return T({
    animate(r) {
      const { outbound: e } = r.context, n = e.page.dom, s = e.page.resolver;
      n.style.transition = `opacity ${o}ms ease`, n.style.opacity = "0", n.addEventListener("transitionend", function i(c) {
        c.propertyName === "opacity" && (n.removeEventListener("transitionend", i), s());
      }), setTimeout(s, o + 100);
    }
  });
}
function U(t = {}) {
  const o = t.duration ?? 300;
  return T({
    animate(r) {
      const { outbound: e, inbound: n } = r.context, s = e.page.dom, i = n.page.dom, c = e.page.resolver, a = r.directionType, u = a === p.FORWARD || a === p.INITIAL, y = u ? "100%" : "-100%", m = u ? "-100%" : "100%";
      i.style.transform = `translateX(${y})`, requestAnimationFrame(() => {
        s.style.transition = `transform ${o}ms ease`, s.style.transform = `translateX(${m})`, i.style.transition = `transform ${o}ms ease`, i.style.transform = "translateX(0)", i.addEventListener("transitionend", function f(g) {
          g.propertyName === "transform" && (i.removeEventListener("transitionend", f), i.style.transition = "", i.style.transform = "", c());
        }), setTimeout(c, o + 100);
      });
    }
  });
}
function X() {
  return T({
    animate(t) {
      const { outbound: o } = t.context, r = o.page.dom, e = o.page.resolver;
      r.addEventListener("animationend", function n() {
        r.removeEventListener("animationend", n), e();
      }), setTimeout(e, 600);
    }
  });
}
export {
  p as DirectionTypes,
  I as RouteChangeState,
  X as createCssNavLayout,
  j as createFadeLayout,
  T as createNavLayout,
  U as createSlideLayout,
  W as default
};
