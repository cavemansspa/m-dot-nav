import m from "mithril";

// ─── Minimal Async State Machine ──────────────────────────────────────────────
//
// Shared primitive used by both the router coordination machine (sync)
// and the layout animation machine (async invoke).
//
// State definition shape:
//   {
//     stateName: {
//       on:      { EVENT: "targetState" },   // event-driven transitions
//       invoke:  (ctx) => Promise,           // async work for this state
//       onDone:  "targetState",              // advance when invoke resolves
//       onError: "targetState",              // advance when invoke rejects
//     }
//   }

function createMachine(states, initial, onChange = () => {}) {

  let current = initial;
  let context = {};

  function enter(next, ctx) {
    current = next;
    context = { ...context, ...ctx };
    onChange(current, context);

    const def = states[current];
    if (!def?.invoke) return;

    def.invoke(context)
      .then(() => enter(def.onDone  ?? current, {}))
      .catch(() => enter(def.onError ?? current, {}));
  }

  return {
    get current() { return current; },
    get context() { return context; },

    send(event, payload = {}) {
      const next = states[current]?.on?.[event];
      if (next) enter(next, payload);
    },
  };
}

// ─── Direction Types ──────────────────────────────────────────────────────────

export const DirectionTypes = {
  INITIAL:        "INITIAL",
  FORWARD:        "FORWARD",
  BACK:           "BACK",
  SAME_ROUTE:     "SAME_ROUTE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW:         "REDRAW",
};

// ─── Utilities ────────────────────────────────────────────────────────────────

m.cls = (def, separator = " ") => {
  let classes;
  for (const cls in def) {
    if (def[cls]) classes = classes == null ? cls : classes + separator + cls;
  }
  return classes || "";
};

function genKey() {
  return (Math.random() * Math.pow(10, 16)).toFixed(0);
}

function stableStringify(value) {
  if (value == null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",") + "}";
}

// Intentionally narrow: only compares plain JSON-serializable onmatchParams.
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null || typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => deepEqual(a[k], b[k]));
}

// credit @porsager
function flattenRoutes(routes, prefix = "") {
  return Object.keys(routes).reduce((acc, match) => {
    const route = routes[match];
    return typeof route === "function" || route.view || route.onmatch || route.render
      ? { ...acc, [prefix + match]: route }
      : { ...acc, ...flattenRoutes(route, prefix + match) };
  }, {});
}

// ─── Route Identity ───────────────────────────────────────────────────────────
//
// Identity answers: "is this the same logical destination?"
// Distinct from the full onmatchParams — allows apps to:
//   - treat param changes as SAME_ROUTE (e.g. filter/sort changes)
//   - treat different URL patterns as the same page
//
// A route may define:
//   getIdentity(onmatchParams) => string | object
//
// If omitted, identity defaults to route + params + args.

function defaultGetIdentity(onmatchParams) {
  const { route, params, args } = onmatchParams;
  return stableStringify({ route, params, args });
}

function getIdentityForRoute(userRoute, onmatchParams) {
  if (typeof userRoute?.getIdentity === "function") {
    const id = userRoute.getIdentity(onmatchParams);
    return typeof id === "string" ? id : stableStringify(id);
  }
  return defaultGetIdentity(onmatchParams);
}

function getRouteDefForPath(routes, routePath) {
  return flattenRoutes(routes)[routePath];
}

// ─── RouteChangeState ─────────────────────────────────────────────────────────
//
// Immutable snapshot of a resolved route. Stored on the history stack.

export function RouteChangeState(onmatchParams, identity) {
  const snapshot = JSON.parse(JSON.stringify(onmatchParams));
  const key = genKey();
  return Object.freeze({
    get onmatchParams() { return snapshot; },
    get identity()      { return identity; },
    key() { return key; },
  });
}

// ─── History Stack ────────────────────────────────────────────────────────────
//
// Inspectable indexed stack — direction is derivable without destructive pops.

function createHistoryStack() {
  let stack = [];
  let currentIndex = -1;

  return {
    get current() { return stack[currentIndex] ?? null; },
    get length()  { return stack.length; },
    get index()   { return currentIndex; },

    findExisting(identity) {
      const idx = stack.findIndex(e => e.identity === identity);
      return idx >= 0 ? { entry: stack[idx], index: idx } : null;
    },

    push(rcState) {
      stack = stack.slice(0, currentIndex + 1);
      stack.push(rcState);
      currentIndex = stack.length - 1;
    },

    moveTo(index) {
      currentIndex = index;
    },

    replaceCurrent(rcState) {
      stack[currentIndex] = rcState;
    },
  };
}

// ─── Transition Resolution ────────────────────────────────────────────────────
//
// Pure function — derives direction and updates the history stack.

