"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navParameterLayers = void 0;
const hyperbolic_math_1 = require("../../models/transformation/hyperbolic-math");
const node_layer_1 = require("../layers/node-layer");
const cell_layer_1 = require("../layers/cell-layer");
const label_layer_1 = require("../layers/label-layer");
const interaction_layer_1 = require("../layers/interaction-layer");
var rotate = (d) => (d.name === 'λ' ? ' rotate(-25)' : ' rotate(0)');
var deltaMap = {
    // label offsets (font correction)
    P: { re: 0.0025, im: 0.05 },
    θ: { re: 0.0025, im: 0.019 },
    λ: { re: 0.0025, im: 0.013 },
};
var Pscale = (ud) => (d) => (0, hyperbolic_math_1.lengthDilledation)(d.cache) * (1 - ud.args.transformation.state.λ);
exports.navParameterLayers = [
    (v, ud) => new cell_layer_1.CellLayer(v, {
        invisible: true,
        hideOnDrag: true,
        clip: '#circle-clip' + ud.args.clipRadius,
        data: () => ud.cache.cells,
    }),
    (v, ud) => new node_layer_1.NodeLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'nodes',
        className: 'node',
        data: () => ud.cache.unculledNodes,
        r: (d) => (d.name === 'P' ? Pscale(ud)(d) : ud.args.nodeRadius(ud, d)),
        transform: (d) => d.transformStrCache,
    }),
    (v, ud) => new label_layer_1.LabelLayer(v, {
        invisible: true,
        hideOnDrag: true,
        name: 'labels',
        className: 'caption',
        data: () => ud.cache.unculledNodes,
        text: (d) => ({ P: '+', θ: '🠆', λ: '⚲' })[d.name],
        delta: (d) => deltaMap[d.name],
        transform: (d, delta) => ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
            rotate(d),
    }),
    (v, ud) => new interaction_layer_1.InteractionLayer(v, {
        mouseRadius: 1.5,
        onClick: (n, m) => { },
    }),
];
