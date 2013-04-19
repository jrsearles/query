describe("Set Functions:", function() {

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

	  it("should accept an array", function () {
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

});