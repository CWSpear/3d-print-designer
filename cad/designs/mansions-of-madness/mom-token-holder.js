// CONFIG
const height = 18.8;
const width = 100;
const len = 70;
const spacers = [0.41, 0.69]; // percent
const clearance = 1.8;
const roundiness = 6;
const magnetDiameter = 3;
const magnetHeight = 1;
const wallThickness = 0.8; // magnetDiameter + 1;
const floorThickness = clearance / 2;
const dividerThickness = 0.8;
const magnetPadding = 0.6;
const fitTolerance = -0.05;
const lidThickness = 2; // magnetPadding * 2 + magnetHeight;
// END CONFIG

function main() {
  const box = difference(
    roundedCube({ size: [width, len, height], center: false, radius: [0, 12, 0] }),
    translate(
      [wallThickness, wallThickness, floorThickness],
      CSG.cube({ size: [width - wallThickness * 2, len - wallThickness * 2, height - floorThickness], center: false }),
    ),
  );

  const container = union(
    box,
    ...spacers.map(spacer => translate([width * spacer, 0, floorThickness], makeWall())),
    translate([roundiness + wallThickness, 0, floorThickness], rotate([0, 0, 90], makeRamp(len))),
    translate([width, roundiness + wallThickness, floorThickness], rotate([0, 0, 180], makeRamp(width))),
    translate([width - (roundiness + wallThickness), len, floorThickness], rotate([0, 0, 270], makeRamp(len))),
    translate([0, len - (roundiness + wallThickness), floorThickness], rotate([0, 0, 0], makeRamp(width))),
  );

  const ledge = difference(
    CSG.cube({ size: [width, len, clearance] }),
    translate(
      [wallThickness + fitTolerance, wallThickness + fitTolerance, 0],
      CSG.cube({
        size: [width - wallThickness * 2 - fitTolerance * 2, len - wallThickness * 2 - fitTolerance * 2, clearance],
      }),
    ),
  );

  const finalBase = difference(container, ledge);

  const lidWidthOffset = 0;
  const lidLenOffset = -1.1 * len;

  const lid = translate([lidWidthOffset, lidLenOffset, 0], CSG.cube({ size: [width, len, lidThickness] }));

  const finalLid = union(
    lid,
    translate(
      [lidWidthOffset + wallThickness, lidLenOffset + wallThickness, lidThickness],
      CSG.cube({ size: [width - wallThickness * 2, len - wallThickness * 2, clearance] }),
    ),
  );

  // return finalBase;

  return finalLid;

  return [finalBase, finalLid];
}

function makeRamp(l) {
  return translate(
    [0, 0, roundiness],
    rotate(
      [-90, 0, 0],
      difference(
        CSG.cube({ size: [l, roundiness, roundiness] }),
        rotate([0, 90, 0], cylinder({ r: roundiness, h: l, fn: 64 })),
      ),
    ),
  );
}

function makeWall() {
  return CSG.cube({ size: [dividerThickness, len, height - floorThickness - clearance] });
}

function makeMagnetSlot() {
  return CSG.cube({ size: [magnetDiameter, magnetDiameter + magnetPadding, magnetHeight] });
}
