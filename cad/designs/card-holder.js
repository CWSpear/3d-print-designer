const WIDTH = 12;
const HEIGHT = 20;
const DECK_THICKNESS = 6;
const THICKNESS = 0.5;
const TAB_HEIGHT = 5;

function main() {
  return union(
    difference(
      mainCube(),
      translate([THICKNESS, THICKNESS, THICKNESS], hole())
    ),
    translate([0, 0, HEIGHT], extraBack())
  );
}

function mainCube() {
  return cube({
    size: [WIDTH + THICKNESS * 2, DECK_THICKNESS + THICKNESS * 2, HEIGHT]
  });
}

function hole() {
  return cube({
    size: [WIDTH, DECK_THICKNESS, HEIGHT]
  });
}

function extraBack() {
  return cube({
    size: [WIDTH + THICKNESS * 2, THICKNESS, TAB_HEIGHT]
  });
}
