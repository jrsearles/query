
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
  it("should apply selector function to results", function () {
    expect(Query.from([1, 2, 3]).select(function (item) { return ++item; }).elementAt(2)).toBe(4);
  });

  it("should return a query object", function () {
    expect(Query.from([1, 2, 3]).select(function (item) { return ++item; }) instanceof Query).toBeTruthy();
  });

  it("should pass the index into the function", function () {
    expect(Query.from([1, 2, 3]).select(function (item, index) { return item * index; }).elementAt(2)).toBe(6);
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

describe("When adding an item to a Query", function () {
  it("should return the query instance", function () {
    var q = new Query();
    expect(q.add(1) === q).toBeTruthy();
  });

  it("should increment the count", function () {
    var q = Query.from([1, 2, 3]), count = q.count();
    expect(q.add(4).count()).toBe(++count);
  });

  it("should add item to items array", function () {
    var q = Query.from([1, 2, 3]);
    expect(q.add(4).elementAt(3)).toBe(4);
  });

  it("should examine properties for equality", function () {
    var q = Query.from([{ FirstName: "Joe", LastName: "Blow" }, { FirstName: "Jane", LastName: "Doe" }, { FirstName: "Joe", LastName: "Blow" }]);
    expect(q.distinct().count()).toBe(2);
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
    expect(Query.from([1, 2, 3]).diff(Query.from([2, 3, 4])) instanceof Query).toBeTruthy();
  });

  it("should return results that are not in both queries", function () {
    expect(Query.from([1, 2, 3]).diff(Query.from([2, 3, 4])).elementAt(1)).toBe(4);
  });

  it("should return distinct results that are not in both queries", function () {
    expect(Query.from([1, 2, 3]).diff(Query.from([2, 3, 4, 4])).count()).toBe(2);
  });

  it("should allow comparer function", function () {
    expect(Query.from([{ id: 1, name: "Joe Blow" }]).diff(Query.from([{ id: 1, name: "Joseph Blow" }, { id: 2, name: "Jane Doe" }]), function (a, b) { return a.id === b.id; }).count()).toBe(1);
  });

  it("should allow arrays to be passed in", function () {
    expect(Query.from([1, 2, 3]).diff([2, 3, 4]).count()).toBe(2);
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
});

describe("When ordering query", function () {
  it("should return a Query object", function () {
    expect(Query.from([3, 1, 2]).orderBy(function (item) { return item; }) instanceof Query).toBeTruthy();
  });

  it("should return items in order", function () {
    expect(Query.from([3, 1, 2]).orderBy(function (item) { return item; }).elementAt(0)).toBe(1);
  });

  it("should return items in order", function () {
    expect(Query.from([3, 1, 2]).orderBy(function (item) { return item; }, true).elementAt(0)).toBe(3);
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
});

describe("When joining queries", function () {
  var o1 = { name: "Joe Blow", id: 1 },
    o2 = { name: "Jane Doe", id: 2 },
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

describe("When removing an item", function () {
  it("should return the query instance", function () {
    var q = Query.from([1, 2, 3]);
    expect(q.remove(3) === q).toBeTruthy();
  });

  it("should decrease the count", function () {
    expect(Query.from([1, 2, 3]).remove(3).count()).toBe(2);
  });

  it("should remove the item", function () {
    expect(Query.from([1, 2, 3]).remove(2).elementAt(1)).toBe(3);
  });
});

describe("When clearing a query", function () {
  it("should return the query instance", function () {
    var q = Query.from([1, 2, 3]);
    expect(q.clear() === q).toBeTruthy();
  });

  it("should have 0 for count", function () {
    expect(Query.from([1, 2, 3]).clear().count()).toBe(0);
  });
});