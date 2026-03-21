import m from "mithril";
import { createMobileLayout, DirectionTypes } from "m-dot-nav";
import { artists, getArtist, getAlbum, getAlbumArtist, searchAll } from "./data.js";

// ── Logger ────────────────────────────────────────────────────────────────────

const LOG = true;
const log = {
  nav:    (...args) => LOG && console.log("%c[nav]",    "color:#ff6b35;font-weight:bold", ...args),
  player: (...args) => LOG && console.log("%c[player]", "color:#a8e6cf;font-weight:bold", ...args),
  anim:   (...args) => LOG && console.log("%c[anim]",   "color:#d4a5f5;font-weight:bold", ...args),
  route:  (...args) => LOG && console.log("%c[route]",  "color:#7eb8f7;font-weight:bold", ...args),
};

// ── Player state ──────────────────────────────────────────────────────────────

const Player = (() => {
  let current = null;
  let playing  = false;

  return {
    get current() { return current; },
    get playing()  { return playing; },
    play(track, artist, album) {
      log.player("play", track.title, artist.name);
      current = { track, artist, album };
      playing = true;
      m.redraw();
    },
    toggle() { playing = !playing; m.redraw(); },
  };
})();

// ── Now Playing Overlay ───────────────────────────────────────────────────────
//
// Now Playing is NOT a route — it's a fixed overlay that slides up over
// whatever page is currently active. Opening/closing it doesn't touch
// the history stack at all.

const NowPlayingOverlay = (() => {
  let visible = false;
  let _dom    = null;

  function animateIn(dom) {
    dom.style.transform = "translateY(100%)";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      dom.style.transition = "transform 320ms cubic-bezier(0.32,0.72,0,1)";
      dom.style.transform  = "translateY(0)";
      dom.addEventListener("transitionend", function te(e) {
        if (e.propertyName !== "transform") return;
        dom.removeEventListener("transitionend", te);
        dom.style.transition = "";
      });
    }));
  }

  function animateOut(dom, done) {
    dom.style.transition = "transform 320ms cubic-bezier(0.32,0.72,0,1)";
    dom.style.transform  = "translateY(100%)";
    dom.addEventListener("transitionend", function te(e) {
      if (e.propertyName !== "transform") return;
      dom.removeEventListener("transitionend", te);
      done();
    });
    setTimeout(done, 400); // safety fallback
  }

  return {
    get visible() { return visible; },
    open() {
      visible = true;
      m.redraw();
    },
    close() {
      if (!_dom) { visible = false; m.redraw(); return; }
      animateOut(_dom, () => {
        visible = false;
        m.redraw();
      });
    },
    setDom(dom) { _dom = dom; },
    onCreated(dom) {
      _dom = dom;
      animateIn(dom);
    },
  };
})();

// ── Layout ────────────────────────────────────────────────────────────────────

const TAB_ROOTS = ["/library", "/browse", "/radio", "/search"];

const MobileLayout = createMobileLayout({
  tabRoots:     TAB_ROOTS,
  duration:     280,
  fadeDuration: 160,
});

const tabs = [
  { id: "library",  icon: "♪", label: "Library",  route: "/library"  },
  { id: "browse",   icon: "◈", label: "Browse",   route: "/browse"   },
  { id: "radio",    icon: "◉", label: "Radio",    route: "/radio"    },
  { id: "search",   icon: "⌕", label: "Search",   route: "/search"   },
];

function activeTab() {
  const r = m.route.get() ?? "";
  if (r.startsWith("/library"))  return "library";
  if (r.startsWith("/browse"))   return "browse";
  if (r.startsWith("/radio"))    return "radio";
  if (r.startsWith("/search"))   return "search";
  return "library";
}

function isDeepRoute() {
  const r = m.route.get() ?? "";
  return r.startsWith("/library/");
}

// Scroll position restore for list views
const scrollStore = {};

