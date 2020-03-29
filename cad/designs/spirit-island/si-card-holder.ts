import _ from 'lodash';
import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { LidLip } from '../../designer/shapes/custom/lid';
import { RightTriangularPrism } from '../../designer/shapes/custom/right-triangular-prism';
import { Util } from '../../designer/util';

const options: CardHolderOptions = {
  width: 248, // 114
  cardLength: 92,
  miniCardLength: 45,
  // height: 45, // 44.90128060534576,
  height: 55, // ~Math.sqrt((75 ** 2) / 2) + ~2 // (75 is width of cardboard cards 'terror cards,' etc)
};

// const options: CardHolderOptions = {
//   width: 40,
//   cardLength: 20,
//   height: 30,
// };

// spirit:20
// fear:11
// minor:25
// major:17
// events:10
// island:4
// helpers:5
// cardboard:7
// lilcardboard:9
// invader:6
// scen+:5
// spirit+board:26

interface CardHolderOptions {
  width: number;
  cardLength: number;
  miniCardLength: number;
  height: number;
  wallWidth?: number;
  floorThickness?: number;
  slotSpacing?: number;
}

class CardHolder extends Shape<CardHolderOptions> {
  private lid: Shape;

  constructor(options: CardHolderOptions) {
    super({
      // defaults
      wallWidth: 5,
      floorThickness: 1,
      slotSpacing: 1,
      ...options,
    });
  }

  protected createInitialRawShape(): RawShape {
    const { width, cardLength, miniCardLength, height, wallWidth, floorThickness, slotSpacing } = this.inputOptions;

    const mainShape = new Cube({
      size: {
        width: width,
        length: cardLength + wallWidth * 2,
        height: (height * 2) / 3,
      },
    });

    const lidLip = new LidLip({
      width: mainShape.getWidth(),
      length: mainShape.getLength(),
    });

    this.lid = new Cube({
      size: {
        width: mainShape.getWidth(),
        length: mainShape.getLength(),
        height: height / 3 + 2,
      },
    });

    const originalLid = lidLip.makeLid({ noButtons: true });

    mainShape.addShapes(lidLip.translateZ(mainShape.getHeight()));

    this.lid
      .translateZ(originalLid.getHeight() + lidLip.inputOptions.extraClearance)
      .addShapes(originalLid)
      .subtractShapes(
        new Cube({
          size: {
            width: this.lid.getWidth(),
            length: mainShape.getLength() - (wallWidth - 1) * 2,
            height: this.lid.getHeight() - slotSpacing,
          },
        }).translate({ x: floorThickness, y: wallWidth - 1 }),
      );

    if (lidLip.inputOptions.extraClearance > 0) {
      const shapeToAdd = new Cube({
        size: {
          width: this.lid.getWidth() - lidLip.inputOptions.lipWidth - originalLid.inputOptions.extraWiggleRoom,
          length: this.lid.getLength() - lidLip.inputOptions.lipWidth * 2 - originalLid.inputOptions.extraWiggleRoom,
          height: lidLip.inputOptions.extraClearance,
        },
      });

      shapeToAdd.subtractShapes(
        new Cube({
          size: {
            width: shapeToAdd.getWidth() - lidLip.inputOptions.attachmentWidth,
            length:
              shapeToAdd.getLength() -
              lidLip.inputOptions.attachmentWidth * 2 +
              originalLid.inputOptions.extraWiggleRoom,
            height: lidLip.inputOptions.extraClearance,
          },
        }).translate({
          x: lidLip.inputOptions.attachmentWidth,
          y: lidLip.inputOptions.attachmentWidth,
        }),
      );

      this.lid.addShapes(
        shapeToAdd.translate({
          y: lidLip.inputOptions.lipWidth,
          z: lidLip.inputOptions.height,
        }),
      );
    }

    const cardThicknesses = [
      20, // spirit
      25, // minor
      17, // major
      11, // fear
      10, // events
      4, // island
      5, // helpers
      7, // cardboard
      6, // invader <-- must be last
    ];

    const thicknessSum = _.sum(cardThicknesses);

    console.log('thicknessSum', thicknessSum);

    const extraSpace =
      mainShape.getWidth() -
      slotSpacing -
      wallWidth -
      thicknessSum -
      height - // remember height is also the length of the triangle
      cardThicknesses.length * slotSpacing;

    const slots: Shape[] = [];
    let xOffset = 0;
    cardThicknesses.forEach((cardThickness, i) => {
      // const extraWidth = (cardThickness / thicknessSum) * 34;
      const extraWidth = 2.3;

      const slot = new Cube({
        size: {
          width: cardThickness + extraWidth,
          length: i === cardThicknesses.length - 1 ? miniCardLength : cardLength,
          height: 2000,
        },
      }).translate({
        z: floorThickness,
        y: wallWidth,
      });

      slots.push(
        slot
          .clone()
          .translateX(xOffset)
          .rotateY(45),
      );

      xOffset += slot.getWidth() + slotSpacing;
    });

    mainShape.subtractShapes(...slots.map(s => s));

    const heightBeforeLid = mainShape.getHeight();

    // test view with lid
    // mainShape.addShapes(this.lid.clone().translateZ(mainShape.getHeight() - 2.1));

    // slot to store extra stuff
    const triag1 = new RightTriangularPrism({
      xLegLength: 26,
      yLegLength: 26,
      length: cardLength,
    });

    const triag2 = new RightTriangularPrism({
      xLegLength: 12,
      yLegLength: 12,
      length: cardLength,
    });

    triag1.subtractShapes(triag2.alignWithTop(triag1, { z: true }));

    mainShape.subtractShapes(
      triag1
        .rotateZ(-90)
        .mirrorAcrossZPlane()
        .setPositionToZero()
        .translate({
          x: wallWidth + 4,
          y: wallWidth,
          z: mainShape.getHeight() - triag1.getHeight() - lidLip.inputOptions.height,
        }),
    );

    // magnet...
    const magnetHole = new Cube({
      size: {
        width: Util.magnetSize.width + Util.magnetMinWall,
        length: Util.magnetSize.length,
        height: Util.magnetSize.height,
      },
    });

    mainShape.subtractShapes(
      magnetHole
        .centerOn(mainShape, { y: true })
        .translateZ(mainShape.getHeight() - lidLip.inputOptions.height - magnetHole.getHeight() - Util.magnetMinWall),
    );

    // back thingy
    mainShape.addShapes(
      // buncha magic numbers :(
      new Cube({
        size: {
          width: 3,
          length: mainShape.getLength() - wallWidth * 2 - originalLid.inputOptions.extraWiggleRoom * 2 + 2,
          height: this.lid.getHeight() - originalLid.inputOptions.extraWiggleRoom - 3,
        },
      })
        .centerOn(mainShape, { y: true })
        .alignWithTop(mainShape, { x: true })
        .translate({ z: heightBeforeLid }),
    );

    // add floor back in
    const floor = new Cube({
      size: {
        width: mainShape.getWidth(),
        length: mainShape.getLength(),
        height: floorThickness,
      },
    });

    mainShape.addShapes(floor);

    return mainShape.render();
  }

  makeLid(): Shape {
    return this.lid;
  }
}

const cardHolder = new CardHolder(options);

export default cardHolder;
