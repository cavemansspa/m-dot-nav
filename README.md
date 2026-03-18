# m-dot-nav

Navigation wrapper over Mithril's route-resolvers.

## Routing vs Navigation

Mithril's [`m.route()`](https://mithril.js.org/route.html) default routing implementation provides a straight-forward
and flexible approach for setting up an application's different page endpoints. However, navigation (i.e. functionality to move between routes)
is left to the developer to implement and is typically solved using a custom [route resolver](https://mithril.js.org/route.html#routeresolver).

As discussed on Mithril's gitter chat a few times, it's
not uncommon to conflate application routing with application navigation. However, in my opinion, these concepts are best considered as separate application concerns and be handled as such. An application's routes are its set of possible endpoints (i.e. pages) whereas navigation is the mechanics of moving from one page to another. For example, the customary mobile app page transition of sliding-out-left / sliding-in-right is a navigation concern. To that end, `m-dot-nav` aims to aid the app developer with some utilities to assist with wiring together your application's routes.

## Installation

```bash
# pin to a specific version tag (recommended)
npm install github:cavemansspa/m-dot-nav#v2.0.4
```

## Basic Usage

```js
import m, { createSlideLayout } from "m-dot-nav";

const Layout = createSlideLayout();

m.nav(document.body, "/home", {
    "/home":  Home,
    "/about": About,
}, {
    layoutComponent: Layout,
});
```

Routes are defined exactly as with `m.route()` — components, route resolvers, or nested route objects all work.

---

## API

### `m.nav(root, defaultRoute, routes, config)`

Initializes navigation. Mirrors `m.route()` with an additional `config` argument.

- `config.layoutComponent` — required. A Mithril component that receives `transitionState` as an attr and `children` as the resolved route component.

### `m.nav.setRoute(route, params, options, anim)`

Navigate programmatically. Mirrors `m.route.set()` with an additional `anim` argument for one-off animation overrides.

```js
m.nav.setRoute("/about");
m.nav.setRoute("/item", { id: 42 });
m.nav.setRoute("/login", null, { replace: true });

// one-off animation override
m.nav.setRoute("/modal", null, {}, (transitionState) => {
    const { inbound, outbound } = transitionState.context;
    // animate inbound["page"].dom in, call outbound["page"].resolver() when done
});
```

### `m.nav.addEventListener(event, handler)` / `removeEventListener`

Subscribe to navigation events. Currently supports `onbeforeroutechange`:

```js
m.nav.addEventListener("onbeforeroutechange", (e) => {
    const { transitionState, inbound, outbound } = e.detail;
    console.log(transitionState.directionType);
});
```

---

## Transition State

Your layout component receives `attrs.transitionState` on every render:

```js
{
    directionType,  // see DirectionTypes below
    rcState,        // RouteChangeState for the current route
    prevRcState,    // RouteChangeState for the previous route (if applicable)
    context,        // shared object for layout ↔ animation communication
    anim,           // one-off animation function if passed to setRoute()
}
```

### `DirectionTypes`

```js
import { DirectionTypes } from "m-dot-nav";

DirectionTypes.INITIAL           // first route on load
DirectionTypes.FORWARD           // navigating to a new route
DirectionTypes.BACK              // returning to a previous route
DirectionTypes.SAME_ROUTE        // same logical destination, nothing changed
DirectionTypes.SAME_ROUTE_CHANGE // same logical destination, params changed (see getIdentity)
DirectionTypes.EXISTING_ROUTE    // returning to a non-adjacent history entry
DirectionTypes.REDRAW            // plain Mithril redraw, no route change
```

---

## Route Definition

A route can be defined as a **component** (with `view`) or a **route resolver** (with `onmatch` and/or `render`) — the same as standard Mithril. `m-dot-nav` adds three optional properties that can appear on either form.

```js
// Component — simplest form
"/home": {
    view({ attrs }) { ... }
}

// Route resolver — for onmatch, render, or both
"/orders": {
    onmatch(args, requestedPath, route, navContext) { ... },
    render(vnode) { ... },
}

// Either form can also include m-dot-nav additions:
"/products/:id": {
    getIdentity(onmatchParams),       // control history matching
    onbeforeroutechange(changeInfo),  // notified when leaving this route

    // then either view() or onmatch()/render() as above
    onmatch(args, requestedPath, route, navContext) { ... },
    view({ attrs }) { ... },
}
```

### `onmatch` — navContext fourth argument

`onmatch` receives a fourth argument, `navContext`, with direction-aware helpers:

```js
"/orders": {
    onmatch(args, requestedPath, route, nav) {
        if (nav.isBack || nav.isExisting) {
            restoreFromParams(args);        // returning — URL has prior state
        } else if (nav.isForward) {
            resetAndLoad(args);             // fresh navigation
        } else if (nav.isSameRoute) {
            // nothing changed — no-op
        } else if (nav.isSameRouteChange) {
            refreshData(args);              // params changed, keep UI state
        }
    }
}
```

`navContext` shape:

```js
{
    directionType,        // full DirectionTypes value
    isForward,            // FORWARD or INITIAL
    isBack,               // BACK or EXISTING_ROUTE
    isSameRoute,          // SAME_ROUTE — nothing changed
    isSameRouteChange,    // SAME_ROUTE_CHANGE — same page, params changed
}
```

### `getIdentity(onmatchParams) => string`

Controls how routes are matched against the history stack. By default, identity includes route pattern + params + args — every unique URL is a distinct history entry.

Override `getIdentity` when you want different behavior:

```js
// Ignore query params — filter changes stay on the same logical page
"/products/:id": {
    getIdentity({ route, args }) {
        return `${route}:${args.id}`;  // sort/filter params ignored
    },
    onmatch(args, path, route, nav) {
        if (nav.isSameRouteChange) refreshData(args);
        else resetAndLoad(args);
    },
    view({ attrs }) { ... }
}

// Each wizard step is a distinct history entry
"/wizard/:step": {
    getIdentity({ route, args }) {
        return `${route}:${args.step}`;
    },
    view({ attrs }) { ... }
}
```

### `onbeforeroutechange(changeInfo)`

Called on the *outbound* route resolver just before the route changes:

```js
"/list": {
    onbeforeroutechange({ inbound, outbound, requestedPath }) {
        // inbound.onmatchParams.route  — route you're navigating TO
        // outbound.onmatchParams.route — route you're leaving
        saveScrollPosition();
    },
    view() { ... }
}
```

---

## Layout Components

`m-dot-nav` ships three layout factories. Use them directly or as reference for building your own.

### `createSlideLayout(options?)`

Horizontal slide — FORWARD slides in from the right, BACK from the left.

```js
import { createSlideLayout } from "m-dot-nav";

const Layout = createSlideLayout({ duration: 300 }); // duration in ms

m.nav(document.body, "/home", routes, { layoutComponent: Layout });
```

### `createFadeLayout(options?)`

Fades the outbound page out. The inbound page is visible underneath.

```js
import { createFadeLayout } from "m-dot-nav";

const Layout = createFadeLayout({ duration: 200 });
```

### `createCssNavLayout()`

Pure CSS animation — sets `data-nav-anim="in|out"` and `data-direction` attributes on inbound and outbound doms. Waits for `animationend` before releasing the outbound DOM.

```js
import { createCssNavLayout } from "m-dot-nav";

const Layout = createCssNavLayout();
```

Target the attributes in CSS:

```css
[data-nav-anim="out"][data-direction="FORWARD"] { animation: slideOutLeft 0.3s ease forwards; }
[data-nav-anim="in"][data-direction="FORWARD"]  { animation: slideInRight 0.3s ease forwards; }
[data-nav-anim="out"][data-direction="BACK"]    { animation: slideOutRight 0.3s ease forwards; }
[data-nav-anim="in"][data-direction="BACK"]     { animation: slideInLeft 0.3s ease forwards; }
```

### `createNavLayout(hooks)`

The primitive all layout factories are built on. Implement your own animation:

```js
import { createNavLayout } from "m-dot-nav";

const Layout = createNavLayout({
    animate(transitionState) {
        const { outbound, inbound } = transitionState.context;
        const outDom   = outbound["page"].dom;
        const inDom    = inbound["page"].dom;
        const resolver = outbound["page"].resolver;

        // animate outDom out and inDom in, then call resolver()
        // resolver() releases the outbound DOM from the page
    }
});
```

The `animate` function receives the full `transitionState` including `directionType` and `anim` (one-off override from `setRoute`).

### Custom layout (no factory)

You can also write a layout component from scratch — `m-dot-nav` just requires that `layoutComponent` accepts `attrs.transitionState` and renders `children`:

```js
m.nav(document.body, "/home", routes, {
    layoutComponent: {
        view({ attrs, children }) {
            console.log(attrs.transitionState.directionType);
            return m("div", children);
        }
    }
});
```

---

## Auth Redirect Pattern

When a protected route redirects to login, use `{ replace: true }` on both legs so the login page never appears in the history stack:

```js
"/protected": {
    onmatch() {
        if (!isAuthed) {
            m.nav.setRoute("/login", null, { replace: true });
            // Return a never-resolving Promise to prevent Mithril from rendering
            // this route. The Promise is immediately eligible for GC since nothing
            // holds a reference to it — this is an idiomatic Mithril redirect pattern.
            return new Promise(() => {});
        }
    },
    view() { ... }
},

"/login": {
    view() {
        return m("button", {
            onclick: () => {
                isAuthed = true;
                m.nav.setRoute("/protected", null, { replace: true });
            }
        }, "Log in");
    }
}
```

Result: back from `/protected` returns to wherever the user was before, skipping `/login` entirely.

---

## Scroll Position Restore

Use `onbeforeroutechange` to save scroll position and `navContext.isBack` to restore it:

```js
const List = (() => {
    let scrollTop = 0;
    let listDom   = null;

    return {
        onbeforeroutechange() {
            if (listDom) scrollTop = listDom.scrollTop;
        },

        onmatch(args, path, route, nav) {
            if (!nav.isBack) scrollTop = 0; // fresh load — reset
        },

        view() {
            return m("div", {
                oncreate({ dom }) {
                    listDom = dom;
                    if (scrollTop) dom.scrollTop = scrollTop;
                },
                onremove() { listDom = null; }
            }, items);
        }
    };
})();
```

---

## Nested Routes

```js
m.nav(document.body, "/home", {
    "/nested": {
        "/a": { render: () => m(SubLayout, m("div", "/nested/a")) },
        "/b": { render: () => m(SubLayout, m("div", "/nested/b")) },
    }
}, { layoutComponent: Layout });
```

`flattenRoutes()` flattens nested objects into top-level route keys (`/nested/a`, `/nested/b`). The sub-layout component wraps the content returned from `render()`.

---

## History Behavior

`m-dot-nav` maintains its own history stack alongside the browser's. When you navigate to a route already in the stack, it uses `history.go(delta)` for native back/forward traversal rather than pushing a new entry — keeping the browser back/forward buttons aligned with in-app navigation.

---

## `m.cls` Utility

A small helper attached to `m` for conditional class names:

```js
m("div", { class: m.cls({ active: isActive, disabled: isDisabled }) })
// → "active", "disabled", or "active disabled"
```

---

## License

MIT