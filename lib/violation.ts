export default class Violation implements Violation {
  private title: string
  private range: ErrorRange|null = null

  constructor(title: string) {
    this.title = title
  }

  getTitle(): string {
    return this.title
  }

  setRange(start: number, end: number): this {
    if (start >= end) throw 'Incorrect error range given.'
    this.range = {start, end}

    return this
  }

  getRange(): ErrorRange|null {
    return this.range
  }
}

interface ErrorRange {
  start: number
  end: number
}