const AppLayout = {
  view({ attrs, children }) {
    const ts   = attrs.transitionState;
    const deep = isDeepRoute();

    return m("div", { style: "height:100%; display:flex; flex-direction:column;" }, [

      // Top nav
      m("div.top-nav", [
        deep
          ? m("button.back-btn", { onclick: () => history.back() }, ["‹ ", "Back"])
          : m("div", { style: "font-family:'Syne',sans-serif; font-size:18px; font-weight:800; letter-spacing:-0.5px;" }, "Wavelength"),
        deep && m("div.title", ts?.rcState?.onmatchParams?.title ?? ""),
      ]),

      // Page content
      m("div.page-area", [
        m(MobileLayout, { transitionState: ts }, children),
      ]),

      // Mini player
      m("div.mini-player", {
        class: !Player.current ? "hidden" : "",
        onclick: () => {
          log.nav("mini-player tap");
          NowPlayingOverlay.open();
        },
      }, Player.current ? [
        m("div.track-color", { style: `background:${Player.current.artist.color}` }, "♪"),
        m("div.track-info", [
          m("div.track-title", Player.current.track.title),
          m("div.track-artist", Player.current.artist.name),
        ]),
        m("div.controls", [
          m("button.ctrl-btn", {
            onclick: (e) => { e.stopPropagation(); Player.toggle(); }
          }, Player.playing ? "⏸" : "▶"),
          m("button.ctrl-btn", {
            onclick: (e) => { e.stopPropagation(); }
          }, "⏭"),
        ]),
      ] : null),

      // Tab bar
      m("div.tab-bar",
        tabs.map(tab =>
          m("button.tab-btn", {
            class: m.cls({ active: activeTab() === tab.id }),
            onclick: () => m.nav.setRoute(tab.route),
          }, [
            m("span.tab-icon", tab.icon),
            m("span", tab.label),
          ])
        )
      ),

      // Now Playing overlay — fixed, slides up over everything
      NowPlayingOverlay.visible && m(NowPlayingView),
    ]);
  }
};

// ── Pages ─────────────────────────────────────────────────────────────────────

const Library = {
  onmatch(args, path, route, nav) {
    if (nav.isBack && scrollStore["/library"]) {
      // scroll restore handled in oncreate
    }
  },
  view() {
    return m("div.page", {
      oncreate({ dom }) {
        if (scrollStore["/library"]) dom.scrollTop = scrollStore["/library"];
      },
      onbeforeremove({ dom }) {
        scrollStore["/library"] = dom.scrollTop;
        return Promise.resolve();
      }
    }, [
      m("div.page-header", [
        m("h1", "Library"),
        m("div.subtitle", `${artists.length} artists`),
      ]),
      m("div.artist-list",
        artists.map(artist =>
          m("div.artist-item", {
            onclick: () => m.nav.setRoute(`/library/artist/${artist.id}`),
          }, [
            m("div.artist-avatar", { style: `background:${artist.color}` },
              artist.name[0]
            ),
            m("div.artist-info", [
              m("div.artist-name", artist.name),
              m("div.artist-genre", artist.genre),
            ]),
            m("span.artist-chevron", "›"),
          ])
        )
      ),
    ]);
  }
};

const ArtistDetail = {
  getIdentity({ args }) { return `/library/artist/${args.id}`; },
  view({ attrs }) {
    const artist = getArtist(attrs.id);
    if (!artist) return m("div.page", m("div.empty-state", "Artist not found"));
    return m("div.page", [
      m("div.artist-hero", [
        m("div.artist-hero-avatar", { style: `background:${artist.color}` }, artist.name[0]),
        m("div.artist-hero-info", [
          m("h2", artist.name),
          m("div.genre", artist.genre),
        ]),
      ]),
      m("div.section-title", "Albums"),
      m("div.album-grid",
        artist.albums.map(album =>
          m("div.album-card", {
            onclick: () => m.nav.setRoute(`/library/album/${album.id}`),
          }, [
            m("div.album-art", { style: `background:${artist.color}30; color:${artist.color}` }, "⬡"),
            m("div.album-info", [
              m("div.album-title", album.title),
              m("div.album-year", album.year),
              m("div.album-tracks", `${album.tracks.length} tracks`),
            ]),
          ])
        )
      ),
    ]);
  }
};

