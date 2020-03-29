import { TokenHolder } from '../../designer/shapes/custom/token-holder';

// MC trays are 100x55x23mm
// I think I'd prefer 100x60x20mm if we're gonna stack them.
// Probably 100x55x20 would work.

const mainShape = new TokenHolder({
  width: 100,
  length: 55,
  height: 21,
  grid: [[9, 6, 6]],
  rampSize: 5,
  stackable: true,
});

export default mainShape; //
