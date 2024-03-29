import { Geom3 } from '@jscad/modeling/src/geometries/types';
import { subtract, union } from '@jscad/modeling/src/operations/booleans';
import {
  align,
  center,
  mirror,
  rotate,
  scale,
  translate,
} from '@jscad/modeling/src/operations/transforms';
import { cloneDeep, flatMap, map, random } from 'lodash';
import { Util } from './util';

export type NumbersDimensions = [number, number, number];
export type WLHDimensions = { width: number; length: number; height: number };
export type XYZDimensions = { x: number; y: number; z: number };

export type Vector = NumbersDimensions | XYZDimensions;
export type Dimensions = NumbersDimensions | WLHDimensions | XYZDimensions | number;

export type BooleanAxesToggles = [boolean, boolean, boolean];
export type WLHAxesToggles = { width?: boolean; length?: boolean; height?: boolean };
export type XYZAxesToggles = { x?: boolean; y?: boolean; z?: boolean };

export type AxesToggles =
  | BooleanAxesToggles
  | WLHAxesToggles
  | XYZAxesToggles
  | boolean;

export type RawShape = Geom3;
// export interface RawShape {
//   polygons: {
//     vertices: { pos: { _x: number; _y: number; _z: number }; tag: number }[];
//     shared: {
//       color: any;
//       tag: number;
//     };
//     plane: {
//       normal: { _x: number; _y: number; _z: number };
//       w: number;
//       tag: number;
//     };
//   }[];
//   properties: any;
//   isCanonicalized: boolean;
//   isRetesselated: boolean;
// }

export interface RoundCornersOptions {
  resolution?: number;
  radius?: number;
}

// this should be abstract, but TypeScript was freaking out
export class Shape<InputOptions = any> {
  private rawShape: RawShape = this.createInitialRawShape();
  private shapeGroup: Shape[] = [];
  private groupShapes: boolean = false;
  public readonly inputOptions: Required<InputOptions>;

  constructor(inputOptions: InputOptions, protected id: string = '' + random(999999)) {
    this.setPositionToZero();
    this.inputOptions = this.setDefaultOptions(inputOptions);
  }

  setDefaultOptions(options: InputOptions): Required<InputOptions> {
    return <Required<InputOptions>>options;
  }

  render(): RawShape {
    return this.rawShape;
  }

  // roundCorners(options: RoundCornersOptions = {}): this {
  //   const roundTheCorners: RawShape = cuboid({
  //     size: [this.getWidth(), this.getLength(), this.getHeight()]
  //   });
  //
  //   const roundedCube: RawShape = roundedCuboid({
  //     roundRadius: options.radius || 0.8,
  //     segments: options.resolution || 32,
  //     size: [this.getWidth(), this.getLength(), this.getHeight()]
  //   });
  //
  //   this.subtractShapes((roundTheCorners, roundedCube));
  //
  //   return this;
  // }

  ///////////////////
  // Manipulations //
  ///////////////////

  mirror(translation: Partial<Vector>): this {
    if (!this.groupShapes) {
      this.shapeGroup.forEach((s) => s.mirror(translation));
    }

    this.rawShape = mirror(
      { normal: Util.convertDimensionsToNumbers(translation) },
      this.rawShape,
    );
    // this.rawShape = mirror({ origin: Util.convertDimensionsToNumbers(translation) }, this.rawShape);

    return this;
  }

  /////////////////////
  // Transformations //
  /////////////////////

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
      this.shapeGroup.forEach((s) => s.rotate(rotations));
    }

    this.rawShape = rotate(
      Util.convertToRadian(Util.convertDimensionsToNumbers(rotations)),
      this.rawShape,
    );

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
      this.shapeGroup.forEach((s) => s.translate(translation));
    }

    this.rawShape = translate(
      Util.convertDimensionsToNumbers(translation),
      this.rawShape,
    );

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
      this.shapeGroup.forEach((s) => s.scale(translation));
    }

    this.rawShape = scale(
      Util.convertDimensionsToNumbers(translation, 1),
      this.rawShape,
    );

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
    const [x, y, z] = Util.convertAxesTogglesToBooleans(axesToggles);

    this.rawShape = align(
      {
        modes: [x ? 'min' : 'none', y ? 'min' : 'none', z ? 'min' : 'none'],
        relativeTo: [0, 0, 0],
      },
      this.rawShape,
    );

    return this;
  }

  center(axesToggles: AxesToggles = true): this {
    if (!this.groupShapes) {
      this.shapeGroup.forEach((s) => s.center(axesToggles));
    }

    this.rawShape = center(
      { axes: Util.convertAxesTogglesToBooleans(axesToggles) },
      this.rawShape,
    );

    return this;
  }

  centerOn(shape: Shape, axesToggles: AxesToggles = true): this {
    const { x, y, z } = Util.convertAxesTogglesToXYZ(axesToggles);

    [shape.rawShape, this.rawShape] = align(
      { modes: [x ? 'center' : 'none', y ? 'center' : 'none', z ? 'center' : 'none'] },
      shape.render(),
      this.rawShape,
    );

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

  addShapes(...shapes: Shape[]): this {
    // shapes = shapes.map((shape) => shape.alignStarting(this));
    this.shapeGroup.push(...shapes);

    this.rawShape = union(this.rawShape, ...shapes.map((s) => s.render()));

    return this;
  }

  //////////////////////
  // Combining Shapes //
  //////////////////////

  subtractShapes(...shapes: Shape[]): this {
    this.shapeGroup.push(...shapes);

    this.rawShape = subtract(this.rawShape, ...shapes.map((s) => s.render()));

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
  getTranslations(): XYZDimensions {
    const [, , , , , , , , , , , , x, y, z] = this.rawShape.transforms;
    return { x, y, z };
  }

  getPositionMinX(): number {
    const allX: number[] = flatMap(this.rawShape.polygons, (polygon) =>
      map(polygon.vertices, (vertex) => vertex[0]),
    );

    return Math.min(...allX) + this.getTranslations().x;
  }

  getPositionMinY(): number {
    const allY: number[] = flatMap(this.rawShape.polygons, (polygon) =>
      map(polygon.vertices, (vertex) => vertex[1]),
    );

    return Math.min(...allY) + this.getTranslations().y;
  }

  getPositionMinZ(): number {
    const allZ: number[] = flatMap(this.rawShape.polygons, (polygon) =>
      map(polygon.vertices, (vertex) => vertex[2]),
    );

    return Math.min(...allZ) + this.getTranslations().z;
  }

  getPositionMaxX(): number {
    const allX: number[] = flatMap(this.rawShape.polygons, (polygon) =>
      map(polygon.vertices, (vertex) => vertex[0]),
    );

    return Math.max(...allX) + this.getTranslations().x;
  }

  getPositionMaxY(): number {
    const allY: number[] = flatMap(this.rawShape.polygons, (polygon) =>
      map(polygon.vertices, (vertex) => vertex[1]),
    );

    return Math.max(...allY) + this.getTranslations().y;
  }

  getPositionMaxZ(): number {
    const allZ: number[] = flatMap(this.rawShape.polygons, (polygon) =>
      map(polygon.vertices, (vertex) => vertex[2]),
    );

    return Math.max(...allZ) + this.getTranslations().z;
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

  protected createInitialRawShape(): RawShape {
    throw new Error('You must override `createInitialRawShape`');
  }
}

export class ShapeContainer extends Shape<Shape[]> {
  protected createInitialRawShape(): RawShape {
    return union(...this.inputOptions.map((s) => s.render()));
  }
}
