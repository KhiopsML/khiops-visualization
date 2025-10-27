"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitDiskNav = exports.UnitDisk = void 0;
const d3 = require("d3");
const hyperbolic_math_1 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_3 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_transformation_1 = require("../../models/transformation/hyperbolic-transformation");
const hyperbolic_transformation_2 = require("../../models/transformation/hyperbolic-transformation");
const layerstack_1 = require("../layerstack/layerstack");
const layers_background_1 = require("./layers-background");
const layers_background_2 = require("./layers-background");
const layers_parameter_1 = require("./layers-parameter");
//----------------------------------------------------------------------------------------
class UnitDisk {
    constructor(view, args) {
        this.api = {
            setTransform: (t, tn) => this.mainsvg.attr('transform', t),
        };
        this.update = {
            parent: () => this.updateParent(),
            cache: () => this.args.cacheUpdate(this, this.cache), // gehört nicht hier her
            data: () => this.update.layout(),
            layout: () => {
                this.args.cacheUpdate(this, this.cache);
                this.layerStack.update.data();
            },
            transformation: () => {
                this.args.cacheUpdate(this, this.cache);
                this.layerStack.update.data();
            },
            pathes: () => {
                this.args.cacheUpdate(this, this.cache);
                this.layerStack.update.pathes();
            },
        };
        this.view = view;
        this.args = args;
        this.cache = args.transformation.cache;
        this.update.parent();
    }
    updateParent() {
        this.mainsvg = d3
            .select(this.view.parent)
            .append('g')
            .attr('class', this.view.className)
            .attr('transform', this.view.position);
        this.mainsvg
            .append('clipPath')
            .attr('id', 'circle-clip' + this.args.clipRadius)
            .append('circle')
            .attr('r', this.args.clipRadius);
        this.voronoiLayout = d3.Delaunay.from([], (d) => {
            console.assert(typeof d.cache.re === 'number');
            return d.cache.re;
        }, (d) => {
            console.assert(typeof d.cache.im === 'number');
            return d.cache.im;
        }).voronoi([-2, -2, 2, 2]);
        this.layerStack = new layerstack_1.LayerStack({
            parent: this.mainsvg,
            unitdisk: this,
        });
    }
}
exports.UnitDisk = UnitDisk;
//----------------------------------------------------------------------------------------
class UnitDiskNav {
    get voronoiLayout() {
        return this.mainView.voronoiLayout;
    }
    constructor(view, args) {
        this.api = {
            setTransform: (t, tn) => {
                this.mainView.api.setTransform(t, null);
                this.navBackground.api.setTransform(tn, null);
                this.navParameter.api.setTransform(tn, null);
            },
        };
        this.update = {
            data: () => {
                this.navBackground.args.data = this.args.data;
                this.mainView.args.data = this.args.data;
                this.update.layout();
            },
            cache: () => {
                this.mainView.update.cache();
                this.navParameter.update.cache();
            },
            layout: () => {
                this.mainView.update.cache();
                this.navParameter.update.cache();
                this.navBackground.layerStack.update.data();
                this.mainView.layerStack.update.data();
                this.navParameter.layerStack.update.data();
            },
            transformation: () => {
                this.mainView.update.cache();
                this.navParameter.update.cache();
                this.mainView.layerStack.update.data();
                this.navParameter.layerStack.update.data();
                this.navBackground.layerStack.update.pathes();
            },
            pathes: () => {
                this.mainView.update.cache();
                this.mainView.layerStack.update.data();
                this.navBackground.layerStack.update.pathes();
                this.navParameter.layerStack.update.data();
            },
        };
        this.view = view;
        this.args = args;
        this.mainView = new UnitDisk(view, args);
        this.cache = this.mainView.cache;
        this.layerStack = this.mainView.layerStack;
        this.navBackground = new UnitDisk({
            parent: view.parent,
            className: 'nav-background-disc',
            position: 'translate(95,95) scale(70)',
            hypertree: view.hypertree,
        }, {
            data: args.data,
            decorator: null,
            cacheUpdate: null,
            transformation: args.transformation,
            transform: (n) => n.layout.z,
            nodeRadius: () => layers_background_2.navBgNodeR,
            nodeScale: args.nodeScale,
            nodeFilter: args.nodeFilter,
            linkWidth: args.linkWidth,
            linkCurvature: args.linkCurvature,
            layers: layers_background_1.navBackgroundLayers,
            layerOptions: {}, //args.layerOptions,
            offsetLabels: args.offsetLabels,
            clipRadius: 1,
        });
        var navTransformation = new hyperbolic_transformation_2.NegTransformation(new hyperbolic_transformation_1.PanTransformation(args.transformation.state));
        this.navParameter = new UnitDisk({
            parent: view.parent,
            className: 'nav-parameter-disc',
            position: 'translate(95,95) scale(70)',
            hypertree: view.hypertree,
        }, {
            decorator: null,
            layers: layers_parameter_1.navParameterLayers,
            layerOptions: {}, //args.layerOptions,
            cacheUpdate: (ud, cache) => {
                var t0 = performance.now();
                cache.unculledNodes = (0, hyperbolic_math_3.dfsFlat)(ud.args.data);
                function setCacheZ(n, v) {
                    n.cache = v;
                    n.cachep = (0, hyperbolic_math_1.CktoCp)(n.cache);
                    n.strCache = n.cache.re + ' ' + n.cache.im;
                    n.scaleStrText = ` scale(1)`;
                    n.transformStrCache = ` translate(${n.strCache})`;
                }
                const spr = 1.08;
                setCacheZ(cache.unculledNodes[0], (0, hyperbolic_math_2.CmulR)(args.transformation.state.P, -1));
                setCacheZ(cache.unculledNodes[1], (0, hyperbolic_math_2.CmulR)(args.transformation.state.θ, -spr));
                setCacheZ(cache.unculledNodes[2], (0, hyperbolic_math_1.CptoCk)({
                    θ: args.transformation.state.λ * 2 * Math.PI,
                    r: -spr,
                }));
                const points = cache.unculledNodes.map((d) => [d.cache.re, d.cache.im]);
                if (points.length > 0) {
                    const delaunay = d3.Delaunay.from(points);
                    cache.voronoiDiagram = delaunay.voronoi([-2, -2, 2, 2]);
                    cache.cells = Array.from(cache.voronoiDiagram.cellPolygons());
                }
                else {
                    cache.voronoiDiagram = null;
                    cache.cells = [];
                }
                ud.cacheMeta = {
                    minWeight: [0],
                    Δ: [performance.now() - t0],
                };
            },
            transformation: navTransformation,
            transform: (n) => (0, hyperbolic_math_2.CmulR)(n, -1),
            //caption:            (n:N)=> undefined,
            nodeRadius: () => 0.16,
            nodeScale: () => 1,
            nodeFilter: () => true,
            linkWidth: args.linkWidth,
            linkCurvature: args.linkCurvature,
            offsetLabels: args.offsetLabels,
            clipRadius: 1.7,
        });
    }
}
exports.UnitDiskNav = UnitDiskNav;
