let {DirectionTypes} = mdotnav;

const Layout = () => {

  let bodyClass = b({
    display: "grid",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    "grid-template-columns": "1fr 1fr 1fr",
    "grid-template-rows": "min-content auto min-content",
    margin: 0,
    padding: 0
  })

  document.body.classList.add(bodyClass);

  let _layoutState = {
    inbound: {},
    outbound: {}
  }

  return {
    view: ({attrs, children}) => {
      console.log('Layout::view()', {attrs: attrs, _layoutState: _layoutState})
      let theKey = attrs.transitionState.rcState.key()

      return [
        m('header', {key: 1}),
        m(SectionMain, {key: theKey}, children)
      ]
    },

    oncreate: ({attrs}) => {
      console.log('Layout::oncreate()', {attrs: attrs, _layoutState: _layoutState})

      let {transitionState} = attrs
      transitionState.context = _layoutState

    },
    onupdate: ({attrs}) => {

      console.log('Layout::onupdate()', {attrs: attrs, _layoutState: _layoutState, transitionState: attrs.transitionState})

      let {transitionState} = attrs

      if (transitionState.directionType === DirectionTypes.REDRAW) {
        return
      }
      if (transitionState.directionType === DirectionTypes.SAME_ROUTE) {
        return
      }

      transitionState.context = _layoutState

      Promise.resolve().then(() => {
        console.log('Layout::onupdate()', _layoutState)

        let outboundKey = transitionState.prevRcState.key()
        let inboundKey = transitionState.rcState.key()

        if (!_layoutState[outboundKey]) {
          return
        }

        let {dom: outboundDom, resolver} = _layoutState[outboundKey]['section-main']
        let {dom: inboundDom} = _layoutState[inboundKey]['section-main']

        if (transitionState.anim) {
          transitionState.anim(transitionState)
          return
        }

        if (m.route.get() === '/baz' &&
          transitionState.directionType === DirectionTypes.FORWARD) {
          slideUpIn(transitionState)
          return
        }
        if (m.route.get() === '/bar' &&
          transitionState.directionType === DirectionTypes.BACK) {
          slideDownOut(transitionState)
          return
        }

        // default page transition
        outboundDom.classList.add("ui", "transition", "fade", "out");
        inboundDom.classList.add("ui", "transition", "fade", "in");

        let animEndFired = false
        outboundDom.addEventListener(
          "animationend",
          function ae() {
            console.log("animationend");
            inboundDom.classList.remove("ui", "transition", "fade", "in");
            resolver()
            outboundDom.removeEventListener(
              "animationend",
              ae
            );
            animEndFired = true
          }
        );

        // catch quick click on back button
        setTimeout(() => {
          console.log(outboundKey, outboundDom, resolver, animEndFired)
          if (!animEndFired) resolver()
        }, 400)

      })
    }
  }

  function addLifecycles(name, comp) {

    return Object.assign(comp, {

      oncreate: ({dom, attrs, key}) => {
        console.log('addLifecycles oncreate()', name, attrs)
        _layoutState[key] = {}
        _layoutState[key][name] = {dom: dom}
      },

      onbeforeremove: ({dom, attrs, key}) => {
        console.log('addLifecycles onbeforeremove()', name, attrs)
        return new Promise((resolve) => {
          console.log("addLifecycles onbeforeremove() -- outbound promise", resolve);
          Object.assign(_layoutState[key][name], {
            resolver: () => {
              delete _layoutState[key]
              resolve()
            }
          })
        });
      }

    })
  }

  function SectionMain({attrs: initialAttrs}) {

    let key = {initialAttrs}
    console.log('SectionMain()', initialAttrs)

    let selector = 'section' + b({
      "grid-area": "2 / 1 / 2 / -1",
      height: "100%",
      overflow: 'hidden'
    })

    return addLifecycles('section-main', {
      view: ({attrs, children}) => m(selector, {'data-value-key': attrs.key}, children),
    })
  }
}

function slideUpIn(transitionState) {
  let {context: _layoutState} = transitionState

  let outboundKey = transitionState.prevRcState.key()
  let inboundKey = transitionState.rcState.key()

  let {dom: outboundDom, resolver} = _layoutState[outboundKey]['section-main']
  let {dom: inboundDom} = _layoutState[inboundKey]['section-main']

  let slideUpInClass1 = b({
    transform: "translateY(100%)"
  });
  let slideUpInClass2 = b({
    transition: "transform 300ms",
    transform: "translateY(0)"
  });

  inboundDom.classList.add(slideUpInClass1)

  requestAnimationFrame(() => {
    inboundDom.addEventListener("transitionend", function te(e) {
      if (e.propertyName === "transform") {
        inboundDom.classList.remove(slideUpInClass2)
        inboundDom.style.transform = ""
        inboundDom.removeEventListener("transitionend", te)
        resolver()
      }
    });

    inboundDom.classList.remove(slideUpInClass1)
    inboundDom.classList.add(slideUpInClass2)

  });
}

function slideDownOut(transitionState) {
  let {context: _layoutState} = transitionState

  let outboundKey = transitionState.prevRcState.key()
  let inboundKey = transitionState.rcState.key()

  let {dom: outboundDom, resolver} = _layoutState[outboundKey]['section-main']
  let {dom: inboundDom} = _layoutState[inboundKey]['section-main']

  let slideDownOutClass = b({
    transition: "transform 300ms",
    transform: "translateY(100%)",
    'z-index': 1
  });

  outboundDom.classList.add(slideDownOutClass);
  outboundDom.addEventListener(
    "transitionend",
    function te(e) {
      if (e.propertyName === 'transform') {
        outboundDom.removeEventListener(
          "transitionend",
          te
        );
        resolver()
      }
    }
  );
}

