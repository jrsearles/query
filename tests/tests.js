
describe("When instantiating a Query", function () {
  var a = [1, 2, 3],
    q = new Query(a);

  it("should have 'items' property with passed in array", function () {
    expect(q.items instanceof Array).toBeTruthy();
  });

  it("should add array to arguments", function () {
    expect(q.items.length).toBe(3);
  });

  it("should clone the array", function () {
    expect(q.items === a).toBeFalsy();
  });

  it("should be able to instantiate with no arguments", function () {
    expect(new Query().items.length).toBe(0);
  });
});

describe("When using 'from'", function () {
  var q = Query.from([1, 2, 3]);

  it("should instantiate a Query object", function () {
    expect(q instanceof Query).toBeTruthy();
  });

  it("should have the items passed to the method", function () {
    expect(q.items.length).toBe(3);
  });
});

describe("When using 'count'", function () {
  it("should be the count of the array", function () {
    expect(Query.from([1, 2, 3]).count()).toBe(3);
  });

  it("should only include valid items when using a selector function", function () {
    expect(Query.from([1, 2, 3]).count(function (v) { return v >= 2; })).toBe(2);
  });
});

describe("When using 'where'", function () {
  it("should return a Query instance.", function () {
    expect(Query.from([1, 2, 3]).where(function () { return true; }) instanceof Query).toBeTruthy();
  });

  it("should return the same results if no selector function is passed", function () {
    expect(Query.from([1, 2, 3]).where().count()).toBe(3);
  });

  it("should return the selected results when a selector function is passed in", function () {
    expect(Query.from([1, 2, 3]).where(function (v) { return v >= 2; }).count()).toBe(2);
  });

  it("should return a new instance when no selector is passed in", function () {
    var original = Query.from([1, 2, 3]);
    expect(original.where() === original).toBeFalsy();
  });
});

describe("When using 'elementAt'", function () {
  it("should return the item at the given index", function () {
    expect(Query.from([1, 2, 3]).elementAt(1)).toBe(2);
  });

  it("should return undefined if the index doesn't exist", function () {
    expect(Query.from([1, 2, 3]).elementAt(3)).toBeUndefined();
  });

  it("should allow default item to be passed in for item that doesn't exist", function () {
    expect(Query.from([1, 2, 3]).elementAt(3, null)).toBeNull();
  });

  it("should not return default item if returned item is falsy", function () {
    expect(Query.from([2, 1, 0]).elementAt(2, null)).toBe(0);
  });

  it("should return default item if index is less than 0", function () {
    expect(Query.from([1, 2, 3]).elementAt(-1, 0)).toBe(0);
  });
});

describe("When calling 'toArray'", function () {
  var q = Query.from([1, 2, 3]);
  var results = q.toArray();

  it("should return an array", function () {
    expect(results instanceof Array).toBeTruthy();
  });

  it("should return the items as an array", function () {
    expect(results[2]).toBe(3);
  });

  it("should be a new instance", function () {
    expect(q.items === results).toBeFalsy();
  });
});

describe("When cloning Query", function () {
  var original = Query.from([1, 2, 3]);
  var clone = original.clone();

  it("should return a Query instance", function () {
    expect(clone instanceof Query).toBeTruthy();
  });

  it("should contain the same elements", function () {
    expect(clone.elementAt(2)).toEqual(original.elementAt(2));
  });

  it("should be a different instance", function () {
    expect(original === clone).toBeFalsy();
  });
});

describe("When selecting 'first' item", function () {
  it("should return first item in array when no selector is passed", function () {
    expect(Query.from([1, 2, 3]).first()).toEqual(1);
  });

  it("should return null if array is empty", function () {
    expect(new Query().first()).toBeNull();
  });

  it("should return the first matching item with selector function", function () {
    expect(Query.from([1, 2, 3]).first(function (item) { return item === 3; })).toEqual(3);
  });

  it("should return null when no item matches", function () {
    expect(Query.from([1, 2, 3]).first(function (item) { return item === 4; })).toBeNull();
  });

  it("should return default value when no item matches and default is specified", function () {
    expect(Query.from([1, 2, 3]).first(function (item) { return item === 4; }, 0)).toBe(0);
  });

  it("should allow you to just pass a default", function () {
    expect(Query.from([1, 2, 3]).first(99)).toBe(1);
  });
});


describe("When selecting 'last' item", function () {
  it("should return last item in array when no selector is passed", function () {
    expect(Query.from([1, 2, 3]).last()).toEqual(3);
  });

  it("should return null if array is empty", function () {
    expect(new Query().last()).toBeNull();
  });

  it("should return the last matching item with selector function", function () {
    expect(Query.from([1, 2, 3]).last(function (item) { return item === 1; })).toEqual(1);
  });

  it("should return null when no item matches", function () {
    expect(Query.from([1, 2, 3]).last(function (item) { return item === 4; })).toBeNull();
  });

  it("should return default value when no item matches and default is specified", function () {
    expect(Query.from([1, 2, 3]).last(function (item) { return item === 4; }, 0)).toBe(0);
  });
});

