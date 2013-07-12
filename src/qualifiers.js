/**
 * Determines whether all elements matches a given predicate.
 *
 * @param  {Function} predicateFn The function to test each element for a condition. (optional)
 * @return {Boolean} Boolean Indicates whether all elements match the given condition.
 */
Q.fn.all = function(predicate) {
  return this.items.every(isFunction(predicate) ? predicate : mapToPredicate(predicate), this);
};

/**
 * Determines whether any element matches a given predicate.
 *
 * @param  {Function} predicateFn The function to test each element for a condition. (optional)
 * @return {Boolean} Boolean indicating whether any elements match the given condition.
 */
Q.fn.any = function(predicate) {
  if (predicate && this.length) {
    return this.items.some(isFunction(predicate) ? predicate : mapToPredicate(predicate), this);
  }

  // if a predicate is passed, just return whether any items are in the query
  return !!this.length;
};

/**
 * Determines whether the query contains the given element.
 *
 * @param  {<T>} item The element to look for.
 * @param  {Function} comparerFn A function to compare equality. (optional)
 * @return {Boolean} Boolean indicating whether the item is contained within the query.
 */
Q.fn.contains = function(item, comparerFn) {
  var comparer = comparerFn || equals;
  return this.any(function (a) { return comparer(a, item); });
};