import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Cylinder } from '../../designer/shapes/core/cylinder';
import { LidLip } from '../../designer/shapes/custom/lid';

export interface OwlGameHolderOptions {
  cardWidth: number;
  cardsThickness: number;
  sunTokenWidth: number;
  sunTokenThickness: number;
  owlTokenDiameter: number;
  owlTokensThickness: number;
  interiorWallThickness: number;
  exteriorWallThickness: number;
  floorThickness: number;
  wiggleRoom: number;
}

export class OwlGameHolder extends Shape<OwlGameHolderOptions> {
  lidLip!: LidLip;

  constructor(options: OwlGameHolderOptions) {
    super(options);
  }

  protected createInitialRawShape(): RawShape {
    const {
      cardWidth,
      cardsThickness,
      sunTokenWidth,
      sunTokenThickness,
      owlTokenDiameter,
      owlTokensThickness,
      interiorWallThickness,
      exteriorWallThickness,
      floorThickness,
      wiggleRoom,
    } = this.inputOptions;

    const mainShape = new Cube({
      size: {
        width:
          exteriorWallThickness +
          wiggleRoom +
          cardWidth +
          wiggleRoom +
          interiorWallThickness +
          wiggleRoom +
          owlTokenDiameter +
          wiggleRoom +
          exteriorWallThickness,
        length:
          exteriorWallThickness +
          wiggleRoom +
          cardWidth +
          wiggleRoom +
          exteriorWallThickness,
        height: floorThickness + cardsThickness,
      },
    });

    const cardSlot = new Cube({
      size: {
        width: wiggleRoom + cardWidth + wiggleRoom,
        length: wiggleRoom + cardWidth + wiggleRoom,
        height: cardsThickness,
      },
    });

    const owlTokenSlot = new Cylinder({
      height: wiggleRoom + owlTokensThickness + wiggleRoom,
      radius: wiggleRoom + owlTokenDiameter / 2,
    });

    const sunTokenSlot = new Cube({
      size: {
        width: wiggleRoom + sunTokenWidth + wiggleRoom,
        length: wiggleRoom + sunTokenWidth + wiggleRoom,
        height: wiggleRoom / 2 + sunTokenThickness,
      },
    });

    mainShape.subtractShapes(
      cardSlot.translate({
        x: exteriorWallThickness,
        y: exteriorWallThickness,
        z: floorThickness,
      }),
      owlTokenSlot
        .centerOn(cardSlot, { y: true })
        .alignWithTop(cardSlot, { x: true })
        .translateX(owlTokenSlot.getWidth() + interiorWallThickness)
        .translateZ(mainShape.getHeight() - owlTokenSlot.getHeight()),
      sunTokenSlot
        .centerOn(owlTokenSlot, { x: true, y: true })
        .alignWithBottom(owlTokenSlot, { z: true })
        .translateZ(-sunTokenSlot.getHeight()),
    );

    this.lidLip = new LidLip({
      width: mainShape.getWidth(),
      length: mainShape.getLength(),
    });

    mainShape.addShapes(this.lidLip.translateZ(mainShape.getHeight()));

    return mainShape.render();
  }
}

export default new OwlGameHolder({
  cardWidth: 51,
  cardsThickness: 24,
  sunTokenWidth: 20,
  sunTokenThickness: 1,
  owlTokenDiameter: 32,
  owlTokensThickness: 12.5,
  interiorWallThickness: 2,
  exteriorWallThickness: 4,
  floorThickness: 1,
  wiggleRoom: 1,
});
