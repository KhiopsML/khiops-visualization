"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doVoronoiStuff = doVoronoiStuff;
exports.setHoverNodeCache = setHoverNodeCache;
exports.doLabelStuff = doLabelStuff;
const d3_1 = require("d3");
function doVoronoiStuff(ud, cache) {
    const clickableNodes = cache.unculledNodes.filter((n) => n.precalc.clickable);
    const points = clickableNodes.map((d) => [
        d.cache.re,
        d.cache.im,
    ]);
    if (points.length > 0) {
        const delaunay = d3_1.Delaunay.from(points);
        cache.voronoiDiagram = delaunay.voronoi([-2, -2, 2, 2]);
        cache.cells = Array.from(cache.voronoiDiagram.cellPolygons());
    }
    else {
        cache.voronoiDiagram = null;
        cache.cells = [];
    }
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
