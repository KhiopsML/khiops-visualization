export * from './html';
export * from './util';

export const t = (m: any[][]) => m[0].map((x, i) => m.map((x) => x[i]));
