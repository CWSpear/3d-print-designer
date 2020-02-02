// CONFIG
const height = 4.6;
const radius = 13;
const moonDepth = 2.2;
const moonWidthPercent = 0.35;
const gap = 0.4;
const padding = 0.9;
const rows = 9;
const cols = 7;
// END CONFIG

const width = rows * ((radius * 2) + (gap * 2)) + (padding * 2);
const len = cols * ((radius * 2) + (gap * 2)) + (padding * 2);

console.log('Final Size:', width, len);

function main () {
  const holes = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      holes.push(makeHole(row, col));
    }
  }

  return difference(
    cube({ size: [width, len, height], center: [true, true, false] }),
    ...holes
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
