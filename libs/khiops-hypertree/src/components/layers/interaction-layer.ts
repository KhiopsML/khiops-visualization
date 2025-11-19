import { pointer, Delaunay, timer, zoom } from 'd3';
import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { N } from '../../models/n/n';
import { C, CptoCk, CktoCp } from '../../models/transformation/hyperbolic-math';
import {
  ArrtoC,
  CsubC,
  CmulR,
} from '../../models/transformation/hyperbolic-math';
import { πify, sigmoid } from '../../models/transformation/hyperbolic-math';

export interface InteractionLayerArgs extends ILayerArgs {
  mouseRadius;
  onClick;
}

export class InteractionLayer implements ILayer {
  view: ILayerView;
  args: InteractionLayerArgs;
  name = 'interaction';

  constructor(view: ILayerView, args: InteractionLayerArgs) {
    this.view = view;
    this.args = args;
  }

  update = {
    parent: () => this.initMouseStuff(),
    data: () => {},
    transformation: () => {},
    style: () => {},
  };

  currMousePosAsArr = (event) => pointer(event, this.view.parent.node());
  currMousePosAsC = (event) => ArrtoC(this.currMousePosAsArr(event));
  findNodeByCell = (event) => {
    var m = this.currMousePosAsArr(event);
    const clickableNodes = this.view.unitdisk.cache.unculledNodes.filter(
      (n: any) => n.precalc && n.precalc.clickable,
    );
    if (clickableNodes.length === 0) return undefined;

    const points: [number, number][] = clickableNodes.map((d) => [
      d.cache.re,
      d.cache.im,
    ]);
    const delaunay = Delaunay.from(points);
    const index = delaunay.find(m[0], m[1]);
    return index >= 0 ? clickableNodes[index] : undefined;
  };

  private initMouseStuff() {
    var dragStartPoint = null;
    var dragStartElement = null;
    let lasttransform = null;
    var zoomBehavior = zoom() // zoomevents: start, end, mulitiple,
      .on('zoom', (event) => {
        console.assert(event);

        if (event && event.sourceEvent && event.sourceEvent.type === 'wheel') {
          const mΔ = event.sourceEvent.deltaY;
          const λΔ = ((mΔ / 100) * 2 * Math.PI) / 16;
          const oldλp = this.view.unitdisk.args.transformation.state.λ;
          const newλp = oldλp - λΔ;

          const min = 0.1 * Math.PI;
          const max = 0.8 * Math.PI * 2;
          if (newλp < max && newλp > min) this.onDragλ(newλp);
        }
        //
        else if (
          event &&
          event.sourceEvent &&
          event.sourceEvent.type === 'touchmove'
        ) {
          // :D
          if (event.transform.k !== lasttransform) {
            lasttransform = event.transform.k;

            const newλp = event.transform.k + 0.5;
            const min = 0.1 * Math.PI;
            const max = 0.8 * Math.PI * 2;

            if (newλp.θ < max && newλp.θ > min) this.onDragλ(newλp);
          } else {
            this.onDragByNode(
              dragStartElement,
              dragStartPoint,
              this.currMousePosAsC(event),
            );
          }
        }
        //
        else {
          this.onDragByNode(
            dragStartElement,
            dragStartPoint,
            this.currMousePosAsC(event),
          );
        }
      })
      .on('start', (event) => {
        this.onDragStart(
          (dragStartElement = this.findNodeByCell(event)),
          (dragStartPoint = this.currMousePosAsC(event)),
        );
      })
      .on('end', (event) => {
        this.onDragEnd(
          dragStartElement,
          dragStartPoint,
          this.currMousePosAsC(event),
        );
      });

    const htapi = this.view.hypertree.api;
    const hoverpath = this.view.hypertree.args.objects.pathes[0];

    this.view.parent
      .append('circle')
      .attr('class', 'mouse-circle')
      .attr('r', this.args.mouseRadius)
      .on('dblclick', (event, d) =>
        this.onDblClick(event, this.findNodeByCell(event)),
      )
      .on('mousemove', (event, d) =>
        htapi.setPathHead(hoverpath, this.findNodeByCell(event)),
      )
      .on('mouseout', (event, d) => htapi.setPathHead(hoverpath, undefined))
      .call(zoomBehavior)
      .on('dblclick.zoom', null);
  }

  //-----------------------------------------------------------------------------------------

  private onDragStart = (n: N, m: C) => {
    if (!this.animationTimer)
      this.view.unitdisk.args.transformation.onDragStart(m);
  };

  private onDragλ = (l: number) => {
    this.view.unitdisk.args.transformation.onDragλ(l);
    this.view.hypertree.updateLayoutPath_(
      this.view.unitdisk.args.transformation.cache.centerNode,
    ); // hmmm?
    this.view.hypertree.update.transformation();
  };

  private onDragByNode = (n: N, s: C, e: C) => {
    if (n && n.name == 'θ') {
      this.view.unitdisk.args.transformation.onDragθ(s, e);
      this.view.hypertree.update.transformation();
    } else if (n && n.name == 'λ') {
      this.onDragλ(πify(CktoCp(CmulR(e, -1)).θ) / 2 / Math.PI);
    } else {
      this.view.unitdisk.args.transformation.onDragP(s, e);
      this.view.hypertree.update.transformation();
    }
  };

  private onDragEnd = (n: N, s: C, e: C) => {
    const ti3 = timer(() => {
      ti3.stop();
      this.view.hypertree.args.objects.traces.length = 0;
      this.view.hypertree.update.transformation();
    }, 500);

    var dc = CsubC(s, e);
    var dist = Math.sqrt(dc.re * dc.re + dc.im * dc.im);

    if (dist < 0.006) this.onClick(null, n, e);
    this.view.unitdisk.args.transformation.onDragEnd(e);
    this.view.hypertree.update.transformation();
  };

  private animationTimer = null;
  private cancelAnimationTimer = () => {
    this.animationTimer.stop();
    this.animationTimer = null;
  };
  private animateTo(n: N, m: C): void {
    if (this.animationTimer) return;

    this.onDragStart(n, m);

    var md = CktoCp(m),
      initR = md.r,
      step = 1,
      steps = 20;
    this.animationTimer = timer(() => {
      md.r = initR * (1 - sigmoid(step++ / steps));
      if (step > steps) {
        this.cancelAnimationTimer();
        this.onDragEnd(n, m, CptoCk(md));
      } else this.onDragByNode(n, m, CptoCk(md));
    }, 1);
  }

  //-----------------------------------------------------------------------------------------

  private dblClickTimer = null;
  private cancelClickTimer = () => {
    clearTimeout(this.dblClickTimer);
    this.dblClickTimer = null;
  };
  private onClick = (event, n: N, m) => {
    if (event && event.preventDefault) event.preventDefault();

    m = m || this.currMousePosAsC(event);
    //m = n.cache

    if (!this.dblClickTimer)
      this.dblClickTimer = setTimeout(() => {
        this.dblClickTimer = null;

        if (n != this.view.unitdisk.args.transformation.cache.centerNode)
          this.animateTo(n, m);
        else this.args.onClick(n, m);
      }, 300);
    else this.cancelClickTimer();
  };

  private onDblClick = (event, n: N) => {
    event.preventDefault();
    var m = this.currMousePosAsC(event);

    this.cancelClickTimer();
    this.args.onClick(n, m);
  };
}
