describe("Filtering Functions:", function() {

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

	  it("should return same instance when no selector is passed in", function () {
	    var original = Query.from([1, 2, 3]);
	    expect(original.where() === original).toBeTruthy();
	  });

	  it("should accept predicate object", function() {
	  	var items = [{ name: "Jim" }, { name: "John" }, { name: "Josh" }];
	  	expect(Query.from(items).where({ name: "Josh" }).count()).toBe(1);
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
	    expect(Query.from([1, 2, 3]).first(null, 99)).toBe(1);
	  });

	  it("should accept predicate object", function() {
	  	var items = [{ name: "Jim" }, { name: "John" }, { name: "Josh" }];
	  	expect(Query.from(items).first({ name: "Josh" }).name).toBe("Josh");
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

	  it("should accept predicate object", function() {
	  	var items = [{ name: "Jim" }, { name: "John" }, { name: "Josh" }];
	  	expect(Query.from(items).last({ name: "Josh" }).name).toBe("Josh");
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

	  it("should accept predicate object", function() {
	  	var items = [{ name: "Jim" }, { name: "John" }, { name: "Josh" }];
	  	expect(Query.from(items).single({ name: "Josh" }).name).toBe("Josh");
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

});