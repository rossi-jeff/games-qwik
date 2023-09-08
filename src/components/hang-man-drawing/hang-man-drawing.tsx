import { component$, useVisibleTask$ } from "@builder.io/qwik";

export interface HangManDrawingProps {
  wrong: string;
}

export const HangManDrawing = component$<HangManDrawingProps>((props) => {
  const parts = [
    "hm-head",
    "hm-body",
    "hm-left-arm",
    "hm-right-arm",
    "hm-left-leg",
    "hm-right-leg",
  ];
  useVisibleTask$(({ track }) => {
    const wrong = track(() => props.wrong);
    const length = wrong.split(",").filter((l) => l.length == 1).length;
    for (const part of parts) {
      const el = document.getElementById(part);
      if (el) el.style.display = "none";
    }
    for (let i = 0; i < length; i++) {
      const el = document.getElementById(parts[i]);
      if (el) el.style.display = "block";
    }
  });
  return (
    <div id="hang-man-drawing">
      <div id="gallows-top"></div>
      <div id="gallows-left"></div>
      <div id="gallows-base"></div>
      <div id="rope"></div>
      <div id="hm-head"></div>
      <div id="hm-body"></div>
      <div id="hm-left-arm"></div>
      <div id="hm-right-arm"></div>
      <div id="hm-left-leg"></div>
      <div id="hm-right-leg"></div>
    </div>
  );
});
