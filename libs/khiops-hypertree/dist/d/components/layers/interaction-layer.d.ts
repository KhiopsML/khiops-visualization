import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { N } from '../../models/n/n';
export interface InteractionLayerArgs extends ILayerArgs {
    mouseRadius: any;
    onClick: any;
}
export declare class InteractionLayer implements ILayer {
    view: ILayerView;
    args: InteractionLayerArgs;
    name: string;
    constructor(view: ILayerView, args: InteractionLayerArgs);
    update: {
        parent: () => void;
        data: () => void;
        transformation: () => void;
        style: () => void;
    };
    currMousePosAsArr: () => [number, number];
    currMousePosAsC: () => {
        re: number;
        im: number;
    };
    findNodeByCell: () => N;
    private initMouseStuff;
    private onDragStart;
    private onDragλ;
    private onDragByNode;
    private onDragEnd;
    private animationTimer;
    private cancelAnimationTimer;
    private animateTo;
    private dblClickTimer;
    private cancelClickTimer;
    private onClick;
    private onDblClick;
}
