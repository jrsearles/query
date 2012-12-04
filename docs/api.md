- Instantiation: you can use the Query constructor or the static `from` method to create a query object, passing in the array to query.

```javascript
var q1 = new Query([1,2,3]);
// or use static helper
var q2 = Query.from([1,2,3]);
```

#### Filtering: ####
- `where` Filters a sequence based on a predicate function.
  - predicateFn: Function to constrain the results.

```javascript
var q = Query.from([1,2,3]).where(function(item, index) { return item > 1; });
// results: [2,3]
```

#### Aggregates: ####
- `avg` Returns the average of the query elements. 
  - projectorFn: *optional* Function to transform the items.

```javascript
var q = Query.from([1,2,3]).avg();
// results: 2
```

- `count` Returns the number of elements in a query that match a given predicate. 
  - predicateFn: *optional* Function to constrain the results.

```javascript
var q = Query.from([1,2,3]).count(function(item, index) { return item > 1; });
// results: 2
```

- `max` The maximum value of the query.
  - projectorFn: *optional* Function to transform the items.

```javascript
var q = Query.from([1,2,3]).max();
// results: 3
```

- `min` The minimum value of the query. 
  - projectorFn: *optional* Function to transform the items.

```javascript
var q = Query.from([1,2,3]).min();
// results: 1
```

- `sum` Returns the sum of elements in a query. 
  - projectorFn: *optional* Function to transform the items.

```javascript
var q = Query.from([1,2,3]).sum(function(item, index) { return item * 2; });
// results: 12
```

#### Element Operators: ####
- `elementAt` Returns the element at the specified index.
  - index: Number of the index of the element.
  - defaultItem: *optional* Object to be returned if no match is found.

```javascript
var o = Query.from([1,2,3]).elementAt(0);
// results: 1
```

- `first` Returns the first element of a query based on a predicate function. (If no predicate is specified the first element in the query is returned.)
  - predicateFn: *optional* Function to constrain the results.
  - defaultItem: *optional* Object to be returned if no match is found.

```javascript
var o = Query.from([1,2,3]).first(function(item, index) { return item > 1; });
// results: 2
```

- `last` Returns the last element of a query based on a predicate function. (If no predicate is specified the last element in the query is returned.)
  - predicateFn: *optional* Function to constrain the results.
  - defaultItem: *optional* Object to be returned if no match is found.

```javascript
var o = Query.from([1,2,3]).last(function(item, index) { return item > 1; });
// results: 3
```

- `single` Returns the matching element of a query based on a predicate function. (NOTE: Only one item should match the predicate. If multiple items match an error will be thrown.)
  - predicateFn: *optional* Function to constrain the results.
  - defaultItem: *optional* Object to be returned if no match is found.

```javascript
var o = Query.from([1,2,3]).first(function(item, index) { return item === 3; });
// results: 3
```

#### Quantifiers ####

- `all` Determines whether all elements match a given predicate function.
  - predicateFn: Function to constrain the results.

```javascript
var a = Query.from([1,2,3]).all(function(item, index) { return item > 1; });
// results: false
```

- `any` Determines whether any elements match a given predicate function.
  - predicateFn: Function to constrain the results.

```javascript
var a = Query.from([1,2,3]).any(function(item, index) { return item > 1; });
// results: true
```

- `contains` Determines whether the query contains the given element. 
  - item: Object to look for in the query.
  - comparerFn: *optional* Function to compare equality between two items.

```javascript
var a = Query.from([1,2,3]).contains(1);
// results: true
```

#### Projection Operators

- `select` Transforms the items in the query based on the projector function.
  - projectorFn: Function to transform the items.

```javascript
var names = Query
  .from([{ firstName: "Joe", lastName: "Blow" }, { firstName: "Jane", lastName: "Doe" }])
  .select(function (person) { return { name: person.firstName + " " + person.lastName; }; });

// results: { name: "Joe Blow" }, { name: "Jane Doe" }
```

- `selectMany` Flattens a one-to-many relationship based on an applier function.
  - applierFn: Function to return array to flatted.
  - projectorFn: *optional* Function to transform the items.

```javascript
var people = [
  { name: "Joe Blow", pets: [{ name: "Otto" }] },
  { name: "John Smith", pets: [{ name: "Maya" }, { name: "Bailee" }] }
];

var applier = function(person) { return person.pets; };
var projector = function(person, pet) { return { name: person.name, petName: pet.name }; };

var owners = Query.from(people).selectMany(applier, projector);

// results:
// { name: "Joe Blow", petName: "Otto" },
// { name: "John Smith", petName: "Maya" },
// { name: "John Smith", petName: "Bailee" }
```

#### Set Operators

- `concat` Concatenates two queries together.
  - items: Array or query to append.

