// CONFIG
const height = 16;
const width = 110;
const len = 55;
const spacers = [0.41, 0.69]; // percent
const clearance = 2.6;
const roundiness = 6;
const magnetDiameter = 3;
const magnetHeight = 1;
const wallThickness = magnetDiameter + 1;
const floorThickness = clearance / 2;
const dividerThickness = 0.8;
const magnetPadding = 0.6;
const fitTolerance = 0.2;
// END CONFIG


function main () {
  const box = difference(
    cube({ size: [width, len, height], center: false }),
    translate(
      [wallThickness, wallThickness, floorThickness],
      cube({ size: [width - (wallThickness * 2), len - (wallThickness * 2), height - floorThickness], center: false })
    )
  );

  const container = union(
    box,
    ...spacers.map(spacer => translate([width * spacer, 0, floorThickness], makeWall())),
    translate([roundiness + wallThickness, 0, floorThickness], rotate([0, 0, 90], makeRamp(len))),
    translate([width, roundiness + wallThickness, floorThickness], rotate([0, 0, 180], makeRamp(width))),
    translate([width - (roundiness + wallThickness), len, floorThickness], rotate([0, 0, 270], makeRamp(len))),
    translate([0, len - (roundiness + wallThickness), floorThickness], rotate([0, 0, 0], makeRamp(width)))
  );

  const upperZOffset = height - magnetPadding - magnetHeight;
  const lowerZOffset = clearance + magnetPadding;
  const row2YOffset = len - (magnetDiameter + magnetPadding);
  const col1XOffset = magnetPadding * 2;
  const col2XOffset = magnetPadding + (width / 2) - magnetPadding - (magnetDiameter / 2);
  const col3XOffset = magnetPadding + width - (magnetPadding * 3) - magnetDiameter;

  const finalBase = difference(
    container,
    translate([col1XOffset, 0, upperZOffset], makeMagnetSlot()),
    translate([col2XOffset, 0, upperZOffset], makeMagnetSlot()),
    translate([col3XOffset, 0, upperZOffset], makeMagnetSlot()),
    translate([col1XOffset, row2YOffset, upperZOffset], makeMagnetSlot()),
    translate([col2XOffset, row2YOffset, upperZOffset], makeMagnetSlot()),
    translate([col3XOffset, row2YOffset, upperZOffset], makeMagnetSlot()),
    translate([col1XOffset, 0, lowerZOffset], makeMagnetSlot()),
    translate([col2XOffset, 0, lowerZOffset], makeMagnetSlot()),
    translate([col3XOffset, 0, lowerZOffset], makeMagnetSlot()),
    translate([col1XOffset, row2YOffset, lowerZOffset], makeMagnetSlot()),
    translate([col2XOffset, row2YOffset, lowerZOffset], makeMagnetSlot()),
    translate([col3XOffset, row2YOffset, lowerZOffset], makeMagnetSlot()),
    difference(cube({ size: [width, len, clearance] }), translate([wallThickness + fitTolerance, wallThickness + fitTolerance, 0], cube({ size: [width - (wallThickness * 2) - (fitTolerance * 2), len - (wallThickness * 2) - (fitTolerance * 2), clearance] })))
  );

  const lidWidthOffset = 0;
  const lidLenOffset = -1.1 * len;

  const lid = translate([lidWidthOffset, lidLenOffset, 0], cube({ size: [width, len, magnetPadding * 2 + magnetHeight] }));

  const lidZOffset = magnetPadding;

  const finalLid = difference(
    lid,
    translate([col1XOffset + lidWidthOffset, lidLenOffset, lidZOffset], makeMagnetSlot()),
    translate([col2XOffset + lidWidthOffset, lidLenOffset, lidZOffset], makeMagnetSlot()),
    translate([col3XOffset + lidWidthOffset, lidLenOffset, lidZOffset], makeMagnetSlot()),
    translate([col1XOffset + lidWidthOffset, row2YOffset + lidLenOffset, lidZOffset], makeMagnetSlot()),
    translate([col2XOffset + lidWidthOffset, row2YOffset + lidLenOffset, lidZOffset], makeMagnetSlot()),
    translate([col3XOffset + lidWidthOffset, row2YOffset + lidLenOffset, lidZOffset], makeMagnetSlot())
  );

  // return finalBase;

  // return finalLid;

  return [
    finalBase,
    finalLid
  ];
}


function makeRamp(l) {
  return translate(
    [0, 0, roundiness],
    rotate(
      [-90, 0, 0],
      difference(
        cube({ size: [l, roundiness, roundiness]}),
        rotate([0, 90, 0], cylinder({ r: roundiness, h: l, fn: 64 }))
      )
    )
  );
}

function makeWall() {
  return cube({ size: [dividerThickness, len, height - floorThickness - clearance]});
}

function makeMagnetSlot() {
  return cube({ size: [magnetDiameter, magnetDiameter + magnetPadding, magnetHeight] });
}
