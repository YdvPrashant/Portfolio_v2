/* Canvas drawing cannot use a CSS variable directly, so the canvases read the
   resolved colour off an element and read it again when the palette changes. */

export function readToken(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

export function watchPalette(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
  return () => observer.disconnect();
}
