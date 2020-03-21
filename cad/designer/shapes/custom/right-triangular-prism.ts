const { polyhedron } = require('@jscad/csg/src/api/primitives3d-api');

import { RawShape, Shape } from '../../shape';

export interface RightTriangularPrismOptions {
  length: number;
  yLegLength: number;
  xLegLength: number;
}

import { TriangularPrism } from './triangular-prism';

export class RightTriangularPrism extends Shape<RightTriangularPrismOptions> {
  constructor(inputOptions: RightTriangularPrismOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    return polyhedron({
      points: [
        [0, 0, 0],
        [0, this.inputOptions.xLegLength, 0],
        [0, 0, this.inputOptions.yLegLength],
        [this.inputOptions.length, 0, 0],
        [this.inputOptions.length, this.inputOptions.xLegLength, 0],
        [this.inputOptions.length, 0, this.inputOptions.yLegLength],
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

// export class RightTriangularPrism extends TriangularPrism {
//   constructor(options: RightTriangularPrismOptions, id?: string) {
//     super({
//       length: options.length,
//       leftSideLength: options.yLegLength,
//       rightSideLength: Math.sqrt(options.xLegLength ** 2 + options.yLegLength ** 2),
//       bottomSideLength: options.xLegLength
//     }, id);
//   }
// }
