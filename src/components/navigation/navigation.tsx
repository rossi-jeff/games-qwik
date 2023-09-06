import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export interface NavigationProps {}

export type LinkType = {
  name: string;
  path: string;
};

export const Navigation = component$<NavigationProps>(() => {
  const links: LinkType[] = [
    { name: "Home", path: "/" },
    { name: "Code Breaker", path: "/code_breaker" },
    { name: "Guess Word", path: "/guess_word" },
    { name: "Hang Man", path: "/hang_man" },
    { name: "Free Cell", path: "/free_cell" },
    { name: "Klondike", path: "/klondike" },
    { name: "Spider", path: "/spider" },
    { name: "Concentration", path: "/concentration" },
    { name: "Poker Square", path: "/poker_square" },
    { name: "Sea Battle", path: "/sea_battle" },
    { name: "Yacht", path: "/yacht" },
  ];
  return (
    <div class="m-2 flex flex-wrap justify-between">
      {links.map((l, i) => (
        <Link key={i} href={l.path}>
          {l.name}
        </Link>
      ))}
    </div>
  );
});
