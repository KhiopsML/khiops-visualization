import { N } from '../n/n';
import { IUnitDisk } from '../../components/unitdisk/unitdisk';
import { dfs2 } from '../transformation/hyperbolic-math';
import { TransformationCache } from '../transformation/hyperbolic-transformation';
import { CktoCp } from '../transformation/hyperbolic-math';
import { CassignC } from '../transformation/hyperbolic-math';
import { doVoronoiStuff } from './preset-process';
import { doLabelStuff } from './preset-process';

function collectNodesByWeight(
  ud: IUnitDisk,
  cache: TransformationCache,
  path: N[],
) {
  const normλ = ud.args.transformation.state.λ;
  cache.focusR = Math.min(
    normλ * ud.view.hypertree.args.filter.focusExtension,
    ud.view.hypertree.args.filter.maxFocusRadius,
  );

  // select visible nodes
  const startNode = path[0];
  cache.unculledNodes = [];
  cache.spezialNodes = [ud.args.data, startNode].filter((e) => e);
  cache.emojis = [];
  cache.cells = [];

  const mf = ud.view.hypertree.isAnimationRunning() ? 1 : 1;

  function abortfilter(n, idx, highway) {
    // return false to abort
    n.minWeight =
      highway[0].precalc.cullingWeight /
      ud.view.hypertree.args.filter.weightFilter.magic /
      mf;
    peocessNodeTransformation(ud, cache, n);
    peocessNode(ud, cache, n, cache.focusR, n.minWeight);
    return !n.isOut;
  }

  // dont do it before pathToLastVisible. it uses centerNode
  cache.centerNode = undefined; // ud.args.data

  const t1 = performance.now();
  // select visible nodes - rootnode extra
  if (ud.args.data) {
    peocessNodeTransformation(ud, cache, ud.args.data);
    peocessNode(ud, cache, ud.args.data, cache.focusR, 0);
    // root ist nicht in uncullednodes! (gut)
  }

  // centernode will be set at this point

  // select visible nodes - alle anderen (von startnode bis abortfilter)
  // path.pop()
  dfs2({
    node: startNode,
    abortFilter: abortfilter,
    preAction: (n) => cache.unculledNodes.push(n),
    highway: path,
  });
  return t1;
}

export function cacheUpdate(ud: IUnitDisk, cache: TransformationCache) {
  // constants
  const t0 = performance.now();
  const path = pathToLastVisible(ud, cache);
  const t1 = collectNodesByWeight(ud, cache, path); // also updates centernode
  const t2 = performance.now();

  // groups of nodes
  cache.links = cache.unculledNodes.slice(1);
  cache.leafOrLazy = cache.unculledNodes.filter(ud.args.nodeFilter);
  cache.paths = cache.links.filter(
    (n: N) => n.pathes.partof && n.pathes.partof.length,
  );
  cache.weights = [];

  const t3 = performance.now();

  if (
    !ud.view.hypertree.isAnimationRunning() ||
    (ud.layerStack && !ud.layerStack.layers['labels-force'].args.hideOnDrag) ||
    (ud.layerStack && !ud.layerStack.layers['labels'].args.hideOnDrag)
  )
    doLabelStuff(ud, cache);

  /*
    voro wrid gebraucht:
    - mouse up: um click voro zu berechnen
    - celllayer still enabled
    - cellayer anitmation enabled
    */
  if (
    !ud.view.hypertree.isAnimationRunning() ||
    (ud.layerStack && !ud.layerStack.layers['cells'].args.hideOnDrag)
  )
    doVoronoiStuff(ud, cache);

  if (cache.centerNode) ud.view.hypertree.update.centernode(cache.centerNode);

  // only for meta view
  // @ts-ignore
  ud.cacheMeta = {
    minWeight: path.map(
      (n) =>
        n.precalc.cullingWeight /
        ud.view.hypertree.args.filter.weightFilter.magic,
    ),
    Δ: [t1 - t0, t2 - t1, t3 - t2, performance.now() - t3],
  };
}

function pathToLastVisible(ud: IUnitDisk, cache: TransformationCache) {
  let startNode: N = null;
  let path = [];
  if (ud.args.data) {
    startNode = cache.centerNode || ud.args.data;
    path.push(startNode);

    while (true) {
      peocessNodeTransformation(ud, cache, startNode);

      if (startNode.cachep.r >= ud.view.hypertree.args.filter.cullingRadius) {
        path = path.slice(0, -1);
        break;
      }
      if (!startNode.parent) break;

      startNode = startNode.parent;
      path.push(startNode);
    }
  }
  return path.reverse();
}

function peocessNodeTransformation(
  ud: IUnitDisk,
  cache: TransformationCache,
  n: N,
) {
  n.cache = n.cache || { re: 0, im: 0 };
  ud.view.hypertree.args.layout.type(n, ud.args.transformation.state.λ, true);
  CassignC(n.cache, ud.args.transform(n));
  n.cachep = CktoCp(n.cache);
}

function peocessNode(
  ud: IUnitDisk,
  cache: TransformationCache,
  n: N,
  focusR,
  minWeight,
) {
  n.strCache = `${n.cache.re} ${n.cache.im}`;
  n.transformStrCache = ` translate(${n.strCache})`;
  n.transformStrCacheZ = ` translate(${n.layout.zStrCache})`;

  n.isOutλ = n.cachep.r >= focusR;
  n.isOut99 = n.cachep.r >= ud.view.hypertree.args.filter.cullingRadius;
  n.isOutWeight = n.precalc.cullingWeight <= minWeight;
  n.distScale = ud.args.transformation.transformDist(n.cache);
  n.dampedDistScale = n.distScale * (0.5 / n.distScale + 0.5);
  n.scaleStrText = ` scale(${n.dampedDistScale})`;
  n.isOut = !(
    !(n.isOut99 || n.isOutWeight) ||
    !n.isOutλ ||
    (n.parent && !n.parent.isOutλ)
  );

  n.hasOutPeriChildren = n.hasOutWeightChildren = n.hasOutChildren = false;

  if (n.parent && n.isOut99) n.parent.hasOutPeriChildren = true;
  if (n.parent && n.isOutWeight) n.parent.hasOutWeightChildren = true;
  if (n.parent && n.isOut) n.parent.hasOutChildren = true;

  if (!cache.centerNode || cache.centerNode.cachep.r > n.cachep.r)
    cache.centerNode = n;
}
