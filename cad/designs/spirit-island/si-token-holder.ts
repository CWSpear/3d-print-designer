import { TokenHolder } from '../../designer/shapes/custom/token-holder';

// box size = 284.1625
// card size = 248 x 102 x 59
// cardboard thickness = 40

export default new TokenHolder({
  width: 248,
  length: 180,
  height: 59 - 40 + 12,
  grid: [
    [5, 2, 2],
    [5, 5, 3, 3, 3, 3],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
});
