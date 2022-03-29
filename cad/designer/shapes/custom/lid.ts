import { RawShape, Shape } from '../../shape';
import { Cube } from '../core/cube';
import { Cylinder } from '../core/cylinder';
import { RightTriangularPrism } from './right-triangular-prism';

export interface LidLipOptions {
  readonly width: number;
  readonly length: number;
  readonly height?: number;
  readonly lipWidth?: number;
  readonly attachmentWidth?: number;
  readonly extraClearance?: number;
}

export interface LidOptions {
  buttonDistanceFromEdge?: number;
  buttonSpacing?: number;
  buttonRadius?: number;
  buttonDepth?: number;
  noButtons?: boolean;
  extraWiggleRoom?: number;
}

export interface Lid extends Shape {
  inputOptions: LidOptions;
}

export class LidLip extends Shape<LidLipOptions> {
  constructor(inputOptions: LidLipOptions, id?: string) {
    super(
      {
        height: 2,
        lipWidth: 3,
        attachmentWidth: 1,
        extraClearance: 0.2,
        ...inputOptions,
      },
      id,
    );
  }

  protected createInitialRawShape(): RawShape {
    return this.makeLip().render();
  }

  private makeLip(extraWiggleRoom: number = 0): Shape {
    const lipPartWest: Shape = this.makeLipPart(this.inputOptions.width - extraWiggleRoom).translateY(
      -this.inputOptions.lipWidth,
    );

    const lipPartEast: Shape = lipPartWest.clone().mirrorAcrossXPlane();
    lipPartWest.translateY(this.inputOptions.length - extraWiggleRoom);
    const lipPartNorth: Shape = this.makeLipPart(this.inputOptions.length - extraWiggleRoom)
      .translateY(this.inputOptions.width - this.inputOptions.lipWidth - extraWiggleRoom)
      .rotateZ(90)
      .mirrorAcrossYPlane();

    return lipPartWest.addShapes(lipPartEast, lipPartNorth);
  }

  private makeLipPart(partLength: number): Shape {
    const lipPart = new Cube(
      {
        size: {
          width: partLength,
          length: this.inputOptions.lipWidth,
          height: this.inputOptions.height + this.inputOptions.extraClearance,
        },
      },
      `${this.id}__CUBE`,
    );

    lipPart.subtractShapes(
      new RightTriangularPrism(
        {
          xLegLength: this.inputOptions.lipWidth - this.inputOptions.attachmentWidth,
          yLegLength: this.inputOptions.height,
          length: partLength,
        },
        `${this.id}__RTP`,
      ).translateZ(this.inputOptions.extraClearance),
      lipPart.clone().translate({ y: -this.inputOptions.attachmentWidth, z: -this.inputOptions.height }),
    );

    return lipPart;
  }

  makeLid(inputOptions: LidOptions = {}): Lid {
    inputOptions = {
      buttonDistanceFromEdge: 15,
      buttonSpacing: 6,
      buttonRadius: 6,
      buttonDepth: 1.2,
      noButtons: false,
      extraWiggleRoom: 0.2,
      ...inputOptions,
    };

    const { buttonDistanceFromEdge, buttonSpacing, buttonRadius, buttonDepth, noButtons, extraWiggleRoom } =
      inputOptions;

    const width = this.inputOptions.width - extraWiggleRoom;
    const length = this.inputOptions.length - extraWiggleRoom;

    const lid = new Cube({
      size: {
        width,
        length,
        height: this.inputOptions.height + this.inputOptions.extraClearance,
      },
    });

    lid.subtractShapes(this.makeLip(extraWiggleRoom));

    if (this.inputOptions.extraClearance > 0) {
      lid.subtractShapes(
        new Cube({
          size: {
            width,
            length,
            height: this.inputOptions.extraClearance,
          },
        }),
      );
    }

    if (!noButtons) {
      const button = new Cylinder({
        height: 10000,
        radius: buttonRadius,
      });

      button.translate({
        x: buttonDistanceFromEdge,
        y: length / 2 - buttonRadius - buttonSpacing / 2,
        z: this.inputOptions.height - buttonDepth,
      });

      lid.subtractShapes(button, button.clone().translateY(buttonSpacing + buttonRadius * 2));
    }

    const clone = lid.clone();

    (<Lid>clone).inputOptions = inputOptions;

    return <Lid>clone.setPositionToZero({ z: true });
  }

  /** @deprecated */
  getTotalHeight() {
    return this.inputOptions.height + this.inputOptions.extraClearance;
  }
}
