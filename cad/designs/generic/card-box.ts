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

    return cardBox.rotateZ(90).render(); // .rotateZ(5).render();
  }
}

//
export default new CardBox({
  // add a little wiggle room
  width: 88.9 + 0.3,
  height: 63.5 + 0.3,
  deckThickness: 17,
  wallThickness: 0.8,
  tabHeight: 10,
});
