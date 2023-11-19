## Naming Conventions

- Use lowercase for file names, with words separated by -.

## Structure

- `lib`: Core for server-side/client-side. Some ssr and ssg code should be split into different files. Code splitting is not always right.
- `pages`: Client pages.
- `components`: Components for client pages.
- `styles`: Common themes, styles, and animations.
  - Value level (`theme.ts`).
  - CSS snippet level (`styles.ts`).
  - Component level (simple decoration for HTML elements).
- `source`: Static user data
- `utils`: Type utils and tools used in build
- `site.config.ts`: Site config
