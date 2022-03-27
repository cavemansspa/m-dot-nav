import {isEqual} from "lodash-es";
import m from 'mithril';

window.m = m

m.cls = (def, separator = " ") => {
    let classes;
    for (const cls in def) {
        if (def[cls]) {
            classes = classes == null ? cls : classes + separator + cls;
        }
    }
    return classes || "";
};

const RouteStates = {
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
    FORWARD: "FORWARD",
    EXISTING_ROUTE: "EXISTING_ROUTE"
};

//
// We'll bypass route.set() through m.nav.route.set
//
let origRouteDotSet = m.route.set;
m.route.set = (route, params, options) => {
    console.warn("BYPASS: ", route, params, options);
    m.nav.setRoute(route, params, options);
};

let _navstate = {
    flows: {},
    routes: {},
    isMounted: false,
    historyStack: [],
    flattenRoutes: undefined,
    layoutComponent: undefined,

    isSkipping: false,
    isRouteChange: false,
    onmatchCalledCount: 0,
    currentIndex: 0,

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
    console.log("m.nav::pushOrPop()", {args: args, requestedPath: requestedPath, route: route});

    let {historyStack} = _navstate;
    let {length} = historyStack;
    let lastRcState = _peek();
    let nextToLastRcState = _peek(-2) || {};

    let {path: thePath, params: theParams} = m.parsePathname(requestedPath)
    console.log("m.nav::pushOrPop() -- start: ", {args: args, params: theParams});

    let idObj = {args: theParams, path: thePath, requestedPath: requestedPath, route: route}
    console.log("m.nav::pushOrPop() -- idObj: ", idObj);

    let newRcState = RouteChangeState({
        onmatchParams: idObj
    })

    if (!length) {
        console.log("m.nav::pushOrPop()", "INITIAL ROUTE");
        historyStack.push(newRcState);
        return {directionType: DirectionTypes.INITIAL, rcState: newRcState}
    }

    let foundExisting = _navstate.historyStack.find(it => (
        it.isEqualByPathAndArgs({args: args || {}, path: thePath})
    ))

    let existingIndex = historyStack.indexOf(foundExisting)
    if (foundExisting?.isEqualByPathAndArgs({path: thePath, args: theParams})) {

        let back = (length - (1 + existingIndex)) * -1
        back = existingIndex - _navstate.currentIndex
        console.log("m.nav::pushOrPop()", "FOUND EXISTING ROUTE", {back: back}, foundExisting);
        _navstate.onMatchCalled = true

        if(back === 0) {
            console.log("m.nav::pushOrPop()", "SAME ROUTE 0", foundExisting);
            _navstate.currentIndex = existingIndex
            return {directionType: DirectionTypes.SAME_ROUTE, rcState: lastRcState}
        }

        if(back === -1) {
            _navstate.currentIndex = existingIndex
            console.log("m.nav::pushOrPop()", "EXISTING GOING BACK ROUTE");
            historyStack.pop()
            return {directionType: DirectionTypes.BACK, rcState: nextToLastRcState, prevRcState: lastRcState}
        }

        if(back === 1) {
            _navstate.currentIndex = existingIndex
            console.log("m.nav::pushOrPop()", "EXISTING GOING FORWARD ROUTE");
            return {directionType: DirectionTypes.FORWARD, rcState: nextToLastRcState, prevRcState: lastRcState}
        }

        if(back < 0) {
            for(let i = back; i < 0; i++) {
                console.log("m.nav::pushOrPop()", "popping", i);
                historyStack.pop()
            }
        }
        _navstate.currentIndex = existingIndex
        return {directionType: DirectionTypes.EXISTING_ROUTE, back: back, rcState: newRcState}
    }

    _navstate.currentIndex++
    historyStack.push(newRcState);
    _navstate.onMatchCalled = true
    console.log("m.nav::pushOrPop()", "GOING FORWARD ROUTE", _navstate.currentIndex);
    return {directionType: DirectionTypes.FORWARD, rcState: newRcState, prevRcState: lastRcState}

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
        debug() {
            return _routeChange;
        },

        get onmatchParams() {
            return _routeChange.onmatchParams
        },

        key() {
            return _routeChange.key
        },

        isEqualByPathAndArgs(pathAndParams) {
            let {args, route} = _routeChange.onmatchParams
//             console.log(args, route)
//             console.log(pathAndParams)
            return isEqual({args: args || {}, path: route}, pathAndParams)
        }

    };
};

