import * as _ from 'lodash';
import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { PlainText } from '../../designer/shapes/core/plain-text';
import { Util } from '../../designer/util';
import splendorGameHolder, { magnetMinWall } from './spl-game-holder';

splendorGameHolder.render();

class SplendorGameHolderLid extends Shape<null> {
  inputOptions: null = null;

  constructor(id?: string) {
    super(null, id);
  }

  protected createInitialRawShape(): RawShape {
    const lid: Shape = splendorGameHolder.lidLip.makeLid({
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

    lid.addShapes(extraClearanceLid);

    const extraLid = new Cube({
      size: {
        width: splendorGameHolder.getWidth(),
        length: splendorGameHolder.getLength(),
        height: Util.magnetSize.height + magnetMinWall * 2 - lid.getHeight(),
      },
    })
      .centerOn(lid, { y: true })
      .translateZ(lid.getHeight());

    lid.addShapes(extraLid).setPositionToZero();

    const magnet1 = splendorGameHolder.magnet1.clone().centerOn(lid, { z: true });
    const magnet2 = splendorGameHolder.magnet2.clone().centerOn(lid, { z: true });

    lid.subtractShapes(magnet1); //, magnet2.translateZ(magnetMinWall));

    const text = new PlainText('Splendor', { height: 7 });
    text.centerOn(lid, { x: true, y: true });

    text.translateZ(lid.getHeight() - text.getHeight());
    lid.subtractShapes(text);

    // lid.roundCorners();

    /////
    // this.rawShape = splendorGameHolder
    //   .clone()
    //   .addShapes(
    //     lid
    //       .clone()
    //       .translateZ(splendorGameHolder.getHeight() - 2.1)
    //       ,
    //   )
    //   ;
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

    return lid.render();
  }
}

export default new SplendorGameHolderLid();
