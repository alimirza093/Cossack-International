import React from 'react';
import { Link } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';
import { HERO_IMAGES } from '../lib/siteAssets';

const About: React.FC = () => (
  <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
    <Navbar />
    <main>
      <section className="relative bg-[#0B0B0B] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <img
          src={HERO_IMAGES.hozri2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="eager"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-[#0B0B0B]/70" />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-[0.35em] mb-4">
            About Cossack International
          </p>
          <h1 className="text-white font-black text-3xl sm:text-4xl md:text-5xl italic uppercase tracking-tighter max-w-3xl mb-6">
            Precision Textiles for a Global Market
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Cossack International is a full-scale textile manufacturer specializing in hosiery,
            technical outerwear, and performance apparel. We combine decades of production heritage
            with modern quality systems to deliver export-ready garments for brands, retailers, and
            distributors worldwide.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="section-accent" />
              <h2 className="section-title">Who We Are</h2>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Founded on the principles of disciplined manufacturing and long-term partnerships,
              Cossack International operates as a vertically integrated textile house. Our teams
              span yarn sourcing, knitting, cutting, sewing, finishing, and final inspection — giving
              us end-to-end control over every garment that leaves our facility.
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              We serve sportswear labels, uniform suppliers, private-label retailers, and
              international wholesalers who demand consistent sizing, repeatable color standards,
              and reliable lead times at production scale.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src={HERO_IMAGES.puffer3}
              alt="Puffer jacket production"
              loading="lazy"
              className="rounded-sm border border-zinc-200 object-cover aspect-[4/5] w-full"
            />
            <img
              src={HERO_IMAGES.hozri4}
              alt="Hosiery manufacturing"
              loading="lazy"
              className="rounded-sm border border-zinc-200 object-cover aspect-[4/5] w-full mt-8"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 sm:px-6 lg:px-8 py-16 md:py-20 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="section-accent" />
            <h2 className="section-title">Our Mission</h2>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl mb-10">
            To manufacture high-integrity textiles that perform in real-world conditions — from
            everyday hosiery to insulated outerwear — while maintaining transparent communication,
            ethical labor practices, and measurable quality at every stage of production.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'precision_manufacturing',
                title: 'Consistency at Scale',
                text: 'Batch-to-batch repeatability through standardized processes, calibrated equipment, and documented QC checkpoints.',
              },
              {
                icon: 'handshake',
                title: 'Partnership First',
                text: 'We work as an extension of your supply chain — from sampling through bulk runs and replenishment cycles.',
              },
              {
                icon: 'public',
                title: 'Global Readiness',
                text: 'Export-compliant packaging, labeling support, and logistics coordination for international distribution.',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="border border-zinc-100 rounded-sm p-6 bg-[#F9F9F9] hover:border-[#39FF14]/40 transition-colors"
              >
                <span className="material-icons-round text-[#39FF14] text-2xl mb-4">{item.icon}</span>
                <h3 className="text-[#0B0B0B] font-black text-sm uppercase tracking-wide mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="section-accent" />
              <h2 className="section-title">Why Choose Us</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Dedicated sampling team for rapid prototype turnaround',
                'In-house lab testing for shrinkage, colorfastness, and seam strength',
                'Flexible MOQs for growing brands and established retailers alike',
                'Multi-category capability — hosiery, jackets, and knitwear under one roof',
                'Direct factory communication without unnecessary intermediaries',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-zinc-600">
                  <span className="material-icons-round text-[#39FF14] text-base mt-0.5 shrink-0">
                    check_circle
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="section-accent" />
              <h2 className="section-title">Product Quality</h2>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Every Cossack garment passes through a structured quality pipeline: incoming material
              verification, in-line production audits, and pre-shipment inspection. We document
              tolerances for stitch density, dimensional stability, and finish quality so your
              customers receive the same product experience order after order.
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Our hosiery lines are engineered for fit retention and abrasion resistance. Our puffer
              and outerwear programs use graded insulation, reinforced seam tape, and weather-ready
              shell fabrics selected for durability in demanding environments.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0B0B0B] px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-[0.35em] mb-4">
              Manufacturing Excellence
            </p>
            <h2 className="text-white font-black text-2xl md:text-3xl italic uppercase tracking-tighter mb-5">
              Built in the Factory. Proven in the Field.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Our production floor integrates automated knitting systems with skilled hand-finishing
              for detail-critical operations. We maintain capacity buffers for seasonal peaks and
              invest continuously in operator training, maintenance schedules, and energy-efficient
              equipment upgrades.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              From yarn lot traceability to carton-level packing lists, our systems are designed for
              accountability — because reliability is not a marketing claim, it is an operational
              requirement.
            </p>
          </div>
          <img
            src={HERO_IMAGES.puffer2}
            alt="Technical outerwear manufacturing"
            loading="lazy"
            className="rounded-sm border border-zinc-800 object-cover aspect-video w-full"
          />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="section-accent" />
            <h2 className="section-title">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: 'location_on',
                label: 'Head Office',
                value: 'Building no 18/142 street no 2 mujahid road near janjua sports Sialkot Pakistan',
              },
              {
                icon: 'mail',
                label: 'Email',
                value: 'cossackinternational68@gmail.com',
              },
              {
                icon: 'schedule',
                label: 'Business Hours',
                value: 'Monday to Saturday 9AM to 9PM',
                value2: 'Sunday 10AM to 10PM',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-zinc-100 rounded-sm p-6 flex gap-4"
              >
                <span className="material-icons-round text-[#39FF14]">{item.icon}</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-zinc-600">{item.value}</p>
                  {
                      item?.value2 &&
                      <p className="text-sm text-zinc-600">{item.value2}</p>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto bg-white border border-zinc-100 rounded-sm p-8 sm:p-12 text-center">
          <h2 className="text-[#0B0B0B] font-black text-2xl md:text-3xl italic uppercase tracking-tighter mb-4">
            Ready to Build Your Next Collection?
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Whether you need a production partner for hosiery, insulated jackets, or a full seasonal
            line, our team is ready to discuss specifications, timelines, and sampling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className="btn-primary text-sm">
              Browse Products
            </Link>
            <Link
              to="/contact"
              className="border border-zinc-300 text-[#0B0B0B] px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-[#39FF14] hover:text-[#39FF14] transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
