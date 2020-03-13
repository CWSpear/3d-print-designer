const CONTAINER_WIDTH = 120;
const CONTAINER_LENGTH = 120;
const CONTAINER_HEIGHT = 30;


const GRID = [
  [2, 2],
  [2, 2]
];


// minor config, unlikely to change
const RAMP_SIZE = 8;
const BORDER_WIDTH = 1;
const CONTAINER_EDGE_WIDTH = 3;
const LID_HEIGHT = 2;
const BUTTON_RADIUS = 6;
const BUTTON_DISTANCE_FROM_EDGE = 15;

// better name
const EXTRA = 0.2;

// END CONFIG //

const LIP_HANG_ON_NESS = 1;

const PRINTER_MAX_WIDTH = 250;
const PRINTER_MAX_LENGTH = 210;

const colCount = GRID.length;
const CELL_HEIGHT = ((CONTAINER_LENGTH - BORDER_WIDTH - BORDER_WIDTH - CONTAINER_EDGE_WIDTH) / colCount) - BORDER_WIDTH;

function main() {
  console.log(CONTAINER_WIDTH, CONTAINER_LENGTH);

  // return lid();

  const holes = [];

  GRID.reverse().forEach((row, r) => {
    let accum = 0;
    row.forEach((col) => {
      const rowCount = row.reduce((total, v) => (total + v), 0);
      const rowUnitWidth = ((CONTAINER_WIDTH - BORDER_WIDTH - BORDER_WIDTH - CONTAINER_EDGE_WIDTH) / rowCount) - BORDER_WIDTH;

      holes.push(makeHole(accum, r, col, rowUnitWidth));
      accum += col;
    });
  });

  const negative = union(
    ...holes
  );

  return difference(
    union(
      cube({ size: [CONTAINER_WIDTH, CONTAINER_LENGTH, CONTAINER_HEIGHT] }),
      translate([0, 0, CONTAINER_HEIGHT], makeLidLip())
    ),
    negative
  );
}

function makeHole(x, y, size, rowUnitWidth) {
  const width = (rowUnitWidth + BORDER_WIDTH) * size - BORDER_WIDTH;

  return translate(
    [
      CONTAINER_EDGE_WIDTH + (x * (rowUnitWidth + BORDER_WIDTH)),
      CONTAINER_EDGE_WIDTH + (y * (CELL_HEIGHT + BORDER_WIDTH)),
      BORDER_WIDTH
    ],
    difference(
      cube({
        size: [width, CELL_HEIGHT, CONTAINER_HEIGHT]
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
  const xLeg = CONTAINER_EDGE_WIDTH - LIP_HANG_ON_NESS;
  const yLeg = LID_HEIGHT;

  return union(
    translate(
      [0, CONTAINER_LENGTH - CONTAINER_EDGE_WIDTH - offset - offset, 0],
      makeLipPart(CONTAINER_WIDTH - offset)
    ),
    translate([0, CONTAINER_EDGE_WIDTH, 0], mirror([0, 1, 0], makeLipPart(CONTAINER_WIDTH - offset))),
    translate(
      [CONTAINER_WIDTH - CONTAINER_EDGE_WIDTH - offset, CONTAINER_LENGTH - offset, 0],
      rotate([0, 0, -90], makeLipPart(CONTAINER_LENGTH - offset))
    )
  );

  function makeLipPart(len) {

    const squareLip = cube({
      size: [len, CONTAINER_EDGE_WIDTH, LID_HEIGHT + EXTRA]
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
      translate([0, -1 * LIP_HANG_ON_NESS, -1 * (LID_HEIGHT)], squareLip)
    );
  }
}

function lid() {
  const offset = 0.1;

  return translate(
    [0, 0, -1 * EXTRA],
    difference(
      translate([0, 0, EXTRA], cube({ size: [CONTAINER_WIDTH - offset, CONTAINER_LENGTH - offset - offset, LID_HEIGHT] })),
      makeLidLip(offset),
      translate(
        [BUTTON_DISTANCE_FROM_EDGE, (CONTAINER_LENGTH / 2) - BUTTON_RADIUS - 3, LID_HEIGHT - (LID_HEIGHT * 0.6)],
        cylinder({ r: BUTTON_RADIUS, h: LID_HEIGHT, fn: 64 })
      ),
      translate(
        [BUTTON_DISTANCE_FROM_EDGE, (CONTAINER_LENGTH / 2) + BUTTON_RADIUS + 3, LID_HEIGHT - (LID_HEIGHT * 0.6)],
        cylinder({ r: BUTTON_RADIUS, h: LID_HEIGHT, fn: 64 })
      )
    )
  );
}
