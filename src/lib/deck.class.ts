import { Card } from "./card.class";

export class Deck {
  cards: Card[] = [];
  decks = 1;
  suitCount = 4;
  readonly suits: string[] = ["clubs", "diamonds", "hearts", "spades"];
  readonly faces: string[] = [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
  ];
  readonly backs: string[] = [
    "abstract_clouds",
    "abstract_scene",
    "abstract",
    "astronaut",
    "blue",
    "blue2",
    "cars",
    "castle",
    "fish",
    "frog",
    "red",
    "red2",
  ];
  back: string = this.backs[0];
  readonly colors: { [key: string]: string } = {
    clubs: "black",
    diamonds: "red",
    hearts: "red",
    spades: "black",
  };

  constructor(options?: { decks?: number; suits?: number }) {
    this.decks = options && options.decks ? options.decks : 1;
    this.suitCount = options && options.suits ? options.suits : 4;
    this.randomBack();
    this.build();
  }

  build() {
    this.cards = [];
    let id = 1;
    const { decks, suitCount } = this;
    for (let i = 0; i < decks; i++) {
      switch (suitCount) {
        case 4:
          for (const suit of this.suits) {
            for (const face of this.faces) {
              const card = new Card(suit, face, this.back, id);
              this.cards.push(card);
              id++;
            }
          }
          break;
        case 2:
          for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 2; k++) {
              const suit = this.suits[k];
              for (const face of this.faces) {
                const card = new Card(suit, face, this.back, id);
                this.cards.push(card);
                id++;
              }
            }
          }
          break;
        case 1:
          const suit = this.suits[0];
          for (let j = 0; j < 4; j++) {
            for (const face of this.faces) {
              const card = new Card(suit, face, this.back, id);
              this.cards.push(card);
              id++;
            }
          }
          break;
      }
    }
  }

  randomBack() {
    this.back = this.backs[Math.floor(Math.random() * this.backs.length)];
  }

  setBack(idx: number) {
    const back = this.backs[idx];
    if (back) this.back = back;
  }

  shuffle(times: number = 3) {
    if (!this.cards.length) return;
    let tmp: Card,
      rnd: number,
      counter: number = 0;
    while (counter < times) {
      for (let i = this.cards.length - 1; i > 0; i--) {
        tmp = this.cards[i];
        rnd = Math.floor(Math.random() * i);
        if (rnd != i) {
          this.cards[i] = this.cards[rnd];
          this.cards[rnd] = tmp;
        }
      }
      counter++;
    }
  }

  draw() {
    return this.cards.pop();
  }

  color(card: Card) {
    return this.colors[card.suit];
  }

  preload() {
    const images = [];
    let idx = 0;
    for (const back of this.backs) {
      images[idx] = new Image();
      images[idx].src = `/cards/back/${back}.svg`;
      idx++;
    }
    for (const card of this.cards) {
      images[idx] = new Image();
      images[idx].src = card.src;
      idx++;
    }
  }
}
