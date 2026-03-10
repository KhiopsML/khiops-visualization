import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { D3UpdatePattern } from '../layerstack/d3updatePattern';
export interface FocusLayerArgs extends ILayerArgs {
    name: string;
    className?: string;
    r: () => number;
    center: () => string;
}
export declare class FocusLayer implements ILayer {
    view: ILayerView;
    args: FocusLayerArgs;
    d3updatePattern: D3UpdatePattern;
    name: string;
    update: {
        parent: () => void;
        data: () => void;
        transformation: () => any;
        style: () => any;
    };
    constructor(view: ILayerView, args: FocusLayerArgs);
    private attach;
}