describe("When selecting 'single' item", function () {
  it("should return single item matching function", function () {
    expect(Query.from([1, 2, 3]).single(function (item) { return item === 2; })).toEqual(2);
  });

  it("should throw error when >1 items are found", function () {
    expect(function () { Query.from([1, 2, 3]).single(function (item) { return item > 1; }) }).toThrow();
  });

  it("should throw an error if no items are found", function () {
    expect(function () { Query.from([1, 2, 3]).single(function (item) { return item === 4; }); }).toThrow();
  });

  it("should return default value if no item matching function and default passed in", function () {
    expect(Query.from([1, 2, 3]).single(function (item) { return item === 0; }, 0)).toEqual(0);
  });
});

describe("When calling 'any'", function () {
  var q = Query.from([1, 2, 3]);

  it("should return boolean", function () {
    expect(typeof q.any()).toBe("boolean");
  });

  it("should return true with empty function if any items exist", function () {
    expect(q.any()).toBeTruthy();
  });

  it("should return false with empty query", function () {
    expect(Query.from().any()).toBeFalsy();
  });

  it("should return true if selector function has match", function () {
    expect(q.any(function (item) { return item > 1; })).toBeTruthy();
  });

  it("should return false if selector function has no match", function () {
    expect(q.any(function (item) { return item === 4; })).toBeFalsy();
  });
});

describe("When calling 'all'", function () {
  it("should be true if all items fit function", function () {
    expect(Query.from([1, 2, 3]).all(function (item) { return item > 0; })).toBeTruthy();
  });

  it("should be false if not all items apply", function () {
    expect(Query.from([1, 2, 3]).all(function (item) { return item > 1; })).toBeFalsy();
  });
});

describe("When concatenating queries", function () {
  it("should combine items", function () {
    expect(Query.from([1, 2]).concat([3]).elementAt(2)).toBe(3);
  });

  it("should return Query object", function () {
    expect(Query.from([1, 2]).concat([3]) instanceof Query).toBeTruthy();
  });

  it("should accept Query objects", function () {
    expect(Query.from([1, 2]).concat(Query.from([3])).elementAt(2)).toBe(3);
  });
});

describe("When selecting from Query", function () {
  var a = Query.from([
    { company: "Coho Vineyard", weight: 25.2, trackingNumber: "89453312L" },
    { company: "Lucerne Publishing", weight: 18.7, trackingNumber: "89112755L" },
    { company: "Wingtip Toys", weight: 6.0, trackingNumber: "299456122L" },
    { company: "Adventure Works", weight: 33.8, trackingNumber: "4665518773L" } 
  ]);

  it("should apply selector function to results", function () {
    expect(Query.from([1, 2, 3]).select(function (item) { return ++item; }).elementAt(2)).toBe(4);
  });

  it("should return a query object", function () {
    expect(Query.from([1, 2, 3]).select(function (item) { return ++item; }) instanceof Query).toBeTruthy();
  });

  it("should pass the index into the function", function () {
    expect(Query.from([1, 2, 3]).select(function (item, index) { return item * index; }).elementAt(2)).toBe(6);
  });

  it("should allow string to be passed in with field names", function() {
    expect(a.select("company").contains({ company: "Adventure Works" })).toBeTruthy();
  });

  it("should allow list of strings to be passed in with field names", function() {
    expect(a.select("company,trackingNumber").contains({ company: "Adventure Works", trackingNumber: "4665518773L" })).toBeTruthy();
  });

  it("should allow aliases for the field names", function() {
    expect(a.select("company,trackingNumber trackingNo").contains({ company: "Adventure Works", trackingNo: "4665518773L" })).toBeTruthy();
  });

  it("should allow aliases with 'as' for the field names", function() {
    expect(a.select("company,trackingNumber as trackingNo").contains({ company: "Adventure Works", trackingNo: "4665518773L" })).toBeTruthy();
  });
});

describe("When reversing query", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).reverse() instanceof Query).toBeTruthy();
  });

  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).reverse().elementAt(2)).toBe(1);
  });
});

describe("When selecting distinct records", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 1, 2, 2, 3, 3]).distinct() instanceof Query).toBeTruthy();
  });

  it("should return distinct items", function () {
    expect(Query.from([1, 1, 2, 2, 3, 3]).distinct().count()).toBe(3);
  });

  it("should allow an equality function", function () {
    expect(Query.from([{ id: 1, name: "Joe Blow" }, { id: 1, name: "Joseph Blow" }]).distinct(function (a, b) { return a.id === b.id; }).count()).toBe(1);
  });
});

