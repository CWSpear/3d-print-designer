import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { LidLip } from '../../designer/shapes/custom/lid';

// const options: CardHolderOptions = {
//   width: 230,
//   cardLength: 2.5 * 25.4,
//   height: Math.sqrt(2.5 ^ (2 / 2)) * 25.4 + 2,
// };

const options: CardHolderOptions = {
  width: 40,
  cardLength: 20,
  height: 30,
};

interface CardHolderOptions {
  width: number;
  cardLength: number;
  height: number;
  wallWidth?: number;
  floorThickness?: number;
  slotSpacing?: number;
}

class CardHolder extends Shape<CardHolderOptions> {
  private lid: Shape;

  constructor(options: CardHolderOptions) {
    super({
      // defaults
      wallWidth: 4,
      floorThickness: 1,
      slotSpacing: 1,
      ...options,
    });
  }

  protected createInitialRawShape(): RawShape {
    const extraWiggleRoom = 0.2;

    const mainShape = new Cube({
      size: {
        width: this.inputOptions.width,
        length: this.inputOptions.cardLength + (this.inputOptions.wallWidth + extraWiggleRoom) * 2,
        height: (this.inputOptions.height * 2) / 3,
      },
    });

    const lidLip = new LidLip({
      width: mainShape.getWidth(),
      length: mainShape.getLength(),
    });

    this.lid = new Cube({
      size: {
        width: mainShape.getWidth(),
        length: mainShape.getLength(),
        height: this.inputOptions.height / 3,
      },
    });

    const originalLid = lidLip.makeLid({ noButtons: true });

    this.lid
      .translateZ(originalLid.getHeight() + extraWiggleRoom)
      .addShapes(originalLid)
      .subtractShapes(
        new Cube({
          size: {
            width: this.lid.getWidth(),
            length: mainShape.getLength() - (this.inputOptions.wallWidth + extraWiggleRoom) * 2,
            height: this.lid.getHeight() - this.inputOptions.slotSpacing + 0.6,
          },
        }).translate({ x: this.inputOptions.floorThickness, y: this.inputOptions.wallWidth + extraWiggleRoom }),
      );

    // const slot = new Cube({
    //   size: {
    //     width: 20,
    //     length: this.inputOptions.cardLength,
    //     height: 200,
    //   },
    // }).translate({ z: this.inputOptions.floorThickness, y: this.inputOptions.wallWidth, x: this.inputOptions.slotSpacing });
    //
    // const slots: Shape[] = [];
    // for (let i = 0; i < 5; i++) {
    //   console.log((slot.getWidth() + this.inputOptions.slotSpacing) * i);
    //   slots.push(
    //     slot
    //       .clone()
    //       .translateX((slot.getWidth() + 1) * i)
    //       .rotateY(45),
    //   );
    // }
    //
    // mainShape.subtractShapes(...slots.map(s => s));

    mainShape.subtractShapes(
      new Cube({
        size: {
          width: mainShape.getWidth() - 8,
          length: mainShape.getLength() - 8,
          height: 100,
        },
      }).translate({
        x: 4,
        y: 4,
        z: 1,
      }),
    );

    // add floor back in
    const floor = new Cube({
      size: {
        width: mainShape.getWidth(),
        length: mainShape.getLength(),
        height: this.inputOptions.floorThickness,
      },
    });
    mainShape.addShapes(floor);

    return mainShape.addShapes(lidLip.translateZ(mainShape.getHeight())).render();
  }

  makeLid(): Shape {
    return this.lid;
  }
}

const cardHolder = new CardHolder(options);

export default cardHolder;
