import * as _ from 'lodash';
import { Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Util } from '../../designer/util';
import splendorGameHolder, { magnetMinWall } from './game-holder';

class SplendorGameHolderLid extends Shape {
  constructor() {
    super();

    const lid = splendorGameHolder.lidLip.makeLid({
      noButtons: true,
      extraWiggleRoom: 0.3,
    });

    splendorGameHolder.mainShape.setPositionToZero();

    const extraClearanceLid = new Cube({
      size: {
        width: lid.getWidth() - 2, // 2 is default size of triangle part
        length: lid.getLength() - 2 * 2,
        height: 0.2, // extra clearance
      },
    })
      .centerOn(lid, { y: true })
      .translateZ(lid.getHeight());

    lid.addShapes(extraClearanceLid.render());

    const extraLid = new Cube({
      size: {
        width: splendorGameHolder.getWidth(),
        length: splendorGameHolder.getLength(),
        height: Util.magnetSize.height + magnetMinWall * 2 - lid.getHeight(),
      },
    })
      .centerOn(lid, { y: true })
      .translateZ(lid.getHeight());

    lid.addShapes(extraLid.render()).setPositionToZero();

    const magnet1 = splendorGameHolder.magnet1.clone().centerOn(lid, { z: true });
    const magnet2 = splendorGameHolder.magnet2.clone().centerOn(lid, { z: true });

    lid.subtractShapes(magnet1.render()); //, magnet2.translateZ(magnetMinWall).render());

    this.rawShape = lid.render();

    /////
    // this.rawShape = splendorGameHolder
    //   .clone()
    //   .addShapes(
    //     lid
    //       .clone()
    //       .translateZ(splendorGameHolder.getHeight() - 2.1)
    //       .render(),
    //   )
    //   .render();
    /////

    console.log('\nLid:\n');
    console.log(
      Util.trimLines(`
        Width:  ${_.round(lid.getWidth(), 2)} mm
        Length: ${_.round(lid.getLength(), 2)} mm
        Height: ${_.round(lid.getHeight(), 2)} mm
      `),
    );
    console.log('');
    console.log(
      Util.trimLines(`
        Width:  ${_.round(Util.millimetersToInches(lid.getWidth()), 3)} in
        Length: ${_.round(Util.millimetersToInches(lid.getLength()), 3)} in
        Height: ${_.round(Util.millimetersToInches(lid.getHeight()), 3)} in
      `),
    );
  }
}

export default new SplendorGameHolderLid();
