describe("Aggregate Functions:", function() {

	describe("When using 'count'", function () {
	  it("should be the count of the array", function () {
	    expect(Query.from([1, 2, 3]).count()).toBe(3);
	  });

	  it("should only include valid items when using a selector function", function () {
	    expect(Query.from([1, 2, 3]).count(function (v) { return v >= 2; })).toBe(2);
	  });

	  it("should take accept a predicate object", function() {
	  	var items = [{ name: "Jim" }, { name: "John" }, { name: "Josh" }];
	  	expect(Query.from(items).count({ name: "Josh" })).toBe(1);
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

});