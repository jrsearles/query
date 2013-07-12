var sortRgx = /\b(\w+)\b\s*(asc|desc)?\s*(?:,|$)/gi,
  ascRgx = /^a/i;

function sortDefault(x, y) {
  return x > y ? 1 : x < y ? -1 : 0;
}

function sortString(x, y) {
  return x.localeCompare(y);
}

function parseSorter(fields, sample) {
  var sorts = [];

  // parse string
  fields.replace(sortRgx, function (match, field, direction) {
    sorts.push({
      field: field,
      direction: !direction ? 1 : ascRgx.test(direction) ? 1 : -1,
      comparer: isString(sample[field]) ? sortString : sortDefault
    });
  });

  return createSorter(sorts);    
}

function createSorter(fields) {
  // length can be cached
  var ln = fields.length;

  return function(a, b) {
    var i = -1,
      sort, x, y, value;

    // iterate through sort fields
    while(++i < ln) {
      sort = fields[i];
      x = a[sort.field];
      y = b[sort.field];
      value = sort.comparer(x, y);

      // if != 0 then return value to sort by
      if(value) {
        return value * sort.direction;
      }
    }

    // if we get here they are equal
    return 0;
  };
}

function mergeSort(leftItems, rightItems, map) {
  var left = [], right = [], field, a = leftItems[0], b = rightItems[0];

  // get right
  for (field in map) {
    if (hasOwnProperty.call(map, field)) {
      left.push({ field: field, direction: 1, comparer: isString(a[field]) ? sortString : sortDefault });
      right.push({ field: map[field], direction: 1, comparer: isString(b[field]) ? sortString : sortDefault });
    }
  }

  leftItems.sort(createSorter(left));
  rightItems.sort(createSorter(right));
}

/**
 * Sorts a query in the specified order.
 *
 * @param  {Function|String} sorterOrFields The function to select which criteria to sort by or the fields and direction to sort the query.
 * @return {Query} The sorted query.
 */
Q.fn.orderBy = function(sorterOrFields) {
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
};

/**
 * Reverses the query.
 *
 * @return {Query} The reversed query.
 */
Q.fn.reverse = function() {
  return new Q(this.items.reverse());
};

/**
 * Returns a shuffled copy of the query.
 * @return {Query} The shuffled query.
 */
Q.fn.shuffle = function() {
  if (this.length <= 1) {
    return this.clone();
  }

  var i = this.length, copy = this.toArray(), current, temp, results = [];
  while (i--) {
    current = Math.floor(Math.random() * (i + 1));
    temp = copy[current];
    copy[current] = copy[i];
    results[i] = temp;
  }

  return new Q(results);
};