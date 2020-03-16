const { polyhedron } = require('@jscad/csg/src/api/primitives3d-api');

import { Shape } from '../../shape';

export interface EquilateralTriangularPrismOptions {
  length: number;
  legLength: number;
}

export class EquilateralTriangularPrism extends Shape {
  constructor({ length, legLength }: EquilateralTriangularPrismOptions) {
    super();

    const x1 = 0;
    const x2 = legLength / 2;
    const x3 = legLength;

    const y1 = 0;
    const y2 = Math.sqrt(legLength);
    const y3 = 0;

    this.rawShape = polyhedron({
      points: [
        [length, x1, y1],
        [length, x2, y2],
        [length, x3, y3],
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
