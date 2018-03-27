/* eslint-disable max-lines, key-spacing, sort-keys */

"use strict";

const compile = require('../index');

const EmptyString = ''.slice(0, 0);

// eslint-disable-next-line no-sparse-arrays, array-bracket-newline
const Anything = [ ,
  undefined, null,
  false, true,
  NaN, -Infinity, +Infinity, 0, 1, Math.PI, Number(42),
  '', '\0', ' ', 'A', 'B', '\u2665', String(),
  'constructor', 'prototype',
  Symbol(), Symbol('Sym'), // eslint-disable-line symbol-description
  [], {}, this, Object, Object.create(null), new Error(),
  new Function(), () => { }, // eslint-disable-line no-new-func, no-empty-function
  function () { }, async function () { }, // eslint-disable-line no-empty-function
  function * () { }, (function * () { })() // eslint-disable-line no-empty-function
];

it('exists', () => {
  expect(compile).toBeInstanceOf(Function);
  expect(compile.consumable).toBeInstanceOf(Function);
});

it('compiles', () => {
  expect(compile()).toBeInstanceOf(Function);
  expect(compile()).not.toBe(compile());

  for (const any of Anything) {
    expect(compile(any)).toBeInstanceOf(Function);

    expect(typeof compile.consumable(any)).toBe(typeof Boolean(any));
    expect(compile.consumable(any)).toBe(Boolean(any) && compile.consumable(any));
  }
});

it('guarantees', () => {
  expect(compile()()).toBe(EmptyString);

  expect(Object.keys(compile().wants)).toHaveLength(0);

  for (const any of Anything) {
    expect(compile()(any)).toBe(EmptyString);
    expect(compile(EmptyString)(any)).toBe(EmptyString);
  }
});

it('holds', () => {
  for (const any of Anything) {
    expect(compile()(any)).toMatchSnapshot();
    expect(compile(any)(any)).toMatchSnapshot();
    expect(compile(any)()).toMatchSnapshot();
  }
});

