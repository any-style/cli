import { assert } from 'chai'
import finder from '../lib/finder'
import { fixture_path } from '../fixture'

describe('Finder consumes suite path.', () => {

  describe('Suite path must be valid', () => {
    it('throws if suite path not found', () => {
      assert.throws(
        () => finder(fixture_path('finder/unknown')),
        /unknown.*? does not exist/
      )
    })

    it('throws if suite path is not directory', () => {
      assert.throws(
        () => finder(fixture_path('finder/suite_file')),
        /suite_file.*? must be a directory/
      )
    })
  })

  describe('Suite path must contain package.json', () => {
    it('throws if package.json is not found', () => {
      assert.throws(
        () => finder(fixture_path('finder/suite-no-json')),
        /package\.json.*? does not exist/
      )
    })

    it('throws if package.json is not file', () => {
      assert.throws(
        () => finder(fixture_path('finder/suite-dir-json')),
        /package\.json.*? must be a file/
      )
    })

    it('throws if package.json lacks "rules" config', () => {
      assert.throws(
        () => finder(fixture_path('finder/suite-no-rules')),
        /rules.*? config missing/
      )
    })

    it('throws if package.json "rules" config refers to unknown path', () => {
      assert.throws(
        () => finder(fixture_path('finder/suite-not-found-rules')),
        /suite-not-found-rules.*?unknown.*? does not exist/
      )
    })

    it('throws if package.json "rules" config does not refer to directory path', () => {
      assert.throws(
        () => finder(fixture_path('finder/suite-not-dir-rules')),
        /suite-not-dir-rules.*?file.*? must be a directory/
      )
    })
  })

  describe('Finder globs rule files', () => {
    it('finds **/* rule files that matches pattern /rule\\.ts$/', () => {
        assert.equal(finder(fixture_path('finder/suite-good')).length, 2)
    })

    it('returns list of tuple(rule_dir, rule_path)', () => {
        assert.deepEqual(
          finder(fixture_path('finder/suite-good')),
          [
            [
              fixture_path('finder/suite-good/lib'),
              fixture_path('finder/suite-good/lib/rule1.rule.ts'),
            ],
            [
              fixture_path('finder/suite-good/lib'),
              fixture_path('finder/suite-good/lib/grouped/rule1.rule.ts'),
            ],
          ]
        )
    })
  })
})
