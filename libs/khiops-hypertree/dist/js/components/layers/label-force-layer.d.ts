import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { D3UpdatePattern } from '../layerstack/d3updatePattern';
export interface LabelForceLayerArgs extends ILayerArgs {
    name: string;
    className: string;
    invisible?: boolean;
    hideOnDrag?: boolean;
    data: () => any;
    background: any;
    transform: any;
    text: any;
    clip?: string;
}
export declare class LabelForceLayer implements ILayer {
    view: ILayerView;
    args: LabelForceLayerArgs;
    d3updatePattern: D3UpdatePattern;
    d3updatePattern2: D3UpdatePattern;
    name: string;
    simulation: any;
    update: {
        parent: () => void;
        force: () => void;
        data: () => void;
        transformation: () => void;
        style: () => void;
    };
    constructor(view: ILayerView, args: LabelForceLayerArgs);
    labelSetUpdate(): void;
    simulationTick(): void;
    private labellen;
    private attach;
}
