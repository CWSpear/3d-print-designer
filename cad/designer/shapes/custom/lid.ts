const { polyhedron } = require('@jscad/csg/src/api/primitives3d-api');

import { Shape } from '../../shape';
import { Cube } from '../core/cube';
import { Cylinder } from '../core/cylinder';
import { RightTriangularPrism } from './right-triangular-prism';

export interface LidLipOptions {
  width: number;
  length: number;
  height?: number;
  lipWidth?: number;
  attachmentWidth?: number;
  extraClearance?: number;
}

export interface LidOptions {
  buttonDistanceFromEdge?: number;
  buttonSpacing?: number;
  buttonRadius?: number;
  buttonDepth?: number;
  noButtons?: boolean;
  extraWiggleRoom?: number;
}

export class LidLip extends Shape {
  private readonly width: number;
  private readonly length: number;
  private readonly height: number;
  private readonly lipWidth: number;
  private readonly attachmentWidth: number;
  private readonly extraClearance: number;

  constructor({ width, length, height = 2, lipWidth = 3, attachmentWidth = 1, extraClearance = 0.2 }: LidLipOptions) {
    super();

    this.width = width;
    this.length = length;
    this.height = height;
    this.lipWidth = lipWidth;
    this.attachmentWidth = attachmentWidth;
    this.extraClearance = extraClearance;

    this.rawShape = this.makeLip().render();
  }

  private makeLip(extraWiggleRoom: number = 0): Shape {
    const lipPartWest: Shape = this.makeLipPart(this.width - extraWiggleRoom).translateY(-this.lipWidth);
    const lipPartEast: Shape = lipPartWest.clone().mirrorAcrossXPlane();
    lipPartWest.translateY(this.length - extraWiggleRoom);
    const lipPartNorth: Shape = this.makeLipPart(this.length - extraWiggleRoom)
      .translateY(this.width - this.lipWidth - extraWiggleRoom)
      .rotateZ(90)
      .mirrorAcrossYPlane();

    return lipPartWest.addShapes(lipPartEast.render(), lipPartNorth.render());
  }

  private makeLipPart(partLength: number): Shape {
    const lipPart = new Cube({
      size: { width: partLength, length: this.lipWidth, height: this.height + this.extraClearance },
    });

    lipPart.subtractShapes(
      new RightTriangularPrism({
        xLegLength: this.lipWidth - this.attachmentWidth,
        yLegLength: this.height,
        length: partLength,
      })
        .translateZ(this.extraClearance)
        .render(),
      lipPart
        .clone()
        .translate({ y: -this.attachmentWidth, z: -this.height })
        .render(),
    );

    return lipPart;
  }

  makeLid(
    {
      buttonDistanceFromEdge = 15,
      buttonSpacing = 6,
      buttonRadius = 6,
      buttonDepth = 1.2,
      noButtons = false,
      extraWiggleRoom = 0.2,
    }: LidOptions = {
      buttonDistanceFromEdge: 15,
      buttonSpacing: 6,
      buttonRadius: 6,
      buttonDepth: 1.2,
      noButtons: false,
      extraWiggleRoom: 0.2,
    },
  ): Shape {
    const width = this.width - extraWiggleRoom;
    const length = this.length - extraWiggleRoom;

    const lid = new Cube({
      size: {
        width,
        length,
        height: this.height + this.extraClearance,
      },
    }).subtractShapes(
      this.makeLip(extraWiggleRoom).render(),
      new Cube({
        size: {
          width,
          length,
          height: this.extraClearance,
        },
      }).render(),
    );

    const button = new Cylinder({
      height: 10000,
      radius: buttonRadius,
    });

    if (!noButtons) {
      button.translate({
        x: buttonDistanceFromEdge,
        y: length / 2 - buttonRadius - buttonSpacing / 2,
        z: this.height - buttonDepth,
      });

      lid.subtractShapes(
        button.render(),
        button
          .clone()
          .translateY(buttonSpacing + buttonRadius * 2)
          .render(),
      );
    }

    return lid;
  }

  getTotalHeight() {
    return this.height + this.extraClearance;
  }
}
