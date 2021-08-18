import deepEqual from "deep-equal";
import m from "mithril";

m.cls = (def, separator = " ") => {
  let classes;
  for (const cls in def) {
    if (def[cls]) {
      classes = classes == null ? cls : classes + separator + cls;
    }
  }
  return classes || "";
};

let RouteStates = {
  UNMOUNTED: 0,
  MOUNTED: 1,
  INITIAL_ROUTE: 2
};

export const DirectionTypes = {
  INITIAL: "INITIAL",
  FIRST_NAV: "FIRST NAV",
  SAME_ROUTE: "SAME ROUTE",
  BACK: "BACK",
  FORWARD: "FORWARD"
};

let _navstate = {
  flows: {},
  routes: {},
  isMounted: false,
  currentFlow: undefined,
  currentFlowName: undefined,
  historyStack: [],
  fullStack: [],
  flowStack: [],
  flattenRoutes: undefined,
  layoutComponent: undefined
};

let _transitionState = {
  changeRoute: undefined,
  anim: undefined,
  outboundResolvers: [],
  isPopState: true,
  currentFlowName: undefined
};

//
// We'll bypass route.set() through m.nav.route.set
let origRouteDotSet = m.route.set;
m.route.set = (route, params, options) => {
  console.log("BYPASS: ", route, params, options);
  m.nav.route.set(route, params, options);
};

const snapshot = (obj) => JSON.parse(JSON.stringify(obj || {}));

window.addEventListener("popstate", function (e) {
  console.log("popstate() -- ");
  _transitionState.isPopState = true;
  return true;
});

const omEventTarget = new EventTarget();

// window.addEventListener("hashchange", function (e) {
//   console.log("hashchange() -- ");
//   _transitionState.isPopState = true;
//   return true;
// });

// isPopState is assumed true, i.e. history.back() or history.forward() invoked change.
// when calling m.nav.route.set() we'll explicitly set isPopState false

