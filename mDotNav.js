;(function () {

    m.cls = (def, separator = ' ') => {
        let classes
        for (const cls in def) {
            if (def[cls]) {
                classes = classes == null ? cls : classes + separator + cls
            }
        }
        return classes || ''
    }

    let transitionState = {
        changeRoute: false,
        anim: undefined,
        outboundResolvers: []
    }

    let RouteStates = {
        UNMOUNTED: 0,
        MOUNTED: 1,
        INITIAL_ROUTE: 2
    }

    let mDotNavState = {
        layoutComponent: undefined,
        routeState: RouteStates.UNMOUNTED,
        flattenedRoutes: undefined,
        flattenedRouteResolvers: undefined,
        flows: {},
        currentFlow: undefined,
        flowStack: [],
        routeStack: []
    }

    let DirectionTypes = {
        INITIAL: 'INITIAL',
        FIRST_NAV: 'FIRST NAV',
        SAME_ROUTE: 'SAME ROUTE',
        BACK: 'BACK',
        FORWARD: 'FORWARD'
    }

    const omEventTarget = new EventTarget();


    m.nav = (function () {

        function _nav(config) {
            mDotNavState.layoutComponent = config.layout || CSSGridLayout

            toRouteResolvers(config.routes)

            mDotNavState.flows = Object.keys(config.flows).reduce((accum, flowKey) => {
                let theFlow = config.flows[flowKey]
                accum[flowKey] = flow({name: flowKey, ...theFlow})
                return accum
            }, {})
        }

        let me = {
            debug: () => mDotNavState,
            addEventListener: omEventTarget.addEventListener.bind(omEventTarget),
            removeEventListener: omEventTarget.removeEventListener.bind(omEventTarget),
            //genKey: genKey,
            route: {},
            start: (flowName) => {
                console.log('flow.start()', flowName)

                let {flattenedRouteResolvers, flowStack, flows} = mDotNavState
                let theFlow = flows[flowName]

                if (mDotNavState.routeState === RouteStates.UNMOUNTED) {
                    let start = theFlow.first()
                    m.route(document.body, start, flattenedRouteResolvers)
                    mDotNavState.routeState = RouteStates.MOUNTED
                } else {
                    console.log('theFlow', theFlow)
                    theFlow.start()
                }

                mDotNavState.currentFlow = theFlow
                flowStack.push(flowName)

            },
            next: (data) => {
                mDotNavState.currentFlow.next(data)
            },
            DirectionTypes: DirectionTypes,
            CSSGridLayout: CSSGridLayout
        }

        me.route.redir = (path, params, options, anim) => {
            transitionState.changeRoute = true
            transitionState.anim = anim
            transitionState.isRedir = true
            transitionState.isPopState = false
            m.route.set(path, params)

        }

        //
        // m.nav.route.set
        //
        me.route.set = (path, params, options, anim) => {

            transitionState.changeRoute = true
            transitionState.anim = anim
            transitionState.isPopState = false

            //debugger
            m.route.set(path, params, options)
        }

        return Object.assign(_nav, me)

    })()

    function toRouteResolvers(routes) {
        mDotNavState.flattenedRoutes = flattenRoutes(routes)
        let {flattenedRoutes} = mDotNavState
        mDotNavState.flattenedRouteResolvers = Object.keys(flattenedRoutes).reduce((accum, routeKey) => {
            let theRoute = flattenedRoutes[routeKey]

            accum[routeKey] = (function () {
                let _omValue

                return {
                    //
                    // ONMATCH
                    onmatch: (args, requestedPath, route) => {
                        //debugger
                        const omEventBefore = new CustomEvent('onbeforeroutechange', {
                            detail: {transitionState: transitionState, outroute: _peek()}
                        });
                        omEventTarget.dispatchEvent(omEventBefore)

                        transitionState.changeRoute = true

                        console.log('m.nav::onmatch', transitionState, routeKey, args, requestedPath, route)
                        if (theRoute.hasOwnProperty('onmatch')) {
                            // call user defined onmatch()
                            _omValue = theRoute.onmatch(args, requestedPath, route)
                        }
                        if (!_omValue) {
                            //if no onmatch || the user's onmatch retuns null, return route's component
                            _omValue = theRoute
                        }

                        transitionState.key = genKey()

                        let histState = pushOrPop(args, requestedPath, route)
                        if (mDotNavState.routeState === RouteStates.MOUNTED) {
                            mDotNavState.routeState = RouteStates.INITIAL_ROUTE
                        }
                        if (transitionState.isPopState) {
                            //;//debugger
                        } else {
                            history.replaceState(_peek(), null, window.location.href)
                        }

                        transitionState.complete = () => {
                            console.log('Resetting transitionState')

                            transitionState.changeRoute = false
                            transitionState.isRedir = false
                            transitionState.isPopState = true
                            transitionState.outboundResolvers.forEach(it => it())
                            transitionState.outboundResolvers = []
                        }

                        // These occur before render()
                        requestAnimationFrame(() => console.log('onmatch::RAF!!!!', JSON.stringify(transitionState)))
                        Promise.resolve().then(() => console.log('onmatch::Promise.resolve()!!!!'), JSON.stringify(transitionState))

                        return _omValue
                    },
                    render: (vnode) => {
                        console.log('m.nav::render', routeKey, theRoute, vnode)
                        let {layoutComponent} = mDotNavState
                        if (!theRoute.hasOwnProperty('render')) return m(layoutComponent, {transitionState: transitionState}, m(_omValue, vnode.attrs))
                        return m(layoutComponent, {transitionState: transitionState}, theRoute.render(vnode))
                    }
                }
            })()
            return accum
        }, {})

    }

    function _peek(back = 1) {
        let {routeStack} = mDotNavState
        let {length} = routeStack
        if (!length) return null
        if (back > length) return null
        return routeStack[length - Math.abs(back)]
    }

    function genKey() {
        return (Math.random() * Math.pow(10, 16)).toFixed(0)
    }

    function pushOrPop(args, requestedPath, route) {

        let {routeStack} = mDotNavState
        let {length} = routeStack
        let peek = _peek()

        if (transitionState.isPopState) {

            let peek2 = _peek(-2) || {}
            let {requestedPath: backRequestedPath} = peek2
            if (requestedPath === backRequestedPath) {
                console.log('POP GOING BACK ROUTE')
                // transitionState.TYPE = 'BACK'
                transitionState.directionType = DirectionTypes.BACK
                return routeStack.pop()
            }
            console.log('POP GOING FORWARD ROUTE')
            routeStack.push({
                args: args, requestedPath: requestedPath, route: route,
                key: transitionState.key,
            })
            // transitionState.TYPE = 'FORWARD'
            transitionState.directionType = DirectionTypes.FORWARD

            return _peek()

        }

        if (!length) {
            // Initialize stack on very first route.
            console.log('INITIAL ROUTE')
            routeStack.push({
                args: args, requestedPath: requestedPath, route: route,
                key: transitionState.key
            })
            // transitionState.TYPE = 'INITIAL'
            transitionState.directionType = DirectionTypes.INITIAL

            return _peek()
        }

        if (route === peek.route && requestedPath === peek.requestedPath) {
            // It's the same route
            console.log('SAME ROUTE')
            // transitionState.TYPE = 'SAME ROUTE'
            transitionState.directionType = DirectionTypes.SAME_ROUTE

            return _peek()
        }
        if (length < 2) {
            console.log('FIRST ROUTE')
            routeStack.push({
                args: args, requestedPath: requestedPath, route: route,
                key: transitionState.key
            })
            // transitionState.TYPE = 'FIRST ROUTE'
            transitionState.directionType = DirectionTypes.FIRST_NAV

            return _peek()
        }

        peek = routeStack[routeStack.length - 2]
        if (route === peek.route && requestedPath === peek.requestedPath) {
            console.log('GOING BACK ROUTE')
            // transitionState.TYPE = 'BACK'
            transitionState.directionType = DirectionTypes.BACK
            routeStack.pop()
        } else {
            console.log('GOING FORWARD ROUTE')
            routeStack.push({
                args: args, requestedPath: requestedPath, route: route,
                key: transitionState.key
            })
            // transitionState.TYPE = 'FORWARD'
            transitionState.directionType = DirectionTypes.FORWARD
        }
        return _peek()


    }

    function flow(config) {

        if (!config || !config.name) {
            throw new Error('flow() -- config.name required')
        }

        let localState = {
            anim: config.anim,
            currentIndex: 0,
            flowState: {},
            flowName: config.name,
            routes: []
        }

        Object.assign(localState.routes, config.routes)

        let me = {

            get flowName() {
                return localState.flowName
            },

            first() {
                return localState.routes[0]
            },
            start(params = {},) {
                let {routes, flowName} = localState
                console.log('Flow::start', flowName, routes, routes[localState.currentIndex], routes.length === localState.currentIndex + 1)

                localState.currentIndex = 0
                let {currentIndex} = localState
                let theRoute = typeof routes[currentIndex] === 'function'
                    ? routes[currentIndex].call(null, params)
                    : routes[currentIndex]
                console.log('THE ROUTE', theRoute)
                m.nav.route.set(theRoute, params, {state: params})
            },

            next(flowParams, urlParams, anim = {}) {
                let {routes, flowName} = localState
                console.log('Flow::next', localState, routes[localState.currentIndex], routes.length === localState.currentIndex + 1)
                //debugger
                if (routes.length === localState.currentIndex + 1) return
                localState.currentIndex++
                let {currentIndex} = localState
                let theRoute = typeof routes[currentIndex] === 'function'
                    ? routes[currentIndex].call(null, flowParams)
                    : routes[currentIndex]

                m.nav.route.set(theRoute, urlParams, null, {
                    inbound: (vnodes) => console.log(vnodes),
                    outbound: (vnodes) => console.log(vnodes)
                })
            },

            prev(params, anim = {}) {
                let {routes, flowName} = localState
                console.log('Flow::prev', flowName, routes, routes[localState.currentIndex])
                //debugger
                if (localState.currentIndex == 0) return
                localState.currentIndex--
                let {currentIndex} = localState
                let theRoute = typeof routes[currentIndex] === 'function'
                    ? routes[currentIndex].call(null, params)
                    : routes[currentIndex]

                console.log('THE ROUTE -- prev()', theRoute)

                m.nav.route.set(theRoute, params, {state: params}, {
                    inbound: (vnodes) => console.log(vnodes),
                    outbound: (vnodes) => console.log(vnodes)
                })

            }
        }

        return me
    }

    function CSSGridLayout() {
        return {
            view: ({attrs, children}) => {
                console.log('CSSGridLayout::view', mDotNavState, transitionState)
                return m('div.layout', children)
            }
        }
    }

    CSSGridLayout.bodyClass = b({
        display: 'grid',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        'grid-template-columns': '1fr 1fr 1fr',
        'grid-template-rows': 'min-content auto min-content'
    })


    function flattenRoutes(routes, prefix = '') {
        return Object.keys(routes).reduce((acc, match) =>
                routes[match].view || routes[match].onmatch || routes[match].render
                    ? {...acc, [prefix + match]: routes[match]}
                    : {...acc, ...flattenRoutes(routes[match], prefix + match)}
            , {})
    }


})();
