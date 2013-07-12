/**
 * Concatenates two queries.
 *
 * @param  {Query} items The query to concatenate.
 * @return {Query} The combined query.
 */
Q.fn.concat = function(items) {
  return new Q(this.toArray().concat(items.items || items));
};

/**
 * Returns distinct elements from the query.
 *
 * @param  {Function} comparerFn The function to compare equality. (optional)
 * @return {Query} A query of distinct elements.
 */
Q.fn.distinct = function(comparerFn) {
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
};

/**
 * Returns the items in the query that are not in the passed in query.
 *
 * @param  {Query} items The query to compare.
 * @param  {Function} comparerFn A function to compare equality. (optional)
 * @return {Query} The diffed query.
 */
Q.fn.except = function(items, comparerFn) {
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
};

/**
 * Produces the intersection of two queries.
 *
 * @param  {Query} items The query to intersect with.
 * @param  {Function} comparerFn A function to compare equality. (optional)
 * @return {Query} The intersected query.
 */
Q.fn.intersect = function(items, comparerFn) {
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
};

/**
 * Produces the union of two queries.
 *
 * @param  {Query} items The query to unite with.
 * @param  {Function} comparerFn A function to compare equality. (optional)
 * @return {Query} The united query.
 */
Q.fn.union = function(items, comparerFn) {
  return new Q(this.items.concat(items.items || items)).distinct(comparerFn);
};

/**
 * Merges two queries based on the specified projector function.
 *
 * @param  {Query} items The query to merge.
 * @param  {Function} projectorFn The function to transform the merged elements.
 * @return {Query} Query of the merged results.
 */
Q.fn.zip = function(items, projectorFn) {
  var i = -1,
    // we will only process up to the end of the smallest collection
    ln = Math.min(this.items.length, items.length),
    results = [];

  projectorFn = projectorFn || selectStar;
  items = items.items || items;

  while(++i < ln) {
    results.push(projectorFn(this.items[i], items[i]));
  }

  return new Q(results);
};