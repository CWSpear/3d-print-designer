import {
  AxesToggles,
  BooleanAxesToggles,
  Dimensions,
  NumbersDimensions,
  WLHAxesToggles,
  WLHDimensions,
  XYZAxesToggles,
  XYZDimensions,
} from './shape';

/**
 * Library of useful utilities
 */
export class Util {
  static readonly PrinterMaxWidth = 250;
  static readonly PrinterMaxLength = 210;

  static magnetSize: WLHDimensions = {
    width: 6.5 + 0.2,
    length: 15 + 0.2,
    height: 3 + 0.2,
  };

  static normalizeAxesToggle(axes: AxesToggles): BooleanAxesToggles {
    if (!axes) {
      return undefined;
    }

    if (axes === true) {
      return [true, true, true];
    }

    if (Util.axesTogglesIsNumbers(axes)) {
      return axes;
    }

    if (Util.axesTogglesIsXYZ(axes)) {
      return [axes.x || false, axes.y || false, axes.z || false];
    }

    if (Util.axesTogglesIsWLH(axes)) {
      return [axes.width || false, axes.length || false, axes.height || false];
    }

    throw new Error(`Unexpected axes toggles format: ${JSON.stringify(axes)}`);
  }

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

  static axesTogglesIsNumbers(axesToggles: Partial<AxesToggles>): axesToggles is BooleanAxesToggles {
    return Array.isArray(axesToggles);
  }

  static axesTogglesIsXYZ(axesToggles: Partial<AxesToggles>): axesToggles is XYZAxesToggles {
    return typeof axesToggles === 'object' && ('x' in axesToggles || 'y' in axesToggles || 'z' in axesToggles);
  }

  static axesTogglesIsWLH(axesToggles: Partial<AxesToggles>): axesToggles is WLHAxesToggles {
    return (
      typeof axesToggles === 'object' && ('width' in axesToggles || 'length' in axesToggles || 'height' in axesToggles)
    );
  }

  static trimLines(str: string): string {
    return str
      .split('\n')
      .map(s => s.trim())
      .join('\n')
      .trim();
  }

  static inchesToMillimeters(inches: number) {
    return inches * 25.4;
  }

  static millimetersToInches(millimeters: number): number {
    return millimeters / 25.4;
  }
}