window.addEventListener("popstate", function (e) {
    console.log("m.nav()::popstate() -- ", e);
});
window.addEventListener("hashchange", function (e) {
    console.log("m.nav()::hashchange() -- ", e);
});

const omEventTarget = new EventTarget();

m.nav = (function () {

    let _nav = function (root, defaultRoute, routes, config) {
        console.log("m.nav()", root, defaultRoute, routes, config);
        if (!routes) {
            throw new Error('m.nav() -- a routes object is required.')
        }
        if (!config?.layoutComponent) {
            throw new Error('m.nav() -- a layout component is required.')
        }

        _navstate.flows = Object.keys(config.flows || {}).reduce((acc, it) => {
            acc[it] = Object.assign({}, config.flows[it], {name: it});
            return acc;
        }, {});

        _navstate.routes = routes;
        _navstate.layoutComponent = config.layoutComponent;

        toEnhancedRouteResolvers()
        m.route(root || document.body, defaultRoute, _navstate.flattenedRouteResolvers);
        _navstate.isMounted = true;
    }

    Object.assign(_nav, {

        debug() {
            return _navstate
        },

        addEventListener: omEventTarget.addEventListener.bind(omEventTarget),
        removeEventListener: omEventTarget.removeEventListener.bind(omEventTarget),

        setRoute(route, params, options = {}, anim) {
            console.log('m.nav.setRoute()', route, params, options, anim)

            // REMINDER: the mithril "popstate" handler hits onmatch() directly bypassing this logic.
            // TODO -- need to implement handling hashchange event

            let lastRcState = _peek() || {};
            let nextToLastRcState = _peek(-2) || {};
            let {historyStack} = _navstate;

            // normalizedParams -- converts e.g. {a: 1} to {a: "1"} to support consistent find by path and args.
            let {params: normalizedParams} = m.parsePathname(m.buildPathname('/fake', params))
            let pathAndArgs = {args: normalizedParams || {}, path: route};

            let foundExisting = historyStack.find((item) => {
                return item.isEqualByPathAndArgs(pathAndArgs)
            });

            let existingIndex = historyStack.indexOf(foundExisting)
            if (_navstate.currentIndex === existingIndex) {
                console.log("m.nav.setRoute() -- SAME ROUTE 1", foundExisting);
                Object.assign(options, {replace: true});
                origRouteDotSet(route, params, options);
                return;
            }

            if (foundExisting?.isEqualByPathAndArgs(pathAndArgs)) {
                let back = (historyStack.length - (1 + historyStack.indexOf(foundExisting))) * -1
                back = existingIndex - _navstate.currentIndex
                console.log("m.nav.setRoute()", "FOUND EXISTING ROUTE", back, foundExisting);
                if(back < 0) {
                    history.go(back)
                    return
                }
            }

            _navstate.anim = anim;

            origRouteDotSet(route, params, options);
        }
    })

    return _nav

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

            accum[routeKey] = (function () {

                // these vars are accessible by onmatch() and render() scoped per routeKey
                let theUserDefinedRoute = flattenedRoutes[routeKey];
                let currentTransitionState
                let _omValue;

                let enhancedRouteResolver = {

                    //
                    // ONMATCH
                    //
                    onmatch: (args, requestedPath, route) => {

                        console.log("m.nav::onmatch()", routeKey, args, requestedPath, route);

                        // if user's onmatch calls new route, remove the last route from stack
                        // as it has effectively been skipped.
                        if (_navstate.onmatchCalledCount > 0) {
                            console.log("m.nav::onmatch() -- redirect encountered", routeKey, args, requestedPath, route);
                            _navstate.historyStack.pop()
                            _navstate.currentIndex--
                        }

                        // accounts for m.route.sets() in users onmatch()
                        // mithrils router can potentially call onmatch() several times then render()
                        _navstate.onmatchCalledCount++

                        let outboundRcState = _peek();
                        let outBoundRouteResolver =
                            outboundRcState && _navstate.flattenedRouteResolvers[outboundRcState.onmatchParams.route];

                        if (outBoundRouteResolver?.hasOwnProperty("onbeforeroutechange")) {

                            let {path: thePath, params: theParams} = m.parsePathname(requestedPath)
                            let idObj = {args: theParams, path: thePath, requestedPath: requestedPath, route: route}

                            outBoundRouteResolver.onbeforeroutechange({
                                lastTransitionState: currentTransitionState,
                                inbound: RouteChangeState({
                                    onmatchParams: idObj
                                }),
                                outbound: outboundRcState
                            });
                        }

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
                        currentTransitionState.context = {}

                        //
                        // dispatch onbeforeroutechange event
                        //
                        const omEventBefore = new CustomEvent("onbeforeroutechange", {
                            cancelable: true,
                            detail: {transitionState: currentTransitionState, outbound: outboundRcState}
                        });
                        let dispatchResult = omEventTarget.dispatchEvent(omEventBefore);

                        // TODO -- first attempt at supporting cancellation of a route change.
                        /*

                        if (!_navstate.isSkipping) {
                            const omEventBefore = new CustomEvent("onbeforeroutechange", {
                                cancelable: true,
                                detail: {transitionState: currentTransitionState, outbound: outbound}
                            });

                            let dispatchResult = omEventTarget.dispatchEvent(omEventBefore);
                            console.log('m.nav::onmatch() dispatchResult', {dispatchResult: dispatchResult})

                            if (!dispatchResult) {
                                _navstate.isSkipping = true
                                let {onmatchParams} = outbound.debug()
                                console.log('m.nav::onmatch() onmatchParams', {onmatchParams: onmatchParams})

                                m.route.set(onmatchParams.path, onmatchParams.data, {replace: true})
                            } else {
                                currentTransitionState = pushOrPop(args, requestedPath, route)
                                currentTransitionState.isRouteChange = () => _navstate.onMatchCalled
                                currentTransitionState.context = {}
                            }

                        } else {
                            console.log('m.nav::onmatch() SKIPPING')
                            currentTransitionState = {directionType: DirectionTypes.SAME_ROUTE, rcState: outbound}
                            currentTransitionState.isRouteChange = () => _navstate.onMatchCalled
                            currentTransitionState.context = {}

                        }

                        */

                        //

                        console.log('m.nav::onmatch() end', {
                            _omValue: _omValue,
                            currentTransitionState: currentTransitionState
                        })

                        return _omValue;

                    },

                    //
                    // RENDER
                    //
                    render: (vnode) => {
                        console.log("m.nav::render()", routeKey, theUserDefinedRoute, vnode);


                        let {layoutComponent} = _navstate;

                        if (!_navstate.onMatchCalledCount) {
                            currentTransitionState.directionType = DirectionTypes.REDRAW
                        } else {
                            // reset to defaults after layout updates
                            Promise.resolve().then(() => {
                                //console.log("m.nav::render()", "reset onMatchCalled")
                                _navstate.isSkipping = false
                                _navstate.onMatchCalled = false
                                _navstate.anim = undefined
                            })
                        }
                        // reset
                        _navstate.onmatchCalledCount = 0

                        if (_navstate.anim) {
                            currentTransitionState.anim = _navstate.anim
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
                        let theVnode = theUserDefinedRoute.render(vnode);

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

                // Install the user defined "onbeforeroutechange" handler
                if (theUserDefinedRoute.hasOwnProperty("onbeforeroutechange")) {
                    enhancedRouteResolver.onbeforeroutechange = theUserDefinedRoute.onbeforeroutechange;
                }

                return enhancedRouteResolver;

            })();

            return accum;

        },
        {}
    );

    return _navstate.flattenedRouteResolvers;
}
