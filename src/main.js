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

        onupdate: ({attrs}) => {

            console.log('Layout::onupdate()', {attrs: attrs, _layoutState: _layoutState})

            let {transitionState} = attrs

            if (transitionState.directionType === DirectionTypes.REDRAW) {
                return
            }
            if (transitionState.directionType === DirectionTypes.SAME_ROUTE) {
                return
            }

            Promise.resolve().then(() => {
                let {outbound, inbound} = _layoutState
                //console.log(outbound['section-main'].dom, inbound['section-main'].dom)

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

m.nav.init({
    root: document.body,
    defaultRoute: "/",
    routes: {
        "/": {
            view: () => {
                return [
                    m('div', {style: 'height:100%; background-color: aliceblue;'}, [
                        'hello world via m.nav.init(): ',
                        m(m.route.Link, {href:"/foo?bar=1"}, '/foo')
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
    },
    layoutComponent: Layout,
    _layoutComponent: {
        view: ({children, attrs}) => {
            console.log(attrs)
            return children
        }
    }
})

//m.mount(document.body, {view: () => m('div', 'hello world')})
