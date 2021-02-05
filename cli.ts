#!/usr/bin/ts-node
const flags = []
const args = []

for (let i = 2; i < process.argv.length; i ++) {
  if (process.argv[i][0] === '-') {
    flags.push(process.argv[i])
  } else {
    args.push(process.argv[i])
  }
}

if (args.length < 2) {
  console.log('Usage: [SUITE] [FILES..]')
  console.log('Flags:')
  console.log('  -vimgrep  Use vimgrep formatter.')
  process.exit()
}

import path from 'path'
import load from './lib/loader'
import finder from './lib/finder'
import runner from './lib/runner'
import fmt from './lib/fmt_default'
import fmt_vimgrep from './lib/fmt_vimgrep'
import {rules} from './lib/state'

import CtxFile from './lib/ctx_file'
import CtxMain from './lib/ctx_main'

if (flags.includes('-vimgrep')) {
  new fmt_vimgrep(runner)
} else {
  new fmt(runner)
}

const suites = args
  .slice(0, 1)
  // Transform relative paths into absolute.
  .map(suite => suite[0] === '.' ? path.join(__dirname, suite) : suite)

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
const files: FileContext[] = args.slice(1).map(file => new CtxFile(file))
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
