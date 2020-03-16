const { cube } = require('@jscad/csg/src/api/primitives3d-api');

import { Dimensions, Shape } from '../../shape';
import { Util } from '../../util';

export interface CubeOptions {
  size: Dimensions;
  offset?: Dimensions;
  round?: boolean;
  radius?: number;
  resolution?: number;
  center?: boolean;
}

export class Cube extends Shape {
  constructor(options: CubeOptions) {
    super();

    this.rawShape = cube({
      ...options,
      size: Util.normalizeDimensions(options.size),
      offset: Util.normalizeDimensions(options.offset),
      fn: options.resolution,
    });
  }
}
