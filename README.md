# OnlineKhabar Political News Scraper

A web scraper built with **Crawlee** and **TypeScript** that extracts political news articles from [OnlineKhabar English](https://english.onlinekhabar.com/category/political) — one of Nepal's leading online news portals. It traverses paginated listing pages, follows article links, and saves structured data (headline, date, image, full content) to a local JSON dataset.

---

## Table of Contents

- [About the Project](#about-the-project)
- [About Crawlee](#about-crawlee)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Sample Output](#sample-output)
- [Docker Support](#docker-support)
- [Conclusion](#conclusion)

---

## About the Project

This project demonstrates a real-world, production-grade news scraper targeting the political section of OnlineKhabar. It:

- Crawls up to **10 paginated listing pages** of political news
- Visits each **individual article page** and extracts structured data
- Persists all scraped records as **JSON files** in Crawlee's local dataset storage
- Handles pagination automatically by following `next page` links

The scraper uses a two-label request routing pattern (`LIST` → `DETAIL`) which is the standard Crawlee approach for multi-level crawling.

---

## About Crawlee

[Crawlee](https://crawlee.dev) is an open-source Node.js web scraping and browser automation framework maintained by [Apify](https://apify.com). It provides:

- **Multiple crawler types** — `CheerioCrawler` (fast, HTML-only), `PlaywrightCrawler` / `PuppeteerCrawler` (full browser), and `HttpCrawler`
- **Built-in request queue** with automatic deduplication and retry logic
- **Dataset storage** for structured output and key-value stores for arbitrary files
- **Auto-scaling** concurrency management to stay polite and efficient
- **Proxy rotation** and session management for large-scale crawls
- **Apify platform integration** — deploy as an Actor with one command

This project uses `CheerioCrawler`, which fetches raw HTML and parses it with [Cheerio](https://cheerio.js.org/) (a server-side jQuery implementation) — making it extremely fast for sites that don't require JavaScript rendering.

---

## How It Works

```
Start URL (LIST page)
       │
       ▼
  Parse all article links on the page
       │
       ├──► Enqueue each article URL with label: "DETAIL"
       │
       └──► Follow "next page" link with label: "LIST" (up to 10 pages)
                         │
                         ▼
              Scrape each DETAIL page:
              - Headline (h1)
              - Date (span.ok-post-date)
              - Image URL (figure img)
              - Full article content (p.wp-block-paragraph)
                         │
                         ▼
              Save to Dataset (storage/datasets/default/)
```

The crawler entry point is [src/main.ts](src/main.ts). All output lands in `storage/datasets/default/` as numbered JSON files.

---

## Tech Stack

| Layer              | Technology                                                           |
| ------------------ | -------------------------------------------------------------------- |
| Scraping Framework | [Crawlee v3](https://crawlee.dev) — `CheerioCrawler`                 |
| Language           | TypeScript ~6.0 (ESM modules)                                        |
| HTML Parsing       | Cheerio (bundled with Crawlee)                                       |
| Runtime            | Node.js 24                                                           |
| Dev Execution      | [tsx](https://github.com/privatenumber/tsx) (no compile step needed) |
| Containerisation   | Docker — Apify `actor-node-playwright-chrome` base image             |

---

## Prerequisites

Make sure you have the following installed before cloning:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **Git** — [Download](https://git-scm.com)

Verify your versions:

```bash
node --version   # v18+
npm --version    # v9+
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <https://github.com/SharadHub/crawlee-project.git>
cd crawlee/my-crawler
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the scraper

```bash
npm start
```

This runs `tsx src/main.ts` directly — no build step required during development.

The crawler will:

1. Start at `https://english.onlinekhabar.com/category/political`
2. Queue articles from each listing page
3. Scrape and save every article it visits
4. Stop after 10 pages or when no more `next` links are found

### 4. View the output

Scraped data is saved to:

```
storage/
└── datasets/
    └── default/
        ├── 000000001.json
        ├── 000000002.json
        └── ...
```

Each file contains one scraped article as a JSON object.

### Build for production

```bash
npm run build          # Compiles TypeScript → dist/
npm run start:prod     # Runs compiled dist/main.js
```

---

## Sample Output

Each scraped article produces a JSON record like this:

```json
{
  "Headline": "Nepal observes Republic Day; PM Balen to skip address",
  "Date": "Friday, May 29, 2026",
  "Image": "https://english.onlinekhabar.com/wp-content/uploads/2026/05/ganatantra-diwas-1024x683-1.jpg",
  "News Content": "Kathmandu, May 29 Republic Day is being celebrated across the country today with various programmes. The government has declared a public holiday on the occasion. The day marks the historic session of the first elected Constituent Assembly held on May 28, 2008, which formally ended the autocratic monarchy and proclaimed Nepal a Federal Democratic Republic...",
  "url": "https://english.onlinekhabar.com/nepal-observes-republic-day.html"
}
```

---

## Docker Support

A multi-stage [Dockerfile](Dockerfile) is included for containerised deployment on the [Apify platform](https://apify.com) or any Docker host.

```bash
# Build the image
docker build -t onlinekhabar-scraper .

# Run the container
docker run onlinekhabar-scraper
```

The Dockerfile uses the `apify/actor-node-playwright-chrome` base image, which includes a pre-configured Chromium browser for headful crawling if ever needed.

---

## Conclusion

This project is a clean, minimal example of how to build a multi-page news scraper using Crawlee's `CheerioCrawler`. The two-stage `LIST → DETAIL` routing pattern demonstrated here scales naturally to any paginated website with article listings. Because `CheerioCrawler` avoids spinning up a real browser, scraping is fast and resource-efficient — ideal for sites that serve content as plain HTML without heavy JavaScript rendering.

The scraper can be extended to:

- Export data to a database or cloud storage
- Add proxy rotation for large-scale runs
- Deploy as an Apify Actor for scheduled, cloud-based execution
- Expand coverage to other OnlineKhabar categories

---

_Built by [Sharad Bista](https://github.com/sharad-bista) using [Crawlee](https://crawlee.dev)._
