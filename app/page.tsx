import Landing from "@/components/landing/Landing";
import PageTransition from "@/components/PageTransition";

export default function Page() {
  return (
    <PageTransition>
      <main>
        <Landing />
      </main>
    </PageTransition>
  );
}
