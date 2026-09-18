/**
 * Single source of truth for everything personal on the site.
 * Edit this file and the whole site updates.
 */

/** The title line under "Hello, mate" — keep it short. */
export const tagline = "I use Arch Btw";

/** One-sentence intro shown right after the typewriter hero. */
export const intro =
  "I write code when im bored, I do math, and I play video games when I have free time.";

/** Longer paragraphs shown in the "cat about.txt" section. */
export const about: string[] = [
  "“A society grows great when old men plant trees in whose shade they know they shall never sit.” — Greek proverb",
  "I want to make this world a better place, bit by bit, in my own way. Anyways, I write proofs, do math, code, draw, listen to music, and play video games.",
  "Nowadays, I usually just play Genshin, but I've played a lot of games, such as Minecraft, and a lot of other games. You can check out my game recs in some part of this site im yet to code up </3"
];

/** Where the "view projects" button points. */
export const githubUrl = "https://github.com/susanthh";

export interface Social {
  label: string;
  url: string;
  /** SVG path drawn inside a 24x24 viewBox, stroke-based (lucide-style). */
  icon: string;
}

export const socials: Social[] = [
  {
    label: "X / Twitter",
    url: "https://x.com/your-username",
    icon: "M4 4l16 16M20 4L4 20",
  },
  {
    label: "Discord",
    url: "https://discord.com/users/your-id",
    icon: "M8.5 17c-2.5 0-4.5-1.2-4.5-1.2.3-2.7 1-5 2.3-7.3C7.5 7.8 8.9 7.5 8.9 7.5l.5 1a10 10 0 0 1 5.2 0l.5-1s1.4.3 2.6 1c1.3 2.3 2 4.6 2.3 7.3 0 0-2 1.2-4.5 1.2l-.9-1.4a9 9 0 0 1-5.2 0zM9.5 12.8v.1M14.5 12.8v.1",
  },
  {
    label: "Email",
    url: "mailto:you@example.com",
    icon: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l9 6 9-6",
  },
];

/** SEO/OG description — keep in sync with index.html. */
export const description =
  "Personal website of a software developer and long-time Linux user. Projects live on GitHub.";
