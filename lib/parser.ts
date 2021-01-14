import TsParser, { SyntaxNode, Tree, Range as Range2 } from 'tree-sitter'
// TODO another type collision Range is defined in global typescript DOM types
import { languages } from '@any-style/languages'

export default class Parser {
  parser: TsParser;
  trees: Map<LANG, Tree>;
  source: string;

  constructor(source: string, chain: ParserChain) {
    this.parser = new TsParser();
    this.trees = new Map();

    this.source = source;

    this.loadChain(chain);
  }

  protected parse(lang: LANG, ranges?: Range2[]): Tree {
    this.parser.setLanguage(languages.get(lang));

    if (ranges) {
      return this.parser.parse(this.source, null, {includedRanges: ranges});
    }

    return this.parser.parse(this.source);
  }

  protected loadChain(chain: ParserChain, parent_tree?: Tree) {
    if (chain.edit) {
      this.source = chain.edit(this.source, parent_tree);
    }

    const tree: Tree = parent_tree && chain.from
      ? this.parse(chain.entry, chain.from(parent_tree))
      : this.parse(chain.entry);

    if (chain.chain) {
      for (let c of chain.chain) {
        this.loadChain(c, tree);
      }
    }

    this.trees[chain.entry] = tree;
  }

  get(lang: LANG): SyntaxNode {
    return this.trees[lang].rootNode;
  }
}