describe("When calling forEach", function () {
  it("should call a method for each element", function () {
    var counter = 0;
    Query.from([1, 2, 3]).forEach(function () { counter++; });
    expect(counter).toBe(3);
  });

  it("should return the Query object", function () {
    var q = Query.from([1, 2, 3]);
    expect(q.forEach(function () { }) === q).toBeTruthy();
  });

  it("should run in the scope passed in", function () {
    var expected = {}, actual;
    Query.from([1]).forEach(function () { actual = this; }, expected);
    expect(actual === expected).toBeTruthy();
  });
});

describe("When unioning queries", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).union(Query.from([4, 5, 6])) instanceof Query).toBeTruthy();
  });

  it("should combine results", function () {
    expect(Query.from([1, 2, 3]).union(Query.from([4, 5, 6])).elementAt(5)).toBe(6);
  });

  it("should only return distinct results", function () {
    expect(Query.from([1, 2, 3]).union(Query.from([3, 4, 5])).count()).toBe(5);
  });

  it("should except an array", function () {
    expect(Query.from([1, 2, 3]).union([3, 4, 5]).count()).toBe(5);
  });

  it("should allow comparer function", function () {
    expect(Query.from([{ id: 1, name: "Joe Blow" }]).union([{ id: 1, name: "Joseph Blow" }], function (a, b) { return a.id === b.id; }).count()).toBe(1);
  });
});

describe("When intersecting queries", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).intersect(Query.from([2, 3, 4])) instanceof Query).toBeTruthy();
  });

  it("should only return found items", function () {
    expect(Query.from([1, 2, 3]).intersect(Query.from([2, 3, 4])).elementAt(1)).toBe(3);
  });

  it("should return distinct results with duplicates from the source", function () {
    expect(Query.from([1, 1, 2]).intersect(Query.from([1])).count()).toBe(1);
  });

  it("should return distinct results from duplicates in the passed in query", function () {
    expect(Query.from([1]).intersect(Query.from([1, 1, 2])).count()).toBe(1);
  });

  it("should accept an array as the passed in function", function () {
    expect(Query.from([1, 2, 3]).intersect([2, 3, 4]).count()).toBe(2);
  });

  it("should allow comparer function", function () {
    expect(Query.from([{ id: 1, name: "Joe Blow" }]).intersect([{ id: 1, name: "Joseph Blow" }], function (a, b) { return a.id === b.id; }).count()).toBe(1);
  });
});

describe("When diffing queries", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).except(Query.from([2, 3, 4])) instanceof Query).toBeTruthy();
  });

  it("should return results that are not in first query", function () {
    expect(Query.from([1, 2, 3]).except(Query.from([2, 3, 4])).elementAt(0)).toBe(1);
  });

  it("should return distinct results that are not in both queries", function () {
    expect(Query.from([1, 1, 2, 3]).except(Query.from([2, 3, 4, 4])).count()).toBe(1);
  });

  it("should allow comparer function", function () {
    expect(Query.from([{ id: 1, name: "Joe Blow" }, { id: 2, name: "Jane Doe" }]).except(Query.from([{ id: 1, name: "Joseph Blow" }]), function (a, b) { return a.id === b.id; }).count()).toBe(1);
  });

  it("should allow arrays to be passed in", function () {
    expect(Query.from([1, 2, 3]).except([2, 3, 4]).count()).toBe(1);
  });
});

describe("When taking from query", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).take(1) instanceof Query).toBeTruthy();
  })

  it("should return the number of items passed in", function () {
    expect(Query.from([1, 2, 3]).take(1).count()).toBe(1);
  });

  it("should not allow amounts returned to exceed length", function () {
    expect(Query.from([1, 2, 3]).take(4).count()).toBe(3);
  });

  it("should return items in order", function () {
    expect(Query.from([1, 2, 3]).take(1).elementAt(0)).toBe(1);
  });
});

describe("When skipping from query", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).skip(1) instanceof Query).toBeTruthy();
  })

  it("should skip the number of items passed in", function () {
    expect(Query.from([1, 2, 3]).skip(1).count()).toBe(2);
  });

  it("should return empty query if count exceed length", function () {
    expect(Query.from([1, 2, 3]).skip(4).count()).toBe(0);
  });

  it("should skip items in order", function () {
    expect(Query.from([1, 2, 3]).skip(1).elementAt(0)).toBe(2);
  });
});

