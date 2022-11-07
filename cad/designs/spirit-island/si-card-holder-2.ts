import _ from 'lodash';
import { RawShape, Shape, ShapeContainer } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Lid, LidLip } from '../../designer/shapes/custom/lid';
import { RightTriangularPrism } from '../../designer/shapes/custom/right-triangular-prism';
import { Util } from '../../designer/util';

enum CardType {
  MiniCard = 'miniCard',
  Card = 'card',
  CardBoard = 'cardBoard',
}

interface Card {
  thickness: number;
  name: string;
  type: CardType;
}

const options: CardHolderOptions = {
  cardSizes: {
    [CardType.MiniCard]: {
      width: 43.83,
      length: 67.2,
    },
    [CardType.Card]: {
      width: 63,
      length: 88.5,
    },
    [CardType.CardBoard]: {
      width: 74.6,
      length: 89.4,
    },
  },
  arrangement: [
    [
      { thickness: 20, name: 'spirit', type: CardType.Card },
      { thickness: 10, name: 'events', type: CardType.Card },
      { thickness: 5, name: 'helpers', type: CardType.Card },
    ], // 35 + 2
    [
      { thickness: 25, name: 'minor', type: CardType.Card },
      { thickness: 11, name: 'fear', type: CardType.Card },
    ], // 36 + 1
    [
      { thickness: 17, name: 'major', type: CardType.Card },
      { thickness: 4, name: 'island', type: CardType.Card },
      { thickness: 7, name: 'cardboard', type: CardType.CardBoard },
      { thickness: 6, name: 'invader', type: CardType.MiniCard },
    ], // 34 + 4
  ],
};

interface CardHolderOptions {
  cardSizes: {
    miniCard: {
      width: number;
      length: number;
    };
    card: {
      width: number;
      length: number;
    };
    cardBoard: {
      width: number;
      length: number;
    };
  };

  arrangement: Card[][];

  outerWallWidth?: number;
  floorThickness?: number;
  slotSpacing?: number;
}

class CardHolder extends Shape<CardHolderOptions> {
  private lid!: Lid;

  setDefaultOptions(options: CardHolderOptions): Required<CardHolderOptions> {
    return super.setDefaultOptions({
      // defaults
      outerWallWidth: 5,
      floorThickness: 1,
      slotSpacing: 1,
      ...options,
    });
  }

  makeLid(): Shape {
    return this.lid;
  }

  protected createInitialRawShape(): RawShape {
    const { cardSizes, arrangement, outerWallWidth, floorThickness, slotSpacing } =
      this.inputOptions;

    let xOffset = slotSpacing;
    const cardSlots = arrangement.flatMap((row) => {
      let yOffset = slotSpacing;
      const cardShapes = row.map((card) => {
        const cardSize = cardSizes[card.type];

        const cardShape = new Cube({
          size: {
            x: cardSize.width,
            y: card.thickness,
            z: cardSize.length,
          },
        }).translate({
          z: floorThickness,
          y: yOffset,
          x: xOffset,
        });

        yOffset += card.thickness + slotSpacing;

        return cardShape;
      });

      xOffset +=
        cardSizes[_.maxBy(row, (card) => cardSizes[card.type].width)!.type].width +
        slotSpacing;

      return cardShapes;
    });

    const mainShape = new ShapeContainer(cardSlots);

    console.log({
      width: mainShape.getWidth() + outerWallWidth * 2,
      height: mainShape.getLength() + outerWallWidth * 2,
      length: mainShape.getHeight() + floorThickness * 2,
    });

    return mainShape.render();
  }
}

const cardHolder = new CardHolder(options);

export default cardHolder;
