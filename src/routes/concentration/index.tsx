import {
  component$,
  useSignal,
  $,
  noSerialize,
  type QwikMouseEvent,
  useStore,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { PlayingCard } from "~/components/playing-card/playing-card";
import { Card } from "~/lib/card.class";
import { Deck } from "~/lib/deck.class";
import type { CardArray } from "~/types/card-container.type";

export default component$(() => {
  const state = useStore<{ cards: CardArray }>({
    cards: [],
  });
  const first = useSignal(false);
  const firstId = useSignal("");
  const second = useSignal(false);
  const secondId = useSignal("");
  const moves = useSignal(0);
  const matches = useSignal(0);

  const deal = $(() => {
    const deck = new Deck();
    deck.shuffle();
    deck.preload();

    state.cards = [];
    while (deck.cards.length) {
      const card = deck.draw();
      if (card) {
        card.clickable = true;
        state.cards.push(noSerialize(card));
      }
    }
    first.value = false;
    firstId.value = "";
    second.value = false;
    secondId.value = "";
    moves.value = 0;
    matches.value = 0;
  });

  const hide = $(() => {
    console.log("hide");
    for (let i = 0; i < state.cards.length; i++) {
      const tmp = state.cards[i];
      if (tmp) {
        const { face, suit, back, id } = tmp;
        const card = new Card(suit, face, back, id);
        card.facedown = true;
        state.cards[i] = noSerialize(card);
      }
    }
  });

  const peek = $(async () => {
    console.log("peek");
    for (let i = 0; i < state.cards.length; i++) {
      const tmp = state.cards[i];
      if (tmp) {
        const { face, suit, back, id } = tmp;
        const card = new Card(suit, face, back, id);
        card.facedown = false;
        state.cards[i] = noSerialize(card);
      }
    }
    setTimeout(() => {
      hide();
    }, 5000);
  });

  const flipCard = $((id: string, facedown: boolean) => {
    const idx = parseInt(id.split("_")[3]);
    const tmp = state.cards[idx];
    if (tmp) {
      const { face, suit, back, id } = tmp;
      const card = new Card(suit, face, back, id);
      card.facedown = facedown;
      state.cards[idx] = noSerialize(card);
    }
  });

  const hideCard = $((id: string) => {
    const el = document.getElementById(id);
    if (el) el.style.visibility = "hidden";
  });

  const handleMatch = $(() => {
    const idx1 = parseInt(firstId.value.split("_")[3]);
    const card1 = state.cards[idx1];
    const idx2 = parseInt(secondId.value.split("_")[3]);
    const card2 = state.cards[idx2];

    if (card1 && card2) {
      if (card1.face == card2.face) {
        hideCard(firstId.value);
        hideCard(secondId.value);
        matches.value++;
      } else {
        flipCard(firstId.value, true);
        flipCard(secondId.value, true);
      }
      first.value = false;
      firstId.value = "";
      second.value = false;
      secondId.value = "";
      moves.value++;
    }
  });

  const cardClicked = $(
    (
      event: QwikMouseEvent<HTMLDivElement, MouseEvent>,
      target: HTMLDivElement
    ) => {
      event.stopPropagation();
      if (first.value) {
        if (firstId.value == target.id) return;
        second.value = true;
        secondId.value = target.id;
        setTimeout(() => {
          handleMatch();
        }, 3000);
      } else {
        first.value = true;
        firstId.value = target.id;
      }
      flipCard(target.id, false);
    }
  );

  const noop = $(() => {});
  return (
    <div>
      <div class="flex flex-wrap justify-between">
        <div>
          <button class="mr-4" onClick$={deal}>
            Deal
          </button>
          <button class="mr-4" onClick$={peek}>
            Peek
          </button>
        </div>
        <div>
          <Link href="/concentration/scores">Top Scores</Link>
        </div>
      </div>
      <div class="flex flex-wrap">
        {state.cards.map((card, index) => (
          <div
            key={index}
            class="card-container mr-4 mb-4"
            id={"card-" + (card ? card.id : index)}
          >
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={0}
              onClick={cardClicked}
              onDragStart={noop}
              from="concentration"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