describe("When taking while from query", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).takeWhile(function (item) { return item < 2; }) instanceof Query).toBeTruthy();
  });

  it("should return initial items that pass query", function () {
    expect(Query.from([1, 2, 3]).takeWhile(function (item) { return item < 2; }).count()).toBe(1);
  });

  it("should return entire results if all pass", function () {
    expect(Query.from([1, 2, 3]).takeWhile(function (item) { return item < 4; }).count()).toBe(3);
  });

  it("should not return later items that pass query", function () {
    expect(Query.from([1, 2, 3, 1]).takeWhile(function (item) { return item < 2; }).count()).toBe(1);
  });
});

describe("When skipping while from query", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).skipWhile(function (item) { return item < 2; }) instanceof Query).toBeTruthy();
  });

  it("should skip initial items that pass query", function () {
    expect(Query.from([1, 2, 3]).skipWhile(function (item) { return item < 2; }).count()).toBe(2);
  });

  it("should skip entire results if all pass", function () {
    expect(Query.from([1, 2, 3]).skipWhile(function (item) { return item < 4; }).count()).toBe(0);
  });

  it("should not return later items that pass query", function () {
    expect(Query.from([1, 2, 3, 1]).skipWhile(function (item) { return item < 2; }).count()).toBe(3);
  });
});

describe("When summing query", function () {
  it("should return sum of all items", function () {
    expect(Query.from([1, 2, 3]).sum()).toBe(6);
  });

  it("should allow passing in transform function", function () {
    expect(Query.from([{ value: 1 }, { value: 2 }, { value: 3 }]).sum(function (item) { return item.value; })).toBe(6);
  });
});

describe("When averaging query", function () {
  it("should return average of all items", function () {
    expect(Query.from([1, 2, 3]).avg()).toBe(2);
  });

  it("should allow passing in transform function", function () {
    expect(Query.from([{ value: 1 }, { value: 2 }, { value: 3 }]).avg(function (item) { return item.value; })).toBe(2);
  });
});

describe("When getting max of query", function () {
  it("should return max item in query", function () {
    expect(Query.from([1, 5, 4]).max()).toBe(5);
  });

  it("should allow passing in transform function", function () {
    expect(Query.from([{ value: 1 }, { value: 2 }, { value: 3 }]).max(function (item) { return item.value; })).toBe(3);
  });
});

describe("When getting min of query", function () {
  it("should return min item in query", function () {
    expect(Query.from([1, 5, 4]).min()).toBe(1);
  });

  it("should allow passing in transform function", function () {
    expect(Query.from([{ value: 1 }, { value: 2 }, { value: 3 }]).min(function (item) { return item.value; })).toBe(1);
  });
});

describe("When calling contains", function () {
  it("should return true if the item exists in the query", function () {
    expect(Query.from([1, 2, 3]).contains(2)).toBeTruthy();
  });

  it("should return false if the item does not exist in the query", function () {
    expect(Query.from([1, 2, 3]).contains(5)).toBeFalsy();
  });

  it("should allow a comparer function", function () {
    expect(Query.from([{ id: 1, name: "Joseph Blow" }, { id: 2, name: "Jane Doe" }]).contains({ id: 1 }, function (a, b) { return a.id === b.id; })).toBeTruthy();
  });
});

describe("When using defaultIfEmpty", function () {
  it("should return the list if not empty", function () {
    expect(Query.from([1, 2, 3]).defaultIfEmpty().elementAt(2)).toBe(3);
  });

  it("should return default value if collection is empty", function () {
    expect(new Query().defaultIfEmpty(5).elementAt(0)).toBe(5);
  });
});

describe("When grouping query", function () {
  it("should return a query of group items", function () {
    expect(new Query([{ state: "MI", city: "Flint" }]).groupBy(function (item) { return item.state; }).elementAt(0) instanceof Query.Group).toBeTruthy();
  });

  it("should group items by key passed in", function () {
    var q = Query.from([{ state: "MI", city: "Flint" }, { state: "MI", city: "Ann Arbor" }, { state: "GA", city: "Atlanta" }]);
    expect(q.groupBy(function (item) { return item.state; }).first(function (group) { return group.key === "GA"; }).key).toBe("GA");
  });

  it("should assign the items to the group", function () {
    var q = Query.from([{ state: "MI", city: "Flint" }, { state: "MI", city: "Ann Arbor" }, { state: "GA", city: "Atlanta" }]);
    expect(q.groupBy(function (item) { return item.state; }).first(function (group) { return group.key === "GA"; }).items.length).toBe(1);
  });

  it("should group items correctly when out of order", function () {
    var q = Query.from([{ state: "MI", city: "Flint" }, { state: "GA", city: "Atlanta" }, { state: "MI", city: "Ann Arbor" }]);
    expect(q.groupBy(function (item) { return item.state; }).count()).toBe(2);
  });

  it("should allow projector function to be passed in", function () {
    var q = Query.from([{ state: "MI", city: "Flint" }, { state: "GA", city: "Atlanta" }, { state: "MI", city: "Ann Arbor" }]);
    expect(
      q.groupBy(
        function (item) { return item.state; }, 
        function (o) { return o.city + ", " + o.state; 
      }).first(
        function (o) { return o.key === "GA"; }
      ).items[0]).toBe("Atlanta, GA");
  });
});

