import { RawShape, Shape } from '../../designer/shape';
import { Cube } from '../../designer/shapes/core/cube';
import { Cylinder } from '../../designer/shapes/core/cylinder';
import { Util } from '../../designer/util';

interface TestSquareConfig {
  size: number;
}

class TestSquare extends Shape<TestSquareConfig> {
  constructor(inputOptions: TestSquareConfig) {
    super(inputOptions);
  }

  protected createInitialRawShape(): RawShape {
    const size = this.inputOptions.size;
    const c = new Cube({
      size,
    });

    // return c.render();

    const c2 = new Cube({
      size: {
        width: size / 2,
        height: size,
        length: size / 2,
      },
    });

    return c.subtractShapes(c2.centerOn(c)).render();

    const c3 = new Cube({
      size: size / 2,
    });

    // return c.subtractShapes(c2).addShapes(c3.translateX(size)).render();

    return new Cylinder({ radius: 10, height: 20 }).render();
  }
}

export default new TestSquare({ size: 20 });
