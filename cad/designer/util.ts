export type NumbersDimensions = [number, number, number];
export type WLHDimensions = { width: number; length: number; height: number };
export type XYZDimensions = { x: number; y: number; z: number };

export type Dimensions = NumbersDimensions | WLHDimensions | XYZDimensions | number;

export type Vector = Dimensions;

export type RawShape = 'Raw Shape Placeholder';

/**
 * Library of useful utilities
 */
export class Util {
  static readonly PrinterMaxWidth = 250;
  static readonly PrinterMaxLength = 210;

  static normalizeDimensions(dimensions: Partial<Dimensions>): NumbersDimensions {
    if (!dimensions && dimensions !== 0) {
      return undefined;
    }

    if (Util.dimensionsIsNumber(dimensions)) {
      return [dimensions, dimensions, dimensions];
    }

    if (Util.dimensionsIsNumbers(dimensions)) {
      return dimensions;
    }

    if (Util.dimensionsIsXYZ(dimensions)) {
      return [dimensions.x || 0, dimensions.y || 0, dimensions.z || 0];
    }

    if (Util.dimensionsIsWLH(dimensions)) {
      return [dimensions.width || 0, dimensions.length || 0, dimensions.height || 0];
    }

    throw new Error(`Unexpected dimensions format: ${JSON.stringify(dimensions)}`);
  }

  static dimensionsIsNumber(dimensions: Partial<Dimensions>): dimensions is number {
    return typeof dimensions === 'number';
  }

  static dimensionsIsNumbers(dimensions: Partial<Dimensions>): dimensions is NumbersDimensions {
    return Array.isArray(dimensions);
  }

  static dimensionsIsXYZ(dimensions: Partial<Dimensions>): dimensions is XYZDimensions {
    return typeof dimensions === 'object' && ('x' in dimensions || 'y' in dimensions || 'z' in dimensions);
  }

  static dimensionsIsWLH(dimensions: Partial<Dimensions>): dimensions is WLHDimensions {
    return (
      typeof dimensions === 'object' && ('width' in dimensions || 'length' in dimensions || 'height' in dimensions)
    );
  }

  static trimLines(str: string): string {
    return str
      .split('\n')
      .map(s => s.trim())
      .join('\n')
      .trim();
  }
}
