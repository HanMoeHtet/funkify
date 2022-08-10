import assert from 'assert';
import { Funkify } from '@han-moe-htet/funkify';

const funkify = new Funkify();

class Hello {
  constructor(private name: string) {}

  hello() {
    return `Hello ${this.name}`;
  }
}

const serialized = funkify.serialize(Hello);

const NewHello = funkify.deserialize<typeof Hello>(serialized);

assert.equal(Hello.toString(), NewHello.toString());
assert.equal(new Hello('world').hello(), new NewHello('world').hello());
