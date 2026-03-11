import { N } from './n';
import { makeT, one } from '../transformation/hyperbolic-math';
import { CktoCp, CptoCk } from '../transformation/hyperbolic-math';
import { Cneg } from '../transformation/hyperbolic-math';
import { h2e } from '../transformation/hyperbolic-math';
import { πify } from '../transformation/hyperbolic-math';
import { maxR } from '../transformation/hyperbolic-math';

export type LayoutFunction = (
  root: N,
  t?: number,
  noRecursion?: boolean,
) => void;

export function setZ(container, z) {
  if (!z) return;
  z = maxR(z, 0.99999999);
  container.layout = container.layout || {};
  container.layout.z = z;
  container.layout.zStrCache = `${z.re} ${z.im}`;
  container.layout.zp = CktoCp(z);
}

function wedgeTranslate(w, P) {
  const t = makeT(P, one);
  const pα = {
    re: Math.cos(w.α),
    im: Math.sin(w.α),
  };
  const pΩ = {
    re: Math.cos(w.Ω),
    im: Math.sin(w.Ω),
  };
  w.α = CktoCp(h2e(t, pα)).θ;
  w.Ω = CktoCp(h2e(t, pΩ)).θ;
}

export function layoutBergé(n: N, λ: number, noRecursion = false) {
  let count = 0;

  function layoutNode(n: N) {
    const wedge = {
      Ω: n.layout.wedge.Ω,
      α: n.layout.wedge.α,
    };
    const L = n.layout.wedge.L;
    if (n.parent) {
      const angleWidth = πify(wedge.Ω - wedge.α);
      const bisectionAngle = wedge.α + angleWidth / 2.0;

      let deflen = 1;
      if (!n.parent.parent) deflen = 0.5;

      const nz1 = CptoCk({
        θ: bisectionAngle,
        r: λ * (deflen + L || 1),
      });
      setZ(n, h2e(makeT(n.parent.layout.z, one), nz1));

      wedgeTranslate(wedge, n.parent.layout.z);
      wedgeTranslate(wedge, Cneg(n.layout.z));
    }

    let angleWidth = πify(wedge.Ω - wedge.α);

    let currentAngle = wedge.α;
    const cl = n.children || [];
    const cllen = cl.length;
    let linecount = 0;
    let liner = 0;
    let resetCount = 0;
    let anglesum = 0;

    const parentWeight = (n.children || []).reduce(
      (a, ccn) => a + ccn.precalc.layoutWeight,
      0,
    );
    cl.forEach((cn, i) => {
      const angleWeight = cn.precalc.layoutWeight / parentWeight;

      anglesum += angleWeight;
      const angleOffset = angleWidth * angleWeight;

      // current angle iterated through wegde borders (as hyperbolic angle)
      const α = currentAngle;
      currentAngle += angleOffset;
      const Ω = πify(currentAngle);

      const cL = liner;
      const w = {
        α,
        Ω,
        L: cL,
      };
      cn.layout = cn.layout || {
        wedge: w,
      };
      cn.layout.wedge = w;

      linecount++;
      if (cn.height === 0) liner += 0.1;

      const rowcount = cllen / Math.log(cllen) / 2;

      if (linecount >= rowcount) {
        linecount = 0;
        liner = 0;
        resetCount++;
      }
    });

    if (!noRecursion) for (let cn of n.children || []) layoutNode(cn);

    count++;
  }

  layoutNode(n);
}
