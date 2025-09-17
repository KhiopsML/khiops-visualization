import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { N } from '../../models/n/n';
import { C } from '../../models/transformation/hyperbolic-math';
export interface InteractionLayer2Args extends ILayerArgs {
    mouseRadius: any;
    onClick: any;
}
export declare class InteractionLayer2 implements ILayer {
    view: ILayerView;
    args: InteractionLayer2Args;
    name: string;
    mousedown: boolean;
    dST: any;
    htapi: any;
    hoverpath: any;
    constructor(view: ILayerView, args: InteractionLayer2Args);
    update: {
        parent: () => void;
        data: () => void;
        transformation: () => void;
        style: () => void;
    };
    private updateParent;
    private fireMouseDown;
    private fireMouseMove;
    private fireMouseUp;
    private fireNodeHover;
    private delay;
    private fireMouseEvent;
    private fireMouseWheelEvent;
    private fireTouchEvent;
    private pinchState;
    private panStart;
    private pinchInitDist;
    private pinchInitλp;
    private nopinch;
    private pinchcenter;
    private pinchPreservingNode;
    private onPointerStart;
    private onPointerMove;
    private onPointerEnd;
    ripple(n: N, m: C, ok: any, useClip?: boolean): void;
    private click;
    private findTrace;
    private currMousePosAsArr;
    private currMousePosAsC;
    private findNodeByCell;
    private findUnculledNodeByCell;
    private dist;
}
