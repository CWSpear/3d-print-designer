import { CardBoxes } from '../../designer/shapes/custom/card-boxes';

export default new CardBoxes({
  // add a little wiggle room
  cardWidth: 88.9 + 0.3,
  cardHeight: 63.5 + 0.3,
  tabHeight: 10,
  spacing: 6,

  // Night of the Zealot (Navy)
  // deckThicknesses: [10, 9, 8, 37],

  // Path to Carcosa (Purple)
  // deckThicknesses: [8, 11, 13, 13, 15, 13, 14, 15, 20],

  // Forgotten Age (Maroon)
  deckThicknesses: [4, 5, 12, 11, 11, 14, 11, 11, 1, 23],
});
