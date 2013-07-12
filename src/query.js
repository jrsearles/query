var Query, Q, 
  // native methods
  slice = Array.prototype.slice,
  hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Creates a Query instance.
 *
 * @constructor
 * @this {Query}
 * @param {Array} items The items to query.
 */
Query = Q = function(items) {
  var me = this;

  // create a clone of the array if passed in 
  // we don't want to modify the original array
  me.items = items && items.length && slice.call(items, 0) || [];

  // create indexers
  me.items.forEach(function(item, i) { 
    me[i] = item; 
  });

  // length is mostly here to make the object "array-like"
  me.length = me.items.length;

  return me;
};

Q.version = "0.9.0";

/**
 * Creates a Query instance.
 *
 * @param  {Array} items The items to query.
 * @return {Query} The Query instance.
 */
Q.from = function(items) {
  return new Q(items);
};

Q.prototype = Q.fn = {
  /**
   * The number of objects in the Query.
   * @type {Number}
   */
  length: 0,

  // Element Operators
  
  /**
   * Returns the element at the specified index.
   *
   * @param  {Number} index       The index of the element to retrieve.
   * @param  {<T>} defaultItem The element to return when no match is found. (optional)
   * @return {<T>} The element at the given index.
   */
  elementAt: function(index, defaultItem) {
    if(index >= this.length || index < 0) {
      return defaultItem;
    }

    return this[index];
  },

  /**
   * Returns the first element of a query.
   *
   * @param  {Function} predicateFn The function to test each element for a condition. (optional)
   * @param  {<T>} defaultItem The element to return when no match is found. (optional)
   * @return {<T>} The first matching element.
   */
  first: function(predicate, defaultItem) {
    // default to null
    defaultItem = isDefined(defaultItem) ? defaultItem : null;

    if(predicate) {
      var i = -1, ln = this.length, item,
        predicateFn = isFunction(predicate) ? predicate : mapToPredicate(predicate);
      
      while(++i < ln) {
        item = this[i];
        if(predicateFn(item, i, this)) {
          return item;
        }
      }

      return defaultItem;
    }

    return this.length ? this[0] : defaultItem;
  },

  /**
   * Returns the last element in a query.
   *
   * @param  {Function} predicateFn The function to test each element for a condition. (optional)
   * @param  {<T>} defaultItem The element to return when no match is found. (optional)
   * @return {<T>} The last matching element.
   */
  last: function(predicate, defaultItem) {
    // default to null
    defaultItem = isDefined(defaultItem) ? defaultItem : null;

    if(predicate) {
      var i = this.length, item,
        predicateFn = isFunction(predicate) ? predicate : mapToPredicate(predicate);

      while(i--) {
        item = this[i];
        if(predicateFn(item, i, this)) {
          return item;
        }
      }

      return defaultItem;
    }

    return this.length ? this[this.length - 1] : defaultItem;
  },

  /**
   * Returns a single specific element in the query.
   *
   * @param  {Function} predicateFn The function to test each element for a condition. (optional)
   * @param  {<T>} defaultItem The element to return when no match is found. (optional)
   * @return {<T>} The matching element.
   * @throws {Error} If more than one element matches the element or no element matches and a default is provided.
   */
  single: function(predicate, defaultItem) {
    var i = this.length, results = [], item;

    if(predicate) {
      var predicateFn = isFunction(predicate) ? predicate : mapToPredicate(predicate);
      while(i--) {
        item = this[i];
        if(predicateFn(item, i, this)) {
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
      results = this;
    }

    if(!results.length && isDefined(defaultItem)) {
      return defaultItem;
    } else if(results.length !== 1) {
      throw new Error("Only one result should be found when calling 'single'.");
    }

    return results[0];
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
    return this.length ? this : new Q([defaultItem]);
  },

  /**
   * Applies a function to each element in a query.
   *
   * @param  {Function} fn The function to apply.
   * @param  {<T>} scope The scope of the function.
   * @return {Query} The query instance.
   */
  forEach: function(fn, scope) {
    var i = -1, ln = this.length;
    while (++i < ln) {
      fn.call(scope, this[i], i, this);
    }

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
    var i = this.length, comparer = comparerFn || equals;

    // if lengths don't match, queries do not match
    if(items.length !== this.length) {
      return false;
    }

    while(i--) {
      if(!comparer(this[i], items[i])) {
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
    return slice.call(this, 0);
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
        throw error("Duplicate keys were attempted to be inserted.");
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