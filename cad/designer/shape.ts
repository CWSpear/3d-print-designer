const { difference } = require('@jscad/csg/src/api/ops-booleans');
const { union } = require('@jscad/csg/src/api/ops-booleans');
const { translate, rotate, mirror, center } = require('@jscad/csg/src/api/ops-transformations');

import { cloneDeep } from 'lodash';
import { Dimensions, RawShape, Util, Vector } from './util';

let id = 1;

export abstract class Shape {
  protected id: number = id++;

  protected rawShape: RawShape;

  render(): RawShape {
    return this.rawShape;
  }

  mirror(translation: Partial<Vector>): this {
    this.rawShape = mirror(Util.normalizeDimensions(translation), this.rawShape);

    return this;
  }

  mirrorAcrossXPlane(): this {
    return this.mirror({ y: 1 });
  }

  mirrorAcrossYPlane(): this {
    return this.mirror({ x: 1 });
  }

  mirrorAcrossZPlane(): this {
    return this.mirror({ z: 1 });
  }

  rotate(translation: Partial<Dimensions>): this {
    this.rawShape = rotate(Util.normalizeDimensions(translation), this.rawShape);

    return this;
  }

  rotateX(distance: number): this {
    return this.rotate({ x: distance });
  }

  rotateY(distance: number): this {
    return this.rotate({ y: distance });
  }

  rotateZ(distance: number): this {
    return this.rotate({ z: distance });
  }

  translate(translation: Partial<Dimensions>): this {
    this.rawShape = translate(Util.normalizeDimensions(translation), this.rawShape);

    return this;
  }

  translateX(distance: number): this {
    return this.translate({ x: distance });
  }

  translateY(distance: number): this {
    return this.translate({ y: distance });
  }

  translateZ(distance: number): this {
    return this.translate({ z: distance });
  }

  center(): this {
    this.rawShape = center(true, this.rawShape);

    return this;
  }

  addShapes(...rawShapes: RawShape[]): this {
    this.rawShape = union(this.rawShape, ...rawShapes);

    return this;
  }

  subtractShapes(...rawShapes: RawShape[]): this {
    this.rawShape = difference(this.rawShape, ...rawShapes);

    return this;
  }

  clone(): Shape {
    const shape = cloneDeep(this);

    shape.id = id++;

    return shape;
  }
}
