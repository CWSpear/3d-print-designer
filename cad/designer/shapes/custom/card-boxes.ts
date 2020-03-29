import _ from 'lodash';
import { RawShape, Shape, ShapeContainer } from '../../shape';
import { CardBox, CardBoxOptions } from './card-box';

interface CardBoxesOptions extends Omit<CardBoxOptions, 'deckThickness'> {
  deckThicknesses: number[];
  spacing: number;
}

export class CardBoxes extends Shape<CardBoxesOptions> {
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
