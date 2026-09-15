/* The colour themes a visitor can choose from the nav (components/ThemePicker.tsx).

   Paper is the default, his pick: light and calm, after reviewers found the
   original neon hard on the eyes. Dusk is the dark one. Vivid is the original acid yellow,
   violet, blue and magenta, kept for anyone who wants it; in it About, Skills
   and Contact take back their original grounds. The values live in
   app/globals.css; the chips here only draw the swatches. */

export const PALETTES = [
  { id: "dusk", name: "Dusk", note: "Dark and warm", chips: ["#201b2b", "#efe9df", "#f2b48c"] },
  { id: "paper", name: "Paper", note: "Light and calm", chips: ["#f2f0ea", "#171614", "#3b47d6"] },
  { id: "vivid", name: "Vivid", note: "Bright and bold", chips: ["#e9ff3d", "#7b3dff", "#ff2d6f"] },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

export const DEFAULT_PALETTE: PaletteId = "paper";

export const PALETTE_KEY = "py:palette";

export function isPalette(value: string | null | undefined): value is PaletteId {
  return PALETTES.some((p) => p.id === value);
}

const IDS = JSON.stringify(PALETTES.map((p) => p.id));

/* Runs in <head> during parsing, before the first paint, so a returning visitor
   never sees the default flash before their own choice. */
export const PALETTE_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(PALETTE_KEY)});if(${IDS}.indexOf(p)>-1)document.documentElement.setAttribute("data-palette",p)}catch(e){}})()`;
