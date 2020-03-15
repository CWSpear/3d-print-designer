const { cube } = require('@jscad/csg/src/api/primitives3d-api');

import { Shape } from '../../shape';
import { Dimensions, Util } from '../../util';

export interface CubeOptions {
  size: Dimensions;
  offset?: Dimensions;
  round?: boolean;
  radius?: number;
  resolution?: number;
}

export class Cube extends Shape {
  constructor(options: CubeOptions) {
    super();

    this.csgShape = cube({
      ...options,
      size: Util.normalizeDimensions(options.size),
      offset: Util.normalizeDimensions(options.offset),
      fn: options.resolution,
    });
  }
}
