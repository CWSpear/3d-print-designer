import { Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { LidLip } from '../../designer/shapes/custom/lid';
import { RoundedBottomCube } from '../../designer/shapes/custom/rounded-bottom-cube';

const CONTAINER_WIDTH = 240;

const CONTAINER_LENGTH = 150;

// note that the cell depth will have to account for lid and floor
const CONTAINER_HEIGHT = 30;

const GRID = [
  [5, 2, 2],
  [10, 11, 12],
  [2, 2, 2, 1],
];

const USE_RAMPS = true;

// minor config, unlikely to change
const RAMP_SIZE = 8;
const BORDER_AND_FLOOR_WIDTH = 1;
const CONTAINER_EDGE_WIDTH = 3;

const SIDE_HOLE = false;

// END CONFIG //

const PRINTER_MAX_WIDTH = 250;
const PRINTER_MAX_LENGTH = 210;

const COL_COUNT = GRID.length;
const CELL_HEIGHT =
  (CONTAINER_LENGTH - BORDER_AND_FLOOR_WIDTH - BORDER_AND_FLOOR_WIDTH - CONTAINER_EDGE_WIDTH) / COL_COUNT -
  BORDER_AND_FLOOR_WIDTH;

if (CONTAINER_WIDTH > PRINTER_MAX_WIDTH) {
  throw new Error(`Container is too big! Max width is: ${PRINTER_MAX_WIDTH}. Width provided: ${CONTAINER_WIDTH}`);
}

if (CONTAINER_LENGTH > PRINTER_MAX_LENGTH) {
  throw new Error(`Container is too big! Max length is: ${PRINTER_MAX_LENGTH}. Length provided: ${CONTAINER_LENGTH}`);
}

export const lidLip = new LidLip({
  width: CONTAINER_WIDTH,
  length: CONTAINER_LENGTH,
  lipWidth: CONTAINER_EDGE_WIDTH,
});

const CELL_DEPTH = CONTAINER_HEIGHT - (BORDER_AND_FLOOR_WIDTH + lidLip.getTotalHeight());
const HEIGHT_LESS_LID = CONTAINER_HEIGHT - lidLip.getTotalHeight();

console.log(`Width:      ${CONTAINER_WIDTH}
Length:     ${CONTAINER_LENGTH}
Height:     ${CONTAINER_HEIGHT}
Cell Depth: ${CELL_DEPTH}`);

const mainShape = new Cube({
  size: { width: CONTAINER_WIDTH, length: CONTAINER_LENGTH, height: HEIGHT_LESS_LID },
});

GRID.reverse().forEach((row, y) => {
  let x = 0;
  row.forEach(col => {
    const rowCount = row.reduce((total, v) => total + v, 0);
    const rowUnitWidth =
      (CONTAINER_WIDTH - BORDER_AND_FLOOR_WIDTH - BORDER_AND_FLOOR_WIDTH - CONTAINER_EDGE_WIDTH) / rowCount -
      BORDER_AND_FLOOR_WIDTH;

    const width = (rowUnitWidth + BORDER_AND_FLOOR_WIDTH) * col - BORDER_AND_FLOOR_WIDTH;
    const offsetX = CONTAINER_EDGE_WIDTH + x * (rowUnitWidth + BORDER_AND_FLOOR_WIDTH);
    const offsetY = CONTAINER_EDGE_WIDTH + y * (CELL_HEIGHT + BORDER_AND_FLOOR_WIDTH);

    const size = { width, length: CELL_HEIGHT, height: CONTAINER_HEIGHT };

    const shape: Shape = USE_RAMPS
      ? new RoundedBottomCube({
          rampSize: RAMP_SIZE,
          size,
        })
      : new Cube({ size });

    mainShape.subtractShapes(shape.translate({ z: BORDER_AND_FLOOR_WIDTH, x: offsetX, y: offsetY }).render());

    x += col;
  });
});

mainShape.addShapes(lidLip.translateZ(HEIGHT_LESS_LID).render());

export default mainShape;