function resolveTransition(history, onmatchParams, identity) {
  const rcState = RouteChangeState(onmatchParams, identity);

  if (history.length === 0) {
    history.push(rcState);
    return { directionType: DirectionTypes.INITIAL, rcState };
  }

  const existing = history.findExisting(identity);

  if (existing) {
    const delta = existing.index - history.index;
    const prev  = history.current;
    history.moveTo(existing.index);

    if (delta === 0)  return { directionType: DirectionTypes.SAME_ROUTE,     rcState: existing.entry };
    if (delta === -1) return { directionType: DirectionTypes.BACK,           rcState: existing.entry, prevRcState: prev };
    if (delta ===  1) return { directionType: DirectionTypes.FORWARD,        rcState: existing.entry, prevRcState: prev };
    return             { directionType: DirectionTypes.EXISTING_ROUTE, rcState: existing.entry, prevRcState: prev, delta };
  }

  const prev = history.current;
  history.push(rcState);
  return { directionType: DirectionTypes.FORWARD, rcState, prevRcState: prev };
}

// ─── Router Coordination Machine ─────────────────────────────────────────────
//
// Replaces the scattered _state flags. Models one onmatch→render cycle.
//
//   idle ──ONMATCH──▶ matching ──ONMATCH──▶ matching  (redirect: roll back)
//                        └──────RENDER──▶  idle
//
// Context carries everything render() needs: transitionState, resolvedComponent,
// anim, and whether a state replace was requested.

function createRouterMachine(history) {
  return createMachine(
    {
      idle: {
        on: { ONMATCH: "matching" },
      },
      matching: {
        on: {
          // Second ONMATCH before render = redirect inside user's onmatch.
          // Roll back the speculative history push before re-entering.
          ONMATCH: "matching",
          RENDER:  "idle",
        },
      },
    },
    "idle"
  );
}

// ─── Route Resolver Enhancement ───────────────────────────────────────────────

function buildRouteResolvers(navstate) {
  const flat = flattenRoutes(navstate.routes);

  navstate.resolvers = Object.keys(flat).reduce((acc, routeKey) => {
    const userRoute = flat[routeKey];
    const router    = navstate.router;

    const resolver = {

      onmatch(args, requestedPath, route) {
        const wasMatching = router.current === "matching";

        // Redirect detected — roll back the speculative push
        if (wasMatching) {
          navstate.history.moveTo(navstate.history.index - 1);
        }

        // Notify outbound resolver
        const outbound = navstate.history.current;
        const outboundResolver = outbound
          && navstate.resolvers[outbound.onmatchParams.route];
        if (outboundResolver?.onbeforeroutechange) {
          outboundResolver.onbeforeroutechange({ outbound, requestedPath });
        }

        // Resolve component
        let resolvedComponent;

        // Derive transition BEFORE calling user's onmatch so navContext
        // can be passed as the fourth argument.
        const { path, params } = m.parsePathname(requestedPath);
        const onmatchParams    = { args, params, path, requestedPath, route };
        const identity         = getIdentityForRoute(userRoute, onmatchParams);
        let transitionState    = resolveTransition(navstate.history, onmatchParams, identity);
        transitionState.context = {};

        // navContext — direction-aware context for user's onmatch
        const { directionType } = transitionState;
        const navContext = {
          directionType,
          isForward:   directionType === DirectionTypes.FORWARD  ||
            directionType === DirectionTypes.INITIAL,
          isBack:      directionType === DirectionTypes.BACK     ||
            directionType === DirectionTypes.EXISTING_ROUTE,
          isSameRoute: directionType === DirectionTypes.SAME_ROUTE,
        };

        if (userRoute.onmatch) {
          resolvedComponent = userRoute.onmatch(args, requestedPath, route, navContext);
        }
        if (!resolvedComponent) resolvedComponent = userRoute;

        // Handle replace: remove the entry being replaced
        if (navstate.replacingState) {
          navstate.replacingState = false;
          const h = navstate.history;
          h.moveTo(h.index - 1);
          h.push(RouteChangeState(onmatchParams, identity));
        }

        navstate.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: true,
          detail: { transitionState, outbound },
        }));

        // Drive the router machine — carries state forward to render()
        router.send("ONMATCH", {
          transitionState,
          resolvedComponent,
          anim: navstate.pendingAnim,
        });

        return resolvedComponent;
      },

      render(vnode) {
        const { layoutComponent } = navstate;
        const { transitionState, anim } = router.context;

        // render() without a preceding onmatch = plain redraw
        const ts = router.current === "idle"
          ? { ...transitionState, directionType: DirectionTypes.REDRAW }
          : transitionState;

        if (anim) ts.anim = anim;

        // Advance machine back to idle, clear pending anim
        router.send("RENDER");
        navstate.pendingAnim = undefined;

        vnode.attrs.transitionState = ts;

        if (!userRoute.render) {
          return m(layoutComponent, { transitionState: ts },
            m(router.context.resolvedComponent ?? userRoute, vnode.attrs));
        }

        const output = userRoute.render(vnode);

        if (output.tag === layoutComponent) {
          output.attrs.transitionState = ts;
          return output;
        }

        if (output.items) {
          return m(layoutComponent, {
            cls: output.cls,
            layout: output.layout,
            items: output.items,
            transitionState: ts,
          });
        }

        return m(layoutComponent, { transitionState: ts }, output);
      },
    };

    if (userRoute.onbeforeroutechange) {
      resolver.onbeforeroutechange = userRoute.onbeforeroutechange;
    }

    acc[routeKey] = resolver;
    return acc;

  }, {});

  return navstate.resolvers;
}

