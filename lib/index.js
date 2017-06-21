'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function Collection(collection) {
  if (typeof collection === 'undefined') {
    this.items = [];
  } else {
    this.items = collection;
  }
};

Collection.prototype.unique = function (key) {
  var collection = void 0;

  if (typeof key === 'undefined') {
    collection = this.items.filter(function (element, index, self) {
      return self.indexOf(element) === index;
    });
  } else {
    collection = [];

    var usedKeys = [];

    for (var iterator = 0; iterator < this.items.length; iterator++) {
      var uniqueKey = void 0;
      if (typeof key === 'function') {
        uniqueKey = key(this.items[iterator]);
      } else {
        uniqueKey = this.items[iterator][key];
      }

      if (usedKeys.indexOf(uniqueKey) === -1) {
        collection.push(this.items[iterator]);
        usedKeys.push(uniqueKey);
      }
    }
  }

  return new Collection(collection);
};

Collection.prototype.sum = function (key) {
  var total = 0;

  if (typeof key === 'undefined') {
    for (var i = 0; i < this.items.length; i++) {
      total += this.items[i];
    }
  } else if (typeof key === 'function') {
    for (var _i = 0; _i < this.items.length; _i++) {
      total += key(this.items[_i]);
    }
  } else {
    for (var _i2 = 0; _i2 < this.items.length; _i2++) {
      total += this.items[_i2][key];
    }
  }

  return total;
};

Collection.prototype.average = function (key) {
  return this.avg(key);
};

Collection.prototype.avg = function (key) {
  if (key === undefined) {
    return this.sum() / this.items.length;
  }

  return new Collection(this.items).pluck(key).sum() / this.items.length;
};

Collection.prototype.median = function (key) {
  var length = this.items.length;

  if (typeof key === 'undefined') {
    if (length % 2 === 0) {
      return (this.items[length / 2 - 1] + this.items[length / 2]) / 2;
    }

    return this.items[Math.floor(length / 2)];
  }

  if (length % 2 === 0) {
    return (this.items[length / 2 - 1][key] + this.items[length / 2][key]) / 2;
  }

  return this.items[Math.floor(length / 2)][key];
};

Collection.prototype.mode = function (key) {
  var values = [];
  var highestCount = 1;

  if (!this.items.length) {
    return null;
  }

  this.items.forEach(function (item) {
    var _values = values.filter(function (value) {
      if (typeof key !== 'undefined') {
        return value.key === item[key];
      }

      return value.key === item;
    });

    if (!_values.length) {
      if (typeof key !== 'undefined') {
        values.push({ key: item[key], count: 1 });
      } else {
        values.push({ key: item, count: 1 });
      }
    } else {
      var count = ++_values[0].count;

      if (count > highestCount) {
        highestCount = count;
      }
    }
  });

  return values.filter(function (value) {
    return value.count === highestCount;
  }).map(function (value) {
    return value.key;
  });
};

Collection.prototype.count = function () {
  return this.items.length;
};

Collection.prototype.isEmpty = function () {
  return !this.items.length;
};

Collection.prototype.each = function (fn) {
  this.items.forEach(fn);

  return this;
};

Collection.prototype.map = function (fn) {
  var collection = this.items.map(function (item) {
    return fn(item);
  });

  return new Collection(collection);
};

Collection.prototype.mapWithKeys = function (fn) {
  var collection = {};

  this.items.map(function (item) {
    var array = fn(item);
    collection[array[0]] = array[1];
  });

  return new Collection(collection);
};

Collection.prototype.filter = function (fn) {
  var collection = this.items.filter(function (item) {
    return fn(item);
  });

  return new Collection(collection);
};

Collection.prototype.has = function (key) {
  if (Array.isArray(this.items)) {
    return this.items.filter(function (item) {
      return item.hasOwnProperty(key);
    }).length > 0;
  }

  return this.items.hasOwnProperty(key);
};

Collection.prototype.first = function (fn) {
  if (typeof fn === 'function') {
    return this.items.filter(fn)[0];
  }

  return this.items[0];
};

Collection.prototype.last = function (fn) {
  if (typeof fn === 'function') {
    var collection = this.items.filter(fn);

    return collection[collection.length - 1];
  }

  return this.items[this.items.length - 1];
};

Collection.prototype.get = function (key, defaultValue) {
  if (this.items.hasOwnProperty(key)) {
    return this.items[key];
  }

  if (typeof defaultValue === 'function') {
    return defaultValue();
  }

  return defaultValue || null;
};

Collection.prototype.only = function (properties) {
  var collection = {};

  for (var prop in this.items) {
    if (properties.indexOf(prop) !== -1) {
      collection[prop] = this.items[prop];
    }
  }

  return new Collection(collection);
};

