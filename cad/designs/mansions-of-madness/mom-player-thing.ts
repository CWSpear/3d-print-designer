import { Dimensions, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Util } from '../../designer/util';
import { sum } from 'lodash';

const config: MomPlayerThingOptions = {
  playerCardLength: 70 + 1,
  playerCardWidth: 120 + 1,
  otherCardLength: 63 + 1,
  otherCardWidth: 41 + 2,
  tokenAreaLength: 20,
  cardSlotThickness: 1.1,
  cardSlotDepth: 5,
  playerCardDepth: 2,
  tokenAreaDepth: 3,
  extraHeight: 1,
  cardSlotSpacing: 9.5,
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

export class MomPlayerThing extends Shape {
  private readonly playerCardLength: number;
  private readonly playerCardWidth: number;
  private readonly otherCardLength: number;
  private readonly otherCardWidth: number;
  private readonly tokenAreaLength: number;
  private readonly cardSlotThickness: number;
  private readonly cardSlotDepth: number;
  private readonly playerCardDepth: number;
  private readonly tokenAreaDepth: number;
  private readonly extraHeight: number;
  private readonly cardSlotSpacing: number;
  private readonly outerPadding: number;

  private readonly totalHeight: number;
  private readonly totalWidth: number;
  private readonly totalLength: number;

  constructor({
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
  }: MomPlayerThingOptions) {
    super();

    this.playerCardLength = playerCardLength;
    this.playerCardWidth = playerCardWidth;
    this.otherCardLength = otherCardLength;
    this.otherCardWidth = otherCardWidth;
    this.tokenAreaLength = tokenAreaLength;
    this.cardSlotThickness = cardSlotThickness;
    this.cardSlotDepth = cardSlotDepth;
    this.playerCardDepth = playerCardDepth;
    this.tokenAreaDepth = tokenAreaDepth;
    this.extraHeight = extraHeight;
    this.cardSlotSpacing = cardSlotSpacing;
    this.outerPadding = outerPadding;

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
      playerCardSlot
        .translate({
          x: (totalWidth - playerCardWidth) / 2,
          z: totalHeight - playerCardDepth,
        })
        .render(),
    );

    const tokenArea = new Cube({
      size: { width: playerCardWidth, length: tokenAreaLength, height: tokenAreaDepth },
    });

    playerThing.subtractShapes(
      tokenArea
        .translate({
          x: playerCardSlot.getPositionMinX(),
          y: playerCardSlot.getLength() + outerPadding,
          z: totalHeight - tokenAreaDepth,
        })
        .render(),
    );

    const smallSlot = new Cube({
      size: { width: otherCardWidth, length: cardSlotThickness, height: cardSlotDepth * 2 },
    })
      .translate({
        // need to try and offset the rotation
        y: -1.6,
        z: totalHeight - cardSlotDepth,
      })
      .rotateX(-20);

    const longSlot = new Cube({
      size: { width: totalWidth - outerPadding * 2, length: cardSlotThickness, height: cardSlotDepth * 2 },
    })
      .translate({
        // need to try and offset the rotation
        y: -1.6,
        z: totalHeight - cardSlotDepth,
      })
      .rotateX(-20);

    playerThing.subtractShapes(
      ...[
        ...this.makeSlots(9, outerPadding, 0, smallSlot),
        ...this.makeSlots(9, totalWidth - outerPadding - smallSlot.getWidth(), 0, smallSlot),
        ...this.makeSlots(3, outerPadding, tokenArea.getPositionMaxY(), longSlot),
      ].map(s => s.render()),
    );

    this.rawShape = playerThing.render();
  }

  makeSlots(num: number, xOffset: number, yStart: number, slot: Shape): Shape[] {
    slot = slot.clone().translate({
      x: xOffset,
    });

    const arr = [];
    for (let i = 0; i < num; i++) {
      const y = yStart + this.cardSlotSpacing * i + this.outerPadding + this.cardSlotThickness * i;

      arr.push(slot.clone().translateY(y));
    }

    return arr;
  }

  sampler() {
    const width = 51;
    const count = 8;

    let accumThickness: number[] = [];

    const arr: Shape[] = [];
    for (let i = 0; i < count; i++) {
      const thickness = i * 0.1 + 0.6;
      accumThickness.push(thickness);

      const slot = new Cube({
        size: { width, length: thickness, height: this.cardSlotDepth * 2 },
      })
        .translate({
          x: this.outerPadding,
          // need to try and offset the rotation
          y: -3.4,
          z: this.totalHeight - this.cardSlotDepth,
        })
        .rotateX(-20);

      const y = this.cardSlotSpacing * i + this.outerPadding + sum(accumThickness);

      arr.push(slot.clone().translateY(y));
    }

    const sampler = new Cube({
      size: {
        width: width + this.outerPadding * 2,
        length: count * this.cardSlotSpacing + this.cardSlotSpacing + sum(accumThickness),
        height: this.totalHeight,
      },
    });

    sampler.subtractShapes(...arr.map(s => s.render()));

    return sampler;
  }
}

export default new MomPlayerThing(config);

// export default new MomPlayerThing({
//   ...config,
//   cardSlotSpacing: 4.5,
// }).sampler();
