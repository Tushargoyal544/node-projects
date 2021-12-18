# lookup

[![browser support](https://ci.testling.com/grncdr/js-lookup.png)](https://ci.testling.com/grncdr/js-lookup)

## API

### module.exports = function lookup (hash=pluck("id"), onCollision="last")

`lookup` creates a reducing function (suitable for passing to `Array.prototype.reduce` or [reducible](https://npm.im/reducible)) that builds a lookup table using the provided hash function. The function returned looks something like this:

```javascript
function reducer (mapping, object) {
  mapping[hash(object)] = object
  return mapping
}
```
#### Creating a lookup on a property.

When the `hash` parameter is a string, the corresponding property name will be used as the hash value of each object. E.g. `lookup('name')` will return a hash function something like this:

```javascript
function reducer (mapping, object) {
  mapping[object['name']] = object
  return mapping
}
```

#### Collision Handling

The second parameter to `lookup` determines what happens when two objects have the same hash value. There are currently 4 options:

 - `'last'` - This is the default. If an object hashes to a key that is already used, the old value is overwritten.
 - `'first'` - The opposite of `'last'`. If an object hashes to a key that is already used, the new value is discarded.
 - `'array'` - Keep all values for each object in the order they appeared. The values in the final mapping will alway be arrays.
 - `'concat'` - Keep all values for each object in the order they appeared. If a key was only seen once, it won't be wrapped in an array.

### lookup.reduce(arr, hash=pluck("id"), onCollision="last")

A short-hand way of writing `arr.reduce(lookup(hash, onCollision), {})`.

### lookup.writableStream(hash=pluck("id"), onCollision="last", callback)

Returns a writable stream that will use the reducer function to aggregate objects written to it into a single mapping. While the first two arguments are optional a callback must be provided. The callback will be called with the complete lookup table when the source stream ends.

## License

BSD (2 clause)
