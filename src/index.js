
import is from 'is'
import isPlainObject from 'is-plain-object'
import { sql } from 'pg-sql'

/**
 * A map of operators shorthands to PostgreSQL operators.
 *
 * @type {Object}
 */

const WHERE_OPERATORS = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  ne: '!=',
  neq: '!=',
}

/**
 * Create a SQL "AND" clause, just like "WHERE".
 *
 * @param {String} ident
 * @param {Object} params
 * @param {Object} options
 * @return {sql}
 */

function AND(ident, params, options = {}) {
  const query = WHERE(ident, params, { ...options, keyword: 'AND' })
  return query
}

/**
 * Create a SQL column expression, with optional table reference.
 * 
 * @param {String} table (optional)
 * @param {String} column
 * @return {sql}
 */

function COLUMN(table, column) {
  if (arguments.length === 1) {
    column = table
    table = null
  }

  const ref = table 
    ? sql`${sql.ident(table)}.${sql.ident(column)}` 
    : sql`${sql.ident(column)}`

  return ref
}

/**
 * Create a SQL "INSERT" statement from a dictionary or list of `values`.
 *
 * @param {String} table
 * @param {Object|Array<Object>} values
 * @return {sql}
 */

function INSERT(table, values) {
  const query = sql`INSERT INTO ${sql.ident(table)} (${KEYS(values)}) VALUES (${VALUES(values)})`
  return query
}

/**
 * Create a list of SQL identifiers from a `value`.
 *
 * @param {String} table (optional)
 * @param {Object|Array<Object>|Array<String>} value
 * @return {sql}
 */

function KEYS(table, value, options = {}) {
  if (table != null && !is.string(table)) {
    value = table
    table = null
  }

  const { delimiter = ', ' } = options
  let keys

  if (is.object(value)) {
    keys = getDefinedKeys(value)
  } else if (is.array(value) && is.object(value[0])) {
    keys = getDefinedKeys(value[0])
  } else if (is.array(value) && is.string(value[0])) {
    keys = value
  } else {
    throw new Error(`The \`KEYS\` SQL helper must be passed an object, an array of objects or an array of strings, but you passed: ${value}`)
  }

  const idents = keys.map(k => table ? sql.ident(table, k) : sql.ident(k))
  const query = sql`${sql.join(idents, delimiter)}`
  return query
}

/**
 * Create a literal SQL "LIMIT" string from `number`.
 *
 * @param {Number} number
 * @param {Object} options
 * @return {sql}
 */

function LIMIT(number, options = {}) {
  if (number == null) return sql``

  if (options.max) {
    number = Math.min(number, options.max)
  }

  const query = number === Infinity
    ? sql`LIMIT ALL`
    : sql`LIMIT ${number}`

  return query
}

/**
 * Create a literal SQL "OFFSET" string from `number`.
 *
 * @param {Number} number
 * @param {Object} options
 * @return {sql}
 */

function OFFSET(number, options = {}) {
  if (number == null) return sql``

  if (options.max) {
    number = Math.min(number, options.max)
  }

  const query = sql`OFFSET ${number}`
  return query
}

/**
 * Create a SQL "OR" clause, just like "WHERE".
 *
 * @param {String} ident
 * @param {Object} params
 * @param {Object} options
 * @return {sql}
 */

function OR(ident, params, options = {}) {
  const query = WHERE(ident, params, { ...options, keyword: 'OR' })
  return query
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
    sorts = table
    table = null
  }

  if (!Array.isArray(sorts)) {
    throw new Error(`The \`ORDER_BY\` SQL helper must be passed an array of sorting parameters, but you passed: ${sorts}`)
  }

  if (!sorts.length) {
    return sql``
  }

  const values = sorts.map(sort => SORT(table, sort))
  const query = sql`ORDER BY ${sql.join(values, ', ')}`
  return query
}

/**
 * Create a SQL "SELECT" clause for `table` with `values`.
 *
 * @param {String} table
 * @param {Object|Array<String>|Array<Object>} values
 * @return {sql}
 */