Collection.prototype.except = function (properties) {
  var collection = {};

  for (var prop in this.items) {
    if (properties.indexOf(prop) === -1) {
      collection[prop] = this.items[prop];
    }
  }

  return new Collection(collection);
};

Collection.prototype.groupBy = function (key) {
  var collection = {};

  this.items.forEach(function (item, index) {
    var resolvedKey = void 0;

    if (typeof key === 'function') {
      resolvedKey = key(item, index);
    } else {
      resolvedKey = item[key];
    }

    if (!collection.hasOwnProperty(resolvedKey)) {
      collection[resolvedKey] = [];
    }

    collection[resolvedKey].push(item);
  });

  return new Collection(collection);
};

Collection.prototype.where = function (key, operator, value) {
  if (typeof value === 'undefined') {
    value = operator;
    operator = '===';
  }

  var comparisons = {
    '==': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] == value;
      });
    }.bind(this),

    '===': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] === value;
      });
    }.bind(this),

    '!=': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] != value;
      });
    }.bind(this),

    '!==': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] !== value;
      });
    }.bind(this),

    '<': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] < value;
      });
    }.bind(this),

    '<=': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] <= value;
      });
    }.bind(this),

    '>': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] > value;
      });
    }.bind(this),

    '>=': function (key, value) {
      return this.items.filter(function (item) {
        return item[key] >= value;
      });
    }.bind(this)
  };

  return new Collection(comparisons[operator](key, value));
};

Collection.prototype.whereIn = function (key, values) {
  var collection = this.items.filter(function (item) {
    return values.indexOf(item[key]) !== -1;
  });

  return new Collection(collection);
};

Collection.prototype.diff = function (values) {
  if (values instanceof Collection) {
    values = values.all();
  }

  var collection = this.items.filter(function (item) {
    return values.indexOf(item) === -1;
  });

  return new Collection(collection);
};

Collection.prototype.intersect = function (values) {
  if (values instanceof Collection) {
    values = values.all();
  }

  var collection = this.items.filter(function (item) {
    return values.indexOf(item) !== -1;
  });

  return new Collection(collection);
};

Collection.prototype.pluck = function (value, key) {
  if (typeof key !== 'undefined') {
    var _collection = {};

    this.items.forEach(function (item) {
      _collection[item[key]] = item[value];
    });

    return new Collection(_collection);
  }

  var collection = this.items.filter(function (item) {
    return item.hasOwnProperty(value);
  }).map(function (item) {
    return item[value];
  });

  return new Collection(collection);
};

Collection.prototype.implode = function (key, glue) {
  if (typeof glue === 'undefined') {
    return this.items.join(key);
  }

  return new Collection(this.items).pluck(key).all().join(glue);
};

Collection.prototype.pull = function (key) {
  var value = this.items[key] || null;
  delete this.items[key];
  return value;
};

Collection.prototype.push = function (item) {
  this.items.push(item);

  return this;
};

Collection.prototype.put = function (key, value) {
  this.items[key] = value;

  return this;
};

Collection.prototype.shift = function () {
  return this.items.shift();
};

Collection.prototype.chunk = function (size) {
  var chunks = [];

  while (this.items.length) {
    chunks.push(this.items.splice(0, size));
  }

  return new Collection(chunks);
};

Collection.prototype.collapse = function () {
  return new Collection([].concat.apply([], this.items));
};

Collection.prototype.combine = function (array) {
  var collection = {};

  this.items.map(function (key, iterator) {
    collection[key] = array[iterator];
  }.bind(this));

  return new Collection(collection);
};

Collection.prototype.flip = function () {
  var collection = {};

  Object.keys(this.items).map(function (key) {
    collection[this.items[key]] = key;
  }.bind(this));

  return new Collection(collection);
};

Collection.prototype.forget = function (key) {
  delete this.items[key];
  return this;
};

Collection.prototype.forPage = function (page, chunk) {
  var collection = this.items.slice(page * chunk - chunk, page * chunk);

  return new Collection(collection);
};

Collection.prototype.keys = function () {
  if (Array.isArray(this.items)) {
    var keys = [];

    this.items.forEach(function (object) {
      Object.keys(object).forEach(function (key) {
        keys.push(key);
      });
    });

    return new Collection(keys).unique();
  }

  return new Collection(Object.keys(this.items));
};

Collection.prototype.merge = function (objectOrArray) {
  if (Array.isArray(objectOrArray)) {
    return new Collection(this.items.concat(objectOrArray));
  }

  var collection = Object.create(this.items);

  Object.keys(objectOrArray).map(function (key) {
    collection[key] = objectOrArray[key];
  });

  return new Collection(collection);
};

