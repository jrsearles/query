Using query.js
--------------
Query.js makes heavy use of functional parameters in order to filter data or transform the queried data into new forms. These functions can be categorized as `predicates`, `projectors`, `comparers` and `sorters`, `joiners` and `appliers`, and `key` functions.

- *Predicate Functions*: A function that takes the current item and index as parameters and returns a boolean indicating whether the item passes the given criteria.  These functions are used for filtering or limiting results.  Example:

```javascript
var query = Query.from([
  { firstName: "John", lastName: "Doe", status: "married", id: 1 }, 
  { firstName: "Jane", lastName: "Doe", status: "married", id: 2 }, 
  { firstName: "Joe", lastName: "Smith", status: "single", id: 3 },
  { firstName: "Joseph", lastName: "Smith", status: "single", id: 3 }
]); 

// find all people with the last name 'Doe'
var predicate = function(item, index) { return item.lastName === "Doe"; };
var does = query.where(predicate);

// results: 
// { firstName: "John", lastName: "Doe", id: 1 }, 
// { firstName: "Jane", lastName: "Doe", id: 2 }
``` 

- *Projector Functions*: A function that takes the current item and index as parameters and returns a modified version of the object passed in.  These can be used to transform the queried elements into new forms.  (In cases when merging queries projector functions can be optional. When not specified, query.js will merge the joined objects together.)  Example:

```javascript
// get full name for each person
var projector = function(item, index) { return item.firstName + ' ' + item.lastName; };
var fullNames = query.select(projector);

// results: 'John Doe', 'Jane Doe', 'Joe Smith', 'Joseph Smith'
```

- *Comparison Functions*: A function that takes two objects and compares them, returning a boolean indicating whether the items are considered *equal*. (Query.js uses a fairly robust internal comparer that will scan complex objects and compare each property to determine equality. Comparer functions are always optional, though if you have unique comparisons these can be useful.)  Example:

```
// limit query to distinct ids
var comparer = function(a, b) { return a.id === b.id; };
var unique = query.distinct(comparer);

// results: 
// { firstName: "John", lastName: "Doe", id: 1 },  
// { firstName: "Jane", lastName: "Doe", id: 2 }, 
// { firstName: "Joseph", lastName: Smith", id: 3 }
```

- *Sort Functions*: A type of `comparer` function that not only checks for equality but also ranks the compared objects.  A sorter function takes two items and returns a result of `0` indicating equality, a `positive number` indicates that the first item is `greater than` the second item, a `negative number` indicates that the first item is `less than` the second item.  Example:

```javascript
// display unmarried people first
var sorter = function(a, b) {
  if (a.status === "married" && b.status !== "married") {
    return 1;
  }	

  if (a.status !== "married" && b.status === "married") {
    return -1;
  }

  // statuses are equivalent, sort by last names
  return a.lastName.localeCompare(b.lastName);
};

var sorted = query.orderBy(sorter);

// results: 
// { firstName: "Joe", lastName: "Smith", status: "single", id: "3" }, 
// { firstName: "Joseph", lastName: "Smith", status: "single", id: "3" }, 
// { firstName: "John", lastName: "Doe", status: "married", id: "1" }, 
// { firstName: "Jane", lastName: "Doe", status: "married", id: "2" }
```

- *Join Functions*: A function that takes in two objects and returns a boolean indicating whether the two objects should be joined.

```javascript
var pets = Query.from([
  { name: "Otto", ownerID: 1 },
  { name: "Maya", ownerID: 2 },
  { name: "Bailee", ownerID: 2 }
]);

// join owners to pets
var joiner = function(person, pet) { return person.id === pet.ownerID; };
var projector = function(person, pet) { 
	return { owner: person.firstName + ' ' + person.lastName, pet: pet.name }; 
};

var petOwners = query.join(pets, joiner, projector);

// results: 
// { owner: "John Doe", pet: "Otto" }, 
// { owner: "Jane Doe", pet: "Maya" }, 
// { owner: "Jane Doe", pet: "Bailee" }
```

- *Applier Function*: A type of *join* function which takes in a single object and based on the object passed in will return an object or an array (or query) of objects which will be merged with the object using a *projector* function. (If no result is defined, the object could be omitted from the results based on the type of join being used.)

```javascript
var applier = function (person, index) { 
  return { hasPets: pets.any(function(pet) { return pet.ownerID === person.id; }) }; 
};
var owners = query.crossApply(applier);

// results:
// { firstName: "John", lastName: "Doe", status: "married", id: 1, hasPets: true }, 
// { firstName: "Jane", lastName: "Doe", status: "married", id: 2, hasPets: true }, 
// { firstName: "Joe", lastName: "Smith", status: "single", id: 3, hasPets: false },
// { firstName: "Joseph", lastName: "Smith", status: "single", id: 3, hasPets: false }
```

- *Key Functions*: A function that will return a key value for the purpose of grouping data.

```javascript
var keyFn = function (o) { return o.owner; };
var owners = petOwners.groupBy(keyFn);

// results: 
// { key: "John Doe", items: [{ owner: "John Doe", pet: "Otto" }] }, 
// { key: "Jane Doe", items: [{ owner: "Jane Doe", pet: "Maya" }, { owner: "Jane Doe", pet: "Bailee" }] }
```

