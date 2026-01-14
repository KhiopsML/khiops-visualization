import { pointer, Delaunay } from 'd3';
import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { N } from '../../models/n/n';
import { C, maxR } from '../../models/transformation/hyperbolic-math';
import { CktoCp, ArrtoC } from '../../models/transformation/hyperbolic-math';
import {
  CaddC,
  CsubC,
  CmulR,
} from '../../models/transformation/hyperbolic-math';
import { clone } from '../../models/transformation/hyperbolic-math';
import { compose, shift } from '../../models/transformation/hyperbolic-math';
import { setHoverNodeCache } from '../../models/hypertree/preset-process';

export interface InteractionLayer2Args extends ILayerArgs {
  mouseRadius;
  onClick;
}

export class InteractionLayer2 implements ILayer {
  view: ILayerView;
  args: InteractionLayer2Args;
  name = 'interaction-2';

  mousedown: boolean;
  dST;
  htapi;
  hoverpath;
  dragStartTime: number;

  constructor(view: ILayerView, args: InteractionLayer2Args) {
    this.view = view;
    this.args = args;
    this.htapi = this.view.hypertree.api;
    this.hoverpath = this.view.hypertree.args.objects.pathes[0];
    this.mousedown = false;
  }

  update = {
    parent: () => this.updateParent(),
    data: () => {},
    transformation: () => {},
    style: () => {},
  };

  private updateParent() {
    const mousehandlers = (de) =>
      de
        .on('wheel', (event) => this.fireMouseWheelEvent(event))

        .on('mousedown', (event) => this.fireMouseDown(event))
        .on('mousemove', (event) => {
          this.fireNodeHover(this.findNodeByCell(event));
          this.fireMouseMove(event);
        })
        .on('mouseup', (event) => this.fireMouseUp(event))
        .on('mouseout', (event) => {
          this.fireNodeHover(undefined);
          this.htapi.setPathHead(this.hoverpath, undefined);
        })

        .on('touchstart', (event) =>
          this.fireTouchEvent(event, 'onPointerStart'),
        )
        .on('touchmove', (event) => this.fireTouchEvent(event, 'onPointerMove'))
        .on('touchend', (event) => this.fireTouchEvent(event, 'onPointerEnd'))
        .on('touchcancel', (event) =>
          this.fireTouchEvent(event, 'onPointerEnd'),
        );

    this.view.parent
      .append('circle')
      .attr('class', 'mouse-circle')
      .attr('r', 5)
      .call(mousehandlers);

    this.view.parent
      .append('circle')
      .attr('class', 'mouse-circle-cursor')
      .attr('r', this.args.mouseRadius)
      .call(mousehandlers);
  }

  // just to keep the list above clear

  private fireMouseDown(event) {
    this.mousedown = true;
    const m = this.currMousePosAsC(event);
    this.onPointerStart('mouse', m);
  }

  private fireMouseMove(event) {
    if (this.mousedown) {
      const m = this.currMousePosAsC(event);
      if (this.onPointerMove('mouse', m)) {
        this.view.hypertree.update.transformation();
      }
    } else {
      if (
        !this.view.hypertree.isInitializing &&
        !this.view.hypertree.isAnimationRunning()
      )
        this.htapi.setPathHead(this.hoverpath, this.findNodeByCell(event));
    }
  }

  private fireMouseUp(event) {
    this.mousedown = false;
    const m = this.currMousePosAsC(event);
    if (this.onPointerEnd('mouse', m)) {
      this.view.hypertree.update.transformation();
    }
  }

