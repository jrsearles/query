/**
 * Returns the average of the query elements.
 *
 * @param  {Function} projectorFn The function to transform the elements. (optional)
 * @return {Number} The average.
 */
Q.fn.avg = function(projectorFn) {
  return this.sum(projectorFn) / this.length;
};

/**
 * Returns the number of elements in a query.
 *
 * @param  {Function} predicateFn The function to test each element for a condition. (optional)
 * @return {Number} The element count.
 */
Q.fn.count = function(predicate) {
  return this.where(predicate).length;
};

/**
 * The maximum value of the query.
 *
 * @param  {Function} projectorFn The function to transform the elements. (optional)
 * @return {Number} The maximum value.
 */
Q.fn.max = function(projectorFn) {
  return Math.max.apply(Math, isFunction(projectorFn) ? this.items.map(projectorFn, this) : this.items);
};

/**
 * The minimum value of the query.
 *
 * @param  {Function} projectorFn The function to transform the elements. (optional)
 * @return {Number} The minimum value.
 */
Q.fn.min = function(projectorFn) {
  return Math.min.apply(Math, isFunction(projectorFn) ? this.items.map(projectorFn, this) : this.items);
};

/**
 * Returns the sum of the query elements.
 *
 * @param  {Function} projectorFn The function to transform the elements. (optional)
 * @return {Number} The sum.
 */
Q.fn.sum = function(projectorFn) {
  var total = 0,
    transform = isFunction(projectorFn);

  this.forEach(function(item, i) {
    total += transform ? projectorFn(item, i) : item;
  });

  return total;
};