/**
 * Skips the specified number of elements, returning the remainder.
 *
 * @param  {Number} count The number of elements to skip.
 * @return {Query} A query of the remaining elements.
 */
Q.fn.skip = function(count) {
  return new Q(slice.call(this.items, count));
};

/**
 * Skips elements while the specified predicate matches.
 *
 * @param  {Function} predicateFn The function to test each element for a condition.
 * @return {Query} A query of the remaining elements.
 */
Q.fn.skipWhile = function(predicate) {
  var i = -1,
    ln = this.items.length,
    predicateFn = isFunction(predicate) ? predicate : mapToPredicate(predicate);

  while(++i < ln && predicateFn(this.items[i], i, this)) {
  }

  return this.skip(i);
};

/**
 * Returns the specified number of elements from the beginning of the query.
 *
 * @param  {Number} count The number of elements to return.
 * @return {Query} The selected elements.
 */
Q.fn.take = function(count) {
  return new Q(slice.call(this.items, 0, count));
};

/**
 * Returns elements while the specified predicate matches.
 *
 * @param  {Function} predicateFn The function to test each element for a condition.
 * @return {Query} A query of matching elements.
 */
Q.fn.takeWhile = function(predicate) {
  var i = -1,
    ln = this.items.length,
    predicateFn = isFunction(predicate) ? predicate : mapToPredicate(predicate);

  while(++i < ln && predicateFn(this.items[i], i, this)) {}

  return this.take(i);
};