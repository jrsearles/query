/**
 * Filters a sequence based on a predicate.
 *
 * @param  {Function} predicateFn The function to test each element for a condition. (optional)
 * @return {Query} Query with the matching elements.
 */
Q.fn.where = function(predicate) {
  if(predicate) {
    var predicateFn = isFunction(predicate) ? predicate : mapToPredicate(predicate);
    return new Q(this.items.filter(predicateFn, this));
  }

  return this;
};