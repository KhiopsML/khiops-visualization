import * as d3 from 'd3';
import { N } from '../../models/n/n';
import { C } from '../../models/transformation/hyperbolic-math';
import { TransformationCache } from '../../models/transformation/hyperbolic-transformation';
import { LayerStack } from '../layerstack/layerstack';
import { UnitDiskArgs } from '../../models/unitdisk/unitdisk-model';
import { UnitDiskView } from '../../models/unitdisk/unitdisk-model';
export interface IUnitDisk {
    view: UnitDiskView;
    args: UnitDiskArgs;
    cache: any;
    voronoiLayout: d3.VoronoiLayout<N>;
    layerStack: LayerStack;
    navParameter?: UnitDisk;
    isDraging?: boolean;
    api: {
        setTransform: (t: string, tn: string) => void;
    };
    update: {
        cache: () => void;
        data: () => void;
        layout: () => void;
        transformation: () => void;
        pathes: () => void;
    };
}
export declare class UnitDisk implements IUnitDisk {
    view: UnitDiskView;
    args: UnitDiskArgs;
    cache: TransformationCache;
    voronoiLayout: d3.VoronoiLayout<N>;
    layerStack: LayerStack;
    pinchcenter: C;
    isDraging: boolean;
    cacheMeta: any;
    private mainsvg;
    constructor(view: UnitDiskView, args: UnitDiskArgs);
    api: {
        setTransform: (t: string, tn: string) => any;
    };
    update: {
        parent: () => void;
        cache: () => void;
        data: () => void;
        layout: () => void;
        transformation: () => void;
        pathes: () => void;
    };
    private updateParent;
}
export declare class UnitDiskNav implements IUnitDisk {
    view: UnitDiskView;
    args: UnitDiskArgs;
    cache: any;
    layerStack: any;
    get voronoiLayout(): d3.VoronoiLayout<N>;
    mainView: UnitDisk;
    navBackground: UnitDisk;
    navParameter: UnitDisk;
    constructor(view: UnitDiskView, args: UnitDiskArgs);
    api: {
        setTransform: (t: string, tn: string) => void;
    };
    update: {
        data: () => void;
        cache: () => void;
        layout: () => void;
        transformation: () => void;
        pathes: () => void;
    };
}
