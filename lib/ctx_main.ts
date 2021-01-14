import Violation from './violation'
import Parser from './parser'
import Query from './query'
import { languages } from '@any-style/languages'

export default class CtxMain implements MainContext {
  private parser?: Parser;
  private parser_chain: ParserChain | void;
  private file_ctx: FileContext;
  private errors: Violation[];

  constructor(file_ctx: FileContext, parser_chain: ParserChain | void) {
    this.file_ctx = file_ctx;
    this.parser_chain = parser_chain;
    this.errors = [];
  }

  getFilename(): string {
    return this.file_ctx.getFilename();
  }

  getBuffer(): Buffer {
    return this.file_ctx.getBuffer();
  }

  getSource(): string {
    return this.file_ctx.getSource();
  }

  query(lang: LANG, query: string): QueryMatch[] {
    const syn = this.getSyntax(lang);
    const q = new Query(languages.get(lang), query);
    return q.matches(syn);
  }

  hasSyntax(lang: LANG): boolean {
    try {
      this.getSyntax(lang);
      return true;
    } catch {
      return false;
    }
  }

  getSyntax(lang: LANG): SyntaxNode {
    if (!this.parser_chain) {
      throw 'No parser, no syntax'
    }

    if (!this.parser) {
      this.parser = new Parser(this.file_ctx.getSource(), this.parser_chain)
    }

    return this.parser.get(lang);
  }

  violation(title: string): Violation {
    const e = new Violation(title);

    this.errors.push(e);

    return e;
  }

  getErrors(): Violation[] {
    return this.errors;
  }

  toViolations(title: string, matches: QueryMatch[]): void {
    for (const match of matches) {
      for (const capture of match.captures) {
        this
          .violation(title)
          .setRange(capture.node.startIndex, capture.node.endIndex)
      }
    }
  }
}
