const { polyhedron } = require('@jscad/csg/src/api/primitives3d-api');

import { RawShape, Shape } from '../../shape';
import { CubeOptions } from '../core/cube';

export interface TriangularPrismOptions {
  readonly length: number;
  readonly leftSideLength: number;
  readonly rightSideLength: number;
  readonly bottomSideLength: number;
}

export class TriangularPrism extends Shape<TriangularPrismOptions> {
  constructor(inputOptions: TriangularPrismOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const a = this.inputOptions.leftSideLength;
    const b = this.inputOptions.rightSideLength;
    const c = this.inputOptions.bottomSideLength;

    // console.log({ a, b, c });

    const A = Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c));
    const B = Math.acos((c ** 2 + a ** 2 - b ** 2) / (2 * c * a));
    const C = Math.PI - A - B;

    // console.log(C / 2 * (180 / Math.PI));

    // const BB = 67.9758 / (180 / Math.PI);
    // const CC = 22.0243 / (180 / Math.PI);
    // const AA = Math.PI / 2;
    // const cc = 1;
    //
    // const wannaStickOut = (cc / Math.sin(CC)) * Math.sin(BB);

    const C1 = Math.PI - Math.PI / 2 - B;
    const A1 = Math.PI / 2;

    const peakY = (a / Math.sin(A1)) * Math.sin(B); // height of triangle
    const peakX = (a / Math.sin(A1)) * Math.sin(C1); // x point under peak

    const x1 = 0;
    const x2 = peakX; // x at triangle peak
    const x3 = c;

    const y1 = 0;
    const y2 = peakY; // y at triangle peak
    const y3 = 0;

    // console.log([x1, y1], [x2, y2], [x3, y3]);

    return polyhedron({
      points: [
        [this.inputOptions.length, x1, y1],
        [this.inputOptions.length, x2, y2],
        [this.inputOptions.length, x3, y3],
        [0, x1, y1],
        [0, x2, y2],
        [0, x3, y3],
      ],
      polygons: [
        [2, 0, 1],
        [3, 5, 4],
        [2, 1, 4, 5],
        [3, 4, 1, 0],
        [0, 2, 5, 3],
      ],
    });
  }
}
