import { degToRad } from '@jscad/modeling/src/utils';
import * as util from 'util';
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

  static magnetMinWall: number = 0.59999;

  static convertAxesTogglesToBooleans(axes: Partial<AxesToggles>): BooleanAxesToggles {
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

  static convertAxesTogglesToWLH(dimensions: Partial<AxesToggles>): WLHAxesToggles {
    const [width, length, height] = Util.convertAxesTogglesToBooleans(dimensions);

    return { width, length, height };
  }

  static convertAxesTogglesToXYZ(dimensions: Partial<AxesToggles>): XYZAxesToggles {
    const [x, y, z] = Util.convertAxesTogglesToBooleans(dimensions);

    return { x, y, z };
  }

  static convertDimensionsToNumbers(dimensions: Partial<Dimensions>, defaultValue: number = 0): NumbersDimensions {
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

  static convertToRadius<T extends number[]>(degrees: T): T {
    return <T>degrees.map((degree) => degToRad(degree));
  }

  static convertDimensionsToWLH(dimensions: Partial<Dimensions>, defaultValue: number = 0): WLHDimensions {
    const [width, length, height] = Util.convertDimensionsToNumbers(dimensions, defaultValue);

    return { width, length, height };
  }

  static convertDimensionsToXYZ(dimensions: Partial<Dimensions>, defaultValue: number = 0): XYZDimensions {
    const [x, y, z] = Util.convertDimensionsToNumbers(dimensions, defaultValue);

    return { x, y, z };
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
      .map((s) => s.trim())
      .join('\n')
      .trim();
  }

  static inchesToMillimeters(inches: number) {
    return inches * 25.4;
  }

  static millimetersToInches(millimeters: number): number {
    return millimeters / 25.4;
  }

  static log(...args: any[]): void {
    console.log(
      ...args.map((arg) => {
        if (typeof arg === 'string') {
          return arg;
        }
        return util.inspect(arg, { depth: 10, colors: true });
      }),
    );
  }
}
