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
| The first screen: the name in lowercase filling the screen, one line hung above it, the three projects beside its second line | See "The first screen" below | Rebuilt on 2026-10-01 from Swiss posters rather than Awwwards |
| Serif italic words inside grotesk statements | Artiom Yakushev, Lando Norris (Site of the Year) | Mixed families to weight a few words |
| Words that turn from grey to ink as you scroll | Artiom Yakushev, Elliott Mangham, Cerebrium | Scroll scrubbed reading |
| Work that slides sideways as you scroll, with large numerals | Gianluca Gradogna, Boc.Studio, Lama Lama | Numbered index, slide rather than stack |
| Measured on one screen: giant condensed numbers that roll like an odometer, the old figures struck through with a proofreader's pen, and pointing at a number rolls it back to where it started | Lando Norris (Site of the Year) stats pages | Huge numerals with small labels and hand-drawn marks. It replaced bar charts after Cerebrium, which ran to several screens and read as bland; the bars stay on the case studies |
| A photograph set into a sentence that grows to fill the screen | Gianluca Gradogna ("Through this lens") | Image in text |
| Photographs scattered at several depths around their heading | Lando Norris, Floema, Getty's Tracing Art | Loose scatter with parallax |
| An endless field of photographs you drag around | Gionatan Nese, Getty's Tracing Art | Drag to explore |
| Skills: web on the left, machine learning on the right, the projects between them, joined by a hairline for every skill a project used | See "Skills" below | Rebuilt on 2026-10-01; it replaced the CV sticker wall |
| Contact as a flyer with a fringe of tear-off tabs, each printed with the address | See "Contact" below | Rebuilt on 2026-10-02; it replaced the address set huge over the name in halftone dots |
| A different ground for each section | Lando Norris | Paper, ink and one blue field in rhythm |
| A playful thing to do | Don't Board Me, Why Zero | Their gates became an optional typing race |
| Page transitions with a shared image | Boc.Studio, Cerebrium | Done natively with React's ViewTransition |

## The first screen

Rebuilt on 2026-10-01. The brief was Swiss design principles, clean and free of
clutter, with ideas taken from anywhere rather than only from Awwwards. Three
directions were mocked up (a type poster, a photobook spread, a ruled index);
the poster was picked, then given one of his photographs inside the letters.

| On the first screen | Borrowed from | What was taken |
| --- | --- | --- |
| The name as the whole poster, huge, with small text hung around it | Josef Müller-Brockmann, der Film (1960) | Extreme contrast of scale, nothing in between |
| The name in lowercase | Armin Hofmann's theatre posters for Basel | Lowercase letterforms used as the image |
| The name fills its room both ways, changing its width axis rather than only its size, so any window gets a poster made for it | Karl Gerstner, Designing Programmes (1964); Adrian Frutiger's Univers, a family planned as a grid of widths | A layout written as a rule, not drawn once |
| A photograph of his own, sky over a ridge, showing through the letters | Swiss photographic posters by Müller-Brockmann and Hofmann | Photography rather than decoration |
| One line about the work, the projects in the room the second line leaves, everything on the 12 column grid and flush left | Emil Ruder, Typographie (1967) | Asymmetric, flush left, ordered by position and size alone |

The striped CMY name and the counter that ran to 100 before the first view
were taken out. The photograph drifts a little against the pointer and lags
behind the scroll; nothing else moves. It sits raised (50px on a 1440 wide
window, scaled with the name elsewhere) so the snowy ridge shows in the second
line.

## Additions, 2026-10-01

Asked to improve, not redo, the project section and photography (Race me was
left as it is). Each addition carries real information:

- The progress line under the sliding projects is a ruler. Each project's
  name ends where the slide reaches it, the one in view is inked, and a click
  slides straight there.
- Every project panel lists its stack and links out: Prism to the live site,
  the other two to their code on GitHub.
- The photographs heading says how often the profile has been seen and
  downloaded, from Unsplash's own counters.
- Opening a photograph shows the camera and settings it was taken with and its
  views; the photograph that fills the screen on the home page carries the
  same line once it is full size.

