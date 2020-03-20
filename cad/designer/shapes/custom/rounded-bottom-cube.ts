import { RawShape, Shape } from '../../shape';
import { Util } from '../../util';
import { Cube, CubeOptions } from '../core/cube';
import { Cylinder } from '../core/cylinder';

export interface RoundedBottomCubeOptions extends CubeOptions {
  readonly rampSize: number;
}

export class RoundedBottomCube extends Cube {
  private readonly rampSize: number;

  constructor(public readonly inputOptions: RoundedBottomCubeOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    this.inputOptions.rampSize;

    const { width, height } = Util.convertDimensionsToWLH(this.inputOptions.size);

    return this.subtractShapes(
      this.makeRamp(width).translate({ y: height - this.inputOptions.rampSize }),
      this.makeRamp(height)
        .rotateZ(90)
        .translate({ x: this.inputOptions.rampSize }),
      this.makeRamp(width)
        .rotateZ(180)
        .translate({ x: width, y: this.inputOptions.rampSize }),
      this.makeRamp(height)
        .rotateZ(270)
        .translate({ x: width - this.inputOptions.rampSize, y: height }),
    ).render();
  }

  private makeRamp(length: number): Shape {
    return new Cube({ size: { width: length, length: this.rampSize, height: this.rampSize } })
      .subtractShapes(
        new Cylinder({
          radius: this.rampSize,
          height: length,
        }).rotateY(90),
      )
      .rotateX(-90)
      .translateZ(this.rampSize);
  }
}
