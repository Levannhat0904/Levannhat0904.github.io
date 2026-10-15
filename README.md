# levannhat0904.github.io

Personal portfolio of Lê Văn Nhật, built with Next.js (static export) and Tailwind CSS, in English and Vietnamese.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

## Edit content

- Contacts (email, LinkedIn, Facebook) and tech stack: `src/config/profile.ts`. Empty contacts are hidden.
- EN/VI text: `src/i18n/dictionary.ts`

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.
In the repo settings, set **Pages → Source** to **GitHub Actions** once.
