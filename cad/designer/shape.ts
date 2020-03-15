const { difference } = require('@jscad/csg/src/api/ops-booleans');
const { union } = require('@jscad/csg/src/api/ops-booleans');
const { translate } = require('@jscad/csg/src/api/ops-transformations');

import { cloneDeep } from 'lodash';
import { Dimensions, Util } from './util';

let id = 1;

export abstract class Shape {
  protected id: number = id++;

  protected csgShape: any;

  render() {
    return this.csgShape;
  }

  translate(translation: Partial<Dimensions>): this {
    this.csgShape = translate(Util.normalizeDimensions(translation), this.csgShape);

    return this;
  }

  addShape(shape: Shape): this {
    this.csgShape = union(this.csgShape, shape.csgShape);

    return this;
  }

  subtractShape(shape: Shape): this {
    this.csgShape = difference(this.csgShape, shape.csgShape);

    return this;
  }

  clone(): Shape {
    const shape = cloneDeep(this);

    shape.id = id++;

    return shape;
  }
}