describe('immediate', () => {
  const Basic    = '[$value]';
  const Default  = '[$value|Default]';
  const Multiple = '[$value|$other]';
  const Full     = '[$value|$other|Default]';

  const Immediate = [ Basic, Default, Multiple, Full ];

  it('compiles', () => {
    for (const i of Immediate) {
      expect(compile(i)).toBeInstanceOf(Function);
    }
  });

  describe('guarantees', () => {
    function first(...args) {
      try       { return `${args.reduce((r, a) => (r || a)) || EmptyString}`; }
      catch (e) { return EmptyString; }
    }

    test('Basic', () => {
      const template = compile(Basic);

      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants)).toHaveLength(1);
      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants['$'])).toHaveLength(1);
      expect(template.wants['$'].value).toBeTruthy();

      expect(template()).toBe(EmptyString);

      for (const value of Anything) {
        expect(template({ '$': { value } })).toBe(first(value));
      }
    });

    test('Default', () => {
      const template = compile(Default);
      
      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants)).toHaveLength(1);
      expect(template.wants['$']).toBeInstanceOf(Object);
      expect(Object.keys(template.wants['$'])).toHaveLength(1);
      expect(template.wants['$'].value).toBeTruthy();

      expect(template()).toBe('Default');

      for (const value of Anything) {
        expect(template({ '$': { value } })).toBe(first(value, 'Default'));
      }
    });

    test('Multiple', () => {
      const template = compile(Multiple);

      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants)).toHaveLength(1);
      expect(template.wants['$']).toBeInstanceOf(Object);
      expect(Object.keys(template.wants['$'])).toHaveLength(2);
      expect(template.wants['$'].value).toBeTruthy();
      expect(template.wants['$'].other).toBeTruthy();

      expect(template()).toBe(EmptyString);

      for (const value of Anything) {
        expect(template({ '$': { value } })).toBe(first(value));

        for (const other of Anything) {
          expect(template({ '$': { other } })).toBe(first(other));
          expect(template({ '$': { other, value } })).toBe(first(value, other));
        }
      }
    });

    test('Full', () => {
      const template = compile(Full);

      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants)).toHaveLength(1);
      expect(template.wants['$']).toBeInstanceOf(Object);
      expect(Object.keys(template.wants['$'])).toHaveLength(2);
      expect(template.wants['$'].value).toBeTruthy();
      expect(template.wants['$'].other).toBeTruthy();

      expect(template()).toBe('Default');

      for (const value of Anything) {
        expect(template({ '$': { value } })).toBe(first(value, 'Default'));

        for (const other of Anything) {
          expect(template({ '$': { other } })).toBe(first(other, 'Default'));
          expect(template({ '$': { other, value } })).toBe(first(value, other, 'Default'));
        }
      }
    });

    test('others', () => {
      expect(compile('[$value|Default|Comment]')()).toBe('Default');
      
      for (const value of Anything) {
        expect(compile('[$]')({ '$': { '': value } })).toBe(first(value));
        expect(compile('[$ ]')({ '$': { ' ' : value } })).toBe(first(value));
        expect(compile('[$$]')({ '$': { '$' : value } })).toBe(first(value));
      }
    });
  });

  it('holds', () => {
    for (const i of Immediate) {
      const template = compile(i);

      expect(template()).toMatchSnapshot();

      for (const value of Anything) {
        expect(template({ value })).toMatchSnapshot();

        for (const other of Anything) {
          expect(template({ other        })).toMatchSnapshot();
          expect(template({ other, value })).toMatchSnapshot();
        }
      }
    }
  });
    
  it('errors', (done) => {
    expect.assertions(Immediate.length * Anything.length);

    for (const i of Immediate) {
      const template = compile(i);

      for (const err of Anything) {
        const data = { get value() { throw err; } };

        try {
          template({ '$': data });
          done.fail('Did not throw');
        }
        catch (e) {
          expect(e).toBe(err);
        }
      }
        
      done();
    }
  });
});

describe('action', () => {
  const Actions = {
    '[#]' : [ '#', EmptyString ],
    '[~]' : [ '~', EmptyString ],

    '[# ]' : [ '#', ' ' ],
    '[~ ]' : [ '~', ' ' ],

    '[#value]' : [ '#', 'value' ],
    '[~value]' : [ '~', 'value' ],
  
    '[##]' : [ '#', '#' ],
    '[#~]' : [ '#', '~' ],
    '[~~]' : [ '~', '~' ],
    '[~#]' : [ '~', '#' ]
  };

  it('compiles', () => {
    for (const [ t ] of Object.entries(Actions)) {
      expect(compile(t)).toBeInstanceOf(Function);
    }
  });

  it('guarantees', () => {
    const same = (value) => compile('[$]')({ '$': { '': value } });

    for (const [ t, [ op, key ] ] of Object.entries(Actions)) {
      const template = compile(t);
      
      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants)).toHaveLength(1);
      expect(template.wants[op]).toBeInstanceOf(Object);
      expect(Object.keys(template.wants[op])).toHaveLength(1);
      expect(template.wants[op][key]).toBeTruthy();

      expect(template()).toBe(same());

      for (const value of Anything) {
        expect(template({ [op]: { [key]: value } })).toBe(same(value));
      }
    }
  });

  it('holds', () => {
    for (const [ t, [ op, key ] ] of Object.entries(Actions)) {
      const template = compile(t);

      expect(template()).toMatchSnapshot();

      for (const value of Anything) {
        expect(template({ [op]: { [key]: value } })).toMatchSnapshot();
      }
    }
  });

  it('errors', (done) => {
    for (const [ t, [ op, key ] ] of Object.entries(Actions)) {
      const template = compile(t);

      for (const err of Anything) {
        const data = { get [key]() { throw err; } };

        try {
          template({ [op]: data });
          done.fail('Did not throw');
        }
        catch (e) {
          expect(e).toBe(err);
        }
      }
    }
    
    done();
  });
});

