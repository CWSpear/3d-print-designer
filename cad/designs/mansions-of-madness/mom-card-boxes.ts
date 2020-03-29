import _ from 'lodash';
import { RawShape, Shape, ShapeContainer } from '../../designer/shape';
import { CardBox, CardBoxOptions } from '../../designer/shapes/custom/card-box';

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

    return new ShapeContainer(_.flatten(cards)).render();
  }

  private runningWidth(shapes: Shape[]): number {
    return _.sumBy(shapes, s => s.getWidth() + this.inputOptions.spacing) - this.inputOptions.spacing;
  }
}

export default new CardBoxes({
  // add a little wiggle room
  cardWidth: 88.9 + 0.3,
  cardHeight: 63.5 + 0.3,
  tabHeight: 10,
  spacing: 6,

  // Night of the Zealot (Navy)
  // deckThicknesses: [10, 9, 8, 37],

  // Path to Carcosa (Purple)
  // deckThicknesses: [8, 11, 13, 13, 15, 13, 14, 15, 20],

  // Forgotten Age (Maroon)
  deckThicknesses: [4, 5, 12, 11, 11, 14, 11, 11, 1, 23],
});