const AlbumDetail = {
  getIdentity({ args }) { return `/library/album/${args.id}`; },
  view({ attrs }) {
    const album  = getAlbum(attrs.id);
    const artist = getAlbumArtist(attrs.id);
    if (!album || !artist) return m("div.page", m("div.empty-state", "Album not found"));
    return m("div.page", [
      m("div.album-hero", [
        m("div.album-hero-art", { style: `background:${artist.color}30; color:${artist.color}` }, "⬡"),
        m("div.album-hero-info", [
          m("h2", album.title),
          m("div.artist-link", {
            onclick: () => m.nav.setRoute(`/library/artist/${artist.id}`)
          }, artist.name),
          m("div.year", album.year),
        ]),
      ]),
      m("div.track-list",
        album.tracks.map((track, i) => {
          const isPlaying = Player.current?.track.id === track.id;
          return m("div.track-item", {
            onclick: () => Player.play(track, artist, album),
          }, [
            m("div.track-num", { class: m.cls({ playing: isPlaying }) },
              isPlaying ? "♪" : i + 1
            ),
            m("div.track-title-text", { class: m.cls({ playing: isPlaying }) }, track.title),
            m("div.track-dur", track.duration),
          ]);
        })
      ),
    ]);
  }
};

// NowPlayingView — fixed overlay, not a route
const NowPlayingView = {
  oncreate({ dom }) {
    NowPlayingOverlay.onCreated(dom);
  },
  view() {
    const { track, artist, album } = Player.current ?? {};
    if (!track) return null;
    return m("div", {
      style: "position:absolute; inset:0; background:var(--bg); z-index:100; overflow:hidden;"
    }, [
      m("div.now-playing-page", [
        m("button.np-close", {
          onclick: () => {
            log.nav("now-playing close");
            NowPlayingOverlay.close();
          }
        }, "⌄"),
        m("div.np-art", { style: `background:${artist.color}20; color:${artist.color}` }, "⬡"),
        m("div.np-info", [
          m("div.np-title", track.title),
          m("div.np-artist", `${artist.name} · ${album.title}`),
        ]),
        m("div.np-progress", [
          m("div.np-bar", m("div.np-bar-fill")),
          m("div.np-times", [m("span", "1:28"), m("span", track.duration)]),
        ]),
        m("div.np-controls", [
          m("button.np-ctrl", "⇄"),
          m("button.np-ctrl", "⏮"),
          m("button.np-play", {
            onclick: () => Player.toggle()
          }, Player.playing ? "⏸" : "▶"),
          m("button.np-ctrl", "⏭"),
          m("button.np-ctrl", "↻"),
        ]),
      ]),
    ]);
  }
};

const Browse = {
  view() {
    const cards = [
      { title: "New Releases",    sub: "Fresh drops",         color: "#ff6b35", emoji: "✦" },
      { title: "Synthwave",       sub: "Neon & chrome",       color: "#7eb8f7", emoji: "⚡" },
      { title: "Lo-fi Chill",     sub: "Study & relax",       color: "#a8e6cf", emoji: "☕" },
      { title: "Post-Rock",       sub: "Epic journeys",       color: "#d4a5f5", emoji: "◈" },
      { title: "Dream Pop",       sub: "Soft & hazy",         color: "#f7c59f", emoji: "◌" },
      { title: "Heavy Rotation",  sub: "Everyone's listening", color: "#e8a0bf", emoji: "↺" },
    ];
    return m("div.page", [
      m("div.page-header", [
        m("h1", "Browse"),
        m("div.subtitle", "Discover something new"),
      ]),
      m("div.browse-grid",
        cards.map(c =>
          m("div.browse-card", { style: `background:${c.color}22; border:1px solid ${c.color}44;` }, [
            m("div", { style: `font-size:32px; position:absolute; top:12px; right:12px; opacity:0.3;` }, c.emoji),
            m("div.browse-card-title", c.title),
            m("div.browse-card-sub", c.sub),
          ])
        )
      ),
    ]);
  }
};

