import vm from 'vm'
import path from 'path'
import fs from 'fs'
import ts from 'typescript'
import Rule from './rule'
import {rules} from './state'

interface Sandbox {
  // TODO mocha declares global type "run" too, this conflicts.
  // run: typeof run;
  lang: typeof lang;
  desc: typeof desc;
}

const load = (suite: string, rules_dir: string, file: string) => {
  const tscode = fs.readFileSync(file).toString()
  const jscode = ts.transpileModule(tscode, {reportDiagnostics: true, compilerOptions: {esModuleInterop: true}})

  if (jscode.diagnostics.length) {
    throw `Failed to transpile "${file}".`
  }

  const script = new vm.Script(jscode.outputText, {filename: file})

  const rule = new Rule()
  rules.push(rule)

  const sandbox: Sandbox = {
    // run: (fn: (ctx: MainContext) => void): void => {
    //   rule.setRunFn(fn)
    // }, // TODO mocha declares global type "run" too, this conflicts.
    lang: (fn: LANG | ((ctx: FileContext) => ParserChain | LANG | void) | ParserChain): void => {
      rule.setParserChain(fn)
    },

    desc: (desc: string): void => {
      rule.setDescription(desc)
    },
  }

  let run_called = false
  const context = vm.createContext({
    ... sandbox,
    run: (fn: (ctx: MainContext) => void): void => {
      rule.setRunFn(fn)
      run_called = true
    },
    exports: {},
    console: {log: console.log},
    require: (id: string) => {
      if (id[0] === '.') {
        return require(path.join(rules_dir, id))
      }

      return require(path.join(suite, 'node_modules', id))
    },
  })

  return () => {
    script.runInContext(context)
    if (!run_called) {
      throw `Cannot register rule "${file}", there MUST be a "run" function call.`
    }
  };
}

export default load