describe("When ordering query", function () {
  var states = [{ state: "MI", city: "Flint" }, { state: "MI", city: "Ann Arbor" }, { state: "GA", city: "Atlanta" }];

  it("should return a Query object", function () {
    expect(Query.from([3, 1, 2]).orderBy(function (x, y) { return x > y ? 1 : x < y ? -1 : 0; }) instanceof Query).toBeTruthy();
  });

  it("should return items in expected order", function () {
    expect(Query.from([3, 1, 2]).orderBy(function (x, y) { return x > y ? 1 : x < y ? -1 : 0; }).elementAt(0)).toBe(1);
  });

  it("should order complex objects", function () {
    expect(Query.from(states).orderBy(function (x,y) { return x.state.localeCompare(y.state); }).elementAt(0).state).toBe("GA");
  });
});

describe("When ordering with string overload", function () {
  var states = [{ state: "MI", city: "Flint" }, { state: "MI", city: "Ann Arbor" }, { state: "GA", city: "Atlanta" }];

  it("should allow ordering by property names", function () {
    expect(Query.from(states).orderBy("state ASC,city ASC").elementAt(1).city).toBe("Ann Arbor");
  });

  it("should descend sorting when using 'DESC'", function () {
    expect(Query.from(states).orderBy("state DESC, city DESC").elementAt(2).state).toBe("GA");
  });

  it("should default to ascending when not passed in", function () {
    expect(Query.from(states).orderBy("state,city").elementAt(1).city).toBe("Ann Arbor");
  });

  it("should tolerate spaces", function () {
    expect(Query.from(states).orderBy("state ASC, city ASC").elementAt(1).city).toBe("Ann Arbor");
  });

  it("should tolerate lower case sorting directions", function () {
    expect(Query.from(states).orderBy("state desc, city asc").elementAt(2).state).toBe("GA");
  });

});

describe("When zipping a query", function () {
  it("should return a Query object", function () {
    expect(Query.from([1, 2, 3]).zip(Query.from(["one", "two", "three"]), function (a, b) { return a + " " + b; }) instanceof Query).toBeTruthy();
  });

  it("should combine objects", function () {
    expect(Query.from([1, 2, 3]).zip(Query.from(["one", "two", "three"]), function (a, b) { return a + " " + b; }).elementAt(0)).toBe("1 one");
  });

  it("should allow array to be passed in", function () {
    expect(Query.from([1, 2, 3]).zip(["one", "two", "three"], function (a, b) { return a + " " + b; }).elementAt(0)).toBe("1 one");
  });

  it("should stop when source query is empty", function () {
    expect(Query.from([1, 2]).zip(["one", "two", "three"], function (a, b) { return a + " " + b; }).count()).toBe(2);
  });

  it("should stop when combined query is empty", function () {
    expect(Query.from([1, 2, 3]).zip(["one", "two"], function (a, b) { return a + " " + b; }).count()).toBe(2);
  });

  it("should use default projector when no projector is defined", function () {
    expect(Query.from([{ value: 1 }, { value: 2 }]).zip([{ name: "one" }, { name: "two" }]).contains({ value: 1, name: "one" })).toBeTruthy();
  });
});

describe("When joining queries", function () {
  var o1 = { name: "Joe Blow", id: 1 },
    o2 = { name: "Jane Doe", id: 2 },
    o3 = { name: "No Pet Loser", id: 3 },
    pets = Query.from([{ name: "Otto", ownerID: 1 }, { name: "Bailee", ownerID: 2 }, { name: "Maya", ownerID: 2 }]),
    joined = pets.join(Query.from([o1, o2]), function (a, b) { return a.ownerID === b.id; }, function (a, b) { return { petName: a.name, ownerName: b.name }; });

  it("should return a Query object", function () {
    expect(joined instanceof Query).toBeTruthy();
  });

  it("should join on joiner function", function () {
    expect(joined.count()).toBe(3);
  });

  it("should return items based on selector", function () {
    expect(joined.elementAt(0).petName).toBe("Otto");
  });

  it("should allow array to be passed in", function () {
    expect(pets.join([o1, o2], function (a, b) { return a.ownerID === b.id; }, function (a, b) { return { petName: a.name, ownerName: b.name }; }).count()).toBe(3);
  });

  it("should not modify original object when using default projector", function() {
    expect(pets.join([o1, o2], function (a, b) { return a.ownerID === b.id; }).elementAt(0) === pets.elementAt(0)).toBeFalsy();
  });

  it("should select all data if no projector is defined", function() {
    var expected = { name: "Otto", ownerID: 1, id: 1 };
    expect(pets.join([o1, o2], function (a, b) { return a.ownerID === b.id; }).contains(expected)).toBeTruthy();
  });

  it("should omit items that do not have matching join", function () {
    var j = Query.from([o1, o2, o3]).join(pets, function (a, b) { return a.id === b.ownerID }, function (a, b) { return { ownerName: a.name, id: a.id, petName: b.name }; });
    expect(j.any(function (a) { return a.id === 3; })).toBeFalsy();
  });
});

