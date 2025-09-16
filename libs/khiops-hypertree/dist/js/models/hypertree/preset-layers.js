"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layerSrc = exports.labeloffsets = void 0;
const hyperbolic_math_1 = require("../transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../transformation/hyperbolic-math");
const node_layer_1 = require("../../components/layers/node-layer");
const cell_layer_1 = require("../../components/layers/cell-layer");
const background_layer_1 = require("../../components/layers/background-layer");
const link_layer_1 = require("../../components/layers/link-layer");
const label_layer_1 = require("../../components/layers/label-layer");
const label_force_layer_1 = require("../../components/layers/label-force-layer");
const interaction_layer_1 = require("../../components/layers/interaction-layer");
const interaction_layer_2_1 = require("../../components/layers/interaction-layer-2");
const focus_layer_1 = require("../../components/layers/focus-layer");
const d3_hypertree_1 = require("../../d3-hypertree");
exports.labeloffsets = {
    centerOffset: (cache) => (d, i, v) => (0, d3_hypertree_1.bboxCenter)(d, cache),
    nodeRadiusOffset: (ls) => (d) => (0, hyperbolic_math_1.CptoCk)({
        θ: d.cachep.θ,
        r: ls.args.nodeRadius(ls, d) * d.distScale * 1.5,
    }),
    labeloffset: (ud) => (d, i, v) => (0, hyperbolic_math_2.CaddC)(exports.labeloffsets.nodeRadiusOffset(ud)(d), (0, d3_hypertree_1.bboxOval)(d)),
    outwards: undefined,
    outwardsPlusNodeRadius: undefined,
};
exports.labeloffsets.outwards = exports.labeloffsets.nodeRadiusOffset;
exports.labeloffsets.outwardsPlusNodeRadius = exports.labeloffsets.labeloffset;
exports.layerSrc = [
    (v, ud) => new background_layer_1.BackgroundLayer(v, {}),
    (v, ud) => new cell_layer_1.CellLayer(v, {
        invisible: true,
        hideOnDrag: true,
        clip: '#circle-clip' + ud.args.clipRadius,
        data: () => ud.cache.cells,
        fill: (n) => undefined,
        stroke: (n) => undefined,
        strokeWidth: (n) => undefined,
    }),
    (v, ud) => new focus_layer_1.FocusLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'culling-r',
        r: () => ud.view.hypertree.args.filter.cullingRadius,
        center: () => '0 0',
    }),
    (v, ud) => new focus_layer_1.FocusLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'mouse-r',
        r: () => ud.view.hypertree.args.interaction.mouseRadius,
        center: () => '0 0',
    }),
    (v, ud) => new focus_layer_1.FocusLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'focus-r',
        r: () => ud.cache.focusR,
        center: () => '0 0',
    }),
    (v, ud) => new focus_layer_1.FocusLayer(v, {
        invisible: false,
        hideOnDrag: false,
        name: 'λ',
        r: () => ud.args.transformation.state.λ,
        center: () => `${(ud.pinchcenter || { re: 0 }).re} ${(ud.pinchcenter || { im: 0 }).im}`,
    }),
    (v, ud) => new focus_layer_1.FocusLayer(v, {
        invisible: false,
        className: 'zerozero-circle',
        name: '(0,0)',
        r: () => 0.004,
        center: () => '0 0',
    }),
    (v, ud) => new node_layer_1.NodeLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'center-node',
        className: 'center-node',
        fill: (n) => undefined,
        stroke: (n) => undefined,
        strokeWidth: (n) => undefined,
        data: () => (ud.cache.centerNode ? [ud.cache.centerNode] : []),
        r: (d) => 0.1,
        transform: (d) => d.transformStrCache + ` scale(${ud.args.nodeScale(d)})`,
    }),
    /**
     * important part or path rendering
     */
    (v, ud) => new link_layer_1.ArcLayer(v, {
        invisible: false,
        hideOnDrag: false,
        name: 'link-arcs',
        className: 'arc',
        curvature: ud.view.hypertree.args.geometry.linkCurvature, // + - 0 l
        clip: '#circle-clip' + ud.args.clipRadius,
        data: () => ud.cache.links,
        nodePos: (n) => n.cache,
        nodePosStr: (n) => n.strCache,
        stroke: (n) => undefined,
        strokeWidth: (d) => ud.args.linkWidth(d),
        classed: (s, w, c) => s
            .style('stroke', (d) => (d.pathes && d.pathes.isPartOfAnyHoverPath
            ? d.pathes && d.pathes.finalcolor
            : d.pathes && d.pathes.finalcolor) || c(d))
            .classed('hovered', (d) => d.pathes && d.pathes.isPartOfAnyHoverPath)
            .classed('selected', (d) => d.pathes && d.pathes.isPartOfAnySelectionPath),
    }),
    (v, ud) => new node_layer_1.NodeLayer(v, {
        invisible: false,
        hideOnDrag: false,
        name: 'nodes',
        className: 'node',
        data: () => ud.cache.leafOrLazy,
        fill: (n) => undefined,
        stroke: (n) => undefined,
        strokeWidth: (n) => undefined,
        r: (d) => ud.args.nodeRadius(ud, d),
        transform: (d) => d.transformStrCache + ` scale(${ud.args.nodeScale(d)})`,
    }),
    (v, ud) => new label_layer_1.LabelLayer(v, {
        invisible: false,
        hideOnDrag: false,
        name: 'labels',
        className: 'caption',
        data: () => ud.cache.labels,
        text: (d) => d.precalc.label,
        isVisible: () => undefined,
        delta: exports.labeloffsets.labeloffset(ud),
        color: () => undefined,
        background: undefined,
        transform: (d, delta) => ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
            d.scaleStrText,
    }),
    (v, ud) => new label_layer_1.LabelLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'labels2',
        className: 'caption',
        data: () => ud.cache.labels,
        text: (d) => d.precalc.label,
        delta: exports.labeloffsets.labeloffset(ud),
        color: () => undefined,
        transform: (d, delta) => ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
            d.scaleStrText,
    }),
    (v, ud) => new label_force_layer_1.LabelForceLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'labels-force',
        className: 'caption caption-label',
        data: () => ud.cache.labels,
        text: (d) => d.precalc.label,
        background: (n) => !n.parent,
        transform: (d, delta) => ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
            d.scaleStrText,
    }),
    (v, ud) => new interaction_layer_1.InteractionLayer(v, {
        invisible: true,
        hideOnDrag: true,
        mouseRadius: ud.view.hypertree.args.interaction.mouseRadius,
        onClick: (n, m) => {
            var s = n.ancestors().find((e) => true);
            ud.view.hypertree.api.toggleSelection(s); // toggle selection
            ud.view.hypertree.args.interaction.onNodeSelect(s); // focus splitter
        },
    }),
    (v, ud) => new interaction_layer_2_1.InteractionLayer2(v, {
        mouseRadius: ud.view.hypertree.args.interaction.mouseRadius,
        onClick: (n, m) => {
            var s = n.ancestors().find((e) => true);
            ud.view.hypertree.api.toggleSelection(s); // toggle selection
            ud.view.hypertree.args.interaction.onNodeSelect(s); // focus splitter
        },
    }),
];
