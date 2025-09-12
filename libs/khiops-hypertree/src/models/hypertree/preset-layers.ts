import { N } from '../n/n';
import { C, CptoCk } from '../transformation/hyperbolic-math';
import { CaddC } from '../transformation/hyperbolic-math';
import { UnitDisk } from '../../components/unitdisk/unitdisk';
import { NodeLayer } from '../../components/layers/node-layer';
import { CellLayer } from '../../components/layers/cell-layer';
import { BackgroundLayer } from '../../components/layers/background-layer';
import { ArcLayer } from '../../components/layers/link-layer';
import { LabelLayer } from '../../components/layers/label-layer';
import { LabelForceLayer } from '../../components/layers/label-force-layer';
import { InteractionLayer } from '../../components/layers/interaction-layer';
import { InteractionLayer2 } from '../../components/layers/interaction-layer-2';
import { FocusLayer } from '../../components/layers/focus-layer';
import { bboxCenter, bboxOval } from '../../d3-hypertree';

export const labeloffsets = {
  centerOffset: (cache: string) => (d: N, i, v) => bboxCenter(d, cache),

  nodeRadiusOffset: (ls: UnitDisk) => (d: N) =>
    CptoCk({
      θ: d.cachep.θ,
      r: ls.args.nodeRadius(ls, d) * d.distScale * 1.5,
    }),

  labeloffset: (ud) => (d, i, v) =>
    CaddC(labeloffsets.nodeRadiusOffset(ud)(d), bboxOval(d)),
  outwards: undefined,
  outwardsPlusNodeRadius: undefined,
};
labeloffsets.outwards = labeloffsets.nodeRadiusOffset;
labeloffsets.outwardsPlusNodeRadius = labeloffsets.labeloffset;

export const layerSrc = [
  (v, ud: UnitDisk) => new BackgroundLayer(v, {}),
  (v, ud: UnitDisk) =>
    new CellLayer(v, {
      invisible: true,
      hideOnDrag: true,
      clip: '#circle-clip' + ud.args.clipRadius,
      data: () => ud.cache.cells,
      fill: (n) => undefined,
      stroke: (n) => undefined,
      strokeWidth: (n) => undefined,
    }),
  (v, ud: UnitDisk) =>
    new FocusLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'culling-r',
      r: () => ud.view.hypertree.args.filter.cullingRadius,
      center: () => '0 0',
    }),
  (v, ud: UnitDisk) =>
    new FocusLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'mouse-r',
      r: () => ud.view.hypertree.args.interaction.mouseRadius,
      center: () => '0 0',
    }),
  (v, ud: UnitDisk) =>
    new FocusLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'focus-r',
      r: () => ud.cache.focusR,
      center: () => '0 0',
    }),

  (v, ud: UnitDisk) =>
    new FocusLayer(v, {
      invisible: false,
      hideOnDrag: false,
      name: 'λ',
      r: () => ud.args.transformation.state.λ,
      center: () =>
        `${(ud.pinchcenter || { re: 0 }).re} ${(ud.pinchcenter || { im: 0 }).im}`,
    }),
  (v, ud: UnitDisk) =>
    new FocusLayer(v, {
      invisible: false,
      className: 'zerozero-circle',
      name: '(0,0)',
      r: () => 0.004,
      center: () => '0 0',
    }),

  (v, ud: UnitDisk) =>
    new NodeLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'center-node',
      className: 'center-node',
      fill: (n) => undefined,
      stroke: (n) => undefined,
      strokeWidth: (n) => undefined,
      data: () => (ud.cache.centerNode ? [ud.cache.centerNode] : []),
      r: (d) => 0.1,
      transform: (d) => d.transformStrCache + ` scale(${ud.args.nodeScale(d)})`,
    }),

  /**
   * important part or path rendering
   */
  (v, ud: UnitDisk) =>
    new ArcLayer(v, {
      invisible: false,
      hideOnDrag: false,
      name: 'link-arcs',
      className: 'arc',
      curvature: ud.view.hypertree.args.geometry.linkCurvature, // + - 0 l
      clip: '#circle-clip' + ud.args.clipRadius,
      data: () => ud.cache.links,
      nodePos: (n) => n.cache,
      nodePosStr: (n) => n.strCache,
      stroke: (n) => undefined,
      strokeWidth: (d) => ud.args.linkWidth(d),
      classed: (s, w, c) =>
        s
          .style(
            'stroke',
            (d) =>
              (d.pathes && d.pathes.isPartOfAnyHoverPath
                ? d.pathes && d.pathes.finalcolor
                : d.pathes && d.pathes.finalcolor) || c(d),
          )
          .classed('hovered', (d) => d.pathes && d.pathes.isPartOfAnyHoverPath)
          .classed(
            'selected',
            (d) => d.pathes && d.pathes.isPartOfAnySelectionPath,
          ),
    }),

  (v, ud: UnitDisk) =>
    new NodeLayer(v, {
      invisible: false,
      hideOnDrag: false,
      name: 'nodes',
      className: 'node',
      data: () => ud.cache.leafOrLazy,
      fill: (n) => undefined,
      stroke: (n) => undefined,
      strokeWidth: (n) => undefined,
      r: (d) => ud.args.nodeRadius(ud, d),
      transform: (d) => d.transformStrCache + ` scale(${ud.args.nodeScale(d)})`,
    }),

  /**
   * Nodes labels
   */
  (v, ud: UnitDisk) =>
    new LabelLayer(v, {
      invisible: false,
      hideOnDrag: false,
      name: 'labels',
      className: 'caption',
      data: () => ud.cache.labels,
      text: (d) => d.precalc.label,
      isVisible: () => undefined,
      delta: labeloffsets.labeloffset(ud),
      color: () => undefined,
      background: undefined,
      transform: (d, delta) =>
        ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
        d.scaleStrText,
    }),
  /**
   * Mouse interactions
   */
  (v, ud: UnitDisk) =>
    new LabelForceLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'labels-force',
      className: 'caption caption-label',
      data: () => ud.cache.labels,
      text: (d) => d.precalc.label,
      background: (n) => !n.parent,
      transform: (d, delta) =>
        ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
        d.scaleStrText,
    }),
  /**
   * Mouse interactions
   */
  (v, ud: UnitDisk) =>
    new InteractionLayer(v, {
      invisible: true,
      hideOnDrag: true,
      mouseRadius: ud.view.hypertree.args.interaction.mouseRadius,
      onClick: (n: N, m: C) => {
        var s = n.ancestors().find((e) => true);
        ud.view.hypertree.api.toggleSelection(s); // toggle selection
        ud.view.hypertree.args.interaction.onNodeSelect(s); // focus splitter
      },
    }),
  /**
   * Mouse interactions
   */
  (v, ud: UnitDisk) =>
    new InteractionLayer2(v, {
      mouseRadius: ud.view.hypertree.args.interaction.mouseRadius,
      onClick: (n: N, m: C) => {
        var s = n.ancestors().find((e) => true);
        ud.view.hypertree.api.toggleSelection(s); // toggle selection
        ud.view.hypertree.args.interaction.onNodeSelect(s); // focus splitter
      },
    }),
];
