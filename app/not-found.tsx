import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      data-theme="paper"
      className="flex min-h-svh flex-col justify-end px-pad pb-[var(--pad)] pt-[calc(var(--header)+32px)]"
    >
      <h1 className="numerals text-[clamp(8rem,34vw,30rem)]">
        <span className="sr-only">Page not found, error </span>404
      </h1>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-rule pt-5">
        <p className="t-m max-w-[30ch]">There is nothing at this address. It may have moved when the site was rebuilt.</p>
        <Link href="/" transitionTypes={["nav-back"]} className="t-m link-line hit font-[560]">
          Back to the start &rarr;
        </Link>
      </div>
    </main>
  );
}
