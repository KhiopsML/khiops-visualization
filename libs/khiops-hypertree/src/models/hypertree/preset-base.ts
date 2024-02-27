import { N } from '../n/n';
import { layoutBergé } from '../n/n-layouts';
import { HyperbolicTransformation } from '../../d3-hypertree';
import { HypertreeArgs } from './model';
import { UnitDisk } from '../../components/unitdisk/unitdisk';
import { Hypertree } from '../../components/hypertree/hypertree';
import { layerSrc, labeloffsets } from './preset-layers';
import { cacheUpdate } from './magic-filter';
import { C } from '../transformation/hyperbolic-math';

const π = Math.PI;
const hasLazy = (n) => n.hasOutChildren && n.isOutλ;
const isLeaf = (n) => !n.children || !n.children.length;
const isRoot = (n) => !n.parent;
const hasCircle = (n) => hasLazy(n) || isRoot(n) || isLeaf(n);

var nodeInitR = (c: number) => (ud: UnitDisk, d: N) =>
  c * (d.children && d.parent ? innerNodeScale(d) : 1);
var nodeScale = (d) => d.distScale * (hasLazy(d) ? 0.8 : 1);
var innerNodeScale = (d) => d.precalc.weightScale;
var arcWidth = (d) => 0.025 * d.distScale * d.precalc.weightScale;

const modelBase: () => HypertreeArgs = () => ({
  langloader: (ok) => ok(),
  dataInitBFS: (ht: Hypertree, n: N) => {
    n.precalc.imageHref = undefined;
    n.precalc.icon = undefined;
    n.precalc.clickable = true;
    n.precalc.cell = true;
  },
  langInitBFS: (ht: Hypertree, n: N) => {
    n.precalc.label = undefined;
    n.precalc.wiki = undefined;
  },

  objects: {
    selections: [],
    pathes: [],
    traces: [],
  },
  layout: {
    type: layoutBergé,
    weight: (n: N) => (isLeaf(n) ? 1 : 0),
    initSize: 0.97,
    rootWedge: {
      orientation: (3 * π) / 2,
      angle: (3 * π) / 2,
    },
  },
  filter: {
    type: 'magic',
    cullingRadius: 0.99,
    weightFilter: {
      magic: 160,
      alpha: 1.05,
      weight: (n) => (isLeaf(n) ? 1 : 0),
      //weight:             n=> (isLeaf(n) ? 1 : Math.pow(n.height, 5)),
      // weight:             n=> (isLeaf(n) ? 1 : n.height*n.height),
      rangeCullingWeight: {
        min: 4,
        max: 500,
      },
      rangeNodes: {
        min: 500,
        max: 1000,
      },
    },
    focusExtension: 3, //1.6 Nb nodes to display
    maxFocusRadius: 1, // 0.85
    wikiRadius: 1, // 0.85
    maxlabels: 50, // 25
  },
  geometry: {
    decorator: UnitDisk,
    cacheUpdate: cacheUpdate,
    layers: layerSrc,
    layerOptions: {},
    clipRadius: 1,
    nodeRadius: nodeInitR(0.01),
    nodeScale: nodeScale,
    nodeFilter: hasCircle,
    offsetEmoji: labeloffsets.labeloffset, //outwards,
    offsetLabels: labeloffsets.labeloffset, //outwardsPlusNodeRadius,
    linkWidth: arcWidth,
    linkCurvature: '-',
    captionBackground: 'all',
    captionFont: '6.5px Roboto',
    captionHeight: 0.04,
    transformation: new HyperbolicTransformation({
      P: {
        re: 0,
        im: 0,
      },
      θ: {
        re: 1,
        im: 0,
      },
      λ: 0.1,
    }),
  },
  interaction: {
    mouseRadius: 0.9,

    onNodeClick: (n: N, m: C) => {},
    onCenterNodeChange: (n: N) => {},
    onWikiCenterNodeChange: (n: N) => {},
    onHoverNodeChange: (n: N) => {
      // console.log("🚀 ~ file: preset-base.ts ~ line 99 ~ n", n)
    },
    onNodeSelect: () => {},
    onNodeHold: () => {},
    onNodeHover: () => {
      console.log('ON NODE HOVER=============');
    },
    λbounds: [1 / 40, 0.45],
    wheelFactor: 1.175,
  },
});

export const presets: {
  [key: string]: () => any;
} = {
  modelBase: () => modelBase(),
};
