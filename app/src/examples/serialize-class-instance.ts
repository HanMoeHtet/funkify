import assert from 'assert';
import { Funkify } from '@han-moe-htet/funkify';

const funkify = new Funkify();

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

assert.equal(obj.hello(), deserialized.hello());
