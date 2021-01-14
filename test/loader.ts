import { assert } from 'chai'
import load from '../lib/loader'
import { fixture_path } from '../fixture'
import { rules } from '../lib/state'

describe('Loader loads rules defined in typescript', () => {
  describe('Loader transpiles typescript files', () => {
    it('transpiles valid typescript', () => {
      assert.doesNotThrow(
        () => load(
          fixture_path(),
          fixture_path(),
          fixture_path('loader/parses.typescript.ts')
        )
      )
    })

    it('throws if cannot transpile typescript', () => {
      assert.throws(
        () => load(
          fixture_path(),
          fixture_path(),
          fixture_path('loader/parses.not.typescript.py')
        ),
        /Failed to transpile/
      )
    })

    it('only transpiles, does not execute', () => {
      assert.doesNotThrow(
        () => load(
          fixture_path(),
          fixture_path(),
          fixture_path('loader/parses.typescript.no.exec.ts')
        )
      )
    })
  })

  describe('Loader registers rules', () => {
    it('executes transpiled file that registers rule', () => {
      assert.throws(
        () => load(
          fixture_path(),
          fixture_path(),
          fixture_path('loader/register.exec.ts')
        )(),
        'This executed!'
      )
    })

    it('throws if cannot register rule due to missing mandatory "run" call', () => {
      assert.throws(
        () => load(
          fixture_path(),
          fixture_path(),
          fixture_path('loader/register.no.run.ts')
        )(),
        /there MUST be a "run" function call/
      )
    })
  })

  describe('Loader resolves rule imports relative to suite path', () => {
    it('resolves js import from node_modules', () => {
      assert.throws(
        () => load(
          fixture_path('loader/suite'),
          fixture_path('loader/suite'),
          fixture_path('loader/suite/nm_js_import.ts')
        )(),
        'This is example module value.'
      )
    })

    it('resolves and imports relative js modules', () => {
      assert.throws(
        () => load(
          fixture_path('loader/suite'),
          fixture_path('loader/suite'),
          fixture_path('loader/suite/rel_import_js.ts')
        )(),
        'Relative js export reached.'
      )
    })

    it('resolves and transpiles nested relative typescript modules', () => {
      assert.throws(
        () => load(
          fixture_path('loader/suite'),
          fixture_path('loader/suite'),
          fixture_path('loader/suite/rel_import.ts')
        )(),
        'Relative export reached.'
      )
    })

    it('throws if cannot resolve', () => {
      assert.throws(
        () => load(
          fixture_path('loader/suite'),
          fixture_path('loader/suite'),
          fixture_path('loader/suite/rel_import_not_found.ts')
        )()
      )
    })

    it('resolves all - relative ts/js and js node_modules (recursive import)', () => {
      assert.throws(
        () => load(
          fixture_path('loader/suite'),
          fixture_path('loader/suite'),
          fixture_path('loader/suite/mixed_import.ts')
        )(),
        'Relative export reached.Relative js export reached.This is example module value.c1c2c3'
      )
    })
  })

  describe('Loader loads rules into ./state module', () => {
    it('one call to load adds one rule to rules (rule is not registered)', () => {
      while (rules.length) {
        rules.pop()
      }
      assert.equal(rules.length, 0)
      load(
        fixture_path('loader/suite'),
        fixture_path('loader/suite'),
        fixture_path('loader/suite/mixed_import.ts')
      )
      assert.equal(rules.length, 1)
    })
  })
})
