describe("Partitioning Function:", function() {

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

});