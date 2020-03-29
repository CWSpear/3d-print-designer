const { difference } = require('@jscad/csg/src/api/ops-booleans');
const { union } = require('@jscad/csg/src/api/ops-booleans');
const { translate, rotate, mirror, center, scale } = require('@jscad/csg/src/api/ops-transformations');
const { cube } = require('@jscad/csg/src/api/primitives3d-api');

import { raw } from 'express';
import { cloneDeep, flatMap, map, random } from 'lodash';
import { Cube, CubeOptions } from './shapes/core/cube';
import { Util } from './util';

export type NumbersDimensions = [number, number, number];
export type WLHDimensions = { width: number; length: number; height: number };
export type XYZDimensions = { x: number; y: number; z: number };

export type Vector = NumbersDimensions | XYZDimensions;
export type Dimensions = NumbersDimensions | WLHDimensions | XYZDimensions | number;

export type BooleanAxesToggles = [boolean, boolean, boolean];
export type WLHAxesToggles = { width?: boolean; length?: boolean; height?: boolean };
export type XYZAxesToggles = { x?: boolean; y?: boolean; z?: boolean };

export type AxesToggles = BooleanAxesToggles | WLHAxesToggles | XYZAxesToggles | boolean;

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

export interface RoundCornersOptions {
  resolution?: number;
  radius?: number;
}

export abstract class Shape<InputOptions = any> {
  private rawShape: RawShape = this.createInitialRawShape();

  protected abstract createInitialRawShape(): RawShape;

  private shapeGroup: Shape[] = [];

  private groupShapes: boolean = false;

  protected constructor(public readonly inputOptions: InputOptions, protected id: string = '' + random(999999)) {}

  render(): RawShape {
    return this.rawShape;
  }

  ///////////////////
  // Manipulations //
  ///////////////////

  // TODO does not support new thing
  roundCorners(options: RoundCornersOptions = {}): this {
    const roundTheCorners: RawShape = cube({
      size: [this.getWidth(), this.getLength(), this.getHeight()],
    });

    const roundedCube: RawShape = cube({
      round: true,
      radius: options.radius || 0.8,
      fn: options.resolution || 32,
      size: [this.getWidth(), this.getLength(), this.getHeight()],
    });

    this.subtractShapes(difference(roundTheCorners, roundedCube));

    return this;
  }

  /////////////////////
  // Transformations //
  /////////////////////

  mirror(translation: Partial<Vector>): this {
    if (!this.groupShapes) {
      this.shapeGroup.forEach(s => s.mirror(translation));
    }

    this.rawShape = mirror(Util.convertDimensionsToNumbers(translation), this.rawShape);

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

  rotate(rotations: Partial<Dimensions>): this {
    if (!this.groupShapes) {
      this.shapeGroup.forEach(s => s.rotate(rotations));
    }

    this.rawShape = rotate(Util.convertDimensionsToNumbers(rotations), this.rawShape);

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
    if (!this.groupShapes) {
      this.shapeGroup.forEach(s => s.translate(translation));
    }

    this.rawShape = translate(Util.convertDimensionsToNumbers(translation), this.rawShape);

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
    if (!this.groupShapes) {
      this.shapeGroup.forEach(s => s.scale(translation));
    }

    this.rawShape = scale(Util.convertDimensionsToNumbers(translation, 1), this.rawShape);

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

  setPositionToZero(axesToggles: AxesToggles = true) {
    const [centerX, centerY, centerZ] = Util.convertAxesTogglesToBooleans(axesToggles);

    const translations: Partial<XYZDimensions> = {};

    if (centerX) {
      translations.x = -this.getPositionMinX();
    }

    if (centerY) {
      translations.y = -this.getPositionMinY();
    }

    if (centerZ) {
      translations.z = -this.getPositionMinZ();
    }

    this.translate(translations);

    return this;
  }

  center(axesToggles: AxesToggles = true): this {
    if (!this.groupShapes) {
      this.shapeGroup.forEach(s => s.center(axesToggles));
    }

    this.rawShape = center(Util.convertAxesTogglesToBooleans(axesToggles), this.rawShape);

    return this;
  }

  centerOn(shape: Shape, axesToggles: AxesToggles = true): this {
    const { x, y, z } = Util.convertAxesTogglesToXYZ(axesToggles);

    this.setPositionToZero(axesToggles);

    const translations: Partial<XYZDimensions> = {};

    if (x) {
      translations.x = shape.getPositionMinX() + (shape.getWidth() - this.getWidth()) / 2;
    }

    if (y) {
      translations.y = shape.getPositionMinY() + (shape.getLength() - this.getLength()) / 2;
    }

    if (z) {
      translations.z = shape.getPositionMinZ() + (shape.getHeight() - this.getHeight()) / 2;
    }

    this.translate(translations);

    return this;
  }

  alignWithTop(shape: Shape, axesToggles: AxesToggles = true): this {
    const { x, y, z } = Util.convertAxesTogglesToXYZ(axesToggles);

    this.setPositionToZero(axesToggles);

    const translations: Partial<XYZDimensions> = {};

    if (x) {
      translations.x = shape.getPositionMaxX() - this.getWidth();
    }

    if (y) {
      translations.y = shape.getPositionMaxY() - this.getLength();
    }

    if (z) {
      translations.z = shape.getPositionMaxZ() - this.getHeight();
    }

    this.translate(translations);

    return this;
  }

  alignWithBottom(shape: Shape, axesToggles: AxesToggles = true): this {
    const { x, y, z } = Util.convertAxesTogglesToXYZ(axesToggles);

    this.setPositionToZero(axesToggles);

    const translations: Partial<XYZDimensions> = {};

    if (x) {
      translations.x = shape.getPositionMinX();
    }

    if (y) {
      translations.y = shape.getPositionMinY();
    }

    if (z) {
      translations.z = shape.getPositionMinZ();
    }

    this.translate(translations);

    return this;
  }

  //////////////////////
  // Combining Shapes //
  //////////////////////

  addShapes(...shapes: Shape[]): this {
    this.shapeGroup.push(...shapes);

    this.rawShape = union(this.rawShape, ...shapes.map(s => s.render()));

    return this;
  }

  subtractShapes(...shapes: Shape[]): this {
    this.shapeGroup.push(...shapes);

    this.rawShape = difference(this.rawShape, ...shapes.map(s => s.render()));

    return this;
  }

  clone(): this {
    const shape = cloneDeep(this);

    shape.id = `${shape.id}__CLONE`;

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

export class ShapeContainer extends Shape<Shape[]> {
  protected createInitialRawShape(): RawShape {
    return union(...this.inputOptions.map(s => s.render()));
  }
}
