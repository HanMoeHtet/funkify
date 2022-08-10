import { isAsyncFunction } from 'util/types';
import { DEFAULT_PREFIX, DEFAULT_NATIVE_PREFIX } from './constants';
import { InvalidFunctionException } from './exceptions';

export type FunctionType = 'function' | 'method' | 'native' | 'async';

export interface FunctionOptions {
  prefix?: string;
  nativePrefix?: string;
}

export class Funkify {
  #prefix: string;
  #nativePrefix: string;

  constructor(options: FunctionOptions = {}) {
    this.#prefix =
      typeof options.prefix === 'string' ? options.prefix : DEFAULT_PREFIX;

    this.#nativePrefix =
      typeof options.nativePrefix === 'string'
        ? options.nativePrefix
        : DEFAULT_NATIVE_PREFIX;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getFunctionType(value: Function): FunctionType {
    if (isAsyncFunction(value)) {
      return 'async';
    }

    try {
      new Function(`return ${value.toString()}`)();
      return 'function';
    } catch (err) {
      try {
        new Function(`return function ${value}`)();
        return 'method';
      } catch (err) {
        return 'native';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  serializeFunction(value: Function): string {
    const type = this.getFunctionType(value);
    if (type === 'native') {
      throw new InvalidFunctionException(
        'Native functions are not serializable. You can wrap them in a function.'
      );
    }

    return this.#prefix + value.toString();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  deserializeFunction<T extends Function>(value: string): T {
    value = value.replace(this.#prefix, '');
    let deserialized: T;
    try {
      deserialized = new Function(`return ${value}`)();
    } catch (err) {
      if (value.startsWith('async')) {
        // For async class methods
        value = value.replace(/^async/, 'async function');
        deserialized = new Function(`return ${value}`)();
      } else {
        // For functions like class methods
        // e.g const obj = { hello() { return 'Hello, world!'; } };
        // By prefixing with function it becomes
        // function hello() { return 'Hello, world!'; }
        deserialized = new Function(`return function ${value}`)();
      }
    }

    return deserialized;
  }

  serializeNativeFunction(name: string) {
    return this.#prefix + this.#nativePrefix + name;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  deserializeNativeFunction<T extends Function>(value: string): T {
    value = value.replace(this.#prefix, '');
    value = value.replace(this.#nativePrefix, '');
    return new Function(`return ${value}`)();
  }

  serialize(value: unknown, space?: string | number): string {
    return JSON.stringify(
      value,
      (key, value: unknown) => {
        if (typeof value === 'function') {
          return this.serializeFunction(value);
        }
        return value;
      },
      space
    );
  }

  serializeClassObject<T extends object>(
    value: T,
    methodNames: (keyof T)[],
    space?: string | number
  ): string {
    return this.serialize(
      {
        ...value,
        ...methodNames.reduce((acc, methodName) => {
          acc[methodName] = value[methodName];
          return acc;
        }, {} as T),
      },
      space
    );
  }

  deserialize<T>(value: string): T {
    return JSON.parse(value, (key, value) => {
      if (typeof value === 'string' && value.startsWith(this.#prefix)) {
        if (value.startsWith(this.#prefix + this.#nativePrefix)) {
          return this.deserializeNativeFunction(value);
        }

        return this.deserializeFunction(value);
      }
      return value;
    }) as T;
  }
}
