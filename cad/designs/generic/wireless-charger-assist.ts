import * as _ from 'lodash';
import { Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Cylinder } from '../../designer/shapes/core/cylinder';
import { Util } from '../../designer/util';

interface WirelessChargerAssistOptions {
  // including "extra wiggle room"
  lipWidth: number;
  lipLength: number;
  lipHeight: number;
  totalWidth: number;
  wallThickness: number;
}

export class WirelessChargerAssist extends Shape {
  constructor({ lipWidth, lipLength, lipHeight, totalWidth, wallThickness }: WirelessChargerAssistOptions) {
    super();

    const hole = new Cube({
      size: {
        width: lipWidth - lipLength,
        length: lipLength,
        height: lipHeight + 2,
      },
    });

    const roundedSide = new Cylinder({
      radius: lipLength / 2,
      height: lipHeight + 2,
    });

    roundedSide.translateY(roundedSide.getLength() / 2);

    const roundedSide2 = roundedSide.clone().translateX(hole.getWidth());

    hole.addShapes(roundedSide.render(), roundedSide2.render());

    const mainShape = new Cube({
      size: {
        width: totalWidth,
        length: hole.getLength() + wallThickness * 2,
        height: lipHeight,
      },
    });

    this.rawShape = mainShape
      .subtractShapes(
        hole
          .center({ x: true })
          .translate({
            x: (mainShape.getPositionMaxX() - mainShape.getPositionMinX()) / 2,
            y: wallThickness,
          })
          .render(),
      )
      .render();

    console.log('\nHole\n');
    console.log(
      Util.trimLines(`
        Width:  ${_.round(hole.getWidth(), 2)} mm
        Length: ${_.round(hole.getLength(), 2)} mm
        Height: ${_.round(hole.getHeight(), 2)} mm
      `),
    );
    console.log('');

    console.log('\nTotals\n');
    console.log(
      Util.trimLines(`
        Width:  ${_.round(mainShape.getWidth(), 2)} mm
        Length: ${_.round(mainShape.getLength(), 2)} mm
        Height: ${_.round(mainShape.getHeight(), 2)} mm
      `),
    );
    console.log('');
  }
}

export default new WirelessChargerAssist({
  lipWidth: 56.5,
  lipLength: 10,
  lipHeight: 13,
  totalWidth: 70,
  wallThickness: 0.8,
});
