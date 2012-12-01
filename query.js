(function(global) {
  "use strict";

  var 
    Q, G, 
    arrProto = Array.prototype,
    objProto = Object.prototype,
    // native methods
    slice = arrProto.slice,
    push = arrProto.push,
    toString = objProto.toString,
    hasOwnProperty = objProto.hasOwnProperty,
    min = Math.min,
    max = Math.max;

  // various helper functions
  function isFunction(fn) {
    return typeof fn === "function";
  }

  function isDefined(o) {
    return typeof o !== "undefined";
  }

  function isString(o) {
    return typeof o === "string";
  }

  function isArray(o) {
    return toString.call(o) === "[object Array]";
  }

  function getProperties(obj) {
    var props = [],
      prop;

    for(prop in obj) {
      if(hasOwnProperty.call(obj, prop)) {
        props.push(prop);
      }
    }

    return props;
  }

  function equals(a, b) {
    // heavily borrowed from underscore's isEqual method.
    var prop;

    // check reference
    if(a === b) {
      return true;
    }

    // check type
    if(typeof a !== typeof b) {
      return false;
    }

    // do implicit comparison
    if(a == b) {
      return true;
    }

    // check truthiness
    if((!a && b) || (a && !b)) {
      return false;
    }

    var typeName = toString.call(a);
    if(toString.call(b) !== typeName) {
      return false;
    }

    if(typeName === "[object String]" || typeName === "[object Number]" || typeName === "[object Boolean]") {
      return a == b;
    }

    if(typeName === "[object Date]") {
      return a.getTime() === b.getTime();
    }

    // get properties into array
    if(getProperties(a).length !== getProperties(b).length) {
      return false;
    }

    // iterate over properties
    for(prop in a) {
      if(hasOwnProperty.call(a, prop) && (!(prop in b) || !equals(a[prop], b[prop]))) {
        return false;
      }
    }

    return true;
  }

  function sortDefault(x, y) {
    return x > y ? 1 : x < y ? -1 : 0;
  }

  function sortString(x, y) {
    return x.localeCompare(y);
  }

  function parseSorter(fields, sample) {
    var sortParam, sorts = [],
      ln;

    // parse string
    fields.split(",").forEach(function(field) {
      sortParam = field.trim().split(" ");
      sorts.push({
        field: sortParam[0],
        direction: sortParam[1] && sortParam[1].toLowerCase() === "desc" ? -1 : 1,
        comparer: isString(sample[sortParam[0]]) ? sortString : sortDefault
      });
    });

    // length can be cached
    ln = sorts.length;

    return function(a, b) {
      var i = 0,
        sort, x, y, value;

      // iterate through sort fields
      while(i < ln) {
        sort = sorts[i];
        x = a[sort.field];
        y = b[sort.field];
        value = sort.comparer(x, y);

        // if != 0 then return value to sort by
        if(value) {
          return value * sort.direction;
        }

        i++;
      }

      // if we get here they are equal
      return 0;
    }
  }

  function joiner(leftItems, rightItems, joinerFn, projectorFn, isOuterJoin) {
    var results = [],
      joined;

    leftItems.forEach(function(a) {
      // reset
      joined = false;

      rightItems.forEach(function(b) {
        if(joinerFn(a, b)) {
          joined = true;
          results.push(projectorFn(a, b));
        }
      });

      if(isOuterJoin && !joined) {
        // no match but since we are doing an outer join include left results
        results.push(projectorFn(a));
      }
    });

    return results;
  }

  function applier(leftItems, applyFn, projectorFn, isOuterJoin) {
    var results = [], result;

    leftItems.forEach(function (a, i) {
      result = applyFn(a, i);

      if (isDefined(result)) {
        // check if array/query is returned, add each element if so
        if (isFunction(result.forEach)) {
          result.forEach(function (b) {
            results.push(projectorFn(a, b));
          });
        } else {
          // otherwise just add object
          results.push(projectorFn(a, result));
        }
      } else if (isOuterJoin) {
        results.push(projectorFn(a));
      }
    });

    return results;
  }

  function mergeObjects(a, b) {
    var prop;
    for(prop in b) {
      if(hasOwnProperty.call(b, prop) && !isDefined(a[prop])) {
        a[prop] = b[prop];
      }
    }

    return a;
  }

  function selectStar(a, b) {
    // copy a to new object
    var o = mergeObjects({}, a);

    if(isDefined(b)) {
      mergeObjects(o, b);
    }

    return o;
  }

  function stringToKeyFn(s) {
    return function(o) {
      return o[s];
    }
  }

  /**
   * Creates a Query instance.
   *
   * @constructor
   * @this {Query}
   * @param {Array} items The items to query.
   */
  global.Query = Q = function(items) {
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
  Q.from = function(items) {
    return new Q(items);
  };

  /**
   * Creates an instance of Query.Group.
   *
   * @constructor
   * @param {Object} key The key for group.
   */
  Q.Group = G = function(key, items) {
    this.key = key;
    this.items = items || [];
  };

  Q.prototype = {

    // Aggregates

    /**
     * Returns the average of the query elements.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The average.
     */
    avg: function(projectorFn) {
      return this.sum(projectorFn) / this.items.length;
    },
    
    /**
     * Returns the number of elements in a query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Number} The element count.
     */
    count: function(predicateFn) {
      return predicateFn ? this.where(predicateFn).items.length : this.items.length;
    },

    /**
     * The maximum value of the query.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The maximum value.
     */
    max: function(projectorFn) {
      return max.apply(Math, isFunction(projectorFn) ? this.select(projectorFn).items : this.items);
    },

    /**
     * The minimum value of the query.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The minimum value.
     */
    min: function(projectorFn) {
      return min.apply(Math, isFunction(projectorFn) ? this.select(projectorFn).items : this.items);
    },

    /**
     * Returns the sum of the query elements.
     *
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Number} The sum.
     */
    sum: function(projectorFn) {
      var total = 0,
        transform = isFunction(projectorFn);

      this.forEach(function(item, i) {
        total += transform ? projectorFn(item, i) : item;
      });

      return total;
    },


    // Filtering
    
    /**
     * Filters a sequence based on a predicate.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Query} Query with the matching elements.
     */
    where: function(predicateFn) {
      if(predicateFn) {
        var results = [];
        this.forEach(function(item, i) {
          if(predicateFn(item, i)) {
            results.push(item);
          }
        });

        return new Q(results);
      }

      return this.clone();
    },


    // Element Operators
    
    /**
     * Returns the element at the specified index.
     *
     * @param  {Number} index       The index of the element to retrieve.
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The element at the given index.
     */
    elementAt: function(index, defaultItem) {
      if(index >= this.items.length || index < 0) {
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
    first: function(predicateFn, defaultItem) {
      // swap out arguments
      if(arguments.length === 1 && !isFunction(predicateFn)) {
        defaultItem = predicateFn;
        predicateFn = null;
      }

      // default to null
      defaultItem = isDefined(defaultItem) ? defaultItem : null;
      if(isFunction(predicateFn)) {
        var i = 0,
          ln = this.items.length,
          item;

        while(i < ln) {
          item = this.items[i];
          if(predicateFn(item, i)) {
            return item;
          }

          i++;
        }

        return defaultItem;
      }

      return this.items.length ? this.items[0] : defaultItem;
    },

    /**
     * Returns the last element in a query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The last matching element.
     */
    last: function(predicateFn, defaultItem) {
      // swap out arguments
      if(arguments.length === 1 && !isFunction(predicateFn)) {
        defaultItem = predicateFn;
        predicateFn = null;
      }

      // default to null
      defaultItem = isDefined(defaultItem) ? defaultItem : null;
      if(isFunction(predicateFn)) {
        var i = this.items.length,
          item;

        while(i--) {
          item = this.items[i];
          if(predicateFn(item, i)) {
            return item;
          }
        }

        return defaultItem;
      }

      return this.items.length ? this.items[this.items.length - 1] : defaultItem;
    },

    /**
     * Returns a single specific element in the query.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @param  {<T>} defaultItem The element to return when no match is found. (optional)
     * @return {<T>} The matching element.
     * @throws {Error} If more than one element matches the element or no element matches and a default is provided.
     */
    single: function(predicateFn, defaultItem) {
      var i = this.items.length,
        results = [],
        item;

      // swap out parameters
      if(arguments.length === 1 && !isFunction(predicateFn)) {
        defaultItem = predicateFn;
        predicateFn = null;
      }

      if(predicateFn) {
        while(i--) {
          item = this.items[i];
          if(predicateFn(item, i)) {
            results.push(item);
          }

          // keep iterating, stop when 2 are found (this indicates an error)
          if(results.length === 2) {
            break;
          }
        }
      } else {
        // if no predicate, use the entire collection
        // this assignment is just to make the following simpler
        results = this.items;
      }

      if(!results.length && isDefined(defaultItem)) {
        return defaultItem;
      } else if(results.length !== 1) {
        throw new Error("Only one result should be found when calling 'single'.");
      }

      return results[0];
    },


    // Quantifiers

    /**
     * Determines whether all elements matches a given predicate.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Boolean} Boolean Indicates whether all elements match the given condition.
     */
    all: function(predicateFn) {
      var i = this.items.length;
      while(i--) {
        if(!predicateFn(this.items[i], i)) {
          return false;
        }
      }

      return true;
    },
    
    /**
     * Determines whether any element matches a given predicate.
     *
     * @param  {Function} predicateFn The function to test each element for a condition. (optional)
     * @return {Boolean} Boolean indicating whether any elements match the given condition.
     */
    any: function(predicateFn) {
      // last probably performs a little better
      return this.last(predicateFn) !== null;
    },

    /**
     * Determines whether the query contains the given element.
     *
     * @param  {<T>} item The element to look for.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Boolean} Boolean indicating whether the item is contained within the query.
     */
    contains: function(item, comparerFn) {
      var i = this.items.length,
        comparer = comparerFn || equals;

      while(i--) {
        if(comparer(this.items[i], item)) {
          return true;
        }
      }

      return false;
    },


    // Projection Operators

    /**
     * Projects each element in a query into a new form.
     *
     * @param  {Function} projectorFn The function to transform the elements.
     * @return {Query} A new query with the transformed elements.
     */
    select: function(projectorFn) {
      return new Q(this.items.map(projectorFn));
    },


    // Set Operators

    /**
     * Concatenates two queries.
     *
     * @param  {Query} items The query to concatenate.
     * @return {Query} The combined query.
     */
    concat: function(items) {
      return new Q(this.toArray().concat(items.items || items));
    },

    /**
     * Returns distinct elements from the query.
     *
     * @param  {Function} comparerFn The function to compare equality. (optional)
     * @return {Query} A query of distinct elements.
     */
    distinct: function(comparerFn) {
      var j, me = this, ln = me.items.length,
        results = [],
        comparer = comparerFn || equals;

      me.forEach(function(item, i) {
        // look through remaining items and see if there is another match
        // save a little processing by skipping the elements we've already compared
        j = ln;
        while(--j > i && !comparer(item, me.items[j])) {}

        // if these equal we made it all the way through the remaining items
        if(i === j) {
          results.push(item);
        }
      });

      return new Q(results);
    },

    /**
     * Returns the items in the query that are not in the passed in query.
     *
     * @param  {Query} items The query to compare.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Query} The diffed query.
     */
    except: function(items, comparerFn) {
      var results = [],
        comparer = comparerFn || equals;

      // we want to use a query instance to use `contains`
      // if array is passed in, create new query object
      items = items instanceof Query ? items : new Q(items);
      this.forEach(function(a) {
        if(!items.contains(a, comparer)) {
          results.push(a);
        }
      });

      return new Q(results).distinct(comparer);
    },

    /**
     * Produces the intersection of two queries.
     *
     * @param  {Query} items The query to intersect with.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Query} The intersected query.
     */
    intersect: function(items, comparerFn) {
      var intersected = [],
        comparer = comparerFn || equals;

      // we want to use a query instance to use `contains`
      // if array is passed in, create new query object
      items = items instanceof Query ? items : new Q(items);
      this.forEach(function(a) {
        if(items.contains(a, comparer)) {
          intersected.push(a);
        }
      });

      return new Q(intersected).distinct(comparer);
    },

    /**
     * Produces the union of two queries.
     *
     * @param  {Query} items The query to unite with.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Query} The united query.
     */
    union: function(items, comparerFn) {
      return new Q(this.items.concat(items.items || items)).distinct(comparerFn);
    },

    /**
     * Merges two queries based on the specified projector function.
     *
     * @param  {Query} items The query to merge.
     * @param  {Function} projectorFn The function to transform the merged elements.
     * @return {Query} Query of the merged results.
     */
    zip: function(items, projectorFn) {
      var i = 0,
        // we will only process up to the end of the smallest collection
        ln = min.call(null, this.items.length, (items.items || items).length),
        projectorFn = projectorFn || selectStar,
        results = [];

      items = items.items || items;
      while(i < ln) {
        results.push(projectorFn(this.items[i], items[i]));
        i++;
      }

      return new Q(results);
    },


    // Join Operators

    /**
     * Projects each element in a query into a new form. The expected results are an array, 
     * with each element to be inserted into the returned query. Only items that retrieve a
     * valid value from the apply function will be returned.
     * 
     * @param  {Function} applyFn The function which takes in an element and returns a value or values to merge in with the results.
     * @param  {Function} projectorFn The function to transform the elements.
     * @return {Query} A new query with the transformed elements.
     */
    crossApply: function(applyFn, projectorFn) {
      return new Q(applier(this.items, applyFn, projectorFn || selectStar, false));
    },

    /**
     * Joins all items to each item in the query.
     *
     * @param  {Query} items The items to join.
     * @param  {Function} projectorFn The function to transform the combined elements.
     * @return {Query} The joined query.
     */
    crossJoin: function(items, projectorFn) {
      var results = [],
        projector = projectorFn || selectStar;

      this.forEach(function(a) {
        items.forEach(function(b) {
          results.push(projector(a, b));
        });
      });

      return new Q(results);
    },

    /**
     * Joins two queries based on matching keys. Records that do not match are excluded.
     *
     * @param  {Query} items The query to join.
     * @param  {Function} projectorFn The function to match the two queries.
     * @param  {Function} selectorFn The function to transform the combined elements.
     * @return {Query} The joined query.
     */
    join: function(items, joinerFn, projectorFn) {
      return new Q(joiner(this.items, items.items || items, joinerFn, projectorFn || selectStar, false));
    },
    
    /**
     * Projects each element in a query into a new form. The expected results are an array, 
     * with each element to be inserted into the returned query. All items from the existing
     * query will be returned.
     * 
     * @param  {Function} applyFn The function which takes in an element and returns a value or values to merge in with the results.
     * @param  {Function} projectorFn The function to transform the elements.
     * @return {Query} A new query with the transformed elements.
     */
    outerApply: function(applyFn, projectorFn) {
      return new Q(applier(this.items, applyFn, projectorFn || selectStar, true));
    },

    /**
     * Joins two queries based on matching keys. Records that do not match from the base query are included.
     *
     * @param  {Query} items The query to join.
     * @param  {Function} joinerFn The function to match the two queries.
     * @param  {Function} projectorFn The function to transform the combined elements. (For unmatched joins, the second parameter will be undefined.)
     * @return {Query} The joined query.
     */
    outerJoin: function(items, joinerFn, projectorFn) {
      return new Q(joiner(this.items, items.items || items, joinerFn, projectorFn || selectStar, true));
    },


    // Partitioning

    /**
     * Skips the specified number of elements, returning the remainder.
     *
     * @param  {Number} count The number of elements to skip.
     * @return {Query} A query of the remaining elements.
     */
    skip: function(count) {
      return new Q(slice.call(this.items, count));
    },

    /**
     * Skips elements while the specified predicate matches.
     *
     * @param  {Function} predicateFn The function to test each element for a condition.
     * @return {Query} A query of the remaining elements.
     */
    skipWhile: function(predicateFn) {
      var i = 0,
        ln = this.items.length;

      while(i < ln && predicateFn(this.items[i], i)) {
        i++;
      }

      return this.skip(i);
    },
    
    /**
     * Returns the specified number of elements from the beginning of the query.
     *
     * @param  {Number} count The number of elements to return.
     * @return {Query} The selected elements.
     */
    take: function(count) {
      return new Q(slice.call(this.items, 0, count));
    },

    /**
     * Returns elements while the specified predicate matches.
     *
     * @param  {Function} predicateFn The function to test each element for a condition.
     * @return {Query} A query of matching elements.
     */
    takeWhile: function(predicateFn) {
      var i = 0,
        ln = this.items.length;

      while(i < ln && predicateFn(this.items[i], i)) {
        i++;
      }

      return this.take(i);
    },


    // Grouping & Ordering

    /**
     * Groups the elements of a query.
     *
     * @param  {Function} grouperFn The function to specify the group key.
     * @return {Query} The grouped query of Group items.
     */
    groupBy: function(keyFn, projectorFn) {
      var key, groups, results = [];

      // the lookup conversion already groups the items
      groups = this.toLookup(keyFn, projectorFn);
      
      // assign groups object to an array
      for(key in groups) {
        if(hasOwnProperty.call(groups, key)) {
          results.push(new G(key, groups[key]));
        }
      }

      return new Q(results);
    },

    /**
     * Sorts a query in the specified order.
     *
     * @param  {Function|String} sorterOrFields The function to select which criteria to sort by or the fields and direction to sort the query.
     * @return {Query} The sorted query.
     */
    orderBy: function(sorterOrFields) {
      // short circuit if we don't need to sort
      if(this.items.length < 2) {
        return this.clone();
      }

      var sorter;
      if(isString(sorterOrFields)) {
        sorter = parseSorter(sorterOrFields, this.items[0]);
      } else {
        sorter = sorterOrFields;
      }

      return new Q(this.items.sort(sorter));
    },

    /**
     * Reverses the query.
     *
     * @return {Query} The reversed query.
     */
    reverse: function() {
      return new Q(this.toArray().reverse());
    },


    // Utilities

    /**
     * Produces a clone of the query.
     *
     * @return {Query} The cloned query.
     */
    clone: function() {
      return new Q(this.toArray());
    },

    /**
     * Returns the query or the default element in a query if the query is empty.
     *
     * @param  {<T>} defaultItem The element to return in a query when the query is empty.
     * @return {Query} The query instance or a query with the provided default element.
     */
    defaultIfEmpty: function(defaultItem) {
      return this.items.length ? this : new Q([defaultItem]);
    },

    /**
     * Applies a function to each element in a query.
     *
     * @param  {Function} fn The function to apply.
     * @param  {<T>} scope The scope of the function.
     * @return {Query} The query instance.
     */
    forEach: function(fn, scope) {
      this.items.forEach(fn, scope);
      return this;
    },
    
    /**
     * Determines whether two queries are equal.
     *
     * @param  {Query} items The query to check against.
     * @param  {Function} comparerFn A function to compare equality. (optional)
     * @return {Boolean} Boolean indicating whether the queries match.
     */
    sequenceEquals: function(items, comparerFn) {
      var i = this.items.length,
        // get array from query
        items = items.items || items,
        comparer = comparerFn || equals;

      // if lengths don't match, queries do not match
      if(items.length !== this.items.length) {
        return false;
      }

      while(i--) {
        if(!comparer(this.items[i], items[i])) {
          return false;
        }
      }

      return true;
    },

    /**
     * Returns the query as an array.
     *
     * @return {Array} An array of the query elements.
     */
    toArray: function() {
      return slice.call(this.items, 0);
    },

    /**
     * Maps the query to an object, using a key to store each item. The key value must be unique for each item in the query.
     * 
     * @param  {Function} keyFn The function or key field name to represent the key for each item.
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Object} An object representing a key-value pair.
     */
    toDictionary: function(keyFn, projectorFn) {
      var key, d = {}, transform = isFunction(projectorFn);

      keyFn = isString(keyFn) ? stringToKeyFn(keyFn) : keyFn;
      this.forEach(function (item, i) {
        key = keyFn(item, i);
        if (key in d) {
          throw error("Duplicate keys were attempted to be inserted.")
        }

        d[key] = transform ? projectorFn(item, i) : item;
      });

      return d;
    },

    /**
     * Returns the query as a lookup item. Each key will contain an array of values that match the key value.
     * 
     * @param  {Function} keyFn The function or key field name to represent the key for each item.
     * @param  {Function} projectorFn The function to transform the elements. (optional)
     * @return {Object} An object representing a key-value pair.
     */
    toLookup: function(keyFn, projectorFn) {
      var key, d = {}, 
        transform = isFunction(projectorFn);

      keyFn = isString(keyFn) ? stringToKeyFn(keyFn) : keyFn;
      this.forEach(function (item, i) {
        key = keyFn(item, i);

        d[key] = d[key] || [];
        d[key].push(transform ? projectorFn(item, i) : item);
      });

      return d;
    }
  };
})(window || global);
