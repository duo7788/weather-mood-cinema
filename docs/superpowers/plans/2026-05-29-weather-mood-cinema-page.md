# Weather Mood Cinema Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Weather Mood Cinema landing page that can be opened locally and later deployed as the public project URL for a TMDB developer API application.

**Architecture:** Use plain HTML, CSS, and a small JavaScript file. The page will not call external APIs; it will show a polished static preview and include TMDB attribution.

**Tech Stack:** HTML, CSS, vanilla JavaScript, local browser verification.

---

## File Structure

- `index.html`: Accessible page structure, product copy, demo input, preview recommendation card, "How it works", and credits.
- `styles.css`: Responsive visual styling, layout, typography, card states, and mobile rules.
- `script.js`: Small demo behavior that updates the preview city label from the input without making network requests.

## Task 1: Static Page Markup

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create page markup**

Create `index.html` with this content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Weather Mood Cinema</title>
    <meta
      name="description"
      content="Weather Mood Cinema recommends a movie mood based on the weather in your city."
    >
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="page-shell">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">Weather-based movie discovery</p>
          <h1 id="page-title">Weather Mood Cinema</h1>
          <p class="lede">
            Enter a city, read the sky, and find the film that matches the day.
          </p>
          <form class="city-form" aria-label="Preview city form">
            <label for="city">City</label>
            <div class="input-row">
              <input id="city" name="city" type="text" value="Shanghai" autocomplete="address-level2">
              <button type="submit">Preview Mood</button>
            </div>
          </form>
        </div>

        <article class="recommendation" aria-label="Sample recommendation">
          <div class="poster" aria-hidden="true">
            <span>Rain</span>
          </div>
          <div class="recommendation-copy">
            <p class="city-line"><span id="preview-city">Shanghai</span> feels like</p>
            <h2>Rainy Window Drama</h2>
            <p>
              Low clouds, soft streets, and a slower evening call for a reflective drama with
              city lights and quiet momentum.
            </p>
            <dl class="mood-stats">
              <div>
                <dt>Weather</dt>
                <dd>Light rain</dd>
              </div>
              <div>
                <dt>Mood</dt>
                <dd>Melancholy</dd>
              </div>
              <div>
                <dt>Pick</dt>
                <dd>Drama</dd>
              </div>
            </dl>
          </div>
        </article>
      </section>

      <section class="workflow" aria-labelledby="workflow-title">
        <h2 id="workflow-title">How it works</h2>
        <div class="steps">
          <article>
            <span>01</span>
            <h3>Read the weather</h3>
            <p>The future version will fetch current city weather from a weather API.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Map the mood</h3>
            <p>Weather conditions become simple moods like sunlit, stormy, foggy, or cozy.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Find the film</h3>
            <p>TMDB movie metadata will help choose titles, posters, and short summaries.</p>
          </article>
        </div>
      </section>

      <section class="credits" aria-labelledby="credits-title">
        <h2 id="credits-title">Credits</h2>
        <p>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
          Movie data is planned to come from
          <a href="https://www.themoviedb.org" rel="noreferrer">The Movie Database</a>.
        </p>
      </section>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Open the file locally**

Run: `open index.html`

Expected: Browser opens the page. It will look unstyled until Task 2 is complete.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Weather Mood Cinema markup"
```

## Task 2: Responsive Styling

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Add styles**

Create `styles.css` with this content:

```css
:root {
  color-scheme: light;
  --ink: #111827;
  --muted: #5b6472;
  --paper: #f7f2e8;
  --panel: #fffaf0;
  --line: #d8cdbb;
  --teal: #1f7a76;
  --coral: #c8553d;
  --violet: #4b3f72;
  --shadow: 0 18px 50px rgba(33, 29, 23, 0.16);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(31, 122, 118, 0.16), transparent 32%),
    linear-gradient(315deg, rgba(200, 85, 61, 0.14), transparent 34%),
    var(--paper);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

a {
  color: var(--teal);
  font-weight: 700;
}

.page-shell {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 56px 0 32px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.03fr) minmax(320px, 0.97fr);
  gap: 32px;
  align-items: center;
  min-height: 68vh;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--coral);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 10ch;
  margin-bottom: 18px;
  font-size: clamp(3.2rem, 7vw, 6.8rem);
  line-height: 0.92;
  letter-spacing: 0;
}