Collection.prototype.max = function (key) {
  if (typeof key === 'string') {
    return Math.max.apply(Math, this.pluck(key).all());
  }

  return Math.max.apply(Math, this.items);
};

Collection.prototype.pipe = function (fn) {
  return fn(this);
};

Collection.prototype.contains = function (key, value) {
  if (typeof value !== 'undefined') {
    return this.items.hasOwnProperty(key) && this.items[key] === value;
  }

  if (typeof key === 'function') {
    return this.items.filter(function (item, index) {
      return key(item, index);
    }).length > 0;
  }

  if (Array.isArray(this.items)) {
    return this.items.indexOf(key) !== -1;
  }

  return this.items.hasOwnProperty(key);
};

Collection.prototype.diffKeys = function (object) {
  if (object instanceof Collection) {
    object = object.all();
  }

  var objectKeys = Object.keys(object);

  var diffKeys = Object.keys(this.items).filter(function (item) {
    return objectKeys.indexOf(item) === -1;
  });

  return new Collection(Object.create(this.items)).only(diffKeys);
};

Collection.prototype.every = function (fn) {
  return this.items.filter(fn).length === this.items.length;
};

Collection.prototype.nth = function (n, offset) {
  if (offset === undefined) {
    offset = 0;
  }

  var collection = this.items.slice(offset).filter(function (item, index) {
    return index % n === 0;
  });

  return new Collection(collection);
};

Collection.prototype.flatMap = function (fn) {
  var values = [];

  for (var prop in this.items) {
    values.push(this.items[prop]);
  }

  var newValues = fn(values);

  var collection = {};

  Object.keys(this.items).map(function (value, index) {
    return collection[value] = newValues[index];
  });

  return new Collection(collection);
};

Collection.prototype.flatten = function (depth) {
  if (typeof depth === 'undefined') {
    depth = Infinity;
  }

  var fullyFlattened = false;
  var collection = [];

  var flat = function flat(items) {
    collection = [];

    if (Array.isArray(items)) {
      items.forEach(function (item) {
        if (typeof item === 'string') {
          collection.push(item);
        } else if (Array.isArray(item)) {
          collection = collection.concat(item);
        } else {
          for (var prop in item) {
            collection = collection.concat(item[prop]);
          }
        }
      });
    } else {
      for (var prop in items) {
        if (typeof items[prop] === 'string') {
          collection.push(items[prop]);
        } else if (Array.isArray(items[prop])) {
          collection = collection.concat(items[prop]);
        } else {
          for (var _prop in items) {
            collection = collection.concat(items[_prop]);
          }
        }
      }
    }

    fullyFlattened = collection.filter(function (item) {
      return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object';
    }).length === 0;

    depth--;
  };

  flat(this.items);

  while (!fullyFlattened && depth > 0) {
    flat(collection);
  }

  return new Collection(collection);
};

Collection.prototype.keyBy = function (key) {
  var collection = {};

  if (typeof key === 'function') {
    this.items.map(function (item) {
      collection[key(item)] = item;
    });
  } else {
    this.items.forEach(function (item) {
      collection[item[key]] = item;
    });
  }

  return new Collection(collection);
};

Collection.prototype.min = function (key) {
  if (key !== undefined) {
    return Math.min.apply(Math, this.pluck(key).all());
  }

  return Math.min.apply(Math, this.items);
};

Collection.prototype.pop = function () {
  return this.items.pop();
};

Collection.prototype.prepend = function (value, key) {
  if (typeof key !== 'undefined') {
    return this.put(key, value);
  }

  this.items.unshift(value);

  return this;
};

Collection.prototype.shuffle = function () {
  var j = void 0,
      x = void 0,
      i = void 0;
  for (i = this.items.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = this.items[i - 1];
    this.items[i - 1] = this.items[j];
    this.items[j] = x;
  }

  return this;
};

Collection.prototype.random = function (length) {
  this.shuffle();

  if (length !== undefined || length === 1) {
    this.items.splice(0, this.items.length - length);

    return this;
  }

  return this.items[0];
};

Collection.prototype.reduce = function (fn, carry) {
  var result = null;
  var _carry = null;

  if (carry !== undefined) {
    _carry = carry;
  }

  this.items.forEach(function (item) {
    result = fn(_carry, item);
    _carry = result;
  });

  return result;
};

Collection.prototype.reject = function (fn) {
  var collection = this.items.filter(function (item) {
    return !fn(item);
  });

  return new Collection(collection);
};

Collection.prototype.reverse = function () {
  var collection = [].concat(this.items).reverse();

  return new Collection(collection);
};

