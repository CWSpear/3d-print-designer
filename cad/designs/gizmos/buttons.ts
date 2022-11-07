import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Cylinder } from '../../designer/shapes/core/cylinder';
import { LidLip } from '../../designer/shapes/custom/lid';

export interface ButtonsOptions {
  width: number;
  height: number;
  wallThickness: number;
  holeDiameter: number;
  holdDistanceFromEdge: number;

  pegTotalHeight: number;
}

const config: ButtonsOptions = {
  width: 48,
  height: 25.5,
  wallThickness: 2,
  holeDiameter: 2.9 - 0.2,
  holdDistanceFromEdge: 0.9,

  pegTotalHeight: 8,
};

// export default

export class ButtonsCase extends Shape<ButtonsOptions> {
  lidLip!: LidLip;

  protected createInitialRawShape(): RawShape {
    const buttonHoleSize = 15.6 + 0.3;

    const spacing = 2.2; // 0.2;

    const {
      width,
      height,
      wallThickness,
      holeDiameter,
      holdDistanceFromEdge,
      pegTotalHeight,
    } = this.inputOptions;

    const rise = pegTotalHeight / 2.2;

    const baseRadius = holeDiameter / 1.4;
    const pegBase = new Cylinder({
      radius: baseRadius,
      height: rise,
    });

    const pegPillar = new Cylinder({
      radius: holeDiameter / 2,
      height: pegTotalHeight,
    });

    const boardStand = new Cube({
      size: {
        width: width + spacing * 2,
        length: height + spacing * 2,
        height: wallThickness,
      },
    });

    const buttonCase = new Cube({
      size: {
        width: buttonHoleSize * 9 * (4 / 5),
        length: (wallThickness * 2 + height + spacing * 2) * 2.2,
        height: buttonHoleSize * 2.2,
      },
    });

    const baseCutout = new Cube({
      size: {
        width: buttonCase.getWidth() - wallThickness * 2,
        length: buttonCase.getLength() - wallThickness * 2,
        height: 1000,
      },
    });

    boardStand.centerOn(buttonCase, { x: true, y: true });

    // this is intentionally offset so that the charger wall is thinner
    buttonCase.subtractShapes(
      baseCutout
        .alignWithBottom(buttonCase, { x: true })
        .centerOn(buttonCase, { y: true })
        .translate({ z: wallThickness, x: 0.8 }),
    );

    const chargerHoleHeight = 2.4;
    const chargeHoldExtra = 0.4;
    const chargerHole = new Cube({
      size: {
        width: wallThickness,
        length: 8.5,
        height: chargerHoleHeight + chargeHoldExtra,
      },
    });

    const peg = pegBase
      .addShapes(pegPillar.centerOn(pegBase, { x: true, y: true }))
      .translate({
        z: wallThickness,
      });

    const offsetAmount = -(-(baseRadius - holeDiameter / 2) + holdDistanceFromEdge);

    const peg1 = peg
      .clone()
      .alignWithBottom(boardStand, { x: true, y: true })
      .translate({
        x: -offsetAmount + spacing,
        y: -offsetAmount + spacing,
      });

    const peg2 = peg
      .clone()
      .alignWithBottom(boardStand, { x: true })
      .alignWithTop(boardStand, { y: true })
      .translate({
        x: -offsetAmount + spacing,
        y: offsetAmount - spacing,
      });

    const peg3 = peg
      .clone()
      .alignWithTop(boardStand, { x: true, y: true })
      .translate({
        x: offsetAmount - spacing,
        y: offsetAmount - spacing,
      });

    const peg4 = peg
      .clone()
      .alignWithBottom(boardStand, { y: true })
      .alignWithTop(boardStand, { x: true })
      .translate({
        x: offsetAmount - spacing,
        y: -offsetAmount + spacing,
      });

    boardStand.addShapes(peg1, peg2, peg3, peg4);

    buttonCase.subtractShapes(
      chargerHole
        .alignWithBottom(buttonCase)
        .centerOn(buttonCase, { y: true })
        .translate({ z: wallThickness + rise - chargerHoleHeight }),
    );

    // const chargerSlideIn = new Cube({
    //   size: {
    //     width: wallThickness,
    //     length: 8.5,
    //     height: pegTotalHeight + chargerHole.getHeight(),
    //   },
    // });
    //
    // buttonCase.subtractShapes(
    //   chargerSlideIn.alignWithBottom(chargerHole).translateX(0.8),
    // );

    const ventSlot = new Cube({
      size: {
        width: 3,
        length: (boardStand.getLength() * 3) / 4,
        height: 20,
      },
      round: true,
      radius: 1.4,
      resolution: 64,
    });

    buttonCase.addShapes(
      boardStand
        .alignWithBottom(baseCutout)
        .centerOn(buttonCase, { y: true })
        .setPositionToZero({ z: true }),
    );

    ventSlot
      .alignWithBottom(boardStand, { x: true })
      .centerOn(boardStand, { y: true })
      .translate({ x: 8, z: -5 });

    buttonCase.subtractShapes(
      ventSlot,
      ventSlot.clone().translateX(ventSlot.getWidth() * (2 * 0.93)),
      ventSlot.clone().translateX(ventSlot.getWidth() * (4 * 0.93)),
      ventSlot.clone().translateX(ventSlot.getWidth() * (6 * 0.93)),
      ventSlot.clone().translateX(ventSlot.getWidth() * (8 * 0.93)),
      ventSlot.clone().translateX(ventSlot.getWidth() * (10 * 0.93)),
      ventSlot.clone().translateX(ventSlot.getWidth() * (12 * 0.93)),
    );

    this.lidLip = new LidLip({
      width: buttonCase.getWidth(),
      length: buttonCase.getLength(),
    });

    buttonCase.addShapes(
      this.lidLip.alignWithBottom(buttonCase).translateZ(buttonCase.getHeight()),
    );

    const buttonHole = new Cylinder({
      radius: buttonHoleSize / 2,
      height: wallThickness,
    }).rotate({ y: 90, z: 90 });

    const buttonHoles = buttonHole
      .clone()
      .addShapes(
        buttonHole.clone().translateX(buttonHoleSize * 2 * 1 * (4 / 5)),
        buttonHole.clone().translateX(buttonHoleSize * 2 * 2 * (4 / 5)),
        buttonHole.clone().translateX(buttonHoleSize * 2 * 3 * (4 / 5)),
      );

    buttonCase.subtractShapes(
      buttonHoles
        .alignWithBottom(buttonCase, { y: true })
        .centerOn(buttonCase, { x: true, z: true }),
    );

    return buttonCase.render();
  }
}

export default new ButtonsCase(config);
