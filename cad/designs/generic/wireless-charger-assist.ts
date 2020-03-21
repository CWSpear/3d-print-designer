import * as _ from 'lodash';
import { RawShape, Shape } from '../../designer/shape';
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

export class WirelessChargerAssist extends Shape<WirelessChargerAssistOptions> {
  constructor(options: WirelessChargerAssistOptions) {
    super(options);
  }

  protected createInitialRawShape(): RawShape {
    const { lipWidth, lipLength, lipHeight, totalWidth, wallThickness } = this.inputOptions;

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

    hole.addShapes(roundedSide, roundedSide2);

    const mainShape = new Cube({
      size: {
        width: totalWidth,
        length: hole.getLength() + wallThickness * 2,
        height: lipHeight,
      },
    });

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

    return mainShape.subtractShapes(hole.centerOn(mainShape, { x: true, y: true })).render();
  }
}

export default new WirelessChargerAssist({
  lipWidth: 56.5,
  lipLength: 10,
  lipHeight: 13,
  totalWidth: 70,
  wallThickness: 0.8,
});
