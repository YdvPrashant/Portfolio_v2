/* Kept apart from lib/intro.ts, which is a client module, so the server can
   inline the script as a plain string. */

export const INTRO_KEY = "py:intro";

/** Runs before first paint: only a first, full page visit to / in a session sees the intro. */
export const introScript = `try{if(location.pathname==="/"&&!sessionStorage.getItem("${INTRO_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="pending"}}catch(e){}`;
