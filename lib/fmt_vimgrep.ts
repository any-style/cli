import Rule from './rule';
import CtxMain from './ctx_main';
import {EventEmitter} from 'events';

export default class DefaultFormatter {
  constructor(runner: EventEmitter) {
    runner
      .on('END_RUNNING_RULE', this.onRuleEnd.bind(this))
  }

  onRuleEnd(ctx: CtxMain, _rule: Rule) {
    for (const error of ctx.getErrors()) {
      if (error.getRange() === null) {
        continue // TODO
      }

      let row = 1
      let col = 0
      let cursor = 0

      const {start} = error.getRange()
      const source = ctx.getBuffer()

      while (cursor < start) {
        if (source[cursor ++] === 10) {
          row ++
          col = 0
        }
        col ++
      }

      this.print(ctx.getFilename())
      this.print(':')
      this.print(row)
      this.print(':')
      this.print(col)
      this.print(':')
      this.print(error.getTitle())
      this.print('\n')
    }
  }

  print(line: string | number) {
    process.stdout.write(line + '')
  }
}
