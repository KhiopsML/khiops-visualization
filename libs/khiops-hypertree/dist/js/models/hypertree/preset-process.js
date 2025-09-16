"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doVoronoiStuff = doVoronoiStuff;
exports.setHoverNodeCache = setHoverNodeCache;
exports.doLabelStuff = doLabelStuff;
function doVoronoiStuff(ud, cache) {
    cache.voronoiDiagram = ud.voronoiLayout(cache.unculledNodes.filter((n) => n.precalc.clickable));
    cache.cells = cache.voronoiDiagram.polygons();
}
function setHoverNodeCache(node, cache) {
    cache.lastHovered = node;
}
function doLabelStuff(ud, cache) {
    var labels = cache.unculledNodes.filter((e) => e.precalc.label);
    var stdlabels = labels.filter((e) => !e.parent || !e.isOutλ);
    let damping = 1;
    while (stdlabels.length > ud.view.hypertree.args.filter.maxlabels) {
        stdlabels = stdlabels.filter((n) => {
            var _a;
            return n.precalc.cullingWeight * (n.parent === cache.centerNode ? 4 : 1) >
                n.minWeight * damping ||
                !n.parent ||
                ((_a = n.pathes) === null || _a === void 0 ? void 0 : _a.isPartOfAnyHoverPath);
        });
        damping /= 0.8;
    }
    cache.labels = stdlabels;
}
