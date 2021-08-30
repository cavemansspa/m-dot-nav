import {isEqual} from "lodash-es";
import m from 'mithril';

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
    REDRAW: "REDRAW",
    BACK: "BACK",
    FORWARD: "FORWARD"
};

//
// We'll bypass route.set() through m.nav.route.set
//
let origRouteDotSet = m.route.set;
m.route.set = (route, params, options) => {
    console.warn("BYPASS: ", route, params, options);
    m.nav.route.set(route, params, options);
};

let _navstate = {
    flows: {},
    routes: {},
    isMounted: false,
    historyStack: [],
    flattenRoutes: undefined,
    layoutComponent: undefined,

    isRouteChange: false,

    // TODO -- need to implement
    fullStack: [],
    flowStack: [],
    currentFlow: undefined,
    currentFlowName: undefined,

};

function _peek(back = 1) {

    let {historyStack} = _navstate;
    let {length} = historyStack;
    if (!length) return null;
    if (back > length) return null;
    return historyStack[length - Math.abs(back)];
}

function pushOrPop(args, requestedPath, route) {
    console.log("m.nav::pushOrPop() 1", args, requestedPath, route);
    let {historyStack} = _navstate;
    let {length} = historyStack;
    let lastRcState = _peek();
    let nextToLastRcState = _peek(-2) || {};

    let {path: thePath, params: theParams} = m.parsePathname(requestedPath)
    //console.log(thePath, theParams)

    let idObj = {args: args, path: thePath, requestedPath: requestedPath, route: route}
    //console.log('idObj', idObj)

    let newRcState = RouteChangeState({
        onmatchParams: idObj
    })

    //console.log('newRcState', newRcState)

    if (!length) {
        console.log("m.nav::pushOrPop()", "INITIAL ROUTE");
        historyStack.push(newRcState);
        return {directionType: DirectionTypes.INITIAL, rcState: newRcState}
    }

    let foundExisting = _navstate.historyStack.find(it => (
        it.isEqualByPathAndArgs({args: args || {}, path: thePath})
    ))

    if (foundExisting === lastRcState) {
        //debugger;
        console.log("m.nav::pushOrPop()", "SAME ROUTE 0", foundExisting);
        return {directionType: DirectionTypes.SAME_ROUTE, rcState: lastRcState}
    }

    if (foundExisting === nextToLastRcState) {
        console.log("m.nav::pushOrPop()", "GOING BACK ROUTE");
        historyStack.pop();
        _navstate.onMatchCalled = true
        return {directionType: DirectionTypes.BACK, rcState: nextToLastRcState}
    }

    historyStack.push(newRcState);
    _navstate.onMatchCalled = true
    console.log("m.nav::pushOrPop()", "GOING FORWARD ROUTE");
    return {directionType: DirectionTypes.FORWARD, rcState: newRcState}

}


export const RouteChangeState = (config) => {

    if (!config?.onmatchParams) {
        throw new Error('RouteChangeState() -- onmatchParams required')
    }

    let _routeChange = {
        onmatchParams: JSON.parse(JSON.stringify(config.onmatchParams)),
        anim: undefined,
        key: genKey()
    };

    return {
        // _debug: _routeChange.onmatchParams,
        // debug() {
        //     return _routeChange;
        // },

        key() {return _routeChange.key},

        isEqualByPathAndArgs(pathAndParams) {
            let {args, route} = _routeChange.onmatchParams
//             console.log(args, route)
//             console.log(pathAndParams)
            return isEqual({args: args, path: route}, pathAndParams)
        }

    };
};

m.nav = (function () {
    return {

        init(config) {
            console.log("m.nav.init", config);
            if (!config.routes) {
                throw new Error('m.nav.init() -- a routes object is required')
            }

            _navstate.flows = Object.keys(config.flows || {}).reduce((acc, it) => {
                acc[it] = Object.assign({}, config.flows[it], {name: it});
                return acc;
            }, {});

            _navstate.routes = config.routes;
            _navstate.layoutComponent = config.layoutComponent;

            toEnhancedRouteResolvers()
            m.route(config.root || document.body, config.defaultRoute, _navstate.flattenedRouteResolvers);
            _navstate.isMounted = true;
        },

        route: {

            set(route, params, options = {}, anim) {

                // REMINDER: the mithril "popstate" handler hits onmatch() directly bypassing this logic.
                // TODO -- need to implement handling hashchange event

                let lastRcState = _peek() || {};
                let nextToLastRcState = _peek(-2) || {};
                let {historyStack} = _navstate;
                let {length} = historyStack;

                let pathAndArgs = {args: params || {}, path: route};

                let foundExisting = historyStack.find((item) => {
                    return item.isEqualByPathAndArgs(pathAndArgs)
                });

                if (foundExisting === lastRcState) {
                    console.log("m.nav.route.set() -- SAME ROUTE 1", foundExisting);
                    Object.assign(options, {replace: true});
                    origRouteDotSet(route, params, options);
                    return;
                }

                _navstate.anim = anim;

                if (foundExisting === nextToLastRcState) {
                    console.log("m.nav.route.set() -- BACK ROUTE", nextToLastRcState);
                    window.history.back();
                    return;
                }

                origRouteDotSet(route, params, options);
            }
        }
    }
})()

