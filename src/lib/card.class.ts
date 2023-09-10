export class Card {
  readonly suit: string;
  readonly face: string;
  readonly back: string;
  readonly id: number;
  facedown = true;
  clickable = false;
  draggable = false;
  visible = true;

  constructor(suit: string, face: string, back: string, id: number) {
    this.suit = suit;
    this.face = face;
    this.back = back;
    this.id = id;
  }

  get src() {
    return `/cards/front/${this.suit}_${this.face}.svg`;
  }

  get backSrc() {
    return `/cards/back/${this.back}.svg`;
  }

  toString() {
    return `${this.face} of ${this.suit}`;
  }
}
