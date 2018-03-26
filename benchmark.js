"use strict";

const compile = require('./index');

const fs   = require('fs');
const path = require('path');

const samples = path.join(__dirname, 'samples');
const time    = parseInt(process.argv[2]) || 500; // ms/test

function human(size) {
  const UNIT = [ ' \x1b[2;37mB', '\x1b[2;32mkB', '\x1b[2;36mMB', '\x1b[2;34mGB', '\x1b[2;31mTB' ];
  const exp = size ? Math.min(Math.floor(Math.log10(size) / 3), UNIT.length - 1) : 0;
  size /= Math.pow(10, 3 * exp);
  size = size.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return `${size} ${UNIT[exp]}`;
}

// eslint-disable-next-line no-console
console.log(`
┌──────────────────┬──────────────┬──────────────┬───────────┬───────────┬─────────────┐
│       Test       │   Compiled   │   Rendered   │   Input   │  Results  │  Data rate  │
├──────────────────┼──────────────┼──────────────┼───────────┼───────────┼─────────────┤`);

// eslint-disable-next-line no-sync
fs.readdirSync(samples)
  .map((f) => f.match(/^(.*)\.what$/))
  .filter((m) => (m))
  .reduce((all, [ , t ]) => {
    // eslint-disable-next-line global-require
    const input = require(path.join(samples, `${t}.in.js`));

    // eslint-disable-next-line no-sync
    const what = fs.readFileSync(path.join(samples, `${t}.what`), 'utf8');

    let insize  = Buffer.from(what, 'utf8').length;
    let outsize = Buffer.from(compile(what)(input()), 'utf8').length;
    let compiled = 0, rendered = 0;

    return all.then(() => new Promise((done) => {
      const start = new Date();

      let running = setImmediate(function run() {
        compile(what); compiled++; running = setImmediate(run);
      });

      setTimeout(() => { clearImmediate(running); compiled /= new Date() - start; done(); }, time);
    })).then(() => new Promise((done) => {
      const template = compile(what);
      const start = new Date();
      
      let running = setImmediate(function run() {
        template(input()); rendered++; running = setImmediate(run);
      });

      setTimeout(() => { clearImmediate(running); rendered /= new Date() - start; done(); }, time);
    })).then(() => {
      let through = human(1000 * outsize * rendered).padStart(16);

      compiled = parseInt(1000 * compiled).toLocaleString().padStart(8);
      rendered = parseInt(1000 * rendered).toLocaleString().padStart(8);
      insize   = human(insize).toLocaleString().padStart(16);
      outsize  = human(outsize).toLocaleString().padStart(16);


      t        = `\x1b[34m${t.padEnd(16)}`;
      compiled = `\x1b[1;36m${compiled} \x1b[2;35ms⁻¹`;
      rendered = `\x1b[1;32m${rendered} \x1b[2;35ms⁻¹`;
      insize   = `\x1b[2;37m${insize}`;
      outsize  = `\x1b[2;37m${outsize}`;
      through  = `\x1b[2;33m${through}/s`;

      const row = [ t, compiled, rendered, insize, outsize, through ];
      const BAR = '\x1b[0m│';

      // eslint-disable-next-line no-console
      console.log(`${BAR} ${row.join(` ${BAR} `)} ${BAR}`);
    });
  }, Promise.resolve())
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('└──────────────────┴──────────────┴──────────────┴───────────┴───────────┴─────────────┘\n');
  });
