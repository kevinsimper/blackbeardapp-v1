var migrate = require('migrate')
var fs = require('fs')
var Set = require('migrate/lib/set')

Set.prototype.save = function (fn) {
 var self = this
    , json = JSON.stringify(this);
  fs.writeFile(this.path, json, function(err){
    if (err) return fn(err);

    self.emit('save');
    fn(null);
  });
}

Set.prototype.load = function (fn) {
  this.emit('load');
  fs.readFile(this.path, 'utf8', function(err, json){
    if (err) return fn(err);
    try {
      fn(null, JSON.parse(json));
    } catch (err) {
      fn(err);
    }
  });
}

require('migrate/bin/migrate')
