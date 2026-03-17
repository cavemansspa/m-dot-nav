import m from "mithril";
// import { createFadeLayout, createSlideLayout, DirectionTypes } from "./m-dot-nav.js";
import { createFadeLayout, createSlideLayout, DirectionTypes } from "m-dot-nav";

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
    view: () => m(".log",
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

    return m(".shell", [

      m("nav", [
        m("span", "go:"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/home" }),
          onclick: () => m.nav.setRoute("/home"),
        }, "/home"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/about" }),
          onclick: () => m.nav.setRoute("/about"),
        }, "/about"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/item/1" }),
          onclick: () => m.nav.setRoute("/item/1"),
        }, "/item/1"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/item/2" }),
          onclick: () => m.nav.setRoute("/item/2"),
        }, "/item/2"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/item/3" }),
          onclick: () => m.nav.setRoute("/item/3"),
        }, "/item/3"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/redirect-test" }),
          onclick: () => m.nav.setRoute("/redirect-test"),
        }, "/redirect-test"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/protected" || m.route.get() === "/login" }),
          onclick: () => m.nav.setRoute("/protected"),
        }, "/protected"),
        m("button", {
          class: m.cls({ active: m.route.get()?.startsWith("/product") }),
          onclick: () => m.nav.setRoute("/product/42"),
        }, "/product/42"),
        m("button", { onclick: () => m.nav.setRoute("/product/42", { sort: "price" }) }, "?sort=price"),
        m("button", { onclick: () => m.nav.setRoute("/product/42", { sort: "name"  }) }, "?sort=name"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/wizard/1" }),
          onclick: () => m.nav.setRoute("/wizard/1"),
        }, "/wizard/1"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/wizard/2" }),
          onclick: () => m.nav.setRoute("/wizard/2"),
        }, "/wizard/2"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/wizard/3" }),
          onclick: () => m.nav.setRoute("/wizard/3"),
        }, "/wizard/3"),
        m("button", {
          class: m.cls({ active: m.route.get() === "/list" }),
          onclick: () => m.nav.setRoute("/list"),
        }, "/list"),
        m("button", { onclick: () => history.back()    }, "← back"),
        m("button", { onclick: () => history.forward() }, "forward →"),

        m(".ts-badge", [
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
      m("p.label", "Demonstrates: INITIAL, FORWARD, BACK, SAME_ROUTE"),
      m("p", "This is the first route — the log should show INITIAL on load."),
      m("p", "Navigate to any other route and come back — the log should show BACK. Clicking /home while already here should show SAME_ROUTE with no animation."),
      m("button", {
        style: "margin-top:16px;",
        onclick: () => m.nav.setRoute("/slideup", null, {}, slideUpAnim)
      }, "↑ Open slide-up page"),
    ]);
  }
};

const About = {
  view() {
    return m(".page", [
      m("h1", "About"),
      m("p.label", "Demonstrates: FORWARD, BACK"),
      m("p", "A plain second-level route. Navigate here from Home for FORWARD, then use ← back for BACK."),
      m("p", "Try: Home → About → /item/1 → About — the last step should be BACK since About is already in the history stack."),
    ]);
  }
};

const Item = {
  view({ attrs }) {
    return m(".page", [
      m("h1", `Item ${attrs.id}`),
      m("p.label", "Demonstrates: FORWARD, BACK, EXISTING_ROUTE"),
      m("p", "Each unique id is a distinct history entry by default — no getIdentity override needed."),
      m("p", "Try: /item/1 → /item/2 → /item/3 → /item/1 — the last step should show BACK since /item/1 is already in the stack at index 0."),
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

let isAuthed = false;

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
      m("p.label", "Demonstrates: { replace: true } auth redirect pattern"),
      m("p", "You are authenticated. This page is in history — /login is not."),
      m("p", "Press ← back — it should skip past /login entirely and return to wherever you were before clicking /protected."),
      m("button", {
        onclick: () => { isAuthed = false; Log.add("AUTH", "logged out"); }
      }, "Log out"),
    ]);
  }
};

const Login = {
  view() {
    return m(".page", [
      m("h1", "Login"),
      m("p.label", "Demonstrates: { replace: true } — transient page pattern"),
      m("p", "This page replaced /protected in the history stack via { replace: true }. It is a transient page — it should never appear in back/forward navigation."),
      m("p", "After logging in, /protected replaces /login in the same stack slot. ← back will skip this page entirely."),
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
      m("p.label", "Demonstrates: getIdentity — ignoring query params"),
      m("p", "getIdentity returns route + id only, ignoring sort/filter params. Changing sort is SAME_ROUTE — no animation, no new history entry, onmatch still fires so data can refresh."),
      m("p", `Current sort: ${sort}`),
      m("p", "Try: /product/42 → ?sort=price → ?sort=name — all SAME_ROUTE. Then ← back jumps past all sort variants in one step."),
    ]);
  }
};

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
      m("p.label", "Demonstrates: getIdentity + navContext in onmatch"),
      m("p", "Each step is a distinct history entry. getIdentity includes the step param — each /wizard/:step is tracked separately in the stack."),
      m("p", "onmatch receives navContext as the fourth argument — check the log to see isForward / isBack on each navigation."),
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

