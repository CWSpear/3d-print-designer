const { cylinder } = require('@jscad/csg/src/api/primitives3d-api');

import { Shape } from '../../shape';

export interface CylinderOptions {
  radius: number;
  height: number;
  resolution?: number;
}

export class Cylinder extends Shape {
  constructor(options: CylinderOptions) {
    super();

    this.csgShape = cylinder({
      ...options,
      r: options.radius,
      // r1: 1,
      // r2: 1,
      h: options.height,
      fn: options.resolution,
    });
  }
}
