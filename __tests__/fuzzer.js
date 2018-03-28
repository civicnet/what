"use strict";

const compile = require('../index');

const Relevant = [
  '', '\0', ' ', 'plain', '$value', '\u2665',
  'nested.property.with.somewhat.long.path.specifier',
  '[', ']', '$', '_', '#', '~', ':', '%', '@', '&', '!', '/', '|', '.'
];

// eslint-disable-next-line no-sparse-arrays, array-bracket-newline
const Anything = [ ,
  undefined, null,
  false, true,
  NaN, -Infinity, +Infinity, 0, 1, Math.PI, Number(42),
  'constructor', 'prototype',
  [], {}, new Error(), new Function(), // eslint-disable-line no-new-func
  async function () { throw new Error(); },
  (function * () { throw new Error(); })()
].concat(Relevant);

// eslint-disable-next-line max-params
function fuzz(noise, level, prefix = '', suffix = '') {
  if (!level) {
    expect(compile(prefix + suffix)).toBeInstanceOf(Function);
    return;
  }

  for (const value of noise) {
    fuzz(noise, level - 1, prefix + value, suffix);
  }
}

describe('Anything', () => {
  const depth = 2;

  test(`${Anything.length} ** ${depth}`, () => {
    fuzz(Anything, depth);
  });
});

describe('Relevant', () => {
  const depth = 3;

  test(`${Relevant.length} ** ${depth}`, () => {
    fuzz(Relevant, depth);
  });
});

describe('Syntax', () => {
  const depth = 4;

  test(`${Relevant.length} ** ${depth}`, () => {
    fuzz(Relevant, depth, '[', ']');
  });
});
