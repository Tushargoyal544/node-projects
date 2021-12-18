module.exports = lookupReducer

var pluck = require('pluck')
var through = require('through')

function lookupReducer (hash, onCollision) {
  if (typeof hash != 'function') { hash = pluck(hash || 'id') }
  onCollision = onCollision || 'last';
  return reducers[onCollision](hash)
}

lookupReducer.reduce = function (items, propertyName, onCollision) {
  return items.reduce(lookupReducer(propertyName, onCollision), {})
}

lookupReducer.writableStream = function (hash, onCollision, callback) {
  if (!callback) {
    callback = onCollision
    onCollision = null
  }
  if (!callback) {
    callback = hash
    hash = null
  }
  var r = lookupReducer(hash, onCollision)
  var m = {};
  return through(function (o) { r(m, o) }, function () { callback(m) })
}

var reducers = {
  first: function (hash) {
    return keepFirst
    function keepFirst (mapping, object) {
      var key = hash(object)
      if (!mapping.hasOwnProperty(key)) {
        mapping[key] = object
      }
      return mapping
    }
  },

  last: function (hash) {
    return keepLast
    function keepLast (mapping, object) {
      mapping[hash(object)] = object
      return mapping
    }
  },

  concat: function (hash) {
    var arrayified = {}
    return concatDuplicates
    function concatDuplicates (mapping, object) {
      var key = hash(object)
      if (!mapping.hasOwnProperty(key)) {
        mapping[key] = object
      } else {
        if (arrayified[key]) {
          mapping[key].push(object)
        } else {
          mapping[key] = [mapping[key], object]
          arrayified[key] = true
        }
      }
      return mapping
    }
  },

  array: function (hash) {
    return function arrayify (mapping, object) {
      var key = hash(object);
      if (!mapping.hasOwnProperty(key)) {
        mapping[key] = [];
      }
      mapping[key].push(object);
      return mapping;
    }
  }
}
