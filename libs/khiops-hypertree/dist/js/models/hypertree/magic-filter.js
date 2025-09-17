"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheUpdate = cacheUpdate;
const hyperbolic_math_1 = require("../transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../transformation/hyperbolic-math");
const hyperbolic_math_3 = require("../transformation/hyperbolic-math");
const preset_process_1 = require("./preset-process");
const preset_process_2 = require("./preset-process");
function adjustMagic(ud, cache) {
    const filter = ud.view.hypertree.args.filter.weightFilter;
    const rangeNodes = filter.rangeNodes; //{ min:300, max:700 }
    const rangeMagic = filter.rangeCullingWeight; //{ min:4,   max:500 }
    const alpha = filter.alpha;
    if (cache.unculledNodes) {
        if (cache.unculledNodes.length > rangeNodes.max) {
            if (filter.magic > rangeMagic.min) {
                filter.magic /= alpha;
            }
        }
        if (cache.unculledNodes.length < rangeNodes.min) {
            if (filter.magic < rangeMagic.max) {
                filter.magic *= alpha;
            }
        }
    }
}
function collectNodesByWeight(ud, cache, path) {
    const normλ = ud.args.transformation.state.λ;
    cache.focusR = Math.min(normλ * ud.view.hypertree.args.filter.focusExtension, ud.view.hypertree.args.filter.maxFocusRadius);
    adjustMagic(ud, cache);
    // select visible nodes
    const startNode = path[0];
    cache.unculledNodes = [];
    cache.spezialNodes = [ud.args.data, startNode].filter((e) => e);
    cache.emojis = [];
    cache.cells = [];
    const mf = ud.view.hypertree.isAnimationRunning() ? 1 : 1;
    function abortfilter(n, idx, highway) {
        // return false to abort
        n.minWeight =
            highway[0].precalc.cullingWeight /
                ud.view.hypertree.args.filter.weightFilter.magic /
                mf;
        peocessNodeTransformation(ud, cache, n);
        peocessNode(ud, cache, n, cache.focusR, n.minWeight);
        return !n.isOut;
    }
    // dont do it before pathToLastVisible. it uses centerNode
    cache.centerNode = undefined; // ud.args.data
    const t1 = performance.now();
    // select visible nodes - rootnode extra
    if (ud.args.data) {
        peocessNodeTransformation(ud, cache, ud.args.data);
        peocessNode(ud, cache, ud.args.data, cache.focusR, 0);
        // root ist nicht in uncullednodes! (gut)
    }
    // centernode will be set at this point
    // select visible nodes - alle anderen (von startnode bis abortfilter)
    // path.pop()
    (0, hyperbolic_math_1.dfs2)({
        node: startNode,
        abortFilter: abortfilter,
        preAction: (n) => cache.unculledNodes.push(n),
        highway: path,
    });
    return t1;
}
function addPathToUnculled(ud, cache, p) {
    if (p.type !== 'HoverPath') {
        const pathnodes = [];
        // go down
        let n = p.head;
        while (n.parent && !cache.unculledNodes.includes(n)) {
            pathnodes.push(n);
            n = n.parent;
        }
        // go up and transform
        pathnodes.reverse().forEach((n) => {
            peocessNodeTransformation(ud, cache, n);
            peocessNode(ud, cache, n, cache.focusR, 0);
        });
        cache.unculledNodes = cache.unculledNodes.concat(pathnodes);
    }
}
function cacheUpdate(ud, cache) {
    // constants
    const t0 = performance.now();
    const path = pathToLastVisible(ud, cache);
    const t1 = collectNodesByWeight(ud, cache, path); // also updates centernode
    const t2 = performance.now();
    // add pathes to unculled nodes
    ud.view.hypertree.args.objects.pathes.forEach((p) => addPathToUnculled(ud, cache, p));
    // groups of nodes
    cache.links = cache.unculledNodes.slice(1);
    cache.leafOrLazy = cache.unculledNodes.filter(ud.args.nodeFilter);
    cache.paths = cache.links.filter((n) => n.pathes.partof && n.pathes.partof.length);
    cache.weights = [];
    const t3 = performance.now();
    if (!ud.view.hypertree.isAnimationRunning() ||
        (ud.layerStack && !ud.layerStack.layers['labels-force'].args.hideOnDrag) ||
        (ud.layerStack && !ud.layerStack.layers['labels'].args.hideOnDrag))
        (0, preset_process_2.doLabelStuff)(ud, cache);
    /*
      voro wrid gebraucht:
      - mouse up: um click voro zu berechnen
      - celllayer still enabled
      - cellayer anitmation enabled
      */
    if (!ud.view.hypertree.isAnimationRunning() ||
        (ud.layerStack && !ud.layerStack.layers['cells'].args.hideOnDrag))
        (0, preset_process_1.doVoronoiStuff)(ud, cache);
    if (cache.centerNode)
        ud.view.hypertree.update.centernode(cache.centerNode);
    // only for meta view
    // @ts-ignore
    ud.cacheMeta = {
        minWeight: path.map((n) => n.precalc.cullingWeight /
            ud.view.hypertree.args.filter.weightFilter.magic),
        Δ: [t1 - t0, t2 - t1, t3 - t2, performance.now() - t3],
    };
}
function pathToLastVisible(ud, cache) {
    let startNode = null;
    let path = [];
    if (ud.args.data) {
        startNode = cache.centerNode || ud.args.data;
        path.push(startNode);
        while (true) {
            peocessNodeTransformation(ud, cache, startNode);
            if (startNode.cachep.r >= ud.view.hypertree.args.filter.cullingRadius) {
                path = path.slice(0, -1);
                break;
            }
            if (!startNode.parent)
                break;
            startNode = startNode.parent;
            path.push(startNode);
        }
    }
    return path.reverse();
}
function peocessNodeTransformation(ud, cache, n) {
    n.cache = n.cache || { re: 0, im: 0 };
    ud.view.hypertree.args.layout.type(n, ud.args.transformation.state.λ, true);
    (0, hyperbolic_math_3.CassignC)(n.cache, ud.args.transform(n));
    n.cachep = (0, hyperbolic_math_2.CktoCp)(n.cache);
}
function peocessNode(ud, cache, n, focusR, minWeight) {
    n.strCache = `${n.cache.re} ${n.cache.im}`;
    n.transformStrCache = ` translate(${n.strCache})`;
    n.transformStrCacheZ = ` translate(${n.layout.zStrCache})`;
    n.isOutλ = n.cachep.r >= focusR;
    n.isOut99 = n.cachep.r >= ud.view.hypertree.args.filter.cullingRadius;
    n.isOutWeight = n.precalc.cullingWeight <= minWeight;
    n.distScale = ud.args.transformation.transformDist(n.cache);
    n.dampedDistScale = n.distScale * (0.5 / n.distScale + 0.5);
    n.scaleStrText = ` scale(${n.dampedDistScale})`;
    n.isOut = !(!(n.isOut99 || n.isOutWeight) ||
        !n.isOutλ ||
        (n.parent && !n.parent.isOutλ));
    n.hasOutPeriChildren = n.hasOutWeightChildren = n.hasOutChildren = false;
    if (n.parent && n.isOut99)
        n.parent.hasOutPeriChildren = true;
    if (n.parent && n.isOutWeight)
        n.parent.hasOutWeightChildren = true;
    if (n.parent && n.isOut)
        n.parent.hasOutChildren = true;
    if (!cache.centerNode || cache.centerNode.cachep.r > n.cachep.r)
        cache.centerNode = n;
}
