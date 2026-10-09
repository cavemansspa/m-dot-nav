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

function createMachine(states, initial, onChange = () => {
}) {

  let current = initial;
  let context = {};

  function enter(next, ctx) {
    current = next;
    context = {...context, ...ctx};
    onChange(current, context);

    const def = states[current];
    if (!def?.invoke) return;

    def.invoke(context)
      .then(() => enter(def.onDone ?? current, {}))
      .catch(() => enter(def.onError ?? current, {}));
  }

  return {
    get current() {
      return current;
    },
    get context() {
      return context;
    },

    send(event, payload = {}) {
      const next = states[current]?.on?.[event];
      if (next) enter(next, payload);
    },
  };
}

// ─── Direction Types ──────────────────────────────────────────────────────────

export const DirectionTypes = {
  INITIAL: "INITIAL",
  FORWARD: "FORWARD",
  BACK: "BACK",
  SAME_ROUTE: "SAME_ROUTE",
  SAME_ROUTE_CHANGE: "SAME_ROUTE_CHANGE",
  EXISTING_ROUTE: "EXISTING_ROUTE",
  REDRAW: "REDRAW",
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
      ? {...acc, [prefix + match]: route}
      : {...acc, ...flattenRoutes(route, prefix + match)};
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
  const {route, params, args} = onmatchParams;
  return stableStringify({route, params, args});
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

// Matches a literal path (e.g. "/washingtontownship/news") against the route
// patterns (e.g. "/:community/:tab") — segment by segment, definition order.
// Needed because setRoute callers (and mithril's default-route redirect) may
// pass literal paths; identity must be computed from the same pattern + args
// that onmatch will use, or findExisting can never match.
function matchPathToRoute(routes, path) {
  const flat = flattenRoutes(routes);
  const segs = path.split("/").filter(s => s !== "");
  for (const pattern of Object.keys(flat)) {
    const psegs = pattern.split("/").filter(s => s !== "");
    if (psegs.length !== segs.length) continue;
    const args = {};
    let ok = true;
    for (let i = 0; i < psegs.length; i++) {
      if (psegs[i].startsWith(":")) args[psegs[i].slice(1)] = decodeURIComponent(segs[i]);
      else if (psegs[i] !== segs[i]) { ok = false; break; }
    }
    if (ok) return {pattern, def: flat[pattern], args};
  }
  return null;
}

// ─── RouteChangeState ─────────────────────────────────────────────────────────
//
// Immutable snapshot of a resolved route. Stored on the history stack.

export function RouteChangeState(onmatchParams, identity, key = genKey()) {
  const snapshot = JSON.parse(JSON.stringify(onmatchParams));
  return Object.freeze({
    get onmatchParams() {
      return snapshot;
    },
    get identity() {
      return identity;
    },
    key() {
      return key;
    },
  });
}

// ─── History Stack ────────────────────────────────────────────────────────────
//
// Inspectable indexed stack — direction is derivable without destructive pops.

function createHistoryStack() {
  let stack = [];
  let currentIndex = -1;

  return {
    get current() {
      return stack[currentIndex] ?? null;
    },
    get length() {
      return stack.length;
    },
    get index() {
      return currentIndex;
    },

    get stack() {
      return stack;
    },

    findExisting(identity) {
      const idx = stack.findIndex(e => e.identity === identity);
      return idx >= 0 ? {entry: stack[idx], index: idx} : null;
    },

    push(rcState) {
      stack = stack.slice(0, currentIndex + 1);
      stack.push(rcState);
      currentIndex = stack.length - 1;
    },

    truncateForward() {
      stack = stack.slice(0, currentIndex + 1);
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

function resolveTransition(history, onmatchParams, identity, replacing = false, rolledBack = false) {
  const rcState = RouteChangeState(onmatchParams, identity);

  if (history.length === 0) {
    history.push(rcState);
    return {directionType: DirectionTypes.INITIAL, rcState, pushed: true};
  }

  const existing = history.findExisting(identity);

  if (existing) {
    const delta = existing.index - history.index;
    const prev = history.current;
    history.moveTo(existing.index);

    if (delta === 0) {
      // Same identity but params may have changed — check onmatchParams
      const paramsChanged = !deepEqual(existing.entry.onmatchParams, onmatchParams);
      if (paramsChanged) {
        // Keep the stored entry in sync so later back/forward traversal and
        // debug() introspection reflect the params actually in effect here,
        // not the ones captured on the first visit to this identity.
        // The entry MUST keep its original key: the Page child is keyed by
        // rcState.key(), so a new key here mounts a second Page and — since a
        // same-route change runs no outgoing transition — the old one is never
        // removed (it lingers on top and eats pointer events).
        const updated = RouteChangeState(onmatchParams, identity, existing.entry.key());
        history.replaceCurrent(updated);
        return {directionType: DirectionTypes.SAME_ROUTE_CHANGE, rcState: updated, pushed: false};
      }
      return {directionType: DirectionTypes.SAME_ROUTE, rcState: existing.entry, pushed: false};
    }
    if (delta === -1) return {directionType: DirectionTypes.BACK, rcState: existing.entry, prevRcState: prev, pushed: false};
    if (delta === 1) return {directionType: DirectionTypes.FORWARD, rcState: existing.entry, prevRcState: prev, pushed: false};
    return {directionType: DirectionTypes.EXISTING_ROUTE, rcState: existing.entry, prevRcState: prev, delta, pushed: false};
  }

  const prev = history.current;
  if (replacing) {
    // replace: the stack must not grow. After a redirect rollback the entry
    // being replaced is the rolled-back speculative one sitting at index+1 —
    // push slices it off and lands the new entry in its slot. Otherwise
    // overwrite the current entry in place.
    if (rolledBack || history.index < 0) {
      history.push(rcState);
      return {directionType: DirectionTypes.FORWARD, rcState, prevRcState: prev, pushed: true};
    }
    history.replaceCurrent(rcState);
    return {directionType: DirectionTypes.FORWARD, rcState, prevRcState: prev, pushed: false};
  }
  history.push(rcState);
  return {directionType: DirectionTypes.FORWARD, rcState, prevRcState: prev, pushed: true};
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
        on: {ONMATCH: "matching"},
      },
      matching: {
        on: {
          // Second ONMATCH before render = redirect inside user's onmatch.
          // Roll back the speculative history push before re-entering.
          ONMATCH: "matching",
          RENDER: "idle",
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
    const router = navstate.router;

    const resolver = {

      onmatch(args, requestedPath, route) {
        // A fresh (non-redirect-chain) navigation starts a new notification
        // session — forget which outbound routes we already notified, and
        // don't roll back anything. setRoute() calls made from inside a
        // route's onmatch (a redirect) set navstate.chainInProgress
        // synchronously at the call site, even though the resulting onmatch
        // cycle for the target route runs on a later task — so that flag,
        // consumed here, is the reliable "still the same chain" signal (the
        // router machine's "matching" state is not: a chain's intermediate
        // render attempts can flip it back to "idle" mid-chain, which is why
        // the original rollback trigger based on it fired unreliably).
        const isNestedRedirect = navstate.chainInProgress;
        navstate.chainInProgress = false;
        if (!isNestedRedirect) navstate.notifiedOutboundKeys = new Set();

        // Redirect detected — roll back the speculative push, but only if
        // the preceding cycle in this chain actually pushed one. A replace
        // (e.g. mithril's own unmatched-route fallback, or an app's auth
        // guard) never advanced the index, so there is nothing to undo —
        // rolling back anyway would walk past a real, unrelated entry.
        const shouldRollBack = isNestedRedirect && navstate.lastCyclePushed;
        if (shouldRollBack) {
          navstate.history.moveTo(navstate.history.index - 1);
        }

        const outbound = navstate.history.current;

        // Resolve component
        let resolvedComponent;

        // Derive transition BEFORE calling user's onmatch so navContext
        // can be passed as the fourth argument.
        const {path, params} = m.parsePathname(requestedPath);
        const onmatchParams = {args, params, path, requestedPath, route};
        const identity = getIdentityForRoute(userRoute, onmatchParams);
        const replacing = navstate.replacingState;
        navstate.replacingState = false;
        let transitionState = resolveTransition(navstate.history, onmatchParams, identity, replacing, shouldRollBack);
        transitionState.context = {};
        navstate.lastCyclePushed = transitionState.pushed;

        // inbound is a plain object — no key generated, no spurious Page cycle
        const inbound = {onmatchParams};

        // Notify outbound resolver — at most once per logical navigation.
        // A redirect chain re-enters this onmatch multiple times before a
        // single render; after a rollback `outbound` can revert to a route
        // already notified in an earlier cycle of the same chain (not
        // necessarily the immediately preceding one), so track every key
        // notified this session rather than just the last one.
        const outboundKey = outbound?.key?.() ?? null;
        const outboundResolver = outbound
          && navstate.resolvers[outbound.onmatchParams.route];
        if (outboundResolver?.onbeforeroutechange && !navstate.notifiedOutboundKeys.has(outboundKey)) {
          outboundResolver.onbeforeroutechange({inbound, outbound, requestedPath});
        }
        navstate.notifiedOutboundKeys.add(outboundKey);

        // navContext — direction-aware context for user's onmatch
        const {directionType} = transitionState;
        const navContext = {
          directionType,
          isForward: directionType === DirectionTypes.FORWARD ||
            directionType === DirectionTypes.INITIAL,
          isBack: directionType === DirectionTypes.BACK ||
            directionType === DirectionTypes.EXISTING_ROUTE,
          isSameRoute: directionType === DirectionTypes.SAME_ROUTE,
          isSameRouteChange: directionType === DirectionTypes.SAME_ROUTE_CHANGE,
        };

        if (userRoute.onmatch) {
          navstate.insideUserOnmatch = true;
          resolvedComponent = userRoute.onmatch(args, requestedPath, route, navContext);
          navstate.insideUserOnmatch = false;
        }
        if (!resolvedComponent) resolvedComponent = userRoute;

        navstate.events.dispatchEvent(new CustomEvent("onbeforeroutechange", {
          cancelable: true,
          detail: {transitionState, inbound, outbound},
        }));

        // Drive the router machine — carries state forward to render()
        const consumedAnim = navstate.pendingAnim;
        navstate.pendingAnim = undefined;
        router.send("ONMATCH", {
          transitionState,
          resolvedComponent,
          anim: consumedAnim,
        });

        return resolvedComponent;
      },

      render(vnode) {
        const {layoutComponent} = navstate;
        const {transitionState, anim} = router.context;

        // render() without a preceding onmatch = plain redraw
        const ts = router.current === "idle"
          ? {...transitionState, directionType: DirectionTypes.REDRAW}
          : transitionState;

        if (anim) ts.anim = anim;

        // Advance machine back to idle
        router.send("RENDER");

        vnode.attrs.transitionState = ts;

        if (!userRoute.render) {
          return m(layoutComponent, {transitionState: ts},
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

        return m(layoutComponent, {transitionState: ts}, output);
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
  routes: undefined,
  layoutComponent: undefined,
  resolvers: undefined,
  history: createHistoryStack(),
  router: null,         // set at init time (needs history)
  events: new EventTarget(),
  pendingAnim: undefined,
  replacingState: false,        // setRoute→onmatch handoff flag
  notifiedOutboundKeys: new Set(), // dedupes onbeforeroutechange across a redirect chain
  insideUserOnmatch: false, // true while a route's onmatch() is executing
  chainInProgress: false, // set when setRoute() is called from inside onmatch (a redirect)
  lastCyclePushed: false, // whether the previous cycle's resolveTransition call pushed a new entry
};

// ─── Intercept m.route.set ────────────────────────────────────────────────────
//
// m.route.Link calls m.route.set() internally — intercept so all navigations
// flow through m.nav.setRoute() for consistent direction tracking.

const _origRouteSet = m.route.set;
m.route.set = (route, params, options) => m.nav.setRoute(route, params, options);

// ─── m.nav ────────────────────────────────────────────────────────────────────

m.nav = function nav(root, defaultRoute, routes, config) {
  if (!routes) throw new Error("m.nav() — routes is required.");
  if (!config?.layoutComponent) throw new Error("m.nav() — layoutComponent is required.");

  _state.routes = routes;
  _state.layoutComponent = config.layoutComponent;
  _state.router = createRouterMachine(_state.history);

  buildRouteResolvers(_state);
  m.route(root ?? document.body, defaultRoute, _state.resolvers);
};

Object.assign(m.nav, {

  setRoute(route, params, options = {}, anim) {
    // Called synchronously from inside a route's onmatch = a redirect. The
    // resulting onmatch cycle for the target route runs on a later task, but
    // this flag survives that gap so it can recognize itself as mid-chain.
    if (_state.insideUserOnmatch) _state.chainInProgress = true;

    const requestedPath = m.buildPathname(route, params);
    const {path, params: normalizedParams} = m.parsePathname(requestedPath);

    // Literal paths (m.route.set('/foo/bar'), mithril's default-route redirect)
    // must resolve to the same pattern + args that onmatch will compute, or the
    // identity lookup below can never match.
    let userRoute = getRouteDefForPath(_state.routes, route);
    let identityRoute = route;
    let identityArgs = params ?? normalizedParams ?? {};
    if (!userRoute) {
      const match = matchPathToRoute(_state.routes, path);
      if (match) {
        userRoute = match.def;
        identityRoute = match.pattern;
        identityArgs = {...match.args, ...normalizedParams};
      }
    }

    const onmatchParams = {
      args: identityArgs,
      params: normalizedParams ?? {},
      path,
      requestedPath,
      route: identityRoute,
    };
    const identity = getIdentityForRoute(userRoute, onmatchParams);
    const existing = _state.history.findExisting(identity);

    // Set pendingAnim first — before any early returns so it's always
    // available to onmatch regardless of which navigation path is taken.
    _state.pendingAnim = anim;

    // Already here — refresh in place
    if (existing && existing.index === _state.history.index) {
      _origRouteSet(route, params, {...options, replace: true});
      return;
    }

    // Known earlier route — use native traversal
    if (existing) {
      const delta = existing.index - _state.history.index;
      if (delta < 0) {
        window.history.go(delta);
        return;
      }
      // delta > 0: stale forward history — truncate so resolveTransition pushes a
      // fresh entry that stays in sync with the new browser pushState below.
      if (delta > 0) {
        _state.history.truncateForward();
      }
    }

    if (options.replace === true) {
      _state.replacingState = true;
    }

    _origRouteSet(route, params, options);
  },

  addEventListener: _state.events.addEventListener.bind(_state.events),
  removeEventListener: _state.events.removeEventListener.bind(_state.events),

  debug() {
    return {..._state, routerState: _state.router?.current};
  },

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
  const {animate, overlay} = hooks    // ← add overlay

  return function NavLayout() {

    let _layoutState = {
      inbound: {},
      outbound: {}
    };

    // Keyed child — recreated on every route change.
    // oncreate  → captures inbound DOM
    // onbeforeremove → holds outbound DOM alive, stores resolver
    function Page() {
      return {
        view({attrs, children}) {
          return m("div", {
            "data-page-key": attrs.key,
            style: "grid-area:1/1; height:100%; overflow:hidden;"
          }, children);
        },
        oncreate({dom}) {
          _layoutState.inbound["page"] = {dom};
        },
        onbeforeremove({dom}) {
          return new Promise(resolve => {
            _layoutState.outbound["page"] = {dom, resolver: resolve};
          });
        }
      };
    }

    return {
      view({attrs, children}) {
        const {transitionState} = attrs;
        const dir = transitionState?.directionType;

        // Only update the key on real route changes — not redraws or same-route.
        // A stable key prevents spurious Page create/remove cycles.
        if (dir !== DirectionTypes.REDRAW && dir !== DirectionTypes.SAME_ROUTE) {
          this._key = transitionState.rcState.key();
        }

        return m("div", {
            style: "display:grid; overflow:hidden; height:100%; width:100%;"
          }, [
            m(Page, {key: this._key}, children),
            overlay && overlay()
          ]
            .filter(Boolean)
        );
      },

      oncreate({attrs}) {
        attrs.transitionState.context = _layoutState;
      },

      onupdate({attrs}) {
        const {transitionState} = attrs;
        const dir = transitionState?.directionType;

        if (dir === DirectionTypes.REDRAW ||
          dir === DirectionTypes.SAME_ROUTE ||
          dir === DirectionTypes.SAME_ROUTE_CHANGE) return;

        transitionState.context = _layoutState;

        // Defer to microtask — by then all child lifecycle hooks
        // (Page oncreate + onbeforeremove) have already fired synchronously,
        // so both inbound and outbound are guaranteed to be populated.
        Promise.resolve().then(() => {
          const {outbound, inbound} = _layoutState;

          if (!outbound["page"]?.dom) return;

          // transitionState.anim is a one-off override from setRoute's fourth arg
          const animFn = transitionState.anim ?? animate;

          if (animFn) {
            animFn(transitionState);
          } else {
            outbound["page"].resolver();
          }

          _layoutState.outbound = {};
          _layoutState.inbound = {};
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
  const overlay = options.overlay

  return createNavLayout({
    overlay,
    animate(transitionState) {
      const {outbound} = transitionState.context;
      const outDom = outbound["page"].dom;
      const resolver = outbound["page"].resolver;

      outDom.style.transition = `opacity ${duration}ms ease`;
      outDom.style.opacity = "0";

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
  const overlay = options.overlay

  return createNavLayout({
    overlay,
    animate(transitionState) {
      const {outbound, inbound} = transitionState.context;
      const outDom = outbound["page"].dom;
      const inDom = inbound["page"].dom;
      const resolver = outbound["page"].resolver;
      const dir = transitionState.directionType;

      const fromRight = dir === DirectionTypes.FORWARD || dir === DirectionTypes.INITIAL;
      const inFrom = fromRight ? "100%" : "-100%";
      const outTo = fromRight ? "-100%" : "100%";

      // Guard — ensure resolver is only called once
      let resolved = false;
      const resolve = () => {
        if (!resolved) {
          resolved = true;
          resolver();
        }
      };

      // Set starting position before first paint
      inDom.style.transform = `translateX(${inFrom})`;

      // Double rAF — first ensures the starting transform is painted,
      // second begins the transition so transitionend fires reliably.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        outDom.style.transition = `transform ${duration}ms ease`;
        outDom.style.transform = `translateX(${outTo})`;
        inDom.style.transition = `transform ${duration}ms ease`;
        inDom.style.transform = "translateX(0)";

        inDom.addEventListener("transitionend", function te(e) {
          if (e.propertyName !== "transform") return;
          inDom.removeEventListener("transitionend", te);
          inDom.style.transition = "";
          inDom.style.transform = "";
          resolve();
        });

        setTimeout(resolve, duration + 100); // safety fallback
      }));
    }
  });
}

// ─── createMobileLayout ───────────────────────────────────────────────────────
//
// Combined layout for mobile app patterns:
//   - Tab root → tab root : fade (teleporting to a new section)
//   - All other navigations : horizontal slide (drilling into hierarchy)
//
// tabRoots: array of route patterns that are top-level tab destinations.
//
// Usage:
//   const Layout = createMobileLayout({ tabRoots: ["/library", "/browse"] });

export function createMobileLayout(options = {}) {
  const tabRoots = options.tabRoots ?? [];
  const duration = options.duration ?? 300;
  const fadeDuration = options.fadeDuration ?? 180;
  const overlay = options.overlay

  function isTabSwitch(transitionState) {
    const inRoute = transitionState.rcState?.onmatchParams?.route;
    const outRoute = transitionState.prevRcState?.onmatchParams?.route;
    return tabRoots.includes(inRoute) && tabRoots.includes(outRoute);
  }

  return createNavLayout({
    overlay,
    animate(transitionState) {
      const {outbound, inbound} = transitionState.context;
      const outDom = outbound["page"].dom;
      const inDom = inbound["page"].dom;
      const resolver = outbound["page"].resolver;
      const dir = transitionState.directionType;

      let resolved = false;
      const resolve = () => {
        if (!resolved) {
          resolved = true;
          resolver();
        }
      };

      if (isTabSwitch(transitionState)) {
        // Fade — tab switch
        outDom.style.transition = `opacity ${fadeDuration}ms ease`;
        outDom.style.opacity = "0";
        outDom.addEventListener("transitionend", function te(e) {
          if (e.propertyName !== "opacity") return;
          outDom.removeEventListener("transitionend", te);
          resolve();
        });
        setTimeout(resolve, fadeDuration + 100);
      } else {
        // Slide — drill down / back
        const fromRight = dir === DirectionTypes.FORWARD || dir === DirectionTypes.INITIAL;
        const inFrom = fromRight ? "100%" : "-100%";
        const outTo = fromRight ? "-100%" : "100%";

        inDom.style.transform = `translateX(${inFrom})`;

        requestAnimationFrame(() => requestAnimationFrame(() => {
          outDom.style.transition = `transform ${duration}ms ease`;
          outDom.style.transform = `translateX(${outTo})`;
          inDom.style.transition = `transform ${duration}ms ease`;
          inDom.style.transform = "translateX(0)";

          inDom.addEventListener("transitionend", function te(e) {
            if (e.propertyName !== "transform") return;
            inDom.removeEventListener("transitionend", te);
            inDom.style.transition = "";
            inDom.style.transform = "";
            resolve();
          });

          setTimeout(resolve, duration + 100);
        }));
      }
    }
  });
}


//
// Pure CSS animation — applies data-nav-anim attributes to both inbound
// and outbound doms so @keyframes can target them.
//
// Attributes set:
//   outbound: data-nav-anim="out" data-direction="FORWARD|BACK|..."
//   inbound:  data-nav-anim="in"  data-direction="FORWARD|BACK|..."
//
// Example CSS:
//   [data-nav-anim="out"][data-direction="FORWARD"] { animation: slideOutLeft 0.3s ease forwards; }
//   [data-nav-anim="in"][data-direction="FORWARD"]  { animation: slideInRight 0.3s ease forwards; }

export function createCssNavLayout() {
  return createNavLayout({
    animate(transitionState) {
      const {outbound, inbound} = transitionState.context;
      const outDom = outbound["page"].dom;
      const inDom = inbound["page"].dom;
      const resolver = outbound["page"].resolver;
      const dir = transitionState.directionType;

      outDom.setAttribute("data-nav-anim", "out");
      outDom.setAttribute("data-direction", dir);
      inDom.setAttribute("data-nav-anim", "in");
      inDom.setAttribute("data-direction", dir);

      outDom.addEventListener("animationend", function ae() {
        outDom.removeEventListener("animationend", ae);
        resolver();
      });

      setTimeout(resolver, 600); // safety fallback
    }
  });
}
