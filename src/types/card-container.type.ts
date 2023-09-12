import type { NoSerialize } from "@builder.io/qwik";
import type { Card } from "~/lib/card.class";

export type CardContainerType = { [key: string]: Array<NoSerialize<Card>> };

export type CardArray = Array<NoSerialize<Card>>;
