const { vectorText } = require('@jscad/csg/src/api/text');
const { rectangular_extrude } = require('@jscad/csg/src/api/ops-extrusions');
const { union } = require('@jscad/csg/src/api/ops-booleans');

import { RawShape, Shape } from '../../shape';
import { CubeOptions } from './cube';

export interface TextOptions {
  xOffset?: number;
  yOffset?: number;
  height?: number;
  extrudeOffset?: number;
  font?: string;

  lineSpacing?: number;
  letterSpacing?: number;
  align?: 'left' | 'right' | 'center';
}

export class PlainText extends Shape {
  constructor(public readonly text: string, public readonly inputOptions: TextOptions = {}, id?: string) {
    super(id);
  }

  protected createInitialRawShape(): RawShape {
    const letters = vectorText(this.inputOptions, this.text);

    const letterRawShapes: any[] = [];
    letters.forEach((segment: any) => letterRawShapes.push(rectangular_extrude(segment, { w: 2, h: 1 })));

    return union(letterRawShapes);
  }
}
