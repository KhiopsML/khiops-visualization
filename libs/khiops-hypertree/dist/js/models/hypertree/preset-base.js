"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presets = void 0;
const n_layouts_1 = require("../n/n-layouts");
const d3_hypertree_1 = require("../../d3-hypertree");
const unitdisk_1 = require("../../components/unitdisk/unitdisk");
const preset_layers_1 = require("./preset-layers");
const magic_filter_1 = require("./magic-filter");
const π = Math.PI;
const hasLazy = (n) => n.hasOutChildren && n.isOutλ;
const isLeaf = (n) => !n.children || !n.children.length;
const isRoot = (n) => !n.parent;
const hasCircle = (n) => hasLazy(n) || isRoot(n) || isLeaf(n);
var nodeInitR = (c) => (ud, d) => c * (d.children && d.parent ? innerNodeScale(d) : 1);
var nodeScale = (d) => d.distScale * (hasLazy(d) ? 0.8 : 1);
var innerNodeScale = (d) => d.precalc.weightScale;
var arcWidth = (d) => 0.025 * d.distScale * d.precalc.weightScale;
const modelBase = () => ({
    langloader: (ok) => ok(),
    langInitBFS: (ht, n) => {
        n.precalc.label = undefined;
    },
    objects: {
        selections: [],
        pathes: [],
        traces: [],
    },
    layout: {
        type: n_layouts_1.layoutBergé,
        weight: (n) => (isLeaf(n) ? 1 : 0),
        initSize: 0.97,
        rootWedge: {
            orientation: (3 * π) / 2,
            angle: (3 * π) / 2,
        },
    },
    filter: {
        type: 'magic',
        cullingRadius: 0.99,
        weightFilter: {
            magic: 160,
            alpha: 1.05,
            weight: (n) => (isLeaf(n) ? 1 : 0),
            rangeCullingWeight: {
                min: 4,
                max: 500,
            },
            rangeNodes: {
                min: 500,
                max: 1000,
            },
        },
        focusExtension: 3, //1.6 Nb nodes to display
        maxFocusRadius: 1, // 0.85
        maxlabels: 500, // 25
    },
    geometry: {
        decorator: unitdisk_1.UnitDisk,
        cacheUpdate: magic_filter_1.cacheUpdate,
        layers: preset_layers_1.layerSrc,
        layerOptions: {},
        clipRadius: 1,
        nodeRadius: nodeInitR(0.01),
        nodeScale: nodeScale,
        nodeFilter: hasCircle,
        offsetLabels: preset_layers_1.labeloffsets.labeloffset, //outwardsPlusNodeRadius,
        linkWidth: arcWidth,
        linkCurvature: '-',
        transformation: new d3_hypertree_1.HyperbolicTransformation({
            P: {
                re: 0,
                im: 0,
            },
            θ: {
                re: 1,
                im: 0,
            },
            λ: 0.1,
        }),
    },
    interaction: {
        mouseRadius: 0.9,
        onNodeClick: (n, m) => { },
        onCenterNodeChange: (n) => { },
        onWikiCenterNodeChange: (n) => { },
        onHoverNodeChange: (n) => {
            // console.log("🚀 ~ file: preset-base.ts ~ line 99 ~ n", n)
        },
        onNodeSelect: () => { },
        onNodeHold: () => { },
        onNodeHover: () => {
            // console.log('ON NODE HOVER=============');
        },
        λbounds: [1 / 40, 0.45],
        wheelFactor: 1.175,
    },
});
exports.presets = {
    modelBase: () => modelBase(),
};