describe("When outer joining queries", function () {
  var o1 = { name: "Joe Blow", id: 1 },
    o2 = { name: "Jane Doe", id: 2 },
    o3 = { name: "No Pets", id: 3 },
    pets = Query.from([{ name: "Otto", ownerID: 1 }, { name: "Bailee", ownerID: 2 }, { name: "Maya", ownerID: 2 }]);

  it("should return a query object", function () {
    var j = Query.from([o1, o2, o3]).outerJoin(pets, function (a, b) { return a.id === b.ownerID }, function (a, b) { return { ownerName: a.name, id: a.id, petName: b && b.name }; });
    expect(j instanceof Query).toBeTruthy();
  });

  it("should join on joiner function", function () {
    var j = Query.from([o1, o2]).outerJoin(pets, function (a, b) { return a.id === b.ownerID }, function (a, b) { return { ownerName: a.name, id: a.id, petName: b && b.name }; });
    expect(j.count()).toBe(3);
  });

  it("should keep items that do not have matching join", function () {
    var j = Query.from([o1, o2, o3]).outerJoin(pets, function (a, b) { return a.id === b.ownerID }, function (a, b) { return { ownerName: a.name, id: a.id, petName: b && b.name }; });
    expect(j.any(function (a) { return a.id === 3; })).toBeTruthy();
  });

  it("should use default projector when no projector is defined", function () {
    var expected = { name: "Joe Blow", ownerID: 1, id: 1 };
    expect(Query.from([o1, o2, o3]).outerJoin(pets, function (a, b) { return a.id === b.ownerID; }).contains(expected)).toBeTruthy();
  });

  it("should only include properties from the first object when join isn't made", function () {
    var expected = { name: "No Pets", id: 3 };
    expect(Query.from([o1, o2, o3]).outerJoin(pets, function (a, b) { return a.id === b.ownerID; }).contains(expected)).toBeTruthy();
  });
});

describe("When cross joining items", function() {
  var days = [{ day: "sun"},{ day: "mon"},{ day: "tue"},{ day: "wed"},{ day: "thu"},{ day: "fri"},{ day: "sat"}];
  var weeks = [{ name: "week1" },{ name: "week2" },{ name: "week3" },{ name: "week4" }];
  var projector = function (a, b) { return { week: a.name, day: b.day  }; };

  it("should return a query object", function() {
    expect(Query.from(weeks).crossJoin(days, projector) instanceof Query).toBeTruthy();
  });

  it("should join all items", function() {
    expect(Query.from(weeks).crossJoin(days, projector).count()).toBe(28);
  });

  it("should use default selector when none is applied", function() {
    var expected = { name: "week1", day: "sun" };
    expect(Query.from(weeks).crossJoin(days).contains(expected)).toBeTruthy();
  });
});

describe("When checking sequenceEquals", function () {
  it("should be false if lengths are different", function () {
    expect(Query.from([1, 2, 3]).sequenceEquals(Query.from([1, 2]))).toBeFalsy();
  });

  it("should be true if items match", function () {
    expect(Query.from([1, 2, 3]).sequenceEquals(Query.from([1, 2, 3]))).toBeTruthy();
  });

  it("should be false if items match but are in different order", function () {
    expect(Query.from([1, 2, 3]).sequenceEquals(Query.from([1, 3, 2]))).toBeFalsy();
  });

  it("should allor an array to be passed in", function () {
    expect(Query.from([1, 2, 3]).sequenceEquals([1, 2, 3])).toBeTruthy();
  });

  it("should allow equality comparer to be used", function () {
    expect(Query.from([{ id: 1, name: "Joe Blow" }, { id: 2, name: "Jane Doe" }]).sequenceEquals([{ id: 1 }, { id: 2 }], function (a, b) { return a.id === b.id; })).toBeTruthy();
  });
});

