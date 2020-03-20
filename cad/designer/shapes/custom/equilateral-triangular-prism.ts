import { TriangularPrism } from './triangular-prism';

export interface EquilateralTriangularPrismOptions {
  readonly length: number;
  readonly legsLength: number;
}

export class EquilateralTriangularPrism extends TriangularPrism {
  constructor(options: EquilateralTriangularPrismOptions, id?: string) {
    super(
      {
        length: options.length,
        bottomSideLength: options.legsLength,
        rightSideLength: options.legsLength,
        leftSideLength: options.legsLength,
      },
      id,
    );
  }
}
