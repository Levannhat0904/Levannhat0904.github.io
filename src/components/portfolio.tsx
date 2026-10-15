"use client";

import Link from "next/link";
import { profile, techStack, type StackItem } from "@/config/profile";
import { getContactLinks, githubUrl } from "@/lib/contact-links";
import { locales } from "@/i18n/dictionary";
import { useLanguage } from "./language-provider";
import { Typewriter } from "./typewriter";

const statsTheme = "theme=merko&hide_border=true&border_radius=12";

function SectionHeading({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10">
      <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        <span className="font-mono text-base text-accent">{index}.</span>
        {title}
        <span className="ml-2 hidden h-px flex-1 bg-line sm:block" />
      </h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </div>
  );
}

function StackChip({ item }: { item: StackItem }) {
  return (
    <li className="flex items-center gap-2 rounded-md border border-line bg-background px-2.5 py-1.5 text-sm transition-colors hover:border-accent/60">
      {item.icon ? (
        // Brand-coloured logo from the Simple Icons CDN; decorative only.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://cdn.simpleicons.org/${item.icon}${item.mono ? "/000000/ffffff" : ""}`} alt="" width={16} height={16} className="h-4 w-4" loading="lazy" />
      ) : (
        <span className="h-4 w-4 rounded-sm bg-accent/30" aria-hidden="true" />
      )}
      {item.name}
    </li>
  );
}

// Code-editor style card, inspired by the "about_me" JSON block common on GitHub profiles.
function AboutCode() {
  const { t } = useLanguage();
  const lines: [string, string][] = [
    ["role", `"${t.hero.roles[0]}"`],
    ["specialty", `"Full-stack (Web • Mobile • Backend)"`],
    ["languages", `["TypeScript", "JavaScript", "Go", "Dart"]`],
    ["speaks", `["Vietnamese", "English"]`],
  ];
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-lg shadow-black/5">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-muted">about-me.ts</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6">
        <code>
          <span className="text-[#c678dd]">const</span> <span className="text-[#61afef]">nhat</span> = {"{"}
          {"\n"}
          {lines.map(([key, value]) => (
            <span key={key}>
              {"  "}
              <span className="text-[#e06c75]">{key}</span>: <span className="text-accent">{value}</span>,{"\n"}
            </span>
          ))}
          {"}"};
        </code>
      </pre>
    </div>
  );
}

export function Portfolio() {
  const { locale, setLocale, t } = useLanguage();
  const contacts = getContactLinks();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-background/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="font-mono text-sm font-semibold">
            <span className="text-accent">~/</span>
            {profile.githubUsername.toLowerCase()}
          </a>
          <div className="flex items-center gap-4 text-sm sm:gap-6">
            {(["about", "stack", "contact"] as const).map((id) => (
              <a key={id} href={`#${id}`} className="hidden text-muted transition-colors hover:text-accent sm:inline">
                {t.nav[id]}
              </a>
            ))}
            <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Language">
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  className={`px-2.5 py-1 font-mono text-xs font-medium uppercase transition-colors ${
                    locale === l ? "bg-accent text-black" : "text-muted hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main id="top" className="w-full flex-1">
        {/* Hero with a subtle grid + glow background */}
        <section className="relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid min-h-[85vh] max-w-5xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="font-mono text-sm text-accent">{t.hero.greeting}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
                {profile.name}
                <span className="ml-2 inline-block origin-[70%_70%] animate-[wave_2.5s_ease-in-out_infinite]">👋</span>
              </h1>
              <p className="mt-4 h-8 font-mono text-xl text-muted sm:text-2xl">
                <Typewriter key={locale} words={t.hero.roles} />
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed">{t.hero.tagline}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                >
                  {t.hero.cta}
                </a>
                <Link
                  href="/play/"
                  className="flex items-center gap-2 rounded-md border border-accent/60 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                >
                  🎮 {t.hero.play}
                </Link>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-line bg-background/60 px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.simpleicons.org/github/000000/ffffff" alt="" width={16} height={16} />
                  GitHub
                </a>
              </div>
            </div>
            <AboutCode />
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <section id="about" className="scroll-mt-20 py-16">
            <SectionHeading index="01" title={t.about.title} />
            <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-muted">
              {t.about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section id="stack" className="scroll-mt-20 py-16">
            <SectionHeading index="02" title={t.stack.title} subtitle={t.stack.subtitle} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {techStack.map((group) => (
                <div
                  key={group.key}
                  className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                    {t.stack.groups[group.key]}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <StackChip key={item.name} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="stats" className="scroll-mt-20 py-16">
            <SectionHeading index="03" title={t.stats.title} subtitle={t.stats.subtitle} />
            {/* eslint-disable @next/next/no-img-element */}
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
              <img
                src={`https://github-readme-stats.vercel.app/api?username=${profile.githubUsername}&show_icons=true&${statsTheme}`}
                alt="GitHub stats"
                className="h-auto w-full max-w-md"
                loading="lazy"
              />
              <img
                src={`https://streak-stats.demolab.com?user=${profile.githubUsername}&${statsTheme}`}
                alt="GitHub streak"
                className="h-auto w-full max-w-md"
                loading="lazy"
              />
            </div>
            {/* eslint-enable @next/next/no-img-element */}
          </section>

          <section id="contact" className="scroll-mt-20 py-16">
            <SectionHeading index="04" title={t.contact.title} subtitle={t.contact.subtitle} />
            <ul className="grid gap-3 sm:grid-cols-2">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent"
                  >
                    <span className="font-mono text-xs uppercase tracking-wider text-accent">{c.label}</span>
                    <span className="mt-1 break-all transition-colors group-hover:text-accent">{c.value} ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-line py-8 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} {profile.name} · {t.footer}
      </footer>
    </>
  );
}
