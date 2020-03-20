const { cylinder } = require('@jscad/csg/src/api/primitives3d-api');

import { RawShape, Shape } from '../../shape';
import { CubeOptions } from './cube';

export interface CylinderOptions {
  readonly radius: number;
  readonly height: number;
  readonly resolution?: number;
}

export class Cylinder extends Shape {
  constructor(public readonly inputOptions: CylinderOptions, id?: string) {
    super(id);
  }

  protected createInitialRawShape(): RawShape {
    return cylinder({
      ...this.inputOptions,
      r: this.inputOptions.radius,
      // r1: 1,
      // r2: 1,
      h: this.inputOptions.height,
      fn: this.inputOptions.resolution || 64,
    });
  }
}
