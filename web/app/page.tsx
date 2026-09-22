import Cases from "@/components/Cases";
import Doctors from "@/components/Doctors";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Lab from "@/components/Lab";
import Location from "@/components/Location";
import MobileBar from "@/components/MobileBar";
import Reviews from "@/components/Reviews";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div className="overflow-x-clip pb-[84px] lg:pb-0">
      <Header />
      <main>
        <Hero />
        <Services />
        <Lab />
        <Cases />
        <Doctors />
        <Gallery />
        <Reviews />
        <Location />
      </main>
      <Footer />
      <MobileBar />
    </div>
  );
}
