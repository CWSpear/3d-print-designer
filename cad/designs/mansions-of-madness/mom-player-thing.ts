import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { TriangularPrism } from '../../designer/shapes/custom/triangular-prism';
import { Util } from '../../designer/util';

const config: MomPlayerThingOptions = {
  playerCardLength: 70 + 1,
  playerCardWidth: 120 + 1,
  otherCardLength: 63 + 1,
  otherCardWidth: 41 + 3.5,
  tokenAreaLength: 20,
  cardSlotThickness: 1.3,
  cardSlotDepth: 5,
  playerCardDepth: 2,
  tokenAreaDepth: 3,
  extraHeight: 1,
  cardSlotSpacing: 9,
  outerPadding: 5,
};

interface MomPlayerThingOptions {
  playerCardWidth: number;
  playerCardLength: number;
  otherCardLength: number;
  otherCardWidth: number;
  tokenAreaLength: number;
  cardSlotThickness: number;
  cardSlotDepth: number;
  playerCardDepth: number;
  tokenAreaDepth: number;
  extraHeight: number;
  cardSlotSpacing: number;
  outerPadding: number;
}

export class MomPlayerThing extends Shape<MomPlayerThingOptions> {
  private totalHeight: number;
  private totalWidth: number;
  private totalLength: number;

  constructor(options: MomPlayerThingOptions) {
    super(options);
  }

  protected createInitialRawShape(): RawShape {
    const {
      playerCardLength,
      playerCardWidth,
      otherCardLength,
      otherCardWidth,
      tokenAreaLength,
      cardSlotThickness,
      cardSlotDepth,
      playerCardDepth,
      tokenAreaDepth,
      extraHeight,
      cardSlotSpacing,
      outerPadding,
    } = this.inputOptions;

    const totalHeight = Math.max(cardSlotDepth, playerCardDepth, tokenAreaDepth) + extraHeight;
    this.totalHeight = totalHeight;

    const totalWidth =
      outerPadding + otherCardWidth + outerPadding + playerCardWidth + outerPadding + otherCardWidth + outerPadding;
    this.totalWidth = totalWidth;

    const totalLength =
      playerCardLength +
      outerPadding +
      tokenAreaLength +
      outerPadding +
      cardSlotSpacing +
      cardSlotSpacing +
      outerPadding +
      cardSlotThickness * 3;
    this.totalLength = totalLength;

    console.log(
      Util.trimLines(`
        Width:  ${totalWidth}
        Length: ${totalLength}
        Height: ${totalHeight}
      `),
    );
    console.log('');

    const playerThing = new Cube({ size: { width: totalWidth, length: totalLength, height: totalHeight } });

    //////////////

    const playerCardSlot = new Cube({
      size: { width: playerCardWidth, length: playerCardLength, height: playerCardDepth },
    });

    playerThing.subtractShapes(
      playerCardSlot.translate({
        x: (totalWidth - playerCardWidth) / 2,
        z: totalHeight - playerCardDepth,
      }),
    );

    const tokenArea = new Cube({
      size: { width: playerCardWidth, length: tokenAreaLength, height: tokenAreaDepth },
    });

    playerThing.subtractShapes(
      tokenArea.translate({
        x: playerCardSlot.getPositionMinX(),
        y: playerCardSlot.getLength() + outerPadding,
        z: totalHeight - tokenAreaDepth,
      }),
    );

    // const smallSlot = new Cube({
    //   size: { width: otherCardWidth, length: cardSlotThickness, height: cardSlotDepth * 2 },
    // })
    //   .translate({
    //     // need to try and offset the rotation
    //     y: -1.6,
    //     z: totalHeight - cardSlotDepth,
    //   })
    //     .rotateX(-20);

    // const smallSlot = new EquilateralTriangularPrism({
    //   length: otherCardLength,
    //   legLength: 7,
    // }).translate({
    //   z: 4,
    // });

    const smallSlot = new TriangularPrism({
      length: otherCardWidth,
      leftSideLength: 8,
      rightSideLength: 8,
      bottomSideLength: 6,
    })
      .translate({
        z: totalHeight - cardSlotDepth,
        y: -1,
      })
      .scale({ y: 0.95, z: 0.95 });

    const longSlot = new TriangularPrism({
      length: totalWidth - outerPadding * 2,
      leftSideLength: 8,
      rightSideLength: 8,
      bottomSideLength: 6,
    })
      .translate({
        z: totalHeight - cardSlotDepth,
        y: -2.4,
      })
      .scale({ y: 0.95, z: 0.95 });

    playerThing.subtractShapes(
      ...[
        ...this.makeSlots(9, outerPadding, 0, smallSlot),
        ...this.makeSlots(9, totalWidth - outerPadding - smallSlot.getWidth(), 0, smallSlot),
        ...this.makeSlots(3, outerPadding, tokenArea.getPositionMaxY(), longSlot),
      ],
    );

    return playerThing.render();
  }

  makeSlots(num: number, xOffset: number, yStart: number, slot: Shape): Shape[] {
    slot = slot.clone().translate({
      x: xOffset,
    });

    const arr = [];
    for (let i = 0; i < num; i++) {
      const y =
        yStart +
        this.inputOptions.cardSlotSpacing * i +
        this.inputOptions.outerPadding +
        this.inputOptions.cardSlotThickness * i;

      arr.push(slot.clone().translateY(y));
    }

    return arr;
  }

  sampler() {
    const width = 51;
    const count = 8;

    let accumScales: number[] = [];

    const slots: Shape[] = [];
    for (let i = 0; i < count; i++) {
      const scale = i * 0.05 + 0.8;
      accumScales.push(scale);

      const slot = new TriangularPrism({
        length: width,
        leftSideLength: 8,
        rightSideLength: 8,
        bottomSideLength: 6,
      })
        .translate({
          x: this.inputOptions.outerPadding,
          // need to try and offset the rotation
          y: -3.4,
          z: this.totalHeight - this.inputOptions.cardSlotDepth,
        })
        .scale({ y: scale, z: scale });

      const y = (this.inputOptions.cardSlotSpacing * i + this.inputOptions.outerPadding) * scale;

      slots.push(slot.clone().translateY(y));
    }

    const sampler = new Cube({
      size: {
        width: width + this.inputOptions.outerPadding * 2,
        length: slots[slots.length - 1].getPositionMaxY() + 1,
        height: this.totalHeight,
      },
    });

    sampler.subtractShapes(...slots);

    return sampler;
  }
}

export default new MomPlayerThing(config);

// export default new MomPlayerThing({
//   ...config,
//   cardSlotSpacing: 6,
// }).sampler();
