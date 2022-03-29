import { cuboid, roundedCuboid } from '@jscad/modeling/src/primitives/index';
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

export class Cube extends Shape<CubeOptions> {
  constructor(inputOptions: CubeOptions, id?: string) {
    super(inputOptions, id);
  }

  // TODO will this work if rounded if false?
  protected createInitialRawShape(): RawShape {
    const size = Util.convertDimensionsToNumbers(this.inputOptions.size);

    console.log('this.inputOptions', this.inputOptions);

    if (!this.inputOptions.round) {
      return cuboid({
        ...this.inputOptions,
        size,
        center: [(-1 * size[0]) / 2, (-1 * size[1]) / 2, (-1 * size[2]) / 2],
      });
    }

    return roundedCuboid({
      ...this.inputOptions,
      size,
      center: [0, 0, 0],
      // offset: Util.normalizeDimensions(this.inputOptions.offset),
      roundRadius: this.inputOptions.radius ?? 0,
      segments: this.inputOptions.resolution || 8,
    });
  }
}
