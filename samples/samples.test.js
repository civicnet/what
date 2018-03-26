"use strict";

const compile = require('../index');

const fs   = require('fs');
const path = require('path');

// eslint-disable-next-line no-sync
fs.readdirSync(__dirname)
  .map((f) => f.match(/^(.*)\.what$/))
  .filter((m) => (m))
  .forEach(([ , t ]) => {
    // eslint-disable-next-line global-require
    const input = require(path.join(__dirname, `${t}.in.js`));
    
    // eslint-disable-next-line global-require
    const wants = require(path.join(__dirname, `${t}.wants.json`));
    
    // eslint-disable-next-line no-sync
    const what = fs.readFileSync(path.join(__dirname, `${t}.what`), 'utf8');
    
    // eslint-disable-next-line no-sync
    const output = fs.readFileSync(path.join(__dirname, `${t}.out`), 'utf8');

    test(t, () => {
      const template = compile(what);

      expect(template.wants).toEqual(wants);
      expect(template(input())).toBe(output);
    });
  });
