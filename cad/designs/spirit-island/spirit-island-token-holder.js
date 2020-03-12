const GAME_BOX_WIDTH = 288;
const SPIRIT_CARD_HEIGHT = 153;
const ROW_COUNT = 12;
const COL_COUNT = 3;
const RAMP_SIZE = 8;


const WIGGLE_ROOM = 5;
const BORDER_WIDTH = 1;
const THICKNESS = BORDER_WIDTH * 3;
const LIPNESS = BORDER_WIDTH * 2;
const EXTRA = 0.2;

const DEPTH = 40 - LIPNESS - EXTRA;
const LIP_HANG_ON_NESS = 1;

const BUTTON_RADIUS = 6;
const BUTTON_DISTANCE_FROM_EDGE = 15;

const PRINTER_MAX = 240; //sdf sdf
// END CONFIG


const BOX_HEIGHT = GAME_BOX_WIDTH - SPIRIT_CARD_HEIGHT;

const BOX_HEIGHT_WITH_WIGGLE = BOX_HEIGHT - WIGGLE_ROOM;
const BOX_WIDTH_WITH_WIGGLE = Math.min(GAME_BOX_WIDTH - WIGGLE_ROOM, PRINTER_MAX);

const CELL_HEIGHT = ((BOX_HEIGHT_WITH_WIGGLE - BORDER_WIDTH - BORDER_WIDTH - THICKNESS) / COL_COUNT) - BORDER_WIDTH;
const ROW_UNIT_WIDTH = ((BOX_WIDTH_WITH_WIGGLE - BORDER_WIDTH - BORDER_WIDTH - THICKNESS) / ROW_COUNT) - BORDER_WIDTH;

function main() {
  console.log(ROW_UNIT_WIDTH, CELL_HEIGHT);
  console.log(BOX_WIDTH_WITH_WIGGLE, BOX_HEIGHT_WITH_WIGGLE);

  return lid();

  const grid = [
    [5, 2, 2],
    [2, 2, 2, 3],
    [1.5, 1.5, 1.5, 1.5, 3]
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
    union(
      cube({ size: [BOX_WIDTH_WITH_WIGGLE, BOX_HEIGHT_WITH_WIGGLE, DEPTH] }),
      translate([0, 0, DEPTH], makeLidLip())
    ),
    negative
  );
}

function makeHole(x, y, size) {
  const width = (ROW_UNIT_WIDTH + BORDER_WIDTH) * size - BORDER_WIDTH;

  return translate(
    [
      THICKNESS + (x * (ROW_UNIT_WIDTH + BORDER_WIDTH)),
      THICKNESS + (y * (CELL_HEIGHT + BORDER_WIDTH)),
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


function makeLidLip(offset = 0) {
  const xLeg = THICKNESS - LIP_HANG_ON_NESS;
  const yLeg = LIPNESS;

  return union(
    translate(
      [0, BOX_HEIGHT_WITH_WIGGLE - THICKNESS - offset - offset, 0],
      makeLipPart(BOX_WIDTH_WITH_WIGGLE - offset)
    ),
    translate([0, THICKNESS, 0], mirror([0, 1, 0], makeLipPart(BOX_WIDTH_WITH_WIGGLE - offset))),
    translate(
      [BOX_WIDTH_WITH_WIGGLE - THICKNESS - offset, BOX_HEIGHT_WITH_WIGGLE - offset, 0],
      rotate([0, 0, -90], makeLipPart(BOX_HEIGHT_WITH_WIGGLE - offset))
    )
  );

  function makeLipPart(len) {

    const squareLip = cube({
      size: [len, THICKNESS, LIPNESS + EXTRA]
    });

    const cutout = polyhedron({
      points: [
        [0, 0, 0], [0, xLeg, 0], [0, 0, yLeg],
        [len, 0, 0], [len, xLeg, 0], [len, 0, yLeg]
      ],
      triangles: [
        [2, 0, 1],
        [3, 5, 4],
        [5, 0, 2],
        [5, 3, 0],
        [4, 0, 3],
        [4, 1, 0],
        [5, 1, 4],
        [5, 2, 1]
      ]
    });

    return difference(
      squareLip,
      translate([0, 0, EXTRA], cutout),
      translate([0, -1 * LIP_HANG_ON_NESS, -1 * (LIPNESS)], squareLip)
    );
  }
}

function lid() {
  const offset = 0.1;

  return translate(
    [0, 0, -1 * EXTRA],
    difference(
      translate([0, 0, EXTRA], cube({ size: [BOX_WIDTH_WITH_WIGGLE - offset, BOX_HEIGHT_WITH_WIGGLE - offset - offset, LIPNESS] })),
      makeLidLip(offset),
      translate(
        [BUTTON_DISTANCE_FROM_EDGE, (BOX_HEIGHT_WITH_WIGGLE / 2) - BUTTON_RADIUS - 3, LIPNESS - (LIPNESS * 0.6)],
        cylinder({ r: BUTTON_RADIUS, h: LIPNESS, fn: 64 })
      ),
      translate(
        [BUTTON_DISTANCE_FROM_EDGE, (BOX_HEIGHT_WITH_WIGGLE / 2) + BUTTON_RADIUS + 3, LIPNESS - (LIPNESS * 0.6)],
        cylinder({ r: BUTTON_RADIUS, h: LIPNESS, fn: 64 })
      )
    )
  );
}
