export class ParseError extends TypeError {
  constructor(public reason: string, public path: string = "") {
    super();
    this.name = "ParseError";
    this.prependPath();
  }

  prependPath(p = "") {
    this.path = p + this.path;
    this.message = `$${this.path} ${this.reason}`;
  }
}
