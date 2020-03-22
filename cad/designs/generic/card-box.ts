const { union } = require('@jscad/csg/src/api/ops-booleans');

import _ from 'lodash';
import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { RightTriangularPrism } from '../../designer/shapes/custom/right-triangular-prism';

export interface CardBoxOptions {
  width: number;
  height: number;
  deckThickness: number;
  wallThickness: number;
  tabHeight: number;
}

class CardBox extends Shape<CardBoxOptions> {
  constructor(inputOptions: CardBoxOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const cardBox = new Cube({
      size: {
        width: this.inputOptions.width + this.inputOptions.wallThickness * 2,
        length: this.inputOptions.deckThickness + this.inputOptions.wallThickness * 2,
        height: this.inputOptions.height,
      },
    }).subtractShapes(
      new Cube({
        size: {
          width: this.inputOptions.width,
          length: this.inputOptions.deckThickness,
          height: this.inputOptions.height,
        },
      }).translate(this.inputOptions.wallThickness),
    );

    const edge = new RightTriangularPrism({
      xLegLength: this.inputOptions.deckThickness + this.inputOptions.wallThickness,
      yLegLength: this.inputOptions.tabHeight,
      length: this.inputOptions.wallThickness,
    }).translate({ y: this.inputOptions.wallThickness });

    const backThing = new Cube({
      size: {
        width: this.inputOptions.width + this.inputOptions.wallThickness * 2,
        length: this.inputOptions.wallThickness,
        height: this.inputOptions.tabHeight,
      },
    }).addShapes(edge, edge.clone().translate({ x: this.inputOptions.width + this.inputOptions.wallThickness }));

    cardBox.addShapes(backThing.translate({ height: this.inputOptions.height }));

    return cardBox
      .rotateZ(90)
      .setPositionToZero()
      .render(); // .rotateZ(5).render();
  }
}

interface CardBoxesOptions extends Omit<CardBoxOptions, 'deckThickness'> {
  deckThicknesses: number[];
  spacing: number;
}

class CardBoxes extends Shape<CardBoxesOptions> {
  constructor(inputOptions: CardBoxesOptions, id?: string) {
    super(inputOptions, id);
  }

  protected createInitialRawShape(): RawShape {
    const options: CardBoxesOptions = { ...this.inputOptions };

    // const firstWidth = options.widths.pop();
    // const cards = new CardBox({
    //   ...options,
    //   deckThickness: firstWidth,
    // });

    const cards: CardBox[][] = [[]];

    let row = 0;

    options.deckThicknesses.forEach(width => {
      const card = new CardBox({
        ...options,
        deckThickness: width,
      });

      if (this.runningWidth([...cards[row], card]) > 250) {
        row++;
        cards.push([]);
      }

      cards[row].push(card);
    });

    let y = 0;
    cards.forEach((cardRow, colIndex) => {
      let x = 0;
      y += cardRow[0].getLength() + this.inputOptions.spacing;
      cardRow.forEach((card, rowIndex) => {
        if (colIndex >= 2) {
          card.rotateZ(90).getPositionMinX();
        }

        card.translate({
          x,
          y,
        });

        x += card.getWidth() + this.inputOptions.spacing;
      });
    });

    return union(_.flatten(cards).map(s => s.render()));
  }

  private runningWidth(shapes: Shape[]): number {
    return _.sumBy(shapes, s => s.getWidth() + this.inputOptions.spacing) - this.inputOptions.spacing;
  }
}

export default new CardBoxes({
  // add a little wiggle room
  width: 88.9 + 0.3,
  height: 63.5 + 0.3,
  wallThickness: 0.8,
  tabHeight: 10,
  spacing: 6,

  // Night of the Zealot (Navy)
  // deckThicknesses: [10, 9, 8, 37],

  // Path to Carcosa (Purple)
  // deckThicknesses: [8, 11, 13, 13, 15, 13, 14, 15, 20],

  // Forgotten Age (Maroon)
  deckThicknesses: [4, 5, 12, 11, 11, 14, 11, 11, 1, 23],
});
