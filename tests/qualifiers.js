describe("Qualifier Functions:", function() {

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

});