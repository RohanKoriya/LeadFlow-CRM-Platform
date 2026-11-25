import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { LeadStatus } from "../types/lead.types";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

// Same status colours as the real dashboard
const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "border-sky-200 bg-sky-50 text-sky-700",
  Contacted: "border-amber-200 bg-amber-50 text-amber-700",
  Qualified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Lost: "border-red-200 bg-red-50 text-red-700",
};

const StatusPill = ({ status }: { status: LeadStatus }) => (
  <span
    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-500 ${STATUS_STYLES[status]}`}
  >
    {status}
  </span>
);

const Reveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lf-reveal ${shown ? "lf-reveal-on" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

const Logo = () => (
  <Link
    to="/"
    className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 10L10 3L17 10L10 17L3 10Z" fill="white" fillOpacity="0.9" />
        <circle cx="10" cy="10" r="2.5" fill="white" />
      </svg>
    </span>
    <span className="font-semibold tracking-tight">LeadFlow</span>
  </Link>
);

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/* ------------------------------------------------------------------ */
/* Hero: a small copy of the real dashboard that plays on its own      */
/* ------------------------------------------------------------------ */

interface DemoLead {
  id: string;
  name: string;
  source: string;
  status: LeadStatus;
}

const BASE_ROWS: DemoLead[] = [
  { id: "alice", name: "alice", source: "Instagram", status: "Qualified" },
  { id: "bob", name: "bob", source: "Referral", status: "Contacted" },
  { id: "jhon", name: "jhon doe", source: "Website", status: "Qualified" },
  { id: "sara", name: "sara", source: "Website", status: "Lost" },
];

// Each step is one thing that happens in a real day of lead work.
const getRows = (tick: number): DemoLead[] => {
  let rows = [...BASE_ROWS];
  if (tick >= 1) {
    const status = tick === 1 ? "New" : tick === 2 ? "Contacted" : "Qualified";
    rows = [{ id: "riya", name: "riya", source: "Instagram", status }, ...rows];
  }
  if (tick >= 4) {
    rows = [
      { id: "arjun", name: "arjun", source: "Referral", status: "New" },
      ...rows,
    ];
  }
  return rows;
};

// Where the little mouse pointer is on each step (percent of the dashboard box)
const CURSOR = [
  { x: 86, y: 84 },
  { x: 24, y: 37 },
  { x: 48, y: 56 },
  { x: 48, y: 56 },
  { x: 24, y: 37 },
  { x: 36, y: 21 },
];
const CLICKS = [false, true, true, true, true, false];

const STEP_NOTES = [
  "Your leads, all in one list",
  "A new lead arrives from Instagram",
  "You reach out, so you mark it Contacted",
  "The lead is a good fit, so you mark it Qualified",
  "Another lead comes in from a referral",
  "Your counts always stay up to date",
];

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) => (
  <div className="rounded-lg border border-zinc-200 bg-white p-2.5 sm:p-3">
    <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
      {label}
    </p>
    <p
      key={value}
      className={`lf-pop mt-0.5 text-xl font-semibold sm:text-2xl ${tone}`}
    >
      {value}
    </p>
  </div>
);

const DashboardDemo = () => {
  const [tick, setTick] = useState(0);

  // Plays on its own, forever. Clicking a dot jumps to a step and the loop carries on.
  useEffect(() => {
    const id = setInterval(
      () => setTick((t) => (t >= STEP_NOTES.length - 1 ? 0 : t + 1)),
      2400,
    );
    return () => clearInterval(id);
  }, []);

  const rows = getRows(tick);
  const count = (s: LeadStatus) =>
    rows.filter((r) => r.status === s).length;

  return (
    <div className="relative mx-auto w-full max-w-[28rem] lg:ml-auto lg:mr-0">
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-sky-100/60 via-transparent to-emerald-100/60 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[#f7f8fa] shadow-[0_30px_70px_-30px_rgba(24,24,27,0.35)]">
        {/* app top bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900"
              aria-hidden="true"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-white" />
            </span>
            <span className="font-semibold">LeadFlow</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-500">Dashboard</span>
          </div>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
            Admin
          </span>
        </div>

        {/* animated pointer: moves and clicks as the demo plays */}
        <div
          className="lf-cursor pointer-events-none absolute z-20 hidden sm:block"
          style={{ left: `${CURSOR[tick].x}%`, top: `${CURSOR[tick].y}%` }}
          aria-hidden="true"
        >
          {CLICKS[tick] && (
            <span
              key={tick}
              className="lf-ripple absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-zinc-900/25"
            />
          )}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="drop-shadow"
          >
            <path
              d="M5 3l14 8-6 2-3 6L5 3z"
              fill="#18181b"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="space-y-2.5 p-3">
          {/* stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <Stat label="Total" value={rows.length} tone="text-zinc-900" />
            <Stat
              label="Qualified"
              value={count("Qualified")}
              tone="text-emerald-600"
            />
            <Stat label="New" value={count("New")} tone="text-sky-600" />
            <Stat label="Lost" value={count("Lost")} tone="text-red-600" />
          </div>

          {/* leads table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Leads</span>
                <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white">
                  + Add Lead
                </span>
                <span className="hidden rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 sm:inline">
                  Export CSV
                </span>
              </div>
              <span className="hidden rounded-md border border-zinc-200 px-2.5 py-1 text-xs text-zinc-400 sm:inline">
                Search name or email…
              </span>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-zinc-50 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:px-4 sm:text-xs">
              <span>Name</span>
              <span>Status</span>
              <span>Source</span>
            </div>

            <ul className="h-[11.5rem] overflow-hidden">
              {rows.slice(0, 4).map((r) => (
                <li
                  key={r.id}
                  className="lf-row-in grid grid-cols-[1.4fr_1fr_1fr] items-center border-t border-zinc-100 px-3 py-2.5 text-[13px]"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] uppercase text-zinc-600">
                      {r.name[0]}
                    </span>
                    {r.name}
                  </span>
                  <span>
                    <StatusPill status={r.status} />
                  </span>
                  <span className="text-zinc-600">{r.source}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* caption that explains what just happened */}
      <div className="mt-5 text-center">
        <p
          key={tick}
          className="lf-pop flex items-center justify-center gap-2 text-sm text-zinc-600"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {STEP_NOTES[tick]}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {STEP_NOTES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTick(i)}
              aria-label={`Show step ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === tick ? "w-5 bg-zinc-900" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    title: "Add your leads",
    text: "Enter each lead with their name, email and where they found you: Instagram, your website or a referral.",
  },
  {
    title: "Move them through the stages",
    text: "Mark every lead as New, Contacted, Qualified or Lost, so you always know where they stand.",
  },
  {
    title: "Find, filter and export",
    text: "Search by name or email, filter by status or source, and download everything as a CSV when you need it.",
  },
];