// ── Scroll restore via onbeforeroutechange ────────────────────────────────────
//
// onbeforeroutechange fires on the outbound route just before leaving.
// We save the scroll position there, then restore it in oncreate when
// navigating back (navContext.isBack).

const List = (() => {
  let scrollTop   = 0;
  let listDom     = null;

  return {
    onbeforeroutechange({ inbound, outbound }) {
      if (listDom) {
        scrollTop = listDom.scrollTop;
        Log.add("LIST", `saving scroll: ${scrollTop}px`);
      }
    },

    onmatch(args, requestedPath, route, nav) {
      if (nav.isBack) {
        Log.add("LIST", `returning via BACK — will restore scroll to ${scrollTop}px`);
      } else {
        scrollTop = 0;
        Log.add("LIST", "fresh load — scroll reset");
      }
    },

    view() {
      return m(".page", [
        m("h1", "Scroll Restore"),
        m("p.label", "Demonstrates: onbeforeroutechange + navContext scroll restore"),
        m("p", "Scroll down, navigate away, then come back via ← back. Scroll position should be restored."),
        m("div", {
            style: "height:300px; overflow-y:auto; border:1px solid #333; margin-top:12px;",
            oncreate({ dom }) {
              listDom = dom;
              if (scrollTop) {
                dom.scrollTop = scrollTop;
                Log.add("LIST", `scroll restored to ${scrollTop}px`);
              }
            },
            onremove() {
              listDom = null;
            }
          },
          Array.from({ length: 50 }, (_, i) =>
            m("div", {
              style: "padding:8px 12px; border-bottom:1px solid #222; font-size:12px; color:#666;"
            }, `Item ${i + 1}`)
          )
        ),
      ]);
    }
  };
})();

// ── One-off anim via setRoute fourth argument ─────────────────────────────────
//
// These animation functions are passed directly to m.nav.setRoute() as the
// fourth argument. They override the layout's default animation for that
// specific navigation only — useful for contextual transitions like a page
// that slides up from the bottom like a modal/sheet.
//
// The function receives transitionState with context.inbound/outbound doms.

function slideUpAnim(transitionState) {
  const { inbound, outbound } = transitionState.context;
  const inDom    = inbound["page"].dom;
  const outDom   = outbound["page"].dom;
  const resolver = outbound["page"].resolver;

  let resolved = false;
  const resolve = () => { if (!resolved) { resolved = true; resolver(); } };

  inDom.style.transform = "translateY(100%)";

  requestAnimationFrame(() => requestAnimationFrame(() => {
    inDom.style.transition  = "transform 300ms ease";
    inDom.style.transform   = "translateY(0)";

    inDom.addEventListener("transitionend", function te(e) {
      if (e.propertyName !== "transform") return;
      inDom.removeEventListener("transitionend", te);
      inDom.style.transition = "";
      inDom.style.transform  = "";
      resolve();
    });

    setTimeout(resolve, 400);
  }));
}

function slideDownAnim(transitionState) {
  const { inbound, outbound } = transitionState.context;
  const outDom   = outbound["page"].dom;
  const resolver = outbound["page"].resolver;

  let resolved = false;
  const resolve = () => { if (!resolved) { resolved = true; resolver(); } };

  outDom.style.transition = "transform 300ms ease";
  outDom.style.transform  = "translateY(100%)";
  outDom.style.zIndex     = "1";

  outDom.addEventListener("transitionend", function te(e) {
    if (e.propertyName !== "transform") return;
    outDom.removeEventListener("transitionend", te);
    resolve();
  });

  setTimeout(resolve, 400);
}

const SlideUp = {
  view() {
    return m(".page", [
      m("h1", "Slide Up Page"),
      m("p.label", "Demonstrates: anim fourth argument to m.nav.setRoute()"),
      m("p", "This page slid up from the bottom — a one-off animation passed directly to setRoute(), overriding the default slide layout for this navigation only."),
      m("p", "Press ← back — it slides back down."),
      m("button", {
        onclick: () => m.nav.setRoute("/home", null, {}, slideDownAnim)
      }, "↓ Slide down → /home"),
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
  "/list":          List,
  "/slideup":       SlideUp,
}, {
  layoutComponent: AppLayout,
});