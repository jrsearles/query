describe("Join Functions:", function() {

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

	  it("should accept a join hash-map object", function() {
	    expect(Query.from([o1, o2]).join(pets, { "ownerID" : "id" }).count()).toBe(3);
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

});