.lede {
  max-width: 560px;
  color: var(--muted);
  font-size: 1.25rem;
  line-height: 1.6;
}

.city-form {
  width: min(100%, 560px);
  margin-top: 30px;
}

.city-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 800;
}

.input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

input,
button {
  min-height: 48px;
  border-radius: 8px;
  font: inherit;
}

input {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(255, 250, 240, 0.8);
  color: var(--ink);
  padding: 0 14px;
}

button {
  border: 0;
  background: var(--ink);
  color: white;
  cursor: pointer;
  font-weight: 800;
  padding: 0 18px;
}

button:hover {
  background: var(--teal);
}

.recommendation {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 22px;
  align-items: stretch;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: rgba(255, 250, 240, 0.86);
  box-shadow: var(--shadow);
  padding: 20px;
}

.poster {
  display: grid;
  place-items: end start;
  min-height: 260px;
  border-radius: 6px;
  background:
    linear-gradient(180deg, rgba(75, 63, 114, 0.1), rgba(75, 63, 114, 0.84)),
    linear-gradient(135deg, #86c6d3, #26324c);
  color: white;
  padding: 16px;
  font-size: 1.8rem;
  font-weight: 900;
}

.city-line {
  color: var(--muted);
  font-weight: 700;
}

.recommendation h2 {
  margin-bottom: 12px;
  color: var(--violet);
  font-size: 2rem;
  line-height: 1.05;
}

.recommendation-copy > p {
  line-height: 1.6;
}

.mood-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 22px 0 0;
}

.mood-stats div,
.steps article,
.credits {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: rgba(255, 250, 240, 0.74);
}

.mood-stats div {
  padding: 12px;
}

dt {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

dd {
  margin: 4px 0 0;
  font-weight: 800;
}

.workflow,
.credits {
  margin-top: 38px;
}

.workflow h2,
.credits h2 {
  font-size: 1.7rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.steps article {
  padding: 20px;
}

.steps span {
  color: var(--coral);
  font-size: 0.82rem;
  font-weight: 900;
}

.steps h3 {
  margin: 10px 0 8px;
}

.steps p,
.credits p {
  color: var(--muted);
  line-height: 1.6;
}

.credits {
  padding: 20px;
}

.credits p {
  margin-bottom: 0;
}

@media (max-width: 820px) {
  .page-shell {
    width: min(100% - 24px, 640px);
    padding-top: 32px;
  }

  .hero,
  .recommendation,
  .steps {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
  }

  h1 {
    max-width: 9ch;
    font-size: 4rem;
  }

  .poster {
    min-height: 190px;
  }
}

@media (max-width: 520px) {
  .input-row,
  .mood-stats {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 3.25rem;
  }

  .recommendation {
    padding: 14px;
  }
}
```

- [ ] **Step 2: Verify responsive layout**

Open `index.html` in a browser and check:

- 1440px wide: hero copy and recommendation card sit side by side.
- 390px wide: all content stacks, input and button fit, no text overlaps.
- Credits section includes the TMDB notice.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style: design Weather Mood Cinema page"
```

## Task 3: Demo Interaction

**Files:**
- Create: `script.js`

- [ ] **Step 1: Add demo script**

Create `script.js` with this content:

```js
const form = document.querySelector(".city-form");
const cityInput = document.querySelector("#city");
const previewCity = document.querySelector("#preview-city");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  previewCity.textContent = city || "Your city";
});
```

- [ ] **Step 2: Verify interaction**

Open `index.html`, type `Tokyo`, and click `Preview Mood`.

Expected: The recommendation line changes to `Tokyo feels like`.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add city preview interaction"
```

## Task 4: Final Verification

**Files:**
- Read: `index.html`
- Read: `styles.css`
- Read: `script.js`

- [ ] **Step 1: Check working tree**

Run: `git status --short`

Expected: no uncommitted changes.

- [ ] **Step 2: Browser verification**

Open `index.html` locally and verify:

- Page loads without console errors.
- Desktop layout is balanced.
- Mobile layout does not overlap.
- City preview interaction works.
- TMDB attribution is visible and links to `https://www.themoviedb.org`.

- [ ] **Step 3: Report local file path**

Tell the user the local page path and suggest the next deployment choice: GitHub Pages, Netlify, or Vercel.

