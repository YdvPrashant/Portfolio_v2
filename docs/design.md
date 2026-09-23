# Design notes

The site was rebuilt from an empty tree on 2026-09-24. The brief was to study the
sites Awwwards has awarded, not only portfolios, and bring ideas from several of
them together rather than copy one.

## Research

27 winners were captured in headless Chrome at 1440 by 900, first screen and
three scroll positions each: the Sites of the Year list, the portfolio category
winners, recent Sites of the Month, and the Sites of the Day for September 2026.
Fonts, colours and libraries were read from each page.

What most of them share: type used as the image rather than beside it, one
strong idea per section, smooth scrolling (Lenis on nearly all of them), scroll
tied motion rather than timed motion, and very few colours.

## What came from where

| On this site | Borrowed from | What was taken |
| --- | --- | --- |
| The name drawn in horizontal stripes | Son Daven (Site of the Month), NOTHIN' (portfolio winner) | Striped display letters; the name as the whole hero |
| Stripes that shear and split into cyan, magenta and yellow under the pointer and as you scroll away | Prism's own refracted M, print misregistration | This site's own idea, built on the two above |
| Serif italic words inside grotesk statements | Artiom Yakushev, Lando Norris (Site of the Year) | Mixed families to weight a few words |
| Words that turn from grey to ink as you scroll | Artiom Yakushev, Elliott Mangham, Cerebrium | Scroll scrubbed reading |
| Work that slides sideways as you scroll, with large numerals | Gianluca Gradogna, Boc.Studio, Lama Lama | Numbered index, slide rather than stack |
| Measured on one screen: giant condensed numbers that roll like an odometer, the old figures struck through with a proofreader's pen, and pointing at a number rolls it back to where it started | Lando Norris (Site of the Year) stats pages | Huge numerals with small labels and hand-drawn marks. It replaced bar charts after Cerebrium, which ran to several screens and read as bland; the bars stay on the case studies |
| A photograph set into a sentence that grows to fill the screen | Gianluca Gradogna ("Through this lens") | Image in text |
| Photographs scattered at several depths around their heading | Lando Norris, Floema, Getty's Tracing Art | Loose scatter with parallax |
| An endless field of photographs you drag around | Gionatan Nese, Getty's Tracing Art | Drag to explore |
| The CV as a sheet of stickers printed flat in the site's own inks: a blue university seal, a yellow burst for 1600+, a keycap drawn in line for 74.8 wpm, a cyan Lucknow postage stamp, PRISM in the name's misregistered stripes, and the stack as one-colour die-cut logos. They slap on when seen; point to lift one, drag it anywhere | WC26 Unofficial Player Album (Honorable Mention 2026), Dave Holloway (Honorable Mention), Lando Norris | Die-cut stickers as collectable objects; information you can pick up; a loose collage. It replaced a mono data sheet (bland) and a split-flap board, which he turned down. The first sticker version, with brand colours, gradients and holographic foil, was redone flat because it did not match the rest of the site |
| The name in halftone dots at the foot of every page | Opal Tadpole (Site of the Year), Lama Lama | Dot matrix wordmark |
| A counter that runs to 100 before the first view | Gianluca Gradogna, Olha Lazarieva, Gil Huybrecht | Big numerals in the corner |
| A different ground for each section | Lando Norris | Paper, ink and one blue field in rhythm |
| A playful thing to do | Don't Board Me, Why Zero | Their gates became an optional typing race |
| Page transitions with a shared image | Boc.Studio, Cerebrium | Done natively with React's ViewTransition |

## Rules kept throughout

- Every element carries information. No clocks, coordinates, scroll cues or
  decorative labels. Large empty areas get real content.
- Motion follows the scroll or the pointer. The only thing that runs by itself
  is the intro, once per session.
- No custom cursor, no card grids, no dashes in body copy, no slogans.
- Numbers come from the resume and nowhere else. The conflict detection
  project is shown as a diagram and says so, because it has no interface.
- The phone number never appears.
- Every page holds at 360px wide without sideways scrolling.
- Reduced motion turns off the intro, the springs, the parallax and the photo
  zoom, and shows every word and bar fully drawn.

## System

- Type: Mona Sans (variable, weight 200 to 900, width 75 to 125), Newsreader
  italic for accents, JetBrains Mono for data.
- Colour: paper #F0EFEB, ink #0F0F0F, electric blue #2B2BFF (#8F8FFF on dark),
  and the three process inks only where the name splits.
- Grid: 12 columns, side padding clamp(16px, 3vw, 40px).
- One scroll loop (lib/scroll.ts) turns scroll position into progress values
  from geometry cached at resize, so nothing reads layout while scrolling.