describe("When outer applying from a query", function() {
  var q = Query.from([
    { name: "Josh", pets: [{ name: "Otto"  }] },
    { name: "Jon", pets: [{ name: "Maya" }, { name: "Bailee" }]}
  ]),
    p = function(a, b) { return { name: a.name, pet: b ? b.name : "" }; };

  it("should return a query instance", function() {
    expect(q.outerApply(function (a) { return a.pets; }, p) instanceof Query).toBeTruthy();
  });

  it("should contain the items returned from the query", function() {
    expect(q.outerApply(function (a) { return a.pets; }, p).contains({ name: "Jon", pet: "Maya" })).toBeTruthy();
  });

  it("should allow returning a query object from the selector", function() {
    expect(q.outerApply(function (a) { return Query.from(a.pets); }, p).count()).toBe(3);
  });

  it("should allow returning of an object", function() {
    expect(q.outerApply(function (a) { return { name: a.name }; }, p).count()).toBe(2);
  });

  it("should also keep items that get undefined result", function() {
    var a = q.items.concat([{ name: "No Pets" }]);
    expect(Query.from(a).outerApply(function (b) { if (b.pets) { return b.pets; } }, p).contains({ name: "No Pets", pet: "" })).toBeTruthy();
  });

  it("should use default projector if none is passed in", function() {
    var a = q.items.concat([{ name: "No Pets" }]);
    expect(Query.from(a).outerApply(function (b) { if (b.pets) { return b.pets; } }).contains({ name: "No Pets" })).toBeTruthy();
  });
});

describe("When cross applying from a query", function() {
  var q = Query.from([
    { name: "Josh", pets: [{ name: "Otto"  }] },
    { name: "Jon", pets: [{ name: "Maya" }, { name: "Bailee" }]}
  ]),
    p = function(a, b) { return { name: a.name, pet: b ? b.name : "" }; };

  it("should return a query instance", function() {
    expect(q.crossApply(function (a) { return a.pets; }, p) instanceof Query).toBeTruthy();
  });

  it("should contain the items returned from the query", function() {
    expect(q.crossApply(function (a) { return a.pets; }, p).contains({ name: "Jon", pet: "Maya" })).toBeTruthy();
  });

  it("should allow returning a query object from the selector", function() {
    expect(q.crossApply(function (a) { return Query.from(a.pets); }, p).count()).toBe(3);
  });

  it("should allow returning of an object", function() {
    expect(q.crossApply(function (a) { return { name: a.name }; }, p).count()).toBe(2);
  });

  it("should not keep items that get undefined result", function() {
    var a = q.items.concat([{ name: "No Pets" }]);
    expect(Query.from(a).crossApply(function (b) { if (b.pets) { return b.pets; } }, p).contains({ name: "No Pets", pet: "" })).toBeFalsy();
  });

  it("should use default projector if none is passed in", function() {
    expect(q.crossApply(function (b) { if (b.pets) { return b.pets; } }).count(function(o) { return o.name === "Jon"; })).toBe(2);
  });
});

describe("When converting to dictionary", function() {
  var a = Query.from([
    { company: "Coho Vineyard", weight: 25.2, trackingNumber: "89453312L" },
    { company: "Lucerne Publishing", weight: 18.7, trackingNumber: "89112755L" },
    { company: "Wingtip Toys", weight: 6.0, trackingNumber: "299456122L" },
    { company: "Adventure Works", weight: 33.8, trackingNumber: "4665518773L" } 
  ]);

  it("should return an object", function() {
    expect(a.toDictionary(function (o) { return o.trackingNumber; }) instanceof Object).toBeTruthy();
  });

  it("should have properties that contain the key value", function() {
    expect(a.toDictionary(function (o) { return o.trackingNumber; })["4665518773L"].company).toBe("Adventure Works");
  });

  it("should use projector functions if provided", function() {
    expect(a.toDictionary(function (o) { return o.trackingNumber; }, function (o) { return { name: o.company }; })["4665518773L"].name).toBe("Adventure Works");
  });

  it("should throw an exception if duplicate keys", function() {
    expect(function() { 
      var d = Query.from([{ id: "1", name: "One" }, { id: "1", name: "One" }]).toDictionary(function (k) { return k.name; });
    }).toThrow();
  });

  it("should accept a string for the key name", function() {
    expect(a.toDictionary("trackingNumber")["4665518773L"].company).toBe("Adventure Works");
  });
});

describe("When converting to dictionary", function() {
  var a = Query.from([
    { company: "Coho Vineyard", weight: 25.2, trackingNumber: "89453312L" },
    { company: "Lucerne Publishing", weight: 18.7, trackingNumber: "89112755L" },
    { company: "Wingtip Toys", weight: 6.0, trackingNumber: "299456122L" },
    { company: "Adventure Works", weight: 33.8, trackingNumber: "4665518773L" } 
  ]);

  it("should return an object", function() {
    expect(a.toDictionary(function (o) { return o.trackingNumber; }) instanceof Object).toBeTruthy();
  });

  it("should have properties that contain the key value", function() {
    expect(a.toDictionary(function (o) { return o.trackingNumber; })["4665518773L"].company).toBe("Adventure Works");
  });

  it("should use projector functions if provided", function() {
    expect(a.toDictionary(function (o) { return o.trackingNumber; }, function (o) { return { name: o.company }; })["4665518773L"].name).toBe("Adventure Works");
  });

  it("should throw an exception if duplicate keys", function() {
    expect(function() { 
      var d = Query.from([{ id: "1", name: "One" }, { id: "1", name: "One" }]).toDictionary(function (k) { return k.name; });
    }).toThrow();
  });

  it("should accept a string for the key name", function() {
    expect(a.toDictionary("trackingNumber")["4665518773L"].company).toBe("Adventure Works");
  });
});

