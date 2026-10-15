import { LanguageProvider } from "@/components/language-provider";
import { Portfolio } from "@/components/portfolio";

export default function Home() {
  return (
    <LanguageProvider>
      <Portfolio />
    </LanguageProvider>
  );
}
