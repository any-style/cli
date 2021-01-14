#!/usr/bin/ts-node
if (process.argv.length < 4) {
  console.log('Usage: [SUITE] [FILES..]')
  process.exit()
}

import load from './lib/loader'
import finder from './lib/finder'
import runner from './lib/runner'
import fmt from './lib/fmt_default'
import {rules} from './lib/state'

import CtxFile from './lib/ctx_file'
import CtxMain from './lib/ctx_main'

new fmt(runner)
const suites = process.argv.slice(2, 3)

runner.emit('BEGIN_FINDING_RULES')
const found_rules: string[][] = []
for (const suite of suites) {
  for (const [rules_dir, rule] of finder(suite)) {
    found_rules.push([suite, rules_dir, rule])
  }
}
runner.emit('END_FINDING_RULES')


runner.emit('BEGIN_PARSING_RULES')
const parsed_rules: (() => void)[] = []
for (const [suite, rules_dir, rule] of found_rules) {
  parsed_rules.push(load(suite, rules_dir, rule))
}
runner.emit('END_PARSING_RULES')


runner.emit('BEGIN_REGISTERING_RULES')
for (const register of parsed_rules) {
  register()
}
runner.emit('END_REGISTERING_RULES')


runner.emit('BEGIN_REGISTERING_FILES')
const files: FileContext[] = process.argv.slice(3).map(file => new CtxFile(file))
runner.emit('END_REGISTERING_FILES')


runner.emit('BEGIN_RUNNING_RULES')
const results: CtxMain[] = []
for (let rule of rules) {
  for (const file of files) {
    runner.emit('BEGIN_RUNNING_RULE', rule)
    const ctx_main = rule.run(file)
    results.push(ctx_main)
    runner.emit('END_RUNNING_RULE', ctx_main, rule)
  }
}
runner.emit('END_RUNNING_RULES')
