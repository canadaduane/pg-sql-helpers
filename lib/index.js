'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WHERE = exports.where = exports.VALUES = exports.values = exports.UPDATE = exports.update = exports.SORT = exports.sort = exports.SELECT = exports.select = exports.ROW = exports.row = exports.ORDER_BY = exports.orderBy = exports.OR = exports.or = exports.OFFSET = exports.offset = exports.LIMIT = exports.limit = exports.INSERT = exports.insert = exports.COMPOSITES = exports.composites = exports.COMPOSITE = exports.composite = exports.COLUMNS = exports.columns = exports.COLUMN = exports.column = exports.AND = exports.and = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _templateObject = _taggedTemplateLiteral(['', ''], ['', '']),
    _templateObject2 = _taggedTemplateLiteral(['(', ')'], ['(', ')']),
    _templateObject3 = _taggedTemplateLiteral(['INSERT INTO ', ' (', ') ', ''], ['INSERT INTO ', ' (', ') ', '']),
    _templateObject4 = _taggedTemplateLiteral([''], ['']),
    _templateObject5 = _taggedTemplateLiteral(['LIMIT ALL'], ['LIMIT ALL']),
    _templateObject6 = _taggedTemplateLiteral(['LIMIT ', ''], ['LIMIT ', '']),
    _templateObject7 = _taggedTemplateLiteral(['OFFSET ', ''], ['OFFSET ', '']),
    _templateObject8 = _taggedTemplateLiteral(['ORDER BY ', ''], ['ORDER BY ', '']),
    _templateObject9 = _taggedTemplateLiteral(['ROW ', ''], ['ROW ', '']),
    _templateObject10 = _taggedTemplateLiteral(['SELECT ', ''], ['SELECT ', '']),
    _templateObject11 = _taggedTemplateLiteral(['', ' ', ' NULLS LAST'], ['', ' ', ' NULLS LAST']),
    _templateObject12 = _taggedTemplateLiteral(['UPDATE ', ' SET ', ' = ', ''], ['UPDATE ', ' SET ', ' = ', '']),
    _templateObject13 = _taggedTemplateLiteral(['UPDATE ', ' SET (', ') = ', ''], ['UPDATE ', ' SET (', ') = ', '']),
    _templateObject14 = _taggedTemplateLiteral(['VALUES ', ''], ['VALUES ', '']),
    _templateObject15 = _taggedTemplateLiteral(['', '.', ''], ['', '.', '']),
    _templateObject16 = _taggedTemplateLiteral(['', ' ', ' ', ''], ['', ' ', ' ', '']),
    _templateObject17 = _taggedTemplateLiteral(['', ' ', ''], ['', ' ', '']);

var _is = require('is');

var _is2 = _interopRequireDefault(_is);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _pgSql = require('pg-sql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/**
 * A map of operators shorthands to PostgreSQL operators.
 *
 * @type {Object}
 */

var WHERE_OPERATORS = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  ne: '!=',
  neq: '!=',
  like: 'LIKE'

  /**
   * Create a SQL "AND" clause, just like "WHERE".
   *
   * @param {String} ident
   * @param {Object} params
   * @param {Object} options
   * @return {sql}
   */

};function AND(ident, params) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var query = WHERE(ident, params, _extends({}, options, { keyword: 'AND' }));
  return query;
}

/**
 * Create a SQL column expression, with optional table reference.
 * 
 * @param {String} table (optional)
 * @param {String} column
 * @return {sql}
 */

function COLUMN(table, column) {
  if (column == null) {
    column = table;
    table = null;
  }

  var ref = table ? (0, _pgSql.sql)(_templateObject, _pgSql.sql.ident(table, column)) : (0, _pgSql.sql)(_templateObject, _pgSql.sql.ident(column));

  return ref;
}

/**
 * Create a list of SQL identifiers from a `value`.
 *
 * @param {String} table (optional)
 * @param {Object|Array<Object>|Array<String>} value
 * @return {sql}
 */

function COLUMNS(table, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (table != null && !_is2.default.string(table)) {
    value = table;
    table = null;
  }

  var _options$delimiter = options.delimiter,
      delimiter = _options$delimiter === undefined ? ', ' : _options$delimiter;

  var keys = void 0;

  if (_is2.default.object(value)) {
    keys = getDefinedKeys(value);
  } else if (_is2.default.array(value) && _is2.default.object(value[0])) {
    keys = getDefinedKeys(value[0]);
  } else if (_is2.default.array(value) && _is2.default.string(value[0])) {
    keys = value;
  } else {
    throw new Error('The `COLUMNS` SQL helper must be passed an object, an array of objects or an array of strings, but you passed: ' + value);
  }

  var idents = keys.map(function (k) {
    return COLUMN(table, k);
  });
  var query = (0, _pgSql.sql)(_templateObject, _pgSql.sql.join(idents, delimiter));
  return query;
}

