import { InvalidFunctionException } from '@han-moe-htet/funkify/exceptions';
import { Funkify } from '@han-moe-htet/funkify';
import assert from 'assert';

const funkify = new Funkify();

const now = Date.now;
let serialized;

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
