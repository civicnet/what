module.exports =  () => ({
  '&': {
    sequence: (function * () { while (true){ yield { value: '*' }; } })()
  }
});
