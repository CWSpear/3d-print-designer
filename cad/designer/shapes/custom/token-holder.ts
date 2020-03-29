import { RawShape, Shape } from '../../shape';
import { Cube } from '../core/cube';
import { LidLip } from './lid';
import { RoundedBottomCube } from './rounded-bottom-cube';
import { Util } from '../../util';

export interface TokenHolderOptions {
  width: number;
  length: number;
  height: number;
  grid: number[][];
  stackable?: boolean;
  useRamps?: boolean;
  rampSize?: number;
  dividerThickness?: number;
  outerWallThickness?: number;
}

export class TokenHolder extends Shape<TokenHolderOptions> {
  lidLip: LidLip;

  constructor(options: TokenHolderOptions) {
    super(options);
  }

  protected createInitialRawShape(): RawShape {
    const {
      width,
      length,
      height,
      grid,
      stackable = false,
      useRamps = true,
      rampSize = 8,
      dividerThickness = 1,
      outerWallThickness = 3,
    } = this.inputOptions;

    const colCount = grid.length;
    const cellHeight =
      (length - dividerThickness - dividerThickness - outerWallThickness) / colCount - dividerThickness;

    if (width > Util.PrinterMaxWidth) {
      throw new Error(`Container is too big! Max width is: ${Util.PrinterMaxWidth}. Width provided: ${width}`);
    }

    if (length > Util.PrinterMaxLength) {
      throw new Error(`Container is too big! Max length is: ${Util.PrinterMaxLength}. Length provided: ${length}`);
    }

    this.lidLip = new LidLip({
      width: width,
      length: length,
      lipWidth: outerWallThickness,
    });

    const lidHeight = this.lidLip.inputOptions.height;

    const cellDepth = height - (dividerThickness + this.lidLip.getTotalHeight());
    const heightWithoutLid = height - this.lidLip.getTotalHeight();

    console.log(
      Util.trimLines(`
      Width:      ${width}
      Length:     ${length}
      Height:     ${height}
      Cell Depth: ${cellDepth}
    `),
    );

    const mainShape = new Cube({
      size: {
        width: width,
        length: length,
        height: heightWithoutLid - (stackable ? lidHeight + outerWallThickness : 0),
      },
    });

    if (stackable) {
      const lid = this.lidLip.makeLid({ noButtons: true });

      const extraLidLip = new LidLip({
        width: width,
        length: length,
        lipWidth: outerWallThickness,
        height: outerWallThickness, // so we have a 45° angle
        attachmentWidth: 0,
        extraClearance: 0,
      });

      const lid2 = extraLidLip.makeLid({ noButtons: true, extraWiggleRoom: 0 });

      console.log('lid2.getHeight()', lid2.getHeight());

      mainShape
        .addShapes(
          lid.translateZ(-lid.getHeight() - lid2.getHeight()),
          lid2
            .mirrorAcrossZPlane()
            .setPositionToZero()
            .translateZ(-lid2.getHeight()),
        )
        .setPositionToZero();
    }

    grid.reverse().forEach((row, y) => {
      let x = 0;
      row.forEach(col => {
        const rowCount = row.reduce((total, v) => total + v, 0);
        const rowUnitWidth: number =
          (width - dividerThickness - dividerThickness - outerWallThickness) / rowCount - dividerThickness;

        const cellWidth = (rowUnitWidth + dividerThickness) * col - dividerThickness;
        const offsetX = outerWallThickness + x * (rowUnitWidth + dividerThickness);
        const offsetY = outerWallThickness + y * (cellHeight + dividerThickness);

        const size = { width: cellWidth, length: cellHeight, height: height };

        const shape: Shape = useRamps
          ? new RoundedBottomCube({
              rampSize: rampSize,
              size,
            })
          : new Cube({ size });

        mainShape.subtractShapes(shape.translate({ z: dividerThickness, x: offsetX, y: offsetY }));

        x += col;
      });
    });

    mainShape.addShapes(this.lidLip.translateZ(heightWithoutLid));

    return mainShape.render();
  }
}
