# Cinema Landing Implementation Plan

**Goal:** Deliver the user-selected introduction homepage with an automatic cinema demonstration.
**Architecture:** A hash-based entry component loads the existing application on #app, otherwise the landing page. A separate pure timeline selects demo states. Landing CSS is scoped and demo data is isolated from application APIs and storage.
**Tech Stack:** React, TypeScript, CSS, existing Lucide icons and Vite.

- [x] Test timeline stage boundaries, wrapping, and negative elapsed input.
- [x] Implement timeline and responsive landing page, local SVG city illustration and typographic film card, with automatic playback, pause, replay, and step controls. Honor reduced motion and page visibility.
- [x] Add hash entry navigation with lazy loading of the existing app and a return link.
- [x] Run tests, type checking, production build, and inspect desktop/mobile render and navigation where browser tooling is available.

Validation: 41 tests passed; TypeScript and production build passed. Headless browser verified desktop and 390px mobile screenshots, demo step controls, app entry and return, and no mobile horizontal overflow. Existing film grain URL build warning remains.
