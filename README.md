# GNOPS

GNOPS is a project designed to be a Community-run hub for the Gno DevOps family.

## Contributing

To contribute to the project's content, please focus on the following directories:

- **`content/`**: Contains the main content of the site.
- **`english/`**: English language content files, classified per article kind (showcase, guides, effective-gno).
- **`i18n/`**: Internationalization files for supporting multiple languages.

When adding or modifying content, ensure that your contributions align with the project's/front-matter structure and standards.

## Installation

1. Clone the repository:

```bash
   git clone https://github.com/gnoverse/gnops.git
   cd gnops
```

2. Install dependencies:

```bash
   pnpm install
```

## Scripts

### Development

- **Start Development**: Watch for changes and run Hugo, Vite, and search indexing.  
  `pnpm dev`

- **Hugo Development Only**: Run Hugo in development mode with live reload.  
  `pnpm dev:hugo`

- **Vite Development Only**: Start the Vite development server.  
  `pnpm dev:vite`

- **Rebuild Search Index**: Rebuild the search index for the `dist` directory.  
  `pnpm dev:search`

### Preview (for deploy previews)

- **Preview Build**: Build and serve the site for preview.
  `pnpm preview`

- **Hugo Preview Only**: Build the Hugo site in preview mode.

### Build (for hosting)

- **Full Build**: Build the site with Hugo, search indexing, and Vite.  
  `pnpm build`

## Website Dependencies

- **hugo**: SSG website builder made in go
- **barba**: Page transitions.
- **gsap**: Animations.
- **tailwindcss**: Atomic CSS system - Tailwind.
- **typescript**: Type-safe JavaScript.
- **vite**: Development and build tool.

## Folder Structure

- **`content/`**: Contains site content files.
- **`i18n/`**: Contains translations for internationalization.
- **`assets/images/`**: Media files used on the site.
- **`dist/`**: Output for built files (used by Hugo and Vite).
- **`build/`**: Final build directory for production.

## License

TODO

## Author

Gnoverse Community.
Feel free to contribute and enhance GNOPS for your projects! 🚀
