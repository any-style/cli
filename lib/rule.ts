import CtxMain from './ctx_main'

type ParserChainFn = (ctx: FileContext) => ParserChainFnV
type ParserChainFnV = LANG | ParserChain | ParserChainFn | void

export default class Rule {
  private desc: string
  private parser_chain: ParserChainFnV
  private run_fn: (ctx: MainContext) => void

  getDescription(): string {
    return this.desc
  }

  setDescription(desc: string): void {
    this.desc = desc
  }

  setParserChain(fn: ParserChainFnV): void {
    this.parser_chain = fn
  }

  setRunFn(run_fn: (ctx: MainContext) => void): void {
    this.run_fn = run_fn
  }

  private settleParserChain(fn: ParserChainFnV, file_ctx: FileContext): ParserChain | void {
    if (typeof fn === 'function') {
      return this.settleParserChain(fn(file_ctx), file_ctx)
    } else if (typeof fn === 'string') {
      return {entry: fn}
    }

    return fn
  }

  run(file_ctx: FileContext): CtxMain {
    this.parser_chain = this.settleParserChain(this.parser_chain, file_ctx)

    const ctx_main = new CtxMain(file_ctx, this.parser_chain)

    this.run_fn(ctx_main)

    return ctx_main;
  }
}
