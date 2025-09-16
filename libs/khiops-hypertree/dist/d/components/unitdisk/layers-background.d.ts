import { CellLayer } from '../layers/cell-layer';
import { BackgroundLayer } from '../layers/background-layer';
import { ArcLayer } from '../layers/link-layer';
import { LabelLayer } from '../layers/label-layer';
import { UnitDisk } from './unitdisk';
export declare const navBgNodeR = 0.012;
export declare const navBackgroundLayers: (((v: any, ud: UnitDisk) => BackgroundLayer) | ((v: any, ud: UnitDisk) => CellLayer) | ((v: any, ud: UnitDisk) => ArcLayer) | ((v: any, ud: UnitDisk) => LabelLayer))[];