  private fireNodeHover(n) {
    //fire onNodeHover if the node is close enough
    //or if the node is undefined, we will also tell the onNodeHover function

    if (this.mousedown) {
      //when we are dragging, hide the popup
      setHoverNodeCache(undefined, this.view.unitdisk.cache);
      this.view.hypertree.args.interaction.onHoverNodeChange(undefined);
      return;
    }

    if (
      (!this.view.unitdisk.cache.lastHovered && !n) ||
      (this.view.unitdisk.cache.lastHovered &&
        n &&
        this.view.unitdisk.cache.lastHovered.data.id === n.data.id)
    )
      return;

    if (n && n.distScale > 0.5) {
      setHoverNodeCache(n, this.view.unitdisk.cache);
      if (this.view.hypertree.args.interaction.onHoverNodeChange) {
        this.view.hypertree.args.interaction.onHoverNodeChange(n);
      }
    } else {
      // Use setTimeout instead of await delay to avoid blocking
      setTimeout(() => {
        if (!this.view.unitdisk.cache.lastHovered) return;

        setHoverNodeCache(undefined, this.view.unitdisk.cache);
        if (this.view.hypertree.args.interaction.onHoverNodeChange) {
          this.view.hypertree.args.interaction.onHoverNodeChange(undefined);
        }
      }, 100);
    }
  }

  //-----------------------------------------------------------------------------------------

  private fireMouseEvent(event, eventName: string) {
    event.stopPropagation();
    event.preventDefault();

    const m = this.currMousePosAsC(event);
    try {
      if (this[eventName]('mouse', m))
        this.view.hypertree.update.transformation();
    } catch (error) {}
  }

  private fireMouseWheelEvent(event) {
    event.stopPropagation();
    event.preventDefault();

    const mΔ = event.deltaY;
    const oldλp = this.view.unitdisk.args.transformation.state.λ;
    const Δsens = this.view.hypertree.args.interaction.wheelFactor;
    const newλp = mΔ >= 0 ? oldλp / Δsens : oldλp * Δsens; //- λΔ

    if (
      newλp > this.view.hypertree.args.interaction.λbounds[0] &&
      newλp < this.view.hypertree.args.interaction.λbounds[1]
    ) {
      const m = this.currMousePosAsArr(event);

      const t = this.view.unitdisk.args.transformation;
      const preservingNode = this.findUnculledNodeByCell(ArrtoC(m));
      t.onDragλ(newλp);

      // Only update layout path if we have a valid preservingNode
      if (preservingNode && typeof preservingNode.ancestors === 'function') {
        this.view.hypertree.updateLayoutPath_(preservingNode); // only path to center
        t.state.P = compose(
          t.state,
          shift(
            t.state,
            {
              re: 0,
              im: 0,
            },
            preservingNode.cache,
          ),
        ).P;
      }

      this.view.hypertree.update.transformation();
    }
  }

  private fireTouchEvent(event, eventName: string) {
    event.stopPropagation();
    event.preventDefault();

    const changedTouches = event.changedTouches;
    let update = false;
    for (let i = 0; i < changedTouches.length; ++i) {
      const t = changedTouches[i];
      const pid = t.identifier;
      const m = ArrtoC(pointer(t, this.view.parent.node()));

      update = this[eventName](pid, m) || update;
    }
    requestAnimationFrame(() => {
      if (update) this.view.hypertree.update.transformation();
    });
  }

  //-----------------------------------------------------------------------------------------

  // NoInteractionState extends Dragstate
  // MouseDownState extends Dragstate
  // PanState extends Dragstate
  // PinchState extends Dragstate
  private pinchState: {
    pinchInitDist: number;
    pinchInitλp: number;
    pinchcenter: C;
    pinchPreservingNode: N;
    onPointerStart;
    onPointerMove;
    onPointerEnd;
  };
  private panStart: C = null;
  private pinchInitDist: number = null;
  private pinchInitλp: number = null;
  private nopinch: boolean = null;
  private pinchcenter: C = null;
  private pinchPreservingNode = null;

