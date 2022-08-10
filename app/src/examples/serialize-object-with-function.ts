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
