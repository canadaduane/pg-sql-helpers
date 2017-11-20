
import SQL from '../..'

export const input = SQL`
  SELECT *
  FROM users
  ${SQL.WHERE({ name: { eq: 'john' }})}
`

export const text = `
  SELECT *
  FROM users
  WHERE name = $1
`

export const values = [
  'john',
]
