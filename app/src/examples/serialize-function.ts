import assert from 'assert';
import { Funkify } from '@han-moe-htet/funkify';

const funkify = new Funkify();

const hello = (name: string) => `Hello ${name}`;

const serialized = funkify.serialize(hello);

const deserialized = funkify.deserialize<typeof hello>(serialized);

assert.equal(hello('world'), deserialized('world'));
