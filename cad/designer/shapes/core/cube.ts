import { Vec3 } from '@jscad/modeling/src/maths/types';
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

  setDefaultOptions(options: CubeOptions): Required<CubeOptions> {
    return super.setDefaultOptions({
      round: false,
      radius: 0,
      resolution: 8,
      ...options,
    });
  }

  protected createInitialRawShape(): RawShape {
    const size = Util.convertDimensionsToNumbers(this.inputOptions.size);
    const center: Vec3 = [0, 0, 0]; // [size[0] / 2, size[1] / 2, size[2] / 2];

    if (!this.inputOptions.round) {
      return cuboid({
        ...this.inputOptions,
        size,
        // align origin point to 0, 0, 0
        center,
      });
    }

    return roundedCuboid({
      ...this.inputOptions,
      size,
      center,
      // offset: Util.normalizeDimensions(this.inputOptions.offset),
      roundRadius: this.inputOptions.radius,
      segments: this.inputOptions.resolution,
    });
  }
}
