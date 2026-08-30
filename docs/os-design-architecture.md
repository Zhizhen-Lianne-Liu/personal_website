# OS design architecture

## Direction

This branch keeps the existing palette and shape language, then changes the interface metaphor from an editorial website to an original desktop environment.

The reference qualities are structural rather than branded:

- a full-page desktop canvas;
- a slim menu/status bar;
- desktop shortcuts that open content;
- overlapping windows with title bars and visible controls;
- a dock or launcher for primary sections;
- obvious depth through dark outlines, offset shadows, and layering;
- playful, tactile transitions without blocking access to content.

The current colours remain the basis of the new system: warm paper, near-black ink, coral, yellow, blue, and green. Rounded and circular shapes, heavy outlines, and offset shadows also remain. We will not use PostHog's mascot, brand assets, illustrations, product names, copy, icon set, or exact layouts.

## Interaction model

The OS interface is progressive enhancement, not a single-page application.

- Every section remains a real Astro route with a stable URL.
- The homepage enhances into a desktop shell through one React island.
- Opening a desktop item creates a window containing a concise preview and a link to the full route.
- Windows can be focused, moved, resized, minimized, maximized, and closed on large screens.
- Window positions may be remembered with `localStorage`; content never depends on stored state.
- Keyboard users can launch and close windows using ordinary buttons and menus.
- Below the desktop breakpoint, drag and resize are disabled. The launcher and content become a clear stacked mobile interface.
- With JavaScript disabled, the user sees normal links to all pages.
- With reduced motion enabled, opening and minimizing use immediate state changes rather than animated movement.

## Libraries

### Existing foundation

| Library            | Role                                                                 | Decision                                                        |
| ------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| `astro`            | Static routing, layouts, build output, and selective hydration       | Keep as the foundation. SRCF receives plain files from `dist/`. |
| `typescript`       | Window definitions, app registry, reducer actions, and content types | Keep strict mode.                                               |
| `@astrojs/mdx`     | Long-form writing with optional components                           | Keep; articles remain content-first.                            |
| `@astrojs/rss`     | Writing feed                                                         | Keep.                                                           |
| `@astrojs/sitemap` | Search-engine sitemap                                                | Keep.                                                           |

### OS interaction layer

| Library                         | Role                                                       | Why it is included                                                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@astrojs/react`                | Hydrates the desktop as one isolated interactive component | The OS shell has coordinated state that is clearer as a React island while the rest of the site stays static.                                                        |
| `react` and `react-dom`         | Window manager and desktop component model                 | Use one island, not React across every page. `useReducer` handles window state without another store.                                                                |
| `react-rnd`                     | Pointer-based window dragging and resizing                 | Handles bounds, movement, resizing, and touch edge cases more reliably than bespoke pointer code. It is enabled only at desktop sizes.                               |
| `@radix-ui/react-dropdown-menu` | Accessible top-bar and contextual menus                    | Supplies keyboard navigation, focus handling, and collision-aware menu positioning. Styling remains entirely custom.                                                 |
| `lucide-react`                  | Neutral interface symbols                                  | Provides consistent, accessible SVG icons for controls such as close, minimize, folder, and external link. Icons are selected and styled into the site's own system. |

### Verification and authoring

| Library                                | Role                                             | Decision                                                                    |
| -------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| `@astrojs/check`                       | Astro and TypeScript diagnostics                 | Keep.                                                                       |
| `prettier` and `prettier-plugin-astro` | Formatting                                       | Keep.                                                                       |
| `linkinator`                           | Built-site internal-link validation              | Keep.                                                                       |
| `@playwright/test`                     | Desktop and mobile interaction tests             | Test window launch, focus, close, keyboard access, and responsive fallback. |
| `@axe-core/playwright`                 | Automated accessibility checks in rendered pages | Add axe checks to both desktop and mobile test states.                      |

## Deliberate non-dependencies

- **No Tailwind or component theme:** custom CSS already expresses the colour, outline, shadow, and shape system directly.
- **No global state library:** a local reducer is sufficient for a single desktop island. Zustand or Redux would add indirection without solving a current problem.
- **No animation library:** CSS transitions and the Web Animations API cover window open, focus, minimize, and dock feedback. This also keeps reduced-motion behaviour straightforward.
- **No general drag-and-drop toolkit:** file sorting and arbitrary drop zones are outside the first release. `react-rnd` covers the actual window interaction.
- **No canvas/WebGL renderer:** semantic HTML windows are sharper, more responsive, accessible, and easier to index.
- **No OS UI kit:** window chrome, dock, shortcuts, and menus will be original components so the result does not inherit another product's identity.

## Proposed component boundary

```text
BaseLayout.astro
└── DesktopShell.tsx                 one client:load island on the home page
    ├── MenuBar.tsx                  Radix menus, status, clock
    ├── DesktopShortcut.tsx          semantic link/button launcher
    ├── WindowLayer.tsx              focus and z-index ordering
    │   └── AppWindow.tsx            react-rnd on desktop, static panel on mobile
    ├── Dock.tsx                     primary apps and minimized windows
    └── apps/
        ├── WelcomeApp.tsx
        ├── WorkApp.tsx
        ├── WritingApp.tsx
        ├── AboutApp.tsx
        └── ContactApp.tsx
```

The app registry will be typed data containing IDs, labels, icons, colours, default sizes, default positions, and canonical routes. Window state will contain only UI state: open/minimized/maximized, position, size, and z-order.

## Performance boundaries

- Only the desktop shell ships React and window-management JavaScript.
- Writing and individual project pages remain zero-JavaScript Astro pages unless a specific component requires otherwise.
- No remote fonts, trackers, or runtime API calls in the first release.
- Icons are tree-shaken SVG components; there is no icon font or full sprite download.
- The desktop should remain usable before hydration and should not move substantially when hydration completes.

## First implementation sequence

1. Build the static desktop canvas, menu bar, shortcuts, windows, and dock using the existing tokens.
2. Add a typed app registry and reducer-driven open/focus/minimize/close behaviour.
3. Add bounded drag and resize on large screens through `react-rnd`.
4. Add Radix menus and keyboard behaviour.
5. Implement the non-draggable mobile launcher and stacked panels.
6. Add Playwright interaction coverage and axe checks before visual polish.
