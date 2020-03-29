import { RawShape, Shape } from '../../shape';
import { Cube } from '../core/cube';
import { RightTriangularPrism } from './right-triangular-prism';

export interface CardBoxOptions {
  cardWidth: number;
  cardHeight: number;
  deckThickness: number;
  tabHeight?: number;
  wallThickness?: number;
}

export class CardBox extends Shape<CardBoxOptions> {
  constructor(inputOptions: CardBoxOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const options = {
      wallThickness: 0.8,
      tabHeight: 0,
      ...this.inputOptions,
    };

    const cardBox = new Cube({
      size: {
        width: options.cardWidth + options.wallThickness * 2,
        length: options.deckThickness + options.wallThickness * 2,
        height: options.cardHeight,
      },
    }).subtractShapes(
      new Cube({
        size: {
          width: options.cardWidth,
          length: options.deckThickness,
          height: options.cardHeight,
        },
      }).translate(options.wallThickness),
    );

    if (options.tabHeight > 0) {
      const edge = new RightTriangularPrism({
        xLegLength: options.deckThickness + options.wallThickness,
        yLegLength: options.tabHeight,
        length: options.wallThickness,
      }).translate({ y: options.wallThickness });

      const backThing = new Cube({
        size: {
          width: options.cardWidth + options.wallThickness * 2,
          length: options.wallThickness,
          height: options.tabHeight,
        },
      }).addShapes(edge, edge.clone().translate({ x: options.cardWidth + options.wallThickness }));

      cardBox.addShapes(backThing.translate({ height: options.cardHeight }));
    }

    return cardBox
      .rotateZ(90)
      .setPositionToZero()
      .render();
  }
}
