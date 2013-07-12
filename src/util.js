var selectRgx = /\b(\w+)\b(?:\s+(?:as\s+)?(\w+))?\s*(?:,|$)/gi;

function isFunction(fn) {
  return typeof fn === "function";
}

function isDefined(o) {
  return typeof o !== "undefined";
}

function isString(o) {
  return typeof o === "string";
}

function isNull(o) {
  return o === null;
}

function mergeObjects(a, b) {
  var prop;
  for(prop in b) {
    if(hasOwnProperty.call(b, prop) && !isDefined(a[prop])) {
      a[prop] = b[prop];
    }
  }

  return a;
}

function equals(a, b) {
  var prop;

  // check reference
  if(a === b) {
    return true;
  }

  // check type
  if(typeof a !== typeof b) {
    return false;
  }

  // do implicit comparison
  if(a == b) {
    return true;
  }

  // check truthiness
  if((!a && b) || (a && !b)) {
    return false;
  }

  if (typeof a === "object") {
    for (prop in a) {
      if (!equals(a[prop], b[prop])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function selectStar(a, b) {
  // copy a to new object
  var o = mergeObjects({}, a);

  if(isDefined(b) && !isNull(b)) {
    mergeObjects(o, b);
  }

  return o;
}

function stringToKeyFn(s) {
  return function(o) {
    return o[s];
  };
}

function stringToProjectorFn(s) {
  var mapper = [];

  s.replace(selectRgx, function (match, field, alias) {
    mapper.push({
      field: field,
      alias: alias || field
    });
  });

  return function(o) {
    var n = {};
    mapper.forEach(function(map) {
      n[map.alias] = o[map.field];
    });

    return n;
  };
}

function mapToJoiner(o) {
  var keys = Object.keys(o), ln = keys.length;

  return function(a, b) {
    var i = -1;
    while (++i < ln) {
      if (a[keys[i]] !== b[o[keys[i]]]) {
        return false;
      }
    }

    return true;
  };
}

function mapToPredicate(o) {
  var keys = Object.keys(o), ln = keys.length;

  return function (a) {
    var i = ln;
    while (i--) {
      if (a[keys[i]] !== o[keys[i]]) {
        return false;
      }
    }

    return true;
  };
}