function genKey() {
    return (Math.random() * Math.pow(10, 16)).toFixed(0);
}

// credit @porsager
function flattenRoutes(routes, prefix = "") {
    return Object.keys(routes).reduce((acc, match) => {
        return typeof routes[match] === "function" ||
        routes[match].view ||
        routes[match].onmatch ||
        routes[match].render
            ? {...acc, [prefix + match]: routes[match]}
            : {...acc, ...flattenRoutes(routes[match], prefix + match)};
    }, {});
}

//
// We convert all user defined routes to m.nav custom route resolvers
// This enables us to catch all the navigation details.
// We will pass the transitionState object to the Layout component via attr
function toEnhancedRouteResolvers() {

    _navstate.flattenedRoutes = flattenRoutes(_navstate.routes);
    let {flattenedRoutes} = _navstate;
    _navstate.flattenedRouteResolvers = Object.keys(flattenedRoutes).reduce(
        (accum, routeKey) => {

            // these vars are accessible by onmatch() and render()
            let theUserDefinedRoute = flattenedRoutes[routeKey];
            let currentTransitionState

            accum[routeKey] = (function () {
                let _omValue;

                let enhancedRouteResolver = {
                    //
                    // ONMATCH
                    //
                    onmatch: (args, requestedPath, route) => {
                        //debugger;

                        console.log("m.nav::onmatch()", routeKey, args, requestedPath, route);

                        // TODO -- implement onbeforeroutechange

                        // const omEventBefore = new CustomEvent("onbeforeroutechange", {
                        //     detail: { transitionState: _transitionState, outroute: _peek() }
                        // });
                        // omEventTarget.dispatchEvent(omEventBefore);


                        // let outBound = _peek();
                        // let outBoundRouteResolver =
                        //     outBound && _navstate.flattenedRouteResolvers[outBound.route];
                        // if (
                        //     outBoundRouteResolver?.hasOwnProperty("onbeforeroutechange")
                        // ) {
                        //     outBoundRouteResolver.onbeforeroutechange({
                        //         inbound: {
                        //             args: args,
                        //             requestedPath: requestedPath,
                        //             route: route,
                        //             transitionState: _transitionState
                        //         },
                        //         outbound: _peek()
                        //     });
                        // }
                        //
                        // if (theUserDefinedRoute.hasOwnProperty("onbeforeroutechange")) {
                        //     enhancedRouteResolver.onbeforeroutechange =
                        //         theUserDefinedRoute.onbeforeroutechange;
                        //
                        //     theUserDefinedRoute.onbeforeroutechange({
                        //         inbound: {
                        //             args: args,
                        //             requestedPath: requestedPath,
                        //             route: route,
                        //             transitionState: _transitionState
                        //         },
                        //         outbound: _peek()
                        //     });
                        // }

                        if (theUserDefinedRoute.hasOwnProperty("onmatch")) {
                            // call user defined onmatch()
                            _omValue = theUserDefinedRoute.onmatch(args, requestedPath, route);
                        }
                        if (!_omValue) {
                            //if no onmatch || the user's onmatch returns null, return route's component
                            _omValue = theUserDefinedRoute;
                        }

                        // FYI -- these occur before render()
                        // requestAnimationFrame(() => console.log('onmatch::RAF!!!!', JSON.stringify(transitionState)))
                        // Promise.resolve().then(() => console.log('onmatch::Promise.resolve()!!!!'), JSON.stringify(transitionState))

                        currentTransitionState = pushOrPop(args, requestedPath, route)
                        currentTransitionState.isRouteChange = () => _navstate.onMatchCalled

                        console.log('m.nav::onmatch()', currentTransitionState)

                        return _omValue;

                    },

                    //
                    // RENDER
                    //
                    render: (vnode, attrs) => {
                        console.log("m.nav::render()", routeKey, theUserDefinedRoute, vnode);
                        let {layoutComponent} = _navstate;

                        if (!_navstate.onMatchCalled) {
                            currentTransitionState.directionType = DirectionTypes.REDRAW
                        } else {
                            // need this to reset after layout updates
                            Promise.resolve().then(() => {
                                //console.log("m.nav::render()", "reset onMatchCalled")
                                _navstate.onMatchCalled = false
                            })
                        }
                        let _transitionState = currentTransitionState

                        // If returning a component at route, add installed layout
                        if (!theUserDefinedRoute.hasOwnProperty("render")) {
                            console.log("m.nav::render()", "COMPONENT, ADDING INSTALLED LAYOUT");

                            vnode.attrs.transitionState = _transitionState

                            return m(
                                layoutComponent,
                                {transitionState: _transitionState},
                                m(_omValue, vnode.attrs)
                            );
                        }

                        vnode.attrs.transitionState = _transitionState;
                        let theVnode = theUserDefinedRoute.render(vnode, attrs);

                        // let's user return layout at render()
                        // TODO - maybe remove supporting this?
                        if (theVnode.tag === layoutComponent) {
                            console.warn("m.nav::render()", "Layout not required from route");
                            theVnode.attrs.transitionState = _transitionState;
                            return theVnode;
                        }

                        if (theVnode.hasOwnProperty("items")) {
                            console.log("m.nav::render()", "HAS ITEMS, USING INSTALLED LAYOUT");

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
                            {transitionState: _transitionState},
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

export default m
