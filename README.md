# m-dot-nav
Navigation wrapper over Mithril's route-resolvers.

# Routing vs Navigation

Mithril's [`m.route()`](https://mithril.js.org/route.html) default routing implementation provides a straight-forward
and flexible approach for setting up an application's different page endpoints.  However, navigation (i.e. functionality to move between routes)
is left to the developer to implement and is typically solved using a custom [route resolver](https://mithril.js.org/route.html#routeresolver).

As discussed on Mithril's gitter chat a few times, it's 
not uncommon to conflate application routing with application navigation. However, in my opinion, these concepts are best  considered as separate application concerns and be handled as such.  An application's routes are it's set of possible endpoints (i.e. pages) whereas navigation is the mechanics of moving from one page to another. For example, the customary mobile app page transition of sliding-out-left / sliding-in-right is a navigation concern.  To that end, `m-dot-nav` aims to aid the app developer with some utilities to assist with wiring together your application's routes.

# How Does it Work?
`m-dot-nav` follows `m.route`'s api for specifying your application's routes with an object that contains endpoint keys mapped to a component or route resolver. Additionally, a user-defined layout component is required.  

```
    m.nav(document.body, "/default", {

            // You specify routes the same as you do with m.route()
            "/default": {
                view: ({attrs}) => {
                    return m('div', 'this is /default')
                }
            },

            // m.nav works in conjunction with an installed layout component
        }, {
            layoutComponent: {
                view: ({attrs, children}) => m('div', {style: 'height:100%; background-color: aliceblue;'}, [
                    m('div', attrs.transitionState.directionType),
                    children
                ])
            }
        }
    );
```

Internally, `m-dot-nav` injects it's own enhanced route resolver per user defined route.  These enhanced route resolvers maintain a `transitionState` object that's passed as an attribute to the installed layout component.

The `m.nav({})` initializes navigation and provides the following:
* `m.nav.setRoute(route, params, options = {}, anim)` -- this is the same as `m.route.set()` with an additional parameter that takes a function to
handle your inbound / outbound transitions.
* an `onbeforeroutechange` callback can be added to your user defined route definition.
```
    m.nav(document.body, "/default", {

            // You specify routes the same as you do with m.route()
            "/default": {
                // onbeforeroutechange param contains:
                //    inbound: 
                //    lastTransitionState: 
                //    outbound: 
                onbeforeroutechange: (changeInfo) => console.log('/default onbeforeroutechange', changeInfo),
                view: ({attrs}) => {
                    return m('div', 'this is /default')
                }
            },

        ...
```
* An alternative to the route resolver based `onbeforeroutechange` approach is to 
register an event listener to react to a route change. 
This can be helpful in cases where you have a deeply nested component where you want
to add code / behavior when it's about to go out of scope.
```
                    m("div", {
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
                    ),

```

* NOTE: the name `onbeforeroutechange` is a bit nuanced in that the
browser's address bar will have already changed to the new inbound url.
This is because mithril's router is wired to the `onpopstate` event.
However, keep in mind that although the address bar url has already updated,
mithril is pending the view update based on your layout's behavior.

# Transition State
The transition state object has the following structure.
```
{
    directionType: // provides information about route change direction. FORWARD, BACKWORD, SAME_ROUTE
    context:       // user defined data 
}
```
Your installed layout can use the `transitionState` object to determine how to animate
between routes.

# History
When clicking on a link using `m.route.Link`, `m-dot-nav` will check to see if
you're going back to the previous route and call `history.back()`.  This results in a
more reasonable history stack and better aligns the browser back / forward buttons
to app links. 

# Nested Routes and Nested Layout
```
    "/nested": (function () {
        let layoutComponent = {view: ({children}) => [m('div', 'sublayout')].concat(children)}
        return {
            "/a": {render: () => m(layoutComponent, m('div', 'this is /nested/a'))},
            "/b": {render: () => m(layoutComponent, m('div', 'this is /nested/b'))}
        }
    })()

```

# Examples

[example](https://cavemansspa.github.io/nav-demo/dist/index.html)
