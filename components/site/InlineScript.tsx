/* A script that runs while the HTML is parsed, before the first paint. On the
   client the type flips to text/plain so React neither warns about rendering a
   script nor runs it twice; suppressHydrationWarning accepts the difference. */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
