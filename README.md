# Lianne Liu — personal site

A lightweight personal website built with Astro, TypeScript, custom CSS, and Markdown. It is designed to build to static files for deployment on [SRCF](https://docs.srcf.net/reference/web-hosting/regular-hosting/).

The `feat/srcf-site-os` branch explores a desktop-style interface. Its interaction model, component boundary, dependencies, and deliberate non-dependencies are defined in [docs/os-design-architecture.md](docs/os-design-architecture.md).

## Local development

Requirements: Node.js 22 or newer and npm 10 or newer.

```sh
npm install
npm run dev
```

The local server is available at `http://localhost:4321`.

## Quality checks

```sh
npm run format:check
npm run check
npm run build
npm run check:links
npm run test:a11y
```

`npm run validate` runs formatting, the Astro type check, a production build, and the internal-link check. The accessibility test requires Playwright's Chromium browser; install it once with `npx playwright install chromium`.

## Content

Writing lives in `src/content/writing/`. Each Markdown or MDX file needs the frontmatter defined in `src/content.config.ts`. Draft entries are excluded from the production site and RSS feed.

Project summaries currently live in `src/data/projects.ts`. This keeps the initial portfolio intentionally small while allowing projects to become full content collections later.

## Deployment

The site builds to `dist/`; no Node.js process is needed in production. See [docs/deployment.md](docs/deployment.md) for the SRCF preview, release, and rollback workflow.

## Migration policy

Legacy content is reviewed before migration rather than copied automatically. See [docs/content-migration.md](docs/content-migration.md) for the current keep/rewrite/omit decisions.

## License

The source code is available under the [MIT License](LICENSE). Site writing and personal content remain copyright Lianne Liu unless stated otherwise.
