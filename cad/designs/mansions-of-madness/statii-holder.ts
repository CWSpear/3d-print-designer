import { RawShape, Shape, ShapeContainer } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { LidLip } from '../../designer/shapes/custom/lid';
import { RightTriangularPrism } from '../../designer/shapes/custom/right-triangular-prism';

export interface StatiiHolderOptions {
  cardLength: number;
  cardWidth: number;
  wallThickness: number;
  totalHeight: number;
  statusSlotThickness: number;
  statusSlotAngle: number;
  notchSize: number;
  manualInsanityOffset: number;
}

const config: StatiiHolderOptions = {
  cardLength: 63 + 3,
  cardWidth: 41 + 3,
  wallThickness: 2,
  totalHeight: 42,
  statusSlotThickness: 2,
  statusSlotAngle: 8,
  notchSize: 10,
  manualInsanityOffset: 6,
};

export class StatiiHolder extends Shape<StatiiHolderOptions> {
  private lidLip: LidLip;

  constructor(config: StatiiHolderOptions) {
    super(config);
  }

  protected createInitialRawShape(): RawShape {
    const {
      cardLength,
      cardWidth,
      wallThickness,
      totalHeight,
      statusSlotThickness,
      statusSlotAngle,
      notchSize,
      manualInsanityOffset,
    } = this.inputOptions;

    const base = new Cube({
      size: {
        width: cardWidth * 4 + wallThickness * 5,
        length: cardLength + wallThickness * 2,
        height: totalHeight,
      },
    });

    const hurtSlot = new Cube({
      size: {
        width: cardWidth,
        length: cardLength,
        height: totalHeight,
      },
    });

    const statusSlot = new Cube({
      size: {
        width: cardWidth,
        length: statusSlotThickness,
        height: cardLength,
      },
    })
      .translate({
        width: cardWidth + wallThickness * 2,
        length: wallThickness / 2,
      })
      .rotateX(-statusSlotAngle)
      .setPositionToZero({ height: true })
      .translate({
        height: wallThickness * -2,
      });

    const insaneSlot = new Cube({
      size: {
        width: cardWidth,
        length: statusSlotThickness * 4,
        height: cardLength,
      },
    })
      .translate({
        width: cardWidth + wallThickness * 2,
        length: wallThickness / 2,
      })
      .rotateX(-statusSlotAngle)
      .setPositionToZero({ height: true })
      .translate({
        height: wallThickness * -2,
      });

    const slots: Shape[] = [];
    const step = (1 / 6) * (base.getLength() - wallThickness);
    for (let i = 0; i < 6; i++) {
      slots.push(statusSlot.clone().translate({ length: i * step }));
    }
    for (let i = 0; i < 5; i++) {
      slots.push(statusSlot.clone().translate({ length: i * step, width: wallThickness + cardWidth }));
    }

    const insaneOffset = manualInsanityOffset;
    slots.push(insaneSlot.clone().translate({ length: 5 * step - insaneOffset, width: wallThickness + cardWidth }));

    const statii = new ShapeContainer(slots);

    statii.subtractShapes(
      new Cube({
        size: {
          height: wallThickness,
          width: base.getWidth(),
          length: base.getLength(),
        },
      }),
    );

    const sideNotch = new RightTriangularPrism({
      length: wallThickness + notchSize / 2,
      xLegLength: notchSize * 1.5,
      yLegLength: totalHeight * 2,
    })
      .mirrorAcrossZPlane()
      .translate({
        height: totalHeight,
        length: notchSize,
      });

    sideNotch
      .addShapes(
        sideNotch.clone().mirrorAcrossXPlane().centerOn(sideNotch).translate({
          y: -sideNotch.getLength(),
        }),
      )
      .centerOn(base, {
        length: true,
      })
      .translateZ(notchSize / 2);

    this.lidLip = new LidLip({
      width: base.getWidth(),
      length: base.getLength(),
      lipWidth: wallThickness,
    });

    base.addShapes(this.lidLip.translateZ(base.getHeight()));

    base.subtractShapes(
      hurtSlot.clone().translate({
        width: wallThickness,
        length: wallThickness,
        height: wallThickness,
      }),
      hurtSlot.clone().alignWithTop(base, { x: true, y: true }).translate({
        width: -wallThickness,
        length: -wallThickness,
        height: wallThickness,
      }),
      statii.clone().translateY((-1 / 2) * wallThickness),
      sideNotch,
      sideNotch.clone().translateX(base.getWidth() - sideNotch.getWidth()),
    );

    return base.render();
  }

  makeLid(): Shape {
    return this.lidLip.makeLid();
  }
}

export default new StatiiHolder(config);
