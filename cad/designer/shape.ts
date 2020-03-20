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

enum OperationType {
  Translate = 'Translate',
  Rotate = 'Rotate',
  Mirror = 'Mirror',
  Center = 'Center',
  Scale = 'Scale',
  Difference = 'Difference',
  Union = 'Union',
}

type RawTranslateArgs = [NumbersDimensions];
type RawRotateArgs = [NumbersDimensions];
type RawMirrorArgs = [NumbersDimensions];
type RawScaleArgs = [NumbersDimensions];
type RawCenterArgs = [BooleanAxesToggles];
type RawDifferenceArgs = Shape[];
type RawUnionArgs = Shape[];

// don't use this, use `Operation`!
interface RawOperation<T> {
  type: OperationType;
  args: T;
}

interface TranslateOperation extends RawOperation<RawTranslateArgs> {
  type: OperationType.Translate;
}

interface RotateOperation extends RawOperation<RawRotateArgs> {
  type: OperationType.Rotate;
}

interface MirrorOperation extends RawOperation<RawMirrorArgs> {
  type: OperationType.Mirror;
}

interface CenterOperation extends RawOperation<RawCenterArgs> {
  type: OperationType.Center;
}

interface ScaleOperation extends RawOperation<RawScaleArgs> {
  type: OperationType.Scale;
}

interface DifferenceOperation extends RawOperation<RawDifferenceArgs> {
  type: OperationType.Difference;
}

interface UnionOperation extends RawOperation<RawUnionArgs> {
  type: OperationType.Union;
}

type Operation =
  | TranslateOperation
  | RotateOperation
  | MirrorOperation
  | CenterOperation
  | ScaleOperation
  | DifferenceOperation
  | UnionOperation;

export abstract class Shape {
  abstract readonly inputOptions: any;

  protected operations: Operation[] = [];

  protected rawShapeCache: RawShape = null;

  protected abstract createInitialRawShape(): RawShape;

  private shapeGroup: Shape[] = [];

  private groupShapes: boolean = false;

  protected constructor(protected id: string = '' + random(999999)) {}

  group(): this {
    this.groupShapes = true;

    return this;
  }

  render(): RawShape {
    // console.log(this.constructor.name, this.inputOptions);

    const previousShape = this.rawShapeCache || this.createInitialRawShape();

    if (this.operations.length === 0) {
      return previousShape;
    }

    this.rawShapeCache = this.operations.reduce(
      (rawShape: RawShape, operation: Operation) => this.performOperation(rawShape, operation),
      previousShape,
    );

    // reset operations so we only perform operations
    this.operations = [];

    return this.rawShapeCache;
  }

  private performOperation<T>(rawShape: RawShape, operation: Operation): RawShape {
    switch (operation.type) {
      case OperationType.Translate:
        return translate(operation.args[0], rawShape);
      case OperationType.Rotate:
        return rotate(operation.args[0], rawShape);
      case OperationType.Mirror:
        return mirror(operation.args[0], rawShape);
      case OperationType.Center:
        return center(operation.args[0], rawShape);
      case OperationType.Scale:
        return scale(operation.args[0], rawShape);
      case OperationType.Difference:
        return difference(rawShape, ...operation.args.map(s => s.render()));
      case OperationType.Union:
        return union(rawShape, ...operation.args.map(s => s.render()));
    }
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
    if (!this.group) {
      this.shapeGroup.forEach(s => s.mirror(translation));
    }

    this.operations.push(<MirrorOperation>{
      type: OperationType.Mirror,
      args: [Util.convertDimensionsToNumbers(translation)],
    });

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
    if (!this.group) {
      this.shapeGroup.forEach(s => s.rotate(rotations));
    }

    this.operations.push(<RotateOperation>{
      type: OperationType.Rotate,
      args: [Util.convertDimensionsToNumbers(rotations)],
    });

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
    if (!this.group) {
      this.shapeGroup.forEach(s => s.translate(translation));
    }

    this.operations.push(<TranslateOperation>{
      type: OperationType.Translate,
      args: [Util.convertDimensionsToNumbers(translation)],
    });

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
    if (!this.group) {
      this.shapeGroup.forEach(s => s.scale(translation));
    }

    this.operations.push(<ScaleOperation>{
      type: OperationType.Scale,
      args: [Util.convertDimensionsToNumbers(translation, 1)],
    });

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
    if (!this.group) {
      this.shapeGroup.forEach(s => s.center(axesToggles));
    }

    this.operations.push(<CenterOperation>{
      type: OperationType.Center,
      args: [Util.convertAxesTogglesToBooleans(axesToggles)],
    });

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

    this.operations.push(<UnionOperation>{
      type: OperationType.Union,
      args: shapes,
    });

    return this;
  }

  subtractShapes(...shapes: Shape[]): this {
    this.shapeGroup.push(...shapes);

    this.operations.push(<DifferenceOperation>{
      type: OperationType.Difference,
      args: shapes,
    });

    return this;
  }

  clone(): Shape {
    const shape = cloneDeep(this);

    if (shape.operations.length > 1 && shape.operations[0] === this.operations[0]) {
      debugger;
    }

    shape.id = `${shape.id}__CLONE`;

    return shape;
  }

  /////////////////////////////////////////////
  // Helper methods to find where shapes are //
  /////////////////////////////////////////////

  getPositionMinX(): number {
    const allX: number[] = flatMap(this.render().polygons, polygon => map(polygon.vertices, vertex => vertex.pos._x));

    return Math.min(...allX);
  }

  getPositionMinY(): number {
    const allY: number[] = flatMap(this.render().polygons, polygon => map(polygon.vertices, vertex => vertex.pos._y));

    return Math.min(...allY);
  }

  getPositionMinZ(): number {
    const allZ: number[] = flatMap(this.render().polygons, polygon => map(polygon.vertices, vertex => vertex.pos._z));

    return Math.min(...allZ);
  }

  getPositionMaxX(): number {
    const allX: number[] = flatMap(this.render().polygons, polygon => map(polygon.vertices, vertex => vertex.pos._x));

    return Math.max(...allX);
  }

  getPositionMaxY(): number {
    const allY: number[] = flatMap(this.render().polygons, polygon => map(polygon.vertices, vertex => vertex.pos._y));

    return Math.max(...allY);
  }

  getPositionMaxZ(): number {
    const allZ: number[] = flatMap(this.render().polygons, polygon => map(polygon.vertices, vertex => vertex.pos._z));

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
