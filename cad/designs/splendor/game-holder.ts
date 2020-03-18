import * as _ from 'lodash';
import { Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Cylinder } from '../../designer/shapes/core/cylinder';
import { LidLip } from '../../designer/shapes/custom/lid';
import { Util } from '../../designer/util';

interface SpendorGameHolderConfig {
  cardWidth: number;
  cardLength: number;
  tileWidth: number;
  tileLength: number;
  tokenDiameter: number;
  slotDepth: number;
}

class SpendorGameHolder extends Shape {
  private lidLip: LidLip;

  constructor({ cardWidth, cardLength, tileWidth, tileLength, tokenDiameter, slotDepth }: SpendorGameHolderConfig) {
    super();

    const exteriorWallWidth = 3;
    const interiorWallWidth = 1.4;
    const wiggleRoom = 0.5;

    const mainShape = new Cube({
      size: {
        width:
          exteriorWallWidth +
          wiggleRoom +
          cardWidth +
          wiggleRoom +
          interiorWallWidth +
          wiggleRoom +
          tileWidth +
          wiggleRoom +
          exteriorWallWidth,
        length:
          exteriorWallWidth +
          wiggleRoom +
          cardLength +
          wiggleRoom +
          interiorWallWidth +
          wiggleRoom +
          tokenDiameter +
          wiggleRoom +
          exteriorWallWidth,
        height: interiorWallWidth + wiggleRoom + slotDepth + wiggleRoom,
      },
    });

    this.lidLip = new LidLip({
      width: mainShape.getWidth(),
      length: mainShape.getLength(),
    });

    const cardSlot = new Cube({
      size: {
        width: wiggleRoom + cardWidth + wiggleRoom,
        length: wiggleRoom + cardLength + wiggleRoom,
        height: 200,
      },
    });

    const tileSlot = new Cube({
      size: {
        width: wiggleRoom + tileWidth + wiggleRoom,
        length: wiggleRoom + tileLength + wiggleRoom,
        height: 200,
      },
    });

    const tokenSlot = new Cylinder({
      radius: wiggleRoom + tokenDiameter / 2 + wiggleRoom,
      height: mainShape.getWidth() - exteriorWallWidth * 2,
      resolution: 128,
    });

    mainShape.subtractShapes(
      cardSlot.translate(exteriorWallWidth).render(),

      tileSlot
        .translate({
          x: cardSlot.getPositionMaxX() + interiorWallWidth,
          y: cardSlot.getPositionMinY(),
          z: cardSlot.getPositionMinZ(),
        })
        .render(),

      tokenSlot
        .rotateY(90)
        .translate({
          x: exteriorWallWidth,
          y: cardSlot.getPositionMaxY() + interiorWallWidth + tokenSlot.getLength() / 2,
          z: cardSlot.getPositionMinZ() + tokenSlot.getHeight() / 2,
        })
        .render(),

      // hole above token slots
      new Cube({
        size: {
          width: tokenSlot.getWidth(),
          length: tokenSlot.getLength(),
          height: 200,
        },
      })
        .translate({
          x: tokenSlot.getPositionMinX(),
          y: tokenSlot.getPositionMinY(),
          z: tokenSlot.getPositionMinZ() + tokenSlot.getHeight() / 2,
        })
        .render(),

      // new Cube({
      //   size: {
      //     width: 20,
      //     length: 20,
      //     height: 200,
      //   },
      // })
      //   .center()
      //   .translate({
      //     x: (cardSlot.getPositionMaxX() - cardSlot.getPositionMinX()) / 2,
      //     // y: cardSlot.getPositionMaxY() - cardSlot.getPositionMinY(),
      //   })
      //   .render(),

      // cut out to make cards easier to take out
      new Cube({
        size: {
          width: 20,
          length: 20,
          height: 200,
        },
      })
        .center({ x: true, y: true })
        .translate({
          x: cardSlot.getPositionMaxX() - cardSlot.getPositionMinX(),
          y: (cardSlot.getPositionMaxY() - cardSlot.getPositionMinY()) / 2,
          z: exteriorWallWidth,
        })
        .render(),
    );

    mainShape.addShapes(this.lidLip.translateZ(mainShape.getHeight()).render());

    console.log(
      Util.trimLines(`
        Width:  ${_.round(mainShape.getWidth(), 2)}mm
        Length: ${_.round(mainShape.getLength(), 2)}mm
        Height: ${_.round(mainShape.getHeight(), 2)}mm
      `),
    );
    console.log('');
    console.log(
      Util.trimLines(`
        Width:  ${_.round(Util.millimetersToInches(mainShape.getWidth()), 3)}"
        Length: ${_.round(Util.millimetersToInches(mainShape.getLength()), 3)}"
        Height: ${_.round(Util.millimetersToInches(mainShape.getHeight()), 3)}"
      `),
    );

    this.rawShape = mainShape.render();
  }

  makeLid() {
    return this.lidLip.makeLid({
      noButtons: true,
    });
  }
}

export default new SpendorGameHolder({
  cardWidth: Util.inchesToMillimeters(3.5),
  cardLength: Util.inchesToMillimeters(2.5),
  tileWidth: Util.inchesToMillimeters(2.5),
  tileLength: Util.inchesToMillimeters(2.5),
  tokenDiameter: Util.inchesToMillimeters(1.75),
  slotDepth: Util.inchesToMillimeters(1.75),
});
