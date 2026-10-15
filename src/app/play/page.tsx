import type { Metadata } from "next";
import { PlayGameLoader } from "@/components/game/play-game-loader";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "Play · Lê Văn Nhật",
  description: "Drive around a little 3D island to get to know Lê Văn Nhật.",
};

export default function PlayPage() {
  return (
    <LanguageProvider>
      <PlayGameLoader />
    </LanguageProvider>
  );
}
