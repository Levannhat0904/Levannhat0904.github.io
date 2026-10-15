"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile, techStack } from "@/config/profile";
import { createGame, type Game } from "@/game/create-game";
import type { Control } from "@/game/input";
import type { ZoneId } from "@/game/world";
import { locales } from "@/i18n/dictionary";
import { getContactLinks } from "@/lib/contact-links";
import { useLanguage } from "../language-provider";

function ZonePanel({ zone }: { zone: ZoneId }) {
  const { t } = useLanguage();
  return (
    <div className="pointer-events-auto max-h-[45vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/75 p-5 text-white shadow-2xl backdrop-blur-md sm:max-h-[70vh]">
      <p className="font-mono text-xs uppercase tracking-wider text-[#42bc2a]">{t.game.zones[zone]}</p>
      {zone === "about" && (
        <>
          <h2 className="mt-1 text-xl font-bold">{profile.name}</h2>
          <p className="text-sm text-white/70">{t.hero.roles[0]}</p>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-white/85">
            {t.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </>
      )}
      {zone === "stack" && (
        <div className="mt-3 space-y-3">
          {techStack.map((group) => (
            <div key={group.key}>
              <p className="text-xs font-semibold text-white/60">{t.stack.groups[group.key]}</p>
              <p className="text-sm">{group.items.map((i) => i.name).join(" · ")}</p>
            </div>
          ))}
        </div>
      )}
      {zone === "contact" && (
        <>
          <p className="mt-1 text-sm text-white/70">{t.contact.subtitle}</p>
          <ul className="mt-3 space-y-2">
            {getContactLinks().map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-white/15 px-3 py-2 text-sm transition-colors hover:border-[#42bc2a] hover:text-[#42bc2a]"
                >
                  <span className="font-mono text-xs text-white/60">{c.label}</span> {c.value} ↗
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Hold-to-press button for touch screens; writes straight into the game's input state.
function TouchButton({ game, control, label }: { game: Game | null; control: Control; label: string }) {
  const set = (pressed: boolean) => game?.setControl(control, pressed);
  return (
    <button
      type="button"
      aria-label={control}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        set(true);
      }}
      onPointerUp={() => set(false)}
      onPointerCancel={() => set(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="h-14 w-14 touch-none select-none rounded-full border border-white/20 bg-black/50 text-xl text-white backdrop-blur active:bg-[#42bc2a]/70"
    >
      {label}
    </button>
  );
}

export function PlayGame() {
  const { locale, setLocale, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [zone, setZone] = useState<ZoneId | null>(null);
  const [webglError, setWebglError] = useState(false);

  // The game is created once; label text is updated separately when the language changes.
  const initialLabels = useRef(t.game.zones);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let instance: Game;
    try {
      instance = createGame({ container, zoneLabels: initialLabels.current, onZoneChange: setZone });
    } catch {
      queueMicrotask(() => setWebglError(true));
      return;
    }
    queueMicrotask(() => setGame(instance));
    return () => instance.dispose();
  }, []);

  useEffect(() => {
    game?.setZoneLabels(t.game.zones);
  }, [game, t]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#9fd6f0]">
      <div ref={containerRef} className="absolute inset-0" />

      {webglError && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-black">
          <p>{t.game.noWebgl}</p>
        </div>
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto rounded-xl bg-black/60 px-4 py-2 text-white backdrop-blur">
          <p className="text-sm font-bold sm:text-base">{profile.name}</p>
          <Link href="/" className="font-mono text-xs text-[#42bc2a] hover:underline">
            ← {t.game.back}
          </Link>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => game?.reset()}
            className="rounded-md bg-black/60 px-3 py-1.5 font-mono text-xs text-white backdrop-blur hover:bg-black/80"
          >
            ↺ {t.game.reset}
          </button>
          <div className="flex overflow-hidden rounded-md bg-black/60 backdrop-blur" role="group" aria-label="Language">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={`px-2.5 py-1.5 font-mono text-xs uppercase ${
                  locale === l ? "bg-[#42bc2a] text-black" : "text-white/80 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info panel for the zone the car is standing in */}
      {zone && (
        <div className="pointer-events-none absolute inset-x-3 top-20 sm:inset-x-auto sm:right-4 sm:top-20 sm:w-96">
          <ZonePanel zone={zone} />
        </div>
      )}

      {/* Controls hint (keyboard) */}
      <p className="pointer-coarse:hidden pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit max-w-[90vw] rounded-full bg-black/60 px-4 py-2 text-center text-xs text-white backdrop-blur">
        {t.game.hint}
      </p>

      {/* Touch controls */}
      <div className="pointer-fine:hidden absolute inset-x-0 bottom-0 p-4">
        <p className="pointer-events-none mx-auto mb-3 w-fit rounded-full bg-black/60 px-3 py-1.5 text-center text-xs text-white">
          {t.game.hintTouch}
        </p>
        <div className="flex items-end justify-between">
          <div className="flex gap-3">
            <TouchButton game={game} control="left" label="◀" />
            <TouchButton game={game} control="right" label="▶" />
          </div>
          <div className="flex flex-col gap-3">
            <TouchButton game={game} control="forward" label="▲" />
            <TouchButton game={game} control="backward" label="▼" />
          </div>
        </div>
      </div>
    </div>
  );
}