```javascript
var a = Query.from([1,2,3]).concat([4,5,6]);
// results: [1,2,3,4,5,6]
```

- `distinct` Returns distinct results of the query.
  - comparerFn: *optional* Function to compare equality between two items.

```javascript
var a = Query.from([1,1,2,2,3,3]).distinct();
// results: [1,2,3]
```

- `except` Returns the items in the query that are not in the passed in query.
  - items: Array or query to append.
  - comparerFn: *optional* Function to compare equality between two items.

```javascript
var a = Query.from([1,2,3,4]).except([3,4,5]);
// results: [1,2]
```

- `intersect` Returns the intersection of two queries, including only those items that are in both queries.
  - items: Array or query to append.
  - comparerFn: *optional* Function to compare equality between two items.

```javascript
var a = Query.from([1,2,3,4]).intersect([3,4,5]);
// results: [3,4]
```

- `union` Combines two queries, returning the unique results. 
  - items: Array or query to append.
  - comparerFn: *optional* Function to compare equality between two items.

```javascript
var a = Query.from([1,2,3,4]).union([3,4,5]);
// results: [1,2,3,4,5]
```

#### Join Operators
- `crossApply` Projects each element in a query into a new form. The expected results are an array, with each element to be inserted into the returned query. Only items that retrieve a valid value from the apply function will be returned.
  - items: Array or query to append.
  - applyFn: Function to whose results to append to each item.
  - projectorFn: *optional* Function to transform the items.

- `crossJoin` Joins all items in the query to all items passed in.
  - items: Array or query to append.
  - projectorFn: *optional* Function to transform the items.

```javascript
var time = [1,2,3,4,5,6,7,8,9,10,11,12];
var ampm = ["am","pm"];
var projector = function (a, b) { return a + b; };
var combined = Query.from(time).crossJoin(ampm, projector);
// results: ["1am","1pm","2am","2pm","3am","3pm","4am","4pm","5am","5pm","6am","6pm","7am","7pm","8am","8pm","9am","9pm","10am","10pm","11am","11pm","12am","12pm"]
```

- `fullJoin` Joins two queries based on matching keys. Records that do not match are included from both queries.
  - items: Array or query to join.
  - joinerFn: Function to indicate which items matched.
  - projectorFn: *optional* Function to transform the items.

```javascript
var employees = [{ name: "Joe Blow", departmentID: 1 }, { name: "John Smith", departmentID: null ];
var departments = [{ name: "Marketing", id: 1 }, { name: "Sales", id: 2 }];

var joiner = function (employee, dept) { return employee.departmentID === dept.id; };

// either element can be null
var projector = function (employee, dept) { return { name: employee && employee.name, department: dept && dept.name }; };

var q = Query.from(employees).fullJoin(departments, joiner, projector);

// results:
// { name: "Joe Blow", department: "Marketing },
// { name: "John Smith", department: undefined },
// { name: undefined, department: "Sales" }
```

- `join` Joins two queries based on matching keys. Records that do not match are excluded.
  - items: Array or query to append.
  - joinerFn: Function to indicate which items matched.
  - projectorFn: *optional* Function to transform the items.

```javascript
var pets = Query.from([
  { name: "Otto", ownerID: 1 }, 
  { name: "Bailee", ownerID: 2 }, 
  { name: "Maya", ownerID: 2 }
]);

var joined = pets.join(Query.from([
  { name: "Joe Blow", id: 1 }, 
  { name: "Jane Doe", id: 2 }
]), function (a, b) { return a.ownerID === b.id; }, 
  function (a, b) { return { petName: a.name, ownerName: b.name }; });
  
// results: 
// { petName: "Otto", ownerName: "Joe Blow" }, 
// { petName: "Bailee", owerName: "Jane Doe" }, 
// { petName: "Maya", owerName: "Jane Doe" }
```

- `outerApply` Projects each element in a query into a new form. The expected results are an array, with each element to be inserted into the returned query. All items from the existing query will be returned.
  - items: Array or query to append.
  - applyFn: Function to whose results to append to each item.
  - projectorFn: *optional* Function to transform the items.

- `zip` Merges two queries in sequence, based on the projector function.
  - items: Array or query to append.
  - projectorFn: *optional* Function to transform the items.

```javascript
var q = Query.from([{ value: 1 }, { value: 2 }])
  .zip(
    [{ name: "one" }, { name: "two" }], 
    function(a, b) { return { value: a.value, name: b.name }; 
});

// results: [{ value: 1, name: "one"}, { value: 2, name: "two" }]
```

#### Partitioning

- `skip` Skips the specified number of elements, returning the remainder.
  - count: Number of items to skip.

```javascript
var q = Query.from([1, 2, 3]).skip(1);
// results: [2, 3]
```

