describe("Core Functionality:", function() {

  describe("When instantiating a Query", function () {
    var a = [1, 2, 3],
      q = new Query(a);

    it("should have 'items' property with passed in array", function () {
      expect(q.items instanceof Array).toBeTruthy();
    });

    it("should add array to arguments", function () {
      expect(q.items.length).toBe(3);
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

  describe("A query object is array-like and ", function() {
    var a = [1,2,3];

    it("should have a length of 0 when empty", function() {
      expect((new Query()).length).toBe(0);
    });

    it("should have the length of the passed in array", function() {
      expect(Query.from(a).length).toBe(a.length);
    });

    it("should allow items to be accessed via indexes", function() {
      expect(Query.from(a)[0]).toBe(a[0]);
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

});