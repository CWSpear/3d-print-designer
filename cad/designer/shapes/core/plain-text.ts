import { union } from '@jscad/modeling/src/operations/booleans';
import { extrudeRectangular } from '@jscad/modeling/src/operations/extrusions';
import { vectorText } from '@jscad/modeling/src/text';
import { RawShape, Shape } from '../../shape';

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

export class PlainText extends Shape<TextOptions> {
  constructor(public readonly text: string, inputOptions: TextOptions = {}, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const letters = vectorText(this.inputOptions, this.text);

    const letterRawShapes: RawShape[] = [];
    letters.forEach((segment: any) => letterRawShapes.push(extrudeRectangular({ size: 2, height: 1 }, segment)));

    return union(...letterRawShapes);
  }
}
