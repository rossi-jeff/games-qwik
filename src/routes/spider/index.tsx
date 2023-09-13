import {
  component$,
  useSignal,
  useStore,
  $,
  type QwikChangeEvent,
  noSerialize,
  type QwikDragEvent,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { PlayingCard } from "~/components/playing-card/playing-card";
import type { Card } from "~/lib/card.class";
import { Deck } from "~/lib/deck.class";
import type { CardArray, CardContainerType } from "~/types/card-container.type";

export default component$(() => {
  const suitCounts = [1, 2, 4];
  const state = useStore<{ suits: number; stock: CardArray }>({
    suits: 4,
    stock: [],
  });
  const tableau = useStore<CardContainerType>({
    "tableau-0": [],
    "tableau-1": [],
    "tableau-2": [],
    "tableau-3": [],
    "tableau-4": [],
    "tableau-5": [],
    "tableau-6": [],
    "tableau-7": [],
    "tableau-8": [],
    "tableau-9": [],
  });
  const aces = useStore<CardContainerType>({
    "aces-0": [],
    "aces-1": [],
    "aces-2": [],
    "aces-3": [],
    "aces-4": [],
    "aces-5": [],
    "aces-6": [],
    "aces-7": [],
  });
  const playing = useSignal(false);
  const dragging = useSignal("");

  const suitsChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
    state.suits = parseInt(e.target.value);
  });

  const noop = $(() => {});

  const quit = $(() => {
    state.stock = [];
    for (const key in aces) aces[key] = [];
    for (const key in tableau) tableau[key] = [];
    playing.value = false;
  });

  const getAceCount = $(() => {
    let count = 0;
    for (const key in aces) count += aces[key].length;
    return count;
  });

  const adjustDraggable = $(async () => {
    const deck = new Deck();
    let current: Card | undefined,
      previous: Card | undefined,
      length: number,
      continuous: boolean,
      count: number;
    const temp: CardContainerType = {};
    for (const key in tableau) {
      length = tableau[key].length;
      temp[key] = [];
      if (length) {
        for (let i = 0; i < length; i++) {
          const card = tableau[key][i];
          if (card) card.draggable = false;
        }
        previous = undefined;
        continuous = false;
        count = 0;
        while (tableau[key].length) {
          current = tableau[key].pop();
          if (current) {
            if (!previous) {
              current.draggable = true;
              continuous = true;
              count = 1;
            } else if (
              continuous &&
              previous.suit == current.suit &&
              deck.faces.indexOf(current.face) ==
                deck.faces.indexOf(previous.face) + 1
            ) {
              current.draggable = true;
              count++;
            } else continuous = false;
            temp[key].unshift(noSerialize(current));
            if (count == 13) {
              for (const k2 in aces) {
                if (aces[k2].length == 0) {
                  while (temp[key].length) {
                    const card = temp[key].pop();
                    if (card) {
                      card.draggable = false;
                      aces[k2].push(noSerialize(card));
                    }
                  }
                  previous = undefined;
                  count = 0;
                  break;
                }
              }
            } else previous = current;
          }
        }
        setTimeout(() => {
          tableau[key] = temp[key];
        }, 0);
      }
    }
    const aceCount = await getAceCount();
    if (aceCount == 104) quit();
  });

  const onDragStart = $(
    (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
      dragging.value = target.id;
    }
  );

  const getTopCard = $((to: string) => {
    const length = tableau[to].length;
    return length ? tableau[to][length - 1] : undefined;
  });

  const getDraggedCard = $((from: string, cardId: number) => {
    const idx = tableau[from].findIndex((c) => c && c.id == cardId);
    return idx != -1 ? tableau[from][idx] : undefined;
  });

  const canDrop = $(
    (
      topCard: Card | undefined,
      draggedCard: Card | undefined,
      from: string,
      to: string
    ) => {
      if (!topCard) return true;
      if (!draggedCard) return false;
      if (from == to) return false;
      const deck = new Deck();
      if (
        deck.faces.indexOf(topCard.face) ==
        deck.faces.indexOf(draggedCard.face) + 1
      )
        return true;
      return false;
    }
  );

  const moveCards = $((from: string, to: string, cardId: number) => {
    const toMove: Card[] = [];
    let found = false;
    while (!found) {
      const card = tableau[from].pop();
      if (card) {
        toMove.push(card);
        if (card.id == cardId) found = true;
      }
    }
    while (toMove.length) {
      const card = toMove.pop();
      if (card) tableau[to].push(noSerialize(card));
    }
    adjustDraggable();
  });

  const onDrop = $(
    async (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
      const to = target.id;
      const parts = dragging.value.split("_");
      const from = parts[0];
      const cardId = parseInt(parts[2]);
      const topCard = await getTopCard(to);
      const draggedCard = await getDraggedCard(from, cardId);
      const drop = await canDrop(topCard, draggedCard, from, to);
      if (drop) moveCards(from, to, cardId);
    }
  );

  const stockCardClicked = $(() => {
    for (const key in tableau) {
      const card = state.stock.pop();
      if (card) {
        card.facedown = false;
        card.clickable = false;
        tableau[key].push(noSerialize(card));
      }
    }
    adjustDraggable();
  });

  const deal = $(() => {
    const { suits } = state;
    const deck = new Deck({ suits, decks: 2 });
    deck.shuffle();
    deck.preload();

    let counter = 0;
    let index = 0;
    while (counter < 54) {
      const card = deck.draw();
      if (card) {
        card.clickable = false;
        card.facedown = false;
        card.draggable = false;
        tableau[`tableau-${index}`].push(noSerialize(card));
        counter++;
        index++;
        if (index >= 10) index = 0;
      }
    }
    while (deck.cards.length) {
      const card = deck.draw();
      if (card) {
        card.clickable = true;
        card.facedown = true;
        card.draggable = false;
        state.stock.push(noSerialize(card));
      }
    }
    playing.value = true;
    adjustDraggable();
  });
  return (
    <div>
      <div class="flex flex-wrap justify-between">
        <div>
          {!playing.value && (
            <div>
              <label for="suits" class="mr-2">
                Suits
              </label>
              <select name="suits" onChange$={suitsChanged} class="mr-2">
                {suitCounts.map((s, i) => (
                  <option key={i} value={s} selected={s == state.suits}>
                    {s.toString()}
                  </option>
                ))}
              </select>
              <button onClick$={deal}>Deal</button>
            </div>
          )}
          {playing.value && <button onClick$={quit}>Quit</button>}
        </div>
        <div>
          <Link href="/spider/scores">Top Scores</Link>
        </div>
      </div>
      <div class="flex flex-wrap justify-between mb-4">
        <div id="stock" class="card-container">
          {state.stock.map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={0}
              onClick={stockCardClicked}
              onDragStart={noop}
              from="stock"
            />
          ))}
        </div>
        <div class="flex flex-wrap">
          <div id="aces-0" class="card-container ml-4">
            {aces["aces-0"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-0"
              />
            ))}
          </div>
          <div id="aces-1" class="card-container ml-4">
            {aces["aces-1"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-1"
              />
            ))}
          </div>
          <div id="aces-2" class="card-container ml-4">
            {aces["aces-2"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-2"
              />
            ))}
          </div>
          <div id="aces-3" class="card-container ml-4">
            {aces["aces-3"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-3"
              />
            ))}
          </div>
          <div id="aces-4" class="card-container ml-4">
            {aces["aces-4"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-4"
              />
            ))}
          </div>
          <div id="aces-5" class="card-container ml-4">
            {aces["aces-5"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-5"
              />
            ))}
          </div>
          <div id="aces-6" class="card-container ml-4">
            {aces["aces-6"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-6"
              />
            ))}
          </div>
          <div id="aces-7" class="card-container ml-4">
            {aces["aces-7"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={noop}
                from="aces-7"
              />
            ))}
          </div>
        </div>
      </div>
      <div class="flex flex-wrap justify-between mb-4">
        <div
          id="tableau-0"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-0"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-0"
            />
          ))}
        </div>
        <div
          id="tableau-1"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-1"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-1"
            />
          ))}
        </div>
        <div
          id="tableau-2"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-2"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-2"
            />
          ))}
        </div>
        <div
          id="tableau-3"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-3"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-3"
            />
          ))}
        </div>
        <div
          id="tableau-4"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-4"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-4"
            />
          ))}
        </div>
        <div
          id="tableau-5"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-5"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-5"
            />
          ))}
        </div>
        <div
          id="tableau-6"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-6"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-6"
            />
          ))}
        </div>
        <div
          id="tableau-7"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-7"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-7"
            />
          ))}
        </div>
        <div
          id="tableau-8"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-8"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-8"
            />
          ))}
        </div>
        <div
          id="tableau-9"
          class="card-container"
          onDrop$={onDrop}
          preventdefault:dragover
        >
          {tableau["tableau-9"].map((card, index) => (
            <PlayingCard
              key={card ? card.id : index}
              card={card}
              index={index}
              level={index}
              onClick={noop}
              onDragStart={onDragStart}
              from="tableau-9"
            />
          ))}
        </div>
      </div>
    </div>
  );
});
