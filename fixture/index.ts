import path from 'path'

export const fixture_path = (relpath: string = '') => path.join(
  __dirname,
  '..',
  'fixture',
  relpath
)
