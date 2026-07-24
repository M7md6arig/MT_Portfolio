import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Closing } from "@/components/sections/Closing";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { Transition } from "@/components/sections/Transition";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { WorkShowcase } from "@/components/sections/WorkShowcase";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Transition />
        <About />
        <Process />
        <WorkShowcase />
        <Services />
        <Contact />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