/**
 * Create a SQL composite value for the values of an `object`.
 *
 * @param {Object} object
 * @return {sql}
 */

function COMPOSITE(object) {
  if (!_is2.default.object(object)) {
    throw new Error('The `COMPOSITE` SQL helper must be passed an object, but you passed: ' + object);
  }

  var keys = getDefinedKeys(object);
  var vals = keys.map(function (k) {
    return (0, _pgSql.sql)(_templateObject, object[k]);
  });
  var query = (0, _pgSql.sql)(_templateObject2, _pgSql.sql.join(vals, ', '));
  return query;
}

/**
 * Create a list SQL composite values for the values of an `array` of objects.
 *
 * @param {Array} array
 * @return {sql}
 */

function COMPOSITES(array) {
  if (!Array.isArray(array)) {
    array = [array];
  }

  var columns = void 0;
  var composites = array.map(function (object, i) {
    var composite = COMPOSITE(object);
    var keys = getDefinedKeys(object);
    var cols = keys.join(',');

    if (i === 0) {
      columns = cols;
    } else if (cols !== columns) {
      throw new Error('Every entry in a SQL composite expression must have the same columns, but you passed: ' + array);
    }

    return composite;
  });

  var query = _pgSql.sql.join(composites, ', ');
  return query;
}

/**
 * Create a SQL "INSERT" statement from a dictionary or list of `values`.
 *
 * @param {String} table
 * @param {Object|Array<Object>} values
 * @return {sql}
 */

function INSERT(table, values) {
  var query = (0, _pgSql.sql)(_templateObject3, _pgSql.sql.ident(table), COLUMNS(values), VALUES(values));
  return query;
}

/**
 * Create a literal SQL "LIMIT" string from `number`.
 *
 * @param {Number} number
 * @param {Object} options
 * @return {sql}
 */

function LIMIT(number) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (number == null) {
    return (0, _pgSql.sql)(_templateObject4);
  }

  if (options.max) {
    number = Math.min(number, options.max);
  }

  var query = number === Infinity ? (0, _pgSql.sql)(_templateObject5) : (0, _pgSql.sql)(_templateObject6, number);

  return query;
}

/**
 * Create a literal SQL "OFFSET" string from `number`.
 *
 * @param {Number} number
 * @param {Object} options
 * @return {sql}
 */

function OFFSET(number) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (number == null) {
    return (0, _pgSql.sql)(_templateObject4);
  }

  if (options.max) {
    number = Math.min(number, options.max);
  }

  var query = (0, _pgSql.sql)(_templateObject7, number);
  return query;
}

/**
 * Create a SQL "OR" clause, just like "WHERE".
 *
 * @param {String} ident
 * @param {Object} params
 * @param {Object} options
 * @return {sql}
 */

function OR(ident, params) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var query = WHERE(ident, params, _extends({}, options, { keyword: 'OR' }));
  return query;
}

/**
 * Create a SQL "ORDER BY" string from `sorts`.
 *
 * @param {String} table (optional)
 * @param {Array} sorts
 * @return {sql}
 */

function ORDER_BY(table, sorts) {
  if (Array.isArray(table)) {
    sorts = table;
    table = null;
  }

  if (!Array.isArray(sorts)) {
    throw new Error('The `ORDER_BY` SQL helper must be passed an array of sorting parameters, but you passed: ' + sorts);
  }

  if (!sorts.length) {
    return (0, _pgSql.sql)(_templateObject4);
  }

  var values = sorts.map(function (sort) {
    return SORT(table, sort);
  });
  var query = (0, _pgSql.sql)(_templateObject8, _pgSql.sql.join(values, ', '));
  return query;
}

/**
 * Create a SQL `ROW` expression for the values of an `object`.
 *
 * @param {Object} object
 * @return {sql}
 */

function ROW(object) {
  var query = (0, _pgSql.sql)(_templateObject9, COMPOSITE(object));
  return query;
}

/**
 * Create a SQL "SELECT" clause for `table` with `values`.
 *
 * @param {String} table
 * @param {Object|Array<String>|Array<Object>} values
 * @return {sql}
 */

function SELECT(table, values) {
  if (table != null && !_is2.default.string(table)) {
    values = table;
    table = null;
  }

  var query = (0, _pgSql.sql)(_templateObject10, COLUMNS(table, values));
  return query;
}

/**
 * Create a SQL sort expression.
 * 
 * @param {String} table (optional)
 * @param {String} column
 * @return {sql}
 */

function SORT(table, column) {
  if (arguments.length === 1) {
    column = table;
    table = null;
  }

  var order = 'ASC';

  if (column.startsWith('-')) {
    order = 'DESC';
    column = column.slice(1);
  }

  return (0, _pgSql.sql)(_templateObject11, COLUMN(table, column), _pgSql.sql.raw(order));
}

/**
 * Create a SQL "UPDATE" clause for `table` with `values`.
 *
 * @param {String} table
 * @param {Object} values
 * @return {sql}
 */

