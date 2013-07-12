/**
 * Creates an instance of Query.Group.
 *
 * @constructor
 * @param {Object} key The key for group.
 */
Q.Group = function(key, items) {
  this.key = key;
  this.items = items || [];
};

/**
 * Groups the elements of a query.
 *
 * @param  {Function} grouperFn The function to specify the group key.
 * @return {Query} The grouped query of Group items.
 */
Q.fn.groupBy = function(keyFn, projectorFn) {
  var key, groups, results = [];

  // the lookup conversion already groups the items
  groups = this.toLookup(keyFn, projectorFn);
  
  // assign groups object to an array
  for(key in groups) {
    if(hasOwnProperty.call(groups, key)) {
      results.push(new Q.Group(key, groups[key]));
    }
  }

  return new Q(results);
};