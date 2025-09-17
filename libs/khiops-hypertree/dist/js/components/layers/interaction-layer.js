"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionLayer = void 0;
const d3 = require("d3");
const hyperbolic_math_1 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_3 = require("../../models/transformation/hyperbolic-math");
class InteractionLayer {
    constructor(view, args) {
        this.name = 'interaction';
        this.update = {
            parent: () => this.initMouseStuff(),
            data: () => { },
            transformation: () => { },
            style: () => { },
        };
        this.currMousePosAsArr = () => d3.mouse(this.view.parent.node());
        this.currMousePosAsC = () => (0, hyperbolic_math_2.ArrtoC)(this.currMousePosAsArr());
        this.findNodeByCell = () => {
            var m = this.currMousePosAsArr();
            var find = this.view.unitdisk.cache.voronoiDiagram.find(m[0], m[1]);
            return find ? find.data : undefined;
        };
        //-----------------------------------------------------------------------------------------
        this.onDragStart = (n, m) => {
            if (!this.animationTimer)
                this.view.unitdisk.args.transformation.onDragStart(m);
        };
        this.onDragλ = (l) => {
            this.view.unitdisk.args.transformation.onDragλ(l);
            this.view.hypertree.updateLayoutPath_(this.view.unitdisk.args.transformation.cache.centerNode); // hmmm?
            this.view.hypertree.update.transformation();
        };
        this.onDragByNode = (n, s, e) => {
            if (n && n.name == 'θ') {
                this.view.unitdisk.args.transformation.onDragθ(s, e);
                this.view.hypertree.update.transformation();
            }
            else if (n && n.name == 'λ') {
                this.onDragλ((0, hyperbolic_math_3.πify)((0, hyperbolic_math_1.CktoCp)((0, hyperbolic_math_2.CmulR)(e, -1)).θ) / 2 / Math.PI);
            }
            else {
                this.view.unitdisk.args.transformation.onDragP(s, e);
                this.view.hypertree.update.transformation();
            }
        };
        this.onDragEnd = (n, s, e) => {
            const ti3 = d3.timer(() => {
                ti3.stop();
                this.view.hypertree.args.objects.traces.length = 0;
                this.view.hypertree.update.transformation();
            }, 2000);
            var dc = (0, hyperbolic_math_2.CsubC)(s, e);
            var dist = Math.sqrt(dc.re * dc.re + dc.im * dc.im);
            if (dist < 0.006)
                this.onClick(n, e);
            this.view.unitdisk.args.transformation.onDragEnd(e);
            this.view.hypertree.update.transformation();
        };
        this.animationTimer = null;
        this.cancelAnimationTimer = () => {
            this.animationTimer.stop();
            this.animationTimer = null;
        };
        //-----------------------------------------------------------------------------------------
        this.dblClickTimer = null;
        this.cancelClickTimer = () => {
            clearTimeout(this.dblClickTimer);
            this.dblClickTimer = null;
        };
        this.onClick = (n, m) => {
            if (d3.event && d3.event.preventDefault)
                d3.event.preventDefault();
            m = m || this.currMousePosAsC();
            //m = n.cache
            if (!this.dblClickTimer)
                this.dblClickTimer = setTimeout(() => {
                    this.dblClickTimer = null;
                    if (n != this.view.unitdisk.args.transformation.cache.centerNode)
                        this.animateTo(n, m);
                    else
                        this.args.onClick(n, m);
                }, 300);
            else
                this.cancelClickTimer();
        };
        this.onDblClick = (n) => {
            d3.event.preventDefault();
            var m = this.currMousePosAsC();
            this.cancelClickTimer();
            this.args.onClick(n, m);
        };
        this.view = view;
        this.args = args;
    }
    initMouseStuff() {
        var dragStartPoint = null;
        var dragStartElement = null;
        let lasttransform = null;
        var zoom = d3
            .zoom() // zoomevents: start, end, mulitiple,
            .on('zoom', () => {
            console.assert(d3.event);
            if (d3.event &&
                d3.event.sourceEvent &&
                d3.event.sourceEvent.type === 'wheel') {
                const mΔ = d3.event.sourceEvent.deltaY;
                const λΔ = ((mΔ / 100) * 2 * Math.PI) / 16;
                const oldλp = this.view.unitdisk.args.transformation.state.λ;
                const newλp = oldλp - λΔ;
                const min = 0.1 * Math.PI;
                const max = 0.8 * Math.PI * 2;
                if (newλp < max && newλp > min)
                    this.onDragλ(newλp);
            }
            //
            else if (d3.event &&
                d3.event.sourceEvent &&
                d3.event.sourceEvent.type === 'touchmove') {
                // :D
                if (d3.event.transform.k !== lasttransform) {
                    lasttransform = d3.event.transform.k;
                    const newλp = d3.event.transform.k + 0.5;
                    const min = 0.1 * Math.PI;
                    const max = 0.8 * Math.PI * 2;
                    if (newλp.θ < max && newλp.θ > min)
                        this.onDragλ(newλp);
                }
                else {
                    this.onDragByNode(dragStartElement, dragStartPoint, this.currMousePosAsC());
                }
            }
            //
            else {
                this.onDragByNode(dragStartElement, dragStartPoint, this.currMousePosAsC());
            }
        })
            .on('start', () => {
            this.onDragStart((dragStartElement = this.findNodeByCell()), (dragStartPoint = this.currMousePosAsC()));
        })
            .on('end', () => {
            this.onDragEnd(dragStartElement, dragStartPoint, this.currMousePosAsC());
        });
        const htapi = this.view.hypertree.api;
        const hoverpath = this.view.hypertree.args.objects.pathes[0];
        this.view.parent
            .append('circle')
            .attr('class', 'mouse-circle')
            .attr('r', this.args.mouseRadius)
            .on('dblclick', (d) => this.onDblClick(this.findNodeByCell()))
            .on('mousemove', (d) => htapi.setPathHead(hoverpath, this.findNodeByCell()))
            .on('mouseout', (d) => htapi.setPathHead(hoverpath, undefined))
            .call(zoom)
            .on('dblclick.zoom', null);
    }
    animateTo(n, m) {
        if (this.animationTimer)
            return;
        this.onDragStart(n, m);
        var md = (0, hyperbolic_math_1.CktoCp)(m), initR = md.r, step = 1, steps = 20;
        this.animationTimer = d3.timer(() => {
            md.r = initR * (1 - (0, hyperbolic_math_3.sigmoid)(step++ / steps));
            if (step > steps) {
                this.cancelAnimationTimer();
                this.onDragEnd(n, m, (0, hyperbolic_math_1.CptoCk)(md));
            }
            else
                this.onDragByNode(n, m, (0, hyperbolic_math_1.CptoCk)(md));
        }, 1);
    }
}
exports.InteractionLayer = InteractionLayer;
