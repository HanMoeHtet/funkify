import { Funkify } from '@src/Funkify';
import { InvalidFunctionException } from '@src/exceptions';

describe('Native functions', () => {
  const funkify = new Funkify();

  it('Should throw when serializing native functions', () => {
    const now = Date.now;

    expect(() => funkify.serialize(now)).toThrowError(InvalidFunctionException);
  });

  it('Should throw when serializing object with native function', () => {
    const obj = {
      now: Date.now,
      name: 'world',
    };

    expect(() => funkify.serialize(obj)).toThrowError(InvalidFunctionException);
  });

  it('Should serializing and deserialize native function using serializeNativeFunction', () => {
    const now = Date.now;

    const serialized = funkify.serializeNativeFunction('Date.now');
    const deserialized =
      funkify.deserializeNativeFunction<typeof now>(serialized);

    expect(deserialized).toBe(now);
  });

  it('Should serializing and deserialize object with native function using serializeNativeFunction', () => {
    const obj = {
      now: Date.now,
      name: 'world',
    };

    const serialized = funkify.serialize({
      ...obj,
      now: funkify.serializeNativeFunction('Date.now'),
    });
    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.name).toEqual('world');
    expect(deserialized.now).toEqual(obj.now);
  });
});

describe('Function', () => {
  const funkify = new Funkify();

  it('Should serialize and deserialize one liner arrow function', () => {
    const hello = (name: string) => `Hello ${name}`;

    const serialized = funkify.serialize(hello);
    const deserialized = funkify.deserialize<typeof hello>(serialized);

    expect(deserialized('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize arrow function', () => {
    const hello = (name: string) => {
      return `Hello ${name}`;
    };

    const serialized = funkify.serialize(hello);
    const deserialized = funkify.deserialize<typeof hello>(serialized);

    expect(deserialized('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize function', () => {
    function hello(name: string) {
      return `Hello ${name}`;
    }

    const serialized = funkify.serialize(hello);
    const deserialized = funkify.deserialize<typeof hello>(serialized);

    expect(deserialized('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize function with return type', () => {
    const hello = new Function(
      'return function hello(name) { return `Hello ${name}`; }'
    )();

    const serialized = funkify.serialize(hello);
    const deserialized = funkify.deserialize<typeof hello>(serialized);

    expect(deserialized('world')).toEqual('Hello world');
  });

  it('Should serializing and deserialize async function', async () => {
    const hello = async (name: string) => `Hello ${name}`;

    const serialized = funkify.serialize(hello);
    const deserialized = funkify.deserialize<typeof hello>(serialized);

    expect(await deserialized('world')).toEqual('Hello world');
  });

  it('Should throw Error when using variables in different scope.', () => {
    const name = 'world';

    const hello = () => `Hello ${name}`;

    const serialized = funkify.serialize(hello);
    const deserialized = funkify.deserialize<typeof hello>(serialized);

    expect(() => deserialized()).toThrowError();
  });
});

describe('Object with function', () => {
  const funkify = new Funkify();

  it('Should serialize and deserialize object with one liner arrow function', () => {
    const obj = {
      hello: (name: string) => `Hello ${name}`,
      name: 'world',
    };

    const serialized = funkify.serialize(obj);
    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.name).toEqual('world');
    expect(deserialized.hello('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize object with arrow function', () => {
    const obj = {
      hello: (name: string) => {
        return `Hello ${name}`;
      },
      name: 'world',
    };

    const serialized = funkify.serialize(obj);
    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.name).toEqual('world');
    expect(deserialized.hello('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize object with functions', () => {
    const obj = {
      hello: function (name: string) {
        return `Hello ${name}`;
      },
      name: 'world',
    };

    const serialized = funkify.serialize(obj);
    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.name).toEqual('world');
    expect(deserialized.hello('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize object with method', () => {
    const obj = {
      hello(name: string) {
        return `Hello ${name}`;
      },
      name: 'world',
    };

    const serialized = funkify.serialize(obj);
    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.name).toEqual('world');
    expect(deserialized.hello('world')).toEqual('Hello world');
  });

  it('Should serialize and deserialize object with one liner async arrow function', async () => {
    const obj = {
      hello: async (name: string) => `Hello ${name}`,
      name: 'world',
    };

    const serialized = funkify.serialize(obj);
    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.name).toEqual('world');
    expect(await deserialized.hello('world')).toEqual('Hello world');
  });
});

describe('Class instance', () => {
  const funkify = new Funkify();

  class Hello {
    constructor(private name: string) {}

    hello() {
      return `Hello ${this.name}`;
    }

    async helloAsync() {
      return `Hello ${this.name} async`;
    }
  }

  it('Should serialize and deserialize class instance', async () => {
    const obj = new Hello('world');

    const serialized = funkify.serialize({
      ...obj,
      hello: obj.hello,
      helloAsync: obj.helloAsync,
    });

    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.hello()).toEqual('Hello world');

    expect(await deserialized.helloAsync()).toEqual('Hello world async');
  });

  it('Should serialize and deserialize class instance using serializeClassObject', async () => {
    const obj = new Hello('world');

    const serialized = funkify.serializeClassObject(obj, [
      'hello',
      'helloAsync',
    ]);

    const deserialized = funkify.deserialize<typeof obj>(serialized);

    expect(deserialized.hello()).toEqual('Hello world');

    expect(await deserialized.helloAsync()).toEqual('Hello world async');
  });
});

describe('Class', () => {
  const funkify = new Funkify();

  class Hello {
    constructor(private name: string) {}

    hello() {
      return `Hello ${this.name}`;
    }

    async helloAsync() {
      return `Hello ${this.name} async`;
    }
  }

  it('Should serialize and deserialize class', () => {
    const serialized = funkify.serialize(Hello);

    const NewHello = funkify.deserialize<typeof Hello>(serialized);

    expect(new NewHello('world').hello()).toEqual('Hello world');

    expect(NewHello.toString()).toEqual(Hello.toString());
  });
});
