// Personal data shown on the portfolio. Fill the empty contact fields to show them;
// empty values are hidden automatically.
export const profile = {
  name: "Lê Văn Nhật",
  githubUsername: "Levannhat0904",
  contacts: {
    email: "",
    linkedin: "", // full URL, e.g. https://www.linkedin.com/in/your-handle
    facebook: "", // full URL
  },
} as const;

export type StackGroupKey =
  | "languages"
  | "frontend"
  | "mobile"
  | "backend"
  | "database"
  | "devops";

// `icon` is a Simple Icons slug (https://simpleicons.org); omit it when no logo exists.
// `mono` marks black brand logos that need a light variant in dark mode.
export type StackItem = { name: string; icon?: string; mono?: boolean };

export const techStack: { key: StackGroupKey; items: StackItem[] }[] = [
  {
    key: "languages",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Dart", icon: "dart" },
    ],
  },
  {
    key: "frontend",
    items: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextdotjs", mono: true },
      { name: "Vue", icon: "vuedotjs" },
      { name: "Vite", icon: "vite" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Ant Design", icon: "antdesign" },
      { name: "TanStack Query", icon: "reactquery" },
      { name: "Zustand" },
    ],
  },
  {
    key: "mobile",
    items: [
      { name: "React Native", icon: "react" },
      { name: "Expo", icon: "expo", mono: true },
      { name: "Zalo Mini App", icon: "zalo" },
    ],
  },
  {
    key: "backend",
    items: [
      { name: "NestJS", icon: "nestjs" },
      { name: "Node.js", icon: "nodedotjs" },
      { name: "TypeORM", icon: "typeorm" },
      { name: "Drizzle ORM", icon: "drizzle" },
      { name: "NATS", icon: "natsdotio" },
    ],
  },
  {
    key: "database",
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "SQLite", icon: "sqlite" },
      { name: "Supabase", icon: "supabase" },
      { name: "Firebase", icon: "firebase" },
    ],
  },
  {
    key: "devops",
    items: [
      { name: "Docker", icon: "docker" },
      { name: "Turborepo", icon: "turborepo" },
      { name: "Vitest", icon: "vitest" },
      { name: "Jest", icon: "jest" },
      { name: "Playwright" },
    ],
  },
];