let appState = {
  authed: false
}

m.nav(document.body, '/', {
  "/": {
    view: ({attrs}) => {
      console.log('/::view()', attrs)
      return [
        m('div', {style: 'height:100%; background-color: aliceblue;'}, [
          'hello world via m.nav.init(): ',
          m('div', m(m.route.Link, {href: "/foo?bar=1"}, '/foo')),
          m('div', m(m.route.Link, {href: "/bar"}, '/bar')),
          m('div', m(m.route.Link, {href: "/list"}, '/list')),
          m('div', m(m.route.Link, {href: "/redirect"}, '/redirect')),
          m('div', m(m.route.Link, {href: "/testauth"}, '/testauth')),
          m('div', m(m.route.Link, {href: "/nested"}, '/nested')),
          m('div', m(m.route.Link, {href: "/byid/1"}, '/byid/1'))
        ])
      ]
    }
  },
  "/foo": {
    view: ({attrs}) => {
      console.log('/foo::view()', attrs)
      return [
        m('div', {style: 'height:100%; background-color: antiquewhite;'}, '/foo')
      ]
    }
  },
  "/bar": {
    view: () => {
      return [
        m('div.ui.button', {
          onclick: (e) => {
            e.redraw = false
            m.nav.setRoute('/baz', null, {state: {moo: 'cow'}}, (ts) => {
              console.log(ts)
              slideUpIn(ts)
            })
          }
        }, 'Slide Up In'),
        m('div', {style: 'height:100%; background-color: aqua;'}, '/bar')
      ]
    }
  },
  "/redirect": {
    onmatch: () => {
      m.route.set('/list')
    }
  },
  "/baz": {
    view: () => {
      return [
        m('div.ui.button', {
          onclick: (e) => {
            e.redraw = false
            m.nav.setRoute('/bar', null, {state: {meow: 'cat'}}, (ts) => {
              console.log(ts)
              slideDownOut(ts)
            })
          }
        }, 'Slide Down Out'),
        m('div', {style: 'height:100%; background-color: aquamarine;'}, '/baz')
      ]
    }
  },
  "/list": (function () {

    let listEl = undefined
    let restoreData = {}

    const saveScrollPosition = (e) => {
      let {scrollTop} = listEl;
      console.log('saveScrollPosition', e, {scrollTop: scrollTop})
      Object.assign(restoreData = {scrollTop: scrollTop})
      //e.preventDefault()  // test cancellable
    }

    return {
      onbeforeroutechange: (arg) => {
        console.log('/list::onbeforeroutechange()', arg)
      },
      view: () => {
        return [
          m(
            "div",
            {
              oncreate: ({dom}) => {
                m.nav.addEventListener(
                  "onbeforeroutechange",
                  saveScrollPosition
                );
              },
              onremove: () => {
                m.nav.removeEventListener(
                  "onbeforeroutechange",
                  saveScrollPosition
                );
              }
            },
            "scroll down, nav away and return"
          ),
          m(
            "div",
            {
              oncreate: ({dom}) => {
                listEl = dom
                console.log('restoreData', restoreData)
                if (restoreData.scrollTop) dom.scrollTop = restoreData.scrollTop
              },
              style: "max-height: calc(100% - 19px);overflow:auto;"
            },
            Array.from(Array(40).keys())
              .map((it, i) => i + 1)
              .map(itemid =>
                m(
                  "div.ui.vertical.segment",
                  m(
                    m.route.Link,
                    {href: `/listDetails/${itemid}`},
                    `item ${itemid}`
                  )
                )
              )
          )
        ]
      }
    }
  })(),

  '/listDetails/:id': {
    view: ({attrs}) => [
      m('div', `details for: ${attrs.id}`),
      m('div', "Use brower's back button"),
      m('div', 'or ', m(m.route.Link, {href: '/list'}, 'back'))
    ]
  },
  '/testauth': {
    onmatch: () => {
      if (!appState.authed) {
        appState.loginRedirect = '/testauth'
        m.route.set('/login')
        return
      }
      return {
        view: () => [
          m('div', {style: 'background-color:palegreen'}, 'access to an authd route'),
          m('button', {
            onclick: () => {
              appState.authed = false
              m.route.set('/')
            }
          }, 'logout')
        ]
      }
    }
  },
  '/login': {
    onmatch: () => {
      return {
        view: () => [
          m('div', {style: 'background-color:yellow'}, 'login page'),
          m('button', {
            onclick: () => {
              appState.authed = true
              m.route.set(appState.loginRedirect, null, {replace: true})
            }
          }, 'click to auth')
        ]
      }
    }
  },

  "/byid/:id": {
    render: ({attrs: {id}}) => {
      return [
        m('div', `this is: ${id}` ),
        m(m.route.Link, {href: '/byid/2'}, 'link to 2')
      ]
    }
  },

  "/nested": (function () {
    let layoutComponent = {
      view: ({children}) => [
        m('div', 'sublayout')
      ].concat(children)
    }

    return {
      "": {
        render: () => m(layoutComponent, [
          m('div', 'this is /nested'),
          m('div', m(m.route.Link, {href: "/nested/a"}, '/nested/a')),
          m('div', m(m.route.Link, {href: "/nested/b"}, '/nested/b'))
        ])
      },
      "/a": {render: () => m(layoutComponent, m('div', 'this is /nested/a'))},
      "/b": {render: () => m(layoutComponent, m('div', 'this is /nested/b'))}
    }
  })()

}, {
  layoutComponent: Layout
})
