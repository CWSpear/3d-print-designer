import { RawShape, Shape } from '../../shape';
import { Util } from '../../util';
import { Cube } from '../core/cube';
import { Cylinder } from '../core/cylinder';
import { RightTriangularPrism } from './right-triangular-prism';

export interface CardBoxOptions {
  cardWidth: number;
  cardHeight: number;
  deckThickness: number;
  tabHeight?: number;
  wallThickness?: number;
  wiggleRoom?: number;
  withCutout?: boolean;
}

export class CardBox extends Shape<CardBoxOptions> {
  setDefaultOptions(options: CardBoxOptions): Required<CardBoxOptions> {
    return {
      wallThickness: 0.8,
      tabHeight: 0,
      wiggleRoom: 0.5,
      withCutout: false,
      ...options,
    };
  }

  protected createInitialRawShape(): RawShape {
    const options: Required<CardBoxOptions> = {
      ...this.inputOptions,
    };

    options.cardHeight += options.wiggleRoom;
    options.cardWidth += options.wiggleRoom;

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
      }).addShapes(
        edge,
        edge.clone().translate({ x: options.cardWidth + options.wallThickness }),
      );

      cardBox.addShapes(backThing.translate({ height: options.cardHeight }));
    }

    if (options.withCutout) {
      const holeSize = 18;
      const height = 20;

      const cutout = new Cylinder({
        radius: holeSize / 2,
        height: options.deckThickness + options.wallThickness * 2,
      });
      cutout.addShapes(
        new Cube({
          size: {
            width: height - holeSize / 2,
            length: holeSize,
            height: options.deckThickness + options.wallThickness * 2,
          },
        }), // .centerOn(cutout, { y: true }),
      );

      cardBox.subtractShapes(
        cutout
          .rotateY(-90)
          .rotateZ(-90)
          .setPositionToZero()
          .centerOn(cardBox, { x: true }),
      );
    }

    // return cardBox.rotateZ(90).render();
    return cardBox.rotateZ(-90).setPositionToZero().render();
  }
}
