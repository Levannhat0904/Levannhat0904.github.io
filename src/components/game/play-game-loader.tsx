"use client";

import dynamic from "next/dynamic";

// three.js needs the browser (WebGL, window), so the game is only loaded client-side.
export const PlayGameLoader = dynamic(() => import("./play-game").then((m) => m.PlayGame), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 grid place-items-center bg-[#9fd6f0] font-mono text-sm text-black/70">
      Loading…
    </div>
  ),
});
