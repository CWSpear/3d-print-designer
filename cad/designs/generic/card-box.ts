import { Cube } from "../../designer/shapes/core/cube";
import { RightTriangularPrism } from "../../designer/shapes/custom/right-triangular-prism";

// const WIDTH = 20;
// const HEIGHT = 12;
// const DECK_THICKNESS = 6;
// const WALL_THICKNESS = 0.5;
// const TAB_HEIGHT = 5;

const WIDTH = 88.9 + 0.15;
const HEIGHT = 63.5 + 0.15;
// const HEIGHT = 100;
const DECK_THICKNESS = 17;
const WALL_THICKNESS = 0.5;
const TAB_HEIGHT = 10;

const cardBox = new Cube({
  size: {
    width: WIDTH + WALL_THICKNESS * 2,
    length: DECK_THICKNESS + WALL_THICKNESS * 2,
    height: HEIGHT
  }
})
  .center()
  .subtractShapes(
    new Cube({ size: { width: WIDTH, length: DECK_THICKNESS, height: HEIGHT } })
      .translate(WALL_THICKNESS)
      .center()
      .render()
  );

const edge = new RightTriangularPrism({
  xLegLength: DECK_THICKNESS + WALL_THICKNESS,
  yLegLength: TAB_HEIGHT,
  length: WALL_THICKNESS
}).translate({ y: WALL_THICKNESS });

const backThing = new Cube({
  size: {
    width: WIDTH + WALL_THICKNESS * 2,
    length: WALL_THICKNESS,
    height: TAB_HEIGHT
  }
})
  .addShapes(
    edge.render(),
    edge.translate({ x: WIDTH + WALL_THICKNESS }).render()
  )
  .center()
  .mirrorAcrossXPlane();

cardBox.addShapes(backThing.translate({ height: HEIGHT }).render());

export default cardBox;
