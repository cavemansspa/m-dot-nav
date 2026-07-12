// m-dot-nav integration tests — drives the demo app headlessly.
//
// Prereqs: npm install && npx playwright install chromium
// Run:     npm test
//
// The demo exposes window.__nav (m.nav) and window.__dirs (directionType log)
// as test hooks. Each scenario runs in a fresh browser context.

import {createServer} from "vite";
import {chromium} from "playwright";
import {resolve, dirname} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4599;
const BASE = `http://localhost:${PORT}/m-dot-nav/`;

// ─── tiny assertion harness ──────────────────────────────────────────────────

let failures = 0;
let current = "";

function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.log(`  ✗ ${label}\n      expected: ${e}\n      actual  : ${a}`);
  }
}

// ─── page helpers ────────────────────────────────────────────────────────────

async function snap(page) {
  return page.evaluate(() => {
    const h = window.__nav.debug().history;
    return {
      routes: h.stack.map(e => e.onmatchParams.route),
      index: h.index,
      dirs: window.__dirs.slice(),
    };
  });
}

async function go(page, route, params = null, options = null) {
  await page.evaluate(
    ([r, p, o]) => window.__nav.setRoute(r, p, o ?? undefined),
    [route, params, options]
  );
  await page.waitForTimeout(500);
}

async function fresh(browser, hash = "") {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + hash, {waitUntil: "networkidle"});
  await page.waitForFunction(() => window.__nav && window.__dirs.length > 0);
  await page.waitForTimeout(300);
  page.ctx = ctx;
  return page;
}

// ─── scenarios ───────────────────────────────────────────────────────────────

async function t1_bareEntryDefaultRoute(browser) {
  console.log("\nT1: bare-URL entry — default-route redirect must not corrupt the stack");
  const page = await fresh(browser);
  let s = await snap(page);
  check("INITIAL only", s.dirs, ["INITIAL"]);
  check("stack is [/home]", s.routes, ["/home"]);
  check("index 0", s.index, 0);

  await go(page, "/about");
  s = await snap(page);
  check("FORWARD push", s.dirs.at(-1), "FORWARD");
  check("stack [/home, /about]", s.routes, ["/home", "/about"]);
  await page.ctx.close();
}

async function t2_identitySameRouteChange(browser) {
  console.log("\nT2: getIdentity — param changes are SAME_ROUTE_CHANGE, stack does not grow");
  const page = await fresh(browser);

  await go(page, "/product/42"); // literal path — exercises matchPathToRoute
  let s = await snap(page);
  check("literal-path push", s.routes, ["/home", "/product/:id"]);

  await go(page, "/product/:id", {id: 42, sort: "price"});
  s = await snap(page);
  check("sort change is SAME_ROUTE_CHANGE", s.dirs.at(-1), "SAME_ROUTE_CHANGE");
  check("stack unchanged", s.routes, ["/home", "/product/:id"]);

  await go(page, "/product/:id", {id: 42, sort: "name"});
  s = await snap(page);
  check("second sort change is SAME_ROUTE_CHANGE", s.dirs.at(-1), "SAME_ROUTE_CHANGE");
  check("stack still 2 entries", s.routes.length, 2);
  await page.ctx.close();
}

async function t3_revisitIsBack(browser) {
  console.log("\nT3: revisiting an earlier entry traverses BACK, stack retained");
  const page = await fresh(browser);
  await go(page, "/item/1");
  await go(page, "/item/2");
  await go(page, "/item/1"); // already at index 1 — delta -1
  const s = await snap(page);
  check("BACK direction", s.dirs.at(-1), "BACK");
  check("stack retained", s.routes, ["/home", "/item/:id", "/item/:id"]);
  check("index at earlier entry", s.index, 1);
  await page.ctx.close();
}

async function t4_gatedRedirectMidSession(browser) {
  console.log("\nT4: mid-session auth redirect — login replaces the gated attempt, origin retained");
  const page = await fresh(browser);

  await go(page, "/protected"); // unauthed → onmatch redirects to /login with replace
  let s = await snap(page);
  check("landed on /login", s.routes.at(s.index), "/login");
  check("origin retained, no ghost", s.routes, ["/home", "/login"]);
  check("index 1", s.index, 1);

  await page.click('button:has-text("Log in")'); // setRoute /protected {replace:true}
  await page.waitForTimeout(500);
  s = await snap(page);
  check("protected replaces login in same slot", s.routes, ["/home", "/protected"]);
  check("index 1 after swap", s.index, 1);

  await page.goBack();
  await page.waitForTimeout(500);
  s = await snap(page);
  check("back skips login, lands on /home", [s.routes.at(s.index), s.dirs.at(-1)], ["/home", "BACK"]);
  await page.ctx.close();
}

async function t5_gatedDeepLink(browser) {
  console.log("\nT5: cold-start deep link into gated route — replace lands cleanly");
  const page = await fresh(browser, "#!/protected");
  const s = await snap(page);
  check("stack is [/login] only", s.routes, ["/login"]);
  check("index 0", s.index, 0);
  await page.ctx.close();
}

// ─── main ────────────────────────────────────────────────────────────────────

const server = await createServer({
  configFile: false,
  root: resolve(__dirname, "../demo"),
  base: "/m-dot-nav/",
  resolve: {alias: {"m-dot-nav": resolve(__dirname, "../src/m-dot-nav.js")}},
  server: {port: PORT, strictPort: true},
  logLevel: "silent",
});
await server.listen();

const browser = await chromium.launch();
try {
  await t1_bareEntryDefaultRoute(browser);
  await t2_identitySameRouteChange(browser);
  await t3_revisitIsBack(browser);
  await t4_gatedRedirectMidSession(browser);
  await t5_gatedDeepLink(browser);
} finally {
  await browser.close();
  await server.close();
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