- `skipWhile` Skips elements while the specified predicate matches.
  - predicateFn: Function to constrain the results.

```javascript
var q = Query.from([1, 2, 3]).skipWhile(function (item) { return item < 2; });
// results: [2, 3]
```

- `take` Returns the specified number of elements from the beginning of the query.
  - count: Number of items to take.

```javascript
var q = Query.from([1, 2, 3]).take(1);
// results: [1]
```

- `takeWhile` Returns elements while the specified predicate matches.
  - predicateFn: Function to constrain the results.

```javascript
var q = Query.from([1, 2, 3]).takeWhile(function (item) { return item < 2; });
// results: [1]
```

#### Grouping & Ordering

- `groupBy` Groups the items in a query by the key function. *Note: Grouping will return a query with a unique object which consists of a property `key` which will be the key value for the given group and `items` which will be an array of items that are grouped under this key.* 
  - keyFn: Function to determine key value for an item.
  - projectorFn: *optional* Function to transform the items.

```javascript
var cities = [
  { state: "MI", city: "Flint" }, 
  { state: "MI", city: "Ann Arbor" }, 
  { state: "GA", city: "Atlanta" }
];

Query.from(cities).groupBy(function (item) { return item.state; });

// results: 
// { key: "MI", items: [{ state: "MI", city: "Flint" }, { state: "MI", city: "Ann Arbor" }] }, 
// { key: "GA", items: [{ state: "GA", city: "Atlanta" }] }
```

- `orderBy` Sorts a query in the specified order.
  - sorterOrFields: Function to compare items for sorting *OR* a string of fields to sort.

```javascript
Query.from(cities)
  .orderBy(function (x, y) { return (x.state + x.city).localeCompare(y.state + y.city); });

// or

Query.from(cities).orderBy("state ASC, city ASC");

// results: 
// { state: "GA", city: "Atlanta" }, 
// { state: "MI", city: "Ann Arbor" }, 
// { state: "MI", city: "Flint" }
```

- `reverse` Reverses the query.

```javascript
Query.from([1,2,3]);
// results: [3,2,1]
```

#### Utilities

- `clone` Returns a clone of the query.

```javascript
var a = Query.from([1,2,3]).clone();
// results: [1,2,3]
```

- `defaultIfEmpty` Returns the query or the default element in a query if the query is empty.

```javascript
var a = new Query().defaultIfEmpty(0);
// results: [0]
```

- `forEach` Applies a function to each element in a query. Optionally takes an object to use as the scope (`this`) for the function to be run under.

```javascript
Query.from([1,2,3]).forEach(function(item, index) {
  console.log(item + " " + index);
});
// results:
// 1 0
// 2 1
// 3 2
```

- `sequenceEquals` Determines whether two queries are equal. Takes an optional comparer function for equality check.

```javascript
var a = Query.from([1,2,3]).sequenceEquals([1,2,3]);
// results: true
```

- `toArray` Returns the underlying array for the query.

```javascript
var a = Query.from([1,2,3]).toArray();
// results: [1,2,3]
```

- `toDictionary` Returns an object which represents a key-value-pair by the given key. *Note: An error is thrown if the key value is not unique.*
  - keyFn: Function to determine key value for an item.
  - projectorFn: *optional* Function to transform the items.

```javascript
var a = Query.from([
  { company: "Coho Vineyard", weight: 25.2, trackingNumber: "89453312L" },
  { company: "Lucerne Publishing", weight: 18.7, trackingNumber: "89112755L" },
  { company: "Wingtip Toys", weight: 6.0, trackingNumber: "299456122L" },
  { company: "Adventure Works", weight: 33.8, trackingNumber: "4665518773L" } 
]);

var d = a.toDictionary(function (o) { return o.trackingNumber; }, function (o) { return { name: o.company }; });

// results: {
//  '89453312L': { name: "Coho Vineyard" },
//  '89112755L': { name: "Lucerne Publishing" },
//  '299456122L': { name: "Wingtip Toys" },
//  '4665518773L': { name: "Adventure Works" }
// } 
```

- `toLookup` Returns the query as a lookup item. Each key will contain an array of values that match the key value.
  - keyFn: Function to determine key value for an item.
  - projectorFn: *optional* Function to transform the items.

```javascript
var lu = a.toLookup(function (o) { return o.company.charAt(0); }

// results: {
//  'C': [{ company: "Coho Vineyard", weight: 25.2, trackingNumber: "89453312L" }],
//  'L': [{ company: "Lucerne Publishing", weight: 18.7, trackingNumber: "89112755L" }],
//  'W': [{ company: "Wingtip Toys", weight: 6.0, trackingNumber: "299456122L" }],
//  'A': [{ company: "Adventure Works", weight: 33.8, trackingNumber: "4665518773L" }]
// }
```