import { CardBoxes } from '../../designer/shapes/custom/card-boxes';

export default new CardBoxes({
  // add a little wiggle room
  cardWidth: 88.9 + 0.3,
  cardHeight: 63.5 + 0.3,
  tabHeight: 10,
  spacing: 6,
  withCutout: true,

  // deckThicknesses: [7.5],

  // Night of the Zealot (Navy)
  // deckThicknesses: [10, 9, 8, 37],

  // Path to Carcosa (Purple)
  // deckThicknesses: [8, 11, 13, 13, 15, 13, 14, 15, 20],
  // deckThicknesses: [8.5, 13.5, 13.5, 14.5],

  // Forgotten Age (Maroon)
  // deckThicknesses: [4, 5, 12, 11, 11, 14, 11, 11, 1, 23],
  // deckThicknesses: [1.5, 23.5],
  // deckThicknesses: [11.5, 11.5, 12.5],

  // Dream-eaters (Silver)
  deckThicknesses: [13.7], ////////////
  // deckThicknesses: [8.3, 8.3, 8.7, 11.3, 12.3, 12.7, 13.7, 14.3, 20],
});
