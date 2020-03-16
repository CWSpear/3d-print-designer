const { polyhedron } = require('@jscad/csg/src/api/primitives3d-api');

import { Shape } from '../../shape';

export interface RightTriangularPrismOptions {
  length: number;
  yLegLength: number;
  xLegLength: number;
}

export class RightTriangularPrism extends Shape {
  constructor({ length, xLegLength, yLegLength }: RightTriangularPrismOptions) {
    super();

    this.csgShape = polyhedron({
      points: [
        [0, 0, 0],
        [0, xLegLength, 0],
        [0, 0, yLegLength],
        [length, 0, 0],
        [length, xLegLength, 0],
        [length, 0, yLegLength],
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
