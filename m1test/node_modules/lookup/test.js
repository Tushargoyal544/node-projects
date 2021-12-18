var toMapping = require('./');

var test = require('tape')
var from = require('from')

var items = [
  {id: 'Blah', sequence: 1},
  {id: 'Nah', sequence: 2},
  {id: 'What', sequence: 3},
  {id: 'Nah', sequence: 4}
]

test('defaults', function (t) {
  t.deepEqual(toMapping.reduce(items), {
    Blah: items[0],
    Nah: items[3],
    What: items[2]
  })
  t.end();
})

test('collision="first"', function (t) {
  t.deepEqual(toMapping.reduce(items, 'id', 'first'), {
    Blah: items[0],
    Nah: items[1],
    What: items[2]
  })
  t.end()
})

test('collision="concat"', function (t) {
  t.deepEqual(toMapping.reduce(items, 'id', 'concat'), {
    Blah: items[0],
    Nah: [items[1], items[3]],
    What: items[2]
  })
  t.end()
})

test('alternate property name', function (t) {
  t.deepEqual(toMapping.reduce(items, 'sequence'), {
    1: items[0],
    2: items[1],
    3: items[2],
    4: items[3],
  })
  t.end()
})

test('custom hash function', function (t) {
  var hash = function (item) { return item.sequence - 1 };
  t.deepEqual(toMapping.reduce(items, hash), {
    0: items[0],
    1: items[1],
    2: items[2],
    3: items[3],
  })
  t.end()
})

test('writableStream', function (t) {
  t.plan(1)
  from(items).pipe(toMapping.writableStream(function (mapping) {
    t.deepEqual(mapping, {
      Blah: items[0],
      Nah: items[3],
      What: items[2]
    })
  }))
})
