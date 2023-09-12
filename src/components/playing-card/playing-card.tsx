import {
  component$,
  useVisibleTask$,
  type QRL,
  type QwikDragEvent,
  type QwikMouseEvent,
  type NoSerialize,
} from "@builder.io/qwik";
import type { Card } from "~/lib/card.class";

export interface PlayingCardProps {
  card: NoSerialize<Card>;
  from: string;
  level: number;
  index: number;
  onClick: QRL<
    (
      event: QwikMouseEvent<HTMLDivElement, MouseEvent>,
      target: HTMLDivElement
    ) => void
  >;
  onDragStart: QRL<
    (event: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => void
  >;
}

export const PlayingCard = component$<PlayingCardProps>((props) => {
  const { card, from, level, index } = props;
  const draggable = card ? card.draggable : false;
  const clickable = card ? card.clickable : false;
  const visible = card ? card.visible : true;
  const id = `${from}_${level}_${card ? card.id : 0}_${index}`;

  useVisibleTask$(() => {
    const el = document.getElementById(id);
    const top = level * 1.5 + 0.5;
    if (el) {
      draggable
        ? el.classList.add("draggable")
        : el.classList.remove("draggable");
      clickable
        ? el.classList.add("clickable")
        : el.classList.remove("clickable");
      el.style.visibility = visible ? "visible" : "hidden";
      el.style.top = `${top}rem`;
    }
  });
  return (
    <div
      class="playing-card"
      id={id}
      draggable={draggable}
      onDragStart$={props.onDragStart}
      onClick$={props.onClick}
    >
      <img
        src={card ? (card.facedown ? card.backSrc : card.src) : ""}
        alt={card ? (card.facedown ? "Card Back " : card.toString()) : ""}
        width={234}
        height={333}
        draggable={false}
        class="playing-card-img"
      />
    </div>
  );
});
