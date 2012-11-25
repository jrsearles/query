(function (global) {
  "use strict";

  var Q, G, arrProto = Array.prototype,
    objProto = Object.prototype,
    slice = arrProto.slice,
    toString = objProto.toString,
    hasOwnProperty = objProto.hasOwnProperty,
    m = Math;

  function isFunction(fn) {
    return typeof fn === "function";
  }

  function isDefined(o) {
    return !!o || typeof o !== "undefined";
  }

  function getProperties(obj) {
    var props = [],
      prop;

    for (prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        props.push(prop);
      }
    }

    return props;
  }

  function equals(a, b) {
    // heavily borrowed from underscore's isEqual method.
    var prop;

    // check reference
    if (a === b) {
      return true;
    }

    // check type
    if (typeof a !== typeof b) {
      return false;
    }

    // do implicit comparison
    if (a == b) {
      return true;
    }

    // check truthiness
    if ((!a && b) || (a && !b)) {
      return false;
    }

    // check for NaN (NaN does not equal itself)
    if (a !== a || b !== b) {
      return false;
    }

    var typeName = toString.call(a);
    if (toString.call(b) !== typeName) {
      return false;
    }

    if (typeName === "[object String]" || typeName === "[object Number]" || typeName === "[object Boolean]") {
      return a == b;
    }

    if (typeName === "[object Date]") {
      return a.getTime() === b.getTime();
    }

    // get properties into array
    if (getProperties(a).length !== getProperties(b).length) {
      return false;
    }

    // iterate over properties
    for (prop in a) {
      if (hasOwnProperty.call(a, prop) && (!(prop in b) || !equals(a[prop], b[prop]))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a Query instance.
   *
   * @constructor
   * @this {Query}
   * @param {Array} items The items to query.
   */
  global.Query = Q = function (items) {
    /**
     * Array of the elements contained within the query.
     *
     * @type {Array} The elements.
     */

    // create a clone of the array if passed in 
    // we don't want to modify the original array
    this.items = (items && slice.call(items, 0)) || [];
    return this;
  };

  /**
   * Creates a Query instance.
   *
   * @param  {Array} items The items to query.
   * @return {Query} The Query instance.
   */
  Q.from = function (items) {
    return new Q(items);
  };

  /**
   * Creates an instance of Query.Group.
   *
   * @constructor
   * @param {Object} key The key for group.
   */
  Q.Group = G = function (key, items) {
    this.key = key;
    this.items = items || [];
  };

  Q.prototype = {

    /**
     * Returns the number of elements in a query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Number} The element count.
     */
    count: function (predicateFn) {
      return predicateFn ? this.where(predicateFn).items.length : this.items.length;
    },

    /**
     * Filters a sequence based on a predicate.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Query} Query with the matching elements.
     */
    where: function (predicateFn) {
      if (predicateFn) {
        var results = [];
        this.forEach(function (item, i) {
          if (predicateFn(item, i)) {
            results.push(item);
          }
        });

        return new Q(results);
      }

      return this.clone();
    },

    /**
     * Returns the element at the specified index.
     *
     * @param  {Number} index       The index of the element to retrieve.
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The element at the given index.
     */
    elementAt: function (index, defaultItem) {
      if (index >= this.items.length || index < 0) {
        return defaultItem;
      }

      return this.items[index];
    },

    /**
     * Returns the first element of a query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The first matching element.
     */
    first: function (predicateFn, defaultItem) {
      // swap out arguments
      if (arguments.length === 1 && !isFunction(predicateFn)) {
        defaultItem = predicateFn;
        predicateFn = null;
      }

      // default to null
      defaultItem = isDefined(defaultItem) ? defaultItem : null;
      if (isFunction(predicateFn)) {
        var i = 0,
          ln = this.items.length,
          item;

        while (i < ln) {
          item = this.items[i];
          if (predicateFn(item, i)) {
            return item;
          }

          i++;
        }

        return defaultItem;
      }

      return !this.items.length ? defaultItem : this.items[0];
    },

    /**
     * Returns the last element in a query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The last matching element.
     */
    last: function (predicateFn, defaultItem) {
      // swap out arguments
      if (arguments.length === 1 && !isFunction(predicateFn)) {
        defaultItem = predicateFn;
        predicateFn = null;
      }

      // default to null
      defaultItem = isDefined(defaultItem) ? defaultItem : null;
      if (isFunction(predicateFn)) {
        var i = this.items.length,
          item;

        while (i--) {
          item = this.items[i];
          if (predicateFn(item, i)) {
            return item;
          }
        }

        return defaultItem;
      }

      return !this.items.length ? defaultItem : this.items[this.items.length - 1];
    },

    /**
     * Returns a single specific element in the query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The matching element.
     * @throws {Error} If more than one element matches the element or no element matches and a default is provided.
     */
    single: function (predicateFn, defaultItem) {
      var i = this.items.length,
        results = [],
        item;

      // swap out parameters
      if (arguments.length === 1 && !isFunction(predicateFn)) {
        defaultItem = predicateFn;
        predicateFn = null;
      }

      if (predicateFn) {
        while (i--) {
          item = this.items[i];
          if (predicateFn(item, i)) {
            results.push(item);
          }

          // keep iterating, stop when 2 are found (this indicates an error)
          if (results.length === 2) {
            break;
          }
        }
      } else {
        // if no predicate, use the entire collection
        // this assignment is just to make the following simpler
        results = this.items;
      }

      if (!results.length && isDefined(defaultItem)) {
        return defaultItem;
      } else if (results.length !== 1) {
        throw new Error("Only one result should be found when calling 'single'.");
      }

      return results[0];
    },

    /**
     * Determines whether any element matches a given predicate.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Boolean} Boolean indicating whether any elements match the given condition.
     */
    any: function (predicateFn) {
      return this.first(predicateFn) !== null;
    },

    /**
     * Determines whether all elements matches a given predicate.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Boolean} Boolean Indicates whether all elements match the given condition.
     */
    all: function (predicateFn) {
      var i = this.items.length;
      while (i--) {
        if (!predicateFn(this.items[i], i)) {
          return false;
        }
      }

      return true;
    },

    /**
     * Determines whether the query containers the given element.
     *
     * @param  {<T>} item The element to look for.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Boolean} Boolean indicating whether the item is contained within the query.
     */
    contains: function (item, comparerFn) {
      var i = this.items.length,
        comparer = comparerFn || equals;

      while (i--) {
        if (comparer(this.items[i], item)) {
          return true;
        }
      }

      return false;
    },

    /**
     * Determines whether two queries are equal.
     *
     * @param  {Query} items The query to check against.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Boolean} Boolean indicating whether the queries match.
     */
    sequenceEquals: function (items, comparerFn) {
      var i = this.items.length,
        // get array from query
        items = items.items || items,
        comparer = comparerFn || equals;

      // if lengths don't match, queries do not match
      if (items.length !== this.items.length) {
        return false;
      }

      while (i--) {
        if (!comparer(this.items[i], items[i])) {
          return false;
        }
      }

      return true;
    },

    /**
     * Returns the query or the default element in a query if the query is empty.
     *
     * @param  {<T>} defaultItem The element to return in a query when the query is empty.
     * @return {Query} The query instance or a query with the provided default element.
     */
    defaultIfEmpty: function (defaultItem) {
      return this.items.length ? this : new Q([defaultItem]);
    },

    /**
     * Concatenates two queries.
     *
     * @param  {Query} items The query to concatenate.
     * @return {Query} The combined query.
     */
    concat: function (items) {
      return new Q(this.toArray().concat(items.items || items));
    },

    /**
     * Adds an element to the query.
     *
     * @param {<T>} item The item to add.
     * @return {Query} The query instance.
     */
    add: function (item) {
      this.items.push(item);
      return this;
    },

    /**
     * Removes an element from the query.
     *
     * @param  {<T>} item The item to remove.
     * @return {Query} The query instance.
     */
    remove: function (item) {
      var i = this.items.length;
      while (i--) {
        if (this.items[i] === item) {
          this.items.splice(i, 1);
          break;
        }
      }

      return this;
    },

    /**
     * Clears all elements from the query.
     *
     * @return {Query} The query instance.
     */
    clear: function () {
      this.items.length = 0;
      return this;
    },

    /**
     * Projects each element in a query into a new form.
     *
     * @param  {Function} projectorFn The function to transform the elements.
     * @return {Query} A new query with the transformed elements.
     */
    select: function (projectorFn) {
      var results = [];
      this.forEach(function (item, i) {
        results.push(projectorFn(item, i));
      });

      return new Q(results);
    },

    /**
     * Returns distinct elements from the query.
     *
     * @param  {Function} comparerFn The function to compare equality. (optional)
     * @return {Query} A query of distinct elements.
     */
    distinct: function (comparerFn) {
      var j,
        ln = this.items.length,
        results = [],
        comparer = comparerFn || equals;

      this.forEach(function (item, i) {
        // look through remaining items and see if there is another match
        // save a little processing by skipping the elements we've already compared
        j = ln;
        while (--j > i && !comparer(item, this.items[j])) { }

        // if these equal we made it all the way through the remaining items
        if (i === j) {
          results.push(item);
        }
      }, this);

      return new Q(results);
    },

    /**
     * Sorts a query in the specified order.
     *
     * @param  {Function} keyFn The function to select which criteria to sort by.
     * @param  {Boolean} descending Whether the query should be sorted in descending order.
     * @return {Query} The sorted query.
     */
    orderBy: function (keyFn, descending) {
      // todo: Allow comparer fns to be passed in. 
      var comparer = function (x, y) {
        return x > y ? 1 : x < y ? -1 : 0;
      },
        sorter = function (a, b) {
          var x = keyFn(a),
            y = keyFn(b);
          return comparer(x, y) * (descending ? -1 : 1);
        }

      return new Q(this.items.sort(sorter));
    },

    /**
     * Groups the elements of a query.
     *
     * @param  {Function} grouperFn The function to specify the group key.
     * @return {Query} The grouped query of Group items.
     */
    groupBy: function (grouperFn) {
      var key, groups = {}, results = [];

      // use object to collect key/item results
      this.forEach(function (item, i) {
        key = grouperFn(item, i);
        groups[key] = groups[key] || [];
        groups[key].push(item);
      });

      // assign groups object to an array
      for (key in groups) {
        if (hasOwnProperty.call(groups, key)) {
          results.push(new G(key, groups[key]));
        }
      }

      return new Q(results);
    },

    /**
     * Produces the union of two queries.
     *
     * @param  {Query} items The query to unite with.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Query} The united query.
     */
    union: function (items, comparerFn) {
      return new Q(this.items.concat(items.items || items)).distinct(comparerFn);
    },

    /**
     * Produces the intersection of two queries.
     *
     * @param  {Query} items The query to intersect with.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Query} The intersected query.
     */
    intersect: function (items, comparerFn) {
      var intersected = [],
        comparer = comparerFn || equals;

      // we want to use a query instance to use 'any'
      // if array is passed in, create new query object
      items = items instanceof Query ? items : new Q(items);
      this.forEach(function (a) {
        if (items.any(function (b) { return comparer(a, b); })) {
          intersected.push(a);
        }
      });

      return new Q(intersected).distinct(comparer);
    },

    /**
     * Joins two queries based on matching keys.
     *
     * @param  {Query} items The query to join.
     * @param  {Function} joinerFn The function to determine the matching keys.
     * @param  {Function} selectorFn The function to transform the combined elements.
     * @return {Query} The joined query.
     */
    join: function (items, joinerFn, selectorFn) {
      var results = [],
        i, 
        b, 
        ln = (items.items || items).length;

      // get array from passed in items
      items = items.items || items;
      this.forEach(function (a) {
        i = ln;
        while (i--) {
          b = items[i];
          if (joinerFn(a, b)) {
            results.push(selectorFn(a, b));
          }
        }
      });

      return new Q(results);
    },

    /**
     * Produces the difference of two queries.
     *
     * @param  {Query} items The query to compare.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Query} The diffed query.
     */
    diff: function (items, comparerFn) {
      var results = [],
        comparer = comparerFn || equals,
        listA = this,
        listB = items instanceof Q ? items : new Q(items);

      listA.forEach(function (a) {
        if (!listB.any(function (b) {
          return comparer(a, b);
        })) {
          results.push(a);
        }
      });

      listB.forEach(function (a) {
        if (!listA.any(function (b) {
          return comparer(a, b);
        })) {
          results.push(a);
        }
      });

      return new Q(results).distinct(comparer);
    },

    /**
     * Merges two queries based on the specified predicate.
     *
     * @param  {Query} items The query to merge.
     * @param  {Function} projectorFn The function to transform the merged elements.
     * @return {Query} Query of the merged results.
     */
    zip: function (items, projectorFn) {
      var i = 0,
        // we will only process up to the end of the smallest query
        ln = m.min(this.items.length, (items.items || items).length),
        results = [];

      while (i < ln) {
        results.push(projectorFn(this.items[i], (items.items || items)[i]));
        i++;
      }

      return new Q(results);
    },

    /**
     * Reverses the query.
     *
     * @return {Query} The reversed query.
     */
    reverse: function () {
      return new Q(this.toArray().reverse());
    },

    /**
     * Returns the specified number of elements from the beginning of the query.
     *
     * @param  {Number} count The number of elements to return.
     * @return {Query} The selected elements.
     */
    take: function (count) {
      return new Q(slice.call(this.items, 0, count));
    },

    /**
     * Returns elements while the specified predicate matches.
     *
     * @param  {Function} predicateFn The function to test each element for a condition.
     * @return {Query} A query of matching elements.
     */
    takeWhile: function (predicateFn) {
      var i = 0,
        ln = this.items.length;

      while (i < ln && predicateFn(this.items[i], i)) {
        i++;
      }

      return this.take(i);
    },

    /**
     * Skips the specified number of elements, returning the remainder.
     *
     * @param  {Number} count The number of elements to skip.
     * @return {Query} A query of the remaining elements.
     */
    skip: function (count) {
      return new Q(slice.call(this.items, count));
    },

    /**
     * Skips elements while the specified predicate matches.
     *
     * @param  {Function} predicateFn The function to test each element for a condition.
     * @return {Query} A query of the remaining elements.
     */
    skipWhile: function (predicateFn) {
      var i = 0,
        ln = this.items.length;

      while (i < ln && predicateFn(this.items[i], i)) {
        i++;
      }

      return this.skip(i);
    },

    /**
     * Returns the sum of the query elements.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The sum.
     */
    sum: function (projectorFn) {
      var total = 0,
        transform = isFunction(projectorFn);

      this.forEach(function (item, i) {
        total += transform ? projectorFn(item, i) : item;
      });

      return total;
    },

    /**
     * Returns the average of the query elements.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The average.
     */
    avg: function (projectorFn) {
      return this.sum(projectorFn) / this.items.length;
    },

    /**
     * The maximum value of the query.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The maximum value.
     */
    max: function (projectorFn) {
      return m.max.apply(m, isFunction(projectorFn) ? this.select(projectorFn).items : this.items);
    },

    /**
     * The minimum value of the query.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The minimum value.
     */
    min: function (projectorFn) {
      return m.min.apply(m, isFunction(projectorFn) ? this.select(projectorFn).items : this.items);
    },

    /**
     * Applies a function to each element in a query.
     *
     * @param  {Function} fn The function to apply.
     * @param  {<T>} scope The scope of the function.
     * @return {Query} The query instance.
     */
    forEach: function (fn, scope) {
      var i = 0,
        ln = this.items.length;

      while (i < ln) {
        fn.call(scope, this.items[i], i);
        i++;
      }

      return this;
    },

    /**
     * Produces a clone of the query.
     *
     * @return {Query} The cloned query.
     */
    clone: function () {
      return new Q(this.toArray());
    },

    /**
     * Returns the query as an array.
     *
     * @return {Array} An array of the query elements.
     */
    toArray: function () {
      return slice.call(this.items, 0);
    }
  };

  // update array if necessary
  if (!arrProto.forEach) {
    /**
     * Executes a provided function once per array element.
     *
     * @param  {Function} fn    Function to execute for each element.
     * @param  {Object}   scope Object to use as this when executing callback.
     */
    arrProto.forEach = function (fn, scope) {
      var i = 0,
        ln = this.length;

      while (i < ln) {
        fn.call(scope, this[i], i, this);
        i++;
      }
    }
  }

})(window || global);
