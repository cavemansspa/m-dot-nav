import m, {DirectionTypes} from "./m-dot-nav";
import b from "bss";

window.m = m

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

            console.log('Layout::onupdate()', {attrs: attrs, _layoutState: _layoutState})

            let {transitionState} = attrs
            transitionState.context = _layoutState

            if (transitionState.directionType === DirectionTypes.REDRAW) {
                return
            }
            if (transitionState.directionType === DirectionTypes.SAME_ROUTE) {
                return
            }

            Promise.resolve().then(() => {
                let {outbound, inbound} = _layoutState
                //console.log(outbound['section-main'].dom, inbound['section-main'].dom)

                if (transitionState.anim) {
                    transitionState.anim(transitionState)
                    return
                }

                // default page transition
                outbound['section-main'].dom.classList.add("ui", "transition", "fade", "out");
                inbound['section-main'].dom.classList.add("ui", "transition", "fade", "in");

                outbound['section-main'].dom.addEventListener(
                    "animationend",
                    function ae() {
                        //console.log("animationend");
                        inbound['section-main'].dom.classList.remove("ui", "transition", "fade", "in");
                        outbound['section-main'].resolver()
                        outbound['section-main'].dom.removeEventListener(
                            "animationend",
                            ae
                        );
                    }
                );
            })
        }
    }

    function addLifecycles(name, comp) {

        return Object.assign(comp, {

            oncreate: ({dom, attrs, key}) => {
                console.log('addLifecycles oncreate()', name, attrs)
                _layoutState.inbound[name] = {dom: dom}
            },

            onbeforeremove: ({dom, attrs, key}) => {
                console.log('addLifecycles onbeforeremove()', name, attrs)
                return new Promise((resolve) => {
                    console.log("addLifecycles onbeforeremove() -- outbound promise", resolve);
                    _layoutState.outbound[name] = {dom: dom, resolver: resolve}
                });
            }

        })
    }

    function SectionMain({attrs: initialAttrs}) {

        let selector = 'section' + b({
            "grid-area": "2 / 1 / 2 / -1"
        })

        return addLifecycles('section-main', {
            view: ({attrs, children}) => m(selector, {'data-value-key': attrs.key}, children),
        })
    }
}

function slideUpIn(transitionState) {
    let {outbound, inbound} = transitionState.context

    let slideUpInClass = b({
        transition: "transform 300ms",
        transform: "translateY(100%)"
    });
    inbound['section-main'].dom.classList.add(slideUpInClass);
    requestAnimationFrame(() => {
        inbound['section-main'].dom.addEventListener(
            "transitionend",
            function te() {
                inbound['section-main'].dom.classList.remove(slideUpInClass);
                outbound['section-main'].resolver()
                outbound['section-main'].dom.removeEventListener(
                    "transitionend",
                    te
                );
            }
        );
        inbound['section-main'].dom.style.transform = 'translateY(0)'
    })

}

m.nav.init({
    root: document.body,
    defaultRoute: "/",
    routes: {
        "/": {
            view: () => {
                return [
                    m('div', {style: 'height:100%; background-color: aliceblue;'}, [
                        'hello world via m.nav.init(): ',
                        m(m.route.Link, {href: "/foo?bar=1"}, '/foo')
                    ])
                ]
            }
        },
        "/foo": {
            view: () => {
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
                            m.nav.route.set('/foo', null, null, (ts) => {
                                console.log(ts)
                                slideUpIn(ts)
                            })
                        }
                    }, 'Go'),
                    m('div', {style: 'height:100%; background-color: aqua;'}, '/bar')
                ]
            }
        }
    },
    layoutComponent: Layout,
    _layoutComponent: {
        view: ({children, attrs}) => {
            console.log(attrs)
            return children
        }
    }
})

