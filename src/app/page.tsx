import Link from "next/link";
import {
  TrendingUp,
  Landmark,
  ScrollText,
  ArrowRight,
  Sparkles,
  RefreshCcw,
  BarChart4,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import HeroChart from "@/components/HeroChart";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface animate-fade-in-down">
        <nav className="flex justify-between items-center px-4 lg:px-8 py-4 max-w-full mx-auto">
          <div className="text-lg lg:text-xl font-bold tracking-tight text-primary">
            Jobsheet
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-secondary font-medium hover:text-primary-container transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="#features"
              className="text-secondary font-medium hover:text-primary-container transition-colors"
            >
              Invoices
            </Link>
            <Link
              href="#features"
              className="text-secondary font-medium hover:text-primary-container transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="#pricing"
              className="text-secondary font-medium hover:text-primary-container transition-colors"
            >
              Pro Features
            </Link>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              href="/login"
              className="text-sm lg:text-base text-secondary font-medium hover:text-primary-container transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-on-primary px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-semibold text-sm lg:text-base hover:bg-primary-container transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="px-4 lg:px-8 py-16 md:py-32 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary leading-[1.1] tracking-tight animate-fade-in-up">
              Take the Chaos Out of Freelancing
            </h1>
            <p className="text-lg lg:text-xl text-secondary leading-relaxed max-w-lg animate-fade-in-up delay-200">
              Track every job, monitor payments, and generate professional
              invoices—all in one place. Built for precision-minded architects
              of their own career.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-400">
              <Link
                href="/register"
                className="bg-primary-container text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-primary-container/20"
              >
                Start for Free
              </Link>
              <Link
                href="#pricing"
                className="bg-surface-container-low text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-high transition-all"
              >
                See Pro Features
              </Link>
            </div>
          </div>
          <div className="relative animate-slide-right delay-300">
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl" />
            <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/15 animate-float">
              <HeroChart />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="bg-surface-container-low py-16 lg:py-24 px-4 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll className="mb-16 text-center max-w-2xl mx-auto">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full">
                Core Excellence
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mt-4 tracking-tight">
                Financial Mastery by Design
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: <TrendingUp size={28} strokeWidth={1.75} />,
                  title: "Simple Tracking",
                  desc: "Log every milestone and expense with architectural precision. Never lose track of billable hours again.",
                  bgColor: "bg-primary-fixed",
                },
                {
                  icon: <Landmark size={28} strokeWidth={1.75} />,
                  title: "Payment Monitoring",
                  desc: "Visual status indicators for every invoice. Know exactly who owes what, and when it's due with clear tonal signals.",
                  bgColor: "bg-secondary-fixed",
                },
                {
                  icon: <ScrollText size={28} strokeWidth={1.75} />,
                  title: "Professional Invoices",
                  desc: "Generate bespoke, minimalist invoices that mirror your professional standards. Export to PDF in seconds.",
                  bgColor: "bg-tertiary-fixed",
                },
              ].map((feat, i) => (
                <AnimateOnScroll key={i} delay={i * 150}>
                  <div className="bg-surface-container-lowest p-10 rounded-2xl space-y-6 hover-lift h-full">
                    <div
                      className={`w-12 h-12 ${feat.bgColor} rounded-xl flex items-center justify-center text-primary`}
                    >
                      {feat.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-primary">
                      {feat.title}
                    </h3>
                    <p className="text-secondary leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="py-16 lg:py-32 px-4 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-6 tracking-tight leading-tight">
                Investment in your
                <br />
                Professional Growth
              </h2>
              <p className="text-lg lg:text-xl text-secondary mb-8 lg:mb-12 max-w-md">
                Choose the blueprint that fits your current career stage.
                Upgrade as your empire expands.
              </p>

              {/* Free Tier Card */}
              <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/15">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      Free Tier
                    </h3>
                    <div className="text-3xl font-black text-primary mt-2">
                      Rp 0
                    </div>
                  </div>
                  <span className="text-secondary-fixed-dim bg-secondary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                    Essentials
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {["50 jobs per month", "3 categories", "3-month history"].map(
                    (item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-secondary"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary" />{" "}
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <Link
                  href="/register"
                  className="block w-full py-3 rounded-lg border border-primary text-primary font-bold text-center hover:bg-primary hover:text-white transition-all"
                >
                  Get Started
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Pro Tier Card */}
            <AnimateOnScroll delay={200}>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-tertiary to-primary rounded-3xl blur opacity-10" />
                <div className="relative bg-white p-12 rounded-3xl shadow-xl border border-tertiary/10">
                  <div className="inline-block bg-tertiary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                    Professional Tier
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    Architect Pro
                  </h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black text-primary">
                      Rp 29k
                    </span>
                    <span className="text-secondary">/month</span>
                  </div>
                  <ul className="space-y-5 mb-10">
                    {[
                      {
                        icon: (
                          <Sparkles
                            size={18}
                            strokeWidth={1.75}
                            className="text-tertiary"
                          />
                        ),
                        text: "Unlimited everything",
                      },
                      {
                        icon: (
                          <RefreshCcw
                            size={18}
                            strokeWidth={1.75}
                            className="text-tertiary"
                          />
                        ),
                        text: "Multi-device sync",
                      },
                      {
                        icon: (
                          <ScrollText
                            size={18}
                            strokeWidth={1.75}
                            className="text-tertiary"
                          />
                        ),
                        text: "PDF Invoices",
                      },
                      {
                        icon: (
                          <BarChart4
                            size={18}
                            strokeWidth={1.75}
                            className="text-tertiary"
                          />
                        ),
                        text: "Advanced Analytics",
                      },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-on-surface"
                      >
                        {item.icon}
                        <span className="font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="block w-full py-5 rounded-xl bg-tertiary text-white font-black text-lg text-center shadow-lg shadow-tertiary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Unlock Full Control
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface py-16 lg:py-24 px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll>
              <h2 className="text-4xl font-bold text-primary mb-12 tracking-tight text-center">
                Frequently Asked
              </h2>
            </AnimateOnScroll>
            <div className="space-y-4">
              {[
                {
                  q: "Is my financial data secure?",
                  a: "Your data is encrypted at rest and in transit. We use industry-standard security practices and your data is stored locally using SQLite with no third-party access.",
                },
                {
                  q: "Can I export my data for tax purposes?",
                  a: "Yes! Free users can export CSV files. Pro users get both CSV and PDF exports for professional tax reporting.",
                },
                {
                  q: "How does the multi-device sync work?",
                  a: "With Pro, your data syncs automatically across all your devices. Login from your phone or laptop and access the same data in real-time.",
                },
              ].map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <details className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/5 group">
                    <summary className="w-full px-8 py-6 flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors list-none [&::-webkit-details-marker]:hidden">
                      <span className="font-bold text-primary">{item.q}</span>
                      <ArrowRight
                        size={18}
                        strokeWidth={1.75}
                        className="text-secondary shrink-0 group-open:rotate-45 transition-transform duration-300"
                      />
                    </summary>
                    <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-300">
                      <div className="overflow-hidden">
                        <div className="px-8 pb-6 text-secondary leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </details>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <AnimateOnScroll>
        <footer className="w-full py-12 border-t border-outline-variant/15 bg-surface text-xs uppercase tracking-widest">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-4 lg:px-12 max-w-7xl mx-auto">
            <div className="col-span-2 md:col-span-1">
              <div className="font-bold text-primary mb-4">Jobsheet</div>
              <p className="text-outline normal-case tracking-normal mb-4">
                Precision-engineered for the modern freelancer.
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-outline font-bold mb-1">Company</span>
              <Link
                href="#"
                className="text-outline opacity-80 hover:text-primary hover:opacity-100 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-outline opacity-80 hover:text-primary hover:opacity-100 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-outline font-bold mb-1">Resources</span>
              <Link
                href="#"
                className="text-outline opacity-80 hover:text-primary hover:opacity-100 transition-colors"
              >
                Sitemap
              </Link>
              <Link
                href="#"
                className="text-outline opacity-80 hover:text-primary hover:opacity-100 transition-colors"
              >
                Help Center
              </Link>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-outline font-bold mb-1">Support</span>
              <Link
                href="#"
                className="text-outline opacity-80 hover:text-primary hover:opacity-100 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="#"
                className="text-outline opacity-80 hover:text-primary hover:opacity-100 transition-colors"
              >
                Support Desk
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center text-outline border-t border-outline-variant/10 pt-8 mx-12">
            © 2024 Jobsheet. Designed for Precision.
          </div>
        </footer>
      </AnimateOnScroll>
    </div>
  );
}
