import { RawShape, Shape } from '../../shape';
import { Util } from '../../util';
import { Cube, CubeOptions } from '../core/cube';
import { Cylinder } from '../core/cylinder';

export interface RoundedBottomCubeOptions extends CubeOptions {
  readonly rampSize: number;
}

export class RoundedBottomCube extends Shape<RoundedBottomCubeOptions> {
  constructor(inputOptions: RoundedBottomCubeOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const { width, length: height } = Util.convertDimensionsToWLH(this.inputOptions.size);

    const cube = new Cube(this.inputOptions);

    return cube
      .subtractShapes(
        this.makeRamp(width).alignWithTop(cube, { x: true, y: true }),
        this.makeRamp(height)
          .rotateZ(90)
          .alignWithBottom(cube, { x: true, y: true }),
        this.makeRamp(width)
          .rotateZ(180)
          .alignWithBottom(cube, { x: true, y: true }),
        this.makeRamp(height)
          .rotateZ(270)
          .alignWithTop(cube, { x: true, y: true }),
      )
      .render();
  }

  private makeRamp(length: number): Shape {
    return new Cube({ size: { width: length, length: this.inputOptions.rampSize, height: this.inputOptions.rampSize } })
      .subtractShapes(
        new Cylinder({
          radius: this.inputOptions.rampSize,
          height: length,
        }).rotateY(90),
      )
      .rotateX(-90)
      .translateZ(this.inputOptions.rampSize);
  }
}
