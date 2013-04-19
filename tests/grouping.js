describe("Grouping & Ordering Functions:", function() {

	describe("When reversing query", function () {
	  it("should return a Query object", function () {
	    expect(Query.from([1, 2, 3]).reverse() instanceof Query).toBeTruthy();
	  });

	  it("should return a Query object", function () {
	    expect(Query.from([1, 2, 3]).reverse().elementAt(2)).toBe(1);
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

});