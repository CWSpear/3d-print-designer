import { cylinder } from '@jscad/modeling/src/primitives/index';
import { RawShape, Shape } from '../../shape';

export interface CylinderOptions {
  readonly radius: number;
  readonly height: number;
  readonly resolution?: number;
}

export class Cylinder extends Shape<CylinderOptions> {
  constructor(inputOptions: CylinderOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    return cylinder({
      ...this.inputOptions,
      center: [0, 0, 0],
      radius: this.inputOptions.radius,
      height: this.inputOptions.height,
      segments: this.inputOptions.resolution || 64,
    });
  }
}
