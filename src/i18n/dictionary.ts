import type { StackGroupKey } from "@/config/profile";

export type Locale = "en" | "vi";

export const locales: Locale[] = ["en", "vi"];

type Dictionary = {
  nav: { about: string; stack: string; contact: string };
  hero: { greeting: string; roles: string[]; tagline: string; cta: string; play: string };
  about: { title: string; paragraphs: string[] };
  stack: { title: string; subtitle: string; groups: Record<StackGroupKey, string> };
  stats: { title: string; subtitle: string };
  contact: { title: string; subtitle: string };
  footer: string;
  game: {
    back: string;
    hint: string;
    hintTouch: string;
    reset: string;
    noWebgl: string;
    zones: Record<"about" | "stack" | "contact", string>;
  };
};

export const dictionary: Record<Locale, Dictionary> = {
  en: {
    nav: { about: "About", stack: "Tech stack", contact: "Contact" },
    hero: {
      greeting: "Hi, I'm",
      roles: ["Software Engineer", "Web • Mobile • Backend", "TypeScript & Go enthusiast"],
      tagline:
        "I build web, mobile and backend products end to end, mostly with TypeScript and Go.",
      cta: "Get in touch",
      play: "Play the 3D game",
    },
    about: {
      title: "About me",
      paragraphs: [
        "I'm a software engineer who enjoys turning ideas into products that people actually use. My day-to-day work spans React and Next.js frontends, React Native and Flutter mobile apps, and NestJS or Go services backed by PostgreSQL.",
        "I care about clean, typed code, fast feedback loops with automated tests, and shipping small, reliable increments.",
      ],
    },
    stack: {
      title: "Tech stack",
      subtitle: "Tools and technologies I work with regularly.",
      groups: {
        languages: "Languages",
        frontend: "Frontend",
        mobile: "Mobile",
        backend: "Backend",
        database: "Database & BaaS",
        devops: "DevOps & Testing",
      },
    },
    stats: { title: "GitHub activity", subtitle: "Live stats from my GitHub profile." },
    contact: {
      title: "Contact",
      subtitle: "Open to new opportunities and collaborations.",
    },
    footer: "Built with Next.js & Tailwind CSS.",
    game: {
      back: "Classic portfolio",
      hint: "WASD / arrow keys to drive · Space to brake · R to reset. Drive into the glowing rings!",
      hintTouch: "Use the buttons to drive. Drive into the glowing rings!",
      reset: "Reset",
      noWebgl: "Your browser does not support WebGL, so the game cannot run.",
      zones: { about: "About me", stack: "Tech stack", contact: "Contact" },
    },
  },
  vi: {
    nav: { about: "Giới thiệu", stack: "Công nghệ", contact: "Liên hệ" },
    hero: {
      greeting: "Xin chào, tôi là",
      roles: ["Kỹ sư phần mềm", "Web • Mobile • Backend", "Yêu thích TypeScript & Go"],
      tagline:
        "Tôi xây dựng sản phẩm web, mobile và backend trọn vẹn, chủ yếu với TypeScript và Go.",
      cta: "Liên hệ với tôi",
      play: "Chơi game 3D",
    },
    about: {
      title: "Về tôi",
      paragraphs: [
        "Tôi là kỹ sư phần mềm, thích biến ý tưởng thành sản phẩm mà người dùng thực sự sử dụng. Công việc hằng ngày của tôi gồm frontend React/Next.js, ứng dụng mobile React Native và Flutter, cùng các dịch vụ NestJS hoặc Go chạy trên PostgreSQL.",
        "Tôi chú trọng code rõ ràng, có kiểu dữ liệu chặt chẽ, kiểm thử tự động để phản hồi nhanh, và phát hành từng phần nhỏ nhưng ổn định.",
      ],
    },
    stack: {
      title: "Công nghệ",
      subtitle: "Những công cụ và công nghệ tôi sử dụng thường xuyên.",
      groups: {
        languages: "Ngôn ngữ",
        frontend: "Frontend",
        mobile: "Mobile",
        backend: "Backend",
        database: "Cơ sở dữ liệu & BaaS",
        devops: "DevOps & Kiểm thử",
      },
    },
    stats: { title: "Hoạt động GitHub", subtitle: "Thống kê trực tiếp từ GitHub của tôi." },
    contact: {
      title: "Liên hệ",
      subtitle: "Sẵn sàng cho các cơ hội và hợp tác mới.",
    },
    footer: "Xây dựng với Next.js & Tailwind CSS.",
    game: {
      back: "Bản portfolio thường",
      hint: "WASD / phím mũi tên để lái · Space để phanh · R để đặt lại. Hãy lái vào các vòng sáng!",
      hintTouch: "Dùng các nút để lái. Hãy lái vào các vòng sáng!",
      reset: "Đặt lại",
      noWebgl: "Trình duyệt của bạn không hỗ trợ WebGL nên không thể chạy game.",
      zones: { about: "Giới thiệu", stack: "Công nghệ", contact: "Liên hệ" },
    },
  },
};
