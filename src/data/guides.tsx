import Link from "next/link";
import type { ReactNode } from "react";
import { whatsappUrl } from "@/src/lib/whatsapp";

// Buying guides. Written to answer the questions players actually send us,
// and to rank for the searches that already bring people to the site
// ("harrow size cricket bat", "custom cricket bats", "sialkot bats").

export type Guide = {
  slug: string;
  title: string; // H1 and <title>
  description: string; // meta description
  summary: string; // one-line teaser for cards
  image: string;
  imageAlt: string;
  updated: string; // ISO date
  body: ReactNode;
};

const wa = (text: string) => whatsappUrl(text);

export const GUIDES: Guide[] = [
  {
    slug: "cricket-bat-size-chart",
    title: "Cricket Bat Size Chart: Junior, Harrow and Adult Sizes",
    description:
      "Which cricket bat size do you need? Size 4, 5, 6, Harrow and short handle by height in cm and feet, plus how to check the fit at home.",
    summary: "Size 4 to short handle, matched to height in cm and feet.",
    image: "/assets/products/bats/apex-edition/apex-pro-front-a.webp",
    imageAlt: "A full-size cricket bat standing upright",
    updated: "2026-11-22",
    body: (
      <>
        <p>
          Pick a bat by the player&apos;s height, not their age. A bat that&apos;s too long or too heavy is the most
          common mistake we see with junior players: it slows the swing and teaches bad habits. If you&apos;re between
          two sizes, go for the smaller one.
        </p>
        <h2>Size chart</h2>
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead>
              <tr><th>Bat size</th><th>Player height (cm)</th><th>Player height (ft)</th><th>Rough age</th></tr>
            </thead>
            <tbody>
              <tr><td>Size 4</td><td>145 – 151 cm</td><td>4&apos;9&quot; – 4&apos;11&quot;</td><td>9 – 10</td></tr>
              <tr><td>Size 5</td><td>152 – 159 cm</td><td>5&apos;0&quot; – 5&apos;2&quot;</td><td>10 – 11</td></tr>
              <tr><td>Size 6</td><td>160 – 164 cm</td><td>5&apos;3&quot; – 5&apos;4&quot;</td><td>11 – 13</td></tr>
              <tr><td>Harrow</td><td>165 – 169 cm</td><td>5&apos;5&quot; – 5&apos;6&quot;</td><td>12 – 14</td></tr>
              <tr><td>Small adult</td><td>170 – 174 cm</td><td>5&apos;7&quot; – 5&apos;8&quot;</td><td>14+</td></tr>
              <tr><td>Short handle (full size)</td><td>175 cm and up</td><td>5&apos;9&quot; and up</td><td>Adult</td></tr>
              <tr><td>Long handle</td><td>Usually 185 cm and up</td><td>6&apos;1&quot; and up</td><td>Tall adults</td></tr>
            </tbody>
          </table>
        </div>
        <p className="guide-note">
          Brands size slightly differently, so treat this as a guide. Ages are only a rough indication; height is what
          matters.
        </p>
        <h2>What is a Harrow size bat?</h2>
        <p>
          Harrow is the last junior size before a full-size bat. It suits most players between about 165 and 170 cm,
          usually in their early teens. It&apos;s shorter and lighter than an adult short handle, so a growing player can
          still play straight and play late.
        </p>
        <h2>How to check the fit at home</h2>
        <ol>
          <li>Stand the bat upright next to the player, toe on the floor, while they wear the shoes they play in.</li>
          <li>The top of the handle should sit around the top of the thigh, near the hip.</li>
          <li>Ask them to hold the bat out in front with just the top hand. If the bat drops or wobbles, it&apos;s too heavy.</li>
          <li>Take their stance. They should be able to tap the bat behind the back foot without bending over.</li>
        </ol>
        <h2>Junior bats at Sialkot Cricket Kits</h2>
        <p>
          We sell size 4, 5, 6 and Harrow bats, and we can make a junior bat to order. Send us the player&apos;s height on
          WhatsApp and we&apos;ll confirm the right size before anything ships.
        </p>
        <p className="guide-links">
          <Link href="/shop?category=Junior%20%26%20Harrow%20Bats">Shop junior and Harrow bats</Link>
          <a href={wa("Hello Sialkot Cricket Kits, can you help me pick the right junior bat size? Height: ")} target="_blank" rel="noreferrer">
            Ask us on WhatsApp
          </a>
        </p>
      </>
    ),
  },
  {
    slug: "how-to-choose-a-cricket-bat",
    title: "How to Choose a Cricket Bat: Weight, Willow, Profile and Handle",
    description:
      "A plain guide to choosing a cricket bat: what weight to pick, beauty processed vs bonafide willow, bat profiles, handle shapes and what to ask the seller.",
    summary: "Weight, willow, profile and handle, explained without the jargon.",
    image: "/assets/products/bats/apex-edition/apex-pro-profile-detail.webp",
    imageAlt: "Side profile of a cricket bat showing the spine and edges",
    updated: "2026-11-22",
    body: (
      <>
        <p>
          A good bat is one you can pick up quickly and swing freely for a long innings. Thick edges and a big spine look
          great, but if the bat is too heavy for you, you&apos;ll be late on the ball. Here&apos;s what we tell players
          who message us.
        </p>
        <h2>1. Get the size right first</h2>
        <p>
          Size comes from your height. Most adults use a short handle; very tall players may want a long handle. Juniors
          should check our <Link href="/guides/cricket-bat-size-chart">cricket bat size chart</Link>.
        </p>
        <h2>2. Choose a weight you can control</h2>
        <ul>
          <li><strong>Light, under about 1,160 g (2lb 9oz):</strong> quick hands, good for juniors and players who rely on timing.</li>
          <li><strong>Medium, about 1,160 – 1,250 g (2lb 9oz – 2lb 12oz):</strong> where most club batters land.</li>
          <li><strong>Heavy, over about 1,250 g:</strong> for strong front-foot hitters on true pitches.</li>
        </ul>
        <p>
          If you&apos;re between two weights, take the lighter one. Pick-up (how light it feels in your hands) matters as
          much as the number on the scale, which is why we&apos;ll send you a video of the exact bat.
        </p>
        <h2>3. Beauty processed or bonafide willow</h2>
        <p>
          Beauty processed bats get extra cosmetic finishing for a clean, even face. Bonafide bats are left natural and
          unbleached, so you see the real grain. The finish doesn&apos;t make a bat play better on its own. Read the full
          comparison: <Link href="/guides/beauty-processed-vs-bonafide-cricket-bats">beauty processed vs bonafide</Link>.
        </p>
        <h2>4. Pick a profile that suits how you bat</h2>
        <ul>
          <li><strong>Low or mid-low sweet spot:</strong> for front-foot players and drivers on slower, lower pitches.</li>
          <li><strong>Mid sweet spot:</strong> the all-rounder. Works for most players on most pitches.</li>
          <li><strong>High sweet spot:</strong> for back-foot players who pull and cut on bouncy pitches.</li>
        </ul>
        <h2>5. Round or oval handle</h2>
        <p>
          A round handle lets your bottom hand turn the bat more easily, which suits wristy players. An oval handle gives
          the top hand more control and keeps the face straight. If you&apos;re not sure, round is the common choice.
        </p>
        <h2>6. Ask for a video before you pay</h2>
        <p>
          Every bat is different, even within one model. Ask the seller for photos of the face, edges and back, the exact
          weight, and a ping video. We do this for every bat on request.
        </p>
        <p className="guide-links">
          <Link href="/shop?category=Beauty%20Processed%20Bats">Shop cricket bats</Link>
          <Link href="/custom-bat">Design a custom bat</Link>
        </p>
      </>
    ),
  },
  {
    slug: "how-to-knock-in-a-cricket-bat",
    title: "How to Knock In and Oil a New Cricket Bat",
    description:
      "Step-by-step: how to oil a new cricket bat with raw linseed, how long to knock it in with a mallet, and how to tell when it's ready for match play.",
    summary: "Oiling, mallet work and how long it really takes.",
    image: "/assets/products/bats/apex-edition/apex-pro-edge-a.webp",
    imageAlt: "Edge of a new cricket bat ready for knocking in",
    updated: "2026-11-22",
    body: (
      <>
        <p>
          A new bat needs preparing before it faces a hard ball. Knocking in compresses the fibres on the face and edges
          so they don&apos;t crack the first time you middle one. It takes a few evenings, but it adds seasons to the
          bat&apos;s life.
        </p>
        <h2>What you need</h2>
        <ul>
          <li>Raw linseed oil, not boiled linseed (boiled oil dries hard and can make willow brittle)</li>
          <li>A soft cloth</li>
          <li>A bat mallet, or an old cricket ball in a sock</li>
        </ul>
        <h2>Step 1: Oil lightly</h2>
        <p>
          Rub a teaspoon of oil over the face, edges and toe with the cloth. Keep it off the stickers, the splice and the
          handle. Lay the bat face up and leave it to soak in for about 24 hours. One or two light coats is plenty: too
          much oil makes the bat heavy and dead.
        </p>
        <h2>Step 2: Knock in with a mallet</h2>
        <ol>
          <li>Start gently on the face, then slowly increase the force over the sessions.</li>
          <li>Work the edges at an angle so you round them off rather than hitting them square.</li>
          <li>Tap the toe lightly. Don&apos;t hit the back of the bat.</li>
          <li>Spread it over several days in sessions of 20 to 30 minutes.</li>
        </ol>
        <p>
          Plan on roughly 4 to 6 hours in total for an adult bat and about 2 hours for a junior bat.
        </p>
        <h2>Step 3: Throw-downs with an old ball</h2>
        <p>
          Next, face soft throw-downs or short net sessions with an old ball. If the ball leaves deep seam marks on the
          face, give it more mallet work before using a new ball.
        </p>
        <h2>Want it done for you?</h2>
        <p>
          We can knock in and oil your bat in Sialkot before it ships, so it arrives ready for the nets. Choose knocking-in
          when you design a custom bat, or ask us on WhatsApp for any bat in the shop.
        </p>
        <p className="guide-links">
          <Link href="/custom-bat">Design a custom bat</Link>
          <a href={wa("Hello Sialkot Cricket Kits, can you knock in the bat I'm ordering?")} target="_blank" rel="noreferrer">
            Ask about knocking-in
          </a>
        </p>
      </>
    ),
  },
  {
    slug: "beauty-processed-vs-bonafide-cricket-bats",
    title: "Beauty Processed vs Bonafide Cricket Bats: What's the Difference?",
    description:
      "Beauty processed and bonafide cricket bats explained: how they look, how the finish differs, and which one suits you. From a bat shop in Sialkot.",
    summary: "Clean cosmetic finish or natural willow? How to choose.",
    image: "/assets/products/bats/special-edition/special-edition-front-a.webp",
    imageAlt: "Face of a beauty processed cricket bat",
    updated: "2026-11-22",
    body: (
      <>
        <p>
          You&apos;ll see these two words on bats from Sialkot all the time. They describe how the face of the bat is
          finished, not how well it plays. Here&apos;s the difference in plain terms.
        </p>
        <h2>Beauty processed</h2>
        <p>
          The blade gets extra cosmetic finishing to give it a cleaner, more even look. Surface marks become less visible
          and the grains can look sharper. Most of our match range is beauty processed because many players like a clean
          face.
        </p>
        <h2>Bonafide</h2>
        <p>
          Bonafide bats are left in their natural, unbleached state. You see the willow as it grew: the real grain count,
          the spacing, shade changes and the odd natural mark. Those are part of the wood, not faults. Players who like to
          judge a bat by its grain often prefer bonafide.
        </p>
        <h2>Which plays better?</h2>
        <p>
          Neither, by default. A cosmetic finish doesn&apos;t change how a bat performs, and a natural mark doesn&apos;t
          weaken it. Judge any bat on three things: how it picks up, how it pings off the ball, and its weight. That&apos;s
          why we&apos;ll send you a ping video of the exact bat before you pay.
        </p>
        <h2>Quick comparison</h2>
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead><tr><th></th><th>Beauty processed</th><th>Bonafide</th></tr></thead>
            <tbody>
              <tr><td>Look</td><td>Clean, even face</td><td>Natural willow, grain fully visible</td></tr>
              <tr><td>Marks</td><td>Less visible</td><td>Natural marks may show</td></tr>
              <tr><td>Who it suits</td><td>Players who want a clean match bat</td><td>Players who like to read the grain</td></tr>
            </tbody>
          </table>
        </div>
        <p className="guide-links">
          <Link href="/shop?category=Beauty%20Processed%20Bats">Shop beauty processed bats</Link>
          <Link href="/shop?category=Bonafide%20Bats">Shop bonafide bats</Link>
        </p>
      </>
    ),
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
