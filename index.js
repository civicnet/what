"use strict";

const GeneratorFunction = (function * gen(){ return gen.constructor; })().next().value;

function template(...data) {
  return this.reduce((a, t) => {
    if (t instanceof GeneratorFunction) {
      for (const f of t.call(...data)) { try { a += `${f || ''}` } catch (e) { } }
      return a;
    }
    if (t instanceof Function) {
      try { return a + `${t.call(...data) || ''}`; } catch (e) { return a; }
    }
    return a + t;
  }, '');
}

function walk(path) {
  let cursor = this;
  for (let s of path) { cursor = (cursor || {})[s]; }
  return cursor;
}

function compile(source = '') {
  try { source = `${source}` } catch (e) { source = ''; }
  let tokens = [], collect = tokens, wants = {};

  function want(op, key, count) {
    wants[op] = (wants[op] || {}); 
    wants[op][key] = (count === undefined) ? true : ((wants[op][key] || 0) + count);
  }

  class Immediate extends Function { /* $ */ 
    constructor(op, body) {
      const literal = (l) => JSON.stringify(l);
      const field   = (f) => (want(op, f), `(this['${op}'] || {})[${literal(f)}]`);
      const token   = (t) => ((t[0] === op) ? field(t.substring(1)) : literal(t));

      super(`return ${`${op}${body}`.split('|').map(token).join('||')};`);
    }
  }
  
  class Action extends Function { /* # ~ */ 
    constructor(op, body) {
      wants[op] = (wants[op] || {}); wants[op][body] = true;

      super(`return (this['${op}'] || {})[${JSON.stringify(body)}]`);
    }
  }

  class Tags extends Action { /* : % / */ 
    constructor(op, body) {
      super(op, `${op}${body}`);
    }
  }

  const Not = Symbol('Not');
  
  class Tail extends Function { /* @ */ 
    constructor(op, body) {
      if (!body) { collect = tokens; super(`return '';`); return this; }
      
      const [ search, , count ] = body.split(/:(?!(.*:))/);
      const [ root, ...path ]   = search.split('.');

      if (root) {
        const max = (count === '0') ? 0 : (parseInt(count) || 1);
        want(op, search, max);

        const local = []; collect = local;

        function each() {
          return function * () {
            let sel = walk.call(this, [ op, root, ...path]);

            if (Array.isArray(sel)) {
              let split = Math.min(sel.length, max);
              if (split) {
                for (let i = 0; i < split; ++i) { yield template.call(local, this, sel.shift()); }
              }
              else if (local[Not] instanceof Function) { yield local[Not].call(this); }
              else { yield ''; }
              return;
            }

            if (sel && (sel.constructor === GeneratorFunction.prototype)) {
              let count;
              for (count = 0; count < max; ++count) {
                try {
                  let w = sel.next(); if (w.done) { break; } 
                  yield template.call(local, this, w.value);
                }
                catch (e) {
                  yield '';
                }
              }
              if (!count) {
                if (local[Not] instanceof Function) { yield local[Not].call(this); }
                else { yield ''; }
              }
              return;
            }

            if (!sel) {
              if (local[Not] instanceof Function) { yield local[Not].call(this); }
              return;
            }

            yield template.call(local, sel, sel);
          };
        }

        super('return this();');
        return this.call(each);
      } // !root

      if (path.length) {
        function get() {
          return (item) => {
            try { return `${walk.call(item, path) || ''}`; } catch (e) { return ''; }
          };
        }

        super('return this();');
        return this.call(get);
      }
      
      const local = []; collect = local;

      function repeat() {
        const times = (count === '0') ? 0 : (parseInt(count) || 1);

        return function * () {
          for (let i = 0; i < times; ++i) {
            yield template.call(local);
          }
        };
      }

      super('return this();');
      return this.call(repeat);
    }
  }

  class Else extends Function { /* ! */
    constructor() {
      const local = [], target = collect; collect = local;

      function not() {
        return function () {
          return template.call(local, this);
        };
      }

      super('return this();');
      target[Not] = this.call(not);
      return () => '';
    }
  }

  const scan = /\[(\$|#|~|:|%|\/|@|!|&)(.*?)\]/g;
  let last = 0;
  for (let found = scan.exec(source); found; found = scan.exec(source)) {
    const [ tag, op, body ] = found;
    let target = collect, token;

    switch (op) {
      case '$' : token = new Immediate(op, body); break;

      case '#' : token = new Action(op, body); break;
      case '~' : token = new Action(op, body); break;

      case ':' : token = new Tags(op, body); break;
      case '%' : token = new Tags(op, body); break;
      case '/' : token = new Tags(op, body); break;

      case '@' : token = new Tail(op, body); break;
      case '&' : token = new Tail(op, body); break;
      case '!' : token = new Else(op, body); break;
    }

    target.push(source.substring(last, scan.lastIndex - tag.length));
    target.push(token);

    last = scan.lastIndex;
  }

  collect.push(source.substring(last));

  return Object.assign(template.bind(tokens), { wants });
}

compile.consumable = function consumable(value) {
   return Array.isArray(value) || (!!value && value.constructor === GeneratorFunction.prototype);
}

module.exports = compile;