const SOURCES = ["Instagram", "Website", "Referral"];
const PIPELINE_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified"];

const FAQS = [
  {
    q: "What kind of leads can I keep in LeadFlow?",
    a: "Any potential customer. You note where they came from (Instagram, your website or a referral) and track them as New, Contacted, Qualified or Lost.",
  },
  {
    q: "Can my whole team use it?",
    a: "Yes. Admins and sales users each get their own login, with access that fits their role.",
  },
  {
    q: "Can I get my leads out of LeadFlow?",
    a: "Yes. Use Export CSV to download your leads and open them in Excel or Google Sheets.",
  },
  {
    q: "Is my lead data private?",
    a: "Yes. The dashboard is protected, so only people who log in can see it.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lf-root min-h-screen bg-[#f7f8fa] text-zinc-900 antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .lf-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 5rem; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }

        /* hero entrance: the one page-load sequence */
        @keyframes lf-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .lf-rise { opacity: 0; animation: lf-rise .8s cubic-bezier(.2,.7,.2,1) forwards; }

        /* demo: new rows slide in, numbers and captions pop */
        @keyframes lf-row-in { from { opacity: 0; transform: translateY(-10px); background: #f0f9ff; } to { opacity: 1; transform: none; background: transparent; } }
        .lf-row-in { animation: lf-row-in .6s cubic-bezier(.2,.7,.2,1); }
        @keyframes lf-pop { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
        .lf-pop { animation: lf-pop .45s cubic-bezier(.2,.7,.2,1); }

        /* demo pointer */
        .lf-cursor { transition: left 1s cubic-bezier(.65,0,.35,1), top 1s cubic-bezier(.65,0,.35,1); }
        @keyframes lf-ripple { from { transform: scale(.4); opacity: .9; } to { transform: scale(2.2); opacity: 0; } }
        .lf-ripple { animation: lf-ripple .9s ease-out .9s both; }

        /* scroll reveal */
        .lf-reveal { opacity: 0; transform: translateY(14px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); }
        .lf-reveal-on { opacity: 1; transform: none; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .lf-rise, .lf-row-in, .lf-pop { animation: none; opacity: 1; }
          .lf-cursor { transition: none; }
          .lf-ripple { animation: none; opacity: 0; }
          .lf-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* ---------------- Header ---------------- */}
      <header
        className={`sticky top-0 z-30 border-b bg-[#f7f8fa]/85 backdrop-blur transition-shadow ${
          scrolled ? "border-zinc-200 shadow-sm" : "border-transparent"
        }`}
      >
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
          aria-label="Main"
        >
          <Logo />
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#how"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:block"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:block"
            >
              Features
            </a>
            <a
              href="#faq"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:block"
            >
              FAQ
            </a>
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              Sign up
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-200/60 sm:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="border-t border-zinc-200 bg-white px-4 py-3 sm:hidden">
            {[
              ["#how", "How it works"],
              ["#features", "Features"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div>
            <h1
              className="lf-rise text-[2.4rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.3rem]"
              style={{ animationDelay: "60ms" }}
            >
              Leave the spreadsheet behind. Manage every lead in one place.
            </h1>
            <p
              className="lf-rise mt-6 max-w-lg text-lg leading-8 text-zinc-600"
              style={{ animationDelay: "180ms" }}
            >
              Collect leads from Instagram, your website and referrals. Track
              each one from New to Qualified, and let your whole team work from
              the same dashboard.
            </p>

            <div
              className="lf-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                Create your account
                <svg
                  className="transition-transform group-hover:translate-x-0.5"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                Log in
              </Link>
            </div>

            <div
              className="lf-rise mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500"
              style={{ animationDelay: "420ms" }}
            >
              <span>Works with leads from</span>
              {SOURCES.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="lf-rise" style={{ animationDelay: "320ms" }}>
            <DashboardDemo />
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how" className="border-y border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <Reveal>
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                From a new lead to a qualified customer, in three steps.
              </h2>
            </Reveal>

            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 120}>
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                        {i + 1}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span
                          className="hidden h-px flex-1 bg-gradient-to-r from-zinc-300 to-transparent md:block"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xs leading-7 text-zinc-600">
                      {step.text}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section
          id="features"
          className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28"
        >
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to keep your sales organized.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-6">
            {/* Stages */}
            <Reveal className="md:col-span-4">
              <article className="h-full rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight">
                  See where every lead stands
                </h3>
                <p className="mt-2 max-w-md leading-7 text-zinc-600">
                  Every lead has a status. Move it forward as you talk to them,
                  and your totals update right away.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-2">
                  {PIPELINE_STATUSES.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <StatusPill status={s} />
                      {i < 2 && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#a1a1aa"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      )}
                    </div>
                  ))}
                  <span className="mx-2 text-sm text-zinc-400">or</span>
                  <StatusPill status="Lost" />
                </div>
              </article>
            </Reveal>

            {/* Manage */}
            <Reveal className="md:col-span-2" delay={100}>
              <article className="h-full rounded-2xl bg-zinc-900 p-6 text-white sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight">
                  Add, edit and delete
                </h3>
                <p className="mt-2 leading-7 text-zinc-300">
                  Keep your lead details accurate. Update or remove a lead
                  whenever things change.
                </p>
                <span className="mt-6 inline-block rounded-md bg-white px-3 py-1.5 text-sm font-medium text-zinc-900">
                  + Add Lead
                </span>
              </article>
            </Reveal>

            {/* Search & filter */}
            <Reveal className="md:col-span-3">
              <article className="h-full rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight">
                  Find the right lead fast
                </h3>
                <p className="mt-2 leading-7 text-zinc-600">
                  Search by name or email. Filter by status or source. Sort by
                  newest or oldest.
                </p>
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-400">
                    <Icon>
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5" />
                    </Icon>
                    Search name or email…
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-zinc-700">
                    {["All Status", "All Sources", "Latest first"].map((f) => (
                      <span
                        key={f}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Teams */}
            <Reveal className="md:col-span-3" delay={100}>
              <article className="h-full rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight">
                  The right access for each person
                </h3>
                <p className="mt-2 leading-7 text-zinc-600">
                  Admins and sales users get different permissions, so everyone
                  sees what they need.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-zinc-50 p-4">
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                      Admin
                    </span>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      Manages leads and oversees the team.
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-4">
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                      Sales
                    </span>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      Works on leads day to day.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Export */}
            <Reveal className="md:col-span-3">
              <article className="h-full rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight">
                  Take your data anywhere
                </h3>
                <p className="mt-2 leading-7 text-zinc-600">
                  Download your leads as a CSV file and open it in Excel or
                  Google Sheets.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700">
                  <Icon>
                    <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                  </Icon>
                  Export CSV
                </span>
              </article>
            </Reveal>

            {/* Security */}
            <Reveal className="md:col-span-3" delay={100}>
              <article className="h-full rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight">
                  Private by default
                </h3>
                <p className="mt-2 leading-7 text-zinc-600">
                  Your dashboard is protected. Only people who log in can see
                  your leads.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-700">
                  <Icon>
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </Icon>
                  Login required
                </span>
              </article>
            </Reveal>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section
          id="faq"
          className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-28"
        >
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Common questions
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
              {FAQS.map((item) => (
                <details key={item.q} className="group px-5 py-4 sm:px-6">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-lg text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">
                    {item.q}
                    <svg
                      className="shrink-0 text-zinc-400 transition-transform duration-300 group-open:rotate-180"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-3 max-w-xl leading-7 text-zinc-600">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className="px-4 pb-20 sm:px-6 sm:pb-28">
          <Reveal>
            <div className="mx-auto max-w-6xl rounded-3xl bg-zinc-900 px-6 py-16 text-center sm:px-12 sm:py-20">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Ready to organize your leads?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-zinc-300">
                Create an account and add your first lead in a minute.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                >
                  Create your account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex rounded-xl px-6 py-3.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Log in
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
