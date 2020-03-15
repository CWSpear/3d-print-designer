import { Cube } from '../../designer/shapes/core/cube';
import { RightTriangularPrism } from '../../designer/shapes/custom/right-triangular-prism';

// const WIDTH = 20;
// const HEIGHT = 12;
// const DECK_THICKNESS = 6;
// const THICKNESS = 0.5;
// const TAB_HEIGHT = 5;

const WIDTH = 88.9 + 0.15;
const HEIGHT = 63.5 + 0.15;
const DECK_THICKNESS = 17;
const THICKNESS = 0.5;
const TAB_HEIGHT = 20;


const cardBox = new Cube({
  size: {
    width: WIDTH + THICKNESS * 2,
    length: DECK_THICKNESS + THICKNESS * 2,
    height: HEIGHT,
  },
})
  .subtractShape(
    new Cube({ size: { width: WIDTH, length: DECK_THICKNESS, height: HEIGHT } })
      .translate({ x: THICKNESS, y: THICKNESS, z: THICKNESS }),
  );

const edge = new RightTriangularPrism({
  xLegLength: DECK_THICKNESS + THICKNESS,
  yLegLength: TAB_HEIGHT,
  length: THICKNESS,
});

const backThing = new Cube({ size: { width: WIDTH + THICKNESS * 2, length: THICKNESS, height: TAB_HEIGHT } })
  .addShape(
    edge.clone().translate({ x: WIDTH + THICKNESS, y: THICKNESS }),
  ).addShape(
    edge.clone().translate({ y: THICKNESS }),
  );

cardBox.addShape(backThing.translate({ z: HEIGHT }));

export default cardBox;
