const { difference } = require('@jscad/csg/src/api/ops-booleans');
const { union } = require('@jscad/csg/src/api/ops-booleans');
const { translate, rotate, mirror, center, scale } = require('@jscad/csg/src/api/ops-transformations');

import { cloneDeep, flatMap, map, random } from 'lodash';
import { Util } from './util';

export type NumbersDimensions = [number, number, number];
export type WLHDimensions = { width: number; length: number; height: number };
export type XYZDimensions = { x: number; y: number; z: number };

export type Vector = NumbersDimensions | XYZDimensions;
export type Dimensions = NumbersDimensions | WLHDimensions | XYZDimensions | number;

export interface RawShape {
  polygons: {
    vertices: { pos: { _x: number; _y: number; _z: number }; tag: number }[];
    shared: {
      color: any;
      tag: number;
    };
    plane: {
      normal: { _x: number; _y: number; _z: number };
      w: number;
      tag: number;
    };
  }[];
  properties: any;
  isCanonicalized: boolean;
  isRetesselated: boolean;
}

export abstract class Shape {
  protected id: number = random(999999);

  protected rawShape: RawShape;

  render(): RawShape {
    return this.rawShape;
  }

  /////////////////////
  // Transformations //
  /////////////////////

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

  scale(translation: Partial<Dimensions>): this {
    this.rawShape = scale(Util.normalizeDimensions(translation, 1), this.rawShape);

    return this;
  }

  scaleX(distance: number): this {
    return this.scale({ x: distance });
  }

  scaleY(distance: number): this {
    return this.scale({ y: distance });
  }

  scaleZ(distance: number): this {
    return this.scale({ z: distance });
  }

  center(): this {
    this.rawShape = center(true, this.rawShape);

    return this;
  }

  //////////////////////
  // Combining Shapes //
  //////////////////////

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

    shape.id = random(999999);

    return shape;
  }

  /////////////////////////////////////////////
  // Helper methods to find where shapes are //
  /////////////////////////////////////////////

  getPositionMinX(): number {
    const allX: number[] = flatMap(this.rawShape.polygons, polygon => map(polygon.vertices, vertex => vertex.pos._x));

    return Math.min(...allX);
  }

  getPositionMinY(): number {
    const allY: number[] = flatMap(this.rawShape.polygons, polygon => map(polygon.vertices, vertex => vertex.pos._y));

    return Math.min(...allY);
  }

  getPositionMinZ(): number {
    const allZ: number[] = flatMap(this.rawShape.polygons, polygon => map(polygon.vertices, vertex => vertex.pos._z));

    return Math.min(...allZ);
  }

  getPositionMaxX(): number {
    const allX: number[] = flatMap(this.rawShape.polygons, polygon => map(polygon.vertices, vertex => vertex.pos._x));

    return Math.max(...allX);
  }

  getPositionMaxY(): number {
    const allY: number[] = flatMap(this.rawShape.polygons, polygon => map(polygon.vertices, vertex => vertex.pos._y));

    return Math.max(...allY);
  }

  getPositionMaxZ(): number {
    const allZ: number[] = flatMap(this.rawShape.polygons, polygon => map(polygon.vertices, vertex => vertex.pos._z));

    return Math.max(...allZ);
  }

  getWidth(): number {
    return this.getPositionMaxX() - this.getPositionMinX();
  }

  getLength(): number {
    return this.getPositionMaxY() - this.getPositionMinY();
  }

  getHeight(): number {
    return this.getPositionMaxZ() - this.getPositionMinZ();
  }
}