const Radio = {
  view() {
    const stations = [
      { name: "Neon FM",        desc: "24/7 synthwave",     color: "#ff6b35", icon: "◉" },
      { name: "Chill Waves",    desc: "Lo-fi hip hop",      color: "#7eb8f7", icon: "◉" },
      { name: "Post Meridiem",  desc: "Post-rock & ambient", color: "#a8e6cf", icon: "◉" },
      { name: "Dream Station",  desc: "Dream pop & shoegaze", color: "#d4a5f5", icon: "◉" },
      { name: "Deep Cuts",      desc: "Underground & rare",  color: "#f7c59f", icon: "◉" },
    ];
    return m("div.page", [
      m("div.page-header", [
        m("h1", "Radio"),
        m("div.subtitle", "Always on"),
      ]),
      m("div.radio-list",
        stations.map(s =>
          m("div.radio-item", {
            onclick: () => {
              // play a random track as the "station"
              const allArtists = artists;
              const artist = allArtists[Math.floor(Math.random() * allArtists.length)];
              const album  = artist.albums[0];
              const track  = album.tracks[0];
              Player.play(track, artist, album);
            }
          }, [
            m("div.radio-icon", { style: `background:${s.color}22; color:${s.color}` }, s.icon),
            m("div.radio-info", [
              m("div.radio-name", s.name),
              m("div.radio-desc", s.desc),
            ]),
            m("span", { style: "color:var(--muted); font-size:16px;" }, "›"),
          ])
        )
      ),
    ]);
  }
};

const Search = (() => {
  let query = "";
  let results = null;

  return {
    onmatch(args, path, route, nav) {
      if (!nav.isSameRouteChange) {
        query = "";
        results = null;
      }
    },
    view() {
      return m("div.page", [
        m("div.search-bar", [
          m("span.search-icon", "⌕"),
          m("input", {
            type: "text",
            placeholder: "Artists, songs, albums...",
            value: query,
            autofocus: true,
            oninput(e) {
              query = e.target.value;
              results = query.length > 1 ? searchAll(query) : null;
            }
          }),
          query && m("span", {
            style: "color:var(--muted); cursor:pointer; font-size:14px;",
            onclick: () => { query = ""; results = null; }
          }, "✕"),
        ]),

        !results && m("div", [
          m("div.page-header", [m("h1", "Search"), m("div.subtitle", "Find anything")]),
        ]),

        results && [
          results.artists.length > 0 && [
            m("div.search-section-title", "Artists"),
            results.artists.map(a =>
              m("div.search-result", {
                onclick: () => m.nav.setRoute(`/library/artist/${a.id}`)
              }, [
                m("div.search-result-icon", { style: `background:${a.color}22; color:${a.color}` }, a.name[0]),
                m("div.search-result-info", [
                  m("div.search-result-title", a.name),
                  m("div.search-result-sub", a.genre),
                ]),
              ])
            ),
          ],
          results.albums.length > 0 && [
            m("div.search-section-title", "Albums"),
            results.albums.map(al =>
              m("div.search-result", {
                onclick: () => m.nav.setRoute(`/library/album/${al.id}`)
              }, [
                m("div.search-result-icon", { style: `background:${al.artist.color}22; color:${al.artist.color}` }, "⬡"),
                m("div.search-result-info", [
                  m("div.search-result-title", al.title),
                  m("div.search-result-sub", al.artist.name),
                ]),
              ])
            ),
          ],
          results.tracks.length > 0 && [
            m("div.search-section-title", "Tracks"),
            results.tracks.map(t =>
              m("div.search-result", {
                onclick: () => Player.play(t, t.artist, t.album)
              }, [
                m("div.search-result-icon", { style: `background:${t.artist.color}22; color:${t.artist.color}` }, "♪"),
                m("div.search-result-info", [
                  m("div.search-result-title", t.title),
                  m("div.search-result-sub", `${t.artist.name} · ${t.album.title}`),
                ]),
              ])
            ),
          ],
          !results.artists.length && !results.albums.length && !results.tracks.length &&
          m("div.empty-state", [m("div.icon", "⌕"), m("div", `No results for "${query}"`)]),
        ],
      ]);
    }
  };
})();

// ── Boot ──────────────────────────────────────────────────────────────────────

m.nav(document.getElementById("app"), "/library", {
  "/library":                Library,
  "/library/artist/:id":     ArtistDetail,
  "/library/album/:id":      AlbumDetail,
  "/browse":                 Browse,
  "/radio":                  Radio,
  "/search":                 Search,
}, {
  layoutComponent: AppLayout,
});