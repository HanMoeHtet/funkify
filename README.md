# [Funkify](https://github.com/HanMoeHtet/funkify) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![npm version](https://img.shields.io/npm/v/@han-moe-htet/funkify.svg?style=flat)](https://www.npmjs.com/package/@han-moe-htet/funkify)

Serialize and deserialize objects including functions, async functions, class instances, classes. Uses `JSON.stringify` and `JSON.parse` under the hood with the replacer function that prepend `myFunction.toString()` with a `<FUNCTION>` prefix.
Support for native functions is included. Variables used inside the function must be scoped correctly. See [caveats](#caveats) section below.

## Installation

```bash
yarn add @han-moe-htet/funkify
```

Or

```bash
npm install @han-moe-htet/funkify
```

## Usage

### Serialize object with function

```typescript
import assert from 'assert';
import { Funkify } from '@han-moe-htet/funkify';

const funkify = new Funkify();

const obj = {
  name: 'world',
  hello: (name: string) => `Hello ${name}`,
};

const serialized = funkify.serialize(obj);

const deserialized = funkify.deserialize<typeof obj>(serialized);

assert.equal(obj.hello(obj.name), deserialized.hello(deserialized.name));
```

### Serialize function

```typescript
const hello = (name: string) => `Hello ${name}`;

const serialized = funkify.serializeFunction(hello);

const deserialized = funkify.deserializeFunction<typeof hello>(serialized);

assert.equal(hello('world'), deserialized('world'));
```

### Serialize native function

Since `toString` of native methods returns `function () { [native code] }`, you need to use a special function `serializeNativeFunction` add pass the native function path to serialize native functions. Native functions will be prefixed with `<FUNCTION><NATIVE>`.

```typescript
try {
  serialized = funkify.serialize(now);
} catch (e) {
  if (e instanceof InvalidFunctionException) {
    serialized = funkify.serializeNativeFunction('Date.now');
  } else {
    throw e;
  }
}

assert.equal(now, funkify.deserializeNativeFunction<typeof now>(serialized));
```

Or you can wrap the native function with a custom function and serialize the custom function.

```typescript
const now = () => Date.now();

const serialized = funkify.serialize(now);
const deserialized = funkify.deserialize<typeof now>(serialized);
```

### Serialize class instance

```typescript
class Hello {
  constructor(private name: string) {}

  hello() {
    return `Hello ${this.name}`;
  }
}

const obj = new Hello('world');

const serialized = funkify.serialize({
  ...obj,
  hello: obj.hello,
});

const deserialized = funkify.deserialize<typeof obj>(serialized);
```

### Serialize class

```typescript
const serialized = funkify.serialize(Hello);

const NewHello = funkify.deserialize<typeof Hello>(serialized);

assert.equal(Hello.toString(), NewHello.toString());
assert.equal(new Hello('world').hello(), new NewHello('world').hello());
```

See more examples at [examples](https://github.com/HanMoeHtet/funkify/tree/main/app/src/examples).

## Caveats

The following deserialized function will throw error because the scope of `name` variable is lost when serialized.

```typescript
const name = 'world';
const hello = () => `Hello ${name}`;

const serialized = funkify.serialize(hello);
const deserialized = funkify.deserialize<typeof hello>(serialized);
```

## Development

1. Clone the repository
2. Run the following command to install local package in the app directory.

```bash
yarn link && yarn --cwd app link @han-moe-htet/funkify
```

3. Run the following command to run the app.

```bash
yarn app
```
