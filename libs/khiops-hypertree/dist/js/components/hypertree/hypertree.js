"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = exports.Transition = exports.Hypertree = void 0;
const d3 = require("d3");
const ducd_1 = require("../../ducd/");
const ducd_2 = require("../../ducd/");
const n_layouts_1 = require("../../models/n/n-layouts");
const hyperbolic_math_1 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_3 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_4 = require("../../models/transformation/hyperbolic-math");
const preset_base_1 = require("../../models/hypertree/preset-base");
const ducd_3 = require("../../ducd/");
let globelhtid = 0;
const hypertreehtml = `<div class="unitdisk-nav">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="-0 0 1000 1000">
        </svg>
    </div>`;
class Hypertree {
    constructor(view, args) {
        this.log = [];
        this.isInitializing = false;
        this.lastCenterNode = undefined;
        /*
         * this functions modyfy model/view (this class internal state)
         * and call the according update function(s)
         */
        this.api = {
            setModel: (model) => {
                return new Promise((ok, err) => {
                    this.isInitializing = true;
                    const base = preset_base_1.presets.modelBase();
                    this.args = (0, ducd_3.mergeDeep)(base, model);
                    this.update.view.parent();
                    this.api.setDataloader(ok, err, this.args.dataloader); // resetData
                    this.api.setLangloader(ok, err, this.args.langloader);
                });
            },
            updateNodesVisualization: () => {
                return new Promise((ok, err) => {
                    const previousPosition = JSON.parse(JSON.stringify(this.args.geometry.transformation.state.P));
                    this.updateWeights_();
                    this.update.transformation();
                    // Go to previous state without animation
                    this.animateTo(ok, err, previousPosition, null);
                });
            },
            setLangloader: (ok, err, ll) => {
                this.args.langloader = ll;
                this.args.langloader((langMap, t1, dl) => {
                    this.langMap = langMap || {};
                    this.updateLang_();
                    this.update.data();
                    if (this.data) {
                        this.isInitializing = false;
                        // try to fix broken hyperview at init #170
                        // works on nodes change but not at first init
                        // this.api.updateNodesVisualization();
                        ok();
                    }
                });
            },
            setDataloader: (ok, err, dl) => {
                this.args.dataloader = dl;
                const t0 = performance.now();
                this.resetData();
                this.args.dataloader((d3h, t1, dl) => {
                    this.initData(d3h, t0, t1, dl);
                    if (this.langMap) {
                        this.isInitializing = false;
                        ok();
                    }
                });
            },
            updateDataloader: (ok, err, dl) => {
                this.args.dataloader = dl;
                const t0 = performance.now();
                this.resetData();
                this.args.dataloader((d3h, t1, dl) => {
                    this.initData(d3h, t0, t1, dl);
                    if (this.langMap) {
                        this.isInitializing = false;
                        ok();
                    }
                });
            },
            toggleSelection: (n) => {
                this.toggleSelection(n);
                if (this.args.objects.pathes.length > 10 + 1) {
                    const toremove = this.args.objects.selections[0];
                    this.args.objects.selections = this.args.objects.selections.filter((e) => e !== toremove);
                    this.removePath('SelectionPath', toremove);
                }
                this.update.pathes();
            },
            addPath: (pathid, node, color) => {
                this.addPath(pathid, node, color);
            },
            removePath: (pathid, node) => {
                this.removePath(pathid, node);
            },
            setPathHead: (pathType, n) => {
                if (!this.isInitializing && !this.isAnimationRunning()) {
                    this.setPathHead(pathType, n);
                    this.update.pathes();
                }
            },
            selectQuery: (query, prop) => {
                const lq = query ? query.toLowerCase() : null;
                this.data.each((n) => {
                    n.pathes.partof = [];
                    n.pathes.headof = undefined;
                    n.pathes.labelcolor = undefined;
                    n.pathes.finalcolor = undefined;
                    n.pathes.isPartOfAnyQuery = false;
                });
                this.args.objects.pathes = [];
                this.data.each((n) => {
                    if (n.data) {
                        if (n.data.name.toLowerCase().includes(lq))
                            this.addPath('Query', n);
                        if (n.precalc && n.precalc.label)
                            if (n.precalc.label.toLowerCase().includes(lq))
                                this.addPath('Query', n);
                    }
                });
                this.update.pathes();
            },
            gotoHome: (duration) => new Promise((ok, err) => this.animateTo(ok, err, {
                re: 0,
                im: 0,
            }, null, duration)),
            gotoNode: (n, duration) => new Promise((ok, err) => {
                var _a, _b;
                if ((_b = (_a = n === null || n === void 0 ? void 0 : n.layout) === null || _a === void 0 ? void 0 : _a.z) === null || _b === void 0 ? void 0 : _b.re) {
                    this.animateTo(ok, err, (0, hyperbolic_math_3.CmulR)({
                        re: n.layout.z.re,
                        im: n.layout.z.im,
                    }, -1), null, duration);
                }
            }),
            goto: (p, l) => new Promise((ok, err) => this.animateTo(ok, err, p, l)),
            gotoλ: (l) => new Promise((ok, err) => this.animateToλ(ok, err, l)),
        };
        /*
         * this functions assume the model/view (this class internal state)
         * has changes, and call the according ui updates (animatin frames)
         */
        this.update = {
            view: {
                parent: () => {
                    this.updateParent();
                },
                unitdisk: () => {
                    this.updateUnitdiskView();
                },
            },
            data: () => {
                this.unitdisk.update.data();
            },
            transformation: () => this.unitdisk.update.transformation(),
            pathes: () => this.unitdisk.update.pathes(),
            centernode: (centerNode) => {
                if (this.lastCenterNode &&
                    this.lastCenterNode.mergeId == centerNode.mergeId)
                    return;
                this.lastCenterNode = centerNode;
                const pathStr = centerNode
                    .ancestors()
                    .reduce((a, e) => `${e.precalc.label ? '  ' + e.precalc.label + '  ' : ''}${a ? '›' : ''}${a}`, '');
                if (this.args.interaction.onCenterNodeChange)
                    this.args.interaction.onCenterNodeChange(centerNode, pathStr);
            },
        };
        //########################################################################################################
        //##
        //## internal functions, calles by ...?
        //##
        //########################################################################################################
        this.virtualCanvas = undefined;
        this.virtualCanvasContext = undefined;
        //########################################################################################################
        //##
        //## Path
        //##
        //########################################################################################################
        this.btnPathId = (pathType, n) => `btn-path-${pathType}` +
            (pathType === 'SelectionPath' ? `-${n === null || n === void 0 ? void 0 : n.mergeId}` : '');
        this.view_ = view;
        this.initPromise = this.api.setModel(args);
    }
    //########################################################################################################
    //##
    //## View Updates
    //##
    //########################################################################################################
    updateParent() {
        this.view_.parent.innerHTML = ''; // actually just remove this.view if present ... do less
        this.view_.html = ducd_1.HTML.parse(hypertreehtml)();
        this.view_.parent.appendChild(this.view_.html);
        this.updateUnitdiskView();
    }
    updateUnitdiskView() {
        var udparent = this.view_.html.querySelector('.unitdisk-nav > svg');
        this.unitdisk = new this.args.geometry.decorator({
            parent: udparent,
            className: 'unitDisc',
            position: 'translate(500,500) scale(480)',
            hypertree: this,
        }, {
            data: null, //this.data,
            decorator: null,
            transformation: this.args.geometry.transformation,
            transform: (n) => this.unitdisk.args.transformation.transformPoint(n.layout.z),
            layers: this.args.geometry.layers,
            layerOptions: this.args.geometry.layerOptions,
            cacheUpdate: this.args.geometry.cacheUpdate,
            clipRadius: this.args.geometry.clipRadius,
            nodeRadius: this.args.geometry.nodeRadius,
            nodeScale: this.args.geometry.nodeScale,
            nodeFilter: this.args.geometry.nodeFilter,
            linkWidth: this.args.geometry.linkWidth,
            linkCurvature: this.args.geometry.linkCurvature,
            offsetLabels: this.args.geometry.offsetLabels,
        });
    }
    //########################################################################################################
    //##
    //## Sync blocks for async api functions
    //##
    //########################################################################################################
    resetData() {
        this.unitdisk.args.data = undefined;
        this.data = undefined;
        this.langMap = undefined;
        this.args.geometry.transformation.state.λ = 0.001;
        this.args.geometry.transformation.state.P.re = 0;
        this.args.geometry.transformation.state.P.im = 0;
        this.args.filter.weightFilter.magic = 20;
        this.args.geometry.transformation.cache.centerNode = undefined;
        this.args.objects.selections = [];
        this.args.objects.pathes = [];
        this.args.objects.traces = [];
        requestAnimationFrame(() => this.update.data());
    }
    initData(d3h, t0, t1, dl) {
        var t2 = performance.now();
        var ncount = 1;
        globelhtid++;
        this.data = d3.hierarchy(d3h).each((n) => {
            n.globelhtid = globelhtid;
            n.mergeId = ncount++;
            n.data = n.data || {};
            n.precalc = {};
            n.pathes = {};
            n.layout = null;
            n.layoutReference = null;
        });
        this.unitdisk.args.data = this.data;
        this.args.geometry.transformation.cache.N = this.data.descendants().length;
        // layout initiialisation
        const startAngle = this.args.layout.rootWedge.orientation;
        const defAngleWidth = this.args.layout.rootWedge.angle;
        this.data.layout = {
            wedge: {
                α: (0, hyperbolic_math_1.πify)(startAngle - defAngleWidth / 2),
                Ω: (0, hyperbolic_math_1.πify)(startAngle + defAngleWidth / 2),
            },
        };
        (0, n_layouts_1.setZ)(this.data, {
            re: 0,
            im: 0,
        });
        // PRECALC:
        var t3 = performance.now();
        this.updateWeights_();
        // cells können true initialisert werden
        this.data.each((n) => (n.precalc.clickable = true));
        this.modelMeta = {
            Δ: [t1 - t0, t2 - t1, t3 - t2, performance.now() - t3],
            filesize: dl,
            nodecount: ncount - 1,
        };
        this.updateLang_();
        this.findInitλ_();
    }
    updateWeights_() {
        this.sum(this.data, this.args.layout.weight, 'layoutWeight');
        this.sum(this.data, this.args.filter.weightFilter.weight, 'cullingWeight');
        this.sum(this.data, this.args.layout.weight, 'visWeight');
        // for arc width and node radius in some cases, not flexible enough
        this.data.each((n) => (n.precalc.weightScale =
            (Math.log2(n.precalc.visWeight) || 1) /
                (Math.log2(this.data.precalc.visWeight || this.data.children.length) || 1)));
    }
    sum(data, value, target) {
        data.eachAfter((node) => {
            let sum = +value(node) || 0;
            const children = node.children;
            var i = children && children.length;
            while (--i >= 0)
                sum += children[i].precalc[target];
            node.precalc[target] = sum;
        });
    }
    updateLang_() {
        if (this.data) {
            this.data.each((n) => this.args.langInitBFS(this, n));
            this.updateLabelLen_();
        }
    }
    findInitλ_() {
        for (let i = 0; i < 50; i++) {
            const progress01 = i / 50;
            const λ = 0.02 + (0, hyperbolic_math_4.sigmoid)(progress01) * 0.75;
            this.args.geometry.transformation.state.λ = λ;
            this.updateLayoutPath_(this.data);
            this.unitdisk.args.cacheUpdate(this.unitdisk, this.unitdisk.cache);
            const unculledNodes = this.args.geometry.transformation.cache.unculledNodes;
            const maxR = unculledNodes.reduce((max, n) => Math.max(max, n.layout.zp.r), 0);
            if (maxR > (this.args.layout.initSize || 0.95)) {
                break;
            }
        }
        this.data.each((n) => (n.layoutReference = (0, ducd_2.clone)(n.layout)));
    }
    updateLabelLen_() {
        var canvas = this.virtualCanvas ||
            (this.virtualCanvas = document.createElement('canvas'));
        var context = this.virtualCanvasContext ||
            (this.virtualCanvasContext = canvas.getContext('2d'));
        const updateLabelLen_ = (txtprop, lenprop) => {
            this.data.each((n) => {
                if (n.precalc[txtprop]) {
                    const metrics = context.measureText(n.precalc[txtprop]);
                    n.precalc[lenprop] = metrics.width / 200 / window.devicePixelRatio;
                }
                else
                    n.precalc[lenprop] = undefined;
            });
        };
        updateLabelLen_('label', 'labels-forcelen');
        updateLabelLen_('label', 'labelslen');
        updateLabelLen_('label2', 'labels2len');
        updateLabelLen_('icon', 'emojislen');
    }
    updateLayoutPath_(preservingnode) {
        const t = this.args.geometry.transformation;
        const t0 = performance.now();
        preservingnode
            .ancestors()
            .reverse()
            .forEach((n) => this.args.layout.type(n, t.state.λ, true));
        t.state.P = (0, hyperbolic_math_3.CmulR)(preservingnode.layout.z, -1); // set preserving node back to .... zero? no, orig pos?
        this.layoutMeta = {
            Δ: performance.now() - t0,
        };
    }
    addIfNotInSafe(arr, newE, side = 'unshift') {
        if (!arr)
            return [newE];
        if (!arr.includes(newE))
            arr[side](newE);
        return arr;
    }
    toggleSelection(n) {
        if (this.args.objects.selections.includes(n)) {
            this.args.objects.selections = this.args.objects.selections.filter((e) => e !== n);
            this.removePath('SelectionPath', n);
        }
        else {
            this.args.objects.selections.push(n);
            this.addPath('SelectionPath', n);
        }
    }
    setPathHead(path, n) {
        const pt = path ? path.type : 'HoverPath';
        const oldPathId = this.btnPathId(pt, n);
        const oldPath = this.args.objects.pathes.find((e) => e.id === oldPathId);
        if (oldPath)
            this.removePath(pt, oldPath.head);
        if (n)
            this.addPath(pt, n);
    }
    addPath(pathType, n, color) {
        color = color || '#8ba9dd';
        const newpath = {
            type: pathType,
            id: this.btnPathId(pathType, n),
            icon: {
                HoverPath: 'mouse',
            }[pathType] || 'place',
            head: n,
            headName: n.precalc.label,
            ancestors: n.ancestors(),
            color: color,
        };
        // model mod
        this.args.objects.pathes.push(newpath);
        n.pathes.headof = newpath;
        if (pathType !== 'HoverPath')
            n.pathes.finalcolor = n.pathes.labelcolor = newpath.color;
        // model mod: node context
        n.ancestors().forEach((pn) => {
            pn.pathes.partof = this.addIfNotInSafe(pn.pathes.partof, newpath, pathType === 'HoverPath' ? 'push' : 'unshift');
            if (pathType !== 'HoverPath')
                pn.pathes.finalcolor = newpath.color;
            pn.pathes[`isPartOfAny${pathType}`] = true;
        });
        return newpath;
    }
    removePath(pathType, n) {
        try {
            const pathId = this.btnPathId(pathType, n);
            if (this.args.objects.pathes) {
                // model mod
                this.args.objects.pathes = this.args.objects.pathes.filter((e) => e.id !== pathId);
                n.pathes.headof = undefined;
                if (pathType !== 'HoverPath')
                    n.pathes.labelcolor = undefined;
                // model mod: node context
                n.ancestors().forEach((pn) => {
                    if (pn.pathes.partof) {
                        pn.pathes.partof = pn.pathes.partof.filter((e) => e.id !== pathId);
                        pn.pathes.finalcolor =
                            pn.pathes.partof.length > 0
                                ? pn.pathes.partof[0].color
                                : undefined;
                        if (pn.pathes.finalcolor === 'none')
                            pn.pathes.finalcolor = undefined;
                        const nodeFlagName = `isPartOfAny${pathType}`;
                        pn.pathes[nodeFlagName] = pn.pathes.partof.some((e) => e.type === pathType);
                    }
                });
            }
        }
        catch (e) {
            console.warn('no path to remove', e);
        }
    }
    //########################################################################################################
    //##
    //## Animation frames ans animations
    //##
    //########################################################################################################
    drawDetailFrame() {
        this.update.data();
    }
    animateUp(ok, err) {
        const newλ = this.args.geometry.transformation.state.λ;
        this.args.geometry.transformation.state.λ = 0.001;
        this.animateToλ(ok, err, newλ);
    }
    animateToλ(ok, err, newλ, duration = 300) {
        const initλ = this.args.geometry.transformation.state.λ;
        const way = initλ - newλ;
        new Animation({
            name: 'animateToλ',
            hypertree: this,
            duration: duration,
            resolve: ok,
            reject: err,
            frame: (progress01) => {
                const waydone01 = 1 - (0, hyperbolic_math_4.sigmoid)(progress01);
                const waydone = way * waydone01;
                const λ = newλ + waydone;
                this.args.geometry.transformation.state.λ = λ;
                this.updateLayoutPath_(this.args.geometry.transformation.cache.centerNode);
                this.update.transformation();
            },
        });
    }
    animateTo(resolve, reject, newP, newλ, duration = 750) {
        const initTS = (0, ducd_2.clone)(this.args.geometry.transformation.state);
        const way = (0, hyperbolic_math_3.CsubC)(initTS.P, newP);
        new Animation({
            name: 'animateTo',
            resolve: resolve,
            reject: reject,
            hypertree: this,
            duration: duration,
            frame: (progress01) => {
                const waydone01 = 1 - (0, hyperbolic_math_4.sigmoid)(progress01);
                // console.assert(waydone01 >= 0 && waydone01 <= 1)
                const waydone = (0, hyperbolic_math_3.CmulR)(way, waydone01);
                const animP = (0, hyperbolic_math_3.CaddC)(newP, waydone);
                (0, hyperbolic_math_2.CassignC)(this.args.geometry.transformation.state.P, animP);
                this.update.transformation();
            },
        });
    }
    isAnimationRunning() {
        const view = this.unitdisk && this.unitdisk.isDraging;
        const nav = this.unitdisk && this.unitdisk.isDraging;
        const lowdetail = this.transition ? this.transition.lowdetail : false;
        return view || nav || lowdetail;
    }
}
exports.Hypertree = Hypertree;
class Transition {
    constructor(hypertree) {
        this.frames = [];
        this.lowdetail = true;
        this.hypertree = hypertree;
    }
    begin() {
        this.beginTime = performance.now();
    }
    end() {
        this.currentframe = undefined;
        this.hypertree.transition = undefined;
        // console.groupEnd()
    }
}
exports.Transition = Transition;
class Frame {
    constructor(nr) {
        this.nr = nr;
        this.created = performance.now();
    }
}
exports.Frame = Frame;
class Animation extends Transition {
    constructor(args) {
        super(args.hypertree);
        if (args.hypertree.transition) {
            return;
        }
        args.hypertree.transition = this;
        this.hypertree.log.push(this.hypertree.transition);
        const frame = () => {
            this.currentframe = new Frame(0);
            this.frames.push(this.currentframe);
            const now = performance.now();
            if (!this.beginTime) {
                this.begin();
                this.endTime = now + args.duration;
            }
            const done = now - this.beginTime;
            const p01 = done / args.duration;
            if (now > this.endTime) {
                args.frame(1);
                this.end();
                args.resolve();
            }
            else {
                args.frame(p01);
                requestAnimationFrame(() => frame());
            }
            this.currentframe = undefined;
        };
        requestAnimationFrame(() => frame());
    }
}
