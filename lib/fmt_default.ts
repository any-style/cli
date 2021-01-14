import chalk from 'chalk';
import Rule from './rule';
import CtxMain from './ctx_main';
import {EventEmitter} from 'events';

export default class DefaultFormatter {
  private indentlvl = 0;

  constructor(runner: EventEmitter) {
    runner
      .on('END_RUNNING_RULE', this.onRuleEnd.bind(this))
  }

  onRuleEnd(ctx: CtxMain, rule: Rule) {
    this.printIndent()
    this.print(chalk.bold(chalk.yellow(rule.getDescription())))
    this.print('\n')
    this.indent()

    for (const error of ctx.getErrors()) {
      this.printIndent()
      this.print(chalk.italic(chalk.yellow(error.getTitle())))
      this.print('\n')
      this.print('\n')

      if (error.getRange() === null) {
        continue // TODO
      }

      const {start, end} = error.getRange()
      const source = ctx.getBuffer()

      // To get two previous preview lines, seek back till 3rd \n exclusive.
      let preview_start = start
      let nl_back = 3

      while (preview_start) {
        if (source[preview_start - 1] === 10) {
          nl_back --
        }

        if (!nl_back) {
          break
        }

        preview_start --
      }

      // To get two next preview lines, seek forward till 3rd \n exclusive.
      let preview_end = end
      let nl_forw = 3

      while (preview_end < source.length) {
        if (source[preview_end + 1] === 10) {
          nl_forw --
        }

        if (!nl_forw) {
          break
        }

        preview_end ++
      }

      let preview = source.slice(preview_start, start).toString()
        + chalk.bgRed(source.slice(start, end).toString())
        + source.slice(end, preview_end).toString()

      // Count lines up to current line number.
      // TODO this could be done once for all errors in particular file
      let line_num = 1
      let index = preview_start

      while (index) {
        if (source[index --] === 10) {
          line_num ++
        }
      }

      for (const line of preview.split('\n')) {
        this.printIndent()
        this.print(chalk.yellow(line_num) + chalk.yellow('|'))
        line_num ++
        this.print(line)
        this.print('\n')
      }

      this.print('\n')
    }

    this.dedent()
  }

  dedent() {
    this.indentlvl -= 1
  }

  indent() {
    this.indentlvl += 1
  }

  printIndent() {
    this.print(Array(this.indentlvl).join(' '))
  }

  print(line: string) {
    process.stdout.write(line)
  }
}