describe('tag', () => {
  const Basic = {
    '[:]' : [ ':', ':' ],
    '[%]' : [ '%', '%' ],
    '[/]' : [ '/', '/' ],

    '[:value]' : [ ':', ':value' ],
    '[%value]' : [ '%', '%value' ],
    '[/value]' : [ '/', '/value' ],
    
    '[:value:other]' : [ ':', ':value:other' ],
    '[%value%other]' : [ '%', '%value%other' ],
    '[/value/other]' : [ '/', '/value/other' ]
  };

  const Mixed = {
    '[:%]'  : [ ':', ':%'  ],
    '[:/]'  : [ ':', ':/'  ],
    '[:/%]' : [ ':', ':/%' ],
    '[:%/]' : [ ':', ':%/' ],

    '[%:]'  : [ '%', '%:'  ],
    '[%/]'  : [ '%', '%/'  ],
    '[%/:]' : [ '%', '%/:' ],
    '[%:/]' : [ '%', '%:/' ],

    '[/:]'  : [ '/', '/:'  ],
    '[/%]'  : [ '/', '/%'  ],
    '[/%:]' : [ '/', '/%:' ],
    '[/:%]' : [ '/', '/:%' ]
  };

  const Tags = Object.assign({}, Basic, Mixed);

  it('compiles', () => {
    for (const [ t ] of Object.entries(Tags)) {
      expect(compile(t)).toBeInstanceOf(Function);
    }
  });

  it('guarantees', () => {
    const same = (value) => compile('[$]')({ '$': { '': value } });

    for (const [ t, [ op, key ] ] of Object.entries(Tags)) {
      const template = compile(t);

      expect(template.wants).toBeInstanceOf(Object);
      expect(Object.keys(template.wants)).toHaveLength(1);
      expect(template.wants[op]).toBeInstanceOf(Object);
      expect(Object.keys(template.wants[op])).toHaveLength(1);
      expect(template.wants[op][key]).toBeTruthy();

      expect(template()).toBe(same());

      for (const value of Anything) {
        expect(template({ [op]: { [key]: value } })).toBe(same(value));
      }
    }
  });

  it('holds', () => {
    for (const [ t, [ op, key ] ] of Object.entries(Tags)) {
      const template = compile(t);

      expect(template()).toMatchSnapshot();

      for (const value of Anything) {
        expect(template({ [op]: { [key]: value } })).toMatchSnapshot();
      }
    }
  });

  it('errors', (done) => {
    for (const [ t, [ op, key ] ] of Object.entries(Tags)) {
      const template = compile(t);

      for (const err of Anything) {
        const data = { get [key]() { throw err; } };

        try {
          template({ [op]: data });
          done.fail('Did not throw');
        }
        catch (e) {
          expect(e).toBe(err);
        }
      }
    }
    
    done();
  });
});

