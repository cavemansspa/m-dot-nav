import m from "mithril";
import { createFadeLayout, createSlideLayout, DirectionTypes } from "../src/m-dot-nav.js";
//import { createFadeLayout, createSlideLayout, DirectionTypes } from "m-dot-nav";

const CssLayout = createSlideLayout();

// ── Event log ────────────────────────────────────────────────────────────────

const Log = (() => {
  let entries = [];
  const t0 = Date.now();

  function add(dir, msg, warn = false) {
    entries.unshift({ t: ((Date.now() - t0) / 1000).toFixed(2), dir, msg, warn });
    if (entries.length > 60) entries.pop();
    m.redraw();
  }

  return {
    add,
    view: () => m("#log",
      entries.map((e, i) =>
        m(".entry", { key: i, class: e.warn ? "warn" : "" }, [
          m(".t",   e.t + "s"),
          m(".dir", e.dir),
          m(".msg", e.msg),
        ])
      )
    )
  };
})();

// ── Layout ───────────────────────────────────────────────────────────────────

const AppLayout = {
  view({ attrs, children }) {
    const ts  = attrs.transitionState;
    const dir = ts?.directionType ?? "—";

    if (ts && dir !== DirectionTypes.REDRAW) {
      const route = ts.rcState?.onmatchParams?.route ?? "?";
      Log.add(dir, `→ ${route}`);
    }

    return m("#shell", [

      m("nav", [
        m("span", "go:"),
        m("button", {
          class: m.route.get() === "/home" ? "active" : "",
          onclick: () => m.nav.setRoute("/home"),
        }, "/home"),
        m("button", {
          class: m.route.get() === "/about" ? "active" : "",
          onclick: () => m.nav.setRoute("/about"),
        }, "/about"),
        m("button", {
          class: m.route.get() === "/item/1" ? "active" : "",
          onclick: () => m.nav.setRoute("/item/1"),
        }, "/item/1"),
        m("button", {
          class: m.route.get() === "/item/2" ? "active" : "",
          onclick: () => m.nav.setRoute("/item/2"),
        }, "/item/2"),
        m("button", {
          class: m.route.get() === "/item/3" ? "active" : "",
          onclick: () => m.nav.setRoute("/item/3"),
        }, "/item/3"),
        m("button", { onclick: () => m.nav.setRoute("/redirect-test") }, "/redirect-test"),
        m("button", { onclick: () => m.nav.setRoute("/protected")     }, "/protected"),
        m("button", { onclick: () => m.nav.setRoute("/product/42")                       }, "/product/42"),
        m("button", { onclick: () => m.nav.setRoute("/product/42", { sort: "price" })    }, "?sort=price"),
        m("button", { onclick: () => m.nav.setRoute("/product/42", { sort: "name"  })    }, "?sort=name"),
        m("button", { onclick: () => m.nav.setRoute("/wizard/1")      }, "/wizard/1"),
        m("button", { onclick: () => m.nav.setRoute("/wizard/2")      }, "/wizard/2"),
        m("button", { onclick: () => m.nav.setRoute("/wizard/3")      }, "/wizard/3"),
        m("button", { onclick: () => history.back()    }, "← back"),
        m("button", { onclick: () => history.forward() }, "forward →"),

        m("#ts-badge", [
          m("span.dir",   dir),
          m("span.route", m.route.get() ?? ""),
        ]),
      ]),

      m(CssLayout, { transitionState: ts }, children),

      m(Log),
    ]);
  }
};

// ── Pages ────────────────────────────────────────────────────────────────────

const Home = {
  view() {
    return m(".page", [
      m("h1", "Home"),
      m("p", "INITIAL on first load."),
      m("p", "Navigate away and come back to test BACK / FORWARD."),
      m("p", "Click /home again to test SAME_ROUTE."),
    ]);
  }
};

const About = {
  view() {
    return m(".page", [
      m("h1", "About"),
      m("p", "Second top-level route."),
      m("p", "Tests FORWARD from Home, BACK from Item pages."),
    ]);
  }
};

const Item = {
  view({ attrs }) {
    return m(".page", [
      m("h1", `Item ${attrs.id}`),
      m("p", `Parameterized route — each unique id is a distinct history entry.`),
      m("p", `Try: /item/1 → /item/2 → /item/3 → /item/1 — last should be BACK.`),
    ]);
  }
};

// Redirect inside onmatch — should roll back the intermediate history entry
const RedirectTest = {
  onmatch() {
    Log.add("REDIRECT", "onmatch() → redirecting to /about", true);
    m.nav.setRoute("/about");
    return new Promise(() => {}); // never resolves — lets the redirect win
  }
};

