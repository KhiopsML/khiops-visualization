import { NodeLayer } from '../layers/node-layer';
import { CellLayer } from '../layers/cell-layer';
import { LabelLayer } from '../layers/label-layer';
import { InteractionLayer } from '../layers/interaction-layer';
import { UnitDisk } from './unitdisk';
export declare const navParameterLayers: (((v: any, ud: UnitDisk) => CellLayer) | ((v: any, ud: UnitDisk) => NodeLayer) | ((v: any, ud: UnitDisk) => LabelLayer) | ((v: any, ud: UnitDisk) => InteractionLayer))[];