  private onPointerStart(pid, m: C) {
    if (CktoCp(m).r >= 1) return false;

    this.view.hypertree.args.objects.traces.push({
      id: pid,
      points: [m],
    });

    if (this.view.hypertree.args.objects.traces.length === 1) {
      this.dragStartTime = performance.now();
      // Cancel any running animation so drag starts immediately
      // This ensures the transformation state is not changing during drag initialization
      this.view.hypertree.transition = undefined;
      this.dST = clone(this.view.unitdisk.args.transformation.state);
      this.view.unitdisk.isDraging = true;
      this.panStart = m;
      this.nopinch = true;
    } else if (this.view.hypertree.args.objects.traces.length === 2) {
      const t0 = this.view.hypertree.args.objects.traces[0];
      const t0e = t0.points[t0.points.length - 1];
      this.pinchcenter = CmulR(CaddC(t0e, m), 0.5);
      this.view.unitdisk.pinchcenter = this.pinchcenter;
      this.pinchPreservingNode = this.findUnculledNodeByCell(this.pinchcenter);
      this.pinchInitDist = this.dist(t0e, m);
      this.pinchInitλp = this.view.unitdisk.args.transformation.state.λ;
      this.nopinch = false;
    } else {
    }
    return false;
  }

  private onPointerMove(pid, m) {
    const trace = this.findTrace(pid);
    if (!trace) {
      return false;
    }
    trace.points.push(m);

    if (this.view.hypertree.args.objects.traces.length === 1) {
      const t = this.view.unitdisk.args.transformation;
      t.state.P = compose(
        this.dST,
        shift(this.dST, this.panStart, maxR(m, 0.9)),
      ).P;
    } else if (this.view.hypertree.args.objects.traces.length === 2) {
      const t0 = this.view.hypertree.args.objects.traces[0];
      const t0e = t0.points[t0.points.length - 1];
      const t1 = this.view.hypertree.args.objects.traces[1];
      const t1e = t1.points[t1.points.length - 1];
      const dist = this.dist(t0e, t1e);
      const f = dist / this.pinchInitDist;
      const newλp = this.pinchInitλp * f;

      if (
        newλp > this.view.hypertree.args.interaction.λbounds[0] &&
        newλp < this.view.hypertree.args.interaction.λbounds[1]
      ) {
        const pinchcenter2 = maxR(
          CmulR(CaddC(t0e, t1e), 0.5),
          this.args.mouseRadius,
        );

        const t = this.view.unitdisk.args.transformation;
        t.onDragλ(newλp);
        this.view.hypertree.updateLayoutPath_(this.pinchPreservingNode); // only path to center
        t.state.P = compose(
          t.state,
          shift(
            t.state,
            {
              re: 0,
              im: 0,
            },
            this.pinchPreservingNode.cache,
          ),
        ).P;
        t.state.P = compose(
          t.state,
          shift(t.state, this.pinchcenter, pinchcenter2),
        ).P;

        this.pinchcenter = CmulR(CaddC(this.pinchcenter, pinchcenter2), 0.5);
        this.view.unitdisk.pinchcenter = this.pinchcenter;
      }
    } else {
    }
    return true;
  }

  private onPointerEnd(pid, m) {
    // Save trace info before filtering
    const currentTrace = this.view.hypertree.args.objects.traces.find(
      (e) => e.id === pid,
    );
    const moveCount = currentTrace ? currentTrace.points.length : 0;

    this.view.hypertree.args.objects.traces =
      this.view.hypertree.args.objects.traces.filter((e) => e.id !== pid);

    this.pinchcenter = undefined;
    this.view.unitdisk.pinchcenter = this.pinchcenter;
    this.pinchPreservingNode = undefined;

    if (this.view.hypertree.args.objects.traces.length === 0) {
      this.dST = undefined;
      this.view.unitdisk.isDraging = false;

      // Treat as click only if:
      // 1. Distance is extremely small (< 0.006)
      // 2. It's not a pinch gesture
      // 3. Very few move events were recorded (1-2 points = almost no movement during drag)
      const distance = this.dist(this.panStart, m);
      if (distance < 0.006 && this.nopinch && moveCount <= 2) {
        if (CktoCp(m).r < 1) {
          this.click(m);
          return false;
        }
      }
    } else if (this.view.hypertree.args.objects.traces.length === 1) {
      const otherPoints = this.view.hypertree.args.objects.traces[0].points;
      this.panStart = otherPoints[otherPoints.length - 1]; //others.lastpoint

      this.dST = clone(this.view.unitdisk.args.transformation.state);
      this.view.unitdisk.isDraging = true;
    } else {
    }
    return true;
  }