Collection.prototype.search = function (valueOrFunction, strict) {
  if (typeof valueOrFunction === 'function') {
    valueOrFunction = this.items.filter(function (value, key) {
      return valueOrFunction(value, key);
    })[0];
  }

  var operators = {
    normal: function normal(a, b) {
      return a == b;
    },
    strict: function strict(a, b) {
      return a === b;
    }
  };

  var itemKey = this.items.filter(function (item, key) {
    if (strict === undefined) {
      if (operators.normal(item, valueOrFunction)) {
        return item;
      }
    } else {
      if (operators.strict(item, valueOrFunction)) {
        return item;
      }
    }
  })[0];

  var index = this.items.indexOf(itemKey);

  if (index === -1) {
    return false;
  }

  return index;
};

Collection.prototype.slice = function (remove, limit) {
  var collection = this.items.slice(remove);

  if (limit !== undefined) {
    collection = collection.slice(0, limit);
  }

  return new Collection(collection);
};

Collection.prototype.sort = function (fn) {
  var collection = [].concat(this.items);

  if (fn === undefined) {
    collection.sort();
  } else {
    collection.sort(fn);
  }

  return new Collection(collection);
};

Collection.prototype.sortBy = function (valueOrFunction) {
  var collection = [].concat(this.items);

  if (typeof valueOrFunction === 'function') {
    collection.sort(function compare(a, b) {
      if (valueOrFunction(a) < valueOrFunction(b)) return -1;
      if (valueOrFunction(a) > valueOrFunction(b)) return 1;
      return 0;
    });
  } else {
    collection.sort(function compare(a, b) {
      if (a[valueOrFunction] < b[valueOrFunction]) return -1;
      if (a[valueOrFunction] > b[valueOrFunction]) return 1;
      return 0;
    });
  }

  return new Collection(collection);
};

Collection.prototype.splice = function (index, limit, replace) {
  var slicedCollection = this.slice(index, limit);

  this.items = this.diff(slicedCollection.all()).all();

  if (Array.isArray(replace)) {
    for (var iterator = 0; iterator < replace.length; iterator++) {
      this.items.splice(index + iterator, 0, replace[iterator]);
    }
  }

  return slicedCollection;
};

Collection.prototype.sortByDesc = function (valueOrFunction) {
  return this.sortBy(valueOrFunction).reverse();
};

Collection.prototype.take = function (length) {
  if (length < 0) {
    return new Collection(this.items.slice(length));
  }

  return new Collection(this.items.slice(0, length));
};

Collection.prototype.toJson = function () {
  return JSON.stringify(this.items);
};

Collection.prototype.transform = function (fn) {
  this.items = this.items.map(function (item) {
    return fn(item);
  });

  return this;
};

Collection.prototype.union = function (object) {
  var collection = Object.create(this.items);

  for (var prop in object) {
    if (!this.items.hasOwnProperty(prop)) {
      collection[prop] = object[prop];
    }
  }

  return new Collection(collection);
};

Collection.prototype.whereNotIn = function (key, values) {
  var collection = this.items;

  values.forEach(function (value) {
    collection = collection.filter(function (item) {
      return item[key] !== value;
    });
  }.bind(this));

  return new Collection(collection);
};

Collection.prototype.zip = function (array) {
  var collection = this.items.map(function (item, index) {
    return [item, array[index]];
  });

  return new Collection(collection);
};

Collection.prototype.values = function () {
  var collection = [];

  for (var prop in this.items) {
    collection.push(this.items[prop]);
  }

  return new Collection(collection);
};

Collection.prototype.isNotEmpty = function () {
  return !this.isEmpty();
};

Collection.prototype.partition = function (fn) {
  var arrays = [[], []];

  this.items.forEach(function (item) {
    if (fn(item) === true) {
      arrays[0].push(item);
    } else {
      arrays[1].push(item);
    }
  });

  return arrays;
};

Collection.prototype.split = function (numberOfGroups) {
  var itemsPerGroup = Math.round(this.items.length / numberOfGroups);

  var items = JSON.parse(JSON.stringify(this.items));
  var collection = [];

  for (var iterator = 0; iterator < numberOfGroups; iterator++) {
    collection.push(items.splice(0, itemsPerGroup));
  }

  return collection;
};

Collection.prototype.when = function (value, fn) {
  if (value) {
    fn(this);
  }
};

Collection.prototype.times = function (times, fn) {
  for (var iterator = 1; iterator <= times; iterator++) {
    this.items.push(fn(iterator));
  }

  return this;
};

Collection.prototype.tap = function (fn) {
  fn(this);
  return this;
};

Collection.prototype.all = function () {
  return this.items;
};

Collection.prototype[Symbol.iterator] = function () {
  var index = 0;

  return {
    next: function () {
      return {
        value: this.items[index++],
        done: index > this.items.length
      };
    }.bind(this)
  };
};

module.exports = function (collection) {
  return new Collection(collection);
};