function SELECT(table, values) {
  if (table != null && !is.string(table)) {
    values = table
    table = null
  }

  const query = sql`SELECT ${KEYS(table, values)}`
  return query
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
    column = table
    table = null
  }

  let order = 'ASC'

  if (column.startsWith('-')) {
    order = 'DESC'
    column = column.slice(1)
  }

  return sql`${COLUMN(table, column)} ${sql.raw(order)} NULLS LAST`
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
    values = table
    table = null
  }

  if (!is.object(values)) {
    throw new Error(`The \`UPDATE\` SQL helper must be passed an object, but you passed: ${values}`)
  }

  const keys = getDefinedKeys(values)
  const id = table ? sql`${sql.ident(table)}` : sql``
  const query = keys.length == 1
    ? sql`UPDATE ${id} SET ${KEYS(values)} = ${VALUES(values)}`
    : sql`UPDATE ${id} SET (${KEYS(values)}) = (${VALUES(values)})`
  return query
}

/**
 * Create a list of placeholders for the values of an `object`.
 *
 * @param {Object} object
 * @return {sql}
 */

function VALUES(object, options = {}) {
  const {
    delimiter = ', ',
    groupDelimiter = '), (',
  } = options

  if (!Array.isArray(object)) {
    object = [object]
  }

  let columns

  const values = object.map((obj, i) => {
    if (!is.object(obj)) {
      throw new Error(`The \`VALUES\` SQL helper must be passed an object or an array of objects, but you passed: ${object}`)
    }

    const keys = getDefinedKeys(obj)
    const vals = keys.map(k => sql`${obj[k]}`)
    const cols = keys.join(',')

    if (i === 0) {
      columns = cols
    } else if (cols !== columns) {
      throw new Error(`Every entry in the array passed to the \`VALUES\` SQL helper must have the same columns, but you passed: ${object}`)
    }

    return sql`${sql.join(vals, delimiter)}`
  })

  const query = sql`${sql.join(values, groupDelimiter)}`
  return query
}

/**
 * Create a SQL "where" clause with `params` and optional `ident`.
 *
 * @param {String} ident
 * @param {Object} params
 * @return {sql}
 */

function WHERE(ident, params, options = {}) {
  if (is.object(ident)) {
    params = ident
    ident = ''
  }

  if (params == null) {
    return sql``
  }

  function handle(keys, obj) {
    const key = keys[keys.length - 1]
    let value = obj[key]
    let operator = WHERE_OPERATORS[key] || '='

    if (isPlainObject(value)) {
      const ks = getDefinedKeys(value)
      if (ks.length === 0) return
      ks.forEach(k => handle([...keys, k], value))
      return
    }

    if (value === null) {
      value = sql.raw('NULL')
      if (operator === '=') operator = 'IS'
      if (operator === '!=') operator = 'IS NOT'
    }

    const ref = key in WHERE_OPERATORS ? keys.slice(0, -1).join('->') : keys.join('->')
    const id = ident ? sql`${sql.ident(ident)}.${sql.ident(ref)}` : sql`${sql.ident(ref)}`
    const clause = sql`${id} ${sql.raw(operator)} ${value}`
    clauses.push(clause)
  }

  const { keyword = 'WHERE', delimiter = 'AND' } = options
  const clauses = []

  getDefinedKeys(params).forEach((key) => {
    handle([key], params)
  })

  if (clauses.length === 0) {
    return sql``
  }

  const query = sql`${sql.raw(keyword)} ${sql.join(clauses, ` ${delimiter} `)}`
  return query
}

/**
 * Get the keys for an `object` that don't have undefined values.
 *
 * @param {Object} object
 * @return {Array}
 */

function getDefinedKeys(object) {
  return Object.keys(object).filter(k => object[k] !== undefined).sort()
}

/**
 * Add lowercase aliases for convenience.
 */

const and = AND
const column = COLUMN
const insert = INSERT
const keys = KEYS
const limit = LIMIT
const offset = OFFSET
const or = OR
const orderBy = ORDER_BY
const select = SELECT
const sort = SORT
const update = UPDATE
const values = VALUES
const where = WHERE

/**
 * Export.
 *
 * @type {Function}
 */

export {
  and, AND,
  column, COLUMN,
  insert, INSERT,
  keys, KEYS,
  limit, LIMIT,
  offset, OFFSET,
  or, OR,
  orderBy, ORDER_BY,
  select, SELECT,
  sort, SORT,
  update, UPDATE,
  values, VALUES,
  where, WHERE,
}