  //-----------------------------------------------------------------------------------------

  public ripple(n: N, m: C, ok, useClip = true) {
    if (
      useClip &&
      !this.view.unitdisk.layerStack.layers['cells'].args.invisible
    ) {
      const rippleClip = this.view.parent
        .append('clipPath')
        .attr('id', `cell-clip-${n.mergeId}`)
        .html(`<use xlink:href="#cell-${n.mergeId}"></use>`);

      const rippleCircle = this.view.parent
        .insert('g', ':first-child')
        .attr('class', 'ripple-world')
        .attr('clip-path', `url(#cell-clip-${n.mergeId})`)
        .append('circle')
        .attr('class', 'ripple-circle')
        .attr('r', 0.1)
        .attr('cx', m.re)
        .attr('cy', m.im)
        .attr('transform-origin', `${m.re}  ${m.im}`)
        .on('animationend', () => {
          rippleCircle.remove();
          rippleClip.remove();
          ok();
        });
    } else {
      const rippleCircle = this.view.parent
        .insert('g', ':first-child')
        .attr('class', 'ripple-world')
        .append('circle')
        .attr('class', 'ripple-circle')
        .attr('r', 0.1)
        .attr('cx', m.re)
        .attr('cy', m.im)
        .attr('transform-origin', `${m.re}  ${m.im}`)
        .on('animationend', () => {
          rippleCircle.remove();
          ok();
        });
    }
  }

  private click(m: C) {
    // For D3 v6, we need to find the closest node from the cache directly
    const clickableNodes = this.view.unitdisk.cache.unculledNodes.filter(
      (n: any) => n.precalc && n.precalc.clickable,
    );
    if (clickableNodes.length === 0) {
      this.view.hypertree.args.interaction.onNodeClick(undefined, m, this);
      return;
    }

    const points: [number, number][] = clickableNodes.map((d) => [
      d.cache.re,
      d.cache.im,
    ]);
    const delaunay = Delaunay.from(points);
    const index = delaunay.find(m.re, m.im);
    const n = index >= 0 ? clickableNodes[index] : undefined;

    if (!this.view.hypertree.isAnimationRunning())
      this.view.hypertree.args.interaction.onNodeClick(n, m, this);
  }

  private findTrace(pid) {
    return this.view.hypertree.args.objects.traces.find((e) => e.id === pid);
  }

  private currMousePosAsArr = (event) =>
    pointer(event, this.view.parent.node());
  private currMousePosAsC = (event) => ArrtoC(this.currMousePosAsArr(event));
  private findNodeByCell = (event) => {
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

  private findUnculledNodeByCell = (m: C) => {
    const points: [number, number][] =
      this.view.unitdisk.cache.unculledNodes.map((d) => [
        d.cache.re,
        d.cache.im,
      ]);
    const delaunay = Delaunay.from(points);
    const voronoiDiagram = delaunay.voronoi([-2, -2, 2, 2]);
    const findIndex = delaunay.find(m.re, m.im);
    const find =
      findIndex >= 0
        ? this.view.unitdisk.cache.unculledNodes[findIndex]
        : undefined;
    return find; // Return the full node, not find.data
  };

  private dist(a: C, b: C) {
    // Add null checks to prevent reading properties of null
    if (!a || !b) {
      return 0;
    }
    const diff = CsubC(a, b);
    return Math.sqrt(diff.re * diff.re + diff.im * diff.im);
  }
}

interface DragState {
  onPointerStart(pid: number, m: C): void;
  onPointerMove(pid: number, m: C): void;
  onPointerEnd(pid: number, m: C): void;
}

class NoInteractionState implements DragState {
  constructor() {}
  public onPointerStart(pid: number, m: C) {}
  public onPointerMove(pid: number, m: C) {}
  public onPointerEnd(pid: number, m: C) {}
}

class MouseDownState implements DragState {
  constructor() {}
  public onPointerStart(pid: number, m: C) {}
  public onPointerMove(pid: number, m: C) {}
  public onPointerEnd(pid: number, m: C) {}
}
