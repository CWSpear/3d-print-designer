import { Dimensions, NumbersDimensions, WLHDimensions, XYZDimensions } from './shape';

/**
 * Library of useful utilities
 */
export class Util {
  static readonly PrinterMaxWidth = 250;
  static readonly PrinterMaxLength = 210;

  static normalizeDimensions(dimensions: Partial<Dimensions>, defaultValue: number = 0): NumbersDimensions {
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
      return [dimensions.x || defaultValue, dimensions.y || defaultValue, dimensions.z || defaultValue];
    }

    if (Util.dimensionsIsWLH(dimensions)) {
      return [dimensions.width || defaultValue, dimensions.length || defaultValue, dimensions.height || defaultValue];
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