## Skills

Rebuilt on 2026-10-01 in place of the CV, which had been a sheet of stickers
(and before that a mono data sheet and a split-flap board). The brief was to
treat the section as skills, not a CV, and keep one idea from the CV mockups:
point at a project and the skills it used light up. Three still layouts (one
block of words, two columns, a matrix) were turned down as too busy; he asked
for something animated but not overdone, calm and free of clutter. Of three
moving directions (these threads, overlapping circles, and one project's
skills at a time) he picked the threads.

- The two halves are the intro's own line, full-stack web and applied machine
  learning, with the projects in between bridging them. DSA sits below,
  joined to C++.
- Each line is measured from where its two words sit, so it follows any
  layout; a phone gets the projects down the left and every skill to their
  right.
- The lines draw out from each project in turn as the section scrolls in,
  scrubbed by the scroll. Point at a project (or tab to it, or tap it) and only
  its lines stay, in blue; point at a skill to see every project that used it.
- Skills on the resume that no project here uses are listed under the
  drawing, without lines.

## Contact

Rebuilt on 2026-10-02 with the same freedom as the first screen and Skills.
Three directions were mocked up: the address read across one screen with its @
as large as the screen allows and a photograph inside it, a flyer with tear-off
tabs, and an email already started ("Hi Prashant,") that visitors finish on the
page. The flyer was picked, and the @ was kept.

| In the contact section | Borrowed from | What was taken |
| --- | --- | --- |
| A sheet of paper on the ink wall, with a perforation and a fringe of tabs | The tear-off notices on college noticeboards and lampposts | Taking the address as a thing you do with your hands |
| The sheet itself: one large line, the address, the other ways in, flush left on the 12 column grid | Emil Ruder, Typographie (1967) | Asymmetric, ordered by position and size alone |

- Each tab carries the name and the address. Pull one down with the mouse, or
  tap it, click it or press Enter on it, and it tears off, falls away and the
  address is copied. A finger swiping up or down still scrolls the page.
- The gaps are real. Each browser that takes the address is counted once
  (app/api/taken, stored like the likes), and when a flyer runs out of tabs a
  fresh one goes up, so a fringe of n tabs shows the count mod n gaps,
  scattered by the golden ratio rather than taken left to right. The count
  sits beside the likes. Only the production deployment counts; previews and
  next dev count under their own key.
- The halftone name went, because the first screen already is the name.
- The @ is kept, as built, at /archive/contact-at: nothing links to it and
  search engines are asked to leave it out. It sets the address across the
  screen with the @ filled by his dusk photograph over a field (after
  Müller-Brockmann's der Film and Hofmann's Basel posters), turns the @ upright
  as it scrolls in, and lets the photograph drift with the pointer. To put it
  back, render AtContact in place of Footer.

## Rules kept throughout

- Every element carries information. No clocks, coordinates, scroll cues or
  decorative labels. Large empty areas get real content.
- Motion follows the scroll or the pointer. Nothing runs by itself, apart from
  the photograph fading into the name once it has loaded.
- No custom cursor, no card grids, no dashes in body copy, no slogans.
- Numbers come from the resume and nowhere else. The conflict detection
  project is shown as a diagram and says so, because it has no interface.
- The phone number never appears.
- Every page holds at 360px wide without sideways scrolling.
- Reduced motion turns off the drift of the photograph in the name, the
  springs, the parallax, the photo zoom and the falling of a torn tab, and
  shows every word, bar and line fully drawn.

## System

- Type: Mona Sans (variable, weight 200 to 900, width 75 to 125), Newsreader
  italic for accents, JetBrains Mono for data.
- Colour: paper #F0EFEB, ink #0F0F0F, electric blue #2B2BFF (#8F8FFF on dark),
  and two process inks in small doses: magenta for the proofreader's pen and
  yellow for his pace in the typing race.
- Grid: 12 columns, side padding clamp(16px, 3vw, 40px).
- One scroll loop (lib/scroll.ts) turns scroll position into progress values
  from geometry cached at resize, so nothing reads layout while scrolling.