// ── Auth replace pattern ──────────────────────────────────────────────────────
//
// Simulates a 403 → login redirect where login should NOT appear in history.
// After login, back should return to wherever the user was before /protected,
// not to /login.

let isAuthed = false;

// Protected route — onmatch checks auth, replaces with /login if not authed.
// { replace: true } means /login takes the history slot /protected would have had.
const Protected = {
  onmatch() {
    if (!isAuthed) {
      Log.add("AUTH", "not authed — replacing with /login", true);
      m.nav.setRoute("/login", null, { replace: true });
      return new Promise(() => {}); // never resolves — lets redirect win
    }
  },
  view() {
    return m(".page", [
      m("h1", "Protected Page"),
      m("p", "You are authenticated. This page is now in history."),
      m("p", "← back should skip /login and return to wherever you came from."),
      m("button", {
        onclick: () => { isAuthed = false; Log.add("AUTH", "logged out"); }
      }, "Log out"),
    ]);
  }
};

// Login page — transient. Replaced /protected in history.
// After login, navigate to /protected. Back will skip /login.
const Login = {
  view() {
    return m(".page", [
      m("h1", "Login"),
      m("p", "This page replaced /protected in history via { replace: true }."),
      m("p", "Login also uses { replace: true } so /login itself is removed from history. Back should return to where you were before /protected."),
      m("button", {
        onclick: () => {
          isAuthed = true;
          Log.add("AUTH", "logged in — replacing /login with /protected");
          m.nav.setRoute("/protected", null, { replace: true });
        }
      }, "Log in → /protected"),
    ]);
  }
};

// ── getIdentity demos ─────────────────────────────────────────────────────────

// Product: sort/filter params are ignored for history matching.
// /product/42, /product/42?sort=price, /product/42?sort=name all resolve
// to the same identity → SAME_ROUTE, no animation, no new history entry.
const Product = {
  getIdentity({ route, args }) {
    return `${route}:${args.id}`;
  },
  onmatch(args, requestedPath, route, nav) {
    const msg = nav.isSameRoute ? "↺ SAME_ROUTE — filter/param change, keep UI state"
      : nav.isBack      ? "↩ BACK — restore state"
        : "→ FORWARD — fresh load";
    Log.add("PRODUCT", `id ${args.id} — ${msg}`);
  },
  view({ attrs }) {
    const sort = m.route.param("sort") ?? "default";
    return m(".page", [
      m("h1", `Product ${attrs.id}`),
      m("p", "getIdentity ignores query params — sort changes should be SAME_ROUTE."),
      m("p", `Current sort: ${sort}`),
    ]);
  }
};

// Wizard: each step is a distinct history entry.
// getIdentity includes step — makes the intent explicit even though
// it matches the default behavior.
const Wizard = {
  getIdentity({ route, args }) {
    return `${route}:${args.step}`;
  },
  onmatch(args, requestedPath, route, nav) {
    const msg = nav.isBack      ? "↩ BACK — restore state"
      : nav.isForward   ? "→ FORWARD — fresh load"
        : nav.isSameRoute ? "↺ SAME_ROUTE — param change"
          : nav.directionType;
    Log.add("WIZARD", `step ${args.step} — ${msg}`);
  },
  view({ attrs }) {
    const step = parseInt(attrs.step);
    return m(".page", [
      m("h1", `Wizard — Step ${step}`),
      m("p", "Each step is a distinct history entry (FORWARD/BACK between steps)."),
      m("p", "Check the log — onmatch receives navContext on every navigation."),
      step < 3 && m("button", {
        onclick: () => m.nav.setRoute(`/wizard/${step + 1}`)
      }, `Next → Step ${step + 1}`),
      step > 1 && m("button", {
        style: "margin-left:8px;",
        onclick: () => m.nav.setRoute(`/wizard/${step - 1}`)
      }, `← Step ${step - 1}`),
    ]);
  }
};

// ── Boot ─────────────────────────────────────────────────────────────────────

m.nav.addEventListener("onbeforeroutechange", (e) => {
  const { transitionState } = e.detail;
  Log.add("EVENT", `onbeforeroutechange — ${transitionState?.directionType}`);
});

m.nav(document.getElementById("app"), "/home", {
  "/home":          Home,
  "/about":         About,
  "/item/:id":      Item,
  "/redirect-test": RedirectTest,
  "/protected":     Protected,
  "/login":         Login,
  "/product/:id":   Product,
  "/wizard/:step":  Wizard,
}, {
  layoutComponent: AppLayout,
});