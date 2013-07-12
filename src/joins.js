function loopJoin(leftItems, rightItems, joinerFn, projectorFn, isOuterJoin, isFullJoin) {
  var results = [],
    rightJoined = [],
    joined;

  leftItems.forEach(function(a) {
    // reset
    joined = false;

    rightItems.forEach(function(b, i) {
      if(joinerFn(a, b)) {
        joined = true;
        results.push(projectorFn(a, b));

        // we only care about the right items if we're doing a full join
        if(isFullJoin) {
          rightJoined[i] = true;
        }
      }
    });

    if(isOuterJoin && !joined) {
      // no match but since we are doing an outer join include left results
      results.push(projectorFn(a, null));
    }
  });

  if (isFullJoin) {
    var i = -1, ln = rightItems.length;

    // include unmatched items from the right results
    while (++i < ln) {
      if (!rightJoined[i]) {
        results.push(projectorFn(null, rightItems[i]));
      }
    }
  }

  return results;
}

function mergeJoin(leftItems, rightItems, map, projectorFn) {
  var joiner = mapToJoiner(map), results = [], a, b,
    i = 0, j = 0, lnLeft = leftItems.length, lnRight = rightItems.length;
  
  // prepare for merge
  mergeSort(leftItems, rightItems, map);

  while (i < lnLeft && j < lnRight) {
    a = leftItems[i];
    b = rightItems[j];
    if (joiner(a, b)) {
      results.push(projectorFn(a, b));
      j++;
    } else if (i < j) {
      i++;
    } else {
      j++;
    }
  }

  return results;
}

function applier(leftItems, applyFn, projectorFn, outerJoin) {
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
    } else if (outerJoin) {
      results.push(projectorFn(a));
    }
  });

  return results;
}

/**
 * Projects each element in a query into a new form. The expected results are an array, 
 * with each element to be inserted into the returned query. Only items that retrieve a
 * valid value from the apply function will be returned.
 * 
 * @param  {Function} applyFn The function which takes in an element and returns a value or values to merge in with the results.
 * @param  {Function} projectorFn The function to transform the elements.
 * @return {Query} A new query with the transformed elements.
 */
Q.fn.crossApply = function(applyFn, projectorFn) {
  return new Q(applier(this.items, applyFn, projectorFn || selectStar, false));
};

/**
 * Joins all items to each item in the query.
 *
 * @param  {Query} items The items to join.
 * @param  {Function} projectorFn The function to transform the combined elements.
 * @return {Query} The joined query.
 */
Q.fn.crossJoin = function(items, projectorFn) {
  var results = [],
    projector = projectorFn || selectStar;

  this.forEach(function(a) {
    items.forEach(function(b) {
      results.push(projector(a, b));
    });
  });

  return new Q(results);
};

/**
 * Joins two queries based on join function. Records that do not match are included from both queries.
 * 
 * @param  {Query} items The query to join.
 * @param  {Function} joinerFn The function to match the two queries.
 * @param  {Function} projectorFn The function to transform the combined elements. (optional)
 * @return {Query} The joined query.
 */
Q.fn.fullJoin = function(items, joinerFn, projectorFn) {
  return new Q(loopJoin(this.items, items.items || items, joinerFn, projectorFn || selectStar, true, true));
};

/**
 * Joins two queries based on matching keys. Records that do not match are excluded.
 *
 * @param  {Query} items The query to join.
 * @param  {Function} joinerFn The function to match the two queries.
 * @param  {Function} projectorFn The function to transform the combined elements. (optional)
 * @return {Query} The joined query.
 */
Q.fn.join = function(items, joinerFn, projectorFn) {
  return new Q((isFunction(joinerFn) ? loopJoin : mergeJoin)(this.items, items.items || items, joinerFn, projectorFn || selectStar, false));
};

/**
 * Projects each element in a query into a new form. The expected results are an array, 
 * with each element to be inserted into the returned query. All items from the existing
 * query will be returned.
 * 
 * @param  {Function} applyFn The function which takes in an element and returns a value or values to merge in with the results.
 * @param  {Function} projectorFn The function to transform the elements.
 * @return {Query} A new query with the transformed elements.
 */
Q.fn.outerApply = function(applyFn, projectorFn) {
  return new Q(applier(this.items, applyFn, projectorFn || selectStar, true));
};

/**
 * Joins two queries based on matching keys. Records that do not match from the base query are included.
 *
 * @param  {Query} items The query to join.
 * @param  {Function} joinerFn The function to match the two queries.
 * @param  {Function} projectorFn The function to transform the combined elements. (For unmatched joins, the second parameter will be undefined.)
 * @return {Query} The joined query.
 */
Q.fn.outerJoin = function(items, joinerFn, projectorFn) {
  return new Q(loopJoin(this.items, items.items || items, joinerFn, projectorFn || selectStar, true));
};