// ─── Internal State ───────────────────────────────────────────────────────────

const _state = {
  routes:          undefined,
  layoutComponent: undefined,
  resolvers:       undefined,
  history:         createHistoryStack(),
  router:          null,         // set at init time (needs history)
  events:          new EventTarget(),
  pendingAnim:     undefined,
  replacingState:  false,        // setRoute→onmatch handoff flag
};

// ─── Intercept m.route.set ────────────────────────────────────────────────────
//
// m.route.Link calls m.route.set() internally — intercept so all navigations
// flow through m.nav.setRoute() for consistent direction tracking.

const _origRouteSet = m.route.set;
m.route.set = (route, params, options) => m.nav.setRoute(route, params, options);

// ─── m.nav ────────────────────────────────────────────────────────────────────

m.nav = function nav(root, defaultRoute, routes, config) {
  if (!routes)                  throw new Error("m.nav() — routes is required.");
  if (!config?.layoutComponent) throw new Error("m.nav() — layoutComponent is required.");

  _state.routes          = routes;
  _state.layoutComponent = config.layoutComponent;
  _state.router          = createRouterMachine(_state.history);

  buildRouteResolvers(_state);
  m.route(root ?? document.body, defaultRoute, _state.resolvers);
};

Object.assign(m.nav, {

  setRoute(route, params, options = {}, anim) {
    const requestedPath = m.buildPathname(route, params);
    const { path, params: normalizedParams } = m.parsePathname(requestedPath);
    const onmatchParams = {
      args: normalizedParams ?? {},
      params: normalizedParams ?? {},
      path,
      requestedPath,
      route,
    };
    const userRoute = getRouteDefForPath(_state.routes, route);
    const identity  = getIdentityForRoute(userRoute, onmatchParams);
    const existing  = _state.history.findExisting(identity);

    // Already here — refresh in place
    if (existing && existing.index === _state.history.index) {
      _origRouteSet(route, params, { ...options, replace: true });
      return;
    }

    // Known earlier route — use native traversal
    if (existing) {
      const delta = existing.index - _state.history.index;
      if (delta < 0) {
        window.history.go(delta);
        return;
      }
    }

    if (options.replace === true) {
      _state.replacingState = true;
    }

    _state.pendingAnim = anim;
    _origRouteSet(route, params, options);
  },

  addEventListener:    _state.events.addEventListener.bind(_state.events),
  removeEventListener: _state.events.removeEventListener.bind(_state.events),

  debug() { return { ..._state, routerState: _state.router?.current }; },

});

export default m.nav;

// ─── createNavLayout ──────────────────────────────────────────────────────────
//
// Matches the pattern from the original m-dot-nav demo exactly:
//
//   - Closure component so _layoutState is stable per instance
//   - Page child is keyed by rcState.key() — forces create/remove each route change
//   - onbeforeremove stores both dom AND resolver on outbound slot
//   - oncreate/onupdate populate transitionState.context = _layoutState
//   - animate(transitionState) receives full context — call resolver() when done
//
// Usage:
//
//   const Layout = createNavLayout({
//     animate(transitionState) {
//       const { outbound, inbound } = transitionState.context;
//       // animate outbound["page"].dom out
//       // call outbound["page"].resolver() when done
//     }
//   });