describe("When converting to lookup", function() {
  var a = Query.from([
    { company: "Coho Vineyard", weight: 25.2, trackingNumber: "89453312L" },
    { company: "Lucerne Publishing", weight: 18.7, trackingNumber: "89112755L" },
    { company: "Wingtip Toys", weight: 6.0, trackingNumber: "299456122L" },
    { company: "Adventure Works", weight: 33.8, trackingNumber: "4665518773L" } 
  ]);

  it("should return an object", function() {
    expect(a.toLookup(function (o) { return o.company.charAt(0); }) instanceof Object).toBeTruthy();
  });

  it("should have properties that contain the key value", function() {
    expect("C" in a.toLookup(function (o) { return o.company.charAt(0); })).toBeTruthy();
  });

  it("should use projector functions if provided", function() {
    expect(a.toLookup(function (o) { return o.company.charAt(0); }, function (o) { return { name: o.company }; })["A"][0].name).toBe("Adventure Works");
  });

  it("should accept a string for the key name", function() {
    expect(a.toLookup("trackingNumber")["4665518773L"][0].company).toBe("Adventure Works");
  });
});

describe("When doing a full join", function() {
  var employees = [
    { lastName: "Rafferty", departmentID: 31 },
    { lastName: "Jones", departmentID: 33 },
    { lastName: "Steinberg", departmentID: 33 },
    { lastName: "Robinson", departmentID: 34 },
    { lastName: "Smith", departmentID: 34 },
    { lastName: "John", departmentID: null }
  ];

  var depts = [
    { departmentID: 31, departmentName: "Sales" },
    { departmentID: 33, departmentName: "Engineering" },
    { departmentID: 34, departmentName: "Clerical" },
    { departmentID: 35, departmentName: "Marketing" }
  ];

  var joiner = function (a,b) { return a.departmentID === b.departmentID; };
  var projector = function (a,b) { return { employee: a && a.lastName, department: b && b.departmentName }; };

  it("should return a Query object", function() {
    expect(Query.from(employees).fullJoin(Query.from(depts), joiner, projector) instanceof Query).toBeTruthy();
  });

  it("should join results when match is found", function() {
    var expected = { employee: "Jones", department: "Engineering" };
    expect(Query.from(employees).fullJoin(Query.from(depts), joiner, projector).contains(expected)).toBeTruthy();
  });

  it("should have items in left list when no match is found", function() {
    expect(Query.from(employees).fullJoin(Query.from(depts), joiner, projector).any(function (e) { return e.employee === "John"; })).toBeTruthy();
  });

  it("should have items in right list when no match is found", function() {
    expect(Query.from(employees).fullJoin(Query.from(depts), joiner, projector).any(function (e) { return e.department === "Marketing"; })).toBeTruthy();
  });

  it("should allow arrays to be passed in", function() {
    expect(Query.from(employees).fullJoin(depts, joiner, projector).count()).toBe(7);
  });

  it("should use default projector if none is defined", function() {
    var expected = { lastName: "Rafferty", departmentID: 31, departmentName: "Sales" };
    expect(Query.from(employees).fullJoin(depts, joiner).contains(expected)).toBeTruthy();
  });
});

describe("When selecting many", function() {
  var p = [
    { name: "Josh", pets: [{ petName: "Otto" }] },
    { name: "Jon", pets: [{petName: "Bailee" },{petName: "Maya"}]}
  ];
  var selector = function (o) {
    return o.pets;
  };
  var projector = function (a,b) { return { name: a.name, petName: b.petName }; };

  it("should return a Query object", function() {
    expect(Query.from(p).selectMany(selector, projector) instanceof Query).toBeTruthy();
  });

  it("should use projector to flatten results", function() {
    expect(Query.from(p).selectMany(selector, projector).contains({ name: "Jon", petName: "Maya" })).toBeTruthy();
  });

  it("should use default projector when no projector is defined", function() {
    expect(Query.from(p).selectMany(selector).contains({ name: "Jon", petName: "Maya", pets: p[1].pets })).toBeTruthy();
  });

  it("should allow projector to return Query", function() {
    expect(Query.from(p).selectMany(function(o){return new Query(o.pets); }).count()).toBe(3);
  });
});

