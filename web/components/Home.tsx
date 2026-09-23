import Cases from "./Cases";
import Doctors from "./Doctors";
import Footer from "./Footer";
import Gallery from "./Gallery";
import Header from "./Header";
import Hero from "./Hero";
import Lab from "./Lab";
import Location from "./Location";
import MobileBar from "./MobileBar";
import Reviews from "./Reviews";
import Services from "./Services";
import type { Messages } from "@/lib/i18n";

/** Full homepage; `t` picks the language (layout sets lang/dir). */
export default function Home({ t }: { t: Messages }) {
  return (
    <div className="overflow-x-clip pb-[84px] lg:pb-0">
      <Header t={t} />
      <main>
        <Hero t={t} />
        <Services t={t} />
        <Lab t={t} />
        <Cases t={t} />
        <Doctors t={t} />
        <Gallery t={t} />
        <Reviews t={t} />
        <Location t={t} />
      </main>
      <Footer t={t} />
      <MobileBar t={t} />
    </div>
  );
}
