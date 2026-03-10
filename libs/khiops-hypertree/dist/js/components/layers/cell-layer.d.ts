import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { D3UpdatePattern } from '../layerstack/d3updatePattern';
export interface CellLayerArgs extends ILayerArgs {
    clip?: string;
    data: () => any;
    stroke?: any;
    fill?: any;
    color?: any;
    strokeWidth?: any;
}
export declare class CellLayer implements ILayer {
    view: ILayerView;
    args: CellLayerArgs;
    d3updatePattern: D3UpdatePattern;
    name: string;
    update: {
        parent: () => void;
        data: () => void;
        transformation: () => any;
        style: () => any;
    };
    constructor(view: ILayerView, args: CellLayerArgs);
    private attach;
}
