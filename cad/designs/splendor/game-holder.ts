import { RawShape, Shape } from '../../designer/shape';
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
  tilesHeight: number;
  cardsHeight: number;
}

export const magnetMinWall = 0.59999;

class SpendorGameHolder extends Shape<SpendorGameHolderConfig> {
  mainShape: Shape;
  magnet1: Shape;
  magnet2: Shape;
  lidLip: LidLip;

  constructor(inputOptions: SpendorGameHolderConfig) {
    super(inputOptions);
  }

  protected createInitialRawShape(): RawShape {
    const {
      cardWidth,
      cardLength,
      tileWidth,
      tileLength,
      tokenDiameter,
      slotDepth,
      tilesHeight,
      cardsHeight,
    } = this.inputOptions;

    const exteriorWallWidth = 3;
    const interiorWallWidth = 2;
    const floorWidth = 2;
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
        height: floorWidth + wiggleRoom + slotDepth + wiggleRoom,
      },
    });

    const cardSlot = new Cube(
      {
        size: {
          width: wiggleRoom + cardWidth + wiggleRoom,
          length: wiggleRoom + cardLength + wiggleRoom,
          height: 200,
        },
      },
      'Card Slot',
    );

    const tileSlot = new Cube({
      size: {
        width: wiggleRoom + tileWidth + wiggleRoom,
        length: wiggleRoom + tileLength + wiggleRoom,
        height: 200,
      },
    });

    const tokenSlot = new Cylinder({
      radius: (wiggleRoom + tokenDiameter + wiggleRoom) / 2,
      height: mainShape.getWidth() - exteriorWallWidth * 2,
      resolution: 128,
    }).rotateY(90);

    // all (non-magnet) slot translations here:
    mainShape.subtractShapes(
      cardSlot.translate({
        x: exteriorWallWidth,
        y: exteriorWallWidth,
        z: mainShape.getHeight() - (wiggleRoom + cardsHeight + wiggleRoom),
      }),
      tileSlot
        .translate({
          x: cardSlot.getPositionMaxX() + interiorWallWidth,
          z: mainShape.getHeight() - (wiggleRoom + tilesHeight + wiggleRoom),
        })
        .centerOn(cardSlot, { y: true }),
      tokenSlot.translate({
        x: exteriorWallWidth,
        y: cardSlot.getPositionMaxY() + interiorWallWidth + tokenSlot.getLength() / 2,
        z: floorWidth + tokenSlot.getHeight() / 2,
      }),
      // hole above token slots
      new Cube({
        size: {
          width: tokenSlot.getWidth(),
          length: tokenSlot.getLength(),
          height: 200,
        },
      }).translate({
        x: tokenSlot.getPositionMinX(),
        y: tokenSlot.getPositionMinY(),
        z: tokenSlot.getPositionMinZ() + tokenSlot.getHeight() / 2,
      }),

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
      //   ,

      // cut out to make cards easier to take out
      // new Cube({
      //   size: {
      //     width: interiorWallWidth,
      //     length: 20,
      //     height: 200,
      //   },
      // })
      //   .center({ x: true, y: true })
      //   .translate({
      //     x: cardSlot.getPositionMaxX() - cardSlot.getPositionMinX(),
      //     y: (cardSlot.getPositionMaxY() - cardSlot.getPositionMinY()) / 2,
      //     z: floorWidth,
      //   })
      //   ,
    );

    const cardPushOut = new Cube({
      size: {
        width: cardSlot.getWidth(),
        length: cardSlot.getLength() * 0.42,
        height: cardSlot.getHeight(),
      },
    });

    cardPushOut.translate({
      z: floorWidth,
      y: cardSlot.getPositionMaxY() - cardPushOut.getLength(),
      x: cardSlot.getPositionMinX(),
    });

    const tilePushOut = new Cube({
      size: {
        width: tileSlot.getWidth(),
        length: tileSlot.getLength() / 3,
        height: tileSlot.getHeight(),
      },
    });

    tilePushOut.translate({
      z: mainShape.getHeight() - (wiggleRoom + tilesHeight + wiggleRoom + tilesHeight),
      y: tileSlot.getPositionMaxY() - tilePushOut.getLength(),
      x: tileSlot.getPositionMinX(),
    });

    mainShape.subtractShapes(cardPushOut, tilePushOut);

    // console.log(cardSlot.getLength() - cardsHeight + wiggleRoom * 2);
    // console.log(mainShape.getHeight() - floorWidth - wiggleRoom * 2);
    // console.log(Math.sqrt(39 ** 2 + 43 ** 2))
    //
    // const cardRamp = new RightTriangularPrism({
    //   xLegLength: cardSlot.getLength() - cardsHeight + wiggleRoom * 2,
    //   yLegLength: mainShape.getHeight() - floorWidth - wiggleRoom * 2,
    //   length: cardSlot.getWidth(),
    // });
    //
    // mainShape.addShapes(cardRamp.translate({
    //   x: cardSlot.getPositionMinX(),
    //   y: cardSlot.getPositionMinY(),
    //   z: cardSlot.getPositionMinZ(),
    // }));
    //
    // const cardCutout = new Cube({
    //   size: {
    //     width: 20,
    //     length: 30,
    //     height: 200,
    //   },
    // });
    //
    // const tileCutout = cardCutout.clone();
    //
    // console.log('cardCutout.getPositionMaxY()', cardCutout.getPositionMaxY());
    //
    // cardCutout
    //   .center({ x: true })
    //   .translateY(cardSlot.getPositionMaxY())
    //   .translateZ(cardSlot.getPositionMinZ())
    //   .translateX((cardSlot.getPositionMaxX() - cardSlot.getPositionMinX()) / 2);
    //
    // tileCutout
    //   .center({ x: true })
    //   .translateY(tileSlot.getPositionMaxY())
    //   .translateZ(tileSlot.getPositionMinZ())
    //   .translateX(tileSlot.getPositionMinX() + (tileSlot.getPositionMaxX() - tileSlot.getPositionMinX()) / 2);
    //
    // mainShape.subtractShapes(cardCutout, tileCutout);

    const magnetWall = new Cube({
      size: {
        width: Util.magnetSize.width + magnetMinWall * 2,
        length: mainShape.getLength(),
        height: mainShape.getHeight(),
      },
    });

    mainShape.translateX(magnetWall.getWidth() - exteriorWallWidth);

    mainShape.addShapes(
      magnetWall.clone(),
      // magnetWall
      //   .clone()
      //   .translateX(mainShape.getPositionMaxX())
      //   ,
    );

    const magnetHole = new Cube({
      size: Util.magnetSize,
    }).centerOn(magnetWall, { x: true, y: true });

    const magnet1 = magnetHole.translate({
      z: magnetWall.getHeight() - magnetHole.getHeight() - magnetMinWall,
    });

    const magnet2 = magnet1.clone().translateX(mainShape.getWidth() - magnetWall.getWidth() / 2);

    magnet1.addShapes(magnet1.clone().translateX(-magnet1.getWidth()));

    magnet2.addShapes(magnet2.clone().translateX(magnet2.getWidth()));

    mainShape.subtractShapes(magnet1); // , magnet2);

    // mainShape.subtractShapes(
    //   new Cylinder({
    //     radius: 15,
    //     height: 100,
    //   })
    //     .centerOn(cardSlot, { y: true })
    //     .translate({
    //       x: cardSlot.getPositionMaxX() + cardSlot.getPositionMinX() + (interiorWallWidth / 2),
    //       z: floorWidth,
    //     })
    //     ,
    // );

    this.lidLip = new LidLip({
      width: mainShape.getWidth(),
      length: mainShape.getLength(),
    });

    mainShape.addShapes(this.lidLip.translateZ(mainShape.getHeight()));

    // mainShape.roundCorners();

    // console.log('\nMain Box:\n');
    // console.log(
    //   Util.trimLines(`
    //     Width:  ${_.round(mainShape.getWidth(), 2)} mm
    //     Length: ${_.round(mainShape.getLength(), 2)} mm
    //     Height: ${_.round(mainShape.getHeight(), 2)} mm
    //
    //     Card Hole Depth:  ${_.round(mainShape.getHeight() - cardSlot.getPositionMinZ(), 2)} mm
    //     Card Hole Width:  ${_.round(cardSlot.getWidth(), 2)} mm
    //     Card Hole Length: ${_.round(cardSlot.getLength(), 2)} mm
    //
    //     Tile Hole Depth:  ${_.round(mainShape.getHeight() - tileSlot.getPositionMinZ(), 2)} mm
    //     Tile Hole Width:  ${_.round(tileSlot.getWidth(), 2)} mm
    //     Tile Hole Length: ${_.round(tileSlot.getLength(), 2)} mm
    //
    //     Token Hole Depth:    ${_.round(mainShape.getHeight() - tokenSlot.getPositionMinZ(), 2)} mm
    //     Token Hole Width:    ${_.round(tokenSlot.getWidth(), 2)} mm
    //     Token Hole Diameter: ${_.round(tokenSlot.getLength(), 2)} mm
    //   `),
    // );
    // console.log('');
    // console.log(
    //   Util.trimLines(`
    //     Width:  ${_.round(Util.millimetersToInches(mainShape.getWidth()), 3)} in
    //     Length: ${_.round(Util.millimetersToInches(mainShape.getLength()), 3)} in
    //     Height: ${_.round(Util.millimetersToInches(mainShape.getHeight()), 3)} in
    //   `),
    // );

    this.mainShape = mainShape;
    this.magnet1 = magnet1;
    this.magnet2 = magnet2;

    // console.log(mainShape.render()); //

    mainShape.subtractShapes(
      new Cube({
        size: {
          width: 30,
          length: 30,
          height: 200,
        },
      }).alignWithBottom(cardSlot, { x: true, y: true }),
    );

    return mainShape.render();
  }
}

export default new SpendorGameHolder({
  // cardWidth: Util.inchesToMillimeters(3.5),
  // cardLength: Util.inchesToMillimeters(2.5),
  // tileWidth: Util.inchesToMillimeters(2.5),
  // tileLength: Util.inchesToMillimeters(2.5),
  // tokenDiameter: Util.inchesToMillimeters(1.75),
  // slotDepth: Util.inchesToMillimeters(1.7),

  cardWidth: 88 + 1.4,
  cardLength: 63 + 1.4,
  tileWidth: 60,
  tileLength: 60,
  tokenDiameter: 45,
  slotDepth: 43,

  tilesHeight: 16.4,
  cardsHeight: 32,
});
