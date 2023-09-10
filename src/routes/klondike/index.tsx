import {
  component$,
  useStore,
  $,
  useSignal,
  noSerialize,
  type QwikMouseEvent,
  type QwikDragEvent,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { PlayingCard } from "~/components/playing-card/playing-card";
import { Deck } from "~/lib/deck.class";
import type { CardContainerType } from "~/types/card-container.type";

export default component$(() => {
  const tableau = useStore<CardContainerType>({
    "tableau-0": [],
    "tableau-1": [],
    "tableau-2": [],
    "tableau-3": [],
    "tableau-4": [],
    "tableau-5": [],
    "tableau-6": [],
  });
  const aces = useStore<CardContainerType>({
    "aces-0": [],
    "aces-1": [],
    "aces-2": [],
    "aces-3": [],
  });
  const util = useStore<CardContainerType>({
    stock: [],
    waste: [],
  });
  const moves = useSignal(0);
  const dragging = useSignal("");

  const initCardContainers = $(() => {
    util["stock"] = [];
    util["waste"] = [];
    for (let i = 0; i < 7; i++) tableau[`tableau-${i}`] = [];
    for (let i = 0; i < 4; i++) aces[`aces-${i}`] = [];
  });

  const deal = $(() => {
    const deck = new Deck();
    deck.shuffle();
    deck.preload();

    initCardContainers();

    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = deck.draw();
        if (card) {
          if (i == j) {
            card.facedown = false;
            card.draggable = true;
          }
          tableau[`tableau-${j}`].push(noSerialize(card));
        }
      }
    }

    while (deck.cards.length) {
      const card = deck.draw();
      if (card) {
        card.clickable = true;
        card.facedown = true;
        util["stock"].push(noSerialize(card));
      }
    }

    moves.value = 0;
    dragging.value = "";
  });

  const noop = $(() => {});

  const stockCardClicked = $(
    (_: QwikMouseEvent<HTMLDivElement, MouseEvent>, target: HTMLDivElement) => {
      const cardId = target.id.split("_")[2];

      const card = util["stock"].pop();
      if (card && card.id == parseInt(cardId)) {
        card.clickable = false;
        card.facedown = false;
        card.draggable = true;
        util["waste"].push(card);
      } else if (card) {
        util["stock"].push(card);
      }
    }
  );

  const onDragStart = $(
    (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
      dragging.value = target.id;
    }
  );

  const onDrop = $(
    (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
      const to = target.id;
      const dragged = dragging.value;
      console.log({ to, dragged });
    }
  );

  return (
    <div>
      <div class="flex flex-wrap justify-between">
        <button onClick$={deal}>Deal</button>
        <div>
          <Link href="/klondike/scores">Top Scores</Link>
        </div>
      </div>
      <div class="flex flex-wrap justify-between mb-4">
        <div class="flex flex-wrap">
          <div id="stock" class="card-container mr-4">
            {util["stock"].map((card, index) => (
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
          <div id="waste" class="card-container mr-4">
            {util["waste"].map((card, index) => (
              <PlayingCard
                key={card ? card.id : index}
                card={card}
                index={index}
                level={0}
                onClick={noop}
                onDragStart={onDragStart}
                from="waste"
              />
            ))}
          </div>
        </div>
        <div class="flex flex-wrap">
          <div
            id="aces-0"
            class="card-container ml-4"
            onDrop$={onDrop}
            preventdefault:dragover
          >
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
          <div
            id="aces-1"
            class="card-container ml-4"
            onDrop$={onDrop}
            preventdefault:dragover
          >
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
          <div
            id="aces-2"
            class="card-container ml-4"
            onDrop$={onDrop}
            preventdefault:dragover
          >
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
          <div
            id="aces-3"
            class="card-container ml-4"
            onDrop$={onDrop}
            preventdefault:dragover
          >
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
      </div>
    </div>
  );
});