function UPDATE(table, values) {
  if (typeof table != 'string') {
    values = table;
    table = null;
  }

  if (!_is2.default.object(values)) {
    throw new Error('The `UPDATE` SQL helper must be passed an object, but you passed: ' + values);
  }

  var keys = getDefinedKeys(values);
  var id = table ? (0, _pgSql.sql)(_templateObject, _pgSql.sql.ident(table)) : (0, _pgSql.sql)(_templateObject4);
  var query = keys.length == 1 ? (0, _pgSql.sql)(_templateObject12, id, COLUMN(keys[0]), values[keys[0]]) : (0, _pgSql.sql)(_templateObject13, id, COLUMNS(values), ROW(values));

  return query;
}

/**
 * Create a list of placeholders for the values of an `object`.
 *
 * @param {Object} object
 * @return {sql}
 */

function VALUES(object) {
  if (!Array.isArray(object)) {
    object = [object];
  }

  var query = (0, _pgSql.sql)(_templateObject14, COMPOSITES(object));
  return query;
}

/**
 * Create a SQL "where" clause with `params` and optional `ident`.
 *
 * @param {String} ident
 * @param {Object} params
 * @return {sql}
 */

function WHERE(ident, params) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (_is2.default.object(ident)) {
    params = ident;
    ident = '';
  }

  if (params == null) {
    return (0, _pgSql.sql)(_templateObject4);
  }

  function handle(keys, obj) {
    var key = keys[keys.length - 1];
    var value = obj[key];
    var operator = WHERE_OPERATORS[key] || '=';

    if ((0, _isPlainObject2.default)(value)) {
      var ks = getDefinedKeys(value);
      if (ks.length === 0) return;
      ks.forEach(function (k) {
        return handle([].concat(_toConsumableArray(keys), [k]), value);
      });
      return;
    }

    if (value === null) {
      value = _pgSql.sql.raw('NULL');
      if (operator === '=') operator = 'IS';
      if (operator === '!=') operator = 'IS NOT';
    }

    var ref = key in WHERE_OPERATORS ? keys.slice(0, -1).join('->') : keys.join('->');
    var id = ident ? (0, _pgSql.sql)(_templateObject15, _pgSql.sql.ident(ident), _pgSql.sql.ident(ref)) : (0, _pgSql.sql)(_templateObject, _pgSql.sql.ident(ref));
    var clause = (0, _pgSql.sql)(_templateObject16, id, _pgSql.sql.raw(operator), value);
    clauses.push(clause);
  }

  var _options$keyword = options.keyword,
      keyword = _options$keyword === undefined ? 'WHERE' : _options$keyword,
      _options$delimiter2 = options.delimiter,
      delimiter = _options$delimiter2 === undefined ? 'AND' : _options$delimiter2;

  var clauses = [];

  getDefinedKeys(params).forEach(function (key) {
    handle([key], params);
  });

  if (clauses.length === 0) {
    return (0, _pgSql.sql)(_templateObject4);
  }

  var query = (0, _pgSql.sql)(_templateObject17, _pgSql.sql.raw(keyword), _pgSql.sql.join(clauses, ' ' + delimiter + ' '));
  return query;
}

/**
 * Get the keys for an `object` that don't have undefined values.
 *
 * @param {Object} object
 * @return {Array}
 */

function getDefinedKeys(object) {
  return Object.keys(object).filter(function (k) {
    return object[k] !== undefined;
  }).sort();
}

/**
 * Add lowercase aliases for convenience.
 */

var and = AND;
var column = COLUMN;
var columns = COLUMNS;
var composite = COMPOSITE;
var composites = COMPOSITES;
var insert = INSERT;
var limit = LIMIT;
var offset = OFFSET;
var or = OR;
var orderBy = ORDER_BY;
var row = ROW;
var select = SELECT;
var sort = SORT;
var update = UPDATE;
var values = VALUES;
var where = WHERE;

/**
 * Export.
 *
 * @type {Function}
 */

exports.and = and;
exports.AND = AND;
exports.column = column;
exports.COLUMN = COLUMN;
exports.columns = columns;
exports.COLUMNS = COLUMNS;
exports.composite = composite;
exports.COMPOSITE = COMPOSITE;
exports.composites = composites;
exports.COMPOSITES = COMPOSITES;
exports.insert = insert;
exports.INSERT = INSERT;
exports.limit = limit;
exports.LIMIT = LIMIT;
exports.offset = offset;
exports.OFFSET = OFFSET;
exports.or = or;
exports.OR = OR;
exports.orderBy = orderBy;
exports.ORDER_BY = ORDER_BY;
exports.row = row;
exports.ROW = ROW;
exports.select = select;
exports.SELECT = SELECT;
exports.sort = sort;
exports.SORT = SORT;
exports.update = update;
exports.UPDATE = UPDATE;
exports.values = values;
exports.VALUES = VALUES;
exports.where = where;
exports.WHERE = WHERE;