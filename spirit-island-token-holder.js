const GAME_BOX_WIDTH = 288;
const SPIRIT_CARD_HEIGHT = 153;
const BORDER_WIDTH = 1;
const DEPTH = 40;
const ROW_COUNT = 12;
const COL_COUNT = 3;
const RAMP_SIZE = 8;


const WIGGLE_ROOM = 5;

const PRINTER_MAX = 240;
// END CONFIG


const BOX_HEIGHT = GAME_BOX_WIDTH - SPIRIT_CARD_HEIGHT;

const BOX_HEIGHT_WITH_WIGGLE = BOX_HEIGHT - WIGGLE_ROOM;
const BOX_WIDTH_WITH_WIGGLE = Math.min(GAME_BOX_WIDTH - WIGGLE_ROOM, PRINTER_MAX);

const CELL_HEIGHT = ((BOX_HEIGHT_WITH_WIGGLE - BORDER_WIDTH) / COL_COUNT) - BORDER_WIDTH;
const ROW_UNIT_WIDTH = ((BOX_WIDTH_WITH_WIGGLE - BORDER_WIDTH) / ROW_COUNT) - BORDER_WIDTH;

function main() {
  console.log(ROW_UNIT_WIDTH, CELL_HEIGHT);
  console.log(BOX_WIDTH_WITH_WIGGLE, BOX_HEIGHT_WITH_WIGGLE);

  const grid = [
    [5, 2, 2, 3],
    [2, 2, 2, 3, 3],
    [2, 2, 2, 2, 2, 2]
  ];

  const holes = [];
  for (const r in grid) {
    let accum = 0;
    for (const col of grid[r]) {
      holes.push(makeHole(accum, r, col));
      accum += col;
    }
  }

  const negative = union(
    ...holes
  );

  return difference(
    cube({ size: [BOX_WIDTH_WITH_WIGGLE, BOX_HEIGHT_WITH_WIGGLE, DEPTH] }),
    negative
  );
}

function makeHole(x, y, size) {
  const width = (ROW_UNIT_WIDTH + BORDER_WIDTH) * size - BORDER_WIDTH;

  return translate(
    [
      BORDER_WIDTH + (x * (ROW_UNIT_WIDTH + BORDER_WIDTH)),
      BORDER_WIDTH + (y * (CELL_HEIGHT + BORDER_WIDTH)),
      BORDER_WIDTH
    ],
    difference(
      cube({
        size: [width, CELL_HEIGHT, DEPTH]
      }),
      translate([RAMP_SIZE, 0, 0], rotate([0, 0, 90], makeRamp(CELL_HEIGHT))),
      translate([width, RAMP_SIZE, 0], rotate([0, 0, 180], makeRamp(width))),
      translate([width - (RAMP_SIZE), CELL_HEIGHT, 0], rotate([0, 0, 270], makeRamp(CELL_HEIGHT))),
      translate([0, CELL_HEIGHT - (RAMP_SIZE), 0], rotate([0, 0, 0], makeRamp(width)))
    )
  );
}

function makeRamp(l) {
  return translate(
    [0, 0, RAMP_SIZE],
    rotate(
      [-90, 0, 0],
      difference(
        cube({ size: [l, RAMP_SIZE, RAMP_SIZE] }),
        rotate([0, 90, 0], cylinder({ r: RAMP_SIZE, h: l, fn: 64 }))
      )
    )
  );
}
