/**
* This makes it possible to JSON.stringify an Error
* We need this because we use good-file and good-loggly
* that don't take into Error objects into account 
*/
Object.defineProperty(Error.prototype, 'stack', {
  configurable: true,
  enumerable: true
})
