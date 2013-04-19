describe("Projection Functions:", function() {

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

});