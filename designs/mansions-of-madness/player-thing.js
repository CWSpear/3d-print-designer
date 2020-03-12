// CONFIG
const EXTRA_TOLERANCE = 1;

const PLAYER_CARD_HEIGHT = 70 + EXTRA_TOLERANCE;
const PLAYER_CARD_WIDTH = 120 + EXTRA_TOLERANCE;

const OTHER_CARD_HEIGHT = 63 + EXTRA_TOLERANCE;
const OTHER_CARD_WIDTH = 41 + EXTRA_TOLERANCE;

const TOKEN_AREA_HEIGHT = 20;

const CARD_SLOT_THICKNESS = 0.7;
const CARD_SLOT_DEPTH = 5;

const PLAYER_CARD_DEPTH = 2;
const TOKEN_AREA_DEPTH = 3;

const EXTRA_HEIGHT = 1;

const CARD_SLOT_SPACING = 9;
const CARD_SLOT_PADDING = 5;

// END CONFIG


const TOTAL_DEPTH = Math.max(CARD_SLOT_DEPTH, PLAYER_CARD_DEPTH, TOKEN_AREA_DEPTH) + EXTRA_HEIGHT;

const TOTAL_WIDTH = CARD_SLOT_PADDING +
  OTHER_CARD_WIDTH +
  CARD_SLOT_PADDING +
  PLAYER_CARD_WIDTH +
  CARD_SLOT_PADDING +
  OTHER_CARD_WIDTH +
  CARD_SLOT_PADDING;

const TOTAL_HEIGHT = PLAYER_CARD_HEIGHT +
  CARD_SLOT_PADDING +
  TOKEN_AREA_HEIGHT +
  CARD_SLOT_PADDING +
  CARD_SLOT_SPACING +
  CARD_SLOT_SPACING +
  CARD_SLOT_PADDING;

function main() {
  console.log(TOTAL_WIDTH, TOTAL_HEIGHT, TOTAL_DEPTH);

  // return sampler();

  const negativeSpace = union(
    playerCardSlot(),
    ...makeSlots(9, CARD_SLOT_PADDING),
    ...makeSlots(9, (TOTAL_WIDTH - CARD_SLOT_PADDING - OTHER_CARD_WIDTH)),
    makeTokenArea(),
    ...makeLongSlots(3)
  );

  return difference(
    mainCube(),
    negativeSpace
  );
}

function makeLongSlots(num) {
  const arr = [];
  for (let i = 0; i < num; i++) {
    const y = TOTAL_HEIGHT - (CARD_SLOT_SPACING * i + CARD_SLOT_PADDING) + (CARD_SLOT_THICKNESS * i);

    arr.push(makeLongSlot(y));
  }

  return arr;
}

function makeLongSlot(y) {
  const shape = cube({ size: [TOTAL_WIDTH - (CARD_SLOT_PADDING * 2), CARD_SLOT_THICKNESS, CARD_SLOT_DEPTH] });

  return translate([CARD_SLOT_PADDING, y, TOTAL_DEPTH - CARD_SLOT_DEPTH], shape);
}

function makeTokenArea() {
  const shape = cube({ size: [PLAYER_CARD_WIDTH, TOKEN_AREA_HEIGHT, TOKEN_AREA_DEPTH] });

  return translate([
    CARD_SLOT_PADDING + OTHER_CARD_WIDTH + CARD_SLOT_PADDING,
    PLAYER_CARD_HEIGHT + CARD_SLOT_PADDING,
    TOTAL_DEPTH - TOKEN_AREA_DEPTH
  ], shape);
}

function makeSlots(num, x) {
  const arr = [];
  for (let i = 0; i < num; i++) {
    const y = (CARD_SLOT_SPACING * i + CARD_SLOT_PADDING) + (CARD_SLOT_THICKNESS * i);

    arr.push(makeSlot(x, y));
  }

  return arr;
}

function makeSlot(x, y) {
  const shape = cube({ size: [OTHER_CARD_WIDTH, CARD_SLOT_THICKNESS, CARD_SLOT_DEPTH] });

  return translate([x, y, TOTAL_DEPTH - CARD_SLOT_DEPTH], shape);
}

function playerCardSlot() {
  const shape = cube({ size: [PLAYER_CARD_WIDTH, PLAYER_CARD_HEIGHT, PLAYER_CARD_DEPTH] });

  return translate([(TOTAL_WIDTH - PLAYER_CARD_WIDTH) / 2, 0, TOTAL_DEPTH - PLAYER_CARD_DEPTH], shape);
}

function mainCube() {
  return cube({ size: [TOTAL_WIDTH, TOTAL_HEIGHT, TOTAL_DEPTH] });
}


function sampler() {
  const arr = [];
  const spacing = 4.5;
  const count = 10;
  const width = 51;

  for (let i = 0; i < count; i++) {
    const d = i === count - 1 ? 3 : (i === count - 2 ? 4 : 5);
    arr.push(makeSamplerSlot(spacing, spacing * (i + 1), (i * .1) + .4, width, d));
  }

  const negative = union(
    ...arr
  );

  return difference(
    cube({ size: [width + (spacing * 2), count * spacing + spacing + 1, TOTAL_DEPTH] }),
    negative
  );
}

function makeSamplerSlot(x, y, t, w, d) {
  const shape = cube({ size: [w, t, d] });

  return translate([x, y, TOTAL_DEPTH - d], shape);
}