export function createNavLayout(hooks = {}) {
  const { animate } = hooks;

  return function NavLayout() {

    let _layoutState = {
      inbound:  {},
      outbound: {}
    };

    // Keyed child — recreated on every route change.
    // oncreate  → captures inbound DOM
    // onbeforeremove → holds outbound DOM alive, stores resolver
    function Page() {
      return {
        view({ attrs, children }) {
          return m("div", {
            "data-page-key": attrs.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, children);
        },
        oncreate({ dom }) {
          _layoutState.inbound["page"] = { dom };
        },
        onbeforeremove({ dom }) {
          return new Promise(resolve => {
            _layoutState.outbound["page"] = { dom, resolver: resolve };
          });
        }
      };
    }

    return {
      view({ attrs, children }) {
        const { transitionState } = attrs;
        const dir = transitionState?.directionType;

        // Only update the key on real route changes — not redraws or same-route.
        // A stable key prevents spurious Page create/remove cycles.
        if (dir !== DirectionTypes.REDRAW && dir !== DirectionTypes.SAME_ROUTE) {
          this._key = transitionState.rcState.key();
        }

        return m("div", {
          style: "display:grid; overflow:hidden; height:100%; width:100%;"
        }, [m(Page, { key: this._key }, children)]);
      },

      oncreate({ attrs }) {
        attrs.transitionState.context = _layoutState;
      },

      onupdate({ attrs }) {
        const { transitionState } = attrs;
        const dir = transitionState?.directionType;

        if (dir === DirectionTypes.REDRAW || dir === DirectionTypes.SAME_ROUTE) return;

        transitionState.context = _layoutState;

        // Defer to microtask — by then all child lifecycle hooks
        // (Page oncreate + onbeforeremove) have already fired synchronously,
        // so both inbound and outbound are guaranteed to be populated.
        Promise.resolve().then(() => {
          const { outbound, inbound } = _layoutState;

          if (!outbound["page"]?.dom) return;

          if (animate) {
            animate(transitionState);
          } else {
            outbound["page"].resolver();
          }

          _layoutState.outbound = {};
          _layoutState.inbound  = {};
        });
      }
    };
  };
}

// ─── createFadeLayout ─────────────────────────────────────────────────────────
//
// Fades the outbound page out, then releases it.
// Inbound is already visible in the same grid cell underneath.

export function createFadeLayout(options = {}) {
  const duration = options.duration ?? 200;

  return createNavLayout({
    animate(transitionState) {
      const { outbound } = transitionState.context;
      const outDom   = outbound["page"].dom;
      const resolver = outbound["page"].resolver;

      outDom.style.transition = `opacity ${duration}ms ease`;
      outDom.style.opacity    = "0";

      outDom.addEventListener("transitionend", function te(e) {
        if (e.propertyName !== "opacity") return;
        outDom.removeEventListener("transitionend", te);
        resolver();
      });

      setTimeout(resolver, duration + 100); // safety fallback
    }
  });
}

// ─── createSlideLayout ────────────────────────────────────────────────────────
//
//   FORWARD / INITIAL — inbound slides in from right, outbound exits left
//   BACK              — inbound slides in from left,  outbound exits right

export function createSlideLayout(options = {}) {
  const duration = options.duration ?? 300;

  return createNavLayout({
    animate(transitionState) {
      const { outbound, inbound } = transitionState.context;
      const outDom   = outbound["page"].dom;
      const inDom    = inbound["page"].dom;
      const resolver = outbound["page"].resolver;
      const dir      = transitionState.directionType;

      const fromRight = dir === DirectionTypes.FORWARD || dir === DirectionTypes.INITIAL;
      const inFrom    = fromRight ?  "100%" : "-100%";
      const outTo     = fromRight ? "-100%" :  "100%";

      // Guard — ensure resolver is only called once
      let resolved = false;
      const resolve = () => { if (!resolved) { resolved = true; resolver(); } };

      // Set starting position before first paint
      inDom.style.transform = `translateX(${inFrom})`;

      // Double rAF — first ensures the starting transform is painted,
      // second begins the transition so transitionend fires reliably.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        outDom.style.transition = `transform ${duration}ms ease`;
        outDom.style.transform  = `translateX(${outTo})`;
        inDom.style.transition  = `transform ${duration}ms ease`;
        inDom.style.transform   = "translateX(0)";

        inDom.addEventListener("transitionend", function te(e) {
          if (e.propertyName !== "transform") return;
          inDom.removeEventListener("transitionend", te);
          inDom.style.transition = "";
          inDom.style.transform  = "";
          resolve();
        });

        setTimeout(resolve, duration + 100); // safety fallback
      }));
    }
  });
}

// ─── createCssNavLayout ───────────────────────────────────────────────────────
//
// Applies CSS classes for animation — add your own @keyframes.
// Target [data-page-key] or add classes directly to outbound/inbound doms.

export function createCssNavLayout() {
  return createNavLayout({
    animate(transitionState) {
      const { outbound } = transitionState.context;
      const outDom   = outbound["page"].dom;
      const resolver = outbound["page"].resolver;

      outDom.addEventListener("animationend", function ae() {
        outDom.removeEventListener("animationend", ae);
        resolver();
      });

      setTimeout(resolver, 600); // safety fallback
    }
  });
}