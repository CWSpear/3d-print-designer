// CONFIG
const height = 4.6;
const radius = 13;
const moonDepth = 1.6;
const moonWidthPercent = 0.35;
const gap = 0.4;
const padding = 3;
const rows = 9;
const cols = 7;

const lipHeight = 2;
const lipThickness = padding;
const lipAttachment = 1;
const buttonRadius = 6;
const buttonDistanceFromTheEdge = 15;
const buttonDistance = 10;
const extraLidTolerance = 0;
// END CONFIG

const width = rows * ((radius * 2) + (gap * 2)) + (padding * 2);
const len = cols * ((radius * 2) + (gap * 2)) + (padding * 2);

function main() {
  console.log('Final Size:', width, len, height + lipHeight);

  return lid(); ///

  const holes = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      holes.push(makeHole(row, col));
    }
  }

  return union(
    difference(
      cube({ size: [width, len, height], center: [true, true, false] }),
      ...holes
    ),
    translate([-1 * width / 2, -1 * len / 2, height], makeLidLip())
  );
}

function convertToXY0([x, y]) {
  const translatedX = (x * (radius * 2)) - (width / 2) + radius + (gap * 2 * x) + padding;
  const translatedY = (y * (radius * 2)) - (len / 2) + radius + (gap * 2 * y) + padding;

  return [translatedX, translatedY];
}

function makeHole(gridX, gridY) {
  const [x, y] = convertToXY0([gridX, gridY]);

  return translate(
    [x, y, 0],
    difference(
      cylinder({ r: radius, h: height, fn: 64 }),
      translate([(radius * 2 * moonWidthPercent), 0, 0], cube({ size: [radius * 2, radius * 2, moonDepth], center: [true, true, false] }))
    )
  );
}

function makeLidLip(offset = 0) {
  const xLeg = lipThickness - 1;
  const yLeg = 2;

  return union(
    translate([0, len - lipThickness - offset - offset, 0], makeLipPart(width - offset)),
    translate([0, lipThickness, 0], mirror([0, 1, 0], makeLipPart(width - offset))),
    translate(
      [width - lipThickness - offset, len - offset, 0],
      rotate([0, 0, -90], makeLipPart(len - offset))
    )
  );

  function makeLipPart(len) {
    const squareLip = cube({
      size: [len, lipThickness, lipHeight + extraLidTolerance]
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
      translate([0, 0, extraLidTolerance], cutout),
      translate([0, -1 * lipAttachment, -1 * (lipHeight)], squareLip)
    );
  }
}

function lid() {
  const offset = 0.2;

  return translate(
    [0, 0, -1 * extraLidTolerance],
    difference(
      translate([0, 0, extraLidTolerance], cube({ size: [width - offset, len - offset - offset, lipHeight] })),
      makeLidLip(offset),
      translate(
        [buttonDistanceFromTheEdge, (len / 2) - buttonRadius - (buttonDistance / 2), lipHeight - (lipHeight * 0.6)],
        cylinder({ r: buttonRadius, h: lipHeight, fn: 64 })
      ),
      translate(
        [buttonDistanceFromTheEdge, (len / 2) + buttonRadius + (buttonDistance / 2), lipHeight - (lipHeight * 0.6)],
        cylinder({ r: buttonRadius, h: lipHeight, fn: 64 })
      )
    )
  );
}