// m.nav relies on a Layout component as the top level vnode
// which stays in place on redraws.
// route changes replace the Layout component's children
m.nav = (function () {
  return {
    debug() {
      console.log("LOG: ", _navstate);
      return _navstate;
    },

    addEventListener: omEventTarget.addEventListener.bind(omEventTarget),
    removeEventListener: omEventTarget.removeEventListener.bind(omEventTarget),

    link(href) {
      return (e) => {
        e.redraw = false;
        e.preventDefault();
        console.log(`m.nav.link(${href})`);
        m.nav.route.set(href);
      };
    },

    init(config) {
      console.log("m.nav.init", config);
      //_navstate.flows = config.flows;
      _navstate.flows = Object.keys(config.flows).reduce((acc, it) => {
        acc[it] = Object.assign({}, config.flows[it], { name: it });
        return acc;
      }, {});
      _navstate.routes = config.routes;
      _navstate.layoutComponent = config.layoutComponent;
      _transitionState.isPopState = false;
      m.route(document.body, config.defaultRoute, toRouteResolvers());
      _navstate.isMounted = true;
    },

    previousRoute() {
      return _peek(-2)?.args0;
    },

    route: {
      set(route, params, options = {}, anim) {
        if (!_navstate.isMounted) {
          m.route(document.body, route, toRouteResolvers());
          _transitionState.isPopState = false;
          _navstate.isMounted = true;
          return;
        }
        // setting isPopState to false here means it was an
        // explicit route change. i.e. not from history.back(), history.forward()

        // changeRoute true needs to be set true in onmatch
        // standard redraws will skip page transitions logic
        // by checking changeRoute. see layout's oncreate(), onupdate()

        // REMINDER: the mithril "popstate" handler hits onmatch() directly bypassing this logic.
        // TODO -- need to implement handling hashchange event

        let peek = _peek() || {};
        let peek2 = _peek(-2) || {};
        //let { requestedPath: backRequestedPath } = peek;
        let { historyStack } = _navstate;
        let { length } = historyStack;

        let args0 = { params: params || {}, path: route };
        let found = historyStack.find((item) => {
          return deepEqual(item.args0, args0);
        });

        _transitionState.anim = anim;

        //debugger;
        if (found === peek) {
          //debugger;
          console.log("m.nav.route.set() -- FOUND", found);
          window.history.go(0);
          return;
        }
        // per docs history.go(0) reloads, so may need to use commented
        // out block below when hitting same route

        // if (route === backRequestedPath) {
        //   debugger;
        //   console.log("m.nav.route.set() -- SAME ROUTE 1", {
        //     route: route,
        //     backRequestedPath: backRequestedPath
        //   });
        //   Object.assign(options, { replace: true });
        // }

        // if (deepEqual(m.parsePathname(peek.requestedPath), args0)) {
        //   debugger;
        //   console.log("m.nav.route.set() -- SAME ROUTE 2");
        //   Object.assign(options, { replace: true });
        // }

        let { requestedPath: twoBackRequestedPath } = peek2;
        if (route === twoBackRequestedPath) {
          console.log("m.nav.route.set() -- BACK ROUTE", {
            route: route,
            twoBackRequestedPath: twoBackRequestedPath
          });
          //Object.assign(options, { replace: true });
          window.history.back();
          return;
        }

        //_transitionState.changeRoute = true; this is set in onmatch()
        _transitionState.isPopState = false;

        console.log("m.nav.route.set", route, snapshot(_transitionState));
        origRouteDotSet(route, params, options);
      }
    },

    startFlow({ name, position, anim }) {
      _navstate.currentFlowName = name;
      _navstate.currentFlow = _navstate.flows[name];
      _navstate.flowStack.push(_navstate.currentFlow);

      _transitionState.currentFlowName = name;

      if (!_navstate.isMounted) {
        m.route(document.body, "/", toRouteResolvers());
        _navstate.isMounted = true;
        _transitionState.isPopState = false;
        return;
      }

      m.nav.route.set(_navstate.currentFlow.current(), null, null, anim);
    },

    endFlow() {
      let { flowStack } = _navstate;
      flowStack.pop();
      if (flowStack.length === 0) {
        console.warn("no flows in flow");
        return;
      }
      _navstate.currentFlow = flowStack[flowStack.length - 1];
      _navstate.currentFlowName = _navstate.currentFlow.name;
      // TODO -- need to go through histStack to find first
      // entry that's not in the flow that is ending.
      window.history.back();
    },

    next() {
      let { currentFlow } = _navstate;
      //debugger;
      _transitionState.currentFlowName = currentFlow.name;

      let route = currentFlow.next();

      console.log("m.nav.route.next() -- route: ", route);
      if (route) m.nav.route.set(route);
    },

    prev() {
      let { currentFlow } = _navstate;
      _transitionState.currentFlowName = currentFlow.name;

      let route = currentFlow.prev();
      console.log("m.nav.route.prev() -- route: ", route);
      if (route) m.nav.route.set(route);
    }
  };

  function _peek(back = 1) {
    let { historyStack } = _navstate;
    let { length } = historyStack;
    if (!length) return null;
    if (back > length) return null;
    return historyStack[length - Math.abs(back)];
  }

  function genKey() {
    return (Math.random() * Math.pow(10, 16)).toFixed(0);
  }

  function pushOrPop(args, requestedPath, route) {
    //debugger;
    console.log("m.nav::pushOrPop() 1", args, requestedPath, route);
    console.log("m.nav::pushOrPop() 2", snapshot(_transitionState));
    console.log("m.nav::pushOrPop() 3", snapshot(_navstate.historyStack));

    let { historyStack } = _navstate;
    let { length } = historyStack;
    let peek = _peek();
    let outBoundParams = m.route.param(); // this will be the outbound
    let args0 = m.parsePathname(requestedPath);

    let found = historyStack.find((item) => {
      return deepEqual(item.args0, args0);
    });

    if (found === peek) {
      //debugger;
      console.log("m.nav::pushOrPop()", "SAME ROUTE 0");
      _transitionState.directionType = DirectionTypes.SAME_ROUTE;
      return historyStack.length - 1;
    }

    //debugger;
    if (_transitionState.isPopState) {
      let peek2 = _peek(-2) || {};
      let { requestedPath: backRequestedPath } = peek2;

      if (requestedPath === backRequestedPath) {
        console.log("m.nav::pushOrPop()", "POP GOING BACK ROUTE", {
          requestedPath: requestedPath,
          backRequestedPath: backRequestedPath
        });
        _transitionState.directionType = DirectionTypes.BACK;
        return historyStack.pop();
      }

      let { requestedPath: backOneRequestedPath } = peek;
      if (requestedPath === backOneRequestedPath) {
        _transitionState.directionType = DirectionTypes.SAME_ROUTE;
        return historyStack.length - 1;
      }

      console.log("m.nav::pushOrPop()", "POP GOING FORWARD ROUTE", {
        requestedPath: requestedPath,
        backRequestedPath: backRequestedPath
      });
      _transitionState.directionType = DirectionTypes.FORWARD;
      addToFullStack(requestedPath);
      return historyStack.push({
        args0: m.parsePathname(requestedPath),
        //outBoundParams: outBoundParams,
        //args: args,
        requestedPath: requestedPath,
        route: route,
        key: _transitionState.key,
        transitionState: snapshot(_transitionState)
      });
    }

    if (!length) {
      console.log("m.nav::pushOrPop()", "INITIAL ROUTE");
      _transitionState.directionType = DirectionTypes.INITIAL;
      addToFullStack(requestedPath);
      return historyStack.push({
        args0: m.parsePathname(requestedPath),
        //outBoundParams: outBoundParams,
        //args: args,
        requestedPath: requestedPath,
        route: route,
        key: _transitionState.key,
        transitionState: snapshot(_transitionState)
      });
    }

    if (route === peek.route && requestedPath === peek.requestedPath) {
      // TODO should never hit this, handled earlier
      //debugger;
      // It's the same route
      console.log("m.nav::pushOrPop()", "SAME ROUTE");
      _transitionState.directionType = DirectionTypes.SAME_ROUTE;
      return historyStack.length - 1;
    }

    if (length < 2) {
      console.log("m.nav::pushOrPop()", "FIRST ROUTE");
      _transitionState.directionType = DirectionTypes.FIRST_NAV;
      addToFullStack(requestedPath);
      return historyStack.push({
        args0: m.parsePathname(requestedPath),
        //outBoundParams: outBoundParams,
        //args: args,
        requestedPath: requestedPath,
        route: route,
        key: _transitionState.key,
        transitionState: snapshot(_transitionState)
      });
    }

    peek = historyStack[historyStack.length - 2];
    if (route === peek.route && requestedPath === peek.requestedPath) {
      console.log("m.nav::pushOrPop()", "GOING BACK ROUTE");
      _transitionState.directionType = DirectionTypes.BACK;
      historyStack.pop();
    } else {
      console.log("m.nav::pushOrPop()", "GOING FORWARD ROUTE");
      _transitionState.directionType = DirectionTypes.FORWARD;

      addToFullStack(requestedPath);

      historyStack.push({
        args0: m.parsePathname(requestedPath),
        //outBoundParams: outBoundParams,
        //args: args,
        requestedPath: requestedPath,
        route: route,
        key: _transitionState.key,
        transitionState: snapshot(_transitionState)
      });
    }
    return _peek();
  }

  function addToFullStack(requestedPath) {
    let { fullStack } = _navstate;
    let args0 = m.parsePathname(requestedPath);
    let found = fullStack.find((item) => {
      return deepEqual(item.args0, args0);
    });
    if (!found) fullStack.push({ args0: args0 });
  }

  //
  // We convert all user defined routes to m.nav custom route resolvers
  // This enables us to catch all the navigation details.
  // We will pass the transitionState object to the Layout component via attr
  function toRouteResolvers() {
    _navstate.flattenedRoutes = flattenRoutes(_navstate.routes);
    let { flattenedRoutes } = _navstate;
    _navstate.flattenedRouteResolvers = Object.keys(flattenedRoutes).reduce(
      (accum, routeKey) => {
        let theRoute = flattenedRoutes[routeKey];

        accum[routeKey] = (function () {
          let _omValue;

          let enhancedRouteResolver = {
            //
            // ONMATCH
            onmatch: (args, requestedPath, route) => {
              //debugger;

              const omEventBefore = new CustomEvent("onbeforeroutechange", {
                detail: { transitionState: _transitionState, outroute: _peek() }
              });
              omEventTarget.dispatchEvent(omEventBefore);

              _transitionState.changeRoute = true;

              console.log(
                "m.nav::onmatch",
                _transitionState,
                routeKey,
                args,
                requestedPath,
                route
              );

              let outBound = _peek();
              let outBoundRouteResolver =
                outBound && _navstate.flattenedRouteResolvers[outBound.route];
              if (
                outBoundRouteResolver?.hasOwnProperty("onbeforeroutechange")
              ) {
                outBoundRouteResolver.onbeforeroutechange({
                  inbound: {
                    args: args,
                    requestedPath: requestedPath,
                    route: route,
                    transitionState: _transitionState
                  },
                  outbound: _peek()
                });
              }

              if (theRoute.hasOwnProperty("onbeforeroutechange")) {
                enhancedRouteResolver.onbeforeroutechange =
                  theRoute.onbeforeroutechange;

                theRoute.onbeforeroutechange({
                  inbound: {
                    args: args,
                    requestedPath: requestedPath,
                    route: route,
                    transitionState: _transitionState
                  },
                  outbound: _peek()
                });
              }

              if (theRoute.hasOwnProperty("onmatch")) {
                // call user defined onmatch()
                _omValue = theRoute.onmatch(args, requestedPath, route);
              }
              if (!_omValue) {
                //if no onmatch || the user's onmatch retuns null, return route's component
                _omValue = theRoute;
              }

              let currentKey = _transitionState.key;
              _transitionState.key = genKey();

              pushOrPop(args, requestedPath, route);

              if (
                _transitionState.directionType === DirectionTypes.SAME_ROUTE
              ) {
                _transitionState.key = currentKey;
                _transitionState.changeRoute = false;
              }

              if (_navstate.routeState === RouteStates.MOUNTED) {
                _navstate.routeState = RouteStates.INITIAL_ROUTE;
              }

              // We need complete() to be called
              // by the layout component when
              // page transitions have completed.
              _transitionState.complete = () => {
                console.log("m.nav::complete() -- Resetting transitionState");

                _transitionState.changeRoute = undefined;
                _transitionState.isRedir = false;
                _transitionState.isPopState = true;
                _transitionState.outboundResolvers.forEach((it) => it());
                _transitionState.outboundResolvers = [];
                _transitionState.anim = undefined;
              };

              // FYI -- these occur before render()
              // requestAnimationFrame(() => console.log('onmatch::RAF!!!!', JSON.stringify(transitionState)))
              // Promise.resolve().then(() => console.log('onmatch::Promise.resolve()!!!!'), JSON.stringify(transitionState))

              return _omValue;
            },

            render: (vnode, attrs) => {
              console.log("m.nav::render()", routeKey, theRoute, vnode);
              let { layoutComponent } = _navstate;

              // If returning a component at route, add installed layout
              if (!theRoute.hasOwnProperty("render")) {
                // debugger;
                console.log(
                  "m.nav::render()",
                  "COMPONENT, ADDING INSTALLED LAYOUT"
                );
                // We need the complete() function to be called
                // by the component.
                // Current solution is to call completer() in oncreate() of component
                // TODO -- look into making the complete() call
                // more transparent in this use case
                vnode.attrs.transitionState = _transitionState;

                return m(
                  layoutComponent,
                  { transitionState: _transitionState },
                  m(_omValue, vnode.attrs)
                );
              }

              // we make a snapshot in pushOrPop
              // Or pass a promise in transitionState for user to call
              // when tranistion is complete
              // Promise.resolve().then(() => {
              //   console.log(
              //     "resetting _transitionState 1",
              //     snapshot(_transitionState)
              //   );

              //   //_transitionState.changeRoute = false;
              //   //_transitionState.isPopState = true;
              //   //_transitionState.currentFlowName = undefined;

              //   //_transitionState.complete();

              //   console.log(
              //     "resetting _transitionState 1",
              //     snapshot(_transitionState)
              //   );
              // });

              vnode.attrs.transitionState = _transitionState;
              let theVnode = theRoute.render(vnode, attrs);

              // let's user return layout at render()
              // TODO - maybe remove supporting this
              if (theVnode.tag === layoutComponent) {
                console.warn(
                  "m.nav::render()",
                  "Layout not required from route"
                );
                theVnode.attrs.transitionState = _transitionState;
                return theVnode;
              }

              if (theVnode.hasOwnProperty("items")) {
                console.log(
                  "m.nav::render()",
                  "HAS ITEMS, USING INSTALLED LAYOUT"
                );

                return m(layoutComponent, {
                  cls: theVnode.cls,
                  layout: theVnode.layout,
                  items: theVnode.items,
                  transitionState: _transitionState
                });
              }

              // implicit layout, user does not return as root of their render() output.
              // called layout component will need to know to handle vnode via children param.
              console.log("m.nav::render()", "USING INSTALLED LAYOUT");
              return m(
                layoutComponent,
                { transitionState: _transitionState },
                theVnode
              );
            }
          };

          return enhancedRouteResolver;
        })();
        return accum;
      },
      {}
    );

    return _navstate.flattenedRouteResolvers;
  }
})();

