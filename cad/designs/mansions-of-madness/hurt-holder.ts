import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { LidLip } from '../../designer/shapes/custom/lid';
import { RightTriangularPrism } from '../../designer/shapes/custom/right-triangular-prism';

export interface StatiiHolderOptions {
  cardLength: number;
  cardWidth: number;
  wallThickness: number;
  damageThickness: number;
  horrorThickness: number;
  notchSize: number;
}

const config: StatiiHolderOptions = {
  cardLength: 65.6 + 2,
  cardWidth: 42.9 + 2,
  wallThickness: 2,
  damageThickness: 34.3 + 2,
  horrorThickness: 32.3 + 2,
  notchSize: 10,
};

export class HurtHolder extends Shape<StatiiHolderOptions> {
  private lidLip: LidLip; //

  constructor(config: StatiiHolderOptions) {
    super(config);
  }

  makeLid(): Shape {
    return this.lidLip.makeLid();
  }

  protected createInitialRawShape(): RawShape {
    const { cardLength, cardWidth, wallThickness, damageThickness, horrorThickness, notchSize } = this.inputOptions;

    const totalWidth = wallThickness + damageThickness + wallThickness + horrorThickness + wallThickness;
    const totalLength = wallThickness + cardLength + wallThickness;
    const totalHeight = wallThickness + cardWidth;

    const base = new Cube({
      size: {
        width: totalWidth,
        length: totalLength,
        height: totalHeight,
      },
    });

    const damageHole = new Cube({
      size: {
        width: damageThickness,
        length: cardLength,
        height: cardWidth,
      },
    });

    const horrorHole = new Cube({
      size: {
        width: horrorThickness,
        length: cardLength,
        height: cardWidth,
      },
    });

    base.subtractShapes(
      damageHole.translate({
        x: wallThickness,
        y: wallThickness,
        z: wallThickness,
      }),
    );

    base.subtractShapes(
      horrorHole.alignWithTop(base, { x: true, y: true }).translate({
        x: -wallThickness,
        y: -wallThickness,
        z: wallThickness,
      }),
    );

    const sideNotch = new RightTriangularPrism({
      length: wallThickness,
      xLegLength: notchSize * 1.5,
      yLegLength: totalHeight * 2,
    })
      .mirrorAcrossZPlane()
      .translate({
        height: totalHeight,
        length: notchSize,
      });

    sideNotch
      .addShapes(
        sideNotch.clone().mirrorAcrossXPlane().centerOn(sideNotch).translate({
          y: -sideNotch.getLength(),
        }),
      )
      .centerOn(base, {
        length: true,
      })
      .translateZ(notchSize / 2);

    this.lidLip = new LidLip({
      width: base.getWidth(),
      length: base.getLength(),
      lipWidth: wallThickness,
    });

    base.addShapes(this.lidLip.translateZ(base.getHeight()));

    base.subtractShapes(sideNotch, sideNotch.clone().translateX(base.getWidth() - sideNotch.getWidth()));

    return base.render();
  }
}

export default new HurtHolder(config);
