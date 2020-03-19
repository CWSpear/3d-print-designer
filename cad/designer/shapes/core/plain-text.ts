const { vectorText } = require('@jscad/csg/src/api/text');
const { rectangular_extrude } = require('@jscad/csg/src/api/ops-extrusions');
const { union } = require('@jscad/csg/src/api/ops-booleans');

import { Shape } from '../../shape';

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
  constructor(txt: string, options: TextOptions = {}) {
    super();

    const letters = vectorText(options, txt);

    const letterRawShapes: any[] = [];
    letters.forEach((segment: any) => letterRawShapes.push(rectangular_extrude(segment, { w: 2, h: 1 })));

    this.rawShape = union(letterRawShapes);
  }
}