// credit @porsager
function flattenRoutes(routes, prefix = "") {
  return Object.keys(routes).reduce(
    (acc, match) =>
      routes[match].view || routes[match].onmatch || routes[match].render
        ? { ...acc, [prefix + match]: routes[match] }
        : { ...acc, ...flattenRoutes(routes[match], prefix + match) },
    {}
  );
}

//
// flowitem
export const flowitem = (config) => {
  return {
    path: config.path,
    show() {}
  };
};

//
// flow
export const flow = (config) => {
  let _flowstate = {
    name: config.name,
    flowitems: config.flowitems,
    currentRoute: 0
  };

  return {
    get name() {
      return _flowstate.name;
    },

    next() {
      if (_flowstate.currentRoute === _flowstate.flowitems.length - 1) {
        console.warn("next() -- no more steps");
        return;
      }
      _flowstate.currentRoute++;
      let current = _flowstate.flowitems[_flowstate.currentRoute];
      return typeof current.path === "function" ? current.path() : current.path;
    },

    prev() {
      if (_flowstate.currentRoute - 1 < 0) {
        console.warn("prev() -- no more steps");
        return;
      }
      _flowstate.currentRoute--;
      let current = _flowstate.flowitems[_flowstate.currentRoute];
      return typeof current.path === "function" ? current.path() : current.path;
    },

    current() {
      let current = _flowstate.flowitems[_flowstate.currentRoute];
      return typeof current.path === "function" ? current.path() : current.path;
    }
  };
};
