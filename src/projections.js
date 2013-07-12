/**
 * Projects each element in a query into a new form.
 *
 * @param  {Function} projectorFn The function to transform the elements.
 * @return {Query} A new query with the transformed elements.
 */
Q.fn.select = function(projectorFn) {
  var projector = isString(projectorFn) ? stringToProjectorFn(projectorFn) : projectorFn;
  return new Q(this.items.map(projector, this));
};

/**
 * Projects each element into a flattened form using a projection function.
 * 
 * @param  {Function} applierFn The function which returns the array of elements to flatten.
 * @param  {Function} projectorFn The function to transform the elements.
 * @return {Query} A new query with the transformed elements.
 */
Q.fn.selectMany = function(applierFn, projectorFn) {
  return new Q(applier(this.items, applierFn, projectorFn || selectStar, false));
};