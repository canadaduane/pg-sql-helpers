
import { sql } from 'pg-sql'
import { KEYS } from '../..'

export const input = sql`
  SELECT ${KEYS([{ id: 1, name: 1 }, { id: 2, name: 2 }])}
  FROM users
`

export const output = {
  text: `SELECT "id", "name" FROM users`,
  values: [],
}