describe('tail', () => {
  const Basic = {
    '[@ ][@.]' : [ '@', ' ' ],
    '[& ][&.]' : [ '&', ' ' ],

    '[@value][@.]' : [ '@', 'value' ],
    '[&value][&.]' : [ '&', 'value' ]
  };

  const Scoped = {
    '[@path.to.value][@.]' : [ '@', 'path', 'to', 'value' ],
    '[&path.to.value][&.]' : [ '&', 'path', 'to', 'value' ]
  };
  
  const Tails = Object.assign({}, Basic, Scoped);

  it('compiles', () => {
    for (const [ t ] of Object.entries(Tails)) {
      expect(compile(t)).toBeInstanceOf(Function);
    }
  });

  describe('guarantees', () => {
    const same = (value) => compile('[$]')({ '$': { '': value } });

    test('property', () => {
      const ref = compile('[@path.value][@.sub.prop]');
      const bad = compile('[&path.value][&.wrong.way]');

      for (const value of Anything) {
        expect(ref({ '@': { path: { value: [ { sub: { prop: value } } ] } } })).toBe(same(value));
        expect(bad({ '&': { path : { value } } })).toBe(EmptyString);
      }
    });

    test('control', () => {
      for (const [ input, output ] of Object.entries({
        'always [@]produces [&]output'         : 'always produces output',
        '[!]empty'                             : EmptyString,
        '[@]hides [!]some [@]things'           : 'hides things',
        '[&]things[!] never[@] hide[!] anyway' : 'things hide',
        'precisely[@:] once'                   : 'precisely once',
        'never[@:0] shown'                     : 'never',
        'repeats[&:3] more'                    : 'repeats more more more'
      })) {
        const template = compile(input);
      
        expect(Object.keys(template.wants)).toHaveLength(0);

        expect(template()).toBe(output);
      }

      for (const [ t, [ op, ...key ] ] of Object.entries(Tails)) {
        const template = compile(t);
        
        let tail;
        const data = key.reduceRight((child, parent) => ({ [parent] : child }), tail);
        
        expect(compile.consumable(tail)).toBe(false);
        expect(template({ [op]: data })).toBe(same());

        for (const value of Anything) {
          const tail = { '': value };
          const data = key.reduceRight((child, parent) => ({ [parent] : child }), tail);
          
          expect(compile.consumable(tail)).toBe(false);
          expect(template({ [op]: data })).toBe(same(value));
        }
      }

      for (const value of Anything) {
        const input  = 'always [@value]TRUE[!]FALSE[@], really';
        const output = `always ${value?'TRUE':'FALSE'}, really`; // eslint-disable-line space-infix-ops

        const template = compile(input);

        expect(Object.keys(template.wants)).toHaveLength(1);
        expect(template.wants['@']).toBeInstanceOf(Object);
        expect(Object.keys(template.wants['@'])).toHaveLength(1);
        expect(template.wants['@'].value).toBe(1);

        !compile.consumable(value) && expect(template({ '@': { value } })).toBe(output);
      }
      
      for (const value of Anything) {
        const input  = 'always [&value:0]TRUE[!]FALSE[!]NEVER[&], really';
        const output = `always FALSE, really`;

        const template = compile(input);

        expect(Object.keys(template.wants)).toHaveLength(1);
        expect(template.wants['&']).toBeInstanceOf(Object);
        expect(Object.keys(template.wants['&'])).toHaveLength(1);
        expect(template.wants['&'].value).toBe(0);

        !compile.consumable(value) && expect(template({ '@': { value } })).toBe(output);
      }
      
      for (const value of Anything) {
        const input  = 'always [@value]TRUE[!]FALSE[&], really';
        const output = `always FALSE, really`;

        const template = compile(input);

        expect(Object.keys(template.wants)).toHaveLength(1);
        expect(template.wants['@']).toBeInstanceOf(Object);
        expect(Object.keys(template.wants['@'])).toHaveLength(1);
        expect(template.wants['@'].value).toBe(1);

        // eslint-disable-next-line no-empty-function
        !compile.consumable(value) && expect(template({ '@': { value: (function * () { })() } })).toBe(output);
      }
    });

    test('wants', () => {
      for (const [ input, output ] of Object.entries({
        '[!none]' : {},

        '[@path] [@path.to.value]' : { '@': { 'path': 1, 'path.to.value': 1 } },
        '[@path:containing:parts]' : { '@': { 'path:containing': 1 } },
        '[@:2] [@coerce:3.45]'     : { '@': { 'coerce': 3 } },

        '[&one:1] [@none:0]'           : { '@': { none: 0 },    '&': { one: 1 } },
        '[@default:] [&default:value]' : { '@': { default: 1 }, '&': { default: 1 } },
        '[&some] [@other] [&value]'    : { '@': { other: 1 },   '&': { some: 1, value: 1 } },
        '[@more:3] [&more:2] [@more]'  : { '@': { more: 4 },    '&': { more: 2 } }
      })) {
        expect(compile(input).wants).toEqual(output);
      }
    });

    test('arrays', () => {
      for (const [ t, [ op, ...key ] ] of Object.entries(Tails)) {
        const template = compile(t);
        
        const tail = [];
        const data = key.reduceRight((child, parent) => ({ [parent] : child }), tail);
        
        expect(compile.consumable(tail)).toBe(true);
        expect(template({ [op]: data })).toBe(same());
        expect(tail).toHaveLength(0);

        for (const value of Anything) {
          const tail = [ { '': value } ];
          const data = key.reduceRight((child, parent) => ({ [parent] : child }), tail);
          
          expect(compile.consumable(tail)).toBe(true);
          expect(template({ [op]: data })).toBe(same(value));
          expect(tail).toHaveLength(0);
        }
      }
    });

    test('generators', () => {
      const live = (function * () { yield; throw new Error(); })();

      function run() { compile('[@stream]')({ '@': { stream: live } }); }

      expect(compile.consumable(live)).toBe(true);
      expect(run).not.toThrow();
      expect(run).toThrow();

      for (const [ t, [ op, ...key ] ] of Object.entries(Tails)) {
        const template = compile(t);

        // eslint-disable-next-line no-empty-function
        const live = (function * () { })(); 
        const data = key.reduceRight((child, parent) => ({ [parent] : child }), live);
        
        expect(compile.consumable(live)).toBe(true);
        expect(template({ [op]: data })).toBe(same());
        expect(live.next().done).toBeTruthy();

        for (const value of Anything) {
          const live = (function * () { yield { '': value }; })();
          const data = key.reduceRight((child, parent) => ({ [parent] : child }), live);
          
          expect(compile.consumable(live)).toBe(true);
          expect(template({ [op]: data })).toBe(same(value));
          expect(live.next().done).toBeTruthy();
        }

        for (const err of Anything) {
          const live = (function * () { throw err; })();
          const data = key.reduceRight((child, parent) => ({ [parent] : child }), live);
          
          expect(compile.consumable(live)).toBe(true);
          try { template({ [op]: data }); } catch (e) { expect(e).toBe(err); }
        }
      }
    });
  });

  it('holds', () => {
    for (const [ t, [ op, ...key ] ] of Object.entries(Tails)) {
      const template = compile(t);

      expect(template()).toMatchSnapshot();

      for (const value of Anything) {
        expect(template({ [op]: { [key]: value } })).toMatchSnapshot();
      }
    }
  });

  describe('errors', () => {
    test('property', (done) => {
      const safe = compile('[&value:0][&.prop]');
      const bail = compile('[&value][&.prop]');

      for (const err of Anything) {
        const data = () => ({ value: [ { get prop() { throw err; } } ] });

        expect(safe({ '&': data() })).toBe(EmptyString);

        try {
          bail({ '&': data() });
          done.fail('Did not throw');
        }
        catch (e) {
          expect(e).toBe(err);
        }
      }

      done();
    });

    test('control', (done) => {
      for (const err of Anything) {
        try {
          compile('[@value]')({ '@': { get value() { throw err; } } });
          done.fail('Did not throw');
        }
        catch (e) {
          expect(e).toBe(err);
        }
      }

      done();
    });

    test('generators', (done) => {
      for (const [ t, [ op, ...key ] ] of Object.entries(Tails)) {
        const template = compile(t);

        for (const err of Anything) {
          const live = (function * () { throw err; })();
          const data = key.reduceRight((child, parent) => ({ [parent] : child }), live);
          
          expect(compile.consumable(live)).toBe(true);
          try {
            template({ [op]: data });
            done.fail('Did not throw');
          }
          catch (e) {
            expect(e).toBe(err);
          }
        }
      }
          
      done();
    });
  });
});
