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
  constructor(inputOptions: CardBoxOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const options = {
      wallThickness: 0.8,
      tabHeight: 0,
      wiggleRoom: 0.5,
      ...this.inputOptions,
    };

    options.cardHeight += options.wiggleRoom;
    options.cardWidth += options.wiggleRoom;

    console.log(options);

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
    console.log('height', cardBox.getHeight());

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

      // return backThing.render();

      // cardBox.addShapes(backThing.translate({ height: options.cardHeight }));
      cardBox.addShapes(backThing);

      Util.log(
        new Cube({
          size: {
            width: options.cardWidth + options.wallThickness * 2,
            length: options.wallThickness,
            height: options.tabHeight,
          },
        }).render().polygons,
      );
      Util.log(
        new Cube({
          size: {
            width: options.cardWidth + options.wallThickness * 2,
            length: options.deckThickness + options.wallThickness * 2,
            height: options.cardHeight,
          },
        }).render().polygons,
      );
    }

    if (options.withCutout) {
      const holeSize = 18;
      const height = 20;

      const cutout = new Cylinder({ radius: holeSize / 2, height: options.deckThickness + options.wallThickness * 2 });
      cutout.addShapes(
        new Cube({
          size: {
            width: height - holeSize / 2,
            length: holeSize,
            height: options.deckThickness + options.wallThickness * 2,
          },
        }).centerOn(cutout, { y: true }),
      );

      cardBox.subtractShapes(cutout.rotateY(90).rotateZ(90).setPositionToZero().centerOn(cardBox, { x: true }));
    }

    return cardBox.rotateZ(90).setPositionToZero().render();
  }
}
