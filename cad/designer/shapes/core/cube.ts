const { cube } = require('@jscad/csg/src/api/primitives3d-api');

import { Dimensions, RawShape, Shape } from '../../shape';
import { Util } from '../../util';

export interface CubeOptions {
  readonly size: Dimensions;
  // readonly offset?: Dimensions;
  readonly round?: boolean;
  readonly radius?: number;
  readonly resolution?: number;
  // readonly center?: boolean;
}

export class Cube extends Shape {
  constructor(public readonly inputOptions: CubeOptions, id?: string) {
    super(id);
  }

  protected createInitialRawShape(): RawShape {
    return cube({
      ...this.inputOptions,
      size: Util.convertDimensionsToNumbers(this.inputOptions.size),
      // offset: Util.normalizeDimensions(this.inputOptions.offset),
      fn: this.inputOptions.resolution || 8,
    });
  }
}
