import { IUnitDisk } from '../unitdisk/unitdisk';
import { ILayer } from './layer';
export interface LayerStackArgs {
    parent: any;
    unitdisk: IUnitDisk;
}
export declare class LayerStack {
    args: LayerStackArgs;
    mainSvgGroup: any;
    layers: {
        [key: string]: ILayer;
    };
    d3meta: any;
    update: {
        parent: () => void;
        data: () => void;
        pathes: () => void;
    };
    constructor(args: LayerStackArgs);
    private updateLayers;
    private updateData;
    private updatePath;
}
