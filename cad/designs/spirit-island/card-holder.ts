import { Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { LidLip } from '../../designer/shapes/custom/lid';

// const config: CardHolderOptions = {
//   width: 230,
//   cardLength: 2.5 * 25.4,
//   height: Math.sqrt(2.5 ^ (2 / 2)) * 25.4 + 2,
// };

const config: CardHolderOptions = {
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

class CardHolder extends Shape {
  private lid: Shape;

  constructor(config: CardHolderOptions) {
    super();

    const extraWiggleRoom = 0.2;

    config = {
      // defaults
      wallWidth: 4,
      floorThickness: 1,
      slotSpacing: 1,
      ...config,
    };

    const mainShape = new Cube({
      size: {
        width: config.width,
        length: config.cardLength + (config.wallWidth + extraWiggleRoom) * 2,
        height: (config.height * 2) / 3,
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
        height: config.height / 3,
      },
    });

    const originalLid = lidLip.makeLid({ noButtons: true });

    this.lid
      .translateZ(originalLid.getHeight() + extraWiggleRoom)
      .addShapes(originalLid.render())
      .subtractShapes(
        new Cube({
          size: {
            width: this.lid.getWidth(),
            length: mainShape.getLength() - (config.wallWidth + extraWiggleRoom) * 2,
            height: this.lid.getHeight() - config.slotSpacing + 0.6,
          },
        })
          .translate({ x: config.floorThickness, y: config.wallWidth + extraWiggleRoom })
          .render(),
      )
      .render();

    // const slot = new Cube({
    //   size: {
    //     width: 20,
    //     length: config.cardLength,
    //     height: 200,
    //   },
    // }).translate({ z: config.floorThickness, y: config.wallWidth, x: config.slotSpacing });
    //
    // const slots: Shape[] = [];
    // for (let i = 0; i < 5; i++) {
    //   console.log((slot.getWidth() + config.slotSpacing) * i);
    //   slots.push(
    //     slot
    //       .clone()
    //       .translateX((slot.getWidth() + 1) * i)
    //       .rotateY(45),
    //   );
    // }
    //
    // mainShape.subtractShapes(...slots.map(s => s.render()));

    mainShape.subtractShapes(
      new Cube({
        size: {
          width: mainShape.getWidth() - 8,
          length: mainShape.getLength() - 8,
          height: 100,
        },
      })
        .translate({
          x: 4,
          y: 4,
          z: 1,
        })
        .render(),
    );

    // add floor back in
    const floor = new Cube({
      size: {
        width: mainShape.getWidth(),
        length: mainShape.getLength(),
        height: config.floorThickness,
      },
    });
    mainShape.addShapes(floor.render());

    this.rawShape = mainShape.addShapes(lidLip.translateZ(mainShape.getHeight()).render()).render();
  }

  makeLid(): Shape {
    return this.lid;
  }
}

const cardHolder = new CardHolder(config);

export default cardHolder;
