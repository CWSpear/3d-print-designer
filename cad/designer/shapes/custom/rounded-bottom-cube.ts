import { Shape } from '../../shape';
import { Util } from '../../util';
import { Cube, CubeOptions } from '../core/cube';
import { Cylinder } from '../core/cylinder';

export interface RoundedBottomCubeOptions extends CubeOptions {
  rampSize: number;
}

export class RoundedBottomCube extends Cube {
  private readonly rampSize: number;

  constructor(options: RoundedBottomCubeOptions) {
    super(options);

    this.rampSize = options.rampSize;

    const [width, height] = Util.normalizeDimensions(options.size);

    this.csgShape = this.subtractShapes(
      this.makeRamp(width)
        .translate({ y: height - options.rampSize })
        .render(),
      this.makeRamp(height)
        .rotateZ(90)
        .translate({ x: options.rampSize })
        .render(),
      this.makeRamp(width)
        .rotateZ(180)
        .translate({ x: width, y: options.rampSize })
        .render(),
      this.makeRamp(height)
        .rotateZ(270)
        .translate({ x: width - options.rampSize, y: height })
        .render(),
    ).render();
  }

  private makeRamp(length: number): Shape {
    return new Cube({ size: { width: length, length: this.rampSize, height: this.rampSize } })
      .subtractShapes(
        new Cylinder({
          radius: this.rampSize,
          height: length,
        })
          .rotateY(90)
          .render(),
      )
      .rotateX(-90)
      .translateZ(this.rampSize);
  }
}
