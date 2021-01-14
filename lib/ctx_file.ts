import fs from 'fs';

export default class CtxFile implements FileContext {
  private filename: string
  private buffer?: Buffer

  constructor(filename: string) {
    this.filename = filename
  }

  getFilename(): string {
    return this.filename
  }

  getBuffer(): Buffer {
    if (!this.buffer) {
      this.buffer = fs.readFileSync(this.filename);
    }

    return this.buffer;
  }

  getSource(): string {
    return this.getBuffer().toString();
  }

  static fromSource(source: string, name: string = ''): FileContext {
    const ctx = new CtxFile(name);
    ctx.buffer = Buffer.from(source);

    return ctx;
  